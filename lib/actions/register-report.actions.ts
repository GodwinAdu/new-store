'use server'

import { connectToDB } from '../mongoose';
import Sale from '@/lib/models/sales.models';

export async function getRegisterReport(startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().setDate(new Date().getDate() - 7));
    const end = endDate || new Date();
    
    // Get sales data for the period
    const sales = await Sale.find({
      saleDate: { $gte: start, $lte: end },
      isVoided: { $ne: true }
    }).populate('items.product', 'name');
    
    // Calculate summary metrics
    const totalSales = sales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0);
    const totalTransactions = sales.length;
    const avgTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    
    // Payment method breakdown
    const paymentBreakdown = {
      cash: 0,
      card: 0,
      mobile: 0
    };
    
    sales.forEach(sale => {
      const amount = sale.totalRevenue || 0;
      switch (sale.paymentMethod) {
        case 'cash':
          paymentBreakdown.cash += amount;
          break;
        case 'card':
          paymentBreakdown.card += amount;
          break;
        case 'mobile':
          paymentBreakdown.mobile += amount;
          break;
        default:
          paymentBreakdown.cash += amount;
      }
    });
    
    // Daily breakdown
    const dailyMap = new Map();
    sales.forEach(sale => {
      const date = sale.saleDate.toISOString().split('T')[0];
      const amount = sale.totalRevenue || 0;
      
      if (dailyMap.has(date)) {
        const existing = dailyMap.get(date);
        existing.sales += amount;
        existing.transactions += 1;
        existing[sale.paymentMethod || 'cash'] += amount;
      } else {
        dailyMap.set(date, {
          date,
          sales: amount,
          transactions: 1,
          cash: sale.paymentMethod === 'cash' ? amount : 0,
          card: sale.paymentMethod === 'card' ? amount : 0,
          mobile: sale.paymentMethod === 'mobile' ? amount : 0
        });
      }
    });
    
    const dailyBreakdown = Array.from(dailyMap.values())
      .map(day => ({
        ...day,
        avgValue: day.transactions > 0 ? day.sales / day.transactions : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Hourly breakdown
    const hourlyMap = new Map();
    sales.forEach(sale => {
      const hour = sale.saleDate.getHours();
      const hourLabel = `${hour}:00`;
      const amount = sale.totalRevenue || 0;
      
      if (hourlyMap.has(hourLabel)) {
        const existing = hourlyMap.get(hourLabel);
        existing.sales += amount;
        existing.transactions += 1;
      } else {
        hourlyMap.set(hourLabel, {
          hour: hourLabel,
          sales: amount,
          transactions: 1
        });
      }
    });
    
    const hourlyBreakdown = Array.from(hourlyMap.values())
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
    
    // Payment methods summary
    const totalPayments = paymentBreakdown.cash + paymentBreakdown.card + paymentBreakdown.mobile;
    const paymentMethods = [
      {
        method: 'Cash',
        amount: paymentBreakdown.cash,
        count: sales.filter(s => (s.paymentMethod || 'cash') === 'cash').length,
        percentage: totalPayments > 0 ? (paymentBreakdown.cash / totalPayments) * 100 : 0
      },
      {
        method: 'Card',
        amount: paymentBreakdown.card,
        count: sales.filter(s => s.paymentMethod === 'card').length,
        percentage: totalPayments > 0 ? (paymentBreakdown.card / totalPayments) * 100 : 0
      },
      {
        method: 'Mobile',
        amount: paymentBreakdown.mobile,
        count: sales.filter(s => s.paymentMethod === 'mobile').length,
        percentage: totalPayments > 0 ? (paymentBreakdown.mobile / totalPayments) * 100 : 0
      }
    ].filter(method => method.count > 0);
    
    // Top products
    const productMap = new Map();
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productName = item.product?.name || 'Unknown Product';
        const quantity = item.quantity;
        const revenue = item.total || 0;
        
        if (productMap.has(productName)) {
          const existing = productMap.get(productName);
          existing.quantity += quantity;
          existing.revenue += revenue;
        } else {
          productMap.set(productName, {
            name: productName,
            quantity,
            revenue
          });
        }
      });
    });
    
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    return {
      summary: {
        totalSales,
        totalTransactions,
        avgTransactionValue,
        cashSales: paymentBreakdown.cash,
        cardSales: paymentBreakdown.card,
        mobileSales: paymentBreakdown.mobile,
        period: { start: start.toISOString(), end: end.toISOString() }
      },
      dailyBreakdown,
      hourlyBreakdown,
      paymentMethods,
      topProducts
    };
  } catch (error) {
    console.error('Error generating register report:', error);
    throw new Error('Failed to generate register report');
  }
}

export async function getDailyRegisterSummary(date?: Date) {
  try {
    await connectToDB();
    
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
    
    const sales = await Sale.find({
      saleDate: { $gte: startOfDay, $lte: endOfDay },
      isVoided: { $ne: true }
    });
    
    const totalSales = sales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0);
    const totalTransactions = sales.length;
    
    const paymentBreakdown = {
      cash: sales.filter(s => (s.paymentMethod || 'cash') === 'cash').reduce((sum, s) => sum + (s.totalRevenue || 0), 0),
      card: sales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + (s.totalRevenue || 0), 0),
      mobile: sales.filter(s => s.paymentMethod === 'mobile').reduce((sum, s) => sum + (s.totalRevenue || 0), 0)
    };
    
    return {
      date: targetDate.toISOString().split('T')[0],
      totalSales,
      totalTransactions,
      avgTransactionValue: totalTransactions > 0 ? totalSales / totalTransactions : 0,
      paymentBreakdown,
      firstSale: sales.length > 0 ? sales[0].saleDate : null,
      lastSale: sales.length > 0 ? sales[sales.length - 1].saleDate : null
    };
  } catch (error) {
    throw new Error('Failed to fetch daily register summary');
  }
}