'use server'

import { connectToDB } from '../mongoose';

/**
 * Complete Business Flow Integration
 * Purchase → Transport → Warehouse → Sales
 */

export async function getBusinessFlowSummary() {
  try {
    await connectToDB();
    
    const Purchase = (await import('@/lib/models/purchase.models')).default;
    const Shipment = (await import('@/lib/models/shipment.models')).default;
    const Product = (await import('@/lib/models/product.models')).default;
    const Sale = (await import('@/lib/models/sales.models')).default;
    const ProductBatch = (await import('@/lib/models/product_batch.models')).default;
    
    const [purchases, shipments, products, sales, batches] = await Promise.all([
      Purchase.find().sort({ createdAt: -1 }).limit(10),
      Shipment.find().populate('purchaseOrder').sort({ createdAt: -1 }).limit(10),
      Product.find({ isActive: true }).limit(20),
      Sale.find().sort({ saleDate: -1 }).limit(10),
      ProductBatch.find({ isDepleted: false }).populate('product', 'name').limit(20)
    ]);
    
    // Calculate flow metrics
    const totalPurchaseValue = purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);
    const totalSalesValue = sales.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);
    const totalInventoryValue = batches.reduce((sum, b) => sum + (b.remaining * b.costPerUnit), 0);
    
    const inTransitShipments = shipments.filter(s => s.status === 'in-transit').length;
    const pendingReceival = shipments.filter(s => s.status === 'delivered').length;
    const lowStockProducts = products.filter(p => p.stock < 10).length;
    
    return {
      summary: {
        totalPurchaseValue,
        totalSalesValue,
        totalInventoryValue,
        profitMargin: totalSalesValue > 0 ? ((totalSalesValue - totalPurchaseValue) / totalSalesValue * 100) : 0
      },
      alerts: {
        inTransitShipments,
        pendingReceival,
        lowStockProducts
      },
      recentActivity: {
        purchases: purchases.slice(0, 5),
        shipments: shipments.slice(0, 5),
        sales: sales.slice(0, 5)
      },
      inventory: {
        totalProducts: products.length,
        totalBatches: batches.length,
        availableStock: batches.reduce((sum, b) => sum + b.remaining, 0)
      }
    };
  } catch (error) {
    throw new Error('Failed to fetch business flow summary');
  }
}

export async function createCompleteOrder(orderData: {
  supplierId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitCost: number;
  }>;
  warehouseId: string;
  vehicleId: string;
  driver: string;
  estimatedDelivery: Date;
}) {
  try {
    await connectToDB();
    
    // 1. Create Purchase Order
    const { createPurchaseOrder } = await import('./purchase-dashboard.actions');
    const purchase = await createPurchaseOrder({
      supplierId: orderData.supplierId,
      items: orderData.items,
      orderType: 'transport',
      transportDetails: {
        carrier: 'Internal Fleet',
        estimatedDelivery: orderData.estimatedDelivery,
        shippingCost: 100,
        warehouseId: orderData.warehouseId,
        vehicleId: orderData.vehicleId,
        driver: orderData.driver
      }
    });
    
    return {
      success: true,
      purchaseOrderId: purchase._id,
      message: 'Complete order created with automatic shipment scheduling'
    };
  } catch (error) {
    throw new Error('Failed to create complete order');
  }
}

export async function processWarehouseReceival(shipmentId: string, receivedItems: Array<{
  productId: string;
  receivedQuantity: number;
  actualCost?: number;
}>) {
  try {
    await connectToDB();
    
    // 1. Receive shipment (updates inventory)
    const { receiveShipment } = await import('./transport.actions');
    const shipment = await receiveShipment(shipmentId, receivedItems);
    
    // 2. Create product batches for inventory tracking
    const ProductBatch = (await import('@/lib/models/product_batch.models')).default;
    
    for (const item of receivedItems) {
      await ProductBatch.create({
        product: item.productId,
        quantity: item.receivedQuantity,
        remaining: item.receivedQuantity,
        costPerUnit: item.actualCost || 0,
        sellingPrice: (item.actualCost || 0) * 1.3, // 30% markup
        batchNumber: `BATCH-${Date.now()}-${item.productId.slice(-4)}`,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isDepleted: false
      });
    }
    
    return {
      success: true,
      message: 'Shipment received and inventory updated',
      shipmentId: shipment._id
    };
  } catch (error) {
    throw new Error('Failed to process warehouse receival');
  }
}

export async function getInventoryStatus() {
  try {
    await connectToDB();
    
    const Product = (await import('@/lib/models/product.models')).default;
    const ProductBatch = (await import('@/lib/models/product_batch.models')).default;
    
    const products = await Product.find({ isActive: true }).populate('categoryId', 'name');
    
    const inventoryStatus = await Promise.all(
      products.map(async (product) => {
        const batches = await ProductBatch.find({
          product: product._id,
          isDepleted: false,
          remaining: { $gt: 0 }
        });
        
        const totalStock = batches.reduce((sum, batch) => sum + batch.remaining, 0);
        const avgCost = batches.length > 0 
          ? batches.reduce((sum, batch) => sum + batch.costPerUnit, 0) / batches.length
          : 0;
        const avgSellingPrice = batches.length > 0
          ? batches.reduce((sum, batch) => sum + batch.sellingPrice, 0) / batches.length
          : 0;
        
        return {
          productId: product._id,
          name: product.name,
          category: product.categoryId?.name || 'Uncategorized',
          totalStock,
          avgCost,
          avgSellingPrice,
          inventoryValue: totalStock * avgCost,
          status: totalStock < 10 ? 'low' : totalStock < 50 ? 'medium' : 'good',
          batchCount: batches.length
        };
      })
    );
    
    return inventoryStatus.sort((a, b) => b.inventoryValue - a.inventoryValue);
  } catch (error) {
    throw new Error('Failed to fetch inventory status');
  }
}

export async function getSalesPerformance() {
  try {
    await connectToDB();
    
    const Sale = (await import('@/lib/models/sales.models')).default;
    const Product = (await import('@/lib/models/product.models')).default;
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const sales = await Sale.find({
      saleDate: { $gte: thirtyDaysAgo }
    }).populate('items.product', 'name');
    
    // Calculate product performance
    const productSales = new Map();
    
    sales.forEach(sale => {
      sale.items.forEach((item: any) => {
        const productId = item.product._id.toString();
        const existing = productSales.get(productId) || {
          name: item.product.name,
          totalQuantity: 0,
          totalRevenue: 0,
          salesCount: 0
        };
        
        existing.totalQuantity += item.quantity;
        existing.totalRevenue += item.quantity * item.unitPrice;
        existing.salesCount += 1;
        
        productSales.set(productId, existing);
      });
    });
    
    const topProducts = Array.from(productSales.entries())
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
    
    return {
      totalSales: sales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0),
      totalTransactions: sales.length,
      topProducts,
      salesTrend: sales.length > 0 ? 'positive' : 'neutral'
    };
  } catch (error) {
    throw new Error('Failed to fetch sales performance');
  }
}