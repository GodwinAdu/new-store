'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRightLeft, Plus, DollarSign, CreditCard, AlertCircle } from 'lucide-react';
import { getAccounts, transferFunds } from '@/lib/actions/accounts.actions';

interface Account {
  _id: string;
  name: string;
  type: string;
  balance: number;
  status: string;
}

export default function Transfer() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);

  const [transferData, setTransferData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: 0,
    description: '',
    reference: ''
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data.filter(acc => acc.status === 'active'));
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferData.fromAccountId || !transferData.toAccountId || transferData.amount <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    if (transferData.fromAccountId === transferData.toAccountId) {
      alert('Cannot transfer to the same account');
      return;
    }

    const fromAccount = accounts.find(acc => acc._id === transferData.fromAccountId);
    if (fromAccount && fromAccount.balance < transferData.amount) {
      alert('Insufficient funds in source account');
      return;
    }

    setTransferring(true);
    try {
      await transferFunds(transferData);
      setShowTransferDialog(false);
      setTransferData({
        fromAccountId: '',
        toAccountId: '',
        amount: 0,
        description: '',
        reference: ''
      });
      loadAccounts();
      alert('Transfer completed successfully!');
    } catch (error) {
      console.error('Failed to transfer funds:', error);
      alert('Transfer failed. Please try again.');
    } finally {
      setTransferring(false);
    }
  };

  const getFromAccount = () => accounts.find(acc => acc._id === transferData.fromAccountId);
  const getToAccount = () => accounts.find(acc => acc._id === transferData.toAccountId);

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const cashAccounts = accounts.filter(acc => acc.type === 'cash');
  const bankAccounts = accounts.filter(acc => acc.type === 'bank');

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
          <h1 className="text-3xl font-bold">Fund Transfer</h1>
          <p className="text-gray-600">Transfer funds between accounts</p>
        </div>
        <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
          <DialogTrigger asChild>
            <Button>
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              New Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transfer Funds</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Account Selection */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>From Account</Label>
                  <Select value={transferData.fromAccountId} onValueChange={(value) => setTransferData({...transferData, fromAccountId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account._id} value={account._id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{account.name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              ${account.balance.toLocaleString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFromAccount() && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{getFromAccount()?.name}</span>
                        <span className="text-sm text-blue-600">
                          Balance: ${getFromAccount()?.balance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>To Account</Label>
                  <Select value={transferData.toAccountId} onValueChange={(value) => setTransferData({...transferData, toAccountId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.filter(acc => acc._id !== transferData.fromAccountId).map((account) => (
                        <SelectItem key={account._id} value={account._id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{account.name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              ${account.balance.toLocaleString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getToAccount() && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{getToAccount()?.name}</span>
                        <span className="text-sm text-green-600">
                          Balance: ${getToAccount()?.balance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Transfer Arrow */}
              {transferData.fromAccountId && transferData.toAccountId && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <ArrowRightLeft className="h-6 w-6 text-blue-600" />
                    <span className="text-sm font-medium">
                      {getFromAccount()?.name} → {getToAccount()?.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Amount and Details */}
              <div className="space-y-4">
                <div>
                  <Label>Transfer Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      step="0.01"
                      value={transferData.amount}
                      onChange={(e) => setTransferData({...transferData, amount: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                  {getFromAccount() && transferData.amount > getFromAccount()!.balance && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      Insufficient funds. Available: ${getFromAccount()!.balance.toLocaleString()}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={transferData.description}
                    onChange={(e) => setTransferData({...transferData, description: e.target.value})}
                    placeholder="Enter transfer description"
                  />
                </div>

                <div>
                  <Label>Reference (Optional)</Label>
                  <Input
                    value={transferData.reference}
                    onChange={(e) => setTransferData({...transferData, reference: e.target.value})}
                    placeholder="Transaction reference"
                  />
                </div>
              </div>

              {/* Transfer Summary */}
              {transferData.fromAccountId && transferData.toAccountId && transferData.amount > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Transfer Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>From:</span>
                      <span>{getFromAccount()?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>To:</span>
                      <span>{getToAccount()?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium">${transferData.amount.toLocaleString()}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between">
                      <span>New balance ({getFromAccount()?.name}):</span>
                      <span>${(getFromAccount()!.balance - transferData.amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New balance ({getToAccount()?.name}):</span>
                      <span>${(getToAccount()!.balance + transferData.amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleTransfer} 
                disabled={transferring || !transferData.fromAccountId || !transferData.toAccountId || transferData.amount <= 0}
                className="w-full"
              >
                {transferring ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                )}
                {transferring ? 'Processing Transfer...' : 'Complete Transfer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
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
                <div className="text-2xl font-bold">{bankAccounts.length}</div>
                <div className="text-sm text-gray-600">Bank Accounts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{cashAccounts.length}</div>
                <div className="text-sm text-gray-600">Cash Accounts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accounts.map((account) => (
                <div key={account._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-sm text-gray-600 capitalize">{account.type} Account</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${account.balance.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Transfer Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium">Instant Transfers</div>
                  <div className="text-gray-600">Transfers between accounts are processed immediately</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium">Transaction Records</div>
                  <div className="text-gray-600">All transfers are automatically recorded in both accounts</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium">Balance Validation</div>
                  <div className="text-gray-600">System checks for sufficient funds before processing</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium">Reference Tracking</div>
                  <div className="text-gray-600">Add references to track transfer purposes</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}