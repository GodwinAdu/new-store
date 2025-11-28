'use server'

import { connectToDB } from '../mongoose';
import SellReturn from '@/lib/models/sell-return.models';
import Sale from '@/lib/models/sales.models';

export async function getSellReturnReport(startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    // Get returns for the period
    const returns = await SellReturn.find({
      returnDate: { $gte: start, $lte: end }
    }).populate([
      { path: 'originalSale', select: '_id saleDate' },
      { path: 'customer', select: 'name' },
      { path: 'items.product', select: 'name' }
    ]).sort({ returnDate: -1 });
    
    // Get total sales for return rate calculation
    const totalSales = await Sale.countDocuments({
      saleDate: { $gte: start, $lte: end },
      isVoided: { $ne: true }
    });
    
    // Process return data
    let totalReturns = returns.length;
    let totalQuantityReturned = 0;
    let totalRefundAmount = 0;
    
    const reasonMap = new Map();
    const productReturnMap = new Map();
    const formattedReturns = [];
    
    returns.forEach(returnItem => {
      const refundAmount = returnItem.refundAmount || 0;
      totalRefundAmount += refundAmount;
      
      returnItem.items.forEach(item => {
        const quantity = item.quantity || 0;
        totalQuantityReturned += quantity;
        
        // Track return reasons
        const reason = returnItem.reason || 'Not Specified';
        if (reasonMap.has(reason)) {
          const existing = reasonMap.get(reason);
          existing.count += 1;
          existing.amount += refundAmount;
        } else {
          reasonMap.set(reason, {
            reason,
            count: 1,
            amount: refundAmount
          });
        }
        
        // Track product returns
        const productName = item.product?.name || 'Unknown Product';
        if (productReturnMap.has(productName)) {
          const existing = productReturnMap.get(productName);
          existing.quantityReturned += quantity;
          existing.refundAmount += refundAmount;
        } else {
          productReturnMap.set(productName, {
            productName,
            quantityReturned: quantity,
            refundAmount
          });
        }
        
        // Format return for display
        formattedReturns.push({
          _id: returnItem._id,
          returnDate: returnItem.returnDate.toISOString(),
          originalSaleId: returnItem.originalSale?._id?.toString() || 'N/A',
          customerName: returnItem.customer?.name || 'Walk-in Customer',
          productName,
          quantityReturned: quantity,
          refundAmount,
          reason,
          status: returnItem.status || 'completed'
        });
      });
    });
    
    // Calculate return rate
    const returnRate = totalSales > 0 ? (totalReturns / totalSales) * 100 : 0;
    
    // Process reason breakdown with percentages
    const reasonBreakdown = Array.from(reasonMap.values()).map(reason => ({
      ...reason,
      percentage: totalReturns > 0 ? (reason.count / totalReturns) * 100 : 0
    })).sort((a, b) => b.count - a.count);
    
    // Process product returns
    const productReturns = Array.from(productReturnMap.values())
      .sort((a, b) => b.quantityReturned - a.quantityReturned);
    
    return {
      summary: {
        totalReturns,
        totalQuantityReturned,
        totalRefundAmount,
        returnRate,
        period: { start: start.toISOString(), end: end.toISOString() }
      },
      returns: formattedReturns,
      reasonBreakdown,
      productReturns
    };
  } catch (error) {
    console.error('Error generating sell return report:', error);
    throw new Error('Failed to generate sell return report');
  }
}

export async function getReturnsByCustomer(customerId: string, startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    const returns = await SellReturn.find({
      customer: customerId,
      returnDate: { $gte: start, $lte: end }
    }).populate([
      { path: 'originalSale', select: '_id saleDate' },
      { path: 'items.product', select: 'name' }
    ]).sort({ returnDate: -1 });
    
    let totalRefunds = 0;
    let totalQuantity = 0;
    
    const returnHistory = returns.map(returnItem => {
      const refundAmount = returnItem.refundAmount || 0;
      totalRefunds += refundAmount;
      
      const items = returnItem.items.map(item => {
        totalQuantity += item.quantity || 0;
        return {
          productName: item.product?.name || 'Unknown Product',
          quantity: item.quantity || 0,
          reason: item.reason || returnItem.reason || 'Not Specified'
        };
      });
      
      return {
        _id: returnItem._id,
        returnDate: returnItem.returnDate,
        originalSaleId: returnItem.originalSale?._id,
        refundAmount,
        items,
        status: returnItem.status || 'completed'
      };
    });
    
    return {
      customerId,
      totalReturns: returns.length,
      totalRefunds,
      totalQuantity,
      returnHistory
    };
  } catch (error) {
    throw new Error('Failed to fetch customer returns');
  }
}