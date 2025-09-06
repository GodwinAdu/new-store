'use server'

import Purchase from '@/lib/models/purchase.models';
import Product from '@/lib/models/product.models';
import Supplier from '@/lib/models/supplier.models';
import ProductBatch from '@/lib/models/product_batch.models';
import { connectToDB } from '../mongoose';

export async function createPurchaseOrder(orderData: {
  supplierId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitCost: number;
  }>;
  orderType: 'wholesale' | 'transport' | 'regular';
  transportDetails?: {
    carrier: string;
    trackingNumber?: string;
    estimatedDelivery?: Date;
    shippingCost: number;
  };
  wholesaleDetails?: {
    bulkDiscount: number;
    minimumQuantity: number;
    contractNumber?: string;
  };
  notes?: string;
}) {
  try {
    await connectToDB();
    
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const shippingCost = orderData.transportDetails?.shippingCost || 0;
    const discount = orderData.wholesaleDetails?.bulkDiscount || 0;
    const total = subtotal + shippingCost - discount;
    
    const purchase = await Purchase.create({
      supplier: orderData.supplierId,
      items: orderData.items.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.quantity * item.unitCost
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

    return JSON.parse(JSON.stringify(purchase));
  } catch (error) {
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
    quantity: number;
    unitCost: number;
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
    }
    
    if (updateData.items) {
      updateFields.items = updateData.items.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.quantity * item.unitCost
      }));
      
      const subtotal = updateData.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
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
}>) {
  try {
    await connectToDB();
    
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      throw new Error('Purchase not found');
    }
    
    // Update purchase status
    purchase.status = 'received';
    purchase.receivedDate = new Date();
    
    // Create product batches for received items
    for (const receivedItem of receivedItems) {
      const originalItem = purchase.items.find(item => 
        item.product.toString() === receivedItem.productId
      );
      
      if (originalItem) {
        await ProductBatch.create({
          product: receivedItem.productId,
          quantity: receivedItem.receivedQuantity,
          costPerUnit: receivedItem.actualCost || originalItem.unitCost,
          supplier: purchase.supplier,
          purchaseOrder: purchaseId,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
          batchNumber: `BATCH-${Date.now()}-${receivedItem.productId.slice(-4)}`
        });
        
        // Update product stock
        await Product.findByIdAndUpdate(receivedItem.productId, {
          $inc: { stock: receivedItem.receivedQuantity }
        });
      }
    }
    
    await purchase.save();
    
    return JSON.parse(JSON.stringify(purchase));
  } catch (error) {
    throw new Error('Failed to receive purchase order');
  }
}

export async function getSuppliers() {
  try {
    await connectToDB();
    
    const suppliers = await Supplier.find({ isActive: true })
      .select('name email phone address')
      .sort({ name: 1 });
    
    return JSON.parse(JSON.stringify(suppliers));
  } catch (error) {
    throw new Error('Failed to fetch suppliers');
  }
}