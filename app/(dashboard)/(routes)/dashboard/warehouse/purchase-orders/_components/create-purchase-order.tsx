"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { createPurchaseOrder } from "@/lib/actions/advanced-stock.actions"

interface CreatePurchaseOrderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouses: any[]
  suppliers: any[]
  products: any[]
  onSuccess?: () => void
}

export default function CreatePurchaseOrder({ open, onOpenChange, warehouses, suppliers, products, onSuccess }: CreatePurchaseOrderProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    supplierId: '',
    warehouseId: '',
    shippingCost: 0,
    expectedDelivery: '',
    notes: ''
  })
  const [items, setItems] = useState([{ productId: '', quantity: 1, unitCost: 0 }])

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitCost: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    
    if (field === 'productId') {
      const product = products.find(p => p._id === value)
      if (product?.defaultCost) {
        updated[index].unitCost = product.defaultCost
      }
    }
    
    setItems(updated)
  }

  const handleSubmit = async () => {
    if (!formData.supplierId || !formData.warehouseId || items.length === 0) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      setLoading(true)
      await createPurchaseOrder({
        ...formData,
        items,
        expectedDelivery: formData.expectedDelivery ? new Date(formData.expectedDelivery) : undefined,
        createdBy: 'current-user-id'
      })
      
      toast.success('Purchase order created')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to create purchase order')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)
  const total = subtotal + formData.shippingCost

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>Create a new order from supplier</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Supplier *</Label>
              <Select value={formData.supplierId} onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Warehouse *</Label>
              <Select value={formData.warehouseId} onValueChange={(value) => setFormData(prev => ({ ...prev, warehouseId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse._id} value={warehouse._id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-semibold">Items</Label>
              <Button onClick={addItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                <div className="col-span-5 space-y-2">
                  <Label className="text-xs">Product</Label>
                  <Select value={item.productId} onValueChange={(value) => updateItem(index, 'productId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product._id} value={product._id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label className="text-xs">Unit Cost</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unitCost}
                    onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label className="text-xs">Total</Label>
                  <Input
                    value={(item.quantity * item.unitCost).toFixed(2)}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Shipping Cost</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.shippingCost}
                onChange={(e) => setFormData(prev => ({ ...prev, shippingCost: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Expected Delivery</Label>
              <Input
                type="date"
                value={formData.expectedDelivery}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedDelivery: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
            />
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm">Subtotal</Label>
                <p className="text-lg font-bold">${subtotal.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-sm">Shipping</Label>
                <p className="text-lg font-bold">${formData.shippingCost.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-sm">Total</Label>
                <p className="text-lg font-bold text-green-600">${total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create Purchase Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
