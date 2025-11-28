'use server'

import { connectToDB } from '../mongoose';
import Purchase from '@/lib/models/purchase.models';
import Sale from '@/lib/models/sales.models';
import Product from '@/lib/models/product.models';

export async function getPurchaseSaleReport(startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    // Get purchase data
    const purchases = await Purchase.aggregate([
      {
        $match: {
          purchaseDate: { $gte: start, $lte: end },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalCost: { $sum: { $multiply: ['$items.quantity', '$items.unitCost'] } },
          averageCost: { $avg: '$items.unitCost' }
        }
      }
    ]);
    
    // Get sales data
    const sales = await Sale.aggregate([
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
          averagePrice: { $avg: '$items.price' }
        }
      }
    ]);
    
    // Create maps for easy lookup
    const purchaseMap = new Map();
    purchases.forEach(purchase => {
      purchaseMap.set(purchase._id.toString(), purchase);
    });
    
    const salesMap = new Map();
    sales.forEach(sale => {
      salesMap.set(sale._id.toString(), sale);
    });
    
    // Get all unique product IDs
    const allProductIds = new Set([
      ...purchases.map(p => p._id.toString()),
      ...sales.map(s => s._id.toString())
    ]);
    
    // Get product details
    const products = await Product.find({
      _id: { $in: Array.from(allProductIds) }
    }).select('name category');
    
    const productMap = new Map();
    products.forEach(product => {
      productMap.set(product._id.toString(), product);
    });
    
    // Calculate comparison metrics
    const productComparisons = [];
    let totalPurchaseCost = 0;
    let totalSaleRevenue = 0;
    
    for (const productId of allProductIds) {
      const purchase = purchaseMap.get(productId) || { totalQuantity: 0, totalCost: 0, averageCost: 0 };
      const sale = salesMap.get(productId) || { totalQuantity: 0, totalRevenue: 0, averagePrice: 0 };
      const product = productMap.get(productId);
      
      if (!product) continue;
      
      const grossProfit = sale.totalRevenue - purchase.totalCost;
      const profitMargin = sale.totalRevenue > 0 ? (grossProfit / sale.totalRevenue) * 100 : 0;
      const turnoverRate = purchase.totalQuantity > 0 ? sale.totalQuantity / purchase.totalQuantity : 0;
      
      totalPurchaseCost += purchase.totalCost;
      totalSaleRevenue += sale.totalRevenue;
      
      productComparisons.push({
        productId,
        productName: product.name,
        category: product.category || 'Uncategorized',
        totalPurchased: purchase.totalQuantity,
        totalSold: sale.totalQuantity,
        purchaseCost: purchase.totalCost,
        saleRevenue: sale.totalRevenue,
        grossProfit,
        profitMargin,
        turnoverRate
      });
    }
    
    // Sort by gross profit descending
    productComparisons.sort((a, b) => b.grossProfit - a.grossProfit);
    
    // Calculate overall metrics
    const grossProfit = totalSaleRevenue - totalPurchaseCost;
    const profitMargin = totalSaleRevenue > 0 ? (grossProfit / totalSaleRevenue) * 100 : 0;
    
    // Generate monthly trend
    const monthlyTrend = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const monthPurchases = await Purchase.aggregate([
        {
          $match: {
            purchaseDate: { $gte: monthStart, $lte: monthEnd },
            status: { $ne: 'cancelled' }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: null,
            totalCost: { $sum: { $multiply: ['$items.quantity', '$items.unitCost'] } }
          }
        }
      ]);
      
      const monthSales = await Sale.aggregate([
        {
          $match: {
            saleDate: { $gte: monthStart, $lte: monthEnd },
            isVoided: { $ne: true }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        }
      ]);
      
      const purchases = monthPurchases[0]?.totalCost || 0;
      const sales = monthSales[0]?.totalRevenue || 0;
      
      monthlyTrend.push({
        month: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        purchases,
        sales,
        profit: sales - purchases
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Calculate category analysis
    const categoryMap = new Map();
    productComparisons.forEach(product => {
      const category = product.category;
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category);
        existing.purchaseCost += product.purchaseCost;
        existing.saleRevenue += product.saleRevenue;
        existing.profit += product.grossProfit;
      } else {
        categoryMap.set(category, {
          category,
          purchaseCost: product.purchaseCost,
          saleRevenue: product.saleRevenue,
          profit: product.grossProfit
        });
      }
    });
    
    const categoryAnalysis = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      margin: cat.saleRevenue > 0 ? (cat.profit / cat.saleRevenue) * 100 : 0
    })).sort((a, b) => b.profit - a.profit);
    
    return {
      summary: {
        totalPurchaseCost,
        totalSaleRevenue,
        grossProfit,
        profitMargin,
        totalProducts: productComparisons.length,
        period: { start: start.toISOString(), end: end.toISOString() }
      },
      products: productComparisons,
      monthlyTrend,
      categoryAnalysis
    };
  } catch (error) {
    console.error('Error generating purchase-sale report:', error);
    throw new Error('Failed to generate purchase-sale report');
  }
}

export async function getProductProfitability(productId: string, startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    // Get purchase history
    const purchaseHistory = await Purchase.aggregate([
      {
        $match: {
          purchaseDate: { $gte: start, $lte: end },
          'items.product': productId,
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.product': productId
        }
      },
      {
        $project: {
          date: '$purchaseDate',
          quantity: '$items.quantity',
          unitCost: '$items.unitCost',
          totalCost: { $multiply: ['$items.quantity', '$items.unitCost'] }
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    // Get sales history
    const salesHistory = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: start, $lte: end },
          'items.product': productId,
          isVoided: { $ne: true }
        }
      },
      { $unwind: '$items' },
      {
        $match: {
          'items.product': productId
        }
      },
      {
        $project: {
          date: '$saleDate',
          quantity: '$items.quantity',
          price: '$items.price',
          totalRevenue: { $multiply: ['$items.quantity', '$items.price'] }
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    return {
      productId,
      purchaseHistory,
      salesHistory
    };
  } catch (error) {
    throw new Error('Failed to fetch product profitability data');
  }
}