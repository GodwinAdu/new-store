'use server'


import Sale from '@/lib/models/sales.models';
import Product from '@/lib/models/product.models';
import Customer from '@/lib/models/customer.models';
import { connectToDB } from '../mongoose';

export async function getSalesReport(startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate || new Date(new Date().setHours(23, 59, 59, 999));
    
    const sales = await Sale.find({
      saleDate: { $gte: start, $lte: end }
    }).populate('items.product', 'name category');
    
    const totalSales = sales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0);
    const totalTransactions = sales.length;
    const avgOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    
    // Top products
    const productSales = new Map();
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productId = item.product._id.toString();
        const existing = productSales.get(productId) || { 
          name: item.product.name, 
          quantity: 0, 
          revenue: 0 
        };
        existing.quantity += item.quantity;
        existing.revenue += item.total || 0;
        productSales.set(productId, existing);
      });
    });
    
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Payment methods breakdown
    const paymentMethods = {
      cash: 0,
      card: 0,
      mobile: 0
    };
    
    sales.forEach(sale => {
      if (sale.paymentMethod && paymentMethods.hasOwnProperty(sale.paymentMethod)) {
        paymentMethods[sale.paymentMethod] += sale.totalRevenue || 0;
      }
    });
    
    // Hourly breakdown
    const hourlyData = Array.from({ length: 12 }, (_, i) => {
      const hour = i + 9;
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
    
    return {
      totalSales,
      totalTransactions,
      avgOrderValue,
      topProducts,
      paymentMethods,
      hourlyData,
      transactions: sales.map(sale => ({
        id: sale._id.toString(),
        timestamp: sale.saleDate,
        items: sale.items,
        subtotal: sale.subtotal || 0,
        discount: sale.discount || 0,
        tax: sale.tax || 0,
        total: sale.totalRevenue || 0,
        paymentMethod: sale.paymentMethod,
        cashReceived: sale.cashReceived
      }))
    };
  } catch (error) {
    throw new Error('Failed to fetch sales report');
  }
}

export async function getTransactionById(transactionId: string) {
  try {
    await connectToDB();
    
    const sale = await Sale.findById(transactionId)
      .populate('items.product', 'name price')
      .populate('customer', 'name email phone');
    
    if (!sale) {
      throw new Error('Transaction not found');
    }
    
    return JSON.parse(JSON.stringify(sale));
  } catch (error) {
    throw new Error('Failed to fetch transaction');
  }
}

export async function voidTransaction(transactionId: string, reason: string) {
  try {
    await connectToDB();
    
    const sale = await Sale.findByIdAndUpdate(
      transactionId,
      { 
        isVoided: true,
        voidReason: reason,
        voidedAt: new Date()
      },
      { new: true }
    );
    
    if (!sale) {
      throw new Error('Transaction not found');
    }
    
    // Restore inventory
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }
    
    return JSON.parse(JSON.stringify(sale));
  } catch (error) {
    throw new Error('Failed to void transaction');
  }
}