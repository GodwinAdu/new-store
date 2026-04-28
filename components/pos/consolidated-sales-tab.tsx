'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Printer,
  Ban,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { getTodayStats, getTodaySales, voidSale } from '@/lib/actions/pos.actions'
import type { ReceiptData } from '@/lib/utils/receipt-utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SaleItem {
  product?: {
    _id?: string
    name?: string
    price?: number
  }
  quantity: number
  unitPrice: number
}

export interface SaleTransaction {
  _id: string
  saleDate: string
  paymentMethod: string
  subtotal: number
  discount: number
  tax: number
  total: number
  totalRevenue?: number
  cashReceived?: number
  isVoided?: boolean
  items: SaleItem[]
  cashier?: {
    _id?: string
    name?: string
    email?: string
  }
}

interface TodayStats {
  totalSales: number
  totalTransactions: number
  avgOrderValue: number
  peakHour?: string
}

export interface ConsolidatedSalesTabProps {
  onReprintReceipt: (receiptData: ReceiptData) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return value.toFixed(2)
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function paymentMethodLabel(method: string): string {
  switch (method) {
    case 'cash': return 'Cash'
    case 'card': return 'Card'
    case 'mobile': return 'Mobile Money'
    default: return method
  }
}

/**
 * Builds a ReceiptData object from a SaleTransaction for reprinting.
 */
function buildReceiptFromTransaction(sale: SaleTransaction): ReceiptData {
  const receiptNumber = sale._id.slice(-8).toUpperCase()
  const items = sale.items.map((item) => ({
    name: item.product?.name ?? 'Unknown Product',
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.unitPrice * item.quantity,
  }))

  return {
    receiptNumber,
    storeName: 'Modern POS',
    warehouseName: '',
    warehouseLocation: '',
    cashierName: sale.cashier?.name ?? 'Unknown',
    timestamp: sale.saleDate,
    items,
    subtotal: sale.subtotal,
    discount: sale.discount,
    tax: sale.tax,
    total: sale.total,
    paymentMethod: (sale.paymentMethod as 'cash' | 'card' | 'mobile') ?? 'cash',
    cashReceived: sale.cashReceived,
    change:
      sale.paymentMethod === 'cash' && sale.cashReceived != null
        ? Math.max(0, sale.cashReceived - sale.total)
        : undefined,
  }
}

// ---------------------------------------------------------------------------
// MetricCard
// ---------------------------------------------------------------------------

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  loading: boolean
}

function MetricCard({ icon, label, value, loading }: MetricCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-4 shadow-sm">
      <div className="rounded-lg bg-primary/10 p-2.5 text-primary">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {loading ? (
          <div className="h-6 w-20 bg-muted animate-pulse rounded mt-1" />
        ) : (
          <p className="text-xl font-bold tabular-nums">{value}</p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// VoidDialog
// ---------------------------------------------------------------------------

interface VoidDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  isLoading: boolean
}

function VoidDialog({ isOpen, onClose, onConfirm, isLoading }: VoidDialogProps) {
  const [reason, setReason] = useState('')

  function handleConfirm() {
    if (reason.trim()) {
      onConfirm(reason.trim())
    }
  }

  function handleClose() {
    setReason('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="max-w-sm" data-testid="void-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-destructive" />
            Void Transaction
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Please provide a reason for voiding this transaction. This action cannot be undone.
          </p>
          <div>
            <Label htmlFor="void-reason">Reason</Label>
            <Input
              id="void-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter void reason…"
              className="mt-1"
              data-testid="void-reason-input"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            data-testid="void-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
            data-testid="void-confirm-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Voiding…
              </>
            ) : (
              'Void Transaction'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// TransactionRow
// ---------------------------------------------------------------------------

interface TransactionRowProps {
  transaction: SaleTransaction
  onReprint: (sale: SaleTransaction) => void
  onVoid: (sale: SaleTransaction) => void
}

function TransactionRow({ transaction, onReprint, onVoid }: TransactionRowProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="border rounded-lg overflow-hidden"
      data-testid="transaction-row"
      data-sale-id={transaction._id}
      data-sale-date={transaction.saleDate}
    >
      {/* Summary row */}
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        data-testid="transaction-toggle"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              #{transaction._id.slice(-6).toUpperCase()}
            </span>
            {transaction.isVoided && (
              <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                Voided
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{formatDate(transaction.saleDate)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">${formatCurrency(transaction.total)}</p>
          <p className="text-xs text-muted-foreground">{paymentMethodLabel(transaction.paymentMethod)}</p>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t px-4 py-3 bg-muted/20 space-y-3" data-testid="transaction-details">
          {/* Cashier */}
          {transaction.cashier?.name && (
            <p className="text-xs text-muted-foreground">
              Cashier: <span className="font-medium text-foreground">{transaction.cashier.name}</span>
            </p>
          )}

          {/* Items */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Items</p>
            {transaction.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <span>{item.product?.name ?? 'Unknown'} × {item.quantity}</span>
                <span className="font-medium">${formatCurrency(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-0.5 text-xs border-t pt-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${formatCurrency(transaction.subtotal)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount</span>
                <span>-${formatCurrency(transaction.discount)}</span>
              </div>
            )}
            {transaction.tax > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>${formatCurrency(transaction.tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-1">
              <span>Total</span>
              <span>${formatCurrency(transaction.total)}</span>
            </div>
          </div>

          {/* Actions */}
          {!transaction.isVoided && (
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => onReprint(transaction)}
                data-testid="reprint-btn"
              >
                <Printer className="h-3.5 w-3.5" />
                Reprint Receipt
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={() => onVoid(transaction)}
                data-testid="void-btn"
              >
                <Ban className="h-3.5 w-3.5" />
                Void
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ConsolidatedSalesTab
// ---------------------------------------------------------------------------

export function ConsolidatedSalesTab({ onReprintReceipt }: ConsolidatedSalesTabProps) {
  const [stats, setStats] = useState<TodayStats | null>(null)
  const [transactions, setTransactions] = useState<SaleTransaction[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(true)
  const [statsError, setStatsError] = useState(false)
  const [txError, setTxError] = useState(false)

  // Void dialog state
  const [voidTarget, setVoidTarget] = useState<SaleTransaction | null>(null)
  const [isVoiding, setIsVoiding] = useState(false)

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    setStatsError(false)
    try {
      const data = await getTodayStats()
      setStats(data)
    } catch {
      setStatsError(true)
      toast.error('Failed to load today\'s stats')
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const loadTransactions = useCallback(async () => {
    setTxLoading(true)
    setTxError(false)
    try {
      const data = await getTodaySales()
      // Sort most-recent-first (API already sorts, but ensure it)
      const sorted = [...data].sort(
        (a: SaleTransaction, b: SaleTransaction) =>
          new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
      )
      setTransactions(sorted)
    } catch {
      setTxError(true)
      toast.error('Failed to load today\'s transactions')
    } finally {
      setTxLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
    loadTransactions()
  }, [loadStats, loadTransactions])

  function handleReprint(sale: SaleTransaction) {
    const receiptData = buildReceiptFromTransaction(sale)
    onReprintReceipt(receiptData)
  }

  async function handleVoidConfirm(reason: string) {
    if (!voidTarget) return
    setIsVoiding(true)
    try {
      await voidSale(voidTarget._id, reason)
      // Update local state to mark as voided
      setTransactions((prev) =>
        prev.map((t) =>
          t._id === voidTarget._id ? { ...t, isVoided: true } : t
        )
      )
      toast.success('Transaction voided successfully')
      setVoidTarget(null)
    } catch {
      toast.error('Failed to void transaction')
      // Keep transaction in list unchanged (do not remove)
    } finally {
      setIsVoiding(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4" data-testid="consolidated-sales-tab">
      {/* Summary metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Today's Revenue"
          value={stats ? `$${formatCurrency(stats.totalSales)}` : '$0.00'}
          loading={statsLoading}
        />
        <MetricCard
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Transactions"
          value={stats ? String(stats.totalTransactions) : '0'}
          loading={statsLoading}
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Avg Order Value"
          value={stats ? `$${formatCurrency(stats.avgOrderValue)}` : '$0.00'}
          loading={statsLoading}
        />
      </div>

      {/* Stats error */}
      {statsError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          Failed to load stats.{' '}
          <button
            type="button"
            className="underline"
            onClick={loadStats}
          >
            Retry
          </button>
        </div>
      )}

      {/* Transaction list */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Today's Transactions</h3>

        {txLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : txError ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Failed to load transactions.{' '}
            <button
              type="button"
              className="underline"
              onClick={loadTransactions}
            >
              Retry
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No transactions today</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-2" data-testid="transaction-list">
              {transactions.map((tx) => (
                <TransactionRow
                  key={tx._id}
                  transaction={tx}
                  onReprint={handleReprint}
                  onVoid={(sale) => setVoidTarget(sale)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Void dialog */}
      <VoidDialog
        isOpen={voidTarget !== null}
        onClose={() => setVoidTarget(null)}
        onConfirm={handleVoidConfirm}
        isLoading={isVoiding}
      />
    </div>
  )
}
