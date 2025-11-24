"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Package, Search, Edit, Save, X, DollarSign, Trash2 } from "lucide-react"
import { getWarehouseStock } from "@/lib/actions/warehouse.actions"
import { toast } from "sonner"

interface StockOverviewProps {
  warehouseId: string
}

export default function StockOverview({ warehouseId }: StockOverviewProps) {
  const [stock, setStock] = useState<any[]>([])
  const [filteredStock, setFilteredStock] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [batchPrices, setBatchPrices] = useState<any[]>([])
  const [bulkPriceMode, setBulkPriceMode] = useState(false)
  const [bulkPrice, setBulkPrice] = useState(0)
  const [priceUpdateMode, setPriceUpdateMode] = useState<'individual' | 'bulk'>('individual')
  const [deletingProduct, setDeletingProduct] = useState<any>(null)

  useEffect(() => {
    if (warehouseId) {
      fetchStock()
    }
  }, [warehouseId])

  useEffect(() => {
    const filtered = stock.filter(item =>
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredStock(filtered)
  }, [stock, searchTerm])

  const fetchStock = async () => {
    setLoading(true)
    try {
      const stockData = await getWarehouseStock(warehouseId)
      setStock(stockData)
    } catch (error) {
      console.error('Failed to fetch stock:', error)
    } finally {
      setLoading(false)
    }
  }

  const openPriceEditor = (item: any) => {
    setEditingProduct(item)
    setBatchPrices(item.batches.map((batch: any) => ({
      ...batch,
      newSellingPrice: batch.sellingPrice,
      profitMargin: ((batch.sellingPrice - batch.unitCost) / batch.unitCost * 100)
    })))
    setBulkPrice(item.averageSellingPrice || 0)
  }

  const updateBatchPrice = (index: number, field: string, value: number) => {
    const updatedPrices = [...batchPrices]
    const batch = { ...updatedPrices[index] }
    
    if (field === 'newSellingPrice') {
      batch.newSellingPrice = Math.max(batch.unitCost * 1.01, value) // Minimum 1% profit
      batch.profitMargin = ((batch.newSellingPrice - batch.unitCost) / batch.unitCost * 100)
    } else if (field === 'profitMargin') {
      batch.profitMargin = Math.max(1, value) // Minimum 1% margin
      batch.newSellingPrice = batch.unitCost * (1 + batch.profitMargin / 100)
    }
    
    updatedPrices[index] = batch
    setBatchPrices(updatedPrices)
  }

  const applyBulkPrice = () => {
    const updatedPrices = batchPrices.map(batch => ({
      ...batch,
      newSellingPrice: Math.max(batch.unitCost * 1.01, bulkPrice),
      profitMargin: ((bulkPrice - batch.unitCost) / batch.unitCost * 100)
    }))
    setBatchPrices(updatedPrices)
  }

  const savePriceChanges = async () => {
    try {
      const { updateBatchPrices } = await import('@/lib/actions/warehouse.actions')
      
      const batchUpdates = batchPrices.map(batch => ({
        batchId: batch._id,
        newSellingPrice: batch.newSellingPrice,
        expiryDate: batch.expiryDate
      }))
      
      await updateBatchPrices(batchUpdates)
      toast.success('Prices updated successfully')
      setEditingProduct(null)
      fetchStock() // Refresh stock data
    } catch (error) {
      toast.error('Failed to update prices')
      console.error('Error updating prices:', error)
    }
  }

  const deleteProductStock = async (productId: string) => {
    try {
      const { deleteProductFromWarehouse } = await import('@/lib/actions/warehouse.actions')
      await deleteProductFromWarehouse(warehouseId, productId)
      toast.success('Product stock deleted successfully')
      setDeletingProduct(null)
      fetchStock() // Refresh stock data
    } catch (error) {
      toast.error('Failed to delete product stock')
      console.error('Error deleting product:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Overview</CardTitle>
          <CardDescription>Loading stock information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Stock Overview</CardTitle>
        <CardDescription>Current inventory levels for this warehouse</CardDescription>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredStock.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No stock found</p>
            <p className="text-sm">Items will appear here when received</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStock.map((item) => (
              <div key={item.product._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4">
                <div className="space-y-1 flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  {item.product.sku && (
                    <p className="text-sm text-muted-foreground font-mono">{item.product.sku}</p>
                  )}
                  <Badge variant="outline">{item.product.category}</Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="text-left sm:text-right space-y-1">
                    <div className="text-lg font-bold">{item.totalQuantity} units</div>
                    <div className="text-sm font-semibold text-green-600">
                      ₵{item.averageSellingPrice?.toFixed(2)} each
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.batches.length} batch{item.batches.length !== 1 ? 'es' : ''}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openPriceEditor(item)}
                      className="flex items-center gap-2 flex-1 sm:flex-none"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sm:inline">Edit Price</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeletingProduct(item)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    {/* Price Editor Dialog */}
    <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
      <DialogContent className="w-[98vw] md:max-w-4xl h-[95vh] max-h-[90vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Edit Selling Prices - {editingProduct?.product.name}
          </DialogTitle>
          <DialogDescription>
            Adjust selling prices for individual batches or apply bulk pricing
          </DialogDescription>
        </DialogHeader>
        
        {editingProduct && (
          <div className="space-y-6">
            {/* Product Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Product</Label>
                <p className="font-semibold">{editingProduct.product.name}</p>
                <p className="text-sm text-muted-foreground">{editingProduct.product.sku}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Total Stock</Label>
                <p className="text-xl font-bold text-blue-600">{editingProduct.totalQuantity} units</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Current Avg Price</Label>
                <p className="text-xl font-bold text-green-600">₵{editingProduct.averageSellingPrice?.toFixed(2)}</p>
              </div>
            </div>

            {/* Pricing Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg">
              <Label className="text-sm font-medium">Pricing Mode:</Label>
              <div className="flex gap-2">
                <Button
                  variant={priceUpdateMode === 'individual' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriceUpdateMode('individual')}
                >
                  Individual Batches
                </Button>
                <Button
                  variant={priceUpdateMode === 'bulk' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriceUpdateMode('bulk')}
                >
                  Bulk Pricing
                </Button>
              </div>
            </div>

            {/* Bulk Pricing Controls */}
            {priceUpdateMode === 'bulk' && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <Label className="text-sm font-medium">Set Price for All Batches:</Label>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm">₵</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={bulkPrice}
                      onChange={(e) => setBulkPrice(parseFloat(e.target.value) || 0)}
                      className="pl-8 w-32"
                      placeholder="0.00"
                    />
                  </div>
                  <Button onClick={applyBulkPrice} size="sm">
                    Apply to All
                  </Button>
                </div>
              </div>
            )}

            {/* Batch Pricing Table */}
            <div className="border rounded-lg overflow-hidden">
              {/* Desktop Table Header */}
              <div className="hidden md:grid bg-muted/30 p-3 grid-cols-7 gap-4 text-sm font-medium">
                <div>Batch Number</div>
                <div>Quantity</div>
                <div>Unit Cost</div>
                <div>Current Price</div>
                <div>New Price</div>
                <div>Profit Margin</div>
                <div>Expiry Date</div>
              </div>
              
              <div className="divide-y">
                {batchPrices.map((batch, index) => {
                  const totalValue = batch.remaining * batch.newSellingPrice
                  const profit = (batch.newSellingPrice - batch.unitCost) * batch.remaining
                  
                  return (
                    <div key={batch._id}>
                      {/* Desktop Layout */}
                      <div className="hidden md:grid p-3 grid-cols-7 gap-4 items-center">
                        <div className="text-sm font-mono">{batch.batchNumber}</div>
                        <div className="text-sm font-medium">{batch.remaining} units</div>
                        <div className="text-sm text-blue-600">₵{batch.unitCost?.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">₵{batch.sellingPrice?.toFixed(2)}</div>
                        
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs">₵</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={batch.newSellingPrice?.toFixed(2)}
                            onChange={(e) => updateBatchPrice(index, 'newSellingPrice', parseFloat(e.target.value) || 0)}
                            className="h-8 text-sm pl-6 font-semibold text-green-600"
                            disabled={priceUpdateMode === 'bulk'}
                          />
                        </div>
                        
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.1"
                            value={batch.profitMargin?.toFixed(1)}
                            onChange={(e) => updateBatchPrice(index, 'profitMargin', parseFloat(e.target.value) || 0)}
                            className="h-8 text-sm"
                            disabled={priceUpdateMode === 'bulk'}
                          />
                          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs">%</span>
                        </div>
                        
                        <div>
                          <Input
                            type="date"
                            value={batch.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                              const updatedPrices = [...batchPrices]
                              updatedPrices[index] = { ...updatedPrices[index], expiryDate: e.target.value ? new Date(e.target.value) : null }
                              setBatchPrices(updatedPrices)
                            }}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>

                      {/* Mobile Layout */}
                      <div className="md:hidden p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-mono text-sm font-medium">{batch.batchNumber}</div>
                            <div className="text-xs text-muted-foreground">{batch.remaining} units</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-blue-600">Cost: ₵{batch.unitCost?.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">Current: ₵{batch.sellingPrice?.toFixed(2)}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">New Price</Label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs">₵</span>
                              <Input
                                type="number"
                                step="0.01"
                                value={batch.newSellingPrice?.toFixed(2)}
                                onChange={(e) => updateBatchPrice(index, 'newSellingPrice', parseFloat(e.target.value) || 0)}
                                className="h-8 text-sm pl-6 font-semibold text-green-600"
                                disabled={priceUpdateMode === 'bulk'}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs">Profit Margin</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.1"
                                value={batch.profitMargin?.toFixed(1)}
                                onChange={(e) => updateBatchPrice(index, 'profitMargin', parseFloat(e.target.value) || 0)}
                                className="h-8 text-sm"
                                disabled={priceUpdateMode === 'bulk'}
                              />
                              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs">%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Expiry Date</Label>
                          <Input
                            type="date"
                            value={batch.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                              const updatedPrices = [...batchPrices]
                              updatedPrices[index] = { ...updatedPrices[index], expiryDate: e.target.value ? new Date(e.target.value) : null }
                              setBatchPrices(updatedPrices)
                            }}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Financial Impact Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Total Investment</Label>
                <p className="text-lg font-bold text-blue-600">
                  ₵{batchPrices.reduce((sum, batch) => sum + (batch.remaining * batch.unitCost), 0).toFixed(2)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">New Total Value</Label>
                <p className="text-lg font-bold text-green-600">
                  ₵{batchPrices.reduce((sum, batch) => sum + (batch.remaining * batch.newSellingPrice), 0).toFixed(2)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Potential Profit</Label>
                <p className="text-lg font-bold text-purple-600">
                  ₵{batchPrices.reduce((sum, batch) => sum + ((batch.newSellingPrice - batch.unitCost) * batch.remaining), 0).toFixed(2)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">New Avg Price</Label>
                <p className="text-lg font-bold">
                  ₵{(batchPrices.reduce((sum, batch) => sum + (batch.remaining * batch.newSellingPrice), 0) / 
                     batchPrices.reduce((sum, batch) => sum + batch.remaining, 0)).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingProduct(null)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={savePriceChanges} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save Price Changes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <Dialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Product Stock
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete all stock for this product from the warehouse? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        {deletingProduct && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-900">{deletingProduct.product.name}</h4>
              <p className="text-sm text-red-700">{deletingProduct.product.sku}</p>
              <p className="text-sm text-red-600 mt-2">
                <strong>{deletingProduct.totalQuantity} units</strong> across <strong>{deletingProduct.batches.length} batch{deletingProduct.batches.length !== 1 ? 'es' : ''}</strong> will be permanently removed.
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeletingProduct(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteProductStock(deletingProduct.product._id)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Stock
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}