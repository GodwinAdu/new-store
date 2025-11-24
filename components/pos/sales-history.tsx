'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getTodaySales, voidSale, updateSale, getSaleHistory } from '@/lib/actions/pos.actions'
import { Receipt, Clock, CreditCard, Banknote, Smartphone, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface Sale {
  _id: string
  items: Array<{
    product: {
      name: string
      sku?: string
    }
    quantity: number
    unitPrice: number
    total?: number
  }>
  saleDate: string
  paymentMethod: string
  subtotal: number
  discount: number
  tax: number
  totalRevenue: number
  cashReceived?: number
  cashier: {
    _id: string
    name: string
    email?: string
  }
}

export function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [voidReason, setVoidReason] = useState('')
  const [showVoidDialog, setShowVoidDialog] = useState(false)
  const [saleToVoid, setSaleToVoid] = useState<string | null>(null)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [saleHistory, setSaleHistory] = useState<any>(null)

  useEffect(() => {
    loadTodaySales()
  }, [])

  const loadTodaySales = async () => {
    try {
      const todaySales = await getTodaySales()
      setSales(todaySales || [])
    } catch (error) {
      console.error('Failed to load today sales:', error)
      setSales([])
    } finally {
      setLoading(false)
    }
  }

  const handleVoidSale = async () => {
    if (!saleToVoid || !voidReason.trim()) return
    
    try {
      await voidSale(saleToVoid, voidReason)
      toast.success('Sale voided successfully')
      setShowVoidDialog(false)
      setSaleToVoid(null)
      setVoidReason('')
      loadTodaySales()
    } catch (error) {
      toast.error('Failed to void sale')
    }
  }

  const handleUpdateSale = async (saleId: string, updateData: any) => {
    try {
      await updateSale(saleId, updateData)
      toast.success('Sale updated successfully')
      setEditingSale(null)
      loadTodaySales()
    } catch (error) {
      toast.error('Failed to update sale')
    }
  }

  const handleViewHistory = async (saleId: string) => {
    try {
      const history = await getSaleHistory(saleId)
      setSaleHistory(history)
      setShowHistoryDialog(true)
    } catch (error) {
      toast.error('Failed to load sale history')
    }
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-4 w-4" />
      case 'card':
        return <CreditCard className="h-4 w-4" />
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      default:
        return <Receipt className="h-4 w-4" />
    }
  }

  const totalSales = sales.reduce((sum, sale) => sum + (sale.totalRevenue || 0), 0)
  const totalTransactions = sales.length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading sales history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Receipt className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Sales</p>
              <p className="text-2xl font-bold">₵{totalSales.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold">{totalTransactions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Order</p>
              <p className="text-2xl font-bold">
                ₵{totalTransactions > 0 ? (totalSales / totalTransactions).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sales List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Today's Sales History</h3>
          <Badge variant="secondary">{totalTransactions} transactions</Badge>
        </div>

        {sales.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No sales recorded today</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {sales.map((sale) => (
                <div key={sale._id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        {getPaymentIcon(sale.paymentMethod)}
                      </div>
                      <div>
                        <p className="font-medium">
                          Receipt #{sale._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(sale.saleDate), 'HH:mm:ss')} • {sale.cashier?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₵{sale.totalRevenue.toFixed(2)}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {sale.paymentMethod}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setEditingSale(sale)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewHistory(sale._id)}>
                              <Clock className="h-4 w-4 mr-2" />
                              History
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSaleToVoid(sale._id)
                                setShowVoidDialog(true)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Void
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {sale.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span>₵{(item.total || item.quantity * item.unitPrice).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {(sale.discount > 0 || sale.tax > 0) && (
                    <div className="mt-3 pt-3 border-t space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₵{sale.subtotal.toFixed(2)}</span>
                      </div>
                      {sale.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-₵{sale.discount.toFixed(2)}</span>
                        </div>
                      )}
                      {sale.tax > 0 && (
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>₵{sale.tax.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>

      {/* Edit Sale Dialog */}
      <Dialog open={!!editingSale} onOpenChange={() => setEditingSale(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sale</DialogTitle>
          </DialogHeader>
          {editingSale && (
            <div className="space-y-4">
              <div>
                <Label>Payment Method</Label>
                <Select 
                  value={editingSale.paymentMethod} 
                  onValueChange={(value) => setEditingSale({...editingSale, paymentMethod: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Discount</Label>
                <Input 
                  type="number" 
                  value={editingSale.discount} 
                  onChange={(e) => setEditingSale({...editingSale, discount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Tax</Label>
                <Input 
                  type="number" 
                  value={editingSale.tax} 
                  onChange={(e) => setEditingSale({...editingSale, tax: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Cash Received</Label>
                <Input 
                  type="number" 
                  value={editingSale.cashReceived || 0} 
                  onChange={(e) => setEditingSale({...editingSale, cashReceived: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingSale(null)}>Cancel</Button>
                <Button onClick={() => handleUpdateSale(editingSale._id, {
                  paymentMethod: editingSale.paymentMethod,
                  discount: editingSale.discount,
                  tax: editingSale.tax,
                  cashReceived: editingSale.cashReceived
                })}>Update Sale</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Void Sale Dialog */}
      <Dialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Void Sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for voiding</Label>
              <Textarea 
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Enter reason for voiding this sale..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowVoidDialog(false)
                setSaleToVoid(null)
                setVoidReason('')
              }}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={handleVoidSale}
                disabled={!voidReason.trim()}
              >
                Void Sale
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sale History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sale Modification History</DialogTitle>
          </DialogHeader>
          {saleHistory && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">Receipt #{saleHistory._id.slice(-6).toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">
                  Created: {format(new Date(saleHistory.createdAt), 'PPpp')}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cashier: {saleHistory.cashier?.name || 'Unknown'}
                </p>
                {saleHistory.modifiedBy && (
                  <p className="text-sm text-muted-foreground">
                    Last modified by: {saleHistory.modifiedBy?.name || 'Unknown'}
                  </p>
                )}
              </div>
              
              {saleHistory.modificationHistory && saleHistory.modificationHistory.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium">Modification History</h4>
                  {saleHistory.modificationHistory.map((mod: any, index: number) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{mod.modifiedBy?.name || 'Unknown User'}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(mod.modifiedAt), 'PPpp')}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {mod.changes?.action || 'Updated'}
                        </Badge>
                      </div>
                      {mod.reason && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Reason: {mod.reason}
                        </p>
                      )}
                      {mod.changes && Object.keys(mod.changes).length > 0 && (
                        <div className="mt-2 text-xs">
                          <p className="font-medium">Changes:</p>
                          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(mod.changes, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No modifications recorded for this sale
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}