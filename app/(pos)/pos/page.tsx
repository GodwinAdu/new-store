'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { POSLayout } from '@/components/pos/pos-layout'
import { getProducts, processSale, getTodayStats } from '@/lib/actions/pos.actions'
import { getCustomers, updateCustomerPoints } from '@/lib/actions/customer.actions'
import { 
  ShoppingCart, 
  Search, 
  CreditCard, 
  Banknote, 
  Smartphone,
  Calculator,
  Trash2,
  Plus,
  Minus,
  Package,
  Zap,
  Gift,
  Percent,
  User,
  QrCode,
  Save,
  History,
  AlertCircle,
  CheckCircle,
  Timer,
  Sparkles,
  Printer,
  Receipt
} from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  barcode?: string
  sku?: string
  isPopular?: boolean
}

interface CartItem extends Product {
  quantity: number
}

interface Customer {
  id: string
  _id?: string
  name: string
  email?: string
  phone?: string
  loyaltyPoints?: number
  totalSpent?: number
}

function POSContent() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash')
  const [cashReceived, setCashReceived] = useState('')
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(8.5)
  const [isProcessing, setIsProcessing] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [todayStats, setTodayStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  const categories = ['All', 'Beverages', 'Food', 'Bakery', 'Snacks']

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, searchTerm])

  const loadData = async () => {
    try {
      const [productsData, customersData, statsData] = await Promise.all([
        getProducts(),
        getCustomers(),
        getTodayStats()
      ])
      setProducts(productsData)
      setCustomers(customersData)
      setTodayStats(statsData)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const productsData = await getProducts(selectedCategory, searchTerm)
      setProducts(productsData)
    } catch (error) {
      toast.error('Failed to load products')
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const discountAmount = subtotal * (discount / 100)
  const taxAmount = (subtotal - discountAmount) * (tax / 100)
  const total = subtotal - discountAmount + taxAmount
  const change = paymentMethod === 'cash' ? Math.max(0, parseFloat(cashReceived || '0') - total) : 0

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    toast.success(`${product.name} added to cart`)
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
    setDiscount(0)
    setCashReceived('')
  }

  const processPayment = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    if (paymentMethod === 'cash' && parseFloat(cashReceived) < total) {
      toast.error('Insufficient cash received')
      return
    }

    setIsProcessing(true)
    
    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price
        })),
        customerId: selectedCustomer?.id,
        paymentMethod,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total,
        cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : undefined
      }
      
      await processSale(saleData)
      
      if (selectedCustomer) {
        const pointsEarned = Math.floor(total)
        await updateCustomerPoints(selectedCustomer.id, pointsEarned)
        toast.success(`${pointsEarned} loyalty points added!`)
      }
      
      toast.success('Payment processed successfully!')
      printReceipt()
      clearCart()
      loadData()
    } catch (error) {
      toast.error('Failed to process payment')
    } finally {
      setIsProcessing(false)
    }
  }

  const printReceipt = () => {
    const receiptData = {
      items: cart,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      paymentMethod,
      cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : total,
      change,
      customer: selectedCustomer,
      timestamp: new Date().toISOString()
    }
    
    console.log('Receipt Data:', receiptData)
    toast.success('Receipt printed!')
  }

  return (
    <POSLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Today's Sales</p>
                  <p className="font-semibold">${todayStats.totalSales?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                  <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="font-semibold">{todayStats.totalTransactions || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                  <Timer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Order</p>
                  <p className="font-semibold">${todayStats.avgOrderValue?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                  <Sparkles className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Peak Hour</p>
                  <p className="font-semibold">{todayStats.peakHour || 'N/A'}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchTerm) {
                      const product = products.find(p => 
                        p.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      if (product) {
                        addToCart(product)
                        setSearchTerm('')
                      }
                    }
                  }}
                />
              </div>
              <Button variant="outline" size="sm">
                <QrCode className="h-4 w-4 mr-2" />
                Scan Barcode
              </Button>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading products...</p>
              </div>
            ) : products.map(product => (
              <Card 
                key={product.id} 
                className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 group"
                onClick={() => addToCart(product)}
              >
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                  <Package className="h-8 w-8 text-muted-foreground group-hover:scale-110 transition-transform" />
                  {product.isPopular && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 animate-pulse">
                      Hot
                    </Badge>
                  )}
                  {product.stock <= 10 && (
                    <Badge className="absolute -top-2 -left-2 bg-red-500">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Low
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      product.stock <= 10 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''
                    }`}
                  >
                    {product.stock} left
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">{product.category}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center">
                <User className="h-4 w-4 mr-2" />
                Customer
              </h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Select Customer</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {customers.map(customer => (
                      <Card 
                        key={customer._id || customer.id} 
                        className="p-3 cursor-pointer hover:bg-accent"
                        onClick={() => setSelectedCustomer({...customer, id: customer._id || customer.id})}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{customer.loyaltyPoints || 0} pts</Badge>
                            <p className="text-xs text-muted-foreground">${customer.totalSpent?.toFixed(2) || '0.00'}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {selectedCustomer ? (
              <div className="bg-accent/50 rounded-lg p-3">
                <p className="font-medium">{selectedCustomer.name}</p>
                <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary">
                    <Gift className="h-3 w-3 mr-1" />
                    {selectedCustomer.loyaltyPoints || 0} points
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No customer selected</p>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({cart.length})
              </h3>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <ScrollArea className="h-64">
              {cart.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-accent/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          {cart.length > 0 && (
            <>
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Calculator className="h-4 w-4 mr-2" />
                  Order Summary
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Discount</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                        className="w-16 h-8 text-center"
                        min="0"
                        max="100"
                      />
                      <span className="text-sm">%</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({discount}%):</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tax ({tax}%):</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-4">Payment Method</h3>
                
                <Tabs value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="cash" className="flex items-center">
                      <Banknote className="h-4 w-4 mr-1" />
                      Cash
                    </TabsTrigger>
                    <TabsTrigger value="card" className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-1" />
                      Card
                    </TabsTrigger>
                    <TabsTrigger value="mobile" className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-1" />
                      Mobile
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="cash" className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Cash Received</label>
                      <Input
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        placeholder="0.00"
                        className="mt-1"
                      />
                    </div>
                    {cashReceived && parseFloat(cashReceived) >= total && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          Change: ${change.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="card">
                    <div className="text-center py-4">
                      <CreditCard className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Insert or tap card</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="mobile">
                    <div className="text-center py-4">
                      <Smartphone className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Scan QR code or tap phone</p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex space-x-2 mt-4">
                  <Button 
                    className="flex-1" 
                    size="lg"
                    onClick={processPayment}
                    disabled={isProcessing || (paymentMethod === 'cash' && parseFloat(cashReceived || '0') < total)}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Pay ${total.toFixed(2)}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="lg">
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </>
          )}

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start">
                <History className="h-4 w-4 mr-2" />
                Last Sale
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Printer className="h-4 w-4 mr-2" />
                Reprint
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Receipt className="h-4 w-4 mr-2" />
                No Sale
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Calculator className="h-4 w-4 mr-2" />
                Calculator
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </POSLayout>
  )
}

export default function POSPage() {
  return <POSContent />
}