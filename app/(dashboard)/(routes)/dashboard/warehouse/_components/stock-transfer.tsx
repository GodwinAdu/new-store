"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Package } from "lucide-react"
import { transferStock, getWarehouseStock } from "@/lib/actions/warehouse.actions"
import { toast } from "sonner"

interface StockTransferProps {
  warehouseId: string
  warehouses: any[]
}

export default function StockTransfer({ warehouseId, warehouses }: StockTransferProps) {
  const [availableStock, setAvailableStock] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [destinationWarehouse, setDestinationWarehouse] = useState("")
  const [quantity, setQuantity] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (warehouseId) {
      fetchAvailableStock()
    }
  }, [warehouseId])

  const fetchAvailableStock = async () => {
    try {
      const stock = await getWarehouseStock(warehouseId)
      setAvailableStock(stock)
    } catch (error) {
      console.error('Failed to fetch available stock:', error)
    }
  }

  const handleTransfer = async () => {
    if (!selectedProduct || !destinationWarehouse || !quantity) {
      toast.error('Please fill all fields')
      return
    }

    if (destinationWarehouse === warehouseId) {
      toast.error('Cannot transfer to the same warehouse')
      return
    }

    const selectedStock = availableStock.find(item => item.product._id === selectedProduct)
    if (!selectedStock || selectedStock.totalQuantity < parseInt(quantity)) {
      toast.error('Insufficient stock for transfer')
      return
    }

    setLoading(true)
    try {
      await transferStock(warehouseId, destinationWarehouse, selectedProduct, parseInt(quantity))
      
      toast.success('Stock transferred successfully')
      
      // Reset form and refresh stock
      setSelectedProduct("")
      setDestinationWarehouse("")
      setQuantity("")
      fetchAvailableStock()
    } catch (error) {
      toast.error('Failed to transfer stock')
    } finally {
      setLoading(false)
    }
  }

  const currentWarehouse = warehouses.find(w => w._id === warehouseId)
  const otherWarehouses = warehouses.filter(w => w._id !== warehouseId)
  const selectedStock = availableStock.find(item => item.product._id === selectedProduct)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          Stock Transfer
        </CardTitle>
        <CardDescription>
          Transfer stock from {currentWarehouse?.name} to another warehouse
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Product</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Select product to transfer" />
              </SelectTrigger>
              <SelectContent>
                {availableStock.map((item) => (
                  <SelectItem key={item.product._id} value={item.product._id}>
                    {item.product.name} ({item.totalQuantity} available)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Destination Warehouse</Label>
            <Select value={destinationWarehouse} onValueChange={setDestinationWarehouse}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {otherWarehouses.map((warehouse) => (
                  <SelectItem key={warehouse._id} value={warehouse._id}>
                    {warehouse.name} - {warehouse.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Quantity to Transfer</Label>
          <Input
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            max={selectedStock?.totalQuantity || 0}
          />
          {selectedStock && (
            <p className="text-sm text-muted-foreground">
              Available: {selectedStock.totalQuantity} units
            </p>
          )}
        </div>

        {selectedProduct && destinationWarehouse && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <strong>From:</strong> {currentWarehouse?.name}
              </div>
              <ArrowRight className="h-4 w-4" />
              <div className="text-sm">
                <strong>To:</strong> {warehouses.find(w => w._id === destinationWarehouse)?.name}
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleTransfer} 
          disabled={loading || !selectedProduct || !destinationWarehouse || !quantity}
          className="w-full"
        >
          {loading ? 'Transferring...' : 'Transfer Stock'}
        </Button>
      </CardContent>
    </Card>
  )
}