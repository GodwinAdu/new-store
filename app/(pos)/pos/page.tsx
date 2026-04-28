'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { POSLayout } from '@/components/pos/pos-layout'
import { ProductGrid } from '@/components/pos/product-grid'
import { OrderPanel } from '@/components/pos/order-panel'
import { PaymentModal } from '@/components/pos/payment-modal'
import { ReceiptPreview } from '@/components/pos/receipt-preview'
import { processSale, getCurrentCashierName } from '@/lib/actions/pos.actions'
import { getCustomers, updateCustomerPoints } from '@/lib/actions/customer.actions'
import { fetchAllWarehouses } from '@/lib/actions/warehouse.actions'
import { getWarehouseProducts } from '@/lib/actions/warehouse.actions'
import { usePOSStore } from '@/lib/store/pos-store'
import { buildReceiptData, type ReceiptData } from '@/lib/utils/receipt-utils'
import { 
  Package,
  History,
  AlertCircle,
  Printer,
  Receipt,
} from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  minStock?: number
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
    getChange,
    addLowStockAlert,
  } = usePOSStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isProcessing, setIsProcessing] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastSale, setLastSale] = useState<any>(null)
  const [hydrated, setHydrated] = useState(false)
  const [cashierName, setCashierName] = useState('Cashier')

  // PaymentModal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // ReceiptPreview state
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)

  // Dialog states for quick actions
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const [noSaleOpen, setNoSaleOpen] = useState(false)
  const [lastReceiptOpen, setLastReceiptOpen] = useState(false)


  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      loadData()
    }
  }, [hydrated])

  useEffect(() => {
    if (selectedWarehouse) {
      loadProducts()
    }
  }, [selectedWarehouse])

  const loadData = async () => {
    try {
      const [warehousesData, customersData, fetchedCashierName] = await Promise.all([
        fetchAllWarehouses(),
        getCustomers(),
        getCurrentCashierName(),
      ])
      
      if (!warehousesData || warehousesData.length === 0) {
        toast.error('No warehouses found. Please contact administrator.')
        return
      }
      
      setWarehouses(warehousesData)
      setCustomers(customersData || [])
      setCashierName(fetchedCashierName)
      
      if (!selectedWarehouse) {
        setSelectedWarehouse(warehousesData[0])
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
        setAllProducts([])
        setCategories(['All'])
        return
      }
      
      const mapped = productsData.map(p => ({
        ...p,
        id: p._id,
        stock: p.totalStock || 0,
        minStock: p.minStock,
        category: p.category || 'General',
        units: p.units || []
      }))

      // Derive real categories from the product list
      const uniqueCategories = ['All', ...Array.from(new Set(mapped.map(p => p.category))).sort()]

      setProducts(mapped)
      setCategories(uniqueCategories)
      
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
    } catch (error) {
      toast.error('Failed to add item to cart. Please try again.')
    }
  }

  const handleProductClick = (product: Product, unit?: any) => {
    handleAddToCart(product, unit)
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
    setPaymentError(null)
    
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

      // --- Task 11.4: Low-stock alerts ---
      const cartSnapshot = [...cart]
      for (const item of cartSnapshot) {
        const remainingStock = item.stock - item.quantity
        const threshold = item.minStock ?? 0
        if (remainingStock <= threshold) {
          addLowStockAlert({
            productId: item.id,
            productName: item.name,
            currentStock: remainingStock,
            minStock: threshold,
            timestamp: Date.now(),
          })
        }
      }

      // --- Task 11.5: Award loyalty points ---
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

      // --- Task 11.2 / 11.3: Close PaymentModal, open ReceiptPreview ---
      const builtReceipt = buildReceiptData(
        sale,
        cartSnapshot,
        selectedCustomer,
        { name: selectedWarehouse.name, location: selectedWarehouse.location },
        { name: cashierName }
      )
      setReceiptData(builtReceipt)
      setPaymentModalOpen(false)
      setReceiptOpen(true)

      clearCart()
      loadProducts()
    } catch (error) {
      console.error('Payment processing error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setPaymentError(`Payment failed: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Opens the PaymentModal (called by OrderPanel's Charge button)
  const handleCharge = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty. Please add items first.')
      return
    }
    if (!selectedWarehouse) {
      toast.error('Please select a warehouse first.')
      return
    }
    setPaymentError(null)
    setPaymentModalOpen(true)
  }

  // Opens ReceiptPreview for reprinting (used by ConsolidatedSalesTab and Last Receipt)
  const handleReprintReceipt = (data: ReceiptData) => {
    setReceiptData(data)
    setReceiptOpen(true)
  }

  const handleNoSale = async () => {
    try {
      const { recordNoSale } = await import('@/lib/actions/pos.actions')
      await recordNoSale('Manual cash drawer opening', selectedWarehouse?._id)
      toast.success('Cash drawer opened - Event recorded')
      setNoSaleOpen(false)
    } catch (error) {
      toast.error('Failed to record no sale event')
    }
  }

  // Last Receipt: open ReceiptPreview with the most recent sale
  const handleLastReceipt = async () => {
    if (receiptData) {
      // Already have receipt data from the last sale in this session
      setReceiptOpen(true)
      return
    }
    // Try to fetch the most recent sale from today
    try {
      const { getTodaySales } = await import('@/lib/actions/pos.actions')
      const sales = await getTodaySales()
      if (!sales || sales.length === 0) {
        toast.error('No recent sale to reprint')
        return
      }
      const latest = sales[0]
      const items = latest.items?.map((item: any) => ({
        name: item.product?.name || 'Unknown Product',
        unitLabel: undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.unitPrice * item.quantity,
      })) || []
      const builtReceipt: ReceiptData = {
        receiptNumber: latest._id.slice(-8).toUpperCase(),
        storeName: 'Modern POS',
        warehouseName: selectedWarehouse?.name || '',
        warehouseLocation: selectedWarehouse?.location || '',
        cashierName: latest.cashier?.name || 'Admin',
        timestamp: latest.saleDate || new Date().toISOString(),
        items,
        subtotal: latest.subtotal || 0,
        discount: latest.discount || 0,
        tax: latest.tax || 0,
        total: latest.total || 0,
        paymentMethod: (latest.paymentMethod as 'cash' | 'card' | 'mobile') || 'cash',
        cashReceived: latest.cashReceived,
        change: latest.paymentMethod === 'cash' && latest.cashReceived != null
          ? Math.max(0, latest.cashReceived - latest.total)
          : undefined,
      }
      setReceiptData(builtReceipt)
      setReceiptOpen(true)
    } catch (error) {
      toast.error('No recent sale to reprint')
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
            const items = lastSaleData.items?.map((item: any) => ({
              name: item.product?.name || 'Unknown Product',
              unitLabel: undefined,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.unitPrice * item.quantity,
            })) || []
            const builtReceipt: ReceiptData = {
              receiptNumber: lastSaleData._id.slice(-8).toUpperCase(),
              storeName: 'Modern POS',
              warehouseName: selectedWarehouse?.name || '',
              warehouseLocation: selectedWarehouse?.location || '',
              cashierName: lastSaleData.cashier?.name || 'Admin',
              timestamp: lastSaleData.saleDate || new Date().toISOString(),
              items,
              subtotal: lastSaleData.subtotal || 0,
              discount: lastSaleData.discount || 0,
              tax: lastSaleData.tax || 0,
              total: lastSaleData.total || 0,
              paymentMethod: (lastSaleData.paymentMethod as 'cash' | 'card' | 'mobile') || 'cash',
              cashReceived: lastSaleData.cashReceived,
              change: lastSaleData.paymentMethod === 'cash' && lastSaleData.cashReceived != null
                ? Math.max(0, lastSaleData.cashReceived - lastSaleData.total)
                : undefined,
            }
            handleReprintReceipt(builtReceipt)
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
    <POSLayout
      onReprintReceipt={handleReprintReceipt}
      onCalculator={() => setCalculatorOpen(true)}
      onNoSale={() => setNoSaleOpen(true)}
      onLastReceipt={handleLastReceipt}
      cashierName={cashierName}
    >
      <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
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

          <div className="flex-1 overflow-hidden p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <ProductGrid
              products={products}
              loading={loading}
              onAddProduct={handleProductClick}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
            />
          </div>
        </div>

        <div className="w-full lg:w-96 flex flex-col space-y-4">
          <OrderPanel
            cart={cart}
            selectedCustomer={selectedCustomer}
            discount={discount}
            tax={tax}
            subtotal={subtotal}
            discountAmount={discountAmount}
            taxAmount={taxAmount}
            total={total}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            onSetDiscount={setDiscount}
            onSetTax={setTax}
            onSelectCustomer={setSelectedCustomer}
            onCharge={handleCharge}
            customers={customers}
          />
        </div>
      </div>

      {/* PaymentModal — Task 11.2 */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          if (!isProcessing) {
            setPaymentModalOpen(false)
            setPaymentError(null)
          }
        }}
        total={total}
        paymentMethod={paymentMethod}
        cashReceived={cashReceived}
        change={change}
        isProcessing={isProcessing}
        error={paymentError}
        onPaymentMethodChange={setPaymentMethod}
        onCashReceivedChange={setCashReceived}
        onConfirm={processPayment}
      />

      {/* ReceiptPreview — Task 11.3 */}
      <ReceiptPreview
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        receiptData={receiptData}
      />

      {/* Calculator Dialog */}
      <Dialog open={calculatorOpen} onOpenChange={setCalculatorOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Calculator</DialogTitle>
          </DialogHeader>
          <CalculatorDialog />
        </DialogContent>
      </Dialog>

      {/* No Sale Dialog */}
      <Dialog open={noSaleOpen} onOpenChange={setNoSaleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>No Sale - Open Cash Drawer</DialogTitle>
          </DialogHeader>
          <NoSaleDialog onConfirm={handleNoSale} />
        </DialogContent>
      </Dialog>

      {/* Last Sale Dialog */}
      <Dialog open={lastReceiptOpen} onOpenChange={setLastReceiptOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Last Sale Details</DialogTitle>
          </DialogHeader>
          <LastSaleDialog />
        </DialogContent>
      </Dialog>

    </POSLayout>
  )
}

export default function POSPage() {
  return <POSContent />
}