'use server'

import { connectToDB } from '../mongoose';
import Sale from '../models/sales.models';
import Product from '../models/product.models';
import Staff from '../models/staff.models';
import { currentUser } from '../helpers/session';

export async function getPendingPayments(warehouseId?: string) {
  try {
    await connectToDB();
    
    const query: any = {
      paymentStatus: 'pending',
      isVoided: { $ne: true }
    };
    
    if (warehouseId) {
      query.warehouse = warehouseId;
    }
    
    const sales = await Sale.find(query)
      .populate([
        { path: 'items.product', model: Product },
        { path: 'cashier', model: Staff, select: 'fullName email' },
        { path: 'warehouse', select: 'name location' }
      ])
      .sort({ saleDate: -1 })
      .limit(100);
    
    return JSON.parse(JSON.stringify(sales));
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    return [];
  }
}

export async function verifyPayment(saleId: string, notes?: string) {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');
    
    await connectToDB();
    
    const sale = await Sale.findByIdAndUpdate(
      saleId,
      {
        paymentStatus: 'verified',
        verifiedBy: user._id,
        verifiedAt: new Date(),
        $push: {
          modificationHistory: {
            modifiedBy: user._id,
            modifiedAt: new Date(),
            changes: { action: 'payment_verified', notes },
            reason: notes || 'Payment verified by accounts'
          }
        }
      },
      { new: true }
    ).populate([
      { path: 'items.product', model: Product },
      { path: 'cashier', model: Staff, select: 'fullName email' },
      { path: 'verifiedBy', model: Staff, select: 'fullName email' }
    ]);
    
    return JSON.parse(JSON.stringify(sale));
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new Error('Failed to verify payment');
  }
}

export async function rejectPayment(saleId: string, reason: string) {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');
    
    await connectToDB();
    
    const sale = await Sale.findByIdAndUpdate(
      saleId,
      {
        paymentStatus: 'rejected',
        rejectionReason: reason,
        verifiedBy: user._id,
        verifiedAt: new Date(),
        $push: {
          modificationHistory: {
            modifiedBy: user._id,
            modifiedAt: new Date(),
            changes: { action: 'payment_rejected', reason },
            reason
          }
        }
      },
      { new: true }
    ).populate([
      { path: 'items.product', model: Product },
      { path: 'cashier', model: Staff, select: 'fullName email' },
      { path: 'verifiedBy', model: Staff, select: 'fullName email' }
    ]);
    
    return JSON.parse(JSON.stringify(sale));
  } catch (error) {
    console.error('Error rejecting payment:', error);
    throw new Error('Failed to reject payment');
  }
}

export async function getSaleByVerificationCode(code: string) {
  try {
    await connectToDB();
    
    const sale = await Sale.findOne({ verificationCode: code })
      .populate([
        { path: 'items.product', model: Product },
        { path: 'cashier', model: Staff, select: 'fullName email' },
        { path: 'verifiedBy', model: Staff, select: 'fullName email' },
        { path: 'warehouse', select: 'name location' }
      ]);
    
    if (!sale) {
      throw new Error('Sale not found with this verification code');
    }
    
    return JSON.parse(JSON.stringify(sale));
  } catch (error) {
    console.error('Error fetching sale by verification code:', error);
    throw error;
  }
}

export async function getVerifiedPayments(startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const query: any = {
      paymentStatus: 'verified',
      isVoided: { $ne: true }
    };
    
    if (startDate && endDate) {
      query.verifiedAt = { $gte: startDate, $lte: endDate };
    }
    
    const sales = await Sale.find(query)
      .populate([
        { path: 'items.product', model: Product },
        { path: 'cashier', model: Staff, select: 'fullName email' },
        { path: 'verifiedBy', model: Staff, select: 'fullName email' },
        { path: 'warehouse', select: 'name location' }
      ])
      .sort({ verifiedAt: -1 })
      .limit(100);
    
    return JSON.parse(JSON.stringify(sales));
  } catch (error) {
    console.error('Error fetching verified payments:', error);
    return [];
  }
}

export async function getPaymentStats() {
  try {
    await connectToDB();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const [pending, verified, rejected, todayPending] = await Promise.all([
      Sale.countDocuments({ paymentStatus: 'pending', isVoided: { $ne: true } }),
      Sale.countDocuments({ paymentStatus: 'verified', isVoided: { $ne: true } }),
      Sale.countDocuments({ paymentStatus: 'rejected', isVoided: { $ne: true } }),
      Sale.countDocuments({ 
        paymentStatus: 'pending', 
        saleDate: { $gte: today, $lt: tomorrow },
        isVoided: { $ne: true }
      })
    ]);
    
    const pendingSales = await Sale.find({ 
      paymentStatus: 'pending',
      isVoided: { $ne: true }
    });
    
    const totalPendingAmount = pendingSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    
    return {
      pending,
      verified,
      rejected,
      todayPending,
      totalPendingAmount
    };
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return {
      pending: 0,
      verified: 0,
      rejected: 0,
      todayPending: 0,
      totalPendingAmount: 0
    };
  }
}
