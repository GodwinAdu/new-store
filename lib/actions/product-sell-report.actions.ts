'use server'

import { connectToDB } from '../mongoose';
import Sale from '@/lib/models/sales.models';
import ProductBatch from '@/lib/models/product_batch.models';

export async function getProductSellReport(startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    // Get sales data for the period
    const sales = await Sale.find({
      saleDate: { $gte: start, $lte: end },
      isVoided: { $ne: true }
    }).populate('items.product', 'name sku category');
    
    // Process product sales data
    const productSalesMap = new Map();
    let totalQuantitySold = 0;
    let totalRevenue = 0;
    
    for (const sale of sales) {
      for (const item of sale.items) {
        if (!item.product) continue;
        
        const productId = item.product._id.toString();
        const productName = item.product.name;
        const productSku = item.product.sku || '';
        const productCategory = item.product.category || 'Uncategorized';
        const quantity = item.quantity;
        const revenue = item.total || 0;
        const price = quantity > 0 ? revenue / quantity : 0;
        
        totalQuantitySold += quantity;
        totalRevenue += revenue;
        
        if (productSalesMap.has(productId)) {
          const existing = productSalesMap.get(productId);
          existing.quantitySold += quantity;
          existing.revenue += revenue;
          existing.totalPrice += revenue;
          existing.lastSold = sale.saleDate > existing.lastSold ? sale.saleDate : existing.lastSold;
        } else {
          productSalesMap.set(productId, {
            _id: productId,
            name: productName,
            sku: productSku,
            category: productCategory,
            quantitySold: quantity,
            revenue,
            totalPrice: revenue,
            lastSold: sale.saleDate
          });
        }
      }
    }
    
    // Calculate profit margins using product batches
    const products = [];
    for (const [productId, productData] of productSalesMap) {
      // Get cost from product batches
      const batches = await ProductBatch.find({
        product: productId
      }).sort({ createdAt: 1 });
      
      const avgCost = batches.length > 0
        ? batches.reduce((sum, batch) => sum + (batch.unitCost || 0), 0) / batches.length
        : 0;
      
      const avgPrice = productData.quantitySold > 0 
        ? productData.revenue / productData.quantitySold 
        : 0;
      
      const profitMargin = avgPrice > 0 
        ? ((avgPrice - avgCost) / avgPrice) * 100 
        : 0;
      
      products.push({
        ...productData,
        avgPrice,
        profitMargin
      });
    }
    
    // Sort products by revenue
    products.sort((a, b) => b.revenue - a.revenue);
    
    // Category performance
    const categoryMap = new Map();
    products.forEach(product => {
      const category = product.category;
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category);
        existing.quantitySold += product.quantitySold;
        existing.revenue += product.revenue;
        existing.productCount += 1;
      } else {
        categoryMap.set(category, {
          category,
          quantitySold: product.quantitySold,
          revenue: product.revenue,
          productCount: 1
        });
      }
    });
    
    const categoryPerformance = Array.from(categoryMap.values())
      .sort((a, b) => b.revenue - a.revenue);
    
    // Top performers
    const topPerformers = products
      .slice(0, 10)
      .map(product => ({
        name: product.name,
        quantitySold: product.quantitySold,
        revenue: product.revenue
      }));
    
    // Calculate summary
    const totalProducts = products.length;
    const avgSellingPrice = totalQuantitySold > 0 ? totalRevenue / totalQuantitySold : 0;
    
    return {
      summary: {
        totalProducts,
        totalQuantitySold,
        totalRevenue,
        avgSellingPrice,
        period: { start: start.toISOString(), end: end.toISOString() }
      },
      products: products.map(product => ({
        ...product,
        lastSold: product.lastSold.toISOString()
      })),
      categoryPerformance,
      topPerformers
    };
  } catch (error) {
    console.error('Error generating product sell report:', error);
    throw new Error('Failed to generate product sell report');
  }
}

export async function getProductSalesHistory(productId: string, startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    const sales = await Sale.find({
      saleDate: { $gte: start, $lte: end },
      'items.product': productId,
      isVoided: { $ne: true }
    }).populate('items.product', 'name sku');
    
    const salesHistory = [];
    let totalQuantity = 0;
    let totalRevenue = 0;
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (item.product._id.toString() === productId) {
          salesHistory.push({
            saleId: sale._id,
            date: sale.saleDate,
            quantity: item.quantity,
            price: item.price || 0,
            total: item.total || 0,
            paymentMethod: sale.paymentMethod
          });
          totalQuantity += item.quantity;
          totalRevenue += item.total || 0;
        }
      });
    });
    
    return {
      productId,
      totalQuantity,
      totalRevenue,
      avgPrice: totalQuantity > 0 ? totalRevenue / totalQuantity : 0,
      salesHistory: salesHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };
  } catch (error) {
    throw new Error('Failed to fetch product sales history');
  }
}