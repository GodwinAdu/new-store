'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { getBalanceSheet } from '@/lib/actions/accounts.actions';

interface BalanceSheetData {
  assets: {
    currentAssets: {
      cash: { accounts: any[]; total: number };
      bank: { accounts: any[]; total: number };
      total: number;
    };
    fixedAssets: {
      assets: { accounts: any[]; total: number };
      total: number;
    };
    total: number;
  };
  liabilities: {
    currentLiabilities: {
      payables: { accounts: any[]; total: number };
      credit: { accounts: any[]; total: number };
      total: number;
    };
    total: number;
  };
  equity: {
    capital: { accounts: any[]; total: number };
    retainedEarnings: number;
    total: number;
  };
  balanceCheck: boolean;
}

export default function BalanceSheet() {
  const [balanceSheetData, setBalanceSheetData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalanceSheetData();
  }, []);

  const loadBalanceSheetData = async () => {
    try {
      const data = await getBalanceSheet();
      setBalanceSheetData(data);
    } catch (error) {
      console.error('Failed to load balance sheet data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!balanceSheetData) {
    return <div>Failed to load balance sheet data</div>;
  }

  const { assets, liabilities, equity } = balanceSheetData;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Balance Sheet</h1>
          <p className="text-gray-600">Financial position as of {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Current Assets</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cash Accounts ({assets.currentAssets.cash.accounts.length})</span>
                  <span>₵{assets.currentAssets.cash.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Bank Accounts ({assets.currentAssets.bank.accounts.length})</span>
                  <span>₵{assets.currentAssets.bank.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Total Current Assets</span>
                  <span>₵{assets.currentAssets.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Fixed Assets</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Asset Accounts ({assets.fixedAssets.assets.accounts.length})</span>
                  <span>₵{assets.fixedAssets.assets.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Total Fixed Assets</span>
                  <span>₵{assets.fixedAssets.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Assets</span>
                <span>₵{assets.total.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Liabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Current Liabilities</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Payables ({liabilities.currentLiabilities.payables.accounts.length})</span>
                  <span>₵{liabilities.currentLiabilities.payables.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Credit Accounts ({liabilities.currentLiabilities.credit.accounts.length})</span>
                  <span>₵{liabilities.currentLiabilities.credit.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Total Current Liabilities</span>
                  <span>₵{liabilities.currentLiabilities.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Liabilities</span>
                <span>₵{liabilities.total.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Equity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Capital ({equity.capital.accounts.length} accounts)</span>
                <span>₵{equity.capital.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Retained Earnings</span>
                <span className={equity.retainedEarnings >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ₵{equity.retainedEarnings.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="border-t-2 pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Equity</span>
                <span>₵{equity.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t pt-2 mt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Liabilities + Equity</span>
                <span>₵{(liabilities.total + equity.total).toLocaleString()}</span>
              </div>
            </div>
            
            {balanceSheetData.balanceCheck ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                <div className="flex items-center gap-2 text-green-800">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm font-medium">Balance Sheet is balanced</span>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                <div className="flex items-center gap-2 text-red-800">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm font-medium">Balance Sheet is not balanced</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}