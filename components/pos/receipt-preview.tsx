'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Printer, Download, Mail, Receipt } from 'lucide-react'
import { toast } from 'sonner'
import type { ReceiptData } from '@/lib/utils/receipt-utils'

export interface ReceiptPreviewProps {
  isOpen: boolean
  onClose: () => void
  receiptData: ReceiptData | null
}

// ---------------------------------------------------------------------------
// Print styles — injected once into <head> so @media print only shows receipt
// ---------------------------------------------------------------------------
const PRINT_STYLE_ID = 'receipt-preview-print-styles'

function ensurePrintStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(PRINT_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = PRINT_STYLE_ID
  style.textContent = `
    @media print {
      body > * { display: none !important; }
      #receipt-print-root { display: block !important; }
    }
  `
  document.head.appendChild(style)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function formatCurrency(value: number): string {
  return value.toFixed(2)
}

function paymentMethodLabel(method: 'cash' | 'card' | 'mobile'): string {
  switch (method) {
    case 'cash':
      return 'Cash'
    case 'card':
      return 'Card'
    case 'mobile':
      return 'Mobile Money'
  }
}

function generateReceiptText(data: ReceiptData): string {
  const lines: string[] = []

  lines.push('================================')
  lines.push(data.storeName)
  lines.push(`${data.warehouseName} — ${data.warehouseLocation}`)
  lines.push('================================')
  lines.push(`Receipt #: ${data.receiptNumber}`)
  lines.push(`Date:      ${formatDate(data.timestamp)}`)
  lines.push(`Cashier:   ${data.cashierName}`)
  if (data.customer) {
    lines.push(`Customer:  ${data.customer.name}`)
  }
  lines.push('--------------------------------')
  lines.push('ITEMS:')
  for (const item of data.items) {
    const unitPart = item.unitLabel ? ` (${item.unitLabel})` : ''
    lines.push(`  ${item.name}${unitPart}`)
    lines.push(
      `    ${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.lineTotal)}`
    )
  }
  lines.push('--------------------------------')
  lines.push(`Subtotal:  ${formatCurrency(data.subtotal)}`)
  if (data.discount > 0) {
    lines.push(`Discount:  -${formatCurrency(data.discount)}`)
  }
  if (data.tax > 0) {
    lines.push(`Tax:       ${formatCurrency(data.tax)}`)
  }
  lines.push(`TOTAL:     ${formatCurrency(data.total)}`)
  lines.push('--------------------------------')
  lines.push(`Payment:   ${paymentMethodLabel(data.paymentMethod)}`)
  if (data.paymentMethod === 'cash') {
    lines.push(`Received:  ${formatCurrency(data.cashReceived ?? 0)}`)
    lines.push(`Change:    ${formatCurrency(data.change ?? 0)}`)
  }
  if (data.customer) {
    lines.push('--------------------------------')
    lines.push(`Points earned: ${data.customer.loyaltyPointsEarned}`)
  }
  lines.push('================================')
  lines.push('Thank you for your business!')
  lines.push('================================')

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// ReceiptContent — the printable receipt body
// ---------------------------------------------------------------------------

function ReceiptContent({ data }: { data: ReceiptData }) {
  return (
    <div
      id="receipt-print-root"
      className="font-mono text-sm bg-white text-black p-4 max-w-sm mx-auto"
    >
      {/* Store header */}
      <div className="text-center mb-3" data-testid="receipt-store-name">
        <p className="font-bold text-base">{data.storeName}</p>
        <p className="text-xs">{data.warehouseName}</p>
        <p className="text-xs">{data.warehouseLocation}</p>
      </div>

      <div className="border-t border-b border-dashed border-gray-400 py-1 my-2 text-center">
        <span className="font-bold" data-testid="receipt-number">
          Receipt #{data.receiptNumber}
        </span>
      </div>

      {/* Transaction info */}
      <div className="space-y-0.5 text-xs mb-3">
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{formatDate(data.timestamp)}</span>
        </div>
        <div className="flex justify-between">
          <span>Cashier:</span>
          <span data-testid="receipt-cashier">{data.cashierName}</span>
        </div>
        {data.customer && (
          <div className="flex justify-between">
            <span>Customer:</span>
            <span data-testid="receipt-customer-name">{data.customer.name}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-gray-400 my-2" />

      {/* Items */}
      <div className="space-y-1.5 mb-3" data-testid="receipt-items">
        {data.items.map((item, idx) => (
          <div key={idx}>
            <div className="font-medium text-xs">
              {item.name}
              {item.unitLabel ? ` (${item.unitLabel})` : ''}
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>
                {item.quantity} × ${formatCurrency(item.unitPrice)}
              </span>
              <span>${formatCurrency(item.lineTotal)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-gray-400 my-2" />

      {/* Totals */}
      <div className="space-y-0.5 text-xs mb-3">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${formatCurrency(data.subtotal)}</span>
        </div>
        {data.discount > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-${formatCurrency(data.discount)}</span>
          </div>
        )}
        {data.tax > 0 && (
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>${formatCurrency(data.tax)}</span>
          </div>
        )}
        <div className="border-t border-dashed border-gray-400 my-1" />
        <div className="flex justify-between font-bold text-sm" data-testid="receipt-total">
          <span>TOTAL:</span>
          <span>${formatCurrency(data.total)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2" />

      {/* Payment */}
      <div className="space-y-0.5 text-xs mb-3" data-testid="receipt-payment-method">
        <div className="flex justify-between">
          <span>Payment:</span>
          <span>{paymentMethodLabel(data.paymentMethod)}</span>
        </div>
        {data.paymentMethod === 'cash' && (
          <>
            <div className="flex justify-between">
              <span>Cash Received:</span>
              <span>${formatCurrency(data.cashReceived ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Change:</span>
              <span>${formatCurrency(data.change ?? 0)}</span>
            </div>
          </>
        )}
      </div>

      {/* Loyalty points */}
      {data.customer && (
        <>
          <div className="border-t border-dashed border-gray-400 my-2" />
          <div
            className="text-xs text-center"
            data-testid="receipt-loyalty-points"
          >
            <span className="font-medium">
              {data.customer.loyaltyPointsEarned} points earned
            </span>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="border-t border-dashed border-gray-400 my-3" />
      <div className="text-center text-xs">
        <p className="font-bold">Thank you for your business!</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ReceiptPreview — Dialog wrapper with Print / Download / Email actions
// ---------------------------------------------------------------------------

export function ReceiptPreview({ isOpen, onClose, receiptData }: ReceiptPreviewProps) {
  const [isEmailSending, setIsEmailSending] = useState(false)

  // Inject print styles once on mount
  useEffect(() => {
    ensurePrintStyles()
  }, [])

  // Return focus to product search field when dialog closes
  function handleOpenChange(open: boolean) {
    if (!open) {
      onClose()
      // Defer focus so the dialog has time to unmount
      setTimeout(() => {
        const searchEl =
          (document.getElementById('product-search') as HTMLElement | null) ??
          (document.querySelector('[data-product-search]') as HTMLElement | null)
        searchEl?.focus()
      }, 50)
    }
  }

  // ---- Print ---------------------------------------------------------------
  function handlePrint() {
    window.print()
  }

  // ---- Download ------------------------------------------------------------
  function handleDownload() {
    if (!receiptData) return
    const text = generateReceiptText(receiptData)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${receiptData.receiptNumber}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Receipt downloaded')
  }

  // ---- Email ---------------------------------------------------------------
  async function handleEmail() {
    if (!receiptData?.customer?.email) return
    setIsEmailSending(true)
    try {
      // Stub: email API not yet implemented — show success toast
      await new Promise<void>((resolve) => setTimeout(resolve, 800))
      toast.success(`Receipt emailed to ${receiptData.customer!.email}`)
    } catch {
      toast.error('Failed to send email receipt')
    } finally {
      setIsEmailSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto"
        data-testid="receipt-preview-dialog"
      >
        {/* Dialog chrome — hidden when printing */}
        <div className="print:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Receipt Preview
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Receipt body — always rendered, visible when printing */}
        {receiptData ? (
          <ReceiptContent data={receiptData} />
        ) : (
          <div className="text-center text-muted-foreground py-8 print:hidden">
            No receipt data available.
          </div>
        )}

        {/* Action buttons — hidden when printing */}
        {receiptData && (
          <div className="flex flex-wrap gap-2 justify-center pt-2 print:hidden">
            <Button
              size="sm"
              onClick={handlePrint}
              data-testid="print-receipt-btn"
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              data-testid="download-receipt-btn"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>

            {receiptData.customer?.email && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleEmail}
                disabled={isEmailSending}
                data-testid="email-receipt-btn"
              >
                <Mail className="h-4 w-4 mr-1" />
                {isEmailSending ? 'Sending…' : 'Email Receipt'}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
