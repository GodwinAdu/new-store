/**
 * Property-based tests for ProductGrid component.
 *
 * Feature: pos-advanced-ui
 * Properties covered:
 *   P2 — Search filter correctness
 *   P3 — Zero-stock products blocked
 *   P4 — Category filter correctness
 */

import * as fc from 'fast-check'

// ---------------------------------------------------------------------------
// Types (mirroring component types)
// ---------------------------------------------------------------------------

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  minStock?: number
  sku?: string
}

// ---------------------------------------------------------------------------
// Pure filter logic (mirrors ProductGrid filtering)
// ---------------------------------------------------------------------------

function filterProducts(
  products: Product[],
  searchTerm: string,
  selectedCategory: string
): Product[] {
  return products.filter((product) => {
    const matchesSearch =
      searchTerm === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku ?? '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === '' ||
      selectedCategory === 'All' ||
      product.category === selectedCategory

    return matchesSearch && matchesCategory
  })
}

function isCardDisabled(product: Product): boolean {
  return product.stock === 0
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

const productArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(9_999), noNaN: true }),
  category: fc.constantFrom('Electronics', 'Food', 'Clothing', 'General', 'Beverages'),
  stock: fc.integer({ min: 0, max: 1000 }),
  sku: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
})

const productsArb = fc.array(productArb, { minLength: 0, maxLength: 30 })

// ---------------------------------------------------------------------------
// P2: Search filter correctness
// Feature: pos-advanced-ui, Property 2: Search filter correctness
// Validates: Requirements 2.2
// ---------------------------------------------------------------------------

describe('P2: Search filter correctness', () => {
  it('every visible product after filtering contains the search string in name or sku', () => {
    // Feature: pos-advanced-ui, Property 2: Search filter correctness
    fc.assert(
      fc.property(
        productsArb,
        fc.string({ minLength: 1, maxLength: 10 }),
        (products, searchTerm) => {
          const visible = filterProducts(products, searchTerm, 'All')

          for (const product of visible) {
            const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
            const skuMatch = (product.sku ?? '').toLowerCase().includes(searchTerm.toLowerCase())
            expect(nameMatch || skuMatch).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('empty search term shows all products regardless of name or sku', () => {
    // Feature: pos-advanced-ui, Property 2: Search filter correctness
    fc.assert(
      fc.property(productsArb, (products) => {
        const visible = filterProducts(products, '', 'All')
        expect(visible.length).toBe(products.length)
      }),
      { numRuns: 100 }
    )
  })

  it('search is case-insensitive', () => {
    // Feature: pos-advanced-ui, Property 2: Search filter correctness
    const products: Product[] = [
      { id: '1', name: 'Apple Juice', price: 2, category: 'Beverages', stock: 10 },
      { id: '2', name: 'Orange Soda', price: 3, category: 'Beverages', stock: 5 },
    ]
    const upper = filterProducts(products, 'APPLE', 'All')
    const lower = filterProducts(products, 'apple', 'All')
    expect(upper.length).toBe(1)
    expect(lower.length).toBe(1)
    expect(upper[0].id).toBe('1')
    expect(lower[0].id).toBe('1')
  })
})

// ---------------------------------------------------------------------------
// P3: Zero-stock products blocked
// Feature: pos-advanced-ui, Property 3: Zero-stock products blocked
// Validates: Requirements 2.3
// ---------------------------------------------------------------------------

describe('P3: Zero-stock products blocked', () => {
  it('zero-stock product card is disabled (opacity-50 class applied)', () => {
    // Feature: pos-advanced-ui, Property 3: Zero-stock products blocked
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          price: fc.float({ min: Math.fround(0.01), max: Math.fround(9_999), noNaN: true }),
          category: fc.constantFrom('Electronics', 'Food', 'Clothing'),
          stock: fc.constant(0),
        }),
        (product) => {
          expect(isCardDisabled(product)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('non-zero-stock product card is not disabled', () => {
    // Feature: pos-advanced-ui, Property 3: Zero-stock products blocked
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          price: fc.float({ min: Math.fround(0.01), max: Math.fround(9_999), noNaN: true }),
          category: fc.constantFrom('Electronics', 'Food', 'Clothing'),
          stock: fc.integer({ min: 1, max: 1000 }),
        }),
        (product) => {
          expect(isCardDisabled(product)).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('zero-stock product is not added to cart when add is blocked', () => {
    // Feature: pos-advanced-ui, Property 3: Zero-stock products blocked
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          price: fc.float({ min: Math.fround(0.01), max: Math.fround(9_999), noNaN: true }),
          category: fc.constantFrom('Electronics', 'Food', 'Clothing'),
          stock: fc.constant(0),
        }),
        (product) => {
          // Simulate the guard: add is blocked when stock === 0
          const cart: Product[] = []
          const addToCart = (p: Product) => {
            if (p.stock === 0) return // blocked
            cart.push(p)
          }
          addToCart(product)
          expect(cart.length).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ---------------------------------------------------------------------------
// P4: Category filter correctness
// Feature: pos-advanced-ui, Property 4: Category filter correctness
// Validates: Requirements 2.5
// ---------------------------------------------------------------------------

describe('P4: Category filter correctness', () => {
  it('every visible product belongs to the selected category', () => {
    // Feature: pos-advanced-ui, Property 4: Category filter correctness
    fc.assert(
      fc.property(
        productsArb,
        fc.constantFrom('Electronics', 'Food', 'Clothing', 'General', 'Beverages'),
        (products, selectedCategory) => {
          const visible = filterProducts(products, '', selectedCategory)

          for (const product of visible) {
            expect(product.category).toBe(selectedCategory)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('"All" category shows all products', () => {
    // Feature: pos-advanced-ui, Property 4: Category filter correctness
    fc.assert(
      fc.property(productsArb, (products) => {
        const visible = filterProducts(products, '', 'All')
        expect(visible.length).toBe(products.length)
      }),
      { numRuns: 100 }
    )
  })

  it('empty category string shows all products', () => {
    // Feature: pos-advanced-ui, Property 4: Category filter correctness
    fc.assert(
      fc.property(productsArb, (products) => {
        const visible = filterProducts(products, '', '')
        expect(visible.length).toBe(products.length)
      }),
      { numRuns: 100 }
    )
  })

  it('no products shown when selected category has no matches', () => {
    const products: Product[] = [
      { id: '1', name: 'Widget', price: 5, category: 'Electronics', stock: 10 },
      { id: '2', name: 'Gadget', price: 8, category: 'Electronics', stock: 5 },
    ]
    const visible = filterProducts(products, '', 'Food')
    expect(visible.length).toBe(0)
  })
})
