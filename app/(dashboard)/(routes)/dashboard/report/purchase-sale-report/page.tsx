'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getPurchaseSaleReport } from '@/lib/actions/purchase-sale-report.actions';

interface ProductComparison {
  productId: string;
  productName: string;
  category: string;
  totalPurchased: number;
  totalSold: number;
  purchaseCost: number;
  saleRevenue: number;
  grossProfit: number;
  profitMargin: number;
  turnoverRate: number;
}

interface ReportData {
  summary: {
    totalPurchaseCost: number;
    totalSaleRevenue: number;
    grossProfit: number;
    profitMargin: number;
    totalProducts: number;
    period: { start: string; end: string };
  };
  products: ProductComparison[];
  monthlyTrend: Array<{
    month: string;
    purchases: number;
    sales: number;
    profit: number;
  }>;
  categoryAnalysis: Array<{
    category: string;
    purchaseCost: number;
    saleRevenue: number;
    profit: number;
    margin: number;
  }>;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function PurchaseSaleReportPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await getPurchaseSaleReport(startDate, endDate);
      setReportData(data);
    } catch (error) {
      console.error('Error fetching purchase-sale report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const filteredProducts = reportData?.products.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const exportToCSV = () => {
    if (!reportData) return;
    
    const csvContent = [
      ['Product Name', 'Category', 'Purchased Qty', 'Sold Qty', 'Purchase Cost (₵)', 'Sale Revenue (₵)', 'Gross Profit (₵)', 'Profit Margin (%)', 'Turnover Rate'].join(','),
      ...filteredProducts.map(product => [
        product.productName,
        product.category,
        product.totalPurchased,
        product.totalSold,
        product.purchaseCost.toFixed(2),
        product.saleRevenue.toFixed(2),
        product.grossProfit.toFixed(2),
        product.profitMargin.toFixed(2),
        product.turnoverRate.toFixed(2)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-sale-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Purchase vs Sale Report</h1>
          <p className="text-muted-foreground">Compare purchase costs with sales revenue and analyze profitability</p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Date Range Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={(date) => date && setStartDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={(date) => date && setEndDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{reportData.summary.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Purchase Cost</p>
                  <p className="text-2xl font-bold">₵{reportData.summary.totalPurchaseCost.toLocaleString()}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sale Revenue</p>
                  <p className="text-2xl font-bold">₵{reportData.summary.totalSaleRevenue.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gross Profit</p>
                  <p className="text-2xl font-bold text-green-600">₵{reportData.summary.grossProfit.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                  <p className="text-2xl font-bold">{reportData.summary.profitMargin.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {reportData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any, name: string) => [`₵${value.toLocaleString()}`, name === 'purchases' ? 'Purchases' : name === 'sales' ? 'Sales' : 'Profit']} />
                  <Line type="monotone" dataKey="purchases" stroke="#ef4444" strokeWidth={2} name="purchases" />
                  <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} name="sales" />
                  <Line type="monotone" dataKey="profit" stroke="#8b5cf6" strokeWidth={2} name="profit" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.categoryAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value: any, name: string) => [`₵${value.toLocaleString()}`, name === 'purchaseCost' ? 'Purchase Cost' : name === 'saleRevenue' ? 'Sale Revenue' : 'Profit']} />
                  <Bar dataKey="purchaseCost" fill="#ef4444" />
                  <Bar dataKey="saleRevenue" fill="#10b981" />
                  <Bar dataKey="profit" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Product Comparison</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Product</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-right p-2">Purchased</th>
                  <th className="text-right p-2">Sold</th>
                  <th className="text-right p-2">Purchase Cost</th>
                  <th className="text-right p-2">Sale Revenue</th>
                  <th className="text-right p-2">Gross Profit</th>
                  <th className="text-right p-2">Margin %</th>
                  <th className="text-right p-2">Turnover</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.productId} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{product.productName}</td>
                    <td className="p-2 text-muted-foreground">{product.category}</td>
                    <td className="p-2 text-right">{product.totalPurchased}</td>
                    <td className="p-2 text-right">{product.totalSold}</td>
                    <td className="p-2 text-right">₵{product.purchaseCost.toLocaleString()}</td>
                    <td className="p-2 text-right">₵{product.saleRevenue.toLocaleString()}</td>
                    <td className={`p-2 text-right ${product.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₵{product.grossProfit.toLocaleString()}
                    </td>
                    <td className={`p-2 text-right ${product.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.profitMargin.toFixed(1)}%
                    </td>
                    <td className="p-2 text-right">{product.turnoverRate.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No products found matching your search criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}