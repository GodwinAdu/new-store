'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { getBalanceSheetData } from '@/lib/actions/accounts.actions';

interface BalanceSheetData {
  assets: {
    current: Array<{ name: string; amount: number }>;
    fixed: Array<{ name: string; amount: number }>;
  };
  liabilities: {
    current: Array<{ name: string; amount: number }>;
    longTerm: Array<{ name: string; amount: number }>;
  };
  equity: Array<{ name: string; amount: number }>;
}

export default function BalanceSheet() {
  const [balanceSheetData, setBalanceSheetData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalanceSheetData();
  }, []);

  const loadBalanceSheetData = async () => {
    try {
      const data = await getBalanceSheetData();
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

  const totalCurrentAssets = balanceSheetData.assets.current.reduce((sum, item) => sum + item.amount, 0);
  const totalFixedAssets = balanceSheetData.assets.fixed.reduce((sum, item) => sum + item.amount, 0);
  const totalAssets = totalCurrentAssets + totalFixedAssets;

  const totalCurrentLiabilities = balanceSheetData.liabilities.current.reduce((sum, item) => sum + item.amount, 0);
  const totalLongTermLiabilities = balanceSheetData.liabilities.longTerm.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const totalEquity = balanceSheetData.equity.reduce((sum, item) => sum + item.amount, 0);

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
                {balanceSheetData.assets.current.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Total Current Assets</span>
                  <span>${totalCurrentAssets.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Fixed Assets</h4>
              <div className="space-y-2">
                {balanceSheetData.assets.fixed.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Total Fixed Assets</span>
                  <span>${totalFixedAssets.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Assets</span>
                <span>${totalAssets.toLocaleString()}</span>
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
                {balanceSheetData.liabilities.current.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Total Current Liabilities</span>
                  <span>${totalCurrentLiabilities.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Long-term Liabilities</h4>
              <div className="space-y-2">
                {balanceSheetData.liabilities.longTerm.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Total Long-term Liabilities</span>
                  <span>${totalLongTermLiabilities.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Liabilities</span>
                <span>${totalLiabilities.toLocaleString()}</span>
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
              {balanceSheetData.equity.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span>${item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t-2 pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Equity</span>
                <span>${totalEquity.toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t pt-2 mt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Liabilities + Equity</span>
                <span>${(totalLiabilities + totalEquity).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}