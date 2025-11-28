'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, Download, ShoppingCart, TrendingDown, Search, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getProductPurchaseReport } from '@/lib/actions/product-purchase-report.actions';
import { toast } from 'sonner';

interface ProductPurchaseReportData {
  summary: {
    totalProducts: number;
    totalQuantityPurchased: number;
    totalCost: number;
    avgPurchasePrice: number;
    period: { start: string; end: string };
  };
  products: Array<{
    _id: string;
    name: string;
    sku: string;
    category: string;
    quantityPurchased: number;
    totalCost: number;
    avgCost: number;
    lastPurchased: string;
    supplier: string;
  }>;
  categoryBreakdown: Array<{
    category: string;
    quantityPurchased: number;
    totalCost: number;
    productCount: number;
  }>;
  supplierBreakdown: Array<{
    supplier: string;
    totalCost: number;
    productCount: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ProductPurchaseReportPage() {
  const [reportData, setReportData] = useState<ProductPurchaseReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await getProductPurchaseReport(new Date(startDate), new Date(endDate));
      setReportData(data);
    } catch (error) {
      console.error('Error fetching product purchase report:', error);
      toast.error('Failed to fetch product purchase report');
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
      ['Product Purchase Report'],
      [`Period: ${new Date(reportData.summary.period.start).toLocaleDateString()} - ${new Date(reportData.summary.period.end).toLocaleDateString()}`],
      ['Generated:', new Date().toLocaleString()],
      [''],
      ['SUMMARY'],
      ['Total Products Purchased', reportData.summary.totalProducts],
      ['Total Quantity Purchased', reportData.summary.totalQuantityPurchased],
      ['Total Cost', `₵${reportData.summary.totalCost.toLocaleString()}`],
      ['Average Purchase Price', `₵${reportData.summary.avgPurchasePrice.toFixed(2)}`],
      [''],
      ['PRODUCT DETAILS'],
      ['Name', 'SKU', 'Category', 'Quantity Purchased', 'Total Cost', 'Avg Cost', 'Last Purchased', 'Supplier'],
      ...reportData.products.map(product => [
        product.name,
        product.sku,
        product.category,
        product.quantityPurchased,
        `₵${product.totalCost.toLocaleString()}`,
        `₵${product.avgCost.toFixed(2)}`,
        new Date(product.lastPurchased).toLocaleDateString(),
        product.supplier
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-purchase-report-${new Date().toISOString().split('T')[0]}.csv`;
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
          <p className="text-muted-foreground">Generating product purchase report...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load product purchase report</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Purchase Report</h1>
          <p className="text-gray-600">Comprehensive product purchasing analysis</p>
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
                <p className="text-sm font-medium text-gray-600">Products Purchased</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalProducts}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quantity Purchased</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalQuantityPurchased.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-red-600">₵{reportData.summary.totalCost.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900">₵{reportData.summary.avgPurchasePrice.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Purchases by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, totalCost }) => `${category}: ₵${totalCost.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalCost"
                  >
                    {reportData.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₵${Number(value).toLocaleString()}`, 'Cost']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Purchases by Supplier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.supplierBreakdown.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="supplier" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₵${Number(value).toLocaleString()}`, 'Cost']} />
                  <Bar dataKey="totalCost" fill="#ef4444" />
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
          <CardTitle>Product Purchase Details ({filteredProducts.length} products)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Qty Purchased</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Avg Cost</TableHead>
                  <TableHead>Last Purchased</TableHead>
                  <TableHead>Supplier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.quantityPurchased}</TableCell>
                    <TableCell className="text-red-600 font-medium">₵{product.totalCost.toLocaleString()}</TableCell>
                    <TableCell>₵{product.avgCost.toFixed(2)}</TableCell>
                    <TableCell>{new Date(product.lastPurchased).toLocaleDateString()}</TableCell>
                    <TableCell>{product.supplier}</TableCell>
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