'use server'

import { connectToDB } from '../mongoose';
import Product from '@/lib/models/product.models';
import ProductBatch from '@/lib/models/product_batch.models';
import Sale from '@/lib/models/sales.models';
import Category from '@/lib/models/category.models';

export async function getItemsReport(startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    // Get all products
    const products = await Product.find();
    
    // Get sales data for the period
    const sales = await Sale.find({
      saleDate: { $gte: start, $lte: end },
      isVoided: { $ne: true }
    }).populate('items.product', 'name sku');
    
    // Calculate sales data per product
    const productSalesMap = new Map();
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productId = item.product._id.toString();
        if (productSalesMap.has(productId)) {
          const existing = productSalesMap.get(productId);
          existing.salesCount += item.quantity;
          existing.revenue += item.total || 0;
        } else {
          productSalesMap.set(productId, {
            salesCount: item.quantity,
            revenue: item.total || 0
          });
        }
      });
    });
    
    // Get product batches for stock and cost information
    const batches = await ProductBatch.find({ isDepleted: false });
    const productBatchMap = new Map();
    
    batches.forEach(batch => {
      const productId = batch.product.toString();
      if (productBatchMap.has(productId)) {
        const existing = productBatchMap.get(productId);
        existing.totalStock += batch.remaining || 0;
        existing.totalCost += (batch.remaining || 0) * (batch.unitCost || 0);
        existing.totalValue += (batch.remaining || 0) * (batch.sellingPrice || 0);
        existing.batches.push(batch);
      } else {
        productBatchMap.set(productId, {
          totalStock: batch.remaining || 0,
          totalCost: (batch.remaining || 0) * (batch.unitCost || 0),
          totalValue: (batch.remaining || 0) * (batch.sellingPrice || 0),
          unitCost: batch.unitCost || 0,
          sellingPrice: batch.sellingPrice || 0,
          batches: [batch]
        });
      }
    });
    
    // Build items report data
    const items = products.map(product => {
      const productId = product._id.toString();
      const salesData = productSalesMap.get(productId) || { salesCount: 0, revenue: 0 };
      const batchData = productBatchMap.get(productId) || {
        totalStock: 0,
        totalCost: 0,
        totalValue: 0,
        unitCost: 0,
        sellingPrice: product.price || 0,
        batches: []
      };
      
      // Calculate average costs if multiple batches
      const avgUnitCost = batchData.batches.length > 0 
        ? batchData.totalCost / Math.max(batchData.totalStock, 1)
        : 0;
      
      const avgSellingPrice = batchData.batches.length > 0
        ? batchData.totalValue / Math.max(batchData.totalStock, 1)
        : product.price || 0;
      
      // Determine stock status
      let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'Out of Stock';
      if (batchData.totalStock > 10) {
        status = 'In Stock';
      } else if (batchData.totalStock > 0) {
        status = 'Low Stock';
      }
      
      const profitMargin = avgSellingPrice > 0 
        ? ((avgSellingPrice - avgUnitCost) / avgSellingPrice) * 100 
        : 0;
      
      return {
        _id: product._id,
        name: product.name,
        sku: product.sku || '',
        category: product.category || 'Uncategorized',
        totalStock: batchData.totalStock,
        totalValue: batchData.totalValue,
        unitCost: avgUnitCost,
        sellingPrice: avgSellingPrice,
        profitMargin,
        salesCount: salesData.salesCount,
        revenue: salesData.revenue,
        status
      };
    });
    
    // Calculate summary
    const totalProducts = items.length;
    const totalStock = items.reduce((sum, item) => sum + item.totalStock, 0);
    const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStockItems = items.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock').length;
    
    // Group by categories
    const categories = items.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = { count: 0, value: 0, stock: 0 };
      }
      acc[category].count++;
      acc[category].value += item.totalValue;
      acc[category].stock += item.totalStock;
      return acc;
    }, {} as Record<string, { count: number; value: number; stock: number }>);
    
    // Top selling items
    const topSelling = items
      .filter(item => item.salesCount > 0)
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 10)
      .map(item => ({
        name: item.name,
        salesCount: item.salesCount,
        revenue: item.revenue
      }));
    
    return {
      summary: {
        totalProducts,
        totalStock,
        totalValue,
        lowStockItems,
        period: { start: start.toISOString(), end: end.toISOString() }
      },
      items,
      categories,
      topSelling
    };
  } catch (error) {
    console.error('Error generating items report:', error);
    throw new Error('Failed to generate items report');
  }
}

export async function getProductPerformance(productId: string, startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Get sales data for this product
    const sales = await Sale.find({
      saleDate: { $gte: start, $lte: end },
      'items.product': productId,
      isVoided: { $ne: true }
    });
    
    let totalQuantitySold = 0;
    let totalRevenue = 0;
    const dailySales = new Map();
    
    sales.forEach(sale => {
      const saleDate = sale.saleDate.toISOString().split('T')[0];
      
      sale.items.forEach(item => {
        if (item.product.toString() === productId) {
          totalQuantitySold += item.quantity;
          totalRevenue += item.total || 0;
          
          if (dailySales.has(saleDate)) {
            const existing = dailySales.get(saleDate);
            existing.quantity += item.quantity;
            existing.revenue += item.total || 0;
          } else {
            dailySales.set(saleDate, {
              date: saleDate,
              quantity: item.quantity,
              revenue: item.total || 0
            });
          }
        }
      });
    });
    
    // Get current stock
    const batches = await ProductBatch.find({
      product: productId,
      isDepleted: false
    });
    
    const currentStock = batches.reduce((sum, batch) => sum + (batch.remaining || 0), 0);
    const avgCost = batches.length > 0
      ? batches.reduce((sum, batch) => sum + (batch.unitCost || 0), 0) / batches.length
      : 0;
    
    return {
      product: {
        _id: product._id,
        name: product.name,
        sku: product.sku,
        category: product.category || 'Uncategorized'
      },
      performance: {
        totalQuantitySold,
        totalRevenue,
        currentStock,
        avgCost,
        profitMargin: product.price > 0 ? ((product.price - avgCost) / product.price) * 100 : 0
      },
      dailySales: Array.from(dailySales.values()).sort((a, b) => a.date.localeCompare(b.date))
    };
  } catch (error) {
    throw new Error('Failed to fetch product performance');
  }
}