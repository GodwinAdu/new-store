import { buildReceiptData } from '@/lib/utils/receipt-utils'

// Shared test fixtures
const warehouse = { name: 'Main Warehouse', location: '123 Market St' }
const cashier = { name: 'Jane Doe' }

const makeCartItem = (overrides: Partial<{
  id: string
  name: string
  price: number
  quantity: number
  unitPrice: number
  unitQuantity: number
  selectedUnit?: { name?: string }
}> = {}) => ({
  id: 'item-1',
  name: 'Widget',
  price: 10,
  quantity: 2,
  unitPrice: 10,
  unitQuantity: 2,
  ...overrides,
})

const makeSale = (overrides: Partial<{
  _id: string
  saleDate: string | Date
  paymentMethod: string
  subtotal: number
  discount: number
  tax: number
  total: number
  cashReceived: number
}> = {}) => ({
  _id: 'sale-abcdefgh',
  saleDate: '2024-06-15T10:30:00.000Z',
  paymentMethod: 'cash',
  subtotal: 20,
  discount: 0,
  tax: 0,
  total: 20,
  cashReceived: 25,
  ...overrides,
})

const customerWithEmail = {
  id: 'cust-1',
  name: 'Alice Smith',
  email: 'alice@example.com',
  phone: '555-1234',
  loyaltyPoints: 100,
}

const customerWithoutEmail = {
  id: 'cust-2',
  name: 'Bob Jones',
  phone: '555-5678',
}

describe('buildReceiptData', () => {
  it('basic receipt with cash payment — all fields are populated correctly', () => {
    const cart = [makeCartItem()]
    const sale = makeSale()

    const receipt = buildReceiptData(sale, cart, null, warehouse, cashier)

    expect(receipt.storeName).toBe('Modern POS')
    expect(receipt.warehouseName).toBe('Main Warehouse')
    expect(receipt.warehouseLocation).toBe('123 Market St')
    expect(receipt.cashierName).toBe('Jane Doe')
    expect(receipt.paymentMethod).toBe('cash')
    expect(receipt.subtotal).toBe(20)
    expect(receipt.discount).toBe(0)
    expect(receipt.tax).toBe(0)
    expect(receipt.total).toBe(20)
    expect(receipt.cashReceived).toBe(25)
    expect(receipt.change).toBe(5)
    expect(receipt.items).toHaveLength(1)
    expect(receipt.receiptNumber).toBeTruthy()
    expect(receipt.timestamp).toBeTruthy()
  })

  it('receipt with no customer — customer field is undefined', () => {
    const cart = [makeCartItem()]
    const sale = makeSale()

    const receipt = buildReceiptData(sale, cart, null, warehouse, cashier)

    expect(receipt.customer).toBeUndefined()
  })

  it('receipt with customer with email — customer data including loyaltyPointsEarned = Math.floor(total)', () => {
    const cart = [makeCartItem()]
    const sale = makeSale({ total: 47.89 })

    const receipt = buildReceiptData(sale, cart, customerWithEmail, warehouse, cashier)

    expect(receipt.customer).toBeDefined()
    expect(receipt.customer!.name).toBe('Alice Smith')
    expect(receipt.customer!.email).toBe('alice@example.com')
    expect(receipt.customer!.loyaltyPointsEarned).toBe(47) // Math.floor(47.89)
  })

  it('receipt with customer without email — email is undefined but name is present', () => {
    const cart = [makeCartItem()]
    const sale = makeSale({ total: 30 })

    const receipt = buildReceiptData(sale, cart, customerWithoutEmail, warehouse, cashier)

    expect(receipt.customer).toBeDefined()
    expect(receipt.customer!.name).toBe('Bob Jones')
    expect(receipt.customer!.email).toBeUndefined()
    expect(receipt.customer!.loyaltyPointsEarned).toBe(30)
  })

  it('card payment — cashReceived and change are undefined', () => {
    const cart = [makeCartItem()]
    const sale = makeSale({ paymentMethod: 'card', cashReceived: undefined })

    const receipt = buildReceiptData(sale, cart, null, warehouse, cashier)

    expect(receipt.paymentMethod).toBe('card')
    expect(receipt.cashReceived).toBeUndefined()
    expect(receipt.change).toBeUndefined()
  })

  it('mobile payment — cashReceived and change are undefined', () => {
    const cart = [makeCartItem()]
    const sale = makeSale({ paymentMethod: 'mobile', cashReceived: undefined })

    const receipt = buildReceiptData(sale, cart, null, warehouse, cashier)

    expect(receipt.paymentMethod).toBe('mobile')
    expect(receipt.cashReceived).toBeUndefined()
    expect(receipt.change).toBeUndefined()
  })

  it('cash payment — cashReceived and change are calculated correctly', () => {
    const cart = [makeCartItem()]
    const sale = makeSale({ paymentMethod: 'cash', total: 18.50, cashReceived: 20 })

    const receipt = buildReceiptData(sale, cart, null, warehouse, cashier)

    expect(receipt.paymentMethod).toBe('cash')
    expect(receipt.cashReceived).toBe(20)
    expect(receipt.change).toBeCloseTo(1.5, 5)
  })

  it('multiple cart items — all items appear in receipt with correct line totals', () => {
    const cart = [
      makeCartItem({ id: 'item-1', name: 'Widget', unitPrice: 10, unitQuantity: 2, quantity: 2 }),
      makeCartItem({ id: 'item-2', name: 'Gadget', unitPrice: 5, unitQuantity: 3, quantity: 3 }),
      makeCartItem({ id: 'item-3', name: 'Doohickey', unitPrice: 7.5, unitQuantity: 1, quantity: 1 }),
    ]
    const sale = makeSale({ subtotal: 42.5, total: 42.5 })

    const receipt = buildReceiptData(sale, cart, null, warehouse, cashier)

    expect(receipt.items).toHaveLength(3)

    expect(receipt.items[0].name).toBe('Widget')
    expect(receipt.items[0].quantity).toBe(2)
    expect(receipt.items[0].unitPrice).toBe(10)
    expect(receipt.items[0].lineTotal).toBe(20) // 10 * 2

    expect(receipt.items[1].name).toBe('Gadget')
    expect(receipt.items[1].quantity).toBe(3)
    expect(receipt.items[1].unitPrice).toBe(5)
    expect(receipt.items[1].lineTotal).toBe(15) // 5 * 3

    expect(receipt.items[2].name).toBe('Doohickey')
    expect(receipt.items[2].quantity).toBe(1)
    expect(receipt.items[2].unitPrice).toBe(7.5)
    expect(receipt.items[2].lineTotal).toBe(7.5) // 7.5 * 1
  })

  it('receipt number is derived from sale._id (last 8 chars, uppercased)', () => {
    const cart = [makeCartItem()]
    const sale = makeSale({ _id: 'sale-abcdefgh12345678' })

    const receipt = buildReceiptData(sale, cart, null, warehouse, cashier)

    expect(receipt.receiptNumber).toBe('12345678')
  })

  it('timestamp is derived from sale.saleDate as ISO string', () => {
    const cart = [makeCartItem()]
    const saleDate = '2024-06-15T10:30:00.000Z'
    const sale = makeSale({ saleDate })

    const receipt = buildReceiptData(sale, cart, null, warehouse, cashier)

    expect(receipt.timestamp).toBe(new Date(saleDate).toISOString())
  })
})
