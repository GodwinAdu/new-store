'use server'

import { connectToDB } from '../mongoose';
import { Warehouse } from '@/lib/models/Warehouse';
import ProductBatch from '@/lib/models/product_batch.models';
import Product from '@/lib/models/product.models';
import Unit from '../models/unit.models';
import { selectRowsFn } from '@tanstack/react-table';

export async function fetchAllWarehouses() {
  try {
    await connectToDB();
    const warehouses = await Warehouse.find().sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(warehouses));
  } catch (error) {
    throw new Error('Failed to fetch warehouses');
  }
}

export async function getWarehouseStock(warehouseId: string) {
  try {
    await connectToDB();
    
    const batches = await ProductBatch.find({ 
      warehouseId, 
      isDepleted: false,
      remaining: { $gt: 0 }
    }).populate('product', 'name sku category');
    
    // Group by product and sum quantities
    const stockMap = new Map();
    
    batches.forEach(batch => {
      const productId = batch.product._id.toString();
      if (stockMap.has(productId)) {
        const existing = stockMap.get(productId);
        existing.totalQuantity += batch.remaining;
        existing.batches.push(batch);
      } else {
        stockMap.set(productId, {
          product: batch.product,
          totalQuantity: batch.remaining,
          averageSellingPrice: batch.sellingPrice,
          batches: [batch]
        });
      }
    });
    
    return JSON.parse(JSON.stringify(Array.from(stockMap.values())));
  } catch (error) {
    throw new Error('Failed to fetch warehouse stock');
  }
}

export async function getLowStockItems(warehouseId: string, threshold: number = 10) {
  try {
    await connectToDB();
    
    const batches = await ProductBatch.find({ 
      warehouseId, 
      isDepleted: false,
      remaining: { $lte: threshold, $gt: 0 }
    }).populate('product', 'name sku category');
    
    return JSON.parse(JSON.stringify(batches));
  } catch (error) {
    throw new Error('Failed to fetch low stock items');
  }
}

export async function adjustStock(warehouseId: string, productId: string, adjustment: number, reason: string) {
  try {
    await connectToDB();
    
    if (adjustment > 0) {
      // Adding stock - create new batch
      await ProductBatch.create({
        product: productId,
        warehouseId,
        quantity: adjustment,
        remaining: adjustment,
        unitCost: 0,
        sellingPrice: 0,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isDepleted: false,
        notes: `Stock adjustment: ${reason}`
      });
    } else {
      // Reducing stock - update existing batches
      const absAdjustment = Math.abs(adjustment);
      let remainingToReduce = absAdjustment;
      
      const batches = await ProductBatch.find({
        warehouseId,
        product: productId,
        isDepleted: false,
        remaining: { $gt: 0 }
      }).sort({ createdAt: 1 }); // FIFO
      
      for (const batch of batches) {
        if (remainingToReduce <= 0) break;
        
        const reduceFromBatch = Math.min(batch.remaining, remainingToReduce);
        batch.remaining -= reduceFromBatch;
        
        if (batch.remaining <= 0) {
          batch.isDepleted = true;
        }
        
        await batch.save();
        remainingToReduce -= reduceFromBatch;
      }
    }
    
    // Update product total stock
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: adjustment }
    });
    
    return { success: true };
  } catch (error) {
    throw new Error('Failed to adjust stock');
  }
}

export async function transferStock(
  fromWarehouseId: string, 
  toWarehouseId: string, 
  productId: string, 
  quantity: number
) {
  try {
    await connectToDB();
    
    // Find available batches in source warehouse
    const sourceBatches = await ProductBatch.find({
      warehouseId: fromWarehouseId,
      product: productId,
      isDepleted: false,
      remaining: { $gt: 0 }
    }).sort({ createdAt: 1 }); // FIFO
    
    let remainingToTransfer = quantity;
    const transferredBatches = [];
    
    for (const batch of sourceBatches) {
      if (remainingToTransfer <= 0) break;
      
      const transferFromBatch = Math.min(batch.remaining, remainingToTransfer);
      
      // Create new batch in destination warehouse
      const newBatch = await ProductBatch.create({
        product: productId,
        warehouseId: toWarehouseId,
        quantity: transferFromBatch,
        remaining: transferFromBatch,
        unitCost: batch.unitCost,
        sellingPrice: batch.sellingPrice,
        expiryDate: batch.expiryDate,
        isDepleted: false,
        notes: `Transferred from warehouse ${fromWarehouseId}`
      });
      
      // Reduce from source batch
      batch.remaining -= transferFromBatch;
      if (batch.remaining <= 0) {
        batch.isDepleted = true;
      }
      await batch.save();
      
      transferredBatches.push(newBatch);
      remainingToTransfer -= transferFromBatch;
    }
    
    if (remainingToTransfer > 0) {
      throw new Error('Insufficient stock for transfer');
    }
    
    return { success: true, transferredBatches };
  } catch (error) {
    throw new Error(`Failed to transfer stock: ${error}`);
  }
}

