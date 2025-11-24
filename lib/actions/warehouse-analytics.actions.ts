'use server'

import { connectToDB } from '../mongoose';
import ProductBatch from '@/lib/models/product_batch.models';
import Sale from '@/lib/models/sales.models';

export async function getInventoryTurnover(warehouseId: string, days: number = 30) {
  try {
    await connectToDB();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get sales data for the period
    const sales = await Sale.find({
      createdAt: { $gte: startDate },
      'items.warehouseId': warehouseId
    }).populate('items.product', 'name category');
    
    // Calculate turnover by product
    const turnoverMap = new Map();
    
    sales.forEach(sale => {
      sale.items.forEach((item: any) => {
        if (item.warehouseId?.toString() === warehouseId) {
          const productId = item.product._id.toString();
          if (turnoverMap.has(productId)) {
            const existing = turnoverMap.get(productId);
            existing.soldQuantity += item.quantity;
            existing.revenue += item.price * item.quantity;
          } else {
            turnoverMap.set(productId, {
              product: item.product,
              soldQuantity: item.quantity,
              revenue: item.price * item.quantity,
              turnoverRate: 0
            });
          }
        }
      });
    });
    
    // Get current stock levels and calculate turnover rates
    const batches = await ProductBatch.find({ 
      warehouseId, 
      isDepleted: false,
      remaining: { $gt: 0 }
    }).populate('product', 'name category');
    
    const stockMap = new Map();
    batches.forEach(batch => {
      const productId = batch.product._id.toString();
      if (stockMap.has(productId)) {
        stockMap.get(productId).currentStock += batch.remaining;
      } else {
        stockMap.set(productId, {
          product: batch.product,
          currentStock: batch.remaining
        });
      }
    });
    
    // Combine data and calculate turnover rates
    const turnoverData = [];
    for (const [productId, turnover] of turnoverMap) {
      const stock = stockMap.get(productId);
      if (stock) {
        const turnoverRate = turnover.soldQuantity / (stock.currentStock + turnover.soldQuantity) * 100;
        turnoverData.push({
          ...turnover,
          currentStock: stock.currentStock,
          turnoverRate: Math.round(turnoverRate * 100) / 100
        });
      }
    }
    
    return JSON.parse(JSON.stringify(turnoverData.sort((a, b) => b.turnoverRate - a.turnoverRate)));
  } catch (error) {
    throw new Error('Failed to fetch inventory turnover data');
  }
}

export async function getProfitabilityAnalysis(warehouseId: string, days: number = 30) {
  try {
    await connectToDB();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const batches = await ProductBatch.find({ 
      warehouseId,
      createdAt: { $gte: startDate }
    }).populate('product', 'name category');
    
    const profitData = batches.map(batch => {
      const totalCost = (batch.originalUnitCost || batch.unitCost) + (batch.shippingCostPerUnit || 0);
      const profitMargin = ((batch.sellingPrice - totalCost) / totalCost * 100);
      const potentialProfit = (batch.sellingPrice - totalCost) * batch.remaining;
      
      return {
        product: batch.product,
        batchNumber: batch.batchNumber,
        quantity: batch.remaining,
        unitCost: totalCost,
        sellingPrice: batch.sellingPrice,
        profitMargin: Math.round(profitMargin * 100) / 100,
        potentialProfit: Math.round(potentialProfit * 100) / 100,
        category: batch.product.category
      };
    });
    
    return JSON.parse(JSON.stringify(profitData.sort((a, b) => b.profitMargin - a.profitMargin)));
  } catch (error) {
    throw new Error('Failed to fetch profitability analysis');
  }
}

