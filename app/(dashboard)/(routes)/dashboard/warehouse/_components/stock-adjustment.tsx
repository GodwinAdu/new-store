"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Minus, Package } from "lucide-react"
import { adjustStock, getWarehouseStock } from "@/lib/actions/warehouse.actions"
import { toast } from "sonner"
import { useEffect } from "react"

interface StockAdjustmentProps {
  warehouseId: string
  warehouses: any[]
}

export default function StockAdjustment({ warehouseId, warehouses }: StockAdjustmentProps) {
  const [warehouseProducts, setWarehouseProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (warehouseId) {
      fetchWarehouseProducts()
    }
  }, [warehouseId])

  const fetchWarehouseProducts = async () => {
    try {
      const stockData = await getWarehouseStock(warehouseId)
      setWarehouseProducts(stockData)
    } catch (error) {
      console.error('Failed to fetch warehouse products:', error)
    }
  }

  const handleAdjustment = async () => {
    if (!selectedProduct || !quantity || !reason) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      const adjustmentValue = adjustmentType === "add" ? parseInt(quantity) : -parseInt(quantity)
      await adjustStock(warehouseId, selectedProduct, adjustmentValue, reason)
      
      toast.success(`Stock ${adjustmentType === "add" ? "added" : "removed"} successfully`)
      
      // Reset form
      setSelectedProduct("")
      setQuantity("")
      setReason("")
    } catch (error) {
      toast.error('Failed to adjust stock')
    } finally {
      setLoading(false)
    }
  }

  const currentWarehouse = warehouses.find(w => w._id === warehouseId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Stock Adjustment
        </CardTitle>
        <CardDescription>
          Add or remove stock for {currentWarehouse?.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Product</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {warehouseProducts.map((item) => (
                  <SelectItem key={item.product._id} value={item.product._id}>
                    {item.product.name} {item.product.sku && `(${item.product.sku})`} - {item.totalQuantity} available
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <Select value={adjustmentType} onValueChange={(value: "add" | "remove") => setAdjustmentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-600" />
                    Add Stock
                  </div>
                </SelectItem>
                <SelectItem value="remove">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-red-600" />
                    Remove Stock
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
          />
        </div>

        <div className="space-y-2">
          <Label>Reason</Label>
          <Textarea
            placeholder="Reason for adjustment (e.g., damaged goods, inventory count correction...)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleAdjustment} 
          disabled={loading || !selectedProduct || !quantity || !reason}
          className="w-full"
        >
          {loading ? 'Processing...' : `${adjustmentType === "add" ? "Add" : "Remove"} Stock`}
        </Button>
      </CardContent>
    </Card>
  )
}