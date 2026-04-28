/**
 * Property-based tests for CustomerSearchPopover component.
 *
 * Feature: pos-advanced-ui
 * Properties covered:
 *   P14 — Customer search filter correctness
 */

import * as fc from 'fast-check'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  loyaltyPoints?: number
}

// ---------------------------------------------------------------------------
// Pure filter logic (mirrors CustomerSearchPopover filtering)
// ---------------------------------------------------------------------------

function filterCustomers(customers: Customer[], searchTerm: string): Customer[] {
  if (searchTerm.length < 2) return []
  const q = searchTerm.toLowerCase()
  return customers.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      (c.phone ?? '').toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q)
  )
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

// Use a simple email-like string instead of fc.emailAddress() which is very slow in fast-check v4
const simpleEmailArb = fc
  .tuple(
    fc.string({ minLength: 1, maxLength: 10 }),
    fc.string({ minLength: 1, maxLength: 10 })
  )
  .map(([user, domain]) => `${user}@${domain}.com`)

const customerArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  email: fc.option(simpleEmailArb, { nil: undefined }),
  phone: fc.option(
    fc.integer({ min: 1000000, max: 9999999999999999 }).map((n) => String(n)),
    { nil: undefined }
  ),
  loyaltyPoints: fc.option(fc.integer({ min: 0, max: 10_000 }), { nil: undefined }),
})

const customersArb = fc.array(customerArb, { minLength: 0, maxLength: 30 })

// ---------------------------------------------------------------------------
// P14: Customer search filter correctness
// Feature: pos-advanced-ui, Property 14: Customer search filter correctness
// Validates: Requirements 7.2
// ---------------------------------------------------------------------------

describe('P14: Customer search filter correctness', () => {
  it('every displayed customer contains the search string in name, phone, or email', () => {
    // Feature: pos-advanced-ui, Property 14: Customer search filter correctness
    fc.assert(
      fc.property(
        customersArb,
        fc.string({ minLength: 2, maxLength: 20 }),
        (customers, searchTerm) => {
          const visible = filterCustomers(customers, searchTerm)

          for (const customer of visible) {
            const q = searchTerm.toLowerCase()
            const nameMatch = customer.name.toLowerCase().includes(q)
            const phoneMatch = (customer.phone ?? '').toLowerCase().includes(q)
            const emailMatch = (customer.email ?? '').toLowerCase().includes(q)
            expect(nameMatch || phoneMatch || emailMatch).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('returns empty list when search term is less than 2 characters', () => {
    // Feature: pos-advanced-ui, Property 14: Customer search filter correctness
    fc.assert(
      fc.property(
        customersArb,
        fc.string({ minLength: 0, maxLength: 1 }),
        (customers, shortTerm) => {
          const visible = filterCustomers(customers, shortTerm)
          expect(visible.length).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('search is case-insensitive', () => {
    // Feature: pos-advanced-ui, Property 14: Customer search filter correctness
    const customers: Customer[] = [
      { id: '1', name: 'Alice Smith', email: 'alice@example.com', phone: '1234567890' },
      { id: '2', name: 'Bob Jones', email: 'bob@example.com', phone: '0987654321' },
    ]
    const upper = filterCustomers(customers, 'ALICE')
    const lower = filterCustomers(customers, 'alice')
    expect(upper.length).toBe(1)
    expect(lower.length).toBe(1)
    expect(upper[0].id).toBe('1')
    expect(lower[0].id).toBe('1')
  })

  it('matches by phone number', () => {
    // Feature: pos-advanced-ui, Property 14: Customer search filter correctness
    const customers: Customer[] = [
      { id: '1', name: 'Alice Smith', phone: '5551234567' },
      { id: '2', name: 'Bob Jones', phone: '5559876543' },
    ]
    const results = filterCustomers(customers, '555123')
    expect(results.length).toBe(1)
    expect(results[0].id).toBe('1')
  })

  it('matches by email', () => {
    // Feature: pos-advanced-ui, Property 14: Customer search filter correctness
    const customers: Customer[] = [
      { id: '1', name: 'Alice Smith', email: 'alice@example.com' },
      { id: '2', name: 'Bob Jones', email: 'bob@other.com' },
    ]
    const results = filterCustomers(customers, 'example')
    expect(results.length).toBe(1)
    expect(results[0].id).toBe('1')
  })
})