export async function getSlowMovingStock(warehouseId: string, days: number = 60) {
  try {
    await connectToDB();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Get batches older than cutoff date with no recent sales
    const slowBatches = await ProductBatch.find({
      warehouseId,
      createdAt: { $lte: cutoffDate },
      isDepleted: false,
      remaining: { $gt: 0 }
    }).populate('product', 'name category sku');
    
    const slowMovingData = slowBatches.map(batch => {
      const daysInStock = Math.floor((Date.now() - new Date(batch.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const totalValue = batch.remaining * batch.sellingPrice;
      
      return {
        product: batch.product,
        batchNumber: batch.batchNumber,
        quantity: batch.remaining,
        daysInStock,
        sellingPrice: batch.sellingPrice,
        totalValue: Math.round(totalValue * 100) / 100,
        expiryDate: batch.expiryDate
      };
    });
    
    return JSON.parse(JSON.stringify(slowMovingData.sort((a, b) => b.daysInStock - a.daysInStock)));
  } catch (error) {
    throw new Error('Failed to fetch slow moving stock');
  }
}

export async function getExpiryAlerts(warehouseId: string, daysAhead: number = 30) {
  try {
    await connectToDB();
    
    const alertDate = new Date();
    alertDate.setDate(alertDate.getDate() + daysAhead);
    
    const expiringBatches = await ProductBatch.find({
      warehouseId,
      isDepleted: false,
      remaining: { $gt: 0 },
      expiryDate: { $lte: alertDate, $gte: new Date() }
    }).populate('product', 'name category sku');
    
    const expiryData = expiringBatches.map(batch => {
      const daysToExpiry = Math.floor((new Date(batch.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const totalValue = batch.remaining * batch.sellingPrice;
      
      return {
        product: batch.product,
        batchNumber: batch.batchNumber,
        quantity: batch.remaining,
        expiryDate: batch.expiryDate,
        daysToExpiry,
        sellingPrice: batch.sellingPrice,
        totalValue: Math.round(totalValue * 100) / 100,
        urgency: daysToExpiry <= 7 ? 'critical' : daysToExpiry <= 14 ? 'warning' : 'info'
      };
    });
    
    return JSON.parse(JSON.stringify(expiryData.sort((a, b) => a.daysToExpiry - b.daysToExpiry)));
  } catch (error) {
    throw new Error('Failed to fetch expiry alerts');
  }
}

export async function getWarehouseAnalyticsSummary(warehouseId: string) {
  try {
    await connectToDB();
    
    const [turnover, profitability, slowMoving, expiring] = await Promise.all([
      getInventoryTurnover(warehouseId, 30),
      getProfitabilityAnalysis(warehouseId, 30),
      getSlowMovingStock(warehouseId, 60),
      getExpiryAlerts(warehouseId, 30)
    ]);
    
    // Calculate summary metrics
    const totalProducts = new Set([
      ...turnover.map(t => t.product._id),
      ...profitability.map(p => p.product._id)
    ]).size;
    
    const avgTurnoverRate = turnover.length > 0 
      ? turnover.reduce((sum, t) => sum + t.turnoverRate, 0) / turnover.length 
      : 0;
    
    const avgProfitMargin = profitability.length > 0
      ? profitability.reduce((sum, p) => sum + p.profitMargin, 0) / profitability.length
      : 0;
    
    const totalSlowMovingValue = slowMoving.reduce((sum, s) => sum + s.totalValue, 0);
    const criticalExpiryCount = expiring.filter(e => e.urgency === 'critical').length;
    
    return {
      summary: {
        totalProducts,
        avgTurnoverRate: Math.round(avgTurnoverRate * 100) / 100,
        avgProfitMargin: Math.round(avgProfitMargin * 100) / 100,
        slowMovingValue: Math.round(totalSlowMovingValue * 100) / 100,
        criticalExpiryCount
      },
      topPerformers: turnover.slice(0, 5),
      lowPerformers: profitability.filter(p => p.profitMargin < 10).slice(0, 5),
      urgentActions: {
        slowMoving: slowMoving.slice(0, 5),
        expiring: expiring.filter(e => e.urgency === 'critical').slice(0, 5)
      }
    };
  } catch (error) {
    throw new Error('Failed to fetch warehouse analytics summary');
  }
}