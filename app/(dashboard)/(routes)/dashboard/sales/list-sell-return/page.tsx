'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getAllSales, getSaleById } from '@/lib/actions/sales-dashboard.actions'
import { Search, RotateCcw, Eye, AlertTriangle, CheckCircle, DollarSign, Package, Calendar, RefreshCw, Download, ArrowLeft, Clock, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ListSellReturnPage() {
  const [sales, setSales] = useState<any[]>([])
  const [selectedSale, setSelectedSale] = useState<any>(null)
  const [returnDialog, setReturnDialog] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [returnItems, setReturnItems] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    loadSales()
  }, [])

  const loadSales = async () => {
    try {
      const salesData = await getAllSales()
      setSales(salesData)
      calculateStats(salesData)
    } catch (error) {
      toast.error('Failed to load sales data')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (salesData: any[]) => {
    const returnable = salesData.filter(sale => getReturnStatus(sale) === 'returnable')
    const returned = salesData.filter(sale => getReturnStatus(sale) === 'returned')
    const expired = salesData.filter(sale => getReturnStatus(sale) === 'expired')
    
    const totalReturnValue = returned.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0)
    
    setStats({
      returnable: returnable.length,
      returned: returned.length,
      expired: expired.length,
      totalReturnValue
    })
  }

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const status = getReturnStatus(sale)
    const matchesStatus = statusFilter === 'all' || statusFilter === status
    
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
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const handleViewSale = async (saleId: string) => {
    try {
      const saleDetails = await getSaleById(saleId)
      setSelectedSale(saleDetails)
    } catch (error) {
      toast.error('Failed to load sale details')
    }
  }

  const handleInitiateReturn = (sale: any) => {
    setSelectedSale(sale)
    setReturnItems(sale.items.map((item: any) => ({
      ...item,
      returnQuantity: 0,
      returnReason: ''
    })))
    setReturnDialog(true)
  }

  const updateReturnQuantity = (index: number, quantity: number) => {
    setReturnItems(prev => prev.map((item, i) => 
      i === index ? { ...item, returnQuantity: Math.max(0, Math.min(quantity, item.quantity)) } : item
    ))
  }

  const processReturn = async () => {
    const itemsToReturn = returnItems.filter(item => item.returnQuantity > 0)
    
    if (itemsToReturn.length === 0) {
      toast.error('Please select items to return')
      return
    }

    if (!returnReason.trim()) {
      toast.error('Please provide a return reason')
      return
    }

    setProcessing(true)
    try {
      const returnAmount = itemsToReturn.reduce((sum, item) => 
        sum + (item.returnQuantity * item.unitPrice), 0
      )

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast.success(`Return processed successfully. Refund amount: ₵${returnAmount.toFixed(2)}`)
      
      setReturnDialog(false)
      setReturnReason('')
      setReturnItems([])
      setSelectedSale(null)
      loadSales()
    } catch (error) {
      toast.error('Failed to process return')
    } finally {
      setProcessing(false)
    }
  }

  const exportReturns = () => {
    const returnedSales = filteredSales.filter(sale => getReturnStatus(sale) === 'returned')
    const csvContent = [
      ['Order ID', 'Date', 'Customer', 'Items', 'Total', 'Status'],
      ...returnedSales.map(sale => [
        sale._id,
        new Date(sale.saleDate).toLocaleDateString(),
        sale.customer?.name || 'Walk-in',
        sale.items.length,
        '₵' + (sale.totalRevenue?.toFixed(2) || '0.00'),
        getReturnStatus(sale)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sales-returns.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Returns data exported successfully')
  }

  const getReturnStatus = (sale: any) => {
    if (sale.isVoided) return 'returned'
    
    // Check if sale is within return period (e.g., 30 days)
    const saleDate = new Date(sale.saleDate)
    const daysSinceSale = Math.floor((Date.now() - saleDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceSale <= 30) return 'returnable'
    return 'expired'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'returnable': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'returned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Returns</h1>
          <p className="text-muted-foreground">Manage product returns and refunds</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSales}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportReturns}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returnable Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.returnable || 0}</div>
            <p className="text-xs text-muted-foreground">Within return period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returned Orders</CardTitle>
            <RotateCcw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.returned || 0}</div>
            <p className="text-xs text-muted-foreground">Already processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Returns</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expired || 0}</div>
            <p className="text-xs text-muted-foreground">Past return period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Return Value</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">₵{(stats.totalReturnValue || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Refunded amount</p>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="returnable">Returnable</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
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
        </div>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredSales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSales.map(sale => {
              const status = getReturnStatus(sale)
              return (
                <div key={sale._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">#{sale._id.slice(-8)}</span>
                        <Badge className={`text-xs ${getStatusColor(status)}`}>
                          {status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(sale.saleDate).toLocaleDateString()} • {sale.customer?.name || 'Walk-in'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {sale.items.length} items • ₵{sale.totalRevenue?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewSale(sale._id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {status === 'returnable' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleInitiateReturn(sale)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Return
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Return Dialog */}
      <Dialog open={returnDialog} onOpenChange={setReturnDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Process Return - #{selectedSale?._id.slice(-8)}</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="returnReason">Return Reason</Label>
                <Textarea
                  id="returnReason"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Enter reason for return..."
                />
              </div>

              <div>
                <h4 className="font-medium mb-2">Select Items to Return</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {returnItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Sold: {item.quantity} × ₵{item.unitPrice} = ₵{(item.total || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm">Return:</Label>
                        <Input
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={item.returnQuantity}
                          onChange={(e) => updateReturnQuantity(index, parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">
                          ₵{(item.returnQuantity * item.unitPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Refund Amount:</span>
                  <span className="text-lg font-bold text-red-600">
                    ₵{returnItems.reduce((sum, item) => sum + (item.returnQuantity * item.unitPrice), 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setReturnDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={processReturn} 
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={processing}
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    'Process Return'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sale Details Dialog */}
      <Dialog open={!!selectedSale && !returnDialog} onOpenChange={() => setSelectedSale(null)}>
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
                    <p><strong>Status:</strong> 
                      <Badge className={`ml-2 text-xs ${getStatusColor(getReturnStatus(selectedSale))}`}>
                        {getReturnStatus(selectedSale)}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Customer Details</h4>
                  {selectedSale.customer ? (
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {selectedSale.customer.name}</p>
                      <p><strong>Email:</strong> {selectedSale.customer.email}</p>
                      <p><strong>Phone:</strong> {selectedSale.customer.phone}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Walk-in customer</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm p-2 bg-accent/50 rounded">
                      <span>{item.product?.name} × {item.quantity}</span>
                      <span>₵{(item.total || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₵{selectedSale.totalRevenue?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}