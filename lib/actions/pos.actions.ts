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

    // Simple query with unit population
    let products = await Product.find({ del_flag: false, isActive: true }).populate('unit').limit(50);

    // If no products exist, create simple sample data
    if (products.length === 0) {
      return []
    }

    // Return simple product data with units
    return products.map(product => ({
      _id: product._id.toString(),
      id: product._id.toString(),
      name: product.name,
      price: 25, // Fixed price for simplicity
      category: 'General',
      stock: 100, // Fixed stock for simplicity
      barcode: product.barcode,
      sku: product.sku,
      unit: product.unit || [],
      isPopular: false
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array instead of throwing error
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
      cashier:user._id
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
    
    const sale = await Sale.findByIdAndUpdate(
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
    
    return JSON.parse(JSON.stringify(sale));
  } catch (error) {
    throw new Error('Failed to void sale');
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