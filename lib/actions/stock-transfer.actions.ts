'use server'

import StockTransfer from '@/lib/models/stock-transfer.models';
import Warehouse from '@/lib/models/warehouse.models';
import Product from '@/lib/models/product.models';
import ProductBatch from '@/lib/models/product_batch.models';
import { createShipment } from './transport.actions';
import { connectToDB } from '../mongoose';

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
  requestedBy: string;
}) {
  try {
    await connectToDB();
    
    const transferNumber = `ST${Date.now().toString().slice(-6)}`;
    
    const transfer = await StockTransfer.create({
      transferNumber,
      fromWarehouse: transferData.fromWarehouseId,
      toWarehouse: transferData.toWarehouseId,
      items: transferData.items,
      reason: transferData.reason,
      notes: transferData.notes,
      requestedBy: transferData.requestedBy,
      status: 'pending'
    });
    
    return JSON.parse(JSON.stringify(transfer));
  } catch (error) {
    throw new Error('Failed to create stock transfer');
  }
}

export async function approveStockTransfer(transferId: string, approvedBy: string) {
  try {
    await connectToDB();
    
    const transfer = await StockTransfer.findById(transferId)
      .populate('fromWarehouse', 'name location')
      .populate('toWarehouse', 'name location');
    
    if (!transfer) {
      throw new Error('Transfer not found');
    }
    
    // Create shipment for the transfer
    const shipment = await createShipment({
      origin: transfer.fromWarehouse.name,
      destination: transfer.toWarehouse.name,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      items: transfer.items.map(item => ({
        productId: item.product.toString(),
        quantity: item.quantity
      })),
      stockTransferId: transferId
    });
    
    // Update transfer status
    const updatedTransfer = await StockTransfer.findByIdAndUpdate(
      transferId,
      {
        status: 'in-transit',
        approvedBy,
        shipment: shipment._id
      },
      { new: true }
    );
    
    return JSON.parse(JSON.stringify(updatedTransfer));
  } catch (error) {
    throw new Error('Failed to approve stock transfer');
  }
}

export async function completeStockTransfer(transferId: string) {
  try {
    await connectToDB();
    
    const transfer = await StockTransfer.findById(transferId).populate('items.product');
    
    if (!transfer) {
      throw new Error('Transfer not found');
    }
    
    // Update stock levels
    for (const item of transfer.items) {
      // Reduce stock from source warehouse
      await ProductBatch.updateMany(
        { 
          product: item.product._id,
          warehouse: transfer.fromWarehouse,
          quantity: { $gt: 0 }
        },
        { $inc: { quantity: -item.quantity } }
      );
      
      // Add stock to destination warehouse
      await ProductBatch.create({
        product: item.product._id,
        warehouse: transfer.toWarehouse,
        quantity: item.quantity,
        costPerUnit: item.unitCost,
        batchNumber: `TR-${transfer.transferNumber}-${item.product.sku}`,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
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
    throw new Error('Failed to complete stock transfer');
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
      warehouse: warehouseId,
      quantity: { $gt: 0 }
    })
    .populate('product', 'name sku price')
    .sort({ createdAt: -1 });
    
    // Group by product and sum quantities
    const stockSummary = stock.reduce((acc: any, batch: any) => {
      const productId = batch.product._id.toString();
      if (!acc[productId]) {
        acc[productId] = {
          product: batch.product,
          totalQuantity: 0,
          batches: []
        };
      }
      acc[productId].totalQuantity += batch.quantity;
      acc[productId].batches.push(batch);
      return acc;
    }, {});
    
    return JSON.parse(JSON.stringify(Object.values(stockSummary)));
  } catch (error) {
    throw new Error('Failed to fetch warehouse stock');
  }
}