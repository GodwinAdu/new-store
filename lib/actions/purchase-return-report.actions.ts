'use server'

import { connectToDB } from '../mongoose';
import Purchase from '@/lib/models/purchase.models';

export async function getPurchaseReturnReport(startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    // Get purchases with returns for the period
    const purchases = await Purchase.find({
      createdAt: { $gte: start, $lte: end },
      status: 'returned'
    }).populate([
      { path: 'supplier', select: 'name' },
      { path: 'items.product', select: 'name' }
    ]).sort({ createdAt: -1 });
    
    // Get total purchases for return rate calculation
    const totalPurchases = await Purchase.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });
    
    // Process return data
    let totalReturns = purchases.length;
    let totalQuantityReturned = 0;
    let totalRefundAmount = 0;
    
    const reasonMap = new Map();
    const supplierReturnMap = new Map();
    const formattedReturns = [];
    
    purchases.forEach(purchase => {
      const refundAmount = purchase.totalAmount || 0;
      totalRefundAmount += refundAmount;
      
      purchase.items.forEach(item => {
        const quantity = item.quantity || 0;
        totalQuantityReturned += quantity;
        
        // Track return reasons (using status as reason for simplicity)
        const reason = purchase.returnReason || 'Quality Issue';
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
        
        // Track supplier returns
        const supplierName = purchase.supplier?.name || 'Unknown Supplier';
        if (supplierReturnMap.has(supplierName)) {
          const existing = supplierReturnMap.get(supplierName);
          existing.quantityReturned += quantity;
          existing.refundAmount += refundAmount;
        } else {
          supplierReturnMap.set(supplierName, {
            supplierName,
            quantityReturned: quantity,
            refundAmount
          });
        }
        
        // Format return for display
        formattedReturns.push({
          _id: purchase._id,
          returnDate: purchase.createdAt.toISOString(),
          originalPurchaseId: purchase._id.toString(),
          supplierName,
          productName: item.product?.name || 'Unknown Product',
          quantityReturned: quantity,
          refundAmount,
          reason,
          status: 'completed'
        });
      });
    });
    
    // Calculate return rate
    const returnRate = totalPurchases > 0 ? (totalReturns / totalPurchases) * 100 : 0;
    
    // Process reason breakdown with percentages
    const reasonBreakdown = Array.from(reasonMap.values()).map(reason => ({
      ...reason,
      percentage: totalReturns > 0 ? (reason.count / totalReturns) * 100 : 0
    })).sort((a, b) => b.count - a.count);
    
    // Process supplier returns
    const supplierReturns = Array.from(supplierReturnMap.values())
      .sort((a, b) => b.refundAmount - a.refundAmount);
    
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
      supplierReturns
    };
  } catch (error) {
    console.error('Error generating purchase return report:', error);
    throw new Error('Failed to generate purchase return report');
  }
}