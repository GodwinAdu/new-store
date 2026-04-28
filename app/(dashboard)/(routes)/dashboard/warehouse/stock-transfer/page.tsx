"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft, Plus, Eye, CheckCircle, Package, Truck, Check, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  getAllStockTransfers,
  createStockTransfer,
  approveStockTransfer,
  completeStockTransfer,
  getWarehouses,
  getWarehouseStock,
} from "@/lib/actions/stock-transfer.actions"

interface StockTransfer {
  _id: string
  transferNumber: string
  fromWarehouse: { _id: string; name: string; location: string }
  toWarehouse: { _id: string; name: string; location: string }
  status: "pending" | "in-transit" | "completed" | "cancelled"
  transferDate: string
  completedDate?: string
  items: Array<{
    product: { _id: string; name: string; sku: string }
    quantity: number
    unitCost: number
  }>
  requestedBy?: { name: string }
  approvedBy?: { name: string }
  reason: string
  notes?: string
}

interface Warehouse {
  _id: string
  name: string
  location: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  "in-transit": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function StockTransferPage() {
  const [transfers, setTransfers] = useState<StockTransfer[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [warehouseStock, setWarehouseStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | null>(null)
  const [activeTab, setActiveTab] = useState("active")

  const [form, setForm] = useState({
    fromWarehouseId: "",
    toWarehouseId: "",
    reason: "",
    notes: "",
    items: [{ productId: "", quantity: 1, unitCost: 0 }],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [transfersData, warehousesData] = await Promise.all([
        getAllStockTransfers(),
        getWarehouses(),
      ])
      setTransfers(transfersData)
      setWarehouses(warehousesData)
    } catch {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const loadWarehouseStock = async (warehouseId: string) => {
    if (!warehouseId) { setWarehouseStock([]); return }
    try {
      const stock = await getWarehouseStock(warehouseId)
      setWarehouseStock(stock)
    } catch {
      toast.error("Failed to load warehouse stock")
    }
  }

  const handleCreate = async () => {
    if (!form.fromWarehouseId || !form.toWarehouseId || !form.reason) {
      toast.error("Please fill in all required fields")
      return
    }
    if (form.items.some(i => !i.productId || i.quantity <= 0)) {
      toast.error("Please fill in all item details")
      return
    }
    setSubmitting(true)
    try {
      await createStockTransfer({
        fromWarehouseId: form.fromWarehouseId,
        toWarehouseId: form.toWarehouseId,
        reason: form.reason,
        notes: form.notes,
        items: form.items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitCost: i.unitCost,
        })),
      })
      toast.success("Transfer request created")
      setShowCreateDialog(false)
      setForm({ fromWarehouseId: "", toWarehouseId: "", reason: "", notes: "", items: [{ productId: "", quantity: 1, unitCost: 0 }] })
      loadData()
    } catch (e: any) {
      toast.error(e.message || "Failed to create transfer")
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await approveStockTransfer(id)
      toast.success("Transfer approved and marked in-transit")
      loadData()
    } catch (e: any) {
      toast.error(e.message || "Failed to approve transfer")
    }
  }

  const handleComplete = async (id: string) => {
    try {
      await completeStockTransfer(id)
      toast.success("Transfer completed — stock moved")
      loadData()
    } catch (e: any) {
      toast.error(e.message || "Failed to complete transfer")
    }
  }

  const updateItem = (index: number, field: string, value: any) => {
    const items = [...form.items]
    items[index] = { ...items[index], [field]: value }
    if (field === "productId") {
      const stock = warehouseStock.find(s => s.product._id === value)
      if (stock) items[index].unitCost = stock.batches?.[0]?.unitCost || 0
    }
    setForm({ ...form, items })
  }

  const pending = transfers.filter(t => t.status === "pending")
  const inTransit = transfers.filter(t => t.status === "in-transit")
  const completed = transfers.filter(t => t.status === "completed")

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock Transfer</h1>
          <p className="text-muted-foreground">Transfer inventory between warehouses</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Stock Transfer</DialogTitle>
              <DialogDescription>Request a stock transfer between warehouses</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Warehouse *</Label>
                  <Select
                    value={form.fromWarehouseId}
                    onValueChange={v => {
                      setForm({ ...form, fromWarehouseId: v, items: [{ productId: "", quantity: 1, unitCost: 0 }] })
                      loadWarehouseStock(v)
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map(w => (
                        <SelectItem key={w._id} value={w._id}>{w.name} — {w.location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To Warehouse *</Label>
                  <Select
                    value={form.toWarehouseId}
                    onValueChange={v => setForm({ ...form, toWarehouseId: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                    <SelectContent>
                      {warehouses.filter(w => w._id !== form.fromWarehouseId).map(w => (
                        <SelectItem key={w._id} value={w._id}>{w.name} — {w.location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason *</Label>
                <Input
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  placeholder="e.g. Stock rebalancing, customer demand"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Items *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForm({ ...form, items: [...form.items, { productId: "", quantity: 1, unitCost: 0 }] })}
                  >
                    Add Item
                  </Button>
                </div>
                {form.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <Select value={item.productId} onValueChange={v => updateItem(i, "productId", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder={form.fromWarehouseId ? "Select product" : "Select source warehouse first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouseStock.length === 0
                            ? <SelectItem value="_none" disabled>No stock available</SelectItem>
                            : warehouseStock.map(s => (
                              <SelectItem key={s.product._id} value={s.product._id}>
                                {s.product.name} ({s.product.sku}) — {s.totalQuantity} avail.
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min={1}
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={e => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Cost"
                        value={item.unitCost}
                        onChange={e => updateItem(i, "unitCost", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1">
                      {form.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>

              <Button onClick={handleCreate} disabled={submitting} className="w-full">
                {submitting ? "Creating..." : "Create Transfer Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Approval", value: pending.length, icon: Package, color: "text-yellow-600" },
          { label: "In Transit", value: inTransit.length, icon: Truck, color: "text-blue-600" },
          { label: "Completed", value: completed.length, icon: Check, color: "text-green-600" },
          { label: "Total", value: transfers.length, icon: ArrowRightLeft, color: "text-muted-foreground" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">In Transit ({inTransit.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <TransferTable
            transfers={inTransit}
            onView={setSelectedTransfer}
            onComplete={handleComplete}
            showComplete
          />
        </TabsContent>

        <TabsContent value="pending">
          <TransferTable
            transfers={pending}
            onView={setSelectedTransfer}
            onApprove={handleApprove}
            showApprove
          />
        </TabsContent>

        <TabsContent value="history">
          <TransferTable transfers={completed} onView={setSelectedTransfer} />
        </TabsContent>
      </Tabs>

      {/* Detail dialog */}
      <Dialog open={!!selectedTransfer} onOpenChange={open => !open && setSelectedTransfer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transfer {selectedTransfer?.transferNumber}</DialogTitle>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">From:</span> {selectedTransfer.fromWarehouse.name}</div>
                <div><span className="font-medium">To:</span> {selectedTransfer.toWarehouse.name}</div>
                <div><span className="font-medium">Status:</span> <Badge className={STATUS_COLORS[selectedTransfer.status]}>{selectedTransfer.status}</Badge></div>
                <div><span className="font-medium">Date:</span> {new Date(selectedTransfer.transferDate).toLocaleDateString()}</div>
                <div className="col-span-2"><span className="font-medium">Reason:</span> {selectedTransfer.reason}</div>
                {selectedTransfer.notes && <div className="col-span-2"><span className="font-medium">Notes:</span> {selectedTransfer.notes}</div>}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedTransfer.items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.product.sku}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">₵{item.unitCost.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TransferTable({
  transfers,
  onView,
  onApprove,
  onComplete,
  showApprove = false,
  showComplete = false,
}: {
  transfers: StockTransfer[]
  onView: (t: StockTransfer) => void
  onApprove?: (id: string) => void
  onComplete?: (id: string) => void
  showApprove?: boolean
  showComplete?: boolean
}) {
  if (transfers.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
          No transfers found
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transfer #</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map(t => (
              <TableRow key={t._id}>
                <TableCell className="font-medium">{t.transferNumber}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <span>{t.fromWarehouse.name}</span>
                    <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                    <span>{t.toWarehouse.name}</span>
                  </div>
                </TableCell>
                <TableCell>{t.items.length} item{t.items.length !== 1 ? "s" : ""}</TableCell>
                <TableCell>{new Date(t.transferDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[t.status]}>{t.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onView(t)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {showApprove && onApprove && (
                      <Button size="sm" variant="outline" onClick={() => onApprove(t._id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {showComplete && onComplete && (
                      <Button size="sm" onClick={() => onComplete(t._id)}>
                        <Package className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
