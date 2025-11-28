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
import { CreditCard, Plus, DollarSign, Edit, Trash2, Eye, Search, ArrowUpDown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getAccounts, createAccount, updateAccount, deleteAccount, getAccountTransactions } from '@/lib/actions/accounts.actions';

interface Account {
  _id: string;
  name: string;
  type: string;
  balance: number;
  status: string;
  accountNumber?: string;
  bankName?: string;
  description?: string;
}

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: string;
  type: 'income' | 'expense';
  reference?: string;
}

export default function ListAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTransactionsDialog, setShowTransactionsDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newAccount, setNewAccount] = useState({
    name: '',
    type: '',
    accountNumber: '',
    bankName: '',
    description: ''
  });

  const [editAccount, setEditAccount] = useState({
    name: '',
    type: '',
    balance: 0,
    accountNumber: '',
    bankName: '',
    status: '',
    description: ''
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchTerm, typeFilter]);

  const loadAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let filtered = accounts;

    if (searchTerm) {
      filtered = filtered.filter(account =>
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(account => account.type === typeFilter);
    }

    setFilteredAccounts(filtered);
  };

  const handleCreateAccount = async () => {
    if (!newAccount.name || !newAccount.type) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      await createAccount(newAccount);
      setShowCreateDialog(false);
      setNewAccount({ name: '', type: '', accountNumber: '', bankName: '', description: '' });
      toast.success('Account created successfully');
      loadAccounts();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditAccount = async () => {
    if (!selectedAccount) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      await updateAccount(selectedAccount._id, editAccount);
      setShowEditDialog(false);
      setSelectedAccount(null);
      toast.success('Account updated successfully');
      loadAccounts();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update account';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to close this account? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteAccount(accountId);
      toast.success('Account closed successfully');
      loadAccounts();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to close account';
      toast.error(errorMessage);
    }
  };

  const handleViewTransactions = async (account: Account) => {
    setSelectedAccount(account);
    try {
      const data = await getAccountTransactions(account._id);
      setTransactions(data);
      setShowTransactionsDialog(true);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const openEditDialog = (account: Account) => {
    setSelectedAccount(account);
    setEditAccount({
      name: account.name,
      type: account.type,
      balance: account.balance,
      accountNumber: account.accountNumber || '',
      bankName: account.bankName || '',
      status: account.status,
      description: account.description || ''
    });
    setShowEditDialog(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cash': return 'bg-green-100 text-green-800';
      case 'bank': return 'bg-blue-100 text-blue-800';
      case 'credit': return 'bg-purple-100 text-purple-800';
      case 'asset': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

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
          <h1 className="text-3xl font-bold">Payment Accounts</h1>
          <p className="text-gray-600">Manage business payment accounts and balances</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Account Name</Label>
                <Input
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  placeholder="Enter account name"
                />
              </div>
              <div>
                <Label>Account Type</Label>
                <Select value={newAccount.type} onValueChange={(value) => setNewAccount({...newAccount, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Account Number</Label>
                  <Input
                    value={newAccount.accountNumber}
                    onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label>Bank Name</Label>
                  <Input
                    value={newAccount.bankName}
                    onChange={(e) => setNewAccount({...newAccount, bankName: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newAccount.description}
                  onChange={(e) => setNewAccount({...newAccount, description: e.target.value})}
                  placeholder="Account description"
                  rows={3}
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              <Button onClick={handleCreateAccount} className="w-full" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">₵{totalBalance.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Balance</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{accounts.filter(a => a.status === 'active').length}</div>
                <div className="text-sm text-gray-600">Active Accounts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{accounts.filter(a => a.type === 'bank').length}</div>
                <div className="text-sm text-gray-600">Bank Accounts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{accounts.filter(a => a.type === 'cash').length}</div>
                <div className="text-sm text-gray-600">Cash Accounts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank">Bank</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="asset">Asset</SelectItem>
                <SelectItem value="liability">Liability</SelectItem>
                <SelectItem value="equity">Equity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((account) => (
          <Card key={account._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{account.name}</CardTitle>
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <Badge className={getTypeColor(account.type)}>
                    {account.type}
                  </Badge>
                </div>
                {account.accountNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Account #:</span>
                    <span className="text-sm font-medium">{account.accountNumber}</span>
                  </div>
                )}
                {account.bankName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bank:</span>
                    <span className="text-sm font-medium">{account.bankName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Balance:</span>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className={`text-lg font-bold ${
                      account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ₵{account.balance.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getStatusColor(account.status)}>
                    {account.status}
                  </Badge>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewTransactions(account)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(account)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteAccount(account._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Account Name</Label>
              <Input
                value={editAccount.name}
                onChange={(e) => setEditAccount({...editAccount, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Balance</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editAccount.balance}
                  onChange={(e) => setEditAccount({...editAccount, balance: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editAccount.status} onValueChange={(value) => setEditAccount({...editAccount, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            <Button onClick={handleEditAccount} className="w-full" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                'Update Account'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transactions Dialog */}
      <Dialog open={showTransactionsDialog} onOpenChange={setShowTransactionsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5" />
              {selectedAccount?.name} - Recent Transactions
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-600">
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                    </div>
                    {transaction.reference && (
                      <div className="text-xs text-gray-500">Ref: {transaction.reference}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}₵{transaction.amount.toFixed(2)}
                    </div>
                    <Badge className={transaction.status === 'paid' || transaction.status === 'received' ? 
                      'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No transactions found for this account
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}