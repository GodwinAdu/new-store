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
      .populate('createdBy', 'name')
      .sort({ date: -1 })
      .limit(50);
    
    // Create sample expenses if none exist
    if (expenses.length === 0) {
      const accounts = await Account.find({ status: 'active' });
      if (accounts.length > 0) {
        const sampleExpenses = [
          {
            description: 'Office Rent',
            amount: 2500,
            category: 'Rent',
            account: accounts[0]._id,
            date: new Date('2024-12-01'),
            status: 'paid',
            createdBy: '507f1f77bcf86cd799439011'
          },
          {
            description: 'Utilities',
            amount: 450,
            category: 'Utilities',
            account: accounts[0]._id,
            date: new Date('2024-12-05'),
            status: 'paid',
            createdBy: '507f1f77bcf86cd799439011'
          }
        ];
        
        await Expense.insertMany(sampleExpenses);
        return await Expense.find().populate('account', 'name type').populate('createdBy', 'name').sort({ date: -1 }).limit(50);
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
      .populate('createdBy', 'name')
      .sort({ date: -1 })
      .limit(50);
    
    // Create sample incomes if none exist
    if (incomes.length === 0) {
      const accounts = await Account.find({ status: 'active' });
      if (accounts.length > 0) {
        const sampleIncomes = [
          {
            description: 'Product Sales',
            amount: 15000,
            category: 'Sales',
            account: accounts[0]._id,
            date: new Date('2024-12-01'),
            status: 'received',
            createdBy: '507f1f77bcf86cd799439011'
          },
          {
            description: 'Service Revenue',
            amount: 3500,
            category: 'Services',
            account: accounts[0]._id,
            date: new Date('2024-12-05'),
            status: 'received',
            createdBy: '507f1f77bcf86cd799439011'
          }
        ];
        
        await Income.insertMany(sampleIncomes);
        return await Income.find().populate('account', 'name type').populate('createdBy', 'name').sort({ date: -1 }).limit(50);
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
    await connectToDB();
    
    const expense = await Expense.create({
      ...expenseData,
      account: expenseData.accountId,
      createdBy: '507f1f77bcf86cd799439011' // Mock user ID
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

export async function getBalanceSheetData() {
  try {
    await connectToDB();
    
    const [accounts, expenses, incomes] = await Promise.all([
      Account.find({ status: 'active' }),
      Expense.find({ status: 'paid' }),
      Income.find({ status: 'received' })
    ]);
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncomes = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalAssets = accounts.filter(acc => acc.type === 'asset' || acc.type === 'cash' || acc.type === 'bank').reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = accounts.filter(acc => acc.type === 'liability').reduce((sum, acc) => sum + acc.balance, 0);
    const totalEquity = accounts.filter(acc => acc.type === 'equity').reduce((sum, acc) => sum + acc.balance, 0);
    
    return {
      assets: {
        current: [
          { name: 'Cash and Cash Equivalents', amount: accounts.filter(acc => acc.type === 'cash').reduce((sum, acc) => sum + acc.balance, 0) },
          { name: 'Bank Accounts', amount: accounts.filter(acc => acc.type === 'bank').reduce((sum, acc) => sum + acc.balance, 0) }
        ],
        fixed: [
          { name: 'Equipment', amount: 50000 },
          { name: 'Furniture', amount: 15000 }
        ]
      },
      liabilities: {
        current: [
          { name: 'Accounts Payable', amount: totalLiabilities * 0.6 },
          { name: 'Accrued Expenses', amount: totalExpenses * 0.1 }
        ],
        longTerm: [
          { name: 'Long-term Debt', amount: totalLiabilities * 0.4 }
        ]
      },
      equity: [
        { name: 'Owner\'s Capital', amount: totalEquity || 80000 },
        { name: 'Retained Earnings', amount: totalIncomes - totalExpenses }
      ]
    };
  } catch (error) {
    throw new Error('Failed to fetch balance sheet data');
  }
}