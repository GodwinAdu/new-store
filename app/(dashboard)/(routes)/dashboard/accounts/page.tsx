'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, PieChart, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getAccountsSummary, getMonthlyReport, getAccounts } from '@/lib/actions/accounts.actions';
import Link from 'next/link';

interface AccountsSummary {
  totalBalance: number;
  totalExpenses: number;
  totalIncomes: number;
  netProfit: number;
  accountsCount: number;
  expensesCount: number;
  incomesCount: number;
}

interface MonthlyReport {
  period: string;
  totalExpenses: number;
  totalIncomes: number;
  expensesByCategory: Record<string, number>;
  incomesByCategory: Record<string, number>;
  transactions: any[];
}

export default function AccountsPage() {
  const [summary, setSummary] = useState<AccountsSummary | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadMonthlyReport();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      const [summaryData, accountsData] = await Promise.all([
        getAccountsSummary(),
        getAccounts()
      ]);
      setSummary(summaryData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyReport = async () => {
    try {
      const reportData = await getMonthlyReport(selectedYear, selectedMonth);
      setMonthlyReport(reportData);
    } catch (error) {
      console.error('Failed to load monthly report:', error);
    }
  };

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Accounts Management</h1>
            <p className="text-gray-600">Manage your financial accounts and transactions</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({length: 4}).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6 space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Accounts Management</h1>
          <p className="text-gray-600">Manage your financial accounts and transactions</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({length: 12}, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {getMonthName(i + 1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary?.totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.accountsCount} active accounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${summary?.totalIncomes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.incomesCount} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${summary?.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.expensesCount} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary?.netProfit && summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${summary?.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Report */}
      {monthlyReport && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Summary - {getMonthName(selectedMonth)} {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Income</span>
                  </div>
                  <span className="font-bold text-green-600">${monthlyReport.totalIncomes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Expenses</span>
                  </div>
                  <span className="font-bold text-red-600">${monthlyReport.totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded border-t">
                  <span className="font-medium">Net Result</span>
                  <span className={`font-bold ${monthlyReport.totalIncomes - monthlyReport.totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(monthlyReport.totalIncomes - monthlyReport.totalExpenses).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">Income Categories</h4>
                  {Object.entries(monthlyReport.incomesByCategory).slice(0, 3).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center py-1">
                      <span className="text-sm">{category}</span>
                      <span className="text-sm font-medium">${(amount as number).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium text-red-600 mb-2">Expense Categories</h4>
                  {Object.entries(monthlyReport.expensesByCategory).slice(0, 3).map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center py-1">
                      <span className="text-sm">{category}</span>
                      <span className="text-sm font-medium">${(amount as number).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/accounts/list-accounts">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <CreditCard className="h-6 w-6" />
                <span className="text-sm">Manage Accounts</span>
              </Button>
            </Link>
            <Link href="/dashboard/accounts/expenses">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <TrendingDown className="h-6 w-6" />
                <span className="text-sm">Record Expense</span>
              </Button>
            </Link>
            <Link href="/dashboard/accounts/income">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Record Income</span>
              </Button>
            </Link>
            <Link href="/dashboard/accounts/fund-transfer">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <ArrowUpRight className="h-6 w-6" />
                <span className="text-sm">Transfer Funds</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts.slice(0, 5).map((account: any) => (
              <div key={account._id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <h4 className="font-medium">{account.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{account.type} Account</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${account.balance.toLocaleString()}</p>
                  <Badge className={account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {account.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}