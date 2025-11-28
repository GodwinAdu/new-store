'use server'

import { connectToDB } from '../mongoose';
import Sale from '@/lib/models/sales.models';
import ProductBatch from '@/lib/models/product_batch.models';
import Expense from '@/lib/models/expense.models';
import Income from '@/lib/models/income.models';
import Product from '@/lib/models/product.models';

export async function getProfitLossReport(startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    // Get sales data for the period
    const sales = await Sale.find({
      saleDate: { $gte: start, $lte: end },
      isVoided: { $ne: true }
    }).populate('items.product', 'name');
    
    // Calculate total sales revenue
    const totalSales = sales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0);
    
    // Calculate cost of goods sold (COGS) using FIFO from ProductBatch
    let totalCOGS = 0;
    for (const sale of sales) {
      for (const item of sale.items) {
        // Find the cost from product batches (FIFO)
        const batches = await ProductBatch.find({
          product: item.product._id,
          createdAt: { $lte: sale.saleDate }
        }).sort({ createdAt: 1 });
        
        let remainingQty = item.quantity;
        let itemCOGS = 0;
        
        for (const batch of batches) {
          if (remainingQty <= 0) break;
          
          const qtyFromBatch = Math.min(remainingQty, batch.quantity);
          itemCOGS += qtyFromBatch * (batch.unitCost || 0);
          remainingQty -= qtyFromBatch;
        }
        
        totalCOGS += itemCOGS;
      }
    }
    
    // Calculate gross profit
    const grossProfit = totalSales - totalCOGS;
    
    // Get expenses for the period
    const expenses = await Expense.find({
      date: { $gte: start, $lte: end },
      status: 'paid'
    });
    
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Get other income for the period
    const otherIncomes = await Income.find({
      date: { $gte: start, $lte: end },
      status: 'received',
      category: { $ne: 'Sales' } // Exclude sales income as it's already counted
    });
    
    const totalOtherIncome = otherIncomes.reduce((sum, inc) => sum + inc.amount, 0);
    
    // Calculate net profit
    const netProfit = grossProfit - totalExpenses + totalOtherIncome;
    
    // Get opening and closing stock values
    const openingStock = await getStockValue(start);
    const closingStock = await getStockValue(end);
    
    // Expense breakdown by category
    const expensesByCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Income breakdown by category
    const incomesByCategory = otherIncomes.reduce((acc, inc) => {
      acc[inc.category] = (acc[inc.category] || 0) + inc.amount;
      return acc;
    }, {} as Record<string, number>);
    

    
    return {
      summary: {
        totalSales,
        totalCOGS,
        grossProfit,
        grossProfitMargin: totalSales > 0 ? (grossProfit / totalSales) * 100 : 0,
        totalExpenses,
        totalOtherIncome,
        netProfit,
        netProfitMargin: totalSales > 0 ? (netProfit / totalSales) * 100 : 0,
        period: { start: start.toISOString(), end: end.toISOString() }
      },
      inventory: {
        openingStock: {
          byPurchasePrice: openingStock.purchaseValue,
          bySalePrice: openingStock.saleValue
        },
        closingStock: {
          byPurchasePrice: closingStock.purchaseValue,
          bySalePrice: closingStock.saleValue
        }
      },
      breakdown: {
        expenses: expensesByCategory,
        otherIncome: incomesByCategory
      },
      transactions: {
        salesCount: sales.length,
        expensesCount: expenses.length,
        incomesCount: otherIncomes.length
      }
    };
  } catch (error) {
    console.error('Error generating profit-loss report:', error);
    throw new Error('Failed to generate profit-loss report');
  }
}

async function getStockValue(date: Date) {
  try {
    // Get all product batches that existed on or before the given date
    const batches = await ProductBatch.find({
      createdAt: { $lte: date },
      isDepleted: false
    }).populate('product', 'name');
    
    let purchaseValue = 0;
    let saleValue = 0;
    
    for (const batch of batches) {
      // Calculate remaining quantity at the given date
      // This is simplified - in a real system, you'd need to track stock movements
      const remainingQty = batch.remaining || 0;
      
      purchaseValue += remainingQty * (batch.unitCost || 0);
      saleValue += remainingQty * (batch.sellingPrice || 0);
    }
    
    return {
      purchaseValue,
      saleValue,
      totalItems: batches.length
    };
  } catch (error) {
    console.error('Error calculating stock value:', error);
    return { purchaseValue: 0, saleValue: 0, totalItems: 0 };
  }
}

export async function getProfitTrends(months: number = 12) {
  try {
    await connectToDB();
    
    const trends = [];
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
      
      const monthData = await getProfitLossReport(monthStart, monthEnd);
      
      trends.push({
        month: monthStart.toISOString().slice(0, 7),
        sales: monthData.summary.totalSales,
        grossProfit: monthData.summary.grossProfit,
        netProfit: monthData.summary.netProfit,
        expenses: monthData.summary.totalExpenses
      });
    }
    
    return trends;
  } catch (error) {
    throw new Error('Failed to fetch profit trends');
  }
}

export async function getTopProfitableProducts(startDate?: Date, endDate?: Date, limit: number = 10) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    const sales = await Sale.find({
      saleDate: { $gte: start, $lte: end },
      isVoided: { $ne: true }
    }).populate('items.product', 'name sku');
    
    const productProfits = new Map();
    
    for (const sale of sales) {
      for (const item of sale.items) {
        const productId = item.product._id.toString();
        const productName = item.product.name;
        
        // Calculate profit for this item
        const revenue = item.total || 0;
        
        // Get cost from batches (simplified)
        const batches = await ProductBatch.find({
          product: item.product._id,
          createdAt: { $lte: sale.saleDate }
        }).sort({ createdAt: 1 }).limit(1);
        
        const cost = batches.length > 0 ? 
          item.quantity * (batches[0].unitCost || 0) : 0;
        
        const profit = revenue - cost;
        
        if (productProfits.has(productId)) {
          const existing = productProfits.get(productId);
          existing.totalRevenue += revenue;
          existing.totalCost += cost;
          existing.totalProfit += profit;
          existing.quantitySold += item.quantity;
        } else {
          productProfits.set(productId, {
            productId,
            productName,
            totalRevenue: revenue,
            totalCost: cost,
            totalProfit: profit,
            quantitySold: item.quantity,
            profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0
          });
        }
      }
    }
    
    return Array.from(productProfits.values())
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, limit);
  } catch (error) {
    throw new Error('Failed to fetch top profitable products');
  }
}