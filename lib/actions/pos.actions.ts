'use server'


import Product from '@/lib/models/product.models';
import Sale from '@/lib/models/sales.models';
import Customer from '@/lib/models/customer.models';
import ProductBatch from '@/lib/models/product_batch.models';
import { connectToDB } from '../mongoose';
import { currentUser } from '../helpers/session';
import Staff from '../models/staff.models';
import CashDrawerEvent from '../models/cash-drawer.models';

export async function getProducts(category?: string, search?: string) {
  try {
    await connectToDB();

    const query: any = { del_flag: false, isActive: true };

    const products = await Product.find(query)
      .populate('unit')
      .populate('categoryId', 'name')
      .sort({ name: 1 })
      .limit(200);

    return products.map(product => ({
      _id: product._id.toString(),
      id: product._id.toString(),
      name: product.name,
      category: (product.categoryId as any)?.name || 'General',
      sku: product.sku,
      barcode: product.barcode,
      unit: product.unit || [],
      defaultCost: product.defaultCost || 0,
      defaultMargin: product.defaultMargin || 30,
      reorderPoint: product.reorderPoint || 10,
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function processSale(saleData: {
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  customerId?: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  cashReceived?: number;
  warehouseId?: string;
}) {
  try {
    const user = await currentUser();

    if (!user) throw new Error('Unauthorized');
    
    await connectToDB();

    console.log('Processing sale with data:', saleData);

    // Validate stock availability for each item
    // NOTE: ProductBatch uses `warehouseId` (not `warehouse`) as the field name
    for (const item of saleData.items) {
      const batches = await ProductBatch.find({
        product: item.productId,
        warehouseId: saleData.warehouseId,
        isDepleted: false,
        remaining: { $gt: 0 }
      }).sort({ createdAt: 1 });

      const availableStock = batches.reduce((sum, batch) => sum + batch.remaining, 0);

      if (availableStock < item.quantity) {
        const product = await Product.findById(item.productId);
        throw new Error(`Insufficient stock for ${product?.name || 'product'}. Available: ${availableStock}, Requested: ${item.quantity}`);
      }
    }

    // Calculate totals from items
    const calculatedSubtotal = saleData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountAmount = (calculatedSubtotal * saleData.discount) / 100;
    const afterDiscount = calculatedSubtotal - discountAmount;
    const taxAmount = (afterDiscount * saleData.tax) / 100;
    const calculatedTotal = afterDiscount + taxAmount;

    // Create sale record with calculated values
    const sale = await Sale.create({
      warehouse: saleData.warehouseId || null,
      items: saleData.items.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      saleDate: new Date(),
      paymentMethod: saleData.paymentMethod,
      subtotal: calculatedSubtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: calculatedTotal,
      totalRevenue: calculatedTotal,
      cashReceived: saleData.cashReceived || calculatedTotal,
      cashier: user._id,
      paymentStatus: 'pending' // Set to pending for accounts verification
    });

    console.log('Sale created:', sale._id);

    // Update customer if provided
    if (saleData.customerId) {
      try {
        const pointsEarned = Math.floor(calculatedTotal);
        await Customer.findByIdAndUpdate(saleData.customerId, {
          $inc: {
            loyaltyPoints: pointsEarned,
            totalSpent: calculatedTotal,
            totalOrders: 1
          },
          lastVisit: new Date()
        });
        console.log('Customer updated with points:', pointsEarned);
      } catch (customerError) {
        console.error('Error updating customer:', customerError);
      }
    }

    return JSON.parse(JSON.stringify(sale));
  } catch (error) {
    console.error('Error processing sale:', error);
    throw new Error(`Failed to process sale: ${error}`);
  }
}

export async function getTodayStats() {
  try {
    await connectToDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sales = await Sale.find({
      saleDate: { $gte: today, $lt: tomorrow }
    });

    const totalSales = sales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0);
    const totalTransactions = sales.length;
    const avgOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Get hourly breakdown
    const hourlyData = Array.from({ length: 12 }, (_, i) => {
      const hour = i + 9; // 9AM to 8PM
      const hourSales = sales.filter(sale => {
        const saleHour = new Date(sale.saleDate).getHours();
        return saleHour === hour;
      });

      return {
        hour: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`,
        sales: hourSales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0),
        transactions: hourSales.length
      };
    });

    const peakHour = hourlyData.reduce((max, current) =>
      current.transactions > max.transactions ? current : max
    );

    return {
      totalSales,
      totalTransactions,
      avgOrderValue,
      peakHour: peakHour.hour,
      hourlyData
    };
  } catch (error) {
    throw new Error('Failed to fetch today stats');
  }
}

export async function getTodaySales() {
  try {
    await connectToDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query: any = {
      saleDate: { $gte: today, $lt: tomorrow },
      isVoided: { $ne: true }
    };

    const sales = await Sale.find(query)
      .populate([{ path: 'items.product', model: Product }, { path: "cashier", model: Staff, select: "name email" }])
      .sort({ saleDate: -1 })
      .limit(10);

    return JSON.parse(JSON.stringify(sales));
  } catch (error) {
    console.error('Error in getTodaySales:', error);
    return [];
  }
}

export async function voidSale(saleId: string, reason: string) {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');
    
    await connectToDB();

    const sale = await Sale.findById(saleId);
    if (!sale) throw new Error('Sale not found');
    if (sale.isVoided) throw new Error('Sale is already voided');

    // Restore stock: reverse the FIFO batch consumption
    // We re-add the sold quantities back to the warehouse as a new batch
    for (const item of sale.items) {
      // Find the most recently depleted or reduced batch for this product/warehouse
      // to restore into (or create a new adjustment batch)
      const existingBatch = await ProductBatch.findOne({
        product: item.product,
        warehouseId: sale.warehouse,
      }).sort({ createdAt: -1 });

      if (existingBatch) {
        // Restore into the most recent batch
        existingBatch.remaining += item.quantity;
        existingBatch.quantity += item.quantity;
        if (existingBatch.isDepleted) {
          existingBatch.isDepleted = false;
          existingBatch.depletedAt = undefined;
        }
        await existingBatch.save();
      } else {
        // No batch exists — create a stock-restoration batch
        await ProductBatch.create({
          product: item.product,
          warehouseId: sale.warehouse,
          quantity: item.quantity,
          remaining: item.quantity,
          unitCost: item.costOfGoods ? item.costOfGoods / item.quantity : 0,
          sellingPrice: item.unitPrice,
          isDepleted: false,
          notes: `Stock restored from voided sale ${saleId}`,
        });
      }
    }
    
    const updatedSale = await Sale.findByIdAndUpdate(
      saleId,
      {
        isVoided: true,
        voidReason: reason,
        voidedAt: new Date(),
        modifiedBy: user._id,
        $push: {
          modificationHistory: {
            modifiedBy: user._id,
            modifiedAt: new Date(),
            changes: { action: 'voided', reason },
            reason
          }
        }
      },
      { new: true }
    );
    
    return JSON.parse(JSON.stringify(updatedSale));
  } catch (error) {
    throw new Error(`Failed to void sale: ${error}`);
  }
}

export async function updateSale(saleId: string, updateData: {
  paymentMethod?: string;
  discount?: number;
  tax?: number;
  cashReceived?: number;
}) {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');
    
    await connectToDB();
    
    const sale = await Sale.findByIdAndUpdate(
      saleId,
      {
        ...updateData,
        modifiedBy: user._id,
        $push: {
          modificationHistory: {
            modifiedBy: user._id,
            modifiedAt: new Date(),
            changes: updateData,
            reason: 'Sale updated'
          }
        }
      },
      { new: true }
    ).populate([{ path: 'items.product', model: Product }, { path: "cashier", model: Staff, select: "name email" }]);
    
    return JSON.parse(JSON.stringify(sale));
  } catch (error) {
    throw new Error('Failed to update sale');
  }
}

export async function getSaleHistory(saleId: string) {
  try {
    await connectToDB();
    
    const sale = await Sale.findById(saleId)
      .populate('modificationHistory.modifiedBy', 'name email')
      .populate('modifiedBy', 'name email')
      .populate('cashier', 'name email');
    
    return JSON.parse(JSON.stringify(sale));
  } catch (error) {
    throw new Error('Failed to get sale history');
  }
}

export async function recordNoSale(reason: string, warehouseId?: string) {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');
    await connectToDB();
    
    
    
    const event = await CashDrawerEvent.create({
      type: 'no_sale',
      reason,
      cashier: user._id,
      warehouse: warehouseId || null,
      notes: 'Cash drawer opened without sale'
    });
    
    return JSON.parse(JSON.stringify(event));
  } catch (error) {
    throw new Error('Failed to record no sale event');
  }
}

export async function getCashDrawerEvents(warehouseId?: string) {
  try {
    await connectToDB();
    
    
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const query: any = {
      timestamp: { $gte: today, $lt: tomorrow }
    };
    
    if (warehouseId) {
      query.warehouse = warehouseId;
    }
    
    const events = await CashDrawerEvent.find(query)
      .populate('cashier', 'name email')
      .populate('warehouse', 'name location')
      .sort({ timestamp: -1 });
    
    return JSON.parse(JSON.stringify(events));
  } catch (error) {
    throw new Error('Failed to get cash drawer events');
  }
}

export async function getCurrentCashierName(): Promise<string> {
  try {
    const user = await currentUser();
    return user?.fullName || user?.name as string || 'Cashier';
  } catch {
    return 'Cashier';
  }
}
