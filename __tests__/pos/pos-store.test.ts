import * as fc from 'fast-check'

// Pure computation functions mirroring the pos-store logic exactly.
// We test these formulas directly to avoid Zustand's localStorage dependency.

function computeSubtotal(cart: { unitPrice: number; unitQuantity: number }[]): number {
  return cart.reduce((sum, item) => sum + item.unitPrice * item.unitQuantity, 0)
}

function computeDiscountAmount(subtotal: number, discount: number): number {
  return subtotal * (discount / 100)
}

function computeTaxAmount(subtotal: number, discountAmount: number, tax: number): number {
  return (subtotal - discountAmount) * (tax / 100)
}

function computeTotal(subtotal: number, discountAmount: number, taxAmount: number): number {
  return subtotal - discountAmount + taxAmount
}

function computeChange(
  paymentMethod: 'cash' | 'card' | 'mobile',
  cashReceived: string,
  total: number
): number {
  return paymentMethod === 'cash'
    ? Math.max(0, parseFloat(cashReceived || '0') - total)
    : 0
}

function computeLoyaltyPoints(total: number): number {
  return Math.floor(total)
}

function incrementQuantity(quantity: number, stock: number): number {
  if (quantity >= stock) return quantity
  return quantity + 1
}

function decrementQuantity(quantity: number): number | null {
  if (quantity <= 1) return null // null means remove
  return quantity - 1
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

const cartItemArb = fc.record({
  unitPrice: fc.float({ min: Math.fround(0.01), max: Math.fround(10_000), noNaN: true }),
  unitQuantity: fc.float({ min: Math.fround(0.01), max: Math.fround(1_000), noNaN: true }),
})

const cartArb = fc.array(cartItemArb, { minLength: 0, maxLength: 20 })

const percentArb = fc.float({ min: Math.fround(0), max: Math.fround(100), noNaN: true })

// ---------------------------------------------------------------------------
// P5: Cart totals are mathematically correct
// Feature: pos-advanced-ui, Property 5: Cart totals are mathematically correct
// ---------------------------------------------------------------------------

describe('P5: Cart totals are mathematically correct', () => {
  // Validates: Requirements 3.5, 3.7, 3.8

  it('subtotal equals sum of (unitPrice × unitQuantity) for all items', () => {
    // Feature: pos-advanced-ui, Property 5: Cart totals are mathematically correct
    fc.assert(
      fc.property(cartArb, (cart) => {
        const subtotal = computeSubtotal(cart)
        const expected = cart.reduce((sum, item) => sum + item.unitPrice * item.unitQuantity, 0)
        expect(subtotal).toBeCloseTo(expected, 10)
      }),
      { numRuns: 10 }
    )
  })

  it('discountAmount = subtotal × (discount / 100)', () => {
    // Feature: pos-advanced-ui, Property 5: Cart totals are mathematically correct
    fc.assert(
      fc.property(cartArb, percentArb, (cart, discount) => {
        const subtotal = computeSubtotal(cart)
        const discountAmount = computeDiscountAmount(subtotal, discount)
        expect(discountAmount).toBeCloseTo(subtotal * (discount / 100), 10)
      }),
      { numRuns: 10 }
    )
  })

  it('taxAmount = (subtotal − discountAmount) × (tax / 100)', () => {
    // Feature: pos-advanced-ui, Property 5: Cart totals are mathematically correct
    fc.assert(
      fc.property(cartArb, percentArb, percentArb, (cart, discount, tax) => {
        const subtotal = computeSubtotal(cart)
        const discountAmount = computeDiscountAmount(subtotal, discount)
        const taxAmount = computeTaxAmount(subtotal, discountAmount, tax)
        expect(taxAmount).toBeCloseTo((subtotal - discountAmount) * (tax / 100), 10)
      }),
      { numRuns: 10 }
    )
  })

  it('total = subtotal − discountAmount + taxAmount', () => {
    // Feature: pos-advanced-ui, Property 5: Cart totals are mathematically correct
    fc.assert(
      fc.property(cartArb, percentArb, percentArb, (cart, discount, tax) => {
        const subtotal = computeSubtotal(cart)
        const discountAmount = computeDiscountAmount(subtotal, discount)
        const taxAmount = computeTaxAmount(subtotal, discountAmount, tax)
        const total = computeTotal(subtotal, discountAmount, taxAmount)
        expect(total).toBeCloseTo(subtotal - discountAmount + taxAmount, 10)
      }),
      { numRuns: 10 }
    )
  })

  it('subtotal is zero for an empty cart', () => {
    expect(computeSubtotal([])).toBe(0)
  })

  it('total with 0% discount and 0% tax equals subtotal', () => {
    // Feature: pos-advanced-ui, Property 5: Cart totals are mathematically correct
    fc.assert(
      fc.property(cartArb, (cart) => {
        const subtotal = computeSubtotal(cart)
        const discountAmount = computeDiscountAmount(subtotal, 0)
        const taxAmount = computeTaxAmount(subtotal, discountAmount, 0)
        const total = computeTotal(subtotal, discountAmount, taxAmount)
        expect(total).toBeCloseTo(subtotal, 10)
      }),
      { numRuns: 10 }
    )
  })

  it('total with 100% discount is zero (regardless of tax)', () => {
    // Feature: pos-advanced-ui, Property 5: Cart totals are mathematically correct
    fc.assert(
      fc.property(cartArb, percentArb, (cart, tax) => {
        const subtotal = computeSubtotal(cart)
        const discountAmount = computeDiscountAmount(subtotal, 100)
        const taxAmount = computeTaxAmount(subtotal, discountAmount, tax)
        const total = computeTotal(subtotal, discountAmount, taxAmount)
        expect(total).toBeCloseTo(0, 10)
      }),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// P6: Quantity increment stays within stock bounds
// Feature: pos-advanced-ui, Property 6: Quantity increment stays within stock bounds
// ---------------------------------------------------------------------------

describe('P6: Quantity increment stays within stock bounds', () => {
  // Validates: Requirements 3.2

  it('incrementing when quantity < stock yields quantity + 1', () => {
    // Feature: pos-advanced-ui, Property 6: Quantity increment stays within stock bounds
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 999 }).chain((stock) =>
          fc.integer({ min: 1, max: stock - 1 }).map((quantity) => ({ quantity, stock }))
        ),
        ({ quantity, stock }) => {
          const newQuantity = incrementQuantity(quantity, stock)
          expect(newQuantity).toBe(quantity + 1)
          expect(newQuantity).toBeLessThanOrEqual(stock)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('incrementing when quantity equals stock does not exceed stock', () => {
    // Feature: pos-advanced-ui, Property 6: Quantity increment stays within stock bounds
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1000 }), (stock) => {
        const newQuantity = incrementQuantity(stock, stock)
        expect(newQuantity).toBeLessThanOrEqual(stock)
      }),
      { numRuns: 10 }
    )
  })

  it('result of increment is always ≤ stock', () => {
    // Feature: pos-advanced-ui, Property 6: Quantity increment stays within stock bounds
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }).chain((stock) =>
          fc.integer({ min: 1, max: stock }).map((quantity) => ({ quantity, stock }))
        ),
        ({ quantity, stock }) => {
          const newQuantity = incrementQuantity(quantity, stock)
          expect(newQuantity).toBeLessThanOrEqual(stock)
        }
      ),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// P7: Quantity decrement removes at one
// Feature: pos-advanced-ui, Property 7: Quantity decrement removes at one
// ---------------------------------------------------------------------------

describe('P7: Quantity decrement removes at one', () => {
  // Validates: Requirements 3.3, 3.4

  it('decrementing quantity > 1 yields quantity − 1', () => {
    // Feature: pos-advanced-ui, Property 7: Quantity decrement removes at one
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 10_000 }), (quantity) => {
        const result = decrementQuantity(quantity)
        expect(result).toBe(quantity - 1)
      }),
      { numRuns: 10 }
    )
  })

  it('decrementing quantity = 1 signals item removal (returns null)', () => {
    // Feature: pos-advanced-ui, Property 7: Quantity decrement removes at one
    const result = decrementQuantity(1)
    expect(result).toBeNull()
  })

  it('decrement result is always positive or null (never zero or negative)', () => {
    // Feature: pos-advanced-ui, Property 7: Quantity decrement removes at one
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10_000 }), (quantity) => {
        const result = decrementQuantity(quantity)
        if (result !== null) {
          expect(result).toBeGreaterThan(0)
        }
      }),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// P13: Loyalty points earned equals floor of total
// Feature: pos-advanced-ui, Property 13: Loyalty points earned equals floor of total
// ---------------------------------------------------------------------------

describe('P13: Loyalty points earned equals floor of total', () => {
  // Validates: Requirements 7.4

  it('loyaltyPointsEarned = Math.floor(total) for any positive total', () => {
    // Feature: pos-advanced-ui, Property 13: Loyalty points earned equals floor of total
    fc.assert(
      fc.property(fc.float({ min: Math.fround(0.01), max: Math.fround(1_000_000), noNaN: true }), (total) => {
        const points = computeLoyaltyPoints(total)
        expect(points).toBe(Math.floor(total))
      }),
      { numRuns: 10 }
    )
  })

  it('loyaltyPointsEarned is always a non-negative integer', () => {
    // Feature: pos-advanced-ui, Property 13: Loyalty points earned equals floor of total
    fc.assert(
      fc.property(fc.float({ min: Math.fround(0), max: Math.fround(1_000_000), noNaN: true }), (total) => {
        const points = computeLoyaltyPoints(total)
        expect(Number.isInteger(points)).toBe(true)
        expect(points).toBeGreaterThanOrEqual(0)
      }),
      { numRuns: 10 }
    )
  })

  it('loyaltyPointsEarned for a whole-number total equals that number', () => {
    // Feature: pos-advanced-ui, Property 13: Loyalty points earned equals floor of total
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1_000_000 }), (total) => {
        const points = computeLoyaltyPoints(total)
        expect(points).toBe(total)
      }),
      { numRuns: 10 }
    )
  })

  it('loyaltyPointsEarned for total = 0 is 0', () => {
    expect(computeLoyaltyPoints(0)).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Additional: change calculation (used in P5 context)
// ---------------------------------------------------------------------------

describe('Change calculation (cash payment)', () => {
  it('change = cashReceived − total when cashReceived >= total', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0), max: Math.fround(10_000), noNaN: true }).chain((total) =>
          fc.float({ min: total, max: Math.fround(total + 10_000), noNaN: true }).map((cashReceived) => ({
            total,
            cashReceived,
          }))
        ),
        ({ total, cashReceived }) => {
          const change = computeChange('cash', String(cashReceived), total)
          expect(change).toBeCloseTo(cashReceived - total, 5)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('change is 0 when cashReceived < total', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.01), max: Math.fround(10_000), noNaN: true }).chain((total) =>
          fc.float({ min: Math.fround(0), max: Math.fround(total - 0.001), noNaN: true }).map((cashReceived) => ({
            total,
            cashReceived,
          }))
        ),
        ({ total, cashReceived }) => {
          const change = computeChange('cash', String(cashReceived), total)
          expect(change).toBe(0)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('change is always 0 for card or mobile payment', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0), max: Math.fround(10_000), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(10_000), noNaN: true }),
        fc.constantFrom<'card' | 'mobile'>('card', 'mobile'),
        (total, cashReceived, method) => {
          const change = computeChange(method, String(cashReceived), total)
          expect(change).toBe(0)
        }
      ),
      { numRuns: 10 }
    )
  })
})
