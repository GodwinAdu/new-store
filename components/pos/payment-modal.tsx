'use client'

import { useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CreditCard, Banknote, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  total: number
  paymentMethod: 'cash' | 'card' | 'mobile'
  cashReceived: string
  change: number
  isProcessing: boolean
  error: string | null
  onPaymentMethodChange: (method: 'cash' | 'card' | 'mobile') => void
  onCashReceivedChange: (value: string) => void
  onConfirm: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return value.toFixed(2)
}

/** Returns the shortfall when cash < total, or 0 when sufficient. */
function getShortfall(cashReceived: string, total: number): number {
  const received = parseFloat(cashReceived || '0')
  if (isNaN(received)) return total
  return Math.max(0, total - received)
}

// ---------------------------------------------------------------------------
// Payment method button
// ---------------------------------------------------------------------------

interface MethodButtonProps {
  label: string
  icon: React.ReactNode
  value: 'cash' | 'card' | 'mobile'
  selected: boolean
  disabled: boolean
  onClick: () => void
}

function MethodButton({ label, icon, value, selected, disabled, onClick }: MethodButtonProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      data-testid={`payment-method-${value}`}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 p-4 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        selected
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// PaymentModal
// ---------------------------------------------------------------------------

/**
 * Controlled payment modal — all state lives in the parent.
 * This component only calls callbacks.
 *
 * Keyboard:
 *   - Tab  : cycles fields naturally (browser default)
 *   - Enter: confirms when the confirm button is not disabled
 *   - Escape: closes (handled natively by Radix Dialog)
 */
export function PaymentModal({
  isOpen,
  onClose,
  total,
  paymentMethod,
  cashReceived,
  change,
  isProcessing,
  error,
  onPaymentMethodChange,
  onCashReceivedChange,
  onConfirm,
}: PaymentModalProps) {
  const cashInputRef = useRef<HTMLInputElement>(null)

  // Focus the cash input when Cash is selected and modal is open
  useEffect(() => {
    if (isOpen && paymentMethod === 'cash') {
      // Small delay so the dialog animation completes first
      const id = setTimeout(() => cashInputRef.current?.focus(), 80)
      return () => clearTimeout(id)
    }
  }, [isOpen, paymentMethod])

  // Derived state
  const isCash = paymentMethod === 'cash'
  const shortfall = isCash ? getShortfall(cashReceived, total) : 0
  const isInsufficient = isCash && shortfall > 0
  const confirmDisabled = isProcessing || isInsufficient

  // Handle Enter key on the modal to trigger confirm
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' && !confirmDisabled) {
      e.preventDefault()
      onConfirm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="max-w-lg w-full"
        data-testid="payment-modal"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Payment
          </DialogTitle>
        </DialogHeader>

        {/* Grand total */}
        <div
          className="rounded-lg bg-muted/50 p-4 text-center"
          data-testid="payment-total"
        >
          <p className="text-sm text-muted-foreground mb-1">Total Due</p>
          <p className="text-4xl font-bold tracking-tight">
            ${formatCurrency(total)}
          </p>
        </div>

        {/* Payment method selector */}
        <div>
          <Label className="mb-2 block text-sm font-medium">
            Payment Method
          </Label>
          <div
            role="radiogroup"
            aria-label="Payment method"
            className="grid grid-cols-3 gap-3"
            data-testid="payment-method-group"
          >
            <MethodButton
              label="Cash"
              icon={<Banknote className="h-5 w-5" />}
              value="cash"
              selected={paymentMethod === 'cash'}
              disabled={isProcessing}
              onClick={() => onPaymentMethodChange('cash')}
            />
            <MethodButton
              label="Card"
              icon={<CreditCard className="h-5 w-5" />}
              value="card"
              selected={paymentMethod === 'card'}
              disabled={isProcessing}
              onClick={() => onPaymentMethodChange('card')}
            />
            <MethodButton
              label="Mobile Money"
              icon={<Smartphone className="h-5 w-5" />}
              value="mobile"
              selected={paymentMethod === 'mobile'}
              disabled={isProcessing}
              onClick={() => onPaymentMethodChange('mobile')}
            />
          </div>
        </div>

        {/* Cash-received input — only shown for Cash */}
        {isCash && (
          <div className="space-y-2" data-testid="cash-received-section">
            <Label htmlFor="cash-received">Cash Received</Label>
            <Input
              id="cash-received"
              ref={cashInputRef}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={cashReceived}
              onChange={(e) => onCashReceivedChange(e.target.value)}
              disabled={isProcessing}
              aria-invalid={isInsufficient}
              aria-describedby={isInsufficient ? 'cash-error' : undefined}
              data-testid="cash-received-input"
              className="text-lg"
            />

            {/* Insufficient cash error */}
            {isInsufficient && (
              <p
                id="cash-error"
                role="alert"
                className="text-sm text-destructive"
                data-testid="insufficient-cash-error"
              >
                Insufficient cash: need ${formatCurrency(shortfall)} more
              </p>
            )}

            {/* Change display — only when cash is sufficient */}
            {!isInsufficient && cashReceived !== '' && (
              <div
                className="flex items-center justify-between rounded-md bg-green-50 dark:bg-green-950/30 px-3 py-2 text-sm"
                data-testid="change-display"
              >
                <span className="text-muted-foreground">Change</span>
                <span
                  className="font-semibold text-green-700 dark:text-green-400"
                  data-testid="change-amount"
                >
                  ${formatCurrency(change)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Card / Mobile — show auto-set amount */}
        {!isCash && (
          <div
            className="rounded-md bg-muted/50 px-3 py-2 text-sm flex items-center justify-between"
            data-testid="auto-amount-display"
          >
            <span className="text-muted-foreground">Amount charged</span>
            <span className="font-semibold" data-testid="auto-amount-value">
              ${formatCurrency(total)}
            </span>
          </div>
        )}

        {/* API error */}
        {error && (
          <p
            role="alert"
            className="text-sm text-destructive"
            data-testid="payment-error"
          >
            {error}
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            data-testid="cancel-payment-btn"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            data-testid="confirm-payment-btn"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              'Confirm Payment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
