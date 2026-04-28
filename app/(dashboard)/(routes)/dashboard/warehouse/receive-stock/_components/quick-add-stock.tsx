"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Zap, Scan, Check } from "lucide-react"
import { toast } from "sonner"
import { quickAddStock, findProductByBarcode, scanAndAddStock } from "@/lib/actions/advanced-stock.actions"

interface QuickAddStockProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouses: any[]
  products: any[]
  onSuccess?: () => void
}

export default function QuickAddStock({ open, onOpenChange, warehouses, products, onSuccess }: QuickAddStockProps) {
  const [mode, setMode] = useState<'select' | 'scan'>('select')
  const [loading, setLoading] = useState(false)
  const [barcode, setBarcode] = useState('')
  const [scannedProduct, setScannedProduct] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    warehouseId: '',
    productId: '',
    quantity: 1,
    useDefaults: true
  })

  // Auto-focus barcode input when in scan mode
  useEffect(() => {
    if (mode === 'scan' && open) {
      const input = document.getElementById('barcode-input')
      input?.focus()
    }
  }, [mode, open])

  const handleBarcodeChange = async (value: string) => {
    setBarcode(value)
    
    // Auto-search when barcode length is sufficient
    if (value.length >= 8) {
      try {
        const product = await findProductByBarcode(value)
        if (product) {
          setScannedProduct(product)
          setFormData(prev => ({ ...prev, productId: product._id }))
          toast.success(`Product found: ${product.name}`)
        } else {
          setScannedProduct(null)
          toast.error('Product not found')
        }
      } catch (error) {
        console.error('Barcode search error:', error)
      }
    }
  }

  const handleQuickAdd = async () => {
    if (!formData.warehouseId || !formData.productId || formData.quantity <= 0) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      setLoading(true)
      
      if (mode === 'scan' && barcode) {
        await scanAndAddStock({
          barcode,
          warehouseId: formData.warehouseId,
          quantity: formData.quantity
        })
      } else {
        await quickAddStock({
          warehouseId: formData.warehouseId,
          productId: formData.productId,
          quantity: formData.quantity
        })
      }
      
      toast.success('Stock added successfully!')
      onOpenChange(false)
      onSuccess?.()
      
      // Reset form
      setFormData({ warehouseId: '', productId: '', quantity: 1, useDefaults: true })
      setBarcode('')
      setScannedProduct(null)
    } catch (error) {
      toast.error('Failed to add stock')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const selectedProduct = products.find(p => p._id === formData.productId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Add Stock
          </DialogTitle>
          <DialogDescription>
            Add stock in seconds using smart defaults or barcode scanning
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode Selection */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'select' ? 'default' : 'outline'}
              onClick={() => setMode('select')}
              className="flex-1"
            >
              Select Product
            </Button>
            <Button
              variant={mode === 'scan' ? 'default' : 'outline'}
              onClick={() => setMode('scan')}
              className="flex-1"
            >
              <Scan className="h-4 w-4 mr-2" />
              Scan Barcode
            </Button>
          </div>

          {/* Barcode Scan Mode */}
          {mode === 'scan' && (
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
              <div className="space-y-2">
                <Label>Barcode</Label>
                <Input
                  id="barcode-input"
                  value={barcode}
                  onChange={(e) => handleBarcodeChange(e.target.value)}
                  placeholder="Scan or enter barcode..."
                  className="font-mono text-lg"
                  autoFocus
                />
              </div>
              
              {scannedProduct && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-green-900">{scannedProduct.name}</p>
                      <p className="text-sm text-green-700">SKU: {scannedProduct.sku}</p>
                    </div>
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline">Cost: ${scannedProduct.defaultCost?.toFixed(2) || '0.00'}</Badge>
                    <Badge variant="outline">Margin: {scannedProduct.defaultMargin || 30}%</Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Product Selection Mode */}
          {mode === 'select' && (
            <div className="space-y-2">
              <Label>Product *</Label>
              <Select value={formData.productId} onValueChange={(value) => setFormData(prev => ({ ...prev, productId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name} {product.sku && `(${product.sku})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Smart Defaults Display */}
          {selectedProduct && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <Label className="text-sm font-semibold">Smart Defaults</Label>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Default Cost</p>
                  <p className="font-semibold">${selectedProduct.defaultCost?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Profit Margin</p>
                  <p className="font-semibold">{selectedProduct.defaultMargin || 30}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Selling Price</p>
                  <p className="font-semibold text-green-600">
                    ${((selectedProduct.defaultCost || 0) * (1 + (selectedProduct.defaultMargin || 30) / 100)).toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ✓ These defaults will be used automatically
              </p>
            </div>
          )}

          {/* Warehouse and Quantity */}
          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                min="1"
                placeholder="Enter quantity"
              />
            </div>
          </div>

          {/* Summary */}
          {selectedProduct && formData.quantity > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Cost</p>
                  <p className="font-bold">
                    ${((selectedProduct.defaultCost || 0) * formData.quantity).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Value</p>
                  <p className="font-bold text-green-600">
                    ${(((selectedProduct.defaultCost || 0) * (1 + (selectedProduct.defaultMargin || 30) / 100)) * formData.quantity).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expected Profit</p>
                  <p className="font-bold text-blue-600">
                    ${(((selectedProduct.defaultCost || 0) * (selectedProduct.defaultMargin || 30) / 100) * formData.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleQuickAdd} disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Quick Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
