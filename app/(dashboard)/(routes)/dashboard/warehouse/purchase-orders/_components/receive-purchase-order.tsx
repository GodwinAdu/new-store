"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package } from "lucide-react"
import { toast } from "sonner"
import { receivePurchaseOrder } from "@/lib/actions/advanced-stock.actions"

interface ReceivePurchaseOrderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseOrder: any
  onSuccess?: () => void
}

export default function ReceivePurchaseOrder({ open, onOpenChange, purchaseOrder, onSuccess }: ReceivePurchaseOrderProps) {
  const [loading, setLoading] = useState(false)
  const [profitMargin, setProfitMargin] = useState(30)
  const [items, setItems] = useState(
    purchaseOrder.items.map((item: any) => ({
      productId: item.product._id,
      productName: item.product.name,
      orderedQuantity: item.quantity,
      receivedQuantity: item.quantity,
      unitCost: item.unitCost,
      sellingPrice: item.unitCost * 1.3,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }))
  )

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const applyMargin = () => {
    const updated = items.map(item => ({
      ...item,
      sellingPrice: item.unitCost * (1 + profitMargin / 100)
    }))
    setItems(updated)
  }

  const handleReceive = async () => {
    try {
      setLoading(true)
      await receivePurchaseOrder(purchaseOrder._id, {
        items: items.map(item => ({
          productId: item.productId,
          receivedQuantity: item.receivedQuantity,
          actualCost: item.unitCost,
          sellingPrice: item.sellingPrice,
          expiryDate: new Date(item.expiryDate)
        })),
        profitMargin
      })
      
      toast.success('Purchase order received')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to receive purchase order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receive Purchase Order</DialogTitle>
          <DialogDescription>
            PO: {purchaseOrder.orderNumber} • Supplier: {purchaseOrder.supplier?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Default Profit Margin</Label>
              <p className="text-xs text-muted-foreground">Apply to all products</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={profitMargin}
                onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                className="w-20"
              />
              <span>%</span>
              <Button onClick={applyMargin} size="sm">Apply</Button>
            </div>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-center p-4 border rounded-lg">
                <div className="col-span-3">
                  <Label className="text-sm font-medium">{item.productName}</Label>
                  <p className="text-xs text-muted-foreground">Ordered: {item.orderedQuantity}</p>
                </div>

                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Received</Label>
                  <Input
                    type="number"
                    value={item.receivedQuantity}
                    onChange={(e) => updateItem(index, 'receivedQuantity', parseInt(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Unit Cost</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unitCost}
                    onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Selling Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.sellingPrice.toFixed(2)}
                    onChange={(e) => updateItem(index, 'sellingPrice', parseFloat(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>

                <div className="col-span-3 space-y-1">
                  <Label className="text-xs">Expiry Date</Label>
                  <Input
                    type="date"
                    value={item.expiryDate}
                    onChange={(e) => updateItem(index, 'expiryDate', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm">Total Cost</Label>
                <p className="text-lg font-bold">
                  ${items.reduce((sum, item) => sum + (item.receivedQuantity * item.unitCost), 0).toFixed(2)}
                </p>
              </div>
              <div>
                <Label className="text-sm">Selling Value</Label>
                <p className="text-lg font-bold text-green-600">
                  ${items.reduce((sum, item) => sum + (item.receivedQuantity * item.sellingPrice), 0).toFixed(2)}
                </p>
              </div>
              <div>
                <Label className="text-sm">Expected Profit</Label>
                <p className="text-lg font-bold text-blue-600">
                  ${(items.reduce((sum, item) => sum + (item.receivedQuantity * item.sellingPrice), 0) - 
                     items.reduce((sum, item) => sum + (item.receivedQuantity * item.unitCost), 0)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleReceive} disabled={loading}>
              {loading ? 'Receiving...' : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Receive Stock
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
