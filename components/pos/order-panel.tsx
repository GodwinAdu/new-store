'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { CustomerSearchPopover } from '@/components/pos/customer-search-popover'
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  X,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Customer {
  id: string
  _id?: string
  name: string
  email?: string
  phone?: string
  loyaltyPoints?: number
  totalSpent?: number
}

export interface CartItem {
  id: string
  name: string
  price: number
  category: string
  stock: number
  quantity: number
  selectedUnit?: {
    _id?: string
    name?: string
    sellingPrice?: number
    conversionFactor?: number
  }
  unitPrice: number
  unitQuantity: number
}

export interface OrderPanelProps {
  cart: CartItem[]
  selectedCustomer: Customer | null
  discount: number
  tax: number
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
  onUpdateQuantity: (index: number, quantity: number) => void
  onRemoveItem: (index: number) => void
  onClearCart: () => void
  onSetDiscount: (value: number) => void
  onSetTax: (value: number) => void
  onSelectCustomer: (customer: Customer | null) => void
  onCharge: () => void
  customers: Customer[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return value.toFixed(2)
}

// ---------------------------------------------------------------------------
// OrderPanel
// ---------------------------------------------------------------------------

export function OrderPanel({
  cart,
  selectedCustomer,
  discount,
  tax,
  subtotal,
  discountAmount,
  taxAmount,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSetDiscount,
  onSetTax,
  onSelectCustomer,
  onCharge,
  customers,
}: OrderPanelProps) {
  const [confirmingClear, setConfirmingClear] = useState(false)

  const isEmpty = cart.length === 0

  function handleClearCart() {
    if (confirmingClear) {
      onClearCart()
      setConfirmingClear(false)
    } else {
      setConfirmingClear(true)
    }
  }

  function handleIncrement(index: number, item: CartItem) {
    if (item.quantity < item.stock) {
      onUpdateQuantity(index, item.quantity + 1)
    }
  }

  function handleDecrement(index: number, item: CartItem) {
    if (item.quantity <= 1) {
      // Remove item when decrementing at quantity = 1
      onUpdateQuantity(index, 0)
    } else {
      onUpdateQuantity(index, item.quantity - 1)
    }
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <span className="font-semibold">Order</span>
          {!isEmpty && (
            <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
              {cart.length}
            </span>
          )}
        </div>

        {/* Customer section */}
        <CustomerSearchPopover
          customers={customers}
          selectedCustomer={selectedCustomer}
          onSelect={onSelectCustomer}
          onCreateNew={() => {
            // Parent handles new customer creation
          }}
        />
      </div>

      {/* Customer loyalty info */}
      {selectedCustomer && (
        <div className="px-4 py-2 bg-primary/5 border-b text-xs text-muted-foreground flex items-center gap-1">
          <span className="font-medium text-foreground">{selectedCustomer.name}</span>
          {selectedCustomer.loyaltyPoints != null && (
            <span>· {selectedCustomer.loyaltyPoints} loyalty pts</span>
          )}
        </div>
      )}

      {/* Cart items */}
      {isEmpty ? (
        <div
          className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12 px-4"
          data-testid="empty-cart"
        >
          <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
          <div>
            <p className="font-medium text-muted-foreground">Cart is empty</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Add products from the grid to get started
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 px-4 py-2">
          <div className="space-y-2" data-testid="cart-items">
            {cart.map((item, index) => (
              <div
                key={`${item.id}-${item.selectedUnit?._id ?? 'base'}-${index}`}
                className="flex items-start gap-2 py-2 border-b last:border-0"
                data-testid="cart-item"
              >
                {/* Item info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">{item.name}</p>
                  {item.selectedUnit?.name && (
                    <p className="text-xs text-muted-foreground">{item.selectedUnit.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ${formatCurrency(item.unitPrice)} each
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDecrement(index, item)}
                    aria-label="Decrease quantity"
                    data-testid="decrement-btn"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span
                    className="w-7 text-center text-sm font-medium tabular-nums"
                    data-testid="item-quantity"
                  >
                    {item.quantity}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleIncrement(index, item)}
                    disabled={item.quantity >= item.stock}
                    aria-label="Increase quantity"
                    data-testid="increment-btn"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Line total */}
                <div className="text-right min-w-[60px]">
                  <p className="text-sm font-semibold" data-testid="line-total">
                    ${formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                </div>

                {/* Remove button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveItem(index)}
                  aria-label={`Remove ${item.name}`}
                  data-testid="remove-item-btn"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Discount & Tax inputs */}
      {!isEmpty && (
        <div className="px-4 py-3 border-t space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="discount-input" className="text-xs text-muted-foreground">
                Discount %
              </Label>
              <Input
                id="discount-input"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={discount}
                onChange={(e) => onSetDiscount(parseFloat(e.target.value) || 0)}
                className="h-8 text-sm mt-1"
                data-testid="discount-input"
              />
            </div>
            <div>
              <Label htmlFor="tax-input" className="text-xs text-muted-foreground">
                Tax %
              </Label>
              <Input
                id="tax-input"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={tax}
                onChange={(e) => onSetTax(parseFloat(e.target.value) || 0)}
                className="h-8 text-sm mt-1"
                data-testid="tax-input"
              />
            </div>
          </div>
        </div>
      )}

      {/* Totals */}
      {!isEmpty && (
        <div className="px-4 py-3 border-t space-y-1.5 text-sm" data-testid="order-totals">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span data-testid="subtotal">${formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Discount ({discount}%)</span>
              <span className="text-green-600" data-testid="discount-amount">
                -${formatCurrency(discountAmount)}
              </span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Tax ({tax}%)</span>
              <span data-testid="tax-amount">${formatCurrency(taxAmount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span data-testid="order-total">${formatCurrency(total)}</span>
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="px-4 py-3 border-t flex gap-2">
        {!isEmpty && (
          <Button
            type="button"
            variant={confirmingClear ? 'destructive' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={handleClearCart}
            data-testid="clear-cart-btn"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {confirmingClear ? 'Confirm Clear' : 'Clear Cart'}
          </Button>
        )}

        <Button
          type="button"
          className={cn('flex-1', isEmpty && 'w-full')}
          disabled={isEmpty}
          onClick={onCharge}
          data-testid="charge-btn"
        >
          <CreditCard className="h-4 w-4 mr-1" />
          Charge {!isEmpty && `$${formatCurrency(total)}`}
        </Button>
      </div>
    </div>
  )
}
