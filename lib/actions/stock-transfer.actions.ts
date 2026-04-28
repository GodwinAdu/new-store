'use server'

import StockTransfer from '@/lib/models/stock-transfer.models';
import Warehouse from '@/lib/models/warehouse.models';
import Product from '@/lib/models/product.models';
import ProductBatch from '@/lib/models/product_batch.models';
import { connectToDB } from '../mongoose';
import { currentUser } from '../helpers/session';

export async function createStockTransfer(transferData: {
  fromWarehouseId: string;
  toWarehouseId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitCost: number;
  }>;
  reason: string;
  notes?: string;
}) {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');

    await connectToDB();
    
    const transferNumber = `ST${Date.now().toString().slice(-6)}`;
    
    const transfer = await StockTransfer.create({
      transferNumber,
      fromWarehouse: transferData.fromWarehouseId,
      toWarehouse: transferData.toWarehouseId,
      items: transferData.items.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
      reason: transferData.reason,
      notes: transferData.notes,
      requestedBy: user._id,
      status: 'pending'
    });
    
    return JSON.parse(JSON.stringify(transfer));
  } catch (error) {
    throw new Error(`Failed to create stock transfer: ${error}`);
  }
}

export async function approveStockTransfer(transferId: string, approvedBy?: string) {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');

    await connectToDB();
    
    const transfer = await StockTransfer.findById(transferId)
      .populate('fromWarehouse', 'name location')
      .populate('toWarehouse', 'name location')
      .populate('items.product', 'name sku');
    
    if (!transfer) {
      throw new Error('Transfer not found');
    }

    if (transfer.status !== 'pending') {
      throw new Error(`Transfer cannot be approved — current status: ${transfer.status}`);
    }

    // Validate source warehouse has enough stock for each item
    for (const item of transfer.items) {
      const batches = await ProductBatch.find({
        product: item.product._id ?? item.product,
        warehouseId: transfer.fromWarehouse._id ?? transfer.fromWarehouse,
        isDepleted: false,
        remaining: { $gt: 0 }
      });
      const available = batches.reduce((sum, b) => sum + b.remaining, 0);
      if (available < item.quantity) {
        const productName = (item.product as any).name || item.product;
        throw new Error(`Insufficient stock for ${productName}. Available: ${available}, Requested: ${item.quantity}`);
      }
    }
    
    // Update transfer status to in-transit (shipment creation is optional/separate)
    const updatedTransfer = await StockTransfer.findByIdAndUpdate(
      transferId,
      {
        status: 'in-transit',
        approvedBy: user._id,
      },
      { new: true }
    );
    
    return JSON.parse(JSON.stringify(updatedTransfer));
  } catch (error) {
    throw new Error(`Failed to approve stock transfer: ${error}`);
  }
}

export async function completeStockTransfer(transferId: string) {
  try {
    await connectToDB();
    
    const transfer = await StockTransfer.findById(transferId)
      .populate('items.product')
      .populate('fromWarehouse', 'name')
      .populate('toWarehouse', 'name');
    
    if (!transfer) {
      throw new Error('Transfer not found');
    }

    if (transfer.status === 'completed') {
      throw new Error('Transfer already completed');
    }
    
    // Update stock levels using correct field name: warehouseId
    for (const item of transfer.items) {
      const productId = item.product._id ?? item.product;

      // --- Reduce stock from source warehouse (FIFO) ---
      let remainingToDeduct = item.quantity;
      const sourceBatches = await ProductBatch.find({
        product: productId,
        warehouseId: transfer.fromWarehouse._id ?? transfer.fromWarehouse,
        isDepleted: false,
        remaining: { $gt: 0 }
      }).sort({ createdAt: 1 }); // FIFO

      for (const batch of sourceBatches) {
        if (remainingToDeduct <= 0) break;
        const take = Math.min(batch.remaining, remainingToDeduct);
        batch.remaining -= take;
        remainingToDeduct -= take;
        if (batch.remaining <= 0) {
          batch.isDepleted = true;
          batch.depletedAt = new Date();
        }
        await batch.save();
      }

      if (remainingToDeduct > 0) {
        throw new Error(`Insufficient stock for product ${item.product.name || productId} in source warehouse`);
      }

      // --- Add stock to destination warehouse ---
      // Carry over cost from the most recent source batch for pricing
      const latestSourceBatch = sourceBatches[0];
      await ProductBatch.create({
        product: productId,
        warehouseId: transfer.toWarehouse._id ?? transfer.toWarehouse,
        quantity: item.quantity,
        remaining: item.quantity,
        unitCost: item.unitCost || latestSourceBatch?.unitCost || 0,
        sellingPrice: latestSourceBatch?.sellingPrice || item.unitCost || 0,
        expiryDate: latestSourceBatch?.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isDepleted: false,
        notes: `Transferred from ${transfer.fromWarehouse.name || transfer.fromWarehouse} via transfer ${transfer.transferNumber}`
      });
    }
    
    // Update transfer status
    const updatedTransfer = await StockTransfer.findByIdAndUpdate(
      transferId,
      {
        status: 'completed',
        completedDate: new Date()
      },
      { new: true }
    );
    
    return JSON.parse(JSON.stringify(updatedTransfer));
  } catch (error) {
    throw new Error(`Failed to complete stock transfer: ${error}`);
  }
}

export async function getAllStockTransfers(filters?: {
  status?: string;
  warehouseId?: string;
}) {
  try {
    await connectToDB();
    
    let query: any = {};
    
    if (filters?.status) {
      query.status = filters.status;
    }
    
    if (filters?.warehouseId) {
      query.$or = [
        { fromWarehouse: filters.warehouseId },
        { toWarehouse: filters.warehouseId }
      ];
    }
    
    const transfers = await StockTransfer.find(query)
      .populate('fromWarehouse', 'name location')
      .populate('toWarehouse', 'name location')
      .populate('items.product', 'name sku')
      .populate('requestedBy', 'name')
      .populate('approvedBy', 'name')
      .populate('shipment', 'trackingNumber status')
      .sort({ createdAt: -1 });
    
    return JSON.parse(JSON.stringify(transfers));
  } catch (error) {
    throw new Error('Failed to fetch stock transfers');
  }
}

export async function getWarehouses() {
  try {
    await connectToDB();
    
    const warehouses = await Warehouse.find({ isActive: true, del_flag: false })
      .select('name location type capacity')
      .sort({ name: 1 });
    
    return JSON.parse(JSON.stringify(warehouses));
  } catch (error) {
    throw new Error('Failed to fetch warehouses');
  }
}

export async function getWarehouseStock(warehouseId: string) {
  try {
    await connectToDB();
    
    const stock = await ProductBatch.find({ 
      warehouseId,          // correct field name
      isDepleted: false,
      remaining: { $gt: 0 }
    })
    .populate('product', 'name sku price category')
    .sort({ createdAt: -1 });
    
    // Group by product and sum remaining quantities
    const stockSummary = stock.reduce((acc: any, batch: any) => {
      const productId = batch.product._id.toString();
      if (!acc[productId]) {
        acc[productId] = {
          product: batch.product,
          totalQuantity: 0,
          batches: []
        };
      }
      acc[productId].totalQuantity += batch.remaining;
      acc[productId].batches.push(batch);
      return acc;
    }, {});
    
    return JSON.parse(JSON.stringify(Object.values(stockSummary)));
  } catch (error) {
    throw new Error('Failed to fetch warehouse stock');
  }
}