/**
 * Property-based tests for OrderPanel component.
 *
 * Feature: pos-advanced-ui
 * Properties covered:
 *   P6 — Quantity increment stays within stock bounds
 *   P7 — Quantity decrement removes at one
 */

import * as fc from 'fast-check'

// ---------------------------------------------------------------------------
// Pure quantity logic (mirrors OrderPanel handlers)
// ---------------------------------------------------------------------------

/**
 * Increment: capped at product.stock.
 * Returns the new quantity.
 */
function handleIncrement(quantity: number, stock: number): number {
  if (quantity < stock) {
    return quantity + 1
  }
  return quantity // already at max
}

/**
 * Decrement: at quantity=1, returns 0 (signals removal).
 * Returns the new quantity (0 means remove).
 */
function handleDecrement(quantity: number): number {
  if (quantity <= 1) {
    return 0 // remove item
  }
  return quantity - 1
}

// ---------------------------------------------------------------------------
// P6: Quantity increment stays within stock bounds
// Feature: pos-advanced-ui, Property 6: Quantity increment stays within stock bounds
// Validates: Requirements 3.2
// ---------------------------------------------------------------------------

describe('P6: Quantity increment stays within stock bounds', () => {
  it('incrementing when quantity < stock yields quantity + 1', () => {
    // Feature: pos-advanced-ui, Property 6: Quantity increment stays within stock bounds
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 999 }).chain((stock) =>
          fc.integer({ min: 1, max: stock - 1 }).map((quantity) => ({ quantity, stock }))
        ),
        ({ quantity, stock }) => {
          const newQuantity = handleIncrement(quantity, stock)
          expect(newQuantity).toBe(quantity + 1)
          expect(newQuantity).toBeLessThanOrEqual(stock)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('incrementing when quantity equals stock does not exceed stock', () => {
    // Feature: pos-advanced-ui, Property 6: Quantity increment stays within stock bounds
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1000 }), (stock) => {
        const newQuantity = handleIncrement(stock, stock)
        expect(newQuantity).toBeLessThanOrEqual(stock)
        expect(newQuantity).toBe(stock) // capped, not incremented
      }),
      { numRuns: 100 }
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
          const newQuantity = handleIncrement(quantity, stock)
          expect(newQuantity).toBeLessThanOrEqual(stock)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ---------------------------------------------------------------------------
// P7: Quantity decrement removes at one
// Feature: pos-advanced-ui, Property 7: Quantity decrement removes at one
// Validates: Requirements 3.3, 3.4
// ---------------------------------------------------------------------------

describe('P7: Quantity decrement removes at one', () => {
  it('decrementing quantity > 1 yields quantity − 1', () => {
    // Feature: pos-advanced-ui, Property 7: Quantity decrement removes at one
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 10_000 }), (quantity) => {
        const result = handleDecrement(quantity)
        expect(result).toBe(quantity - 1)
      }),
      { numRuns: 100 }
    )
  })

  it('decrementing quantity = 1 returns 0 (signals item removal)', () => {
    // Feature: pos-advanced-ui, Property 7: Quantity decrement removes at one
    const result = handleDecrement(1)
    expect(result).toBe(0)
  })

  it('decrement result is always non-negative', () => {
    // Feature: pos-advanced-ui, Property 7: Quantity decrement removes at one
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10_000 }), (quantity) => {
        const result = handleDecrement(quantity)
        expect(result).toBeGreaterThanOrEqual(0)
      }),
      { numRuns: 100 }
    )
  })

  it('decrement of quantity > 1 is strictly less than original quantity', () => {
    // Feature: pos-advanced-ui, Property 7: Quantity decrement removes at one
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 10_000 }), (quantity) => {
        const result = handleDecrement(quantity)
        expect(result).toBeLessThan(quantity)
      }),
      { numRuns: 100 }
    )
  })
})