export async function getWarehouseProducts(warehouseId: string) {
  try {
    await connectToDB();
    
    // Get unique products that have stock in this warehouse
    const batches = await ProductBatch.find({ 
      warehouseId, 
      isDepleted: false,
      remaining: { $gt: 0 }
    }).populate({
      path: 'product',
      select: 'name sku price unit',
      populate: {
        path: 'unit',
        model: Unit
      }
    });
    
    // Get unique products with their latest batch info for pricing
    const productMap = new Map();
    
    batches.forEach(batch => {
      if (!batch.product) return;
      
      const productId = batch.product._id.toString();
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          _id: batch.product._id,
          name: batch.product.name,
          sku: batch.product.sku,
          price: batch.sellingPrice || 25,
          originalUnitCost: batch.originalUnitCost,
          shippingCostPerUnit: batch.shippingCostPerUnit,
          totalStock: batch.remaining,
          units: batch.product.unit || [],
        });
      } else {
        // Add to total stock if product already exists
        const existing = productMap.get(productId);
        existing.totalStock += batch.remaining;
      }
    });

    console.log('Product Map:', JSON.stringify(Array.from(productMap.values()), null, 2));  
    
    return JSON.parse(JSON.stringify(Array.from(productMap.values())));
  } catch (error) {
    console.error('Error in getWarehouseProducts:', error);
    return [];
  }
}

export async function updateBatchPrices(batchUpdates: Array<{
  batchId: string;
  newSellingPrice: number;
  expiryDate?: Date;
}>) {
  try {
    await connectToDB();
    
    const updatePromises = batchUpdates.map(update => {
      const updateData: any = {
        sellingPrice: update.newSellingPrice,
        modifiedBy: null, // You can pass the current user ID here
        mod_flag: true
      };
      
      if (update.expiryDate !== undefined) {
        updateData.expiryDate = update.expiryDate;
      }
      
      return ProductBatch.findByIdAndUpdate(
        update.batchId,
        updateData,
        { new: true }
      );
    });
    
    const updatedBatches = await Promise.all(updatePromises);
    
    return JSON.parse(JSON.stringify(updatedBatches));
  } catch (error) {
    throw new Error('Failed to update batch prices');
  }
}

export async function getWarehouseStats(warehouseId: string) {
  try {
    await connectToDB();
    
    const batches = await ProductBatch.find({ warehouseId });
    const activeBatches = batches.filter(b => !b.isDepleted && b.remaining > 0);
    
    const totalProducts = new Set(activeBatches.map(b => b.product.toString())).size;
    const totalQuantity = activeBatches.reduce((sum, b) => sum + b.remaining, 0);
    const totalValue = activeBatches.reduce((sum, b) => sum + (b.remaining * b.sellingPrice), 0);
    const lowStockCount = activeBatches.filter(b => b.remaining <= 10).length;
    
    return {
      totalProducts,
      totalQuantity,
      totalValue,
      lowStockCount,
      totalBatches: activeBatches.length
    };
  } catch (error) {
    throw new Error('Failed to fetch warehouse stats');
  }
}

export async function deleteProductFromWarehouse(warehouseId: string, productId: string) {
  try {
    await connectToDB();
    
    // Delete all batches for this product in the warehouse
    const result = await ProductBatch.deleteMany({
      warehouseId,
      product: productId
    });
    
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    throw new Error('Failed to delete product from warehouse');
  }
}