'use server'

import Purchase from '@/lib/models/purchase.models';
import Product from '@/lib/models/product.models';
import Supplier from '@/lib/models/supplier.models';
import ProductBatch from '@/lib/models/product_batch.models';
import Unit from '@/lib/models/unit.models';
import { connectToDB } from '../mongoose';
import { requirePermission } from '../middleware/auth';
import { createShipment } from './transport.actions';

export async function createPurchaseOrder(orderData: {
  supplierId: string;
  items: Array<{
    productId: string;
    unit: string;
    quantity: number;
    baseQuantity: number;
    unitPrice: number;
    baseUnitPrice: number;
  }>;
  orderType: 'wholesale' | 'transport' | 'regular';
  transportDetails?: {
    carrier: string;
    trackingNumber?: string;
    estimatedDelivery?: Date;
    shippingCost: number;
    warehouseId?: string;
    vehicleId?: string;
    driver?: string;
  };
  wholesaleDetails?: {
    bulkDiscount: number;
    minimumQuantity: number;
    contractNumber?: string;
  };
  notes?: string;
}) {
  try {
    
    // await requirePermission('addPurchase');
    
    await connectToDB();
    
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const shippingCost = orderData.transportDetails?.shippingCost || 0;
    const discount = orderData.wholesaleDetails?.bulkDiscount || 0;
    const total = subtotal + shippingCost - discount;
    
    const purchase = await Purchase.create({
      supplier: orderData.supplierId,
      items: orderData.items.map(item => ({
        product: item.productId,
        unit: item.unit,
        quantity: item.quantity,
        baseQuantity: item.baseQuantity,
        unitPrice: item.unitPrice,
        baseUnitPrice: item.baseUnitPrice,
        totalCost: item.quantity * item.unitPrice
      })),
      orderType: orderData.orderType,
      transportDetails: orderData.transportDetails,
      wholesaleDetails: orderData.wholesaleDetails,
      subtotal,
      shippingCost,
      discount,
      totalCost: total,
      notes: orderData.notes,
      status: 'pending',
      orderDate: new Date()
    });

    // Create shipment if transport details provided
    if (orderData.orderType === 'transport') {
      console.log('Creating transport order with details:', orderData.transportDetails);
      
      if (orderData.transportDetails?.warehouseId && 
          orderData.transportDetails?.vehicleId && 
          orderData.transportDetails?.driver) {
        try {
          const supplier = await Supplier.findById(orderData.supplierId);
          
          console.log('Creating shipment for purchase order:', purchase._id);
          
          const shipment = await createShipment({
            purchaseOrderId: purchase._id.toString(),
            supplier: supplier?.name || 'Unknown Supplier',
            destinationWarehouseId: orderData.transportDetails.warehouseId,
            estimatedDelivery: orderData.transportDetails.estimatedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            items: orderData.items.map(item => ({
              productId: item.productId,
              quantity: item.baseQuantity, // Use base quantity for shipment
              unitPrice: item.baseUnitPrice // Use base unit price for shipment
            })),
            driver: orderData.transportDetails.driver,
            vehicleId: orderData.transportDetails.vehicleId
          });
          
          console.log('Shipment created successfully:', shipment.trackingNumber);
        } catch (error) {
          console.error('Failed to create shipment:', error);
          throw error; // Re-throw to see the actual error
        }
      } else {
        console.log('Missing transport details for shipment creation:', {
          warehouseId: orderData.transportDetails?.warehouseId,
          vehicleId: orderData.transportDetails?.vehicleId,
          driver: orderData.transportDetails?.driver
        });
      }
    }

    return JSON.parse(JSON.stringify(purchase));
  } catch (error) {
    console.log('Error creating purchase order:', error);
    throw new Error('Failed to create purchase order');
  }
}

export async function getAllPurchases(filters?: {
  startDate?: Date;
  endDate?: Date;
  supplierId?: string;
  status?: string;
  orderType?: string;
}) {
  try {
    await connectToDB();
    
    let query: any = {};
    
    if (filters?.startDate && filters?.endDate) {
      query.orderDate = { $gte: filters.startDate, $lte: filters.endDate };
    }
    
    if (filters?.supplierId) {
      query.supplier = filters.supplierId;
    }
    
    if (filters?.status) {
      query.status = filters.status;
    }
    
    if (filters?.orderType) {
      query.orderType = filters.orderType;
    }
    
    const purchases = await Purchase.find(query)
      .populate('items.product', 'name sku')
      .populate('items.unit', 'name shortName conversionFactor unitType')
      .populate('supplier', 'name email phone')
      .sort({ orderDate: -1 })
      .limit(100);
    
    return JSON.parse(JSON.stringify(purchases));
  } catch (error) {
    throw new Error('Failed to fetch purchases');
  }
}

export async function getPurchaseById(purchaseId: string) {
  try {
    await connectToDB();
    
    const purchase = await Purchase.findById(purchaseId)
      .populate('items.product', 'name sku price')
      .populate('items.unit', 'name shortName conversionFactor unitType')
      .populate('supplier', 'name email phone address');
    
    if (!purchase) {
      throw new Error('Purchase not found');
    }
    
    return JSON.parse(JSON.stringify(purchase));
  } catch (error) {
    throw new Error('Failed to fetch purchase details');
  }
}

export async function updatePurchaseOrder(purchaseId: string, updateData: {
  status?: string;
  items?: Array<{
    productId: string;
    unit: string;
    quantity: number;
    baseQuantity: number;
    unitPrice: number;
    baseUnitPrice: number;
  }>;
  transportDetails?: {
    carrier: string;
    trackingNumber?: string;
    estimatedDelivery?: Date;
    shippingCost: number;
  };
  notes?: string;
}) {
  try {
    await connectToDB();
    
    const updateFields: any = {};
    
    if (updateData.status) {
      updateFields.status = updateData.status;
      if (updateData.status === 'received') {
        updateFields.receivedDate = new Date();
      }
      
      // Update related shipment status
      try {
        const Shipment = (await import('@/lib/models/shipment.models')).default;
        let shipmentStatus = 'pending';
        
        if (updateData.status === 'ordered') {
          shipmentStatus = 'loaded';
        } else if (updateData.status === 'shipped') {
          shipmentStatus = 'in-transit';
        } else if (updateData.status === 'received') {
          shipmentStatus = 'received';
        }
        
        await Shipment.findOneAndUpdate(
          { purchaseOrder: purchaseId },
          { status: shipmentStatus }
        );
      } catch (error) {
        console.log('No shipment found for purchase order or error updating:', error);
      }
    }
    
    if (updateData.items) {
      updateFields.items = updateData.items.map(item => ({
        product: item.productId,
        unit: item.unit,
        quantity: item.quantity,
        baseQuantity: item.baseQuantity,
        unitPrice: item.unitPrice,
        baseUnitPrice: item.baseUnitPrice,
        totalCost: item.quantity * item.unitPrice
      }));
      
      const subtotal = updateData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      updateFields.subtotal = subtotal;
    }
    
    if (updateData.transportDetails) {
      updateFields.transportDetails = updateData.transportDetails;
      updateFields.shippingCost = updateData.transportDetails.shippingCost;
    }
    
    if (updateData.notes) {
      updateFields.notes = updateData.notes;
    }
    
    const purchase = await Purchase.findByIdAndUpdate(purchaseId, updateFields, { new: true })
      .populate('items.product', 'name sku')
      .populate('items.unit', 'name shortName conversionFactor unitType')
      .populate('supplier', 'name email phone');
    
    if (!purchase) {
      throw new Error('Purchase not found');
    }
    
    return JSON.parse(JSON.stringify(purchase));
  } catch (error) {
    throw new Error('Failed to update purchase order');
  }
}

export async function deletePurchaseOrder(purchaseId: string) {
  try {
    await connectToDB();
    
    const purchase = await Purchase.findByIdAndDelete(purchaseId);
    
    if (!purchase) {
      throw new Error('Purchase not found');
    }
    
    return { success: true };
  } catch (error) {
    throw new Error('Failed to delete purchase order');
  }
}

export async function getPurchaseStats() {
  try {
    await connectToDB();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const [todayPurchases, monthPurchases, totalPurchases, pendingPurchases] = await Promise.all([
      Purchase.find({ orderDate: { $gte: today, $lt: tomorrow } }),
      Purchase.find({ orderDate: { $gte: thisMonth } }),
      Purchase.find({}),
      Purchase.find({ status: 'pending' })
    ]);
    
    const todaySpent = todayPurchases.reduce((sum, purchase) => sum + (purchase.totalCost || 0), 0);
    const monthSpent = monthPurchases.reduce((sum, purchase) => sum + (purchase.totalCost || 0), 0);
    const totalSpent = totalPurchases.reduce((sum, purchase) => sum + (purchase.totalCost || 0), 0);
    
    const orderTypeStats = await Purchase.aggregate([
      { $group: { _id: '$orderType', count: { $sum: 1 }, total: { $sum: '$totalCost' } } }
    ]);
    
    return {
      todaySpent,
      todayOrders: todayPurchases.length,
      monthSpent,
      monthOrders: monthPurchases.length,
      totalSpent,
      totalOrders: totalPurchases.length,
      pendingOrders: pendingPurchases.length,
      avgOrderValue: totalPurchases.length > 0 ? totalSpent / totalPurchases.length : 0,
      orderTypeBreakdown: orderTypeStats
    };
  } catch (error) {
    throw new Error('Failed to fetch purchase stats');
  }
}

export async function receivePurchaseOrder(purchaseId: string, receivedItems: Array<{
  productId: string;
  receivedQuantity: number;
  actualCost?: number;
  sellingPrice?: number;
  expiryDate?: Date;
}>) {
  try {
    await connectToDB();
    
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      throw new Error('Purchase not found');
    }
    
    // Calculate shipping cost per product based on total shipping cost and quantities
    const totalOrderQuantity = purchase.items.reduce((sum: number, item: any) => sum + item.baseQuantity, 0);
    const shippingCostPerUnit = (purchase.shippingCost || 0) / totalOrderQuantity;
    
    // Update purchase status
    purchase.status = 'received';
    purchase.receivedDate = new Date();
    
    // Create product batches for received items with shipping cost tracking
    for (const receivedItem of receivedItems) {
      const originalItem = purchase.items.find(item => 
        item.product.toString() === receivedItem.productId
      );
      
      if (originalItem) {
        // Calculate shipping cost for this specific product
        const productShippingCost = shippingCostPerUnit * originalItem.baseQuantity;
        const totalUnitCost = (receivedItem.actualCost || originalItem.baseUnitPrice) + (productShippingCost / receivedItem.receivedQuantity);
        
        await ProductBatch.create({
          product: receivedItem.productId,
          quantity: receivedItem.receivedQuantity,
          remaining: receivedItem.receivedQuantity,
          unitCost: totalUnitCost, // Include shipping cost in unit cost
          originalUnitCost: receivedItem.actualCost || originalItem.baseUnitPrice, // Track original cost without shipping
          shippingCostPerUnit: productShippingCost / receivedItem.receivedQuantity, // Track shipping cost per unit
          sellingPrice: receivedItem.sellingPrice || totalUnitCost * 1.3, // Base selling price on total cost including shipping
          expiryDate: receivedItem.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isDepleted: false,
          purchaseOrder: purchaseId, // Track which purchase order this came from
          receivedDate: new Date()
        });
        
        // Update product stock
        await Product.findByIdAndUpdate(receivedItem.productId, {
          $inc: { stock: receivedItem.receivedQuantity }
        });
      }
    }
    
    await purchase.save();
    
    // Update related shipment status if exists
    try {
      const Shipment = (await import('@/lib/models/shipment.models')).default;
      await Shipment.findOneAndUpdate(
        { purchaseOrder: purchaseId },
        { status: 'received', actualDelivery: new Date() }
      );
    } catch (error) {
      // Shipment might not exist, continue
    }
    
    return JSON.parse(JSON.stringify(purchase));
  } catch (error) {
    throw new Error('Failed to receive purchase order');
  }
}

export async function getProductsForPurchase() {
  try {
    await connectToDB();
    
    // First get products without populate
    const productsRaw = await Product.find({}).select('_id name sku price unit').limit(100);
    console.log('Raw products:', productsRaw.length);
    console.log('First raw product:', productsRaw[0]);
    
    // Then populate units
    const products = await Product.find({})
      .populate({ path: 'unit', model: Unit, select: '_id name shortName conversionFactor unitType' })
      .limit(100);
    
    console.log('Populated products:', products.length);
    console.log('First populated product:', products[0]);
    
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error('Error fetching products for purchase:', error);
    return [];
  }
}

export async function getSuppliers() {
  try {
    await connectToDB();
    
    const suppliers = await Supplier.find({}).select('_id name email phone address').sort({ name: 1 });
    
    return JSON.parse(JSON.stringify(suppliers));
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return [];
  }
}