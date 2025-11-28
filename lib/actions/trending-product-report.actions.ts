'use server'

import { connectToDB } from '../mongoose';
import Sale from '@/lib/models/sales.models';
import Product from '@/lib/models/product.models';

export async function getTrendingProductReport(startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const end = endDate || new Date();
    const start = startDate || new Date(new Date().setDate(end.getDate() - 30));
    
    // Calculate previous period for comparison
    const periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const previousStart = new Date(start.getTime() - (periodDays * 24 * 60 * 60 * 1000));
    const previousEnd = new Date(start.getTime() - 1);
    
    // Get current period sales
    const currentSales = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: start, $lte: end },
          isVoided: { $ne: true }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          averagePrice: { $avg: '$items.price' },
          salesCount: { $sum: 1 }
        }
      }
    ]);
    
    // Get previous period sales
    const previousSales = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: previousStart, $lte: previousEnd },
          isVoided: { $ne: true }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      }
    ]);
    
    // Create maps for easy lookup
    const currentSalesMap = new Map();
    currentSales.forEach(sale => {
      currentSalesMap.set(sale._id.toString(), sale);
    });
    
    const previousSalesMap = new Map();
    previousSales.forEach(sale => {
      previousSalesMap.set(sale._id.toString(), sale);
    });
    
    // Get all unique product IDs
    const allProductIds = new Set([
      ...currentSales.map(s => s._id.toString()),
      ...previousSales.map(s => s._id.toString())
    ]);
    
    // Get product details
    const products = await Product.find({
      _id: { $in: Array.from(allProductIds) }
    }).select('name category');
    
    const productMap = new Map();
    products.forEach(product => {
      productMap.set(product._id.toString(), product);
    });
    
    // Calculate trending metrics
    const trendingProducts = [];
    let totalRevenue = 0;
    let trendingUp = 0;
    let trendingDown = 0;
    let stable = 0;
    
    for (const productId of allProductIds) {
      const current = currentSalesMap.get(productId) || { totalQuantity: 0, totalRevenue: 0, averagePrice: 0 };
      const previous = previousSalesMap.get(productId) || { totalQuantity: 0, totalRevenue: 0 };
      const product = productMap.get(productId);
      
      if (!product) continue;
      
      const growthRate = previous.totalQuantity > 0 
        ? ((current.totalQuantity - previous.totalQuantity) / previous.totalQuantity) * 100
        : current.totalQuantity > 0 ? 100 : 0;
      
      const salesVelocity = current.totalQuantity / periodDays;
      
      let trendDirection: 'up' | 'down' | 'stable' = 'stable';
      if (Math.abs(growthRate) < 5) {
        trendDirection = 'stable';
        stable++;
      } else if (growthRate > 0) {
        trendDirection = 'up';
        trendingUp++;
      } else {
        trendDirection = 'down';
        trendingDown++;
      }
      
      totalRevenue += current.totalRevenue;
      
      trendingProducts.push({
        productId,
        productName: product.name,
        category: product.category || 'Uncategorized',
        currentPeriodSales: current.totalQuantity,
        previousPeriodSales: previous.totalQuantity,
        growthRate,
        totalRevenue: current.totalRevenue,
        averagePrice: current.averagePrice || 0,
        trendDirection,
        salesVelocity,
        rank: 0 // Will be set after sorting
      });
    }
    
    // Sort by sales velocity and assign ranks
    trendingProducts.sort((a, b) => b.salesVelocity - a.salesVelocity);
    trendingProducts.forEach((product, index) => {
      product.rank = index + 1;
    });
    
    // Calculate category trends
    const categoryMap = new Map();
    trendingProducts.forEach(product => {
      const category = product.category;
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category);
        existing.totalSales += product.currentPeriodSales;
        existing.totalRevenue += product.totalRevenue;
        existing.productCount += 1;
        existing.totalGrowth += product.growthRate;
      } else {
        categoryMap.set(category, {
          category,
          totalSales: product.currentPeriodSales,
          totalRevenue: product.totalRevenue,
          productCount: 1,
          totalGrowth: product.growthRate
        });
      }
    });
    
    const categoryTrends = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      growthRate: cat.productCount > 0 ? cat.totalGrowth / cat.productCount : 0
    })).sort((a, b) => b.totalSales - a.totalSales);
    
    // Generate daily sales trend
    const salesTrend = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const daySales = await Sale.aggregate([
        {
          $match: {
            saleDate: { $gte: dayStart, $lte: dayEnd },
            isVoided: { $ne: true }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: null,
            sales: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        }
      ]);
      
      salesTrend.push({
        date: currentDate.toISOString().split('T')[0],
        sales: daySales[0]?.sales || 0,
        revenue: daySales[0]?.revenue || 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      summary: {
        totalProducts: trendingProducts.length,
        trendingUp,
        trendingDown,
        stable,
        totalRevenue,
        period: { start: start.toISOString(), end: end.toISOString() }
      },
      products: trendingProducts,
      categoryTrends,
      salesTrend
    };
  } catch (error) {
    console.error('Error generating trending product report:', error);
    throw new Error('Failed to generate trending product report');
  }
}

export async function getProductTrendHistory(productId: string, days: number = 30) {
  try {
    await connectToDB();
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const trendHistory = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const daySales = await Sale.aggregate([
        {
          $match: {
            saleDate: { $gte: dayStart, $lte: dayEnd },
            isVoided: { $ne: true },
            'items.product': productId
          }
        },
        { $unwind: '$items' },
        {
          $match: {
            'items.product': productId
          }
        },
        {
          $group: {
            _id: null,
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        }
      ]);
      
      trendHistory.push({
        date: currentDate.toISOString().split('T')[0],
        quantity: daySales[0]?.quantity || 0,
        revenue: daySales[0]?.revenue || 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return trendHistory;
  } catch (error) {
    throw new Error('Failed to fetch product trend history');
  }
}