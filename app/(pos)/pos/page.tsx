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
import { VoiceAssistant } from '@/components/pos/voice-assistant'
import { VoiceSearch } from '@/components/pos/voice-search'
import { VoiceSettings } from '@/components/pos/voice-settings'
import { getProducts, processSale, getTodayStats } from '@/lib/actions/pos.actions'
import { getCustomers, updateCustomerPoints } from '@/lib/actions/customer.actions'
import { fetchAllWarehouses } from '@/lib/actions/warehouse.actions'
import { getWarehouseProducts } from '@/lib/actions/warehouse.actions'
import { usePOSStore } from '@/lib/store/pos-store'
import { useVoice } from '@/hooks/use-voice'
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
  Receipt,
  X
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
  units?: any[]
}

interface CartItem extends Product {
  quantity: number
  selectedUnit?: any
  unitPrice: number
  unitQuantity: number
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
  const {
    selectedWarehouse,
    setSelectedWarehouse,
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    selectedCustomer,
    setSelectedCustomer,
    paymentMethod,
    setPaymentMethod,
    cashReceived,
    setCashReceived,
    discount,
    setDiscount,
    tax,
    setTax,
    getSubtotal,
    getDiscountAmount,
    getTaxAmount,
    getTotal,
    getChange
  } = usePOSStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showUnitDialog, setShowUnitDialog] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastSale, setLastSale] = useState<any>(null)
  const [voiceSearchTerm, setVoiceSearchTerm] = useState('')
  const { speak } = useVoice()

  useEffect(() => {
    const { voiceManager } = require('@/lib/voice-manager')
    return voiceManager.onCommand(handleVoiceCommand)
  }, [])

  const categories = ['All', 'Beverages', 'Food', 'Bakery', 'Snacks']

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, searchTerm, selectedWarehouse])

  const loadData = async () => {
    try {
      const [warehousesData, customersData] = await Promise.all([
        fetchAllWarehouses(),
        getCustomers()
      ])
      
      if (!warehousesData || warehousesData.length === 0) {
        toast.error('No warehouses found. Please contact administrator.')
        return
      }
      
      setWarehouses(warehousesData)
      setCustomers(customersData || [])
      
      // Set first warehouse as default
      if (warehousesData.length > 0 && !selectedWarehouse) {
        setSelectedWarehouse(warehousesData[0])
        toast.success(`Connected to ${warehousesData[0].name}`)
      }
    } catch (error) {
      console.error('Load data error:', error)
      toast.error('Failed to connect to system. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    if (!selectedWarehouse) {
      toast.error('Please select a warehouse first')
      return
    }
    
    try {
      const productsData = await getWarehouseProducts(selectedWarehouse._id)
      
      if (!productsData || productsData.length === 0) {
        toast.error(`No products found in ${selectedWarehouse.name}. Please add products first.`)
        setProducts([])
        return
      }
      
      // Filter by category and search term
      let filteredProducts = productsData
      
      if (selectedCategory !== 'All') {
        filteredProducts = filteredProducts.filter(p => p.category === selectedCategory)
      }
      
      if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        
        if (filteredProducts.length === 0) {
          toast.error(`No products found matching "${searchTerm}"`)
        }
      }
      
      setProducts(filteredProducts.map(p => ({
        ...p,
        id: p._id,
        stock: p.totalStock || 0,
        category: p.category || 'General',
        units: p.units || []
      })))
      
    } catch (error) {
      console.error('Load products error:', error)
      toast.error(`Failed to load products from ${selectedWarehouse.name}. Please try again.`)
      setProducts([])
    }
  }

  const subtotal = getSubtotal()
  const discountAmount = getDiscountAmount()
  const taxAmount = getTaxAmount()
  const total = getTotal()
  const change = getChange()

  const handleAddToCart = (product: Product, unit?: any, quantity: number = 1) => {
    if (!product || !product.id) {
      toast.error('Invalid product selected')
      return
    }
    
    if (product.stock <= 0) {
      toast.error(`${product.name} is out of stock`)
      return
    }
    
    if (quantity <= 0) {
      toast.error('Invalid quantity selected')
      return
    }
    
    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} ${product.name} available in stock`)
      return
    }
    
    try {
      addToCart(product, unit, quantity)
      const unitName = unit ? unit.name : 'unit'
      toast.success(`${product.name} (${unitName}) added to cart`)
      speak(`Added ${product.name} to cart`)
    } catch (error) {
      toast.error('Failed to add item to cart. Please try again.')
    }
  }

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product.name, 'Units:', product.units)
    if (product.units && product.units.length > 0) {
      setSelectedProduct(product)
      setShowUnitDialog(true)
    } else {
      handleAddToCart(product)
    }
  }



  const processPayment = async () => {
    // Validation checks with specific error messages
    if (cart.length === 0) {
      toast.error('Cannot process payment: Cart is empty. Please add items first.')
      return
    }

    if (!selectedWarehouse) {
      toast.error('Cannot process payment: No warehouse selected. Please select a warehouse.')
      return
    }

    if (paymentMethod === 'cash') {
      const cashAmount = parseFloat(cashReceived)
      if (isNaN(cashAmount) || cashAmount <= 0) {
        toast.error('Please enter a valid cash amount received.')
        return
      }
      if (cashAmount < total) {
        toast.error(`Insufficient cash: Need ₵${total.toFixed(2)}, received ₵${cashAmount.toFixed(2)}`)
        return
      }
    }

    if (total <= 0) {
      toast.error('Cannot process payment: Invalid total amount.')
      return
    }

    setIsProcessing(true)
    
    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        customerId: selectedCustomer?.id || selectedCustomer?._id,
        paymentMethod,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total,
        cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : total,
        warehouseId: selectedWarehouse._id
      }
      
      const sale = await processSale(saleData)
      setLastSale(sale)
      
      if (selectedCustomer) {
        try {
          const pointsEarned = Math.floor(total)
          await updateCustomerPoints(selectedCustomer.id || selectedCustomer._id, pointsEarned)
          toast.success(`Payment successful! ${pointsEarned} loyalty points added to ${selectedCustomer.name}`)
        } catch (pointsError) {
          toast.success('Payment successful! (Note: Could not update loyalty points)')
        }
      } else {
        toast.success('Payment processed successfully!')
      }
      
      speak('Payment successful')
      printReceipt()
      clearCart()
      loadProducts()
    } catch (error) {
      console.error('Payment processing error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Payment failed: ${errorMessage}. Please try again or contact support.`)
    } finally {
      setIsProcessing(false)
    }
  }

  const printReceipt = () => {
    const receiptData = {
      receiptNumber: `RCP-${Date.now()}`,
      items: cart,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      paymentMethod,
      cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : total,
      change,
      customer: selectedCustomer,
      warehouse: selectedWarehouse,
      timestamp: new Date().toISOString(),
      cashier: 'Admin'
    }
    
    // Create receipt window
    const receiptWindow = window.open('', '_blank', 'width=400,height=600')
    if (receiptWindow) {
      receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; background: white; }
            .receipt { max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 18px; }
            .header p { margin: 2px 0; font-size: 12px; color: #666; }
            .divider { border-top: 1px dashed #999; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 12px; }
            .item { margin-bottom: 8px; }
            .item-name { font-weight: bold; }
            .item-details { font-size: 11px; color: #666; margin-left: 10px; }
            .total-row { font-weight: bold; font-size: 14px; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>MODERN POS</h1>
              <p>${receiptData.warehouse?.name || 'Main Store'}</p>
              <p>${receiptData.warehouse?.location || 'Location'}</p>
            </div>
            <div class="divider"></div>
            <div class="row"><span>Receipt #:</span><span>${receiptData.receiptNumber}</span></div>
            <div class="row"><span>Date:</span><span>${new Date(receiptData.timestamp).toLocaleString()}</span></div>
            ${receiptData.customer ? `<div class="row"><span>Customer:</span><span>${receiptData.customer.name}</span></div>` : ''}
            <div class="row"><span>Cashier:</span><span>${receiptData.cashier}</span></div>
            <div class="divider"></div>
            ${receiptData.items.map(item => `
              <div class="item">
                <div class="row">
                  <span class="item-name">${item.name}</span>
                  <span>₵${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
                <div class="item-details">
                  ${item.quantity} x ₵${item.unitPrice.toFixed(2)}${item.selectedUnit ? ` (${item.selectedUnit.name})` : ''}
                </div>
              </div>
            `).join('')}
            <div class="divider"></div>
            <div class="row"><span>Subtotal:</span><span>₵${receiptData.subtotal.toFixed(2)}</span></div>
            ${receiptData.discount > 0 ? `<div class="row" style="color: green;"><span>Discount:</span><span>-₵${receiptData.discount.toFixed(2)}</span></div>` : ''}
            ${receiptData.tax > 0 ? `<div class="row"><span>Tax:</span><span>₵${receiptData.tax.toFixed(2)}</span></div>` : ''}
            <div class="divider"></div>
            <div class="row total-row"><span>TOTAL:</span><span>₵${receiptData.total.toFixed(2)}</span></div>
            <div class="divider"></div>
            <div class="row"><span>Payment:</span><span>${receiptData.paymentMethod.toUpperCase()}</span></div>
            ${receiptData.paymentMethod === 'cash' ? `
              <div class="row"><span>Cash Received:</span><span>₵${receiptData.cashReceived.toFixed(2)}</span></div>
              <div class="row"><span>Change:</span><span>₵${receiptData.change.toFixed(2)}</span></div>
            ` : ''}
            <div class="footer">
              <div class="divider"></div>
              <p>Thank you for your business!</p>
              <p>Visit us again soon</p>
              ${receiptData.customer?.loyaltyPoints ? `<p>Loyalty Points: ${receiptData.customer.loyaltyPoints}</p>` : ''}
              <p style="margin-top: 15px;">★ ★ ★ ★ ★</p>
              <p>Powered by Modern POS</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 1000);
            }
          </script>
        </body>
        </html>
      `)
      receiptWindow.document.close()
    }
    
    toast.success('Receipt printed!')
  }

  const handleReprintReceipt = () => {
    if (lastSale) {
      printSaleReceipt(lastSale)
      toast.success('Receipt reprinted!')
    } else {
      toast.error('No recent sale to reprint')
    }
  }

  const printSaleReceipt = (saleData: any) => {
    const calculatedSubtotal = saleData.items?.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unitPrice), 0) || 0
    
    const receiptData = {
      receiptNumber: `RCP-${saleData._id?.slice(-6) || Date.now()}`,
      items: saleData.items?.map((item: any) => ({
        name: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        selectedUnit: null
      })) || [],
      subtotal: saleData.subtotal || calculatedSubtotal,
      discount: saleData.discount || 0,
      tax: saleData.tax || 0,
      total: saleData.total || calculatedSubtotal,
      paymentMethod: saleData.paymentMethod || 'cash',
      cashReceived: saleData.cashReceived || saleData.total || calculatedSubtotal,
      change: (saleData.cashReceived || saleData.total || calculatedSubtotal) - (saleData.total || calculatedSubtotal),
      customer: null,
      warehouse: selectedWarehouse,
      timestamp: saleData.saleDate || new Date().toISOString(),
      cashier: saleData.cashier?.name || 'Admin'
    }
    
    // Create receipt window
    const receiptWindow = window.open('', '_blank', 'width=400,height=600')
    if (receiptWindow) {
      receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; background: white; }
            .receipt { max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 18px; }
            .header p { margin: 2px 0; font-size: 12px; color: #666; }
            .divider { border-top: 1px dashed #999; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 12px; }
            .item { margin-bottom: 8px; }
            .item-name { font-weight: bold; }
            .item-details { font-size: 11px; color: #666; margin-left: 10px; }
            .total-row { font-weight: bold; font-size: 14px; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>MODERN POS</h1>
              <p>${receiptData.warehouse?.name || 'Main Store'}</p>
              <p>${receiptData.warehouse?.location || 'Location'}</p>
            </div>
            <div class="divider"></div>
            <div class="row"><span>Receipt #:</span><span>${receiptData.receiptNumber}</span></div>
            <div class="row"><span>Date:</span><span>${new Date(receiptData.timestamp).toLocaleString()}</span></div>
            <div class="row"><span>Cashier:</span><span>${receiptData.cashier}</span></div>
            <div class="divider"></div>
            ${receiptData.items.map(item => `
              <div class="item">
                <div class="row">
                  <span class="item-name">${item.name}</span>
                  <span>₵${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
                <div class="item-details">
                  ${item.quantity} x ₵${item.unitPrice.toFixed(2)}
                </div>
              </div>
            `).join('')}
            <div class="divider"></div>
            <div class="row"><span>Subtotal:</span><span>₵${receiptData.subtotal.toFixed(2)}</span></div>
            ${receiptData.discount > 0 ? `<div class="row" style="color: green;"><span>Discount:</span><span>-₵${receiptData.discount.toFixed(2)}</span></div>` : ''}
            ${receiptData.tax > 0 ? `<div class="row"><span>Tax:</span><span>₵${receiptData.tax.toFixed(2)}</span></div>` : ''}
            <div class="divider"></div>
            <div class="row total-row"><span>TOTAL:</span><span>₵${receiptData.total.toFixed(2)}</span></div>
            <div class="divider"></div>
            <div class="row"><span>Payment:</span><span>${receiptData.paymentMethod.toUpperCase()}</span></div>
            ${receiptData.paymentMethod === 'cash' ? `
              <div class="row"><span>Cash Received:</span><span>₵${receiptData.cashReceived.toFixed(2)}</span></div>
              <div class="row"><span>Change:</span><span>₵${receiptData.change.toFixed(2)}</span></div>
            ` : ''}
            <div class="footer">
              <div class="divider"></div>
              <p>Thank you for your business!</p>
              <p>Visit us again soon</p>
              <p style="margin-top: 15px;">★ ★ ★ ★ ★</p>
              <p>Powered by Modern POS</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 1000);
            }
          </script>
        </body>
        </html>
      `)
      receiptWindow.document.close()
    }
    
    toast.success('Receipt printed!')
  }

  const handleNoSale = async () => {
    try {
      const { recordNoSale } = await import('@/lib/actions/pos.actions')
      await recordNoSale('Manual cash drawer opening', selectedWarehouse?._id)
      toast.success('Cash drawer opened - Event recorded')
    } catch (error) {
      toast.error('Failed to record no sale event')
    }
  }

  const handleVoiceCommand = (command: string, params?: any) => {
    switch (command) {
      case 'ADD_PRODUCT':
        if (params?.name) {
          const product = products.find(p => 
            p.name.toLowerCase().includes(params.name.toLowerCase())
          )
          if (product) {
            handleAddToCart(product)
            speak(`Added ${product.name} to cart`)
          } else {
            speak(`Product ${params.name} not found`)
          }
        }
        break
        
      case 'SEARCH':
        if (params?.term) {
          setSearchTerm(params.term)
          speak(`Searching for ${params.term}`)
        }
        break
        
      case 'PROCESS_PAYMENT':
        if (cart.length > 0) {
          processPayment()
        } else {
          speak('Cart is empty')
        }
        break
        
      case 'SET_CASH_PAYMENT':
        setPaymentMethod('cash')
        speak('Payment method set to cash')
        break
        
      case 'SET_CARD_PAYMENT':
        setPaymentMethod('card')
        speak('Payment method set to card')
        break
        
      case 'PRINT_RECEIPT':
        if (lastSale) {
          printSaleReceipt(lastSale)
          speak('Receipt printed')
        } else {
          speak('No recent sale to print')
        }
        break
        
      case 'CLEAR_CART':
        clearCart()
        speak('Cart cleared')
        break
    }
  }

  // Dialog Components
  const LastSaleDialog = () => {
    const [todaySales, setTodaySales] = useState<any[]>([])
    const [loadingSales, setLoadingSales] = useState(true)

    useEffect(() => {
      const loadTodaySales = async () => {
        try {
          const { getTodaySales } = await import('@/lib/actions/pos.actions')
          const sales = await getTodaySales()
          setTodaySales(sales)
        } catch (error) {
          console.error('Failed to load sales')
        } finally {
          setLoadingSales(false)
        }
      }
      loadTodaySales()
    }, [])

    const lastSaleData = todaySales[0]

    if (loadingSales) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!lastSaleData) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No sales found today</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="bg-accent/50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Sale #{lastSaleData._id?.slice(-6)}</span>
            <Badge variant={lastSaleData.isVoided ? 'destructive' : 'default'}>
              {lastSaleData.isVoided ? 'Voided' : 'Completed'}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Date: {new Date(lastSaleData.saleDate).toLocaleString()}</p>
            <p>Payment: {lastSaleData.paymentMethod?.toUpperCase()}</p>
            <p>Cashier: {lastSaleData.cashier?.name || 'Unknown'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Items ({lastSaleData.items?.length || 0})</h4>
          {lastSaleData.items?.map((item: any, index: number) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{item.product?.name || 'Unknown Product'}</span>
              <span>{item.quantity} x ₵{item.unitPrice?.toFixed(2)} = ₵{(item.quantity * item.unitPrice).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-1 text-sm">
          {(() => {
            const calculatedSubtotal = lastSaleData.items?.reduce((sum: number, item: any) => 
              sum + (item.quantity * item.unitPrice), 0) || 0
            const displaySubtotal = lastSaleData.subtotal || calculatedSubtotal
            const displayDiscount = lastSaleData.discount || 0
            const displayTax = lastSaleData.tax || 0
            const displayTotal = lastSaleData.total || calculatedSubtotal
            
            return (
              <>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₵{displaySubtotal.toFixed(2)}</span>
                </div>
                {displayDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-₵{displayDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₵{displayTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₵{displayTotal.toFixed(2)}</span>
                </div>
              </>
            )
          })()}
        </div>

        <Button 
          onClick={() => {
            printSaleReceipt(lastSaleData)
          }}
          className="w-full"
        >
          <Printer className="h-4 w-4 mr-2" />
          Reprint Receipt
        </Button>
      </div>
    )
  }

  const CalculatorDialog = () => {
    const [display, setDisplay] = useState('0')
    const [previousValue, setPreviousValue] = useState<number | null>(null)
    const [operation, setOperation] = useState<string | null>(null)
    const [waitingForOperand, setWaitingForOperand] = useState(false)

    const inputNumber = (num: string) => {
      if (waitingForOperand) {
        setDisplay(num)
        setWaitingForOperand(false)
      } else {
        setDisplay(display === '0' ? num : display + num)
      }
    }

    const inputOperation = (nextOperation: string) => {
      const inputValue = parseFloat(display)

      if (previousValue === null) {
        setPreviousValue(inputValue)
      } else if (operation) {
        const currentValue = previousValue || 0
        const newValue = calculate(currentValue, inputValue, operation)

        setDisplay(String(newValue))
        setPreviousValue(newValue)
      }

      setWaitingForOperand(true)
      setOperation(nextOperation)
    }

    const calculate = (firstValue: number, secondValue: number, operation: string) => {
      switch (operation) {
        case '+':
          return firstValue + secondValue
        case '-':
          return firstValue - secondValue
        case '*':
          return firstValue * secondValue
        case '/':
          return firstValue / secondValue
        case '=':
          return secondValue
        default:
          return secondValue
      }
    }

    const performCalculation = () => {
      const inputValue = parseFloat(display)

      if (previousValue !== null && operation) {
        const newValue = calculate(previousValue, inputValue, operation)
        setDisplay(String(newValue))
        setPreviousValue(null)
        setOperation(null)
        setWaitingForOperand(true)
      }
    }

    const clear = () => {
      setDisplay('0')
      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(false)
    }

    const clearEntry = () => {
      setDisplay('0')
    }

    const inputDecimal = () => {
      if (waitingForOperand) {
        setDisplay('0.')
        setWaitingForOperand(false)
      } else if (display.indexOf('.') === -1) {
        setDisplay(display + '.')
      }
    }

    return (
      <div className="space-y-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-right">
          <div className="text-2xl font-mono font-bold">{display}</div>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" onClick={clear} className="col-span-2">
            Clear
          </Button>
          <Button variant="outline" onClick={clearEntry}>
            CE
          </Button>
          <Button variant="outline" onClick={() => inputOperation('/')}>
            ÷
          </Button>
          
          <Button variant="outline" onClick={() => inputNumber('7')}>
            7
          </Button>
          <Button variant="outline" onClick={() => inputNumber('8')}>
            8
          </Button>
          <Button variant="outline" onClick={() => inputNumber('9')}>
            9
          </Button>
          <Button variant="outline" onClick={() => inputOperation('*')}>
            ×
          </Button>
          
          <Button variant="outline" onClick={() => inputNumber('4')}>
            4
          </Button>
          <Button variant="outline" onClick={() => inputNumber('5')}>
            5
          </Button>
          <Button variant="outline" onClick={() => inputNumber('6')}>
            6
          </Button>
          <Button variant="outline" onClick={() => inputOperation('-')}>
            -
          </Button>
          
          <Button variant="outline" onClick={() => inputNumber('1')}>
            1
          </Button>
          <Button variant="outline" onClick={() => inputNumber('2')}>
            2
          </Button>
          <Button variant="outline" onClick={() => inputNumber('3')}>
            3
          </Button>
          <Button variant="outline" onClick={() => inputOperation('+')} className="row-span-2">
            +
          </Button>
          
          <Button variant="outline" onClick={() => inputNumber('0')} className="col-span-2">
            0
          </Button>
          <Button variant="outline" onClick={inputDecimal}>
            .
          </Button>
          
          <Button onClick={performCalculation} className="col-span-3">
            =
          </Button>
        </div>
      </div>
    )
  }

  const NoSaleDialog = ({ onConfirm }: { onConfirm: () => void }) => {
    const [reason, setReason] = useState('')
    const [showEvents, setShowEvents] = useState(false)
    const [events, setEvents] = useState<any[]>([])

    const loadEvents = async () => {
      try {
        const { getCashDrawerEvents } = await import('@/lib/actions/pos.actions')
        const eventsData = await getCashDrawerEvents(selectedWarehouse?._id)
        setEvents(eventsData)
      } catch (error) {
        console.error('Failed to load events')
      }
    }

    const handleConfirm = () => {
      if (!reason.trim()) {
        toast.error('Please provide a reason')
        return
      }
      onConfirm()
      setReason('')
    }

    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This will open the cash drawer without processing a sale
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Reason for opening drawer</label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="making_change">Making change for customer</SelectItem>
              <SelectItem value="cash_management">Cash management</SelectItem>
              <SelectItem value="manager_request">Manager request</SelectItem>
              <SelectItem value="drawer_count">Drawer count</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setShowEvents(!showEvents)
              if (!showEvents) loadEvents()
            }}
          >
            <History className="h-4 w-4 mr-2" />
            {showEvents ? 'Hide' : 'View'} Today's Events
          </Button>
          <Button onClick={handleConfirm} disabled={!reason}>
            <Receipt className="h-4 w-4 mr-2" />
            Open Drawer
          </Button>
        </div>

        {showEvents && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Today's Cash Drawer Events</h4>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events today</p>
              ) : (
                events.map((event, index) => (
                  <div key={index} className="text-xs bg-accent/50 p-2 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium capitalize">{event.type.replace('_', ' ')}</span>
                      <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-muted-foreground">{event.reason}</p>
                    <p className="text-muted-foreground">By: {event.cashier?.name || 'Unknown'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <POSLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Point of Sale</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedWarehouse ? `${selectedWarehouse.name} - ${selectedWarehouse.location}` : 'Select warehouse'}
                </p>
              </div>
            </div>
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
          </div>

          <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white rounded-lg border">
            <div className="flex-1">
              <VoiceSearch
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onProductSelect={(productName) => {
                  const product = products.find(p => 
                    p.name.toLowerCase().includes(productName.toLowerCase())
                  )
                  if (product) {
                    handleProductClick(product)
                    setSearchTerm('')
                  } else {
                    toast.error(`Product "${productName}" not found`)
                  }
                }}
                placeholder="Search products, scan barcode, or use voice..."
              />
            </div>
            <Button variant="outline" size="sm" className="h-10">
              <QrCode className="h-4 w-4 mr-2" />
              Scan
            </Button>
            <VoiceSettings />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32 h-10">
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

          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-4 bg-gray-50 rounded-lg">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading products...</p>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    {searchTerm ? 'No Products Found' : 'No Products Available'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md">
                    {searchTerm 
                      ? `No products match "${searchTerm}". Try a different search term or clear the search.`
                      : selectedWarehouse 
                        ? `No products found in ${selectedWarehouse.name}. Add products to this warehouse to start selling.`
                        : 'Select a warehouse to view available products.'
                    }
                  </p>
                  <div className="flex gap-2">
                    {searchTerm && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSearchTerm('')}
                      >
                        Clear Search
                      </Button>
                    )}
                    {selectedCategory !== 'All' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedCategory('All')}
                      >
                        Show All Categories
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                  {products.map(product => (
                    <div 
                      key={product.id} 
                      className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] border group"
                      onClick={() => handleProductClick(product)}
                    >
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-md mb-2 flex items-center justify-center relative">
                        <Package className="h-6 w-6 text-muted-foreground group-hover:scale-110 transition-transform" />
                        {product.stock <= 10 && (
                          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0">
                            Low
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-medium text-xs mb-1 line-clamp-2 h-8">{product.name}</h3>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-primary">₵{product.price.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">{product.stock}</span>
                        </div>
                        {product.units && product.units.length > 0 && (
                          <Badge variant="outline" className="text-xs w-full justify-center">
                            {product.units.length} units
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 flex flex-col space-y-4">
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
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${item.selectedUnit?._id || 'default'}`} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>₵{item.unitPrice.toFixed(2)}</span>
                          {item.selectedUnit && (
                            <Badge variant="secondary" className="text-xs">
                              {item.selectedUnit.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-sm">₵{(item.unitPrice * item.quantity).toFixed(2)}</p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeFromCart(index)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calculator className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Tax</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={tax}
                        onChange={(e) => setTax(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
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
                      <span>₵{taxAmount.toFixed(2)}</span>
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

          <VoiceAssistant onVoiceCommand={handleVoiceCommand} />

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-start">
                    <History className="h-4 w-4 mr-2" />
                    Last Sale
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Last Sale Details</DialogTitle>
                  </DialogHeader>
                  <LastSaleDialog />
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start"
                onClick={handleReprintReceipt}
              >
                <Printer className="h-4 w-4 mr-2" />
                Reprint
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-start">
                    <Receipt className="h-4 w-4 mr-2" />
                    No Sale
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>No Sale - Open Cash Drawer</DialogTitle>
                  </DialogHeader>
                  <NoSaleDialog onConfirm={handleNoSale} />
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="justify-start">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculator
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Calculator</DialogTitle>
                  </DialogHeader>
                  <CalculatorDialog />
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        </div>
      </div>

      {/* Unit Selection Dialog */}
      <Dialog open={showUnitDialog} onOpenChange={setShowUnitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Unit - {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid gap-3">
                {selectedProduct.units?.map((unit: any) => (
                  <div 
                    key={unit._id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => {
                      handleAddToCart(selectedProduct, unit)
                      setShowUnitDialog(false)
                      setSelectedProduct(null)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{unit.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {unit.conversionFactor || 1} pieces per {unit.name.toLowerCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">₵{unit.sellingPrice?.toFixed(2) || selectedProduct.price.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">per {unit.name.toLowerCase()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowUnitDialog(false)
                  setSelectedProduct(null)
                }}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </POSLayout>
  )
}

export default function POSPage() {
  return <POSContent />
}