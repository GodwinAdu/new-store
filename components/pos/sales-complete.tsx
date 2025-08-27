'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSalesReport, voidTransaction } from '@/lib/actions/sales.actions'
import { 
  Receipt, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

interface Transaction {
  id: string
  timestamp: string
  items: Array<{
    product: { name: string }
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: string
  cashReceived?: number
}

export function SalesComplete() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [salesStats, setSalesStats] = useState<any>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSalesData()
  }, [selectedPeriod])

  const loadSalesData = async () => {
    try {
      setLoading(true)
      
      let startDate, endDate
      const now = new Date()
      
      switch (selectedPeriod) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0))
          endDate = new Date(now.setHours(23, 59, 59, 999))
          break
        case 'yesterday':
          const yesterday = new Date(now)
          yesterday.setDate(yesterday.getDate() - 1)
          startDate = new Date(yesterday.setHours(0, 0, 0, 0))
          endDate = new Date(yesterday.setHours(23, 59, 59, 999))
          break
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7))
          endDate = new Date()
          break
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          endDate = new Date()
          break
      }
      
      const salesData = await getSalesReport(startDate, endDate)
      setTransactions(salesData.transactions)
      setSalesStats(salesData)
    } catch (error) {
      toast.error('Failed to load sales data')
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(transaction =>
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleVoidTransaction = async (transactionId: string, reason: string) => {
    try {
      await voidTransaction(transactionId, reason)
      toast.success('Transaction voided successfully')
      loadSalesData()
    } catch (error) {
      toast.error('Failed to void transaction')
    }
  }

  const exportData = (format: 'csv' | 'pdf') => {
    const filename = `sales-${selectedPeriod}.${format}`
    
    if (format === 'csv') {
      const headers = ['ID', 'Date', 'Items', 'Subtotal', 'Discount', 'Tax', 'Total', 'Payment Method']
      const rows = filteredTransactions.map(t => [
        t.id,
        new Date(t.timestamp).toLocaleString(),
        t.items.length,
        t.subtotal.toFixed(2),
        t.discount.toFixed(2),
        t.tax.toFixed(2),
        t.total.toFixed(2),
        t.paymentMethod
      ])
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }
    
    toast.success(`Report exported as ${format.toUpperCase()}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sales Management</h2>
          <p className="text-muted-foreground">Complete sales transactions and reporting</p>
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
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesStats.totalSales?.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesStats.totalTransactions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesStats.avgOrderValue?.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesStats.hourlyData?.reduce((max: any, current: any) => 
                current.transactions > (max?.transactions || 0) ? current : max
              )?.hour || 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
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

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading transactions...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map(transaction => (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Receipt className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{transaction.id}</span>
                            <Badge variant="secondary">{transaction.paymentMethod}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transaction.timestamp).toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-bold text-lg">${transaction.total.toFixed(2)}</div>
                          {transaction.discount > 0 && (
                            <div className="text-sm text-green-600">
                              -${transaction.discount.toFixed(2)} discount
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Transaction Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Items</h4>
                                  <div className="space-y-2">
                                    {transaction.items.map((item, index) => (
                                      <div key={index} className="flex justify-between text-sm">
                                        <span>{item.product.name} x{item.quantity}</span>
                                        <span>${item.total.toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="border-t pt-4 space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>${transaction.subtotal.toFixed(2)}</span>
                                  </div>
                                  {transaction.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                      <span>Discount:</span>
                                      <span>-${transaction.discount.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span>Tax:</span>
                                    <span>${transaction.tax.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between font-bold">
                                    <span>Total:</span>
                                    <span>${transaction.total.toFixed(2)}</span>
                                  </div>
                                </div>
                                
                                <div className="border-t pt-4">
                                  <div className="flex justify-between text-sm">
                                    <span>Payment Method:</span>
                                    <span className="capitalize">{transaction.paymentMethod}</span>
                                  </div>
                                  {transaction.cashReceived && (
                                    <div className="flex justify-between text-sm">
                                      <span>Cash Received:</span>
                                      <span>${transaction.cashReceived.toFixed(2)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-sm">
                              <DialogHeader>
                                <DialogTitle className="flex items-center text-red-600">
                                  <AlertTriangle className="h-5 w-5 mr-2" />
                                  Void Transaction
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                  This action cannot be undone. The transaction will be marked as voided.
                                </p>
                                <Input placeholder="Reason for voiding..." />
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="destructive" 
                                    className="flex-1"
                                    onClick={() => handleVoidTransaction(transaction.id, 'Manual void')}
                                  >
                                    Void Transaction
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salesStats.hourlyData?.map((data: any) => (
                    <div key={data.hour} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 text-sm font-medium">{data.hour}</div>
                        <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${Math.max(10, (data.sales / (salesStats.totalSales || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">${data.sales.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{data.transactions} txns</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(salesStats.paymentMethods || {}).map(([method, amount]: [string, any]) => (
                    <div key={method} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          method === 'cash' ? 'bg-green-500' :
                          method === 'card' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}></div>
                        <span className="text-sm capitalize">{method}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${amount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          {((amount / (salesStats.totalSales || 1)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={() => exportData('csv')} className="justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
                <Button onClick={() => exportData('pdf')} variant="outline" className="justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}