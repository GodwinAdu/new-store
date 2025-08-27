'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Printer, 
  Download, 
  Mail, 
  Share2, 
  Receipt,
  Clock,
  User,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react'
import { toast } from 'sonner'

interface ReceiptItem {
  name: string
  quantity: number
  price: number
  total: number
}

interface ReceiptData {
  id: string
  items: ReceiptItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: 'cash' | 'card' | 'mobile'
  cashReceived?: number
  change?: number
  customer?: {
    name: string
    email?: string
    phone?: string
    loyaltyPoints?: number
  }
  timestamp: string
  cashier: string
  store: {
    name: string
    address: string
    phone: string
    email: string
  }
}

const mockReceipt: ReceiptData = {
  id: 'TXN-2024-001',
  items: [
    { name: 'Premium Coffee', quantity: 2, price: 4.99, total: 9.98 },
    { name: 'Croissant', quantity: 1, price: 2.99, total: 2.99 },
    { name: 'Sandwich', quantity: 1, price: 7.99, total: 7.99 }
  ],
  subtotal: 20.96,
  discount: 2.10,
  tax: 1.60,
  total: 20.46,
  paymentMethod: 'cash',
  cashReceived: 25.00,
  change: 4.54,
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    loyaltyPoints: 150
  },
  timestamp: new Date().toISOString(),
  cashier: 'Admin User',
  store: {
    name: 'Modern POS Store',
    address: '123 Business St, City, State 12345',
    phone: '(555) 123-4567',
    email: 'store@modernpos.com'
  }
}

interface ReceiptPrinterProps {
  receiptData?: ReceiptData
  onPrint?: () => void
  onEmail?: () => void
  onDownload?: () => void
}

