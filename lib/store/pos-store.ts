import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  barcode?: string
  sku?: string
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

interface Warehouse {
  _id: string
  name: string
  location: string
}

interface POSState {
  // Warehouse
  selectedWarehouse: Warehouse | null
  setSelectedWarehouse: (warehouse: Warehouse | null) => void
  
  // Cart
  cart: CartItem[]
  addToCart: (product: Product, unit?: any, quantity?: number) => void
  updateQuantity: (index: number, quantity: number) => void
  removeFromCart: (index: number) => void
  clearCart: () => void
  
  // Customer
  selectedCustomer: Customer | null
  setSelectedCustomer: (customer: Customer | null) => void
  
  // Payment
  paymentMethod: 'cash' | 'card' | 'mobile'
  setPaymentMethod: (method: 'cash' | 'card' | 'mobile') => void
  cashReceived: string
  setCashReceived: (amount: string) => void
  discount: number
  setDiscount: (discount: number) => void
  tax: number
  setTax: (tax: number) => void
  
  // Computed values
  getSubtotal: () => number
  getDiscountAmount: () => number
  getTaxAmount: () => number
  getTotal: () => number
  getChange: () => number
}

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      // Warehouse
      selectedWarehouse: null,
      setSelectedWarehouse: (warehouse) => set({ selectedWarehouse: warehouse }),
      
      // Cart
      cart: [],
      addToCart: (product, unit, quantity = 1) => {
        const unitPrice = unit ? (unit.sellingPrice || product.price) : product.price
        const unitQuantity = unit ? quantity : quantity
        
        set((state) => {
          const existing = state.cart.find(item => 
            unit ? (item.id === product.id && item.selectedUnit?._id === unit._id) : item.id === product.id
          )
          
          if (existing) {
            return {
              cart: state.cart.map(item => 
                (unit ? (item.id === product.id && item.selectedUnit?._id === unit._id) : item.id === product.id)
                  ? { ...item, quantity: item.quantity + 1, unitQuantity: item.unitQuantity + unitQuantity }
                  : item
              )
            }
          }
          
          return {
            cart: [...state.cart, { 
              ...product, 
              quantity: 1,
              selectedUnit: unit,
              unitPrice: unitPrice || product.price || 0,
              unitQuantity: unitQuantity || 1
            }]
          }
        })
      },
      
      updateQuantity: (index, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(index)
          return
        }
        
        set((state) => ({
          cart: state.cart.map((item, i) => 
            i === index ? { 
              ...item, 
              quantity,
              unitQuantity: item.selectedUnit ? quantity * (item.selectedUnit.conversionFactor || 1) : quantity
            } : item
          )
        }))
      },
      
      removeFromCart: (index) => {
        set((state) => ({
          cart: state.cart.filter((_, i) => i !== index)
        }))
      },
      
      clearCart: () => set({ 
        cart: [], 
        selectedCustomer: null, 
        discount: 0, 
        tax: 0,
        cashReceived: '' 
      }),
      
      // Customer
      selectedCustomer: null,
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
      
      // Payment
      paymentMethod: 'cash',
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      cashReceived: '',
      setCashReceived: (amount) => set({ cashReceived: amount }),
      discount: 0,
      setDiscount: (discount) => set({ discount: Math.max(0, Math.min(100, discount)) }),
      tax: 0,
      setTax: (tax) => set({ tax: Math.max(0, Math.min(100, tax)) }),
      
      // Computed values
      getSubtotal: () => {
        const { cart } = get()
        return cart.reduce((sum, item) => sum + (item.unitPrice * item.unitQuantity), 0)
      },
      
      getDiscountAmount: () => {
        const { discount } = get()
        return get().getSubtotal() * (discount / 100)
      },
      
      getTaxAmount: () => {
        const { tax } = get()
        const subtotal = get().getSubtotal()
        const discountAmount = get().getDiscountAmount()
        return (subtotal - discountAmount) * (tax / 100)
      },
      
      getTotal: () => {
        const subtotal = get().getSubtotal()
        const discountAmount = get().getDiscountAmount()
        const taxAmount = get().getTaxAmount()
        return subtotal - discountAmount + taxAmount
      },
      
      getChange: () => {
        const { paymentMethod, cashReceived } = get()
        const total = get().getTotal()
        return paymentMethod === 'cash' ? Math.max(0, parseFloat(cashReceived || '0') - total) : 0
      }
    }),
    {
      name: 'pos-store',
      partialize: (state) => ({
        selectedWarehouse: state.selectedWarehouse,
        cart: state.cart,
        selectedCustomer: state.selectedCustomer,
        paymentMethod: state.paymentMethod,
        discount: state.discount,
        tax: state.tax
      })
    }
  )
)