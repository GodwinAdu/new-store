'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createSaleOrder } from '@/lib/actions/sales-dashboard.actions'
import { getWarehouseProducts } from '@/lib/actions/warehouse.actions'
import { getCustomers } from '@/lib/actions/customer.actions'
import { Plus, Minus, Trash2, ShoppingCart, User, Package, Search, ArrowLeft, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface OrderItem {
  productId: string
  productName: string
  productSku: string
  quantity: number
  unitPrice: number
  total: number
  stock: number
}

export default function AddOrdersPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(8.5)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedWarehouse) loadProducts()
  }, [selectedWarehouse])

  const loadData = async () => {
    try {
      const { fetchAllWarehouses } = await import('@/lib/actions/warehouse.actions')
      const [warehousesData, customersData] = await Promise.all([
        fetchAllWarehouses(),
        getCustomers()
      ])
      
      if (!warehousesData || warehousesData.length === 0) {
        toast.error('No warehouses found. Please contact administrator.')
        return
      }
      
      setWarehouses(warehousesData)
      setCustomers(customersData)
      
      if (warehousesData.length > 0) {
        setSelectedWarehouse(warehousesData[0])
        toast.success(`Connected to ${warehousesData[0].name}`)
      }
    } catch (error) {
      toast.error('Failed to load data')
    }
  }

  const loadProducts = async () => {
    if (!selectedWarehouse) return
    
    try {
      const productsData = await getWarehouseProducts(selectedWarehouse._id)
      setProducts(productsData.map(p => ({ ...p, stock: p.totalStock || 0 })))
    } catch (error) {
      toast.error(`Failed to load products from ${selectedWarehouse.name}`)
      setProducts([])
    }
  }

  const addItem = (product: any) => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock')
      return
    }
    
    const existing = orderItems.find(item => item.productId === product._id)
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error('Cannot add more items than available stock')
        return
      }
      updateItemQuantity(product._id, existing.quantity + 1)
    } else {
      setOrderItems(prev => [...prev, {
        productId: product._id,
        productName: product.name,
        productSku: product.sku,
        quantity: 1,
        unitPrice: product.sellingPrice,
        total: product.sellingPrice,
        stock: product.stock
      }])
    }
  }

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    
    const item = orderItems.find(item => item.productId === productId)
    if (item && quantity > item.stock) {
      toast.error(`Only ${item.stock} items available in stock`)
      return
    }
    
    setOrderItems(prev => prev.map(item => 
      item.productId === productId 
        ? { ...item, quantity, total: quantity * item.unitPrice }
        : item
    ))
  }

  const removeItem = (productId: string) => {
    setOrderItems(prev => prev.filter(item => item.productId !== productId))
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = subtotal * (discount / 100)
  const taxAmount = (subtotal - discountAmount) * (tax / 100)
  const total = subtotal - discountAmount + taxAmount

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      toast.error('Please add items to the order')
      return
    }

    setLoading(true)
    try {
      const result = await createSaleOrder({
        customerId: selectedCustomer || undefined,
        items: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        paymentMethod,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total,
        notes
      })

      setCreatedOrderId(result._id)
      setShowSuccess(true)
      toast.success('Order created successfully!')
      
    } catch (error) {
      toast.error('Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setOrderItems([])
    setSelectedCustomer('')
    setDiscount(0)
    setNotes('')
    setShowSuccess(false)
    setCreatedOrderId('')
  }

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Add New Order</h1>
            <p className="text-muted-foreground">
              {selectedWarehouse ? `${selectedWarehouse.name} - ${selectedWarehouse.location}` : 'Select warehouse'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select 
            value={selectedWarehouse?._id || ''} 
            onValueChange={(value) => {
              const warehouse = warehouses.find(w => w._id === value)
              setSelectedWarehouse(warehouse)
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select warehouse" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map(warehouse => (
                <SelectItem key={warehouse._id} value={warehouse._id}>
                  {warehouse.name} - {warehouse.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {orderItems.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{orderItems.length} items</p>
              <p className="text-2xl font-bold text-primary">₵{total.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Select Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {!selectedWarehouse ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Please select a warehouse to view products</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? `No products found matching "${searchTerm}"` : `No products found in ${selectedWarehouse.name}`}
                  </p>
                  {searchTerm && (
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setSearchTerm('')}>
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <Card 
                      key={product._id}
                      className={`cursor-pointer transition-all ${
                        product.stock <= 0 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:shadow-md hover:scale-105'
                      }`}
                      onClick={() => addItem(product)}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-lg mb-3 flex items-center justify-center">
                          <Package className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1 truncate" title={product.name}>
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">{product.sku}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">₵{product.sellingPrice}</span>
                          <Badge 
                            variant={product.stock <= 5 ? 'destructive' : 'secondary'} 
                            className="text-xs"
                          >
                            {product.stock} left
                          </Badge>
                        </div>
                        {product.stock <= 0 && (
                          <div className="mt-2">
                            <Badge variant="destructive" className="text-xs w-full justify-center">
                              Out of Stock
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer._id} value={customer._id}>
                      {customer.name} - {customer.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Order Items ({orderItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No items added</p>
                  <p className="text-xs">Click on products to add them</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderItems.map(item => (
                    <div key={item.productId} className="flex items-center justify-between p-2 bg-accent/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">₵{item.unitPrice} each • {item.productSku}</p>
                        <p className="text-xs text-orange-600">{item.stock} available</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-sm">₵{(item.total || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          {orderItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Order notes..."
                  />
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₵{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%):</span>
                      <span>-₵{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax ({tax}%):</span>
                    <span>₵{taxAmount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₵{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                  onClick={handleSubmit}
                  disabled={loading || orderItems.length === 0}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Order...
                    </div>
                  ) : (
                    `Create Order - ₵${total.toFixed(2)}`
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              Order Created Successfully!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-muted-foreground mb-2">Order ID: #{createdOrderId.slice(-8)}</p>
              <p className="font-semibold text-lg">Total: ₵{total.toFixed(2)}</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={resetForm}
              >
                Create Another
              </Button>
              <Button 
                className="flex-1"
                onClick={() => router.push('/dashboard/sales/list-orders')}
              >
                View Orders
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}