'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getTrendingProductReport } from '@/lib/actions/trending-product-report.actions';

interface TrendingProduct {
  productId: string;
  productName: string;
  category: string;
  currentPeriodSales: number;
  previousPeriodSales: number;
  growthRate: number;
  totalRevenue: number;
  averagePrice: number;
  trendDirection: 'up' | 'down' | 'stable';
  salesVelocity: number;
  rank: number;
}

interface ReportData {
  summary: {
    totalProducts: number;
    trendingUp: number;
    trendingDown: number;
    stable: number;
    totalRevenue: number;
    period: { start: string; end: string };
  };
  products: TrendingProduct[];
  categoryTrends: Array<{
    category: string;
    totalSales: number;
    growthRate: number;
    productCount: number;
  }>;
  salesTrend: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function TrendingProductReportPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await getTrendingProductReport(startDate, endDate);
      setReportData(data);
    } catch (error) {
      console.error('Error fetching trending product report:', error);
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
      ['Product Name', 'Category', 'Current Sales', 'Previous Sales', 'Growth Rate (%)', 'Revenue (₵)', 'Trend', 'Rank'].join(','),
      ...filteredProducts.map(product => [
        product.productName,
        product.category,
        product.currentPeriodSales,
        product.previousPeriodSales,
        product.growthRate.toFixed(2),
        product.totalRevenue.toFixed(2),
        product.trendDirection,
        product.rank
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trending-products-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendBadge = (direction: string, rate: number) => {
    const color = direction === 'up' ? 'bg-green-100 text-green-800' : 
                  direction === 'down' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800';
    
    return (
      <Badge className={color}>
        {direction === 'stable' ? 'Stable' : `${rate > 0 ? '+' : ''}${rate.toFixed(1)}%`}
      </Badge>
    );
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
          <h1 className="text-3xl font-bold">Trending Products Report</h1>
          <p className="text-muted-foreground">Analyze product performance and identify trending items</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Trending Up</p>
                  <p className="text-2xl font-bold text-green-600">{reportData.summary.trendingUp}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trending Down</p>
                  <p className="text-2xl font-bold text-red-600">{reportData.summary.trendingDown}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stable</p>
                  <p className="text-2xl font-bold text-gray-600">{reportData.summary.stable}</p>
                </div>
                <Minus className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₵{reportData.summary.totalRevenue.toLocaleString()}</p>
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
              <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.categoryTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value: any, name: string) => [
                    name === 'totalSales' ? value : `${value.toFixed(1)}%`,
                    name === 'totalSales' ? 'Sales' : 'Growth Rate'
                  ]} />
                  <Bar dataKey="totalSales" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [value, 'Sales']} />
                  <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Trending Products</CardTitle>
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
                  <th className="text-left p-2">Rank</th>
                  <th className="text-left p-2">Product</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-right p-2">Current Sales</th>
                  <th className="text-right p-2">Previous Sales</th>
                  <th className="text-center p-2">Trend</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.productId} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <Badge variant="outline">#{product.rank}</Badge>
                    </td>
                    <td className="p-2 font-medium">{product.productName}</td>
                    <td className="p-2 text-muted-foreground">{product.category}</td>
                    <td className="p-2 text-right">{product.currentPeriodSales}</td>
                    <td className="p-2 text-right">{product.previousPeriodSales}</td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getTrendIcon(product.trendDirection)}
                        {getTrendBadge(product.trendDirection, product.growthRate)}
                      </div>
                    </td>
                    <td className="p-2 text-right">₵{product.totalRevenue.toLocaleString()}</td>
                    <td className="p-2 text-right">₵{product.averagePrice.toFixed(2)}</td>
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