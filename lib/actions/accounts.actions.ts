'use server'

import Account from '@/lib/models/account.models';
import Expense from '@/lib/models/expense.models';
import Income from '@/lib/models/income.models';
import { connectToDB } from '../mongoose';

export async function getAccounts() {
  try {
    await connectToDB();
    
    let accounts = await Account.find().sort({ createdAt: -1 });
    
   
    if (accounts.length === 0) {
      return [];
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
    
    const account = await Account.create({
      ...accountData,
      balance: 0,
      status: 'active'
    });
    
    return JSON.parse(JSON.stringify(account));
  } catch (error) {
    console.error('Create account error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create account');
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
    console.error('Update account error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update account');
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
    console.error('Delete account error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete account');
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
    
    // Check account exists
    const account = await Account.findById(expenseData.accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    
    const expense = await Expense.create({
      ...expenseData,
      account: expenseData.accountId,
      status: 'paid',
      createdBy: '507f1f77bcf86cd799439011' // Mock user ID
    });
    
    // Update account balance
    await Account.findByIdAndUpdate(expenseData.accountId, {
      $inc: { balance: -expenseData.amount }
    });
    
    return JSON.parse(JSON.stringify(expense));
  } catch (error) {
    console.error('Create expense error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create expense');
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
    console.error('Update expense error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update expense');
  }
}

export async function deleteExpense(expenseId: string) {
  try {
    await connectToDB();
    
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      throw new Error('Expense not found');
    }
    
    // Reverse the account balance change
    await Account.findByIdAndUpdate(expense.account, {
      $inc: { balance: expense.amount }
    });
    
    await Expense.findByIdAndDelete(expenseId);
    
    return { success: true };
  } catch (error) {
    console.error('Delete expense error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete expense');
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
    
    // Check account exists
    const account = await Account.findById(incomeData.accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    
    const income = await Income.create({
      ...incomeData,
      account: incomeData.accountId,
      status: 'received',
      createdBy: '507f1f77bcf86cd799439011' // Mock user ID
    });
    
    // Update account balance
    await Account.findByIdAndUpdate(incomeData.accountId, {
      $inc: { balance: incomeData.amount }
    });
    
    return JSON.parse(JSON.stringify(income));
  } catch (error) {
    console.error('Create income error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create income');
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
    console.error('Update income error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update income');
  }
}

export async function deleteIncome(incomeId: string) {
  try {
    await connectToDB();
    
    const income = await Income.findById(incomeId);
    if (!income) {
      throw new Error('Income not found');
    }
    
    // Reverse the account balance change
    await Account.findByIdAndUpdate(income.account, {
      $inc: { balance: -income.amount }
    });
    
    await Income.findByIdAndDelete(incomeId);
    
    return { success: true };
  } catch (error) {
    console.error('Delete income error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete income');
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

export async function getCashFlow(startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    const [expenses, incomes, accounts] = await Promise.all([
      Expense.find({
        date: { $gte: start, $lte: end },
        status: 'paid'
      }).populate('account', 'name type').sort({ date: 1 }),
      Income.find({
        date: { $gte: start, $lte: end },
        status: 'received'
      }).populate('account', 'name type').sort({ date: 1 }),
      Account.find({ status: 'active', type: { $in: ['cash', 'bank'] } })
    ]);
    
    const cashAccounts = accounts.filter(acc => acc.type === 'cash');
    const bankAccounts = accounts.filter(acc => acc.type === 'bank');
    
    const openingBalance = cashAccounts.reduce((sum, acc) => sum + acc.balance, 0) +
                          bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    const totalInflows = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalOutflows = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netCashFlow = totalInflows - totalOutflows;
    const closingBalance = openingBalance + netCashFlow;
    
    // Group by category
    const inflowsByCategory = incomes.reduce((acc, inc) => {
      acc[inc.category] = (acc[inc.category] || 0) + inc.amount;
      return acc;
    }, {});
    
    const outflowsByCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    
    // Monthly breakdown
    const monthlyData = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const monthIncomes = incomes.filter(inc => {
        const incDate = new Date(inc.date);
        return incDate >= monthStart && incDate <= monthEnd;
      });
      
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= monthStart && expDate <= monthEnd;
      });
      
      const monthInflows = monthIncomes.reduce((sum, inc) => sum + inc.amount, 0);
      const monthOutflows = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      monthlyData.push({
        month: monthStart.toISOString().slice(0, 7),
        inflows: monthInflows,
        outflows: monthOutflows,
        netFlow: monthInflows - monthOutflows
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return {
      summary: {
        openingBalance,
        totalInflows,
        totalOutflows,
        netCashFlow,
        closingBalance,
        period: { start: start.toISOString(), end: end.toISOString() }
      },
      breakdown: {
        inflows: inflowsByCategory,
        outflows: outflowsByCategory
      },
      monthly: monthlyData,
      transactions: {
        inflows: incomes,
        outflows: expenses
      },
      accounts: {
        cash: cashAccounts,
        bank: bankAccounts
      }
    };
  } catch (error) {
    throw new Error('Failed to generate cash flow');
  }
}

export async function getTransferHistory() {
  try {
    await connectToDB();
    
    const [expenses, incomes] = await Promise.all([
      Expense.find({ category: 'Transfer' })
        .populate('account', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
      Income.find({ category: 'Transfer' })
        .populate('account', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);
    
    const transfers = [];
    
    // Match transfers by reference
    for (const expense of expenses) {
      const matchingIncome = incomes.find(inc => inc.reference === expense.reference);
      if (matchingIncome) {
        transfers.push({
          _id: expense._id,
          fromAccount: expense.account,
          toAccount: matchingIncome.account,
          amount: expense.amount,
          description: expense.description,
          reference: expense.reference,
          date: expense.date,
          status: expense.status === 'paid' && matchingIncome.status === 'received' ? 'completed' : 'pending'
        });
      }
    }
    
    return JSON.parse(JSON.stringify(transfers));
  } catch (error) {
    throw new Error('Failed to fetch transfer history');
  }
}

export async function getTrialBalance() {
  try {
    await connectToDB();
    
    const accounts = await Account.find({ status: 'active' }).sort({ type: 1, name: 1 });
    
    const trialBalanceData = accounts.map(account => {
      const debit = account.balance >= 0 ? account.balance : 0;
      const credit = account.balance < 0 ? Math.abs(account.balance) : 0;
      
      return {
        _id: account._id,
        name: account.name,
        type: account.type,
        accountNumber: account.accountNumber,
        debit,
        credit,
        balance: account.balance
      };
    });
    
    const totalDebits = trialBalanceData.reduce((sum, acc) => sum + acc.debit, 0);
    const totalCredits = trialBalanceData.reduce((sum, acc) => sum + acc.credit, 0);
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
    
    return {
      accounts: trialBalanceData,
      totals: {
        debits: totalDebits,
        credits: totalCredits,
        difference: totalDebits - totalCredits,
        isBalanced
      },
      summary: {
        totalAccounts: accounts.length,
        asOfDate: new Date().toISOString()
      }
    };
  } catch (error) {
    throw new Error('Failed to generate trial balance');
  }
}

export async function getBalanceSheet() {
  try {
    await connectToDB();
    
    const accounts = await Account.find({ status: 'active' });
    
    // Assets
    const cashAccounts = accounts.filter(acc => acc.type === 'cash');
    const bankAccounts = accounts.filter(acc => acc.type === 'bank');
    const assetAccounts = accounts.filter(acc => acc.type === 'asset');
    
    const totalCash = cashAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalBank = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalAssets = assetAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    // Liabilities
    const liabilityAccounts = accounts.filter(acc => acc.type === 'liability');
    const creditAccounts = accounts.filter(acc => acc.type === 'credit');
    
    const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
    const totalCredit = creditAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
    
    // Equity
    const equityAccounts = accounts.filter(acc => acc.type === 'equity');
    const totalEquity = equityAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    // Calculate totals
    const totalCurrentAssets = totalCash + totalBank;
    const totalAllAssets = totalCurrentAssets + totalAssets;
    const totalAllLiabilities = totalLiabilities + totalCredit;
    const retainedEarnings = totalAllAssets - totalAllLiabilities - totalEquity;
    
    return {
      assets: {
        currentAssets: {
          cash: { accounts: cashAccounts, total: totalCash },
          bank: { accounts: bankAccounts, total: totalBank },
          total: totalCurrentAssets
        },
        fixedAssets: {
          assets: { accounts: assetAccounts, total: totalAssets },
          total: totalAssets
        },
        total: totalAllAssets
      },
      liabilities: {
        currentLiabilities: {
          payables: { accounts: liabilityAccounts, total: totalLiabilities },
          credit: { accounts: creditAccounts, total: totalCredit },
          total: totalAllLiabilities
        },
        total: totalAllLiabilities
      },
      equity: {
        capital: { accounts: equityAccounts, total: totalEquity },
        retainedEarnings,
        total: totalEquity + retainedEarnings
      },
      balanceCheck: totalAllAssets === (totalAllLiabilities + totalEquity + retainedEarnings)
    };
  } catch (error) {
    throw new Error('Failed to generate balance sheet');
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

export async function getPaymentAccountReport(startDate?: Date, endDate?: Date) {
  try {
    await connectToDB();
    
    const start = startDate || new Date(new Date().getFullYear(), 0, 1);
    const end = endDate || new Date();
    
    const [expenses, incomes, accounts] = await Promise.all([
      Expense.find({
        date: { $gte: start, $lte: end },
        status: 'paid'
      }).populate('account', 'name type'),
      Income.find({
        date: { $gte: start, $lte: end },
        status: 'received'
      }).populate('account', 'name type'),
      Account.find({ status: 'active' })
    ]);
    
    const accountSummary = accounts.map(account => {
      const accountExpenses = expenses.filter(exp => exp.account._id.toString() === account._id.toString());
      const accountIncomes = incomes.filter(inc => inc.account._id.toString() === account._id.toString());
      
      const totalExpenses = accountExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalIncomes = accountIncomes.reduce((sum, inc) => sum + inc.amount, 0);
      const netFlow = totalIncomes - totalExpenses;
      
      return {
        _id: account._id,
        name: account.name,
        type: account.type,
        currentBalance: account.balance,
        totalExpenses,
        totalIncomes,
        netFlow,
        transactionCount: accountExpenses.length + accountIncomes.length,
        transactions: [...accountExpenses.map(exp => ({ ...exp.toObject(), type: 'expense' })), 
                     ...accountIncomes.map(inc => ({ ...inc.toObject(), type: 'income' }))]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
    });
    
    const paymentMethodBreakdown = {};
    [...expenses, ...incomes].forEach(transaction => {
      const method = transaction.paymentMethod || 'Not Specified';
      if (!paymentMethodBreakdown[method]) {
        paymentMethodBreakdown[method] = { expenses: 0, incomes: 0, count: 0 };
      }
      if (transaction.constructor.modelName === 'Expense') {
        paymentMethodBreakdown[method].expenses += transaction.amount;
      } else {
        paymentMethodBreakdown[method].incomes += transaction.amount;
      }
      paymentMethodBreakdown[method].count++;
    });
    
    return {
      summary: {
        totalAccounts: accounts.length,
        totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
        totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
        totalIncomes: incomes.reduce((sum, inc) => sum + inc.amount, 0),
        totalTransactions: expenses.length + incomes.length,
        period: { start: start.toISOString(), end: end.toISOString() }
      },
      accounts: accountSummary,
      paymentMethods: paymentMethodBreakdown
    };
  } catch (error) {
    throw new Error('Failed to generate payment account report');
  }
}