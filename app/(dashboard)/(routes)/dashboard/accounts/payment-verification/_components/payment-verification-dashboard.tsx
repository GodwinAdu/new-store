'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  DollarSign,
  AlertCircle,
  Eye,
  QrCode,
  Receipt,
  User,
  Calendar,
  Package,
  CreditCard,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  verifyPayment,
  rejectPayment,
  getSaleByVerificationCode,
} from '@/lib/actions/payment-verification.actions'
import { postSaleToAccounts, getCashAndBankAccounts } from '@/lib/actions/accounts.actions'
import { useRouter } from 'next/navigation'

interface CashBankAccount {
  _id: string
  name: string
  type: string
  balance: number
}

export default function PaymentVerificationDashboard({
  pendingPayments,
  stats,
}: {
  pendingPayments: any[]
  stats: any
}) {
  const [searchCode, setSearchCode] = useState('')
  const [selectedSale, setSelectedSale] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [verificationNotes, setVerificationNotes] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [cashBankAccounts, setCashBankAccounts] = useState<CashBankAccount[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    getCashAndBankAccounts().then(setCashBankAccounts).catch(console.error)
  }, [])

  const saleTotal = (sale: any) =>
    sale.total ||
    sale.totalRevenue ||
    sale.items?.reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0) ||
    0

  const handleVerify = async (sale: any) => {
    if (!selectedAccountId) {
      toast.error('Please select an account to credit the sale revenue to')
      return
    }
    setLoading(true)
    try {
      await verifyPayment(sale._id, verificationNotes)
      await postSaleToAccounts({
        saleId: sale._id,
        verificationCode: sale.verificationCode,
        amount: saleTotal(sale),
        paymentMethod: sale.paymentMethod || 'cash',
        cashierName: sale.cashier?.fullName || sale.cashier?.name || 'Unknown',
        warehouseName: sale.warehouse?.name || 'POS',
        saleDate: sale.saleDate,
        accountId: selectedAccountId,
      })
      toast.success('Payment verified and revenue posted to accounts')
      setVerificationNotes('')
      setSelectedAccountId('')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify payment')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (saleId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    setLoading(true)
    try {
      await rejectPayment(saleId, rejectionReason)
      toast.success('Payment rejected')
      setRejectionReason('')
      router.refresh()
    } catch {
      toast.error('Failed to reject payment')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchByCode = async () => {
    if (!searchCode.trim()) {
      toast.error('Please enter a verification code')
      return
    }
    setLoading(true)
    try {
      const sale = await getSaleByVerificationCode(searchCode)
      setSelectedSale(sale)
    } catch {
      toast.error('Sale not found with this code')
    } finally {
      setLoading(false)
    }
  }

  // Reusable account selector
  const AccountSelector = () => (
    <div className="space-y-1">
      <Label className="text-sm font-medium flex items-center gap-1">
        <CreditCard className="h-3.5 w-3.5" />
        Credit to Account <span className="text-destructive">*</span>
      </Label>
      <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
        <SelectTrigger>
          <SelectValue placeholder="Select account to receive revenue" />
        </SelectTrigger>
        <SelectContent>
          {cashBankAccounts.length === 0 ? (
            <SelectItem value="_none" disabled>
              No cash/bank accounts — create one first
            </SelectItem>
          ) : (
            cashBankAccounts.map((acc) => (
              <SelectItem key={acc._id} value={acc._id}>
                {acc.name} ({acc.type}) — ₵{acc.balance.toLocaleString()}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Payment Verification</h1>
        <p className="text-muted-foreground">Verify payments and post revenue to accounts</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.todayPending}</div>
            <p className="text-xs text-muted-foreground">From today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            <p className="text-xs text-muted-foreground">Approved payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₵{stats.totalPendingAmount?.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Lookup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Quick Lookup
          </CardTitle>
          <CardDescription>Search for a sale using its verification code</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter verification code (e.g., VRF-XXX-XXXX)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchByCode()}
            />
            <Button onClick={handleSearchByCode} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Payments ({pendingPayments.length})</CardTitle>
          <CardDescription>Review, verify, and post revenue to accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingPayments.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">No pending payments to verify</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((sale: any) => (
                <Card key={sale._id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: sale info */}
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className="font-mono">
                            {sale.verificationCode}
                          </Badge>
                          <Badge className="bg-yellow-500">Pending</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>{new Date(sale.saleDate).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>{sale.cashier?.fullName || sale.cashier?.name || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>{sale.items?.length || 0} items</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="font-bold">₵{saleTotal(sale).toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Receipt className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {sale.paymentMethod?.toUpperCase()}
                            {sale.paymentMethod === 'cash' &&
                              ` · Received ₵${sale.cashReceived?.toFixed(2)}`}
                          </span>
                        </div>

                        <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                          {sale.items?.slice(0, 3).map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between">
                              <span>{item.product?.name || 'Unknown'}</span>
                              <span className="text-muted-foreground">
                                {item.quantity} × ₵{item.unitPrice?.toFixed(2)}
                              </span>
                            </div>
                          ))}
                          {sale.items?.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{sale.items.length - 3} more items
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        {/* View & Verify dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View & Verify
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Verify Sale — {sale.verificationCode}</DialogTitle>
                              <DialogDescription>
                                Select an account to post the revenue to before verifying
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Cashier</p>
                                  <p className="font-medium">
                                    {sale.cashier?.fullName || sale.cashier?.name}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Date</p>
                                  <p className="font-medium">
                                    {new Date(sale.saleDate).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Payment Method</p>
                                  <p className="font-medium">{sale.paymentMethod?.toUpperCase()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Total</p>
                                  <p className="font-bold text-lg">₵{saleTotal(sale).toFixed(2)}</p>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm font-medium mb-2">Items</p>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                  {sale.items?.map((item: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between p-2 bg-muted rounded text-sm"
                                    >
                                      <span>{item.product?.name}</span>
                                      <span>
                                        {item.quantity} × ₵{item.unitPrice?.toFixed(2)} = ₵
                                        {(item.quantity * item.unitPrice).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-3 border-t pt-4">
                                <AccountSelector />
                                <div>
                                  <Label className="text-sm">Notes (optional)</Label>
                                  <Textarea
                                    placeholder="Add verification notes..."
                                    value={verificationNotes}
                                    onChange={(e) => setVerificationNotes(e.target.value)}
                                    rows={2}
                                  />
                                </div>
                                <Button
                                  onClick={() => handleVerify(sale)}
                                  disabled={loading || !selectedAccountId}
                                  className="w-full"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Verify & Post to Accounts
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Reject dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Payment</DialogTitle>
                              <DialogDescription>
                                Provide a reason for rejecting this payment
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                              />
                              <Button
                                variant="destructive"
                                onClick={() => handleReject(sale._id)}
                                disabled={loading || !rejectionReason.trim()}
                                className="w-full"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Confirm Rejection
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search result dialog */}
      {selectedSale && (
        <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Sale — {selectedSale.verificationCode}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Badge
                className={
                  selectedSale.paymentStatus === 'verified'
                    ? 'bg-green-500'
                    : selectedSale.paymentStatus === 'rejected'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
                }
              >
                {selectedSale.paymentStatus?.toUpperCase()}
              </Badge>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cashier</p>
                  <p className="font-medium">{selectedSale.cashier?.fullName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedSale.saleDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{selectedSale.paymentMethod?.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-bold text-lg">₵{saleTotal(selectedSale).toFixed(2)}</p>
                </div>
              </div>

              {selectedSale.verifiedBy && (
                <div className="bg-muted p-3 rounded text-sm">
                  <p className="text-muted-foreground">Verified By</p>
                  <p className="font-medium">{selectedSale.verifiedBy?.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(selectedSale.verifiedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {selectedSale.paymentStatus === 'pending' && (
                <div className="space-y-3 border-t pt-4">
                  <AccountSelector />
                  <Button
                    onClick={() => handleVerify(selectedSale)}
                    disabled={loading || !selectedAccountId}
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify & Post to Accounts
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
