'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, Plus, PackageX } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Unit {
  _id?: string
  name?: string
  sellingPrice?: number
  conversionFactor?: number
}

export interface Product {
  id: string
  _id?: string
  name: string
  price: number
  category: string
  stock: number
  minStock?: number
  barcode?: string
  sku?: string
  units?: Unit[]
}

export interface ProductGridProps {
  products: Product[]
  loading: boolean
  onAddProduct: (product: Product, unit?: Unit) => void
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  categories: string[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStockBadgeVariant(stock: number, minStock?: number): 'default' | 'secondary' | 'destructive' {
  if (stock === 0) return 'destructive'
  const threshold = minStock ?? 10
  if (stock <= threshold) return 'secondary'
  return 'default'
}

function getStockBadgeClass(stock: number, minStock?: number): string {
  if (stock === 0) return 'bg-red-100 text-red-700 border-red-200'
  const threshold = minStock ?? 10
  if (stock <= threshold) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  return 'bg-green-100 text-green-700 border-green-200'
}

function formatCurrency(value: number): string {
  return value.toFixed(2)
}

// ---------------------------------------------------------------------------
// UnitSelectionDialog
// ---------------------------------------------------------------------------

interface UnitSelectionDialogProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onSelect: (unit: Unit) => void
}

function UnitSelectionDialog({ product, isOpen, onClose, onSelect }: UnitSelectionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Select Unit — {product.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          {/* Base unit */}
          <button
            type="button"
            className="w-full flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors text-left"
            onClick={() => {
              onSelect({})
              onClose()
            }}
          >
            <span className="font-medium">Base Unit</span>
            <span className="text-muted-foreground">${formatCurrency(product.price)}</span>
          </button>

          {/* Additional units */}
          {product.units?.map((unit, idx) => (
            <button
              key={unit._id ?? idx}
              type="button"
              className="w-full flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors text-left"
              onClick={() => {
                onSelect(unit)
                onClose()
              }}
            >
              <span className="font-medium">{unit.name ?? `Unit ${idx + 1}`}</span>
              <span className="text-muted-foreground">
                ${formatCurrency(unit.sellingPrice ?? product.price)}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// ProductCard
// ---------------------------------------------------------------------------

interface ProductCardProps {
  product: Product
  onAdd: (product: Product) => void
}

function ProductCard({ product, onAdd }: ProductCardProps) {
  const isOutOfStock = product.stock === 0
  const badgeClass = getStockBadgeClass(product.stock, product.minStock)

  return (
    <div
      data-testid="product-card"
      data-product-id={product.id}
      data-out-of-stock={isOutOfStock}
      className={cn(
        'rounded-xl border bg-card p-4 flex flex-col gap-3 shadow-sm transition-all hover:shadow-md',
        isOutOfStock && 'opacity-50 pointer-events-none'
      )}
    >
      {/* Name */}
      <div className="flex-1">
        <p className="font-semibold text-sm leading-tight line-clamp-2">{product.name}</p>
        {product.sku && (
          <p className="text-xs text-muted-foreground mt-0.5">SKU: {product.sku}</p>
        )}
      </div>

      {/* Price + stock badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-base font-bold">${formatCurrency(product.price)}</span>
        <span
          className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', badgeClass)}
          data-testid="stock-badge"
        >
          {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
        </span>
      </div>

      {/* Add button */}
      <Button
        size="sm"
        className="w-full"
        disabled={isOutOfStock}
        onClick={() => onAdd(product)}
        data-testid="add-product-btn"
        aria-label={`Add ${product.name} to cart`}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ProductGrid
// ---------------------------------------------------------------------------

export function ProductGrid({
  products,
  loading,
  onAddProduct,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: ProductGridProps) {
  // Debounced search value (300ms) — used for filtering
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Unit selection dialog state
  const [unitDialogProduct, setUnitDialogProduct] = useState<Product | null>(null)

  // Filter products using debounced search + selected category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      debouncedSearch === '' ||
      product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (product.sku ?? '').toLowerCase().includes(debouncedSearch.toLowerCase())

    const matchesCategory =
      selectedCategory === '' ||
      selectedCategory === 'All' ||
      product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleAddProduct = useCallback(
    (product: Product) => {
      const hasUnits = product.units && product.units.length > 0
      if (hasUnits) {
        setUnitDialogProduct(product)
      } else {
        onAddProduct(product)
      }
    },
    [onAddProduct]
  )

  const handleUnitSelect = useCallback(
    (unit: Unit) => {
      if (unitDialogProduct) {
        onAddProduct(unitDialogProduct, unit)
      }
    },
    [unitDialogProduct, onAddProduct]
  )

  const handleClearFilters = () => {
    onSearchChange('')
    onCategoryChange('All')
  }

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          id="product-search"
          type="text"
          placeholder="Search by name or SKU…"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          data-product-search
          aria-label="Search products"
        />
      </div>

      {/* Category filter row */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Category filter">
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => onCategoryChange(cat)}
              data-testid={`category-btn-${cat}`}
            >
              {cat}
            </Button>
          ))}
        </div>
      )}

      {/* Product grid */}
      {loading ? (
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-muted/30 h-40 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty state */
        <div
          className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-12"
          data-testid="empty-state"
        >
          <PackageX className="h-12 w-12 text-muted-foreground/50" />
          <div>
            <p className="font-medium text-muted-foreground">No products found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Try adjusting your search or category filter
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div
          className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto"
          data-testid="product-grid"
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={handleAddProduct}
            />
          ))}
        </div>
      )}

      {/* Unit selection dialog */}
      {unitDialogProduct && (
        <UnitSelectionDialog
          product={unitDialogProduct}
          isOpen={true}
          onClose={() => setUnitDialogProduct(null)}
          onSelect={handleUnitSelect}
        />
      )}
    </div>
  )
}
