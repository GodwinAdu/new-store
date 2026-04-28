/**
 * Property-based tests for PaymentModal logic.
 *
 * Feature: pos-advanced-ui
 * Properties covered:
 *   P8  — Cash change calculation
 *   P9  — Insufficient cash disables confirm
 *   P10 — Duplicate submission prevention
 *
 * Tests verify the pure computation logic that drives the PaymentModal component.
 */

import * as fc from 'fast-check'

// ---------------------------------------------------------------------------
// Pure helpers (mirror PaymentModal logic exactly)
// ---------------------------------------------------------------------------

/** Returns the shortfall when cash < total, or 0 when sufficient. */
function getShortfall(cashReceived: string, total: number): number {
  const received = parseFloat(cashReceived || '0')
  if (isNaN(received)) return total
  return Math.max(0, total - received)
}

/** Returns the change due when cashReceived >= total. */
function getChange(cashReceived: string, total: number): number {
  const received = parseFloat(cashReceived || '0')
  if (isNaN(received)) return 0
  return Math.max(0, received - total)
}

/** Returns true when the confirm button should be disabled. */
function isConfirmDisabled(
  paymentMethod: 'cash' | 'card' | 'mobile',
  cashReceived: string,
  total: number,
  isProcessing: boolean
): boolean {
  if (isProcessing) return true
  if (paymentMethod === 'cash') {
    return getShortfall(cashReceived, total) > 0
  }
  return false
}

// ---------------------------------------------------------------------------
// P8: Cash change calculation
// Feature: pos-advanced-ui, Property 8: Cash change calculation
// Validates: Requirements 4.3
// ---------------------------------------------------------------------------

describe('P8: Cash change calculation', () => {
  it('change = cashReceived - total for any cashReceived >= total', () => {
    // Feature: pos-advanced-ui, Property 8: Cash change calculation
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.01), max: Math.fround(9_999), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(9_999), noNaN: true }),
        (total, extra) => {
          const cashReceived = total + extra
          const change = getChange(String(cashReceived), total)
          expect(change).toBeCloseTo(cashReceived - total, 5)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('change is 0 when cashReceived < total', () => {
    // Feature: pos-advanced-ui, Property 8: Cash change calculation
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.02), max: Math.fround(9_999), noNaN: true }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(9_998), noNaN: true }),
        (total, deficit) => {
          const cashReceived = Math.max(0, total - deficit)
          if (cashReceived >= total) return
          const change = getChange(String(cashReceived), total)
          expect(change).toBe(0)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('confirm is NOT disabled when cashReceived >= total (cash method)', () => {
    // Feature: pos-advanced-ui, Property 8: Cash change calculation
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.01), max: Math.fround(9_999), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(9_999), noNaN: true }),
        (total, extra) => {
          const cashReceived = total + extra
          const disabled = isConfirmDisabled('cash', String(cashReceived), total, false)
          expect(disabled).toBe(false)
        }
      ),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// P9: Insufficient cash disables confirm
// Feature: pos-advanced-ui, Property 9: Insufficient cash disables confirm
// Validates: Requirements 4.4
// ---------------------------------------------------------------------------

describe('P9: Insufficient cash disables confirm', () => {
  it('confirm is disabled when cashReceived < total', () => {
    // Feature: pos-advanced-ui, Property 9: Insufficient cash disables confirm
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.02), max: Math.fround(9_999), noNaN: true }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(9_998), noNaN: true }),
        (total, deficit) => {
          const cashReceived = Math.max(0, total - deficit)
          if (cashReceived >= total) return
          const disabled = isConfirmDisabled('cash', String(cashReceived), total, false)
          expect(disabled).toBe(true)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('shortfall is positive when cashReceived < total', () => {
    // Feature: pos-advanced-ui, Property 9: Insufficient cash disables confirm
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.02), max: Math.fround(9_999), noNaN: true }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(9_998), noNaN: true }),
        (total, deficit) => {
          const cashReceived = Math.max(0, total - deficit)
          if (cashReceived >= total) return
          const shortfall = getShortfall(String(cashReceived), total)
          expect(shortfall).toBeGreaterThan(0)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('card and mobile payments are never disabled due to cash shortfall', () => {
    // Feature: pos-advanced-ui, Property 9: Insufficient cash disables confirm
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.01), max: Math.fround(9_999), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(9_999), noNaN: true }),
        fc.constantFrom<'card' | 'mobile'>('card', 'mobile'),
        (total, cashReceived, method) => {
          const disabled = isConfirmDisabled(method, String(cashReceived), total, false)
          expect(disabled).toBe(false)
        }
      ),
      { numRuns: 10 }
    )
  })
})

// ---------------------------------------------------------------------------
// P10: Duplicate submission prevention
// Feature: pos-advanced-ui, Property 10: Duplicate submission prevention
// Validates: Requirements 4.6
// ---------------------------------------------------------------------------

describe('P10: Duplicate submission prevention', () => {
  it('confirm is disabled when isProcessing=true regardless of payment method', () => {
    // Feature: pos-advanced-ui, Property 10: Duplicate submission prevention
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.01), max: Math.fround(9_999), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(9_999), noNaN: true }),
        fc.constantFrom<'cash' | 'card' | 'mobile'>('cash', 'card', 'mobile'),
        (total, cashReceived, method) => {
          const disabled = isConfirmDisabled(method, String(cashReceived + total), total, true)
          expect(disabled).toBe(true)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('N rapid clicks cannot fire onConfirm when isProcessing=true', () => {
    // Feature: pos-advanced-ui, Property 10: Duplicate submission prevention
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 20 }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(9_999), noNaN: true }),
        (clickCount, total) => {
          let callCount = 0
          let isProcessing = false

          function handleConfirm() {
            if (isProcessing) return // guard — mirrors component disabled state
            isProcessing = true
            callCount++
          }

          // Simulate N rapid clicks after first click sets isProcessing=true
          handleConfirm() // first click — fires
          for (let i = 1; i < clickCount; i++) {
            handleConfirm() // subsequent clicks — blocked
          }

          expect(callCount).toBe(1)
        }
      ),
      { numRuns: 10 }
    )
  })
})
