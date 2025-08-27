'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar as CalendarIcon,
  Download,
  Filter,
  Search,
  Eye,
  Receipt,
  Clock,
  Star,
  Package
} from 'lucide-react'
import { format } from 'date-fns'

interface SaleTransaction {
  id: string
  timestamp: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: 'cash' | 'card' | 'mobile'
  cashier: string
  customer?: {
    name: string
    email?: string
  }
}

interface SalesReport {
  period: string
  totalSales: number
  totalTransactions: number
  averageOrderValue: number
  topProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  paymentMethods: {
    cash: number
    card: number
    mobile: number
  }
  hourlyBreakdown: Array<{
    hour: string
    sales: number
    transactions: number
  }>
}

const mockTransactions: SaleTransaction[] = [
  {
    id: 'TXN-001',
    timestamp: '2024-01-16T14:30:00Z',
    items: [
      { name: 'Premium Coffee', quantity: 2, price: 4.99, total: 9.98 },
      { name: 'Croissant', quantity: 1, price: 2.99, total: 2.99 }
    ],
    subtotal: 12.97,
    discount: 0,
    tax: 1.04,
    total: 14.01,
    paymentMethod: 'card',
    cashier: 'Admin User',
    customer: { name: 'John Doe', email: 'john@example.com' }
  },
  {
    id: 'TXN-002',
    timestamp: '2024-01-16T15:15:00Z',
    items: [
      { name: 'Sandwich', quantity: 1, price: 7.99, total: 7.99 },
      { name: 'Energy Drink', quantity: 1, price: 3.49, total: 3.49 }
    ],
    subtotal: 11.48,
    discount: 1.15,
    tax: 0.83,
    total: 11.16,
    paymentMethod: 'cash',
    cashier: 'Admin User'
  },
  {
    id: 'TXN-003',
    timestamp: '2024-01-16T16:45:00Z',
    items: [
      { name: 'Fresh Salad', quantity: 1, price: 8.99, total: 8.99 }
    ],
    subtotal: 8.99,
    discount: 0,
    tax: 0.72,
    total: 9.71,
    paymentMethod: 'mobile',
    cashier: 'Admin User',
    customer: { name: 'Jane Smith', email: 'jane@example.com' }
  }
]

const mockReport: SalesReport = {
  period: 'Today',
  totalSales: 2847.50,
  totalTransactions: 127,
  averageOrderValue: 22.42,
  topProducts: [
    { name: 'Premium Coffee', quantity: 45, revenue: 224.55 },
    { name: 'Sandwich', quantity: 23, revenue: 183.77 },
    { name: 'Fresh Salad', quantity: 18, revenue: 161.82 },
    { name: 'Croissant', quantity: 31, revenue: 92.69 },
    { name: 'Energy Drink', quantity: 19, revenue: 66.31 }
  ],
  paymentMethods: {
    cash: 1247.80,
    card: 1289.20,
    mobile: 310.50
  },
  hourlyBreakdown: [
    { hour: '9AM', sales: 156.50, transactions: 8 },
    { hour: '10AM', sales: 298.75, transactions: 15 },
    { hour: '11AM', sales: 445.20, transactions: 22 },
    { hour: '12PM', sales: 623.80, transactions: 35 },
    { hour: '1PM', sales: 512.30, transactions: 28 },
    { hour: '2PM', sales: 387.45, transactions: 19 },
    { hour: '3PM', sales: 423.50, transactions: 20 }
  ]
}

export function SalesReporting() {
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<SaleTransaction | null>(null)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})

  const filteredTransactions = mockTransactions.filter(transaction =>
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.cashier.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'card': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'mobile': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const exportReport = (format: 'csv' | 'pdf') => {
    // Simulate export functionality
    const filename = `sales-report-${selectedPeriod}.${format}`
    console.log(`Exporting ${filename}`)
    
    if (format === 'csv') {
      const csvContent = generateCSV(filteredTransactions)
      downloadFile(csvContent, filename, 'text/csv')
    }
    
    // toast.success(`Report exported as ${format.toUpperCase()}`)
  }

  const generateCSV = (transactions: SaleTransaction[]) => {
    const headers = ['Transaction ID', 'Date', 'Customer', 'Items', 'Subtotal', 'Discount', 'Tax', 'Total', 'Payment Method', 'Cashier']
    const rows = transactions.map(t => [
      t.id,
      formatDateTime(t.timestamp),
      t.customer?.name || 'Walk-in',
      t.items.map(i => `${i.name} (${i.quantity})`).join('; '),
      t.subtotal.toFixed(2),
      t.discount.toFixed(2),
      t.tax.toFixed(2),
      t.total.toFixed(2),
      t.paymentMethod,
      t.cashier
    ])
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sales Reports</h2>
          <p className="text-muted-foreground">Comprehensive sales analytics and transaction history</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => exportReport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockReport.totalSales)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12.5% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockReport.totalTransactions}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +8.3% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockReport.averageOrderValue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -2.1% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12PM</div>
            <div className="text-xs text-muted-foreground">
              {formatCurrency(623.80)} in sales
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Hourly Sales Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockReport.hourlyBreakdown.map((data, index) => (
                    <div key={data.hour} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 text-sm font-medium">{data.hour}</div>
                        <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${(data.sales / 623.80) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{formatCurrency(data.sales)}</div>
                        <div className="text-xs text-muted-foreground">{data.transactions} txns</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Cash</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(mockReport.paymentMethods.cash)}</div>
                      <div className="text-xs text-muted-foreground">
                        {((mockReport.paymentMethods.cash / mockReport.totalSales) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Card</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(mockReport.paymentMethods.card)}</div>
                      <div className="text-xs text-muted-foreground">
                        {((mockReport.paymentMethods.card / mockReport.totalSales) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Mobile</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(mockReport.paymentMethods.mobile)}</div>
                      <div className="text-xs text-muted-foreground">
                        {((mockReport.paymentMethods.mobile / mockReport.totalSales) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {/* Search and Filters */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTransactions.map(transaction => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Receipt className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{transaction.id}</span>
                          <Badge className={`text-xs ${getPaymentMethodColor(transaction.paymentMethod)}`}>
                            {transaction.paymentMethod}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(transaction.timestamp)} • {transaction.cashier}
                        </div>
                        {transaction.customer && (
                          <div className="text-sm text-muted-foreground">
                            Customer: {transaction.customer.name}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-lg">{formatCurrency(transaction.total)}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReport.topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.quantity} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((product.revenue / mockReport.totalSales) * 100).toFixed(1)}% of sales
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cash Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(mockReport.paymentMethods.cash)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {((mockReport.paymentMethods.cash / mockReport.totalSales) * 100).toFixed(1)}% of total sales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Card Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(mockReport.paymentMethods.card)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {((mockReport.paymentMethods.card / mockReport.totalSales) * 100).toFixed(1)}% of total sales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mobile Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {formatCurrency(mockReport.paymentMethods.mobile)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {((mockReport.paymentMethods.mobile / mockReport.totalSales) * 100).toFixed(1)}% of total sales
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}