'use client'

import { Button } from '@/components/ui/button'
import { Calculator, DollarSign, Receipt } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QuickActionsBarProps {
  onCalculator: () => void
  onNoSale: () => void
  onLastReceipt: () => void
}

// ---------------------------------------------------------------------------
// QuickActionsBar
// ---------------------------------------------------------------------------

/**
 * A slim horizontal toolbar with exactly three quick-action buttons:
 * Calculator, No Sale, and Last Receipt.
 */
export function QuickActionsBar({
  onCalculator,
  onNoSale,
  onLastReceipt,
}: QuickActionsBarProps) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30"
      data-testid="quick-actions-bar"
      role="toolbar"
      aria-label="Quick actions"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={onCalculator}
        data-testid="calculator-btn"
        aria-label="Calculator"
      >
        <Calculator className="h-4 w-4" />
        <span className="text-xs font-medium">Calculator</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={onNoSale}
        data-testid="no-sale-btn"
        aria-label="No Sale"
      >
        <DollarSign className="h-4 w-4" />
        <span className="text-xs font-medium">No Sale</span>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={onLastReceipt}
        data-testid="last-receipt-btn"
        aria-label="Last Receipt"
      >
        <Receipt className="h-4 w-4" />
        <span className="text-xs font-medium">Last Receipt</span>
      </Button>
    </div>
  )
}
