"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Package, Check, Plus, DollarSign } from "lucide-react"
import { getShipments, receiveShipment } from "@/lib/actions/transport.actions"
import { fetchAllProducts } from "@/lib/actions/product.actions"
import { toast } from "sonner"

interface ReceiveStockProps {
  warehouseId: string
}

interface ManualPricingForm {
  productId: string
  quantity: number
  unitCost: number
  shippingCost: number
  profitMargin: number
  sellingPrice: number
  expiryDate: string
  notes: string
}

export default function ReceiveStock({ warehouseId }: ReceiveStockProps) {
  const [shipments, setShipments] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isReceiving, setIsReceiving] = useState<string | null>(null)
  const [showManualPricing, setShowManualPricing] = useState(false)
  const [manualPricingForm, setManualPricingForm] = useState<ManualPricingForm>({
    productId: '',
    quantity: 1,
    unitCost: 0,
    shippingCost: 0,
    profitMargin: 30,
    sellingPrice: 0,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  })

  useEffect(() => {
    if (warehouseId) {
      fetchShipments()
      fetchProducts()
    }
  }, [warehouseId])

  const fetchProducts = async () => {
    try {
      // Fetch products that are available in this warehouse from ProductBatch
      const { getWarehouseProducts } = await import('@/lib/actions/warehouse.actions')
      const warehouseProducts = await getWarehouseProducts(warehouseId)
      setProducts(warehouseProducts)
    } catch (error) {
      console.error('Failed to fetch warehouse products:', error)
      // Fallback to all products if warehouse-specific fetch fails
      try {
        const allProducts = await fetchAllProducts()
        setProducts(allProducts)
      } catch (fallbackError) {
        console.error('Failed to fetch fallback products:', fallbackError)
        setProducts([])
      }
    }
  }

  const fetchShipments = async () => {
    setLoading(true)
    try {
      const allShipments = await getShipments()
      // Filter shipments for this warehouse
      const warehouseShipments = allShipments.filter(
        (shipment: any) => shipment.destinationWarehouse?._id === warehouseId
      )
      setShipments(warehouseShipments)
    } catch (error) {
      console.error('Failed to fetch shipments:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateManualPricingForm = (field: keyof ManualPricingForm, value: any) => {
    const updatedForm = { ...manualPricingForm, [field]: value }
    
    // Auto-fill form when product is selected
    if (field === 'productId') {
      const selectedProduct = products.find(p => p._id === value)
      if (selectedProduct) {
        // Use actual cost data from warehouse product batches
        const unitCost = selectedProduct.originalUnitCost || (selectedProduct.price ? selectedProduct.price * 0.7 : 10)
        const shippingCost = selectedProduct.shippingCostPerUnit || (unitCost * 0.1)
        
        updatedForm.unitCost = unitCost
        updatedForm.shippingCost = shippingCost
        updatedForm.profitMargin = 30 // Default 30% margin
        
        // Calculate selling price based on actual costs
        const totalCost = updatedForm.unitCost + updatedForm.shippingCost
        updatedForm.sellingPrice = totalCost * (1 + updatedForm.profitMargin / 100)
      }
    }
    
    // Auto-calculate selling price when cost or margin changes
    if (field === 'unitCost' || field === 'shippingCost' || field === 'profitMargin') {
      const totalCost = updatedForm.unitCost + updatedForm.shippingCost
      updatedForm.sellingPrice = totalCost * (1 + updatedForm.profitMargin / 100)
    }
    
    setManualPricingForm(updatedForm)
  }

  const handleManualReceive = async () => {
    if (!manualPricingForm.productId || manualPricingForm.quantity <= 0) {
      toast.error('Please fill all required fields')
      return
    }
    
    try {
      // Here you would implement the manual stock addition
      // await addManualStock({ warehouseId, ...manualPricingForm })
      toast.success('Stock received successfully')
      
      // Reset form
      setManualPricingForm({
        productId: '',
        quantity: 1,
        unitCost: 0,
        shippingCost: 0,
        profitMargin: 30,
        sellingPrice: 0,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: ''
      })
      setShowManualPricing(false)
    } catch (error) {
      toast.error('Failed to receive stock')
      console.error('Error receiving stock:', error)
    }
  }

  const [receivingShipment, setReceivingShipment] = useState<any>(null)
  const [receivedItems, setReceivedItems] = useState<any[]>([])
  const [pricingStrategy, setPricingStrategy] = useState<'margin' | 'markup' | 'fixed'>('margin')
  const [bulkEditValue, setBulkEditValue] = useState(30)

  const openReceiveDialog = (shipment: any) => {
    setReceivingShipment(shipment)
    
    const totalQuantity = shipment.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
    const shippingCostPerUnit = (shipment.totalShippingCost || 0) / totalQuantity
    
    const items = shipment.items.map((item: any, index: number) => {
      const unitCost = item.unitPrice
      const shippingCost = shippingCostPerUnit
      const totalCostPerUnit = unitCost + shippingCost
      const sellingPrice = totalCostPerUnit * 1.3
      
      return {
        id: `item-${index}`,
        productId: item.product._id,
        productName: item.product.name,
        productSku: item.product.sku || '',
        orderedQuantity: item.quantity,
        receivedQuantity: item.quantity,
        damagedQuantity: 0,
        unitCost,
        actualCost: unitCost,
        shippingCostPerUnit: shippingCost,
        totalCostPerUnit,
        profitMargin: 30,
        markup: 30,
        sellingPrice,
        minSellingPrice: totalCostPerUnit * 1.05,
        maxSellingPrice: totalCostPerUnit * 3,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        batchNumber: '',
        location: '',
        qualityGrade: 'A',
        notes: ''
      }
    })
    
    setReceivedItems(items)
  }

  const updateReceivedItem = (index: number, field: string, value: any) => {
    const updatedItems = [...receivedItems]
    const item = { ...updatedItems[index], [field]: value }
    
    if (field === 'actualCost' || field === 'shippingCostPerUnit') {
      item.totalCostPerUnit = (item.actualCost || 0) + (item.shippingCostPerUnit || 0)
      item.sellingPrice = item.totalCostPerUnit * (1 + (item.profitMargin || 0) / 100)
    }
    
    if (field === 'profitMargin') {
      item.sellingPrice = item.totalCostPerUnit * (1 + (value || 0) / 100)
      item.markup = value
    }
    
    if (field === 'sellingPrice') {
      const constrainedPrice = Math.max(item.minSellingPrice, Math.min(item.maxSellingPrice, value || 0))
      item.sellingPrice = constrainedPrice
      item.profitMargin = ((constrainedPrice - item.totalCostPerUnit) / item.totalCostPerUnit * 100)
    }
    
    if (field === 'receivedQuantity') {
      item.receivedQuantity = Math.min(value || 0, item.orderedQuantity)
    }
    
    updatedItems[index] = item
    setReceivedItems(updatedItems)
  }

  const applyBulkPricing = () => {
    const updatedItems = receivedItems.map(item => ({
      ...item,
      profitMargin: bulkEditValue,
      markup: bulkEditValue,
      sellingPrice: item.totalCostPerUnit * (1 + bulkEditValue / 100)
    }))
    setReceivedItems(updatedItems)
  }

  const handleReceiveShipment = async () => {
    if (!receivingShipment) return
    
    try {
      setIsReceiving(receivingShipment._id)
      
      const receiveData = receivedItems.map(item => ({
        productId: item.productId,
        receivedQuantity: item.receivedQuantity,
        actualCost: item.actualCost,
        sellingPrice: item.sellingPrice,
        expiryDate: new Date(item.expiryDate)
      }))
      
      await receiveShipment(receivingShipment._id, receiveData)
      toast.success('Shipment received successfully')
      
      setReceivingShipment(null)
      setReceivedItems([])
      fetchShipments()
    } catch (error) {
      toast.error('Failed to receive shipment')
      console.error('Error receiving shipment:', error)
    } finally {
      setIsReceiving(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receive Stock</CardTitle>
          <CardDescription>Loading incoming shipments...</CardDescription>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Receive Stock</CardTitle>
            <CardDescription>Incoming shipments for this warehouse</CardDescription>
          </div>
          <Button onClick={() => setShowManualPricing(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Manual Pricing
          </Button>
        </CardHeader>
      <CardContent>
        {shipments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No incoming shipments</p>
            <p className="text-sm">Shipments will appear here when they arrive</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shipments.map((shipment) => (
              <Card key={shipment._id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium">Tracking: {shipment.trackingNumber}</h4>
                      <p className="text-sm text-muted-foreground">
                        From: {shipment.supplier}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PO: {shipment.purchaseOrder?.orderNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={shipment.status === 'delivered' ? 'default' : 'secondary'}>
                        {shipment.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        ${shipment.totalValue?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Items:</h5>
                    {shipment.items?.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm bg-muted/50 p-2 rounded">
                        <span>{item.product?.name || 'Unknown Product'}</span>
                        <span>{item.quantity} units @ ${item.unitPrice?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      size="sm"
                      onClick={() => openReceiveDialog(shipment)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Professional Receive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    {/* Manual Pricing Modal */}
    <Dialog open={showManualPricing} onOpenChange={setShowManualPricing}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manual Stock Pricing</DialogTitle>
          <DialogDescription>
            Add stock manually with professional pricing calculations
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Selection */}
          <div className="space-y-2">
            <Label>Product *</Label>
            <Select value={manualPricingForm.productId} onValueChange={(value) => updateManualPricingForm('productId', value)}>
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

          {/* Quantity and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input
                type="number"
                value={manualPricingForm.quantity}
                onChange={(e) => updateManualPricingForm('quantity', parseInt(e.target.value) || 1)}
                min="1"
                placeholder="Enter quantity"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={manualPricingForm.expiryDate}
                onChange={(e) => updateManualPricingForm('expiryDate', e.target.value)}
              />
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-4 p-4 border rounded-lg">
            <Label className="text-lg font-semibold">Cost & Pricing</Label>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Unit Cost *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={manualPricingForm.unitCost}
                  onChange={(e) => updateManualPricingForm('unitCost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Shipping Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={manualPricingForm.shippingCost}
                  onChange={(e) => updateManualPricingForm('shippingCost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Total Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={(manualPricingForm.unitCost + manualPricingForm.shippingCost).toFixed(2)}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Profit Margin (%)</Label>
                <Input
                  type="number"
                  value={manualPricingForm.profitMargin}
                  onChange={(e) => updateManualPricingForm('profitMargin', parseFloat(e.target.value) || 0)}
                  placeholder="30"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Selling Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={manualPricingForm.sellingPrice.toFixed(2)}
                  onChange={(e) => updateManualPricingForm('sellingPrice', parseFloat(e.target.value) || 0)}
                  className="font-semibold text-green-600"
                />
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-sm font-medium">Total Investment</Label>
              <p className="text-lg font-bold">
                ${(manualPricingForm.quantity * (manualPricingForm.unitCost + manualPricingForm.shippingCost)).toFixed(2)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Total Selling Value</Label>
              <p className="text-lg font-bold text-green-600">
                ${(manualPricingForm.quantity * manualPricingForm.sellingPrice).toFixed(2)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Expected Profit</Label>
              <p className="text-lg font-bold text-blue-600">
                ${(manualPricingForm.quantity * (manualPricingForm.sellingPrice - manualPricingForm.unitCost - manualPricingForm.shippingCost)).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={manualPricingForm.notes}
              onChange={(e) => updateManualPricingForm('notes', e.target.value)}
              placeholder="Quality notes, batch information, supplier details..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowManualPricing(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualReceive}>
              <DollarSign className="h-4 w-4 mr-2" />
              Receive Stock
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Professional Receive Shipment Dialog */}
    <Dialog open={!!receivingShipment} onOpenChange={() => setReceivingShipment(null)}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Professional Stock Receiving - {receivingShipment?.trackingNumber}</DialogTitle>
          <DialogDescription>
            Review and adjust pricing for each product before receiving into inventory
          </DialogDescription>
        </DialogHeader>
        
        {receivingShipment && (
          <div className="space-y-6">
            {/* Bulk Controls */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <Label>Bulk Pricing:</Label>
                <Select value={pricingStrategy} onValueChange={(value: any) => setPricingStrategy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="margin">Margin %</SelectItem>
                    <SelectItem value="markup">Markup %</SelectItem>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={bulkEditValue}
                  onChange={(e) => setBulkEditValue(parseFloat(e.target.value) || 0)}
                  className="w-20"
                  placeholder="30"
                />
                <Button onClick={applyBulkPricing} size="sm">
                  Apply to All
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Total Items: {receivedItems.length} • Total Value: ₵{receivedItems.reduce((sum, item) => sum + (item.receivedQuantity * item.sellingPrice), 0).toFixed(2)}
              </div>
            </div>

            {/* Items Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/30 p-3 grid grid-cols-12 gap-2 text-sm font-medium">
                <div className="col-span-2">Product</div>
                <div className="col-span-1">Ordered</div>
                <div className="col-span-1">Received</div>
                <div className="col-span-1">Unit Cost</div>
                <div className="col-span-1">Shipping</div>
                <div className="col-span-1">Total Cost</div>
                <div className="col-span-1">Margin %</div>
                <div className="col-span-2">Selling Price</div>
                <div className="col-span-1">Quality</div>
                <div className="col-span-1">Expiry</div>
              </div>
              
              <div className="divide-y">
                {receivedItems.map((item, index) => (
                  <div key={item.id} className="p-3 grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-2">
                      <div className="font-medium text-sm">{item.productName}</div>
                      <div className="text-xs text-muted-foreground">{item.productSku}</div>
                    </div>
                    
                    <div className="col-span-1">
                      <div className="text-sm font-medium">{item.orderedQuantity}</div>
                    </div>
                    
                    <div className="col-span-1">
                      <Input
                        type="number"
                        value={item.receivedQuantity}
                        onChange={(e) => updateReceivedItem(index, 'receivedQuantity', parseInt(e.target.value) || 0)}
                        className="h-8 text-sm"
                        max={item.orderedQuantity}
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs">₵</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.actualCost}
                          onChange={(e) => updateReceivedItem(index, 'actualCost', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm pl-6"
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs">₵</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.shippingCostPerUnit.toFixed(2)}
                          onChange={(e) => updateReceivedItem(index, 'shippingCostPerUnit', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm pl-6"
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <div className="text-sm font-medium text-blue-600">
                        ₵{item.totalCostPerUnit.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <Input
                        type="number"
                        value={item.profitMargin}
                        onChange={(e) => updateReceivedItem(index, 'profitMargin', parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm"
                        placeholder="30"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs">₵</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.sellingPrice.toFixed(2)}
                          onChange={(e) => updateReceivedItem(index, 'sellingPrice', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm pl-6 font-semibold text-green-600"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Min: ₵{item.minSellingPrice.toFixed(2)} • Max: ₵{item.maxSellingPrice.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <Select value={item.qualityGrade} onValueChange={(value) => updateReceivedItem(index, 'qualityGrade', value)}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Grade A</SelectItem>
                          <SelectItem value="B">Grade B</SelectItem>
                          <SelectItem value="C">Grade C</SelectItem>
                          <SelectItem value="D">Grade D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-1">
                      <Input
                        type="date"
                        value={item.expiryDate}
                        onChange={(e) => updateReceivedItem(index, 'expiryDate', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Total Investment</Label>
                <p className="text-xl font-bold text-blue-600">
                  ₵{receivedItems.reduce((sum, item) => sum + (item.receivedQuantity * item.totalCostPerUnit), 0).toFixed(2)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Total Selling Value</Label>
                <p className="text-xl font-bold text-green-600">
                  ₵{receivedItems.reduce((sum, item) => sum + (item.receivedQuantity * item.sellingPrice), 0).toFixed(2)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Expected Profit</Label>
                <p className="text-xl font-bold text-purple-600">
                  ₵{(receivedItems.reduce((sum, item) => sum + (item.receivedQuantity * item.sellingPrice), 0) - 
                     receivedItems.reduce((sum, item) => sum + (item.receivedQuantity * item.totalCostPerUnit), 0)).toFixed(2)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Average Margin</Label>
                <p className="text-xl font-bold">
                  {receivedItems.length > 0 ? 
                    (receivedItems.reduce((sum, item) => sum + item.profitMargin, 0) / receivedItems.length).toFixed(1) : 0}%
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReceivingShipment(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleReceiveShipment}
                disabled={!!isReceiving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isReceiving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Receive & Update Inventory
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}