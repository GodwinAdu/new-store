'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, Download, Package, TrendingUp, Search, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getProductSellReport } from '@/lib/actions/product-sell-report.actions';
import { toast } from 'sonner';

interface ProductSellReportData {
  summary: {
    totalProducts: number;
    totalQuantitySold: number;
    totalRevenue: number;
    avgSellingPrice: number;
    period: { start: string; end: string };
  };
  products: Array<{
    _id: string;
    name: string;
    sku: string;
    category: string;
    quantitySold: number;
    revenue: number;
    avgPrice: number;
    profitMargin: number;
    lastSold: string;
  }>;
  categoryPerformance: Array<{
    category: string;
    quantitySold: number;
    revenue: number;
    productCount: number;
  }>;
  topPerformers: Array<{
    name: string;
    quantitySold: number;
    revenue: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ProductSellReportPage() {
  const [reportData, setReportData] = useState<ProductSellReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await getProductSellReport(new Date(startDate), new Date(endDate));
      setReportData(data);
    } catch (error) {
      console.error('Error fetching product sell report:', error);
      toast.error('Failed to fetch product sell report');
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
      ['Product Sales Report'],
      [`Period: ${new Date(reportData.summary.period.start).toLocaleDateString()} - ${new Date(reportData.summary.period.end).toLocaleDateString()}`],
      ['Generated:', new Date().toLocaleString()],
      [''],
      ['SUMMARY'],
      ['Total Products Sold', reportData.summary.totalProducts],
      ['Total Quantity Sold', reportData.summary.totalQuantitySold],
      ['Total Revenue', `₵${reportData.summary.totalRevenue.toLocaleString()}`],
      ['Average Selling Price', `₵${reportData.summary.avgSellingPrice.toFixed(2)}`],
      [''],
      ['PRODUCT DETAILS'],
      ['Name', 'SKU', 'Category', 'Quantity Sold', 'Revenue', 'Avg Price', 'Profit Margin %', 'Last Sold'],
      ...reportData.products.map(product => [
        product.name,
        product.sku,
        product.category,
        product.quantitySold,
        `₵${product.revenue.toLocaleString()}`,
        `₵${product.avgPrice.toFixed(2)}`,
        `${product.profitMargin.toFixed(1)}%`,
        new Date(product.lastSold).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-sell-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  const filteredProducts = reportData?.products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Generating product sell report...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load product sell report</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Sales Report</h1>
          <p className="text-gray-600">Comprehensive product sales performance analysis</p>
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
                <p className="text-sm font-medium text-gray-600">Products Sold</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalProducts}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quantity Sold</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalQuantitySold.toLocaleString()}</p>
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
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">₵{reportData.summary.totalRevenue.toLocaleString()}</p>
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
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900">₵{reportData.summary.avgSellingPrice.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.categoryPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, revenue }) => `${category}: ₵${revenue.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {reportData.categoryPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₵${Number(value).toLocaleString()}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.topPerformers.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [Number(value).toLocaleString(), 'Quantity']} />
                  <Bar dataKey="quantitySold" fill="#10b981" />
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
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Sales Details ({filteredProducts.length} products)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Qty Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Avg Price</TableHead>
                  <TableHead>Profit %</TableHead>
                  <TableHead>Last Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.quantitySold}</TableCell>
                    <TableCell className="text-green-600 font-medium">₵{product.revenue.toLocaleString()}</TableCell>
                    <TableCell>₵{product.avgPrice.toFixed(2)}</TableCell>
                    <TableCell className={product.profitMargin > 0 ? 'text-green-600' : 'text-red-600'}>
                      {product.profitMargin.toFixed(1)}%
                    </TableCell>
                    <TableCell>{new Date(product.lastSold).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}