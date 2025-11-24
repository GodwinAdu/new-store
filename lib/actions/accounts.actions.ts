'use server'

import Account from '@/lib/models/account.models';
import Expense from '@/lib/models/expense.models';
import Income from '@/lib/models/income.models';
import { connectToDB } from '../mongoose';

export async function getAccounts() {
  try {
    await connectToDB();
    
    const accounts = await Account.find({ status: 'active' }).sort({ createdAt: -1 });
    
    // Create sample accounts if none exist
    if (accounts.length === 0) {
      const sampleAccounts = [
        { name: 'Main Cash Account', type: 'cash', balance: 15000, status: 'active' },
        { name: 'Business Checking', type: 'bank', balance: 45000, accountNumber: '1234567890', bankName: 'First Bank', status: 'active' },
        { name: 'Petty Cash', type: 'cash', balance: 500, status: 'active' },
        { name: 'Savings Account', type: 'bank', balance: 25000, accountNumber: '0987654321', bankName: 'Second Bank', status: 'active' }
      ];
      
      await Account.insertMany(sampleAccounts);
      return await Account.find({ status: 'active' }).sort({ createdAt: -1 });
    }
    
    return JSON.parse(JSON.stringify(accounts));
  } catch (error) {
    throw new Error('Failed to fetch accounts');
  }
}

export async function getExpenses() {
  try {
    await connectToDB();
    
    const expenses = await Expense.find()
      .populate('account', 'name type')
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Create sample expenses if none exist
    if (expenses.length === 0) {
      const accounts = await Account.find({ status: 'active' });
      if (accounts.length > 0) {
        const sampleExpenses = [
          {
            description: 'Office Rent Payment',
            amount: 2500,
            category: 'Rent',
            account: accounts[0]._id,
            date: new Date(),
            status: 'paid',
            paymentMethod: 'Bank Transfer',
            reference: 'RENT-001'
          },
          {
            description: 'Electricity Bill',
            amount: 450,
            category: 'Utilities',
            account: accounts[0]._id,
            date: new Date(Date.now() - 86400000),
            status: 'paid',
            paymentMethod: 'Online Payment',
            reference: 'UTIL-001'
          },
          {
            description: 'Marketing Campaign',
            amount: 1200,
            category: 'Marketing',
            account: accounts[1]._id,
            date: new Date(Date.now() - 172800000),
            status: 'pending',
            paymentMethod: 'Credit Card',
            reference: 'MKT-001'
          },
          {
            description: 'Office Supplies',
            amount: 350,
            category: 'Supplies',
            account: accounts[0]._id,
            date: new Date(Date.now() - 259200000),
            status: 'paid',
            paymentMethod: 'Cash',
            reference: 'SUP-001'
          }
        ];
        
        await Expense.insertMany(sampleExpenses);
        
        // Update account balances
        for (const expense of sampleExpenses) {
          if (expense.status === 'paid') {
            await Account.findByIdAndUpdate(expense.account, {
              $inc: { balance: -expense.amount }
            });
          }
        }
        
        return await Expense.find().populate('account', 'name type').sort({ createdAt: -1 }).limit(50);
      }
    }
    
    return JSON.parse(JSON.stringify(expenses));
  } catch (error) {
    throw new Error('Failed to fetch expenses');
  }
}

export async function getIncomes() {
  try {
    await connectToDB();
    
    const incomes = await Income.find()
      .populate('account', 'name type')
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Create sample incomes if none exist
    if (incomes.length === 0) {
      const accounts = await Account.find({ status: 'active' });
      if (accounts.length > 0) {
        const sampleIncomes = [
          {
            description: 'Product Sales Revenue',
            amount: 15000,
            category: 'Sales',
            account: accounts[0]._id,
            date: new Date(),
            status: 'received',
            paymentMethod: 'Bank Transfer',
            reference: 'SAL-001'
          },
          {
            description: 'Consulting Services',
            amount: 3500,
            category: 'Services',
            account: accounts[1]._id,
            date: new Date(Date.now() - 86400000),
            status: 'received',
            paymentMethod: 'Online Payment',
            reference: 'SRV-001'
          },
          {
            description: 'Investment Returns',
            amount: 1200,
            category: 'Investment',
            account: accounts[2]._id,
            date: new Date(Date.now() - 172800000),
            status: 'pending',
            paymentMethod: 'Bank Transfer',
            reference: 'INV-001'
          }
        ];
        
        await Income.insertMany(sampleIncomes);
        
        // Update account balances
        for (const income of sampleIncomes) {
          if (income.status === 'received') {
            await Account.findByIdAndUpdate(income.account, {
              $inc: { balance: income.amount }
            });
          }
        }
        
        return await Income.find().populate('account', 'name type').sort({ createdAt: -1 }).limit(50);
      }
    }
    
    return JSON.parse(JSON.stringify(incomes));
  } catch (error) {
    throw new Error('Failed to fetch incomes');
  }
}

export async function createAccount(accountData: {
  name: string;
  type: string;
  accountNumber?: string;
  bankName?: string;
  description?: string;
}) {
  try {
    await connectToDB();
    
    const account = await Account.create(accountData);
    
    return JSON.parse(JSON.stringify(account));
  } catch (error) {
    throw new Error('Failed to create account');
  }
}

export async function updateAccount(accountId: string, updateData: {
  name?: string;
  type?: string;
  balance?: number;
  accountNumber?: string;
  bankName?: string;
  status?: string;
  description?: string;
}) {
  try {
    await connectToDB();
    
    const account = await Account.findByIdAndUpdate(accountId, updateData, { new: true });
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    return JSON.parse(JSON.stringify(account));
  } catch (error) {
    throw new Error('Failed to update account');
  }
}

export async function deleteAccount(accountId: string) {
  try {
    await connectToDB();
    
    const account = await Account.findByIdAndUpdate(
      accountId,
      { status: 'closed' },
      { new: true }
    );
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    return { success: true };
  } catch (error) {
    throw new Error('Failed to delete account');
  }
}

export async function createExpense(expenseData: {
  description: string;
  amount: number;
  category: string;
  accountId: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
}) {
  try {
    const { requirePermission } = await import('@/lib/middleware/auth');
    await requirePermission('addExpenses');
    
    await connectToDB();
    
    // Check account balance for non-cash accounts
    const account = await Account.findById(expenseData.accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    
    if (account.type !== 'cash' && account.balance < expenseData.amount) {
      throw new Error('Insufficient funds in account');
    }
    
    const expense = await Expense.create({
      ...expenseData,
      account: expenseData.accountId,
      createdBy: '507f1f77bcf86cd799439011' // Mock user ID
    });
    
    // Update account balance
    await Account.findByIdAndUpdate(expenseData.accountId, {
      $inc: { balance: -expenseData.amount }
    });
    
    return JSON.parse(JSON.stringify(expense));
  } catch (error) {
    throw new Error('Failed to create expense');
  }
}

export async function updateExpense(expenseId: string, updateData: {
  description?: string;
  amount?: number;
  category?: string;
  status?: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
}) {
  try {
    const { requirePermission } = await import('@/lib/middleware/auth');
    await requirePermission('editExpenses');
    
    await connectToDB();
    
    const expense = await Expense.findByIdAndUpdate(expenseId, updateData, { new: true })
      .populate('account', 'name type');
    
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    return JSON.parse(JSON.stringify(expense));
  } catch (error) {
    throw new Error('Failed to update expense');
  }
}

export async function deleteExpense(expenseId: string) {
  try {
    const { requirePermission } = await import('@/lib/middleware/auth');
    await requirePermission('deleteExpenses');
    
    await connectToDB();
    
    const expense = await Expense.findByIdAndDelete(expenseId);
    
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    return { success: true };
  } catch (error) {
    throw new Error('Failed to delete expense');
  }
}

export async function createIncome(incomeData: {
  description: string;
  amount: number;
  category: string;
  accountId: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
}) {
  try {
    await connectToDB();
    
    const income = await Income.create({
      ...incomeData,
      account: incomeData.accountId,
      createdBy: '507f1f77bcf86cd799439011' // Mock user ID
    });
    
    // Update account balance
    await Account.findByIdAndUpdate(incomeData.accountId, {
      $inc: { balance: incomeData.amount }
    });
    
    return JSON.parse(JSON.stringify(income));
  } catch (error) {
    throw new Error('Failed to create income');
  }
}

export async function updateIncome(incomeId: string, updateData: {
  description?: string;
  amount?: number;
  category?: string;
  status?: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
}) {
  try {
    await connectToDB();
    
    const income = await Income.findByIdAndUpdate(incomeId, updateData, { new: true })
      .populate('account', 'name type');
    
    if (!income) {
      throw new Error('Income not found');
    }
    
    return JSON.parse(JSON.stringify(income));
  } catch (error) {
    throw new Error('Failed to update income');
  }
}

export async function deleteIncome(incomeId: string) {
  try {
    await connectToDB();
    
    const income = await Income.findByIdAndDelete(incomeId);
    
    if (!income) {
      throw new Error('Income not found');
    }
    
    return { success: true };
  } catch (error) {
    throw new Error('Failed to delete income');
  }
}

export async function transferFunds(transferData: {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
  reference?: string;
}) {
  try {
    await connectToDB();
    
    const [fromAccount, toAccount] = await Promise.all([
      Account.findById(transferData.fromAccountId),
      Account.findById(transferData.toAccountId)
    ]);
    
    if (!fromAccount || !toAccount) {
      throw new Error('Account not found');
    }
    
    if (fromAccount.balance < transferData.amount) {
      throw new Error('Insufficient funds');
    }
    
    // Update account balances
    await Promise.all([
      Account.findByIdAndUpdate(transferData.fromAccountId, {
        $inc: { balance: -transferData.amount }
      }),
      Account.findByIdAndUpdate(transferData.toAccountId, {
        $inc: { balance: transferData.amount }
      })
    ]);
    
    // Create expense and income records
    await Promise.all([
      Expense.create({
        description: `Transfer to ${toAccount.name}`,
        amount: transferData.amount,
        category: 'Transfer',
        account: transferData.fromAccountId,
        status: 'paid',
        reference: transferData.reference,
        createdBy: '507f1f77bcf86cd799439011'
      }),
      Income.create({
        description: `Transfer from ${fromAccount.name}`,
        amount: transferData.amount,
        category: 'Transfer',
        account: transferData.toAccountId,
        status: 'received',
        reference: transferData.reference,
        createdBy: '507f1f77bcf86cd799439011'
      })
    ]);
    
    return { success: true };
  } catch (error) {
    throw new Error('Failed to transfer funds');
  }
}

export async function getAccountTransactions(accountId: string) {
  try {
    await connectToDB();
    
    const [expenses, incomes] = await Promise.all([
      Expense.find({ account: accountId }).sort({ date: -1 }).limit(50),
      Income.find({ account: accountId }).sort({ date: -1 }).limit(50)
    ]);
    
    const transactions = [
      ...expenses.map(exp => ({ ...exp.toObject(), type: 'expense' })),
      ...incomes.map(inc => ({ ...inc.toObject(), type: 'income' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return JSON.parse(JSON.stringify(transactions));
  } catch (error) {
    throw new Error('Failed to fetch account transactions');
  }
}

export async function getAccountsSummary() {
  try {
    await connectToDB();
    
    const [accounts, expenses, incomes] = await Promise.all([
      Account.find({ status: 'active' }),
      Expense.find({ status: 'paid' }),
      Income.find({ status: 'received' })
    ]);
    
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncomes = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const netProfit = totalIncomes - totalExpenses;
    
    return {
      totalBalance,
      totalExpenses,
      totalIncomes,
      netProfit,
      accountsCount: accounts.length,
      expensesCount: expenses.length,
      incomesCount: incomes.length
    };
  } catch (error) {
    throw new Error('Failed to fetch accounts summary');
  }
}

export async function getMonthlyReport(year: number, month: number) {
  try {
    await connectToDB();
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const [expenses, incomes] = await Promise.all([
      Expense.find({
        date: { $gte: startDate, $lte: endDate },
        status: 'paid'
      }).populate('account', 'name'),
      Income.find({
        date: { $gte: startDate, $lte: endDate },
        status: 'received'
      }).populate('account', 'name')
    ]);
    
    const expensesByCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    
    const incomesByCategory = incomes.reduce((acc, inc) => {
      acc[inc.category] = (acc[inc.category] || 0) + inc.amount;
      return acc;
    }, {});
    
    return {
      period: `${year}-${month.toString().padStart(2, '0')}`,
      totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      totalIncomes: incomes.reduce((sum, inc) => sum + inc.amount, 0),
      expensesByCategory,
      incomesByCategory,
      transactions: [...expenses, ...incomes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };
  } catch (error) {
    throw new Error('Failed to fetch monthly report');
  }
}