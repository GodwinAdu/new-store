'use client'

import { forwardRef } from 'react'
import { format } from 'date-fns'

interface ReceiptProps {
  receiptData: {
    receiptNumber: string
    items: any[]
    subtotal: number
    discount: number
    tax: number
    total: number
    paymentMethod: string
    cashReceived?: number
    change?: number
    customer?: any
    warehouse?: any
    timestamp: string
    cashier?: string
  }
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ receiptData }, ref) => {
    return (
      <div ref={ref} className="bg-white p-6 max-w-sm mx-auto font-mono text-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold mb-2">MODERN POS</h1>
          <p className="text-xs text-gray-600">
            {receiptData.warehouse?.name || 'Main Store'}
          </p>
          <p className="text-xs text-gray-600">
            {receiptData.warehouse?.location || 'Location'}
          </p>
          <div className="border-t border-dashed border-gray-400 my-3"></div>
        </div>

        {/* Receipt Info */}
        <div className="mb-4 text-xs">
          <div className="flex justify-between">
            <span>Receipt #:</span>
            <span>{receiptData.receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{format(new Date(receiptData.timestamp), 'dd/MM/yyyy HH:mm')}</span>
          </div>
          {receiptData.customer && (
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{receiptData.customer.name}</span>
            </div>
          )}
          {receiptData.cashier && (
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{receiptData.cashier}</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-gray-400 my-3"></div>

        {/* Items */}
        <div className="mb-4">
          {receiptData.items.map((item, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between">
                <span className="font-medium">{item.name}</span>
                <span>₵{(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 ml-2">
                <span>
                  {item.quantity} x ₵{item.unitPrice.toFixed(2)}
                  {item.selectedUnit && ` (${item.selectedUnit.name})`}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-400 my-3"></div>

        {/* Totals */}
        <div className="mb-4 text-xs">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₵{receiptData.subtotal.toFixed(2)}</span>
          </div>
          
          {receiptData.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-₵{receiptData.discount.toFixed(2)}</span>
            </div>
          )}
          
          {receiptData.tax > 0 && (
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>₵{receiptData.tax.toFixed(2)}</span>
            </div>
          )}
          
          <div className="border-t border-gray-300 my-2"></div>
          
          <div className="flex justify-between font-bold text-base">
            <span>TOTAL:</span>
            <span>₵{receiptData.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-400 my-3"></div>

        {/* Payment */}
        <div className="mb-4 text-xs">
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="capitalize">{receiptData.paymentMethod}</span>
          </div>
          
          {receiptData.paymentMethod === 'cash' && (
            <>
              <div className="flex justify-between">
                <span>Cash Received:</span>
                <span>₵{receiptData.cashReceived?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Change:</span>
                <span>₵{receiptData.change?.toFixed(2) || '0.00'}</span>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-dashed border-gray-400 my-3"></div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600">
          <p className="mb-1">Thank you for your business!</p>
          <p className="mb-1">Visit us again soon</p>
          {receiptData.customer?.loyaltyPoints && (
            <p className="mb-1">
              Loyalty Points: {receiptData.customer.loyaltyPoints}
            </p>
          )}
          <div className="mt-4">
            <p>★ ★ ★ ★ ★</p>
            <p className="text-xs">Powered by Modern POS</p>
          </div>
        </div>
      </div>
    )
  }
)

Receipt.displayName = 'Receipt'