'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getAllSales, getSaleById, deleteSaleOrder, getSalesStats } from '@/lib/actions/sales-dashboard.actions'
import { Search, Filter, Eye, Trash2, Download, Plus, DollarSign, ShoppingCart, TrendingUp, Calendar } from 'lucide-react'
import { toast } from 'sonner'

export default function ListOrdersPage() {
  const [sales, setSales] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [selectedSale, setSelectedSale] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [salesData, statsData] = await Promise.all([
        getAllSales(),
        getSalesStats()
      ])
      setSales(salesData)
      setStats(statsData)
    } catch (error) {
      toast.error('Failed to load sales data')
    } finally {
      setLoading(false)
    }
  }

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPayment = paymentFilter === 'all' || sale.paymentMethod === paymentFilter
    return matchesSearch && matchesPayment
  })

  const handleViewSale = async (saleId: string) => {
    try {
      const saleDetails = await getSaleById(saleId)
      setSelectedSale(saleDetails)
    } catch (error) {
      toast.error('Failed to load sale details')
    }
  }

  const handleDeleteSale = async (saleId: string) => {
    try {
      await deleteSaleOrder(saleId)
      toast.success('Sale deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete sale')
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'card': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'mobile': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const exportData = () => {
    const csvContent = [
      ['Order ID', 'Date', 'Customer', 'Items', 'Total', 'Payment Method'],
      ...filteredSales.map(sale => [
        sale._id,
        new Date(sale.saleDate).toLocaleDateString(),
        sale.customer?.name || 'Walk-in',
        sale.items.length,
        sale.totalRevenue?.toFixed(2) || '0.00',
        sale.paymentMethod
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sales-orders.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported successfully')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Orders</h1>
          <p className="text-muted-foreground">Manage and track all sales orders</p>
        </div>
        <Button onClick={() => window.location.href = '/dashboard/sales/add-orders'}>
          <Plus className="h-4 w-4 mr-2" />
          Add Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.todayRevenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">{stats.todayOrders || 0} orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Month Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthRevenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">{stats.monthOrders || 0} orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgOrderValue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredSales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSales.map(sale => (
              <div key={sale._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">#{sale._id.slice(-8)}</span>
                      <Badge className={`text-xs ${getPaymentMethodColor(sale.paymentMethod)}`}>
                        {sale.paymentMethod}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(sale.saleDate).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {sale.customer?.name || 'Walk-in Customer'} • {sale.items.length} items
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-bold text-lg">${sale.totalRevenue?.toFixed(2) || '0.00'}</div>
                    {sale.discount > 0 && (
                      <div className="text-sm text-green-600">
                        -${sale.discount.toFixed(2)} discount
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewSale(sale._id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600"
                      onClick={() => handleDeleteSale(sale._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sale Details Dialog */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedSale?._id.slice(-8)}</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Order Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Date:</strong> {new Date(selectedSale.saleDate).toLocaleString()}</p>
                    <p><strong>Payment:</strong> {selectedSale.paymentMethod}</p>
                    <p><strong>Customer:</strong> {selectedSale.customer?.name || 'Walk-in'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Customer Details</h4>
                  {selectedSale.customer ? (
                    <div className="space-y-1 text-sm">
                      <p><strong>Email:</strong> {selectedSale.customer.email}</p>
                      <p><strong>Phone:</strong> {selectedSale.customer.phone}</p>
                      <p><strong>Loyalty Points:</strong> {selectedSale.customer.loyaltyPoints}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No customer information</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm p-2 bg-accent/50 rounded">
                      <span>{item.product?.name} x{item.quantity}</span>
                      <span>${item.total?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${selectedSale.subtotal?.toFixed(2)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-${selectedSale.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${selectedSale.tax?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${selectedSale.totalRevenue?.toFixed(2)}</span>
                </div>
              </div>

              {selectedSale.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedSale.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}