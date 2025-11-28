'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, Download, RotateCcw, TrendingUp, Search, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getPurchaseReturnReport } from '@/lib/actions/purchase-return-report.actions';
import { toast } from 'sonner';

interface PurchaseReturnReportData {
  summary: {
    totalReturns: number;
    totalQuantityReturned: number;
    totalRefundAmount: number;
    returnRate: number;
    period: { start: string; end: string };
  };
  returns: Array<{
    _id: string;
    returnDate: string;
    originalPurchaseId: string;
    supplierName: string;
    productName: string;
    quantityReturned: number;
    refundAmount: number;
    reason: string;
    status: string;
  }>;
  reasonBreakdown: Array<{
    reason: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  supplierReturns: Array<{
    supplierName: string;
    quantityReturned: number;
    refundAmount: number;
  }>;
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export default function PurchaseReturnReportPage() {
  const [reportData, setReportData] = useState<PurchaseReturnReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await getPurchaseReturnReport(new Date(startDate), new Date(endDate));
      setReportData(data);
    } catch (error) {
      console.error('Error fetching purchase return report:', error);
      toast.error('Failed to fetch purchase return report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExport = () => {
    if (!reportData) return;
    
    const csvContent = [
      ['Purchase Return Report'],
      [`Period: ${new Date(reportData.summary.period.start).toLocaleDateString()} - ${new Date(reportData.summary.period.end).toLocaleDateString()}`],
      ['Generated:', new Date().toLocaleString()],
      [''],
      ['SUMMARY'],
      ['Total Returns', reportData.summary.totalReturns],
      ['Total Quantity Returned', reportData.summary.totalQuantityReturned],
      ['Total Refund Amount', `₵${reportData.summary.totalRefundAmount.toLocaleString()}`],
      ['Return Rate', `${reportData.summary.returnRate.toFixed(2)}%`],
      [''],
      ['RETURN DETAILS'],
      ['Date', 'Purchase ID', 'Supplier', 'Product', 'Quantity', 'Refund Amount', 'Reason', 'Status'],
      ...reportData.returns.map(returnItem => [
        new Date(returnItem.returnDate).toLocaleDateString(),
        returnItem.originalPurchaseId,
        returnItem.supplierName,
        returnItem.productName,
        returnItem.quantityReturned,
        `₵${returnItem.refundAmount.toLocaleString()}`,
        returnItem.reason,
        returnItem.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-return-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  const filteredReturns = reportData?.returns.filter(returnItem =>
    returnItem.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.productName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Generating purchase return report...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load purchase return report</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Return Report</h1>
          <p className="text-gray-600">Analysis of returns to suppliers and refunds</p>
          <p className="text-sm text-muted-foreground">
            Period: {new Date(reportData.summary.period.start).toLocaleDateString()} - {new Date(reportData.summary.period.end).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchReport} disabled={loading} variant="outline">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
          </Button>
          <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Report Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={fetchReport} className="bg-blue-600 hover:bg-blue-700">
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalReturns}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <RotateCcw className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quantity Returned</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalQuantityReturned.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Refund Amount</p>
                <p className="text-2xl font-bold text-green-600">₵{reportData.summary.totalRefundAmount.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Return Rate</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.summary.returnRate.toFixed(1)}%</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <RotateCcw className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Return Reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Return Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.reasonBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ reason, percentage }) => `${reason} ${percentage.toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {reportData.reasonBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [Number(value), 'Returns']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Returns */}
        <Card>
          <CardHeader>
            <CardTitle>Returns by Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.supplierReturns.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="supplierName" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₵${Number(value).toLocaleString()}`, 'Refund']} />
                  <Bar dataKey="refundAmount" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search returns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Returns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Return Details ({filteredReturns.length} returns)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Purchase ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Refund Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturns.map((returnItem) => (
                  <TableRow key={returnItem._id}>
                    <TableCell>{new Date(returnItem.returnDate).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{returnItem.originalPurchaseId}</TableCell>
                    <TableCell>{returnItem.supplierName}</TableCell>
                    <TableCell>{returnItem.productName}</TableCell>
                    <TableCell>{returnItem.quantityReturned}</TableCell>
                    <TableCell className="text-green-600 font-medium">₵{returnItem.refundAmount.toLocaleString()}</TableCell>
                    <TableCell>{returnItem.reason}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(returnItem.status)}>
                        {returnItem.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredReturns.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No returns found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}