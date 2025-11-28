'use server'

import { connectToDB } from '../mongoose';
import Expense from '@/lib/models/expense.models';

export async function getExpensesReport(startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    // Get expenses for the period
    const expenses = await Expense.find({
      date: { $gte: start, $lte: end }
    }).populate('account', 'name type').sort({ date: -1 });
    
    // Calculate summary metrics
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalTransactions = expenses.length;
    const avgExpenseAmount = totalTransactions > 0 ? totalExpenses / totalTransactions : 0;
    
    // Category breakdown
    const categoryMap = new Map();
    expenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category);
        existing.amount += expense.amount;
        existing.count += 1;
      } else {
        categoryMap.set(category, {
          category,
          amount: expense.amount,
          count: 1
        });
      }
    });
    
    const categoryBreakdown = Array.from(categoryMap.values())
      .map(cat => ({
        ...cat,
        percentage: totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
    
    const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0].category : 'None';
    
    // Monthly trend
    const monthlyMap = new Map();
    expenses.forEach(expense => {
      const month = expense.date.toISOString().slice(0, 7); // YYYY-MM
      if (monthlyMap.has(month)) {
        const existing = monthlyMap.get(month);
        existing.amount += expense.amount;
        existing.count += 1;
      } else {
        monthlyMap.set(month, {
          month,
          amount: expense.amount,
          count: 1
        });
      }
    });
    
    const monthlyTrend = Array.from(monthlyMap.values())
      .sort((a, b) => a.month.localeCompare(b.month));
    
    // Payment methods breakdown
    const paymentMap = new Map();
    expenses.forEach(expense => {
      const method = expense.paymentMethod || 'Not Specified';
      if (paymentMap.has(method)) {
        const existing = paymentMap.get(method);
        existing.amount += expense.amount;
        existing.count += 1;
      } else {
        paymentMap.set(method, {
          method,
          amount: expense.amount,
          count: 1
        });
      }
    });
    
    const paymentMethods = Array.from(paymentMap.values())
      .sort((a, b) => b.amount - a.amount);
    
    // Format expenses for display
    const formattedExpenses = expenses.map(expense => ({
      _id: expense._id,
      description: expense.description,
      amount: expense.amount,
      category: expense.category || 'Uncategorized',
      date: expense.date.toISOString(),
      paymentMethod: expense.paymentMethod || 'Not Specified',
      account: {
        name: expense.account?.name || 'Unknown Account',
        type: expense.account?.type || 'unknown'
      },
      status: expense.status || 'paid'
    }));
    
    return {
      summary: {
        totalExpenses,
        totalTransactions,
        avgExpenseAmount,
        topCategory,
        period: { start: start.toISOString(), end: end.toISOString() }
      },
      expenses: formattedExpenses,
      categoryBreakdown,
      monthlyTrend,
      paymentMethods
    };
  } catch (error) {
    console.error('Error generating expenses report:', error);
    throw new Error('Failed to generate expenses report');
  }
}

export async function getExpensesByCategory(category: string, startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    const expenses = await Expense.find({
      category,
      date: { $gte: start, $lte: end }
    }).populate('account', 'name type').sort({ date: -1 });
    
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const avgAmount = expenses.length > 0 ? totalAmount / expenses.length : 0;
    
    return {
      category,
      totalAmount,
      totalCount: expenses.length,
      avgAmount,
      expenses: expenses.map(expense => ({
        _id: expense._id,
        description: expense.description,
        amount: expense.amount,
        date: expense.date.toISOString(),
        paymentMethod: expense.paymentMethod || 'Not Specified',
        account: expense.account?.name || 'Unknown Account',
        status: expense.status || 'paid'
      }))
    };
  } catch (error) {
    throw new Error('Failed to fetch expenses by category');
  }
}