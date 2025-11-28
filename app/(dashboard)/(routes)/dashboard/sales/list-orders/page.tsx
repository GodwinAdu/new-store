'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getAllSales, getSaleById, deleteSaleOrder, getSalesStats, updateSaleOrder } from '@/lib/actions/sales-dashboard.actions'
import { Search, Eye, Trash2, Download, Plus, DollarSign, ShoppingCart, TrendingUp, Calendar, Edit, RefreshCw, FileText, Users } from 'lucide-react'
import { toast } from 'sonner'

export default function ListOrdersPage() {
  const [sales, setSales] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [selectedSale, setSelectedSale] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [editingSale, setEditingSale] = useState<any>(null)
  const [editNotes, setEditNotes] = useState('')

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
    
    let matchesDate = true
    if (dateFilter !== 'all') {
      const saleDate = new Date(sale.saleDate)
      const today = new Date()
      
      switch (dateFilter) {
        case 'today':
          matchesDate = saleDate.toDateString() === today.toDateString()
          break
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = saleDate >= weekAgo
          break
        case 'month':
          matchesDate = saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear()
          break
      }
    }
    
    return matchesSearch && matchesPayment && matchesDate
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
    if (!confirm('Are you sure you want to void this sale? This action cannot be undone.')) {
      return
    }
    
    try {
      await deleteSaleOrder(saleId)
      toast.success('Sale voided successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to void sale')
    }
  }

  const handleEditSale = (sale: any) => {
    setEditingSale(sale)
    setEditNotes(sale.notes || '')
  }

  const handleUpdateSale = async () => {
    if (!editingSale) return
    
    try {
      await updateSaleOrder(editingSale._id, {
        notes: editNotes
      })
      toast.success('Sale updated successfully')
      setEditingSale(null)
      loadData()
    } catch (error) {
      toast.error('Failed to update sale')
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
'₵' + (sale.totalRevenue?.toFixed(2) || '0.00'),
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
            <div className="text-2xl font-bold">₵{stats.todayRevenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">{stats.todayOrders || 0} orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Month Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stats.monthRevenue?.toFixed(2) || '0.00'}</div>
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
            <div className="text-2xl font-bold">₵{stats.avgOrderValue?.toFixed(2) || '0.00'}</div>
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
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
                    <div className="font-bold text-lg">₵{sale.totalRevenue?.toFixed(2) || '0.00'}</div>
                    {sale.discount > 0 && (
                      <div className="text-sm text-green-600">
                        -₵{sale.discount.toFixed(2)} discount
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
                      onClick={() => handleEditSale(sale)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:bg-red-50"
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Order Details - #{selectedSale?._id.slice(-8)}
            </DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Order Details</TabsTrigger>
                <TabsTrigger value="customer">Customer Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Order Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{new Date(selectedSale.saleDate).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment:</span>
                        <Badge className={getPaymentMethodColor(selectedSale.paymentMethod)}>
                          {selectedSale.paymentMethod}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Items:</span>
                        <span>{selectedSale.items.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>₵{selectedSale.subtotal?.toFixed(2)}</span>
                      </div>
                      {selectedSale.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-₵{selectedSale.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax:</span>
                        <span>₵{selectedSale.tax?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base border-t pt-2">
                        <span>Total:</span>
                        <span>₵{selectedSale.totalRevenue?.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Items Purchased</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedSale.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.product?.name}</p>
                            <p className="text-sm text-muted-foreground">₵{item.unitPrice?.toFixed(2)} × {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₵{item.total?.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {selectedSale.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{selectedSale.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="customer" className="space-y-4">
                {selectedSale.customer ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4" />
                        Customer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Name</label>
                          <p className="text-sm">{selectedSale.customer.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-sm">{selectedSale.customer.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Phone</label>
                          <p className="text-sm">{selectedSale.customer.phone}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Loyalty Points</label>
                          <p className="text-sm font-medium text-blue-600">{selectedSale.customer.loyaltyPoints || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No customer information available</p>
                      <p className="text-sm text-muted-foreground">This was a walk-in sale</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Sale Dialog */}
      <Dialog open={!!editingSale} onOpenChange={() => setEditingSale(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sale Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Order ID</label>
              <p className="text-sm text-muted-foreground">#{editingSale?._id.slice(-8)}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              <textarea
                className="w-full p-3 border rounded-lg resize-none"
                rows={4}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add notes for this sale..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingSale(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSale}>
                Update Sale
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}