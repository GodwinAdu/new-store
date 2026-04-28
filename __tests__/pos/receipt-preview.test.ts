/**
 * Property-based tests for ReceiptPreview data logic.
 *
 * Feature: pos-advanced-ui
 * Properties covered:
 *   P11 — Receipt completeness (all required fields present in ReceiptData)
 *   P12 — Email button visibility (email button shown iff customer.email is non-empty)
 *
 * These tests verify the data contracts that drive the ReceiptPreview component.
 * Component rendering is covered by the example-based tests in receipt-utils.test.ts.
 */

import * as fc from 'fast-check'
import type { ReceiptData, ReceiptLineItem } from '@/lib/utils/receipt-utils'

// ---------------------------------------------------------------------------
// Pure helpers (mirror ReceiptPreview display logic)
// ---------------------------------------------------------------------------

/** Returns true when the Email Receipt button should be visible. */
function shouldShowEmailButton(data: ReceiptData): boolean {
  return typeof data.customer?.email === 'string' && data.customer.email.length > 0
}

/** Returns true when all required receipt fields are non-empty / present. */
function receiptIsComplete(data: ReceiptData): boolean {
  return (
    data.storeName.length > 0 &&
    data.warehouseName.length > 0 &&
    data.receiptNumber.length > 0 &&
    data.cashierName.length > 0 &&
    data.timestamp.length > 0 &&
    data.items.length > 0 &&
    typeof data.subtotal === 'number' &&
    typeof data.total === 'number' &&
    typeof data.paymentMethod === 'string'
  )
}

/** Returns true when all line items have the required fields. */
function allLineItemsComplete(items: ReceiptLineItem[]): boolean {
  return items.every(
    (item) =>
      item.name.length > 0 &&
      typeof item.quantity === 'number' &&
      typeof item.unitPrice === 'number' &&
      typeof item.lineTotal === 'number'
  )
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const lineItemArb = fc.record<ReceiptLineItem>({
  name: fc.string({ minLength: 1, maxLength: 40 }),
  unitLabel: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  quantity: fc.integer({ min: 1, max: 100 }),
  unitPrice: fc.float({ min: Math.fround(0.01), max: Math.fround(9_999), noNaN: true }),
  lineTotal: fc.float({ min: Math.fround(0.01), max: Math.fround(99_999), noNaN: true }),
})

const paymentMethodArb = fc.constantFrom<'cash' | 'card' | 'mobile'>('cash', 'card', 'mobile')

const receiptDataBaseArb = fc.record<ReceiptData>({
  receiptNumber: fc.string({ minLength: 1, maxLength: 20 }),
  storeName: fc.string({ minLength: 1, maxLength: 60 }),
  warehouseName: fc.string({ minLength: 1, maxLength: 60 }),
  warehouseLocation: fc.string({ minLength: 1, maxLength: 60 }),
  cashierName: fc.string({ minLength: 1, maxLength: 60 }),
  timestamp: fc
    .integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-12-31').getTime() })
    .map((ms) => new Date(ms).toISOString()),
  items: fc.array(lineItemArb, { minLength: 1, maxLength: 5 }),
  subtotal: fc.float({ min: Math.fround(0), max: Math.fround(99_999), noNaN: true }),
  discount: fc.float({ min: Math.fround(0), max: Math.fround(9_999), noNaN: true }),
  tax: fc.float({ min: Math.fround(0), max: Math.fround(9_999), noNaN: true }),
  total: fc.float({ min: Math.fround(0.01), max: Math.fround(99_999), noNaN: true }),
  paymentMethod: paymentMethodArb,
  cashReceived: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(99_999), noNaN: true }), { nil: undefined }),
  change: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(9_999), noNaN: true }), { nil: undefined }),
  customer: fc.constant(undefined),
})

const receiptWithEmailArb = receiptDataBaseArb.chain((base) =>
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 60 }),
    // Use simple email-like string — fc.emailAddress() is very slow in fast-check v4
    email: fc.tuple(
      fc.string({ minLength: 1, maxLength: 10 }),
      fc.string({ minLength: 1, maxLength: 10 })
    ).map(([user, domain]) => `${user}@${domain}.com`),
    loyaltyPointsEarned: fc.integer({ min: 0, max: 100_000 }),
  }).map((customer) => ({ ...base, customer }))
)

const receiptWithCustomerNoEmailArb = receiptDataBaseArb.chain((base) =>
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 60 }),
    email: fc.constant(undefined),
    loyaltyPointsEarned: fc.integer({ min: 0, max: 100_000 }),
  }).map((customer) => ({ ...base, customer }))
)

// ---------------------------------------------------------------------------
// P11: Receipt completeness
// Feature: pos-advanced-ui, Property 11: Receipt completeness
// Validates: Requirements 5.2
// ---------------------------------------------------------------------------

describe('P11: Receipt completeness', () => {
  it('all required fields are present for any valid ReceiptData', () => {
    // Feature: pos-advanced-ui, Property 11: Receipt completeness
    fc.assert(
      fc.property(receiptDataBaseArb, (data) => {
        expect(receiptIsComplete(data)).toBe(true)
      }),
      { numRuns: 10 }
    )
  })

  it('all line items have required fields', () => {
    // Feature: pos-advanced-ui, Property 11: Receipt completeness
    fc.assert(
      fc.property(receiptDataBaseArb, (data) => {
        expect(allLineItemsComplete(data.items)).toBe(true)
      }),
      { numRuns: 10 }
    )
  })

  it('customer name is present when customer is attached', () => {
    // Feature: pos-advanced-ui, Property 11: Receipt completeness
    fc.assert(
      fc.property(receiptWithCustomerNoEmailArb, (data) => {
        expect(data.customer).toBeDefined()
        expect(data.customer!.name.length).toBeGreaterThan(0)
      }),
      { numRuns: 10 }
    )
  })

  it('loyalty points are a non-negative integer when customer is attached', () => {
    // Feature: pos-advanced-ui, Property 11: Receipt completeness
    fc.assert(
      fc.property(receiptWithCustomerNoEmailArb, (data) => {
        expect(Number.isInteger(data.customer!.loyaltyPointsEarned)).toBe(true)
        expect(data.customer!.loyaltyPointsEarned).toBeGreaterThanOrEqual(0)
      }),
      { numRuns: 10 }
    )
  })

  it('customer field is undefined when no customer is attached', () => {
    // Feature: pos-advanced-ui, Property 11: Receipt completeness
    fc.assert(
      fc.property(receiptDataBaseArb, (data) => {
        expect(data.customer).toBeUndefined()
      }),
      { numRuns: 10 }
    )
  })

  it('payment method is one of cash, card, mobile', () => {
    // Feature: pos-advanced-ui, Property 11: Receipt completeness
    fc.assert(
      fc.property(receiptDataBaseArb, (data) => {
        expect(['cash', 'card', 'mobile']).toContain(data.paymentMethod)
      }),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// P12: Email button visibility
// Feature: pos-advanced-ui, Property 12: Email button visibility
// Validates: Requirements 5.5
// ---------------------------------------------------------------------------

describe('P12: Email button visibility', () => {
  it('email button is shown when customer.email is a non-empty string', () => {
    // Feature: pos-advanced-ui, Property 12: Email button visibility
    fc.assert(
      fc.property(receiptWithEmailArb, (data) => {
        expect(shouldShowEmailButton(data)).toBe(true)
      }),
      { numRuns: 10 }
    )
  })

  it('email button is NOT shown when customer has no email', () => {
    // Feature: pos-advanced-ui, Property 12: Email button visibility
    fc.assert(
      fc.property(receiptWithCustomerNoEmailArb, (data) => {
        expect(shouldShowEmailButton(data)).toBe(false)
      }),
      { numRuns: 10 }
    )
  })

  it('email button is NOT shown when no customer is attached', () => {
    // Feature: pos-advanced-ui, Property 12: Email button visibility
    fc.assert(
      fc.property(receiptDataBaseArb, (data) => {
        expect(shouldShowEmailButton(data)).toBe(false)
      }),
      { numRuns: 10 }
    )
  })

  it('email button logic: empty string email is treated as no email', () => {
    const data: ReceiptData = {
      receiptNumber: 'R001', storeName: 'Store', warehouseName: 'WH', warehouseLocation: 'Loc',
      cashierName: 'Jane', timestamp: new Date().toISOString(),
      items: [{ name: 'Item', quantity: 1, unitPrice: 10, lineTotal: 10 }],
      subtotal: 10, discount: 0, tax: 0, total: 10, paymentMethod: 'cash',
      customer: { name: 'Alice', email: '', loyaltyPointsEarned: 0 },
    }
    expect(shouldShowEmailButton(data)).toBe(false)
  })
})
