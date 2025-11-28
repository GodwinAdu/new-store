'use server'

import { connectToDB } from '../mongoose';
import ProductBatch from '@/lib/models/product_batch.models';
import Product from '@/lib/models/product.models';

export async function getProductPurchaseReport(startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    // Get product batches (purchases) for the period
    const batches = await ProductBatch.find({
      createdAt: { $gte: start, $lte: end }
    }).populate('product', 'name sku category');
    
    // Process product purchase data
    const productPurchaseMap = new Map();
    let totalQuantityPurchased = 0;
    let totalCost = 0;
    
    for (const batch of batches) {
      if (!batch.product) continue;
      
      const productId = batch.product._id.toString();
      const productName = batch.product.name;
      const productSku = batch.product.sku || '';
      const productCategory = batch.product.category || 'Uncategorized';
      const quantity = batch.quantity || 0;
      const cost = (batch.unitCost || 0) * quantity;
      
      totalQuantityPurchased += quantity;
      totalCost += cost;
      
      if (productPurchaseMap.has(productId)) {
        const existing = productPurchaseMap.get(productId);
        existing.quantityPurchased += quantity;
        existing.totalCost += cost;
        existing.lastPurchased = batch.createdAt > existing.lastPurchased ? batch.createdAt : existing.lastPurchased;
        existing.suppliers.add(batch.supplier || 'Unknown');
      } else {
        productPurchaseMap.set(productId, {
          _id: productId,
          name: productName,
          sku: productSku,
          category: productCategory,
          quantityPurchased: quantity,
          totalCost: cost,
          lastPurchased: batch.createdAt,
          suppliers: new Set([batch.supplier || 'Unknown'])
        });
      }
    }
    
    // Format products data
    const products = Array.from(productPurchaseMap.values()).map(product => ({
      ...product,
      avgCost: product.quantityPurchased > 0 ? product.totalCost / product.quantityPurchased : 0,
      supplier: Array.from(product.suppliers).join(', '),
      suppliers: undefined // Remove the Set object
    }));
    
    // Sort products by total cost
    products.sort((a, b) => b.totalCost - a.totalCost);
    
    // Category breakdown
    const categoryMap = new Map();
    products.forEach(product => {
      const category = product.category;
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category);
        existing.quantityPurchased += product.quantityPurchased;
        existing.totalCost += product.totalCost;
        existing.productCount += 1;
      } else {
        categoryMap.set(category, {
          category,
          quantityPurchased: product.quantityPurchased,
          totalCost: product.totalCost,
          productCount: 1
        });
      }
    });
    
    const categoryBreakdown = Array.from(categoryMap.values())
      .sort((a, b) => b.totalCost - a.totalCost);
    
    // Supplier breakdown
    const supplierMap = new Map();
    batches.forEach(batch => {
      const supplier = batch.supplier || 'Unknown';
      const cost = (batch.unitCost || 0) * (batch.quantity || 0);
      
      if (supplierMap.has(supplier)) {
        const existing = supplierMap.get(supplier);
        existing.totalCost += cost;
        existing.productCount += 1;
      } else {
        supplierMap.set(supplier, {
          supplier,
          totalCost: cost,
          productCount: 1
        });
      }
    });
    
    const supplierBreakdown = Array.from(supplierMap.values())
      .sort((a, b) => b.totalCost - a.totalCost);
    
    // Calculate summary
    const totalProducts = products.length;
    const avgPurchasePrice = totalQuantityPurchased > 0 ? totalCost / totalQuantityPurchased : 0;
    
    return {
      summary: {
        totalProducts,
        totalQuantityPurchased,
        totalCost,
        avgPurchasePrice,
        period: { start: start.toISOString(), end: end.toISOString() }
      },
      products: products.map(product => ({
        ...product,
        lastPurchased: product.lastPurchased.toISOString()
      })),
      categoryBreakdown,
      supplierBreakdown
    };
  } catch (error) {
    console.error('Error generating product purchase report:', error);
    throw new Error('Failed to generate product purchase report');
  }
}

export async function getProductPurchaseHistory(productId: string, startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    const batches = await ProductBatch.find({
      product: productId,
      createdAt: { $gte: start, $lte: end }
    }).populate('product', 'name sku').sort({ createdAt: -1 });
    
    let totalQuantity = 0;
    let totalCost = 0;
    
    const purchaseHistory = batches.map(batch => {
      const quantity = batch.quantity || 0;
      const cost = (batch.unitCost || 0) * quantity;
      
      totalQuantity += quantity;
      totalCost += cost;
      
      return {
        batchId: batch._id,
        date: batch.createdAt,
        quantity,
        unitCost: batch.unitCost || 0,
        totalCost: cost,
        supplier: batch.supplier || 'Unknown',
        expiryDate: batch.expiryDate,
        notes: batch.notes
      };
    });
    
    return {
      productId,
      totalQuantity,
      totalCost,
      avgCost: totalQuantity > 0 ? totalCost / totalQuantity : 0,
      purchaseHistory
    };
  } catch (error) {
    throw new Error('Failed to fetch product purchase history');
  }
}