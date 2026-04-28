'use server'

import { connectToDB } from '../mongoose';
import Product from '../models/product.models';
import ProductBatch from '../models/product_batch.models';
import PurchaseOrder from '../models/purchase-order.models';
import Supplier from '../models/supplier.models';
import { Warehouse } from '../models/Warehouse';

// ============================================
// QUICK ADD WITH SMART DEFAULTS
// ============================================

export async function quickAddStock(data: {
  warehouseId: string;
  productId: string;
  quantity: number;
  barcode?: string;
}) {
  try {
    await connectToDB();
    
    // Get product with defaults
    const product = await Product.findById(data.productId);
    if (!product) throw new Error('Product not found');
    
    // Use smart defaults
    const unitCost = product.defaultCost || 0;
    const margin = product.defaultMargin || 30;
    const sellingPrice = unitCost * (1 + margin / 100);
    
    // Create batch
    const batch = await ProductBatch.create({
      product: data.productId,
      warehouseId: data.warehouseId,
      quantity: data.quantity,
      remaining: data.quantity,
      unitCost,
      originalUnitCost: unitCost,
      shippingCostPerUnit: 0,
      sellingPrice,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isDepleted: false,
      notes: 'Quick add with smart defaults'
    });
    
    return JSON.parse(JSON.stringify(batch));
  } catch (error) {
    throw new Error(`Failed to quick add stock: ${error}`);
  }
}

export async function updateProductDefaults(productId: string, data: {
  defaultCost?: number;
  defaultMargin?: number;
  defaultSupplier?: string;
  reorderPoint?: number;
  reorderQuantity?: number;
}) {
  try {
    await connectToDB();
    
    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: data },
      { new: true }
    );
    
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    throw new Error('Failed to update product defaults');
  }
}

// ============================================
// BULK IMPORT FROM CSV
// ============================================

export async function bulkImportStock(items: Array<{
  productCode: string; // SKU or barcode
  warehouseId: string;
  quantity: number;
  unitCost?: number;
  sellingPrice?: number;
}>) {
  try {
    await connectToDB();
    
    const results = {
      success: [] as any[],
      failed: [] as any[]
    };
    
    for (const item of items) {
      try {
        // Find product by SKU or barcode
        const product = await Product.findOne({
          $or: [
            { sku: item.productCode },
            { barcode: item.productCode }
          ]
        });
        
        if (!product) {
          results.failed.push({ ...item, error: 'Product not found' });
          continue;
        }
        
        // Use provided costs or defaults
        const unitCost = item.unitCost ?? product.defaultCost ?? 0;
        const sellingPrice = item.sellingPrice ?? (unitCost * (1 + (product.defaultMargin || 30) / 100));
        
        // Create batch
        const batch = await ProductBatch.create({
          product: product._id,
          warehouseId: item.warehouseId,
          quantity: item.quantity,
          remaining: item.quantity,
          unitCost,
          originalUnitCost: unitCost,
          shippingCostPerUnit: 0,
          sellingPrice,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isDepleted: false,
          notes: 'Bulk import'
        });
        
        results.success.push({ ...item, batchId: batch._id });
      } catch (error) {
        results.failed.push({ ...item, error: String(error) });
      }
    }
    
    return results;
  } catch (error) {
    throw new Error(`Bulk import failed: ${error}`);
  }
}

// ============================================
// PURCHASE ORDER SYSTEM
// ============================================

export async function createPurchaseOrder(data: {
  supplierId: string;
  warehouseId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitCost: number;
  }>;
  shippingCost?: number;
  expectedDelivery?: Date;
  notes?: string;
  createdBy: string;
}) {
  try {
    await connectToDB();
    
    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const shippingCost = data.shippingCost || 0;
    const totalCost = subtotal + shippingCost;
    
    const items = data.items.map(item => ({
      product: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost,
      totalCost: item.quantity * item.unitCost
    }));
    
    const po = await PurchaseOrder.create({
      supplier: data.supplierId,
      warehouse: data.warehouseId,
      items,
      subtotal,
      shippingCost,
      tax: 0,
      totalCost,
      expectedDelivery: data.expectedDelivery,
      notes: data.notes,
      createdBy: data.createdBy,
      status: 'draft'
    });
    
    return JSON.parse(JSON.stringify(po));
  } catch (error) {
    throw new Error(`Failed to create purchase order: ${error}`);
  }
}

export async function approvePurchaseOrder(poId: string, approvedBy: string) {
  try {
    await connectToDB();
    
    const po = await PurchaseOrder.findByIdAndUpdate(
      poId,
      {
        status: 'approved',
        approvedBy,
        approvedAt: new Date()
      },
      { new: true }
    );
    
    return JSON.parse(JSON.stringify(po));
  } catch (error) {
    throw new Error('Failed to approve purchase order');
  }
}

export async function receivePurchaseOrder(poId: string, data: {
  items: Array<{
    productId: string;
    receivedQuantity: number;
    actualCost?: number;
    sellingPrice: number;
    expiryDate?: Date;
  }>;
  profitMargin?: number;
}) {
  try {
    await connectToDB();
    
    const po = await PurchaseOrder.findById(poId).populate('warehouse');
    if (!po) throw new Error('Purchase order not found');
    
    const shippingCostPerUnit = po.shippingCost / data.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
    
    // Create batches for received items
    const batches = await Promise.all(
      data.items.map(async (item) => {
        const unitCost = item.actualCost || po.items.find(i => i.product.toString() === item.productId)?.unitCost || 0;
        const totalCostPerUnit = unitCost + shippingCostPerUnit;
        
        return ProductBatch.create({
          product: item.productId,
          warehouseId: po.warehouse,
          quantity: item.receivedQuantity,
          remaining: item.receivedQuantity,
          unitCost: totalCostPerUnit,
          originalUnitCost: unitCost,
          shippingCostPerUnit,
          sellingPrice: item.sellingPrice,
          expiryDate: item.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isDepleted: false,
          purchaseOrder: po._id,
          notes: `Received from PO ${po.orderNumber}`
        });
      })
    );
    
    // Update PO status
    po.status = 'received';
    po.receivedDate = new Date();
    await po.save();
    
    return JSON.parse(JSON.stringify({ po, batches }));
  } catch (error) {
    throw new Error(`Failed to receive purchase order: ${error}`);
  }
}

export async function getPurchaseOrders(filters?: {
  status?: string;
  supplierId?: string;
  warehouseId?: string;
}) {
  try {
    await connectToDB();
    
    const query: any = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.supplierId) query.supplier = filters.supplierId;
    if (filters?.warehouseId) query.warehouse = filters.warehouseId;
    
    const pos = await PurchaseOrder.find(query)
      .populate('supplier', 'name email')
      .populate('warehouse', 'name location')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });
    
    return JSON.parse(JSON.stringify(pos));
  } catch (error) {
    throw new Error('Failed to fetch purchase orders');
  }
}

export async function cancelPurchaseOrder(poId: string) {
  try {
    await connectToDB();
    
    const po = await PurchaseOrder.findByIdAndUpdate(
      poId,
      { status: 'cancelled' },
      { new: true }
    );
    
    return JSON.parse(JSON.stringify(po));
  } catch (error) {
    throw new Error('Failed to cancel purchase order');
  }
}

// ============================================
// SUPPLIER INTEGRATION
// ============================================

export async function getSupplierProducts(supplierId: string) {
  try {
    await connectToDB();
    
    // Get products that have this supplier as default
    const products = await Product.find({ defaultSupplier: supplierId })
      .select('name sku barcode defaultCost defaultMargin');
    
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    throw new Error('Failed to fetch supplier products');
  }
}

export async function createQuickReorder(productId: string, warehouseId: string) {
  try {
    await connectToDB();
    
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
    
    if (!product.defaultSupplier) {
      throw new Error('No default supplier set for this product');
    }
    
    // Create PO with reorder quantity
    const quantity = product.reorderQuantity || 50;
    const unitCost = product.defaultCost || 0;
    
    const po = await PurchaseOrder.create({
      supplier: product.defaultSupplier,
      warehouse: warehouseId,
      items: [{
        product: productId,
        quantity,
        unitCost,
        totalCost: quantity * unitCost
      }],
      subtotal: quantity * unitCost,
      shippingCost: 0,
      tax: 0,
      totalCost: quantity * unitCost,
      status: 'draft',
      notes: 'Auto-generated reorder',
      createdBy: null as any // Set from session
    });
    
    return JSON.parse(JSON.stringify(po));
  } catch (error) {
    throw new Error(`Failed to create reorder: ${error}`);
  }
}

// ============================================
// BARCODE SCANNING
// ============================================

export async function findProductByBarcode(barcode: string) {
  try {
    await connectToDB();
    
    const product = await Product.findOne({ barcode })
      .select('name sku barcode defaultCost defaultMargin defaultSupplier reorderPoint');
    
    if (!product) return null;
    
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    throw new Error('Failed to find product by barcode');
  }
}

export async function scanAndAddStock(data: {
  barcode: string;
  warehouseId: string;
  quantity: number;
  unitCost?: number;
  sellingPrice?: number;
}) {
  try {
    await connectToDB();
    
    const product = await Product.findOne({ barcode: data.barcode });
    if (!product) throw new Error('Product not found');
    
    const unitCost = data.unitCost ?? product.defaultCost ?? 0;
    const sellingPrice = data.sellingPrice ?? (unitCost * (1 + (product.defaultMargin || 30) / 100));
    
    const batch = await ProductBatch.create({
      product: product._id,
      warehouseId: data.warehouseId,
      quantity: data.quantity,
      remaining: data.quantity,
      unitCost,
      originalUnitCost: unitCost,
      shippingCostPerUnit: 0,
      sellingPrice,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isDepleted: false,
      notes: 'Barcode scan entry'
    });
    
    return JSON.parse(JSON.stringify({ product, batch }));
  } catch (error) {
    throw new Error(`Failed to scan and add stock: ${error}`);
  }
}

// ============================================
// LOW STOCK ALERTS & AUTO-REORDER
// ============================================

export async function getLowStockProducts(warehouseId?: string) {
  try {
    await connectToDB();
    
    const query: any = { isDepleted: false, remaining: { $gt: 0 } };
    if (warehouseId) query.warehouseId = warehouseId;
    
    const batches = await ProductBatch.find(query)
      .populate('product', 'name sku reorderPoint reorderQuantity defaultSupplier');
    
    // Group by product and check against reorder point
    const productMap = new Map();
    
    batches.forEach(batch => {
      const product = batch.product as any;
      const productId = product._id.toString();
      
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          product,
          totalStock: batch.remaining,
          reorderPoint: product.reorderPoint || 10,
          needsReorder: false
        });
      } else {
        productMap.get(productId).totalStock += batch.remaining;
      }
    });
    
    // Filter products below reorder point
    const lowStockProducts = Array.from(productMap.values())
      .filter(item => item.totalStock <= item.reorderPoint)
      .map(item => ({
        ...item,
        needsReorder: true
      }));
    
    return JSON.parse(JSON.stringify(lowStockProducts));
  } catch (error) {
    throw new Error('Failed to get low stock products');
  }
}

export async function autoReorderLowStock(warehouseId: string) {
  try {
    await connectToDB();
    
    const lowStockProducts = await getLowStockProducts(warehouseId);
    const reorders = [];
    
    for (const item of lowStockProducts) {
      if (item.product.defaultSupplier) {
        try {
          const po = await createQuickReorder(item.product._id, warehouseId);
          reorders.push(po);
        } catch (error) {
          console.error(`Failed to reorder ${item.product.name}:`, error);
        }
      }
    }
    
    return reorders;
  } catch (error) {
    throw new Error('Failed to auto-reorder low stock');
  }
}
