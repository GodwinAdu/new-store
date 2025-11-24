'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { TrendingDown, Plus, Calendar, Edit, Trash2, Search, Filter } from 'lucide-react';
import { getExpenses, createExpense, updateExpense, deleteExpense, getAccounts } from '@/lib/actions/accounts.actions';
import PermissionGuard, { useAuth } from '@/components/auth/PermissionGuard';

interface Expense {
  _id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
  account: {
    _id: string;
    name: string;
    type: string;
  };
}

interface Account {
  _id: string;
  name: string;
  type: string;
  balance: number;
}

export default function Expenses() {
  const { hasPermission } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    category: '',
    accountId: '',
    paymentMethod: '',
    reference: '',
    notes: ''
  });

  const [editExpense, setEditExpense] = useState({
    description: '',
    amount: 0,
    category: '',
    status: '',
    paymentMethod: '',
    reference: '',
    notes: ''
  });

  const categories = ['Rent', 'Utilities', 'Marketing', 'Equipment', 'Travel', 'Supplies', 'Insurance', 'Professional Services', 'Other'];
  const paymentMethods = ['Cash', 'Bank Transfer', 'Credit Card', 'Check', 'Online Payment'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, statusFilter, categoryFilter]);

  const loadData = async () => {
    try {
      const [expensesData, accountsData] = await Promise.all([
        getExpenses(),
        getAccounts()
      ]);
      setExpenses(expensesData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExpenses = () => {
    let filtered = expenses;

    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.reference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(expense => expense.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    setFilteredExpenses(filtered);
  };

  const handleCreateExpense = async () => {
    try {
      await createExpense(newExpense);
      setShowCreateDialog(false);
      setNewExpense({ description: '', amount: 0, category: '', accountId: '', paymentMethod: '', reference: '', notes: '' });
      loadData();
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  };

  const handleEditExpense = async () => {
    if (!selectedExpense) return;
    try {
      await updateExpense(selectedExpense._id, editExpense);
      setShowEditDialog(false);
      setSelectedExpense(null);
      loadData();
    } catch (error) {
      console.error('Failed to update expense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(expenseId);
        loadData();
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const openEditDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setEditExpense({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      status: expense.status,
      paymentMethod: expense.paymentMethod || '',
      reference: expense.reference || '',
      notes: expense.notes || ''
    });
    setShowEditDialog(true);
  };

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const paidExpenses = filteredExpenses.filter(e => e.status === 'paid').reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = filteredExpenses.filter(e => e.status === 'pending').reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Expenses</h1>
            <p className="text-gray-600">Track and manage business expenses</p>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({length: 3}).map((_, i) => (
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
        <div className="bg-white rounded-lg border p-6">
          <div className="flex gap-4">
            <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-6 space-y-4">
          {Array.from({length: 5}).map((_, i) => (
            <div key={i} className="flex justify-between items-center p-4 border rounded">
              <div className="space-y-2">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right space-y-1">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
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
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-gray-600">Track and manage business expenses</p>
        </div>
        <PermissionGuard permission="addExpenses">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Description</Label>
                <Input
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  placeholder="Enter expense description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={newExpense.category} onValueChange={(value) => setNewExpense({...newExpense, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Account</Label>
                  <Select value={newExpense.accountId} onValueChange={(value) => setNewExpense({...newExpense, accountId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account._id} value={account._id}>
                          {account.name} (${account.balance.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select value={newExpense.paymentMethod} onValueChange={(value) => setNewExpense({...newExpense, paymentMethod: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Reference</Label>
                <Input
                  value={newExpense.reference}
                  onChange={(e) => setNewExpense({...newExpense, reference: e.target.value})}
                  placeholder="Invoice number, receipt ID, etc."
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                  placeholder="Additional notes"
                  rows={3}
                />
              </div>
              <Button onClick={handleCreateExpense} className="w-full">
                Add Expense
              </Button>
            </div>
          </DialogContent>
          </Dialog>
        </PermissionGuard>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredExpenses.length} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${paidExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredExpenses.filter(e => e.status === 'paid').length} paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${pendingExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredExpenses.filter(e => e.status === 'pending').length} pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Records ({filteredExpenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <div key={expense._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium">{expense.description}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(expense.date).toLocaleDateString()} • {expense.category}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Account: {expense.account.name}
                    {expense.paymentMethod && ` • ${expense.paymentMethod}`}
                    {expense.reference && ` • Ref: ${expense.reference}`}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-red-600">${expense.amount.toLocaleString()}</div>
                    <Badge className={expense.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                    expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'}>
                      {expense.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <PermissionGuard permission="editExpenses">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(expense)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </PermissionGuard>
                    <PermissionGuard permission="deleteExpenses">
                      <Button variant="outline" size="sm" onClick={() => handleDeleteExpense(expense._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
              </div>
            ))}
            {filteredExpenses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingDown className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
                <p className="text-gray-500 mb-4">Record your first expense to get started</p>
                <PermissionGuard permission="addExpenses">
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </PermissionGuard>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Description</Label>
              <Input
                value={editExpense.description}
                onChange={(e) => setEditExpense({...editExpense, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editExpense.amount}
                  onChange={(e) => setEditExpense({...editExpense, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editExpense.status} onValueChange={(value) => setEditExpense({...editExpense, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={editExpense.notes}
                onChange={(e) => setEditExpense({...editExpense, notes: e.target.value})}
                rows={3}
              />
            </div>
            <Button onClick={handleEditExpense} className="w-full">
              Update Expense
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}