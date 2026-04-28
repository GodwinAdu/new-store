/**
 * Receipt utility functions for the POS system.
 * All functions are pure with no side effects.
 */

export interface ReceiptLineItem {
  name: string
  unitLabel?: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface ReceiptData {
  receiptNumber: string
  storeName: string
  warehouseName: string
  warehouseLocation: string
  cashierName: string
  timestamp: string
  items: ReceiptLineItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: 'cash' | 'card' | 'mobile'
  cashReceived?: number
  change?: number
  customer?: {
    name: string
    email?: string
    loyaltyPointsEarned: number
  }
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  unitPrice: number
  unitQuantity: number
  selectedUnit?: {
    _id?: string
    name?: string
    sellingPrice?: number
    conversionFactor?: number
  }
  [key: string]: unknown
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
  name: string
  location: string
}

interface Cashier {
  name: string
}

interface SaleDocument {
  _id?: string
  saleDate?: string | Date
  paymentMethod?: string
  subtotal?: number
  discount?: number
  tax?: number
  total?: number
  cashReceived?: number
  [key: string]: unknown
}

/**
 * Builds a ReceiptData object from a completed sale and its associated context.
 *
 * @param sale       - The Sale document returned by processSale()
 * @param cart       - The cart items at the time of the sale
 * @param customer   - The attached customer, or null if none
 * @param warehouse  - The warehouse object with name and location
 * @param cashier    - The cashier object with name
 * @returns          A fully populated ReceiptData object
 */
export function buildReceiptData(
  sale: SaleDocument,
  cart: CartItem[],
  customer: Customer | null,
  warehouse: Warehouse,
  cashier: Cashier
): ReceiptData {
  // Derive receipt number from sale _id or fallback to timestamp
  const receiptNumber = sale._id
    ? String(sale._id).slice(-8).toUpperCase()
    : Date.now().toString(36).toUpperCase()

  // Format timestamp as ISO string for consistent serialization
  const timestamp = sale.saleDate
    ? new Date(sale.saleDate).toISOString()
    : new Date().toISOString()

  // Build line items from cart
  const items: ReceiptLineItem[] = cart.map((item) => ({
    name: item.name,
    unitLabel: item.selectedUnit?.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.unitPrice * item.unitQuantity,
  }))

  // Use values from the sale document (authoritative server-side totals)
  const subtotal = sale.subtotal ?? 0
  const discount = sale.discount ?? 0
  const tax = sale.tax ?? 0
  const total = sale.total ?? 0

  const paymentMethod = (sale.paymentMethod ?? 'cash') as 'cash' | 'card' | 'mobile'

  // Cash-specific fields
  const cashReceived =
    paymentMethod === 'cash' && sale.cashReceived != null
      ? sale.cashReceived
      : undefined

  const change =
    paymentMethod === 'cash' && cashReceived != null
      ? Math.max(0, cashReceived - total)
      : undefined

  // Customer section — loyalty points earned = floor(total)
  const customerData = customer
    ? {
        name: customer.name,
        email: customer.email,
        loyaltyPointsEarned: Math.floor(total),
      }
    : undefined

  return {
    receiptNumber,
    storeName: 'Modern POS',
    warehouseName: warehouse.name,
    warehouseLocation: warehouse.location,
    cashierName: cashier.name,
    timestamp,
    items,
    subtotal,
    discount,
    tax,
    total,
    paymentMethod,
    cashReceived,
    change,
    customer: customerData,
  }
}