export function ReceiptPrinter({ 
  receiptData = mockReceipt, 
  onPrint, 
  onEmail, 
  onDownload 
}: ReceiptPrinterProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const [isEmailSending, setIsEmailSending] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4" />
      case 'card': return <CreditCard className="h-4 w-4" />
      case 'mobile': return <Smartphone className="h-4 w-4" />
      default: return <CreditCard className="h-4 w-4" />
    }
  }

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      // Simulate printing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, this would send to a thermal printer
      window.print()
      
      toast.success('Receipt printed successfully!')
      onPrint?.()
    } catch (error) {
      toast.error('Failed to print receipt')
    } finally {
      setIsPrinting(false)
    }
  }

  const handleEmail = async () => {
    if (!receiptData.customer?.email) {
      toast.error('Customer email not available')
      return
    }

    setIsEmailSending(true)
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success(`Receipt emailed to ${receiptData.customer.email}`)
      onEmail?.()
    } catch (error) {
      toast.error('Failed to send email')
    } finally {
      setIsEmailSending(false)
    }
  }

  const handleDownload = () => {
    // Generate receipt as PDF or text file
    const receiptText = generateReceiptText(receiptData)
    const blob = new Blob([receiptText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${receiptData.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Receipt downloaded!')
    onDownload?.()
  }

  const generateReceiptText = (data: ReceiptData) => {
    return `
${data.store.name}
${data.store.address}
${data.store.phone}
${data.store.email}

================================
RECEIPT #${data.id}
================================

Date: ${formatDate(data.timestamp)}
Cashier: ${data.cashier}
${data.customer ? `Customer: ${data.customer.name}` : ''}

--------------------------------
ITEMS:
${data.items.map(item => 
  `${item.name}\n  ${item.quantity} x $${item.price.toFixed(2)} = $${item.total.toFixed(2)}`
).join('\n')}

--------------------------------
SUMMARY:
Subtotal: $${data.subtotal.toFixed(2)}
${data.discount > 0 ? `Discount: -$${data.discount.toFixed(2)}` : ''}
Tax: $${data.tax.toFixed(2)}
TOTAL: $${data.total.toFixed(2)}

PAYMENT: ${data.paymentMethod.toUpperCase()}
${data.paymentMethod === 'cash' ? `
Cash Received: $${data.cashReceived?.toFixed(2)}
Change: $${data.change?.toFixed(2)}` : ''}

================================
Thank you for your business!
Visit us again soon!
================================
    `.trim()
  }

  return (
    <div className="space-y-4">
      {/* Receipt Preview */}
      <Card className="max-w-sm mx-auto bg-white text-black print:shadow-none">
        <CardContent className="p-6 font-mono text-sm">
          {/* Store Header */}
          <div className="text-center mb-4">
            <h2 className="font-bold text-lg">{receiptData.store.name}</h2>
            <p className="text-xs">{receiptData.store.address}</p>
            <p className="text-xs">{receiptData.store.phone}</p>
            <p className="text-xs">{receiptData.store.email}</p>
          </div>

          <div className="border-t border-b border-dashed border-gray-400 py-2 my-4">
            <div className="text-center font-bold">RECEIPT #{receiptData.id}</div>
          </div>

          {/* Transaction Info */}
          <div className="space-y-1 mb-4 text-xs">
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{formatDate(receiptData.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{receiptData.cashier}</span>
            </div>
            {receiptData.customer && (
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{receiptData.customer.name}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          {/* Items */}
          <div className="space-y-2 mb-4">
            {receiptData.items.map((item, index) => (
              <div key={index}>
                <div className="font-medium">{item.name}</div>
                <div className="flex justify-between text-xs">
                  <span>{item.quantity} x ${item.price.toFixed(2)}</span>
                  <span>${item.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          {/* Totals */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${receiptData.subtotal.toFixed(2)}</span>
            </div>
            {receiptData.discount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-${receiptData.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${receiptData.tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-dashed border-gray-400 my-1"></div>
            <div className="flex justify-between font-bold text-base">
              <span>TOTAL:</span>
              <span>${receiptData.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          {/* Payment Info */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span>Payment:</span>
              <div className="flex items-center space-x-1">
                {getPaymentIcon(receiptData.paymentMethod)}
                <span className="uppercase">{receiptData.paymentMethod}</span>
              </div>
            </div>
            {receiptData.paymentMethod === 'cash' && (
              <>
                <div className="flex justify-between">
                  <span>Cash Received:</span>
                  <span>${receiptData.cashReceived?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span>${receiptData.change?.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Customer Loyalty */}
          {receiptData.customer?.loyaltyPoints && (
            <>
              <div className="border-t border-dashed border-gray-400 my-2"></div>
              <div className="text-xs text-center">
                <p>Loyalty Points: {receiptData.customer.loyaltyPoints}</p>
                <p>Points Earned: +{Math.floor(receiptData.total)}</p>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="border-t border-dashed border-gray-400 my-4"></div>
          <div className="text-center text-xs">
            <p className="font-bold">Thank you for your business!</p>
            <p>Visit us again soon!</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-center print:hidden">
        <Button 
          onClick={handlePrint}
          disabled={isPrinting}
          className="flex items-center space-x-2"
        >
          <Printer className="h-4 w-4" />
          <span>{isPrinting ? 'Printing...' : 'Print Receipt'}</span>
        </Button>

        <Button 
          variant="outline"
          onClick={handleDownload}
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </Button>

        {receiptData.customer?.email && (
          <Button 
            variant="outline"
            onClick={handleEmail}
            disabled={isEmailSending}
            className="flex items-center space-x-2"
          >
            <Mail className="h-4 w-4" />
            <span>{isEmailSending ? 'Sending...' : 'Email'}</span>
          </Button>
        )}

        <Button 
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </div>
    </div>
  )
}

export function ReceiptDialog({ 
  receiptData, 
  isOpen, 
  onClose 
}: { 
  receiptData?: ReceiptData
  isOpen: boolean
  onClose: () => void 
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Receipt Preview
          </DialogTitle>
        </DialogHeader>
        <ReceiptPrinter 
          receiptData={receiptData}
          onPrint={onClose}
          onEmail={onClose}
          onDownload={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}