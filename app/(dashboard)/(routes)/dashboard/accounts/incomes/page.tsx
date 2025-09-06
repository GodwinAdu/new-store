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
import { TrendingUp, Plus, Calendar, Edit, Trash2, Search } from 'lucide-react';
import { getIncomes, createIncome, updateIncome, deleteIncome, getAccounts } from '@/lib/actions/accounts.actions';

interface Income {
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

export default function Incomes() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [filteredIncomes, setFilteredIncomes] = useState<Income[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [newIncome, setNewIncome] = useState({
    description: '',
    amount: 0,
    category: '',
    accountId: '',
    paymentMethod: '',
    reference: '',
    notes: ''
  });

  const [editIncome, setEditIncome] = useState({
    description: '',
    amount: 0,
    category: '',
    status: '',
    paymentMethod: '',
    reference: '',
    notes: ''
  });

  const categories = ['Sales', 'Services', 'Consulting', 'Investment', 'Rental', 'Commission', 'Interest', 'Other'];
  const paymentMethods = ['Cash', 'Bank Transfer', 'Credit Card', 'Check', 'Online Payment'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterIncomes();
  }, [incomes, searchTerm, statusFilter, categoryFilter]);

  const loadData = async () => {
    try {
      const [incomesData, accountsData] = await Promise.all([
        getIncomes(),
        getAccounts()
      ]);
      setIncomes(incomesData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterIncomes = () => {
    let filtered = incomes;

    if (searchTerm) {
      filtered = filtered.filter(income =>
        income.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        income.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        income.reference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(income => income.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(income => income.category === categoryFilter);
    }

    setFilteredIncomes(filtered);
  };

  const handleCreateIncome = async () => {
    try {
      await createIncome(newIncome);
      setShowCreateDialog(false);
      setNewIncome({ description: '', amount: 0, category: '', accountId: '', paymentMethod: '', reference: '', notes: '' });
      loadData();
    } catch (error) {
      console.error('Failed to create income:', error);
    }
  };

  const handleEditIncome = async () => {
    if (!selectedIncome) return;
    try {
      await updateIncome(selectedIncome._id, editIncome);
      setShowEditDialog(false);
      setSelectedIncome(null);
      loadData();
    } catch (error) {
      console.error('Failed to update income:', error);
    }
  };

  const handleDeleteIncome = async (incomeId: string) => {
    if (confirm('Are you sure you want to delete this income record?')) {
      try {
        await deleteIncome(incomeId);
        loadData();
      } catch (error) {
        console.error('Failed to delete income:', error);
      }
    }
  };

  const openEditDialog = (income: Income) => {
    setSelectedIncome(income);
    setEditIncome({
      description: income.description,
      amount: income.amount,
      category: income.category,
      status: income.status,
      paymentMethod: income.paymentMethod || '',
      reference: income.reference || '',
      notes: income.notes || ''
    });
    setShowEditDialog(true);
  };

  const totalIncomes = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  const receivedIncomes = filteredIncomes.filter(i => i.status === 'received').reduce((sum, income) => sum + income.amount, 0);
  const pendingIncomes = filteredIncomes.filter(i => i.status === 'pending').reduce((sum, income) => sum + income.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Income</h1>
          <p className="text-gray-600">Track and manage business income sources</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Income</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Description</Label>
                <Input
                  value={newIncome.description}
                  onChange={(e) => setNewIncome({...newIncome, description: e.target.value})}
                  placeholder="Enter income description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({...newIncome, amount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={newIncome.category} onValueChange={(value) => setNewIncome({...newIncome, category: value})}>
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
                  <Select value={newIncome.accountId} onValueChange={(value) => setNewIncome({...newIncome, accountId: value})}>
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
                  <Select value={newIncome.paymentMethod} onValueChange={(value) => setNewIncome({...newIncome, paymentMethod: value})}>
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
                  value={newIncome.reference}
                  onChange={(e) => setNewIncome({...newIncome, reference: e.target.value})}
                  placeholder="Invoice number, transaction ID, etc."
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={newIncome.notes}
                  onChange={(e) => setNewIncome({...newIncome, notes: e.target.value})}
                  placeholder="Additional notes"
                  rows={3}
                />
              </div>
              <Button onClick={handleCreateIncome} className="w-full">
                Add Income
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalIncomes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredIncomes.length} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${receivedIncomes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredIncomes.filter(i => i.status === 'received').length} received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${pendingIncomes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredIncomes.filter(i => i.status === 'pending').length} pending</p>
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
                  placeholder="Search income records..."
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
                <SelectItem value="received">Received</SelectItem>
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

      {/* Income List */}
      <Card>
        <CardHeader>
          <CardTitle>Income Records ({filteredIncomes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredIncomes.map((income) => (
              <div key={income._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium">{income.description}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(income.date).toLocaleDateString()} • {income.category}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Account: {income.account.name}
                    {income.paymentMethod && ` • ${income.paymentMethod}`}
                    {income.reference && ` • Ref: ${income.reference}`}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-green-600">${income.amount.toLocaleString()}</div>
                    <Badge className={income.status === 'received' ? 'bg-green-100 text-green-800' : 
                                    income.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'}>
                      {income.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(income)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteIncome(income._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredIncomes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No income records found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Income</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Description</Label>
              <Input
                value={editIncome.description}
                onChange={(e) => setEditIncome({...editIncome, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editIncome.amount}
                  onChange={(e) => setEditIncome({...editIncome, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editIncome.status} onValueChange={(value) => setEditIncome({...editIncome, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={editIncome.notes}
                onChange={(e) => setEditIncome({...editIncome, notes: e.target.value})}
                rows={3}
              />
            </div>
            <Button onClick={handleEditIncome} className="w-full">
              Update Income
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}