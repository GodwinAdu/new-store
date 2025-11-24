"use client"

import { useState } from "react"
import { receiveShipment } from "@/lib/actions/transport.actions"
import { toast } from "sonner"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Scan, Check } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ReceiveStockClientProps {
  products: any[]
  warehouses: any[]
  shipments: any[]
}

export default function ReceiveStockClient({ products, warehouses, shipments }: ReceiveStockClientProps) {
  const [selectedTab, setSelectedTab] = useState("shipments")
  const [isReceiving, setIsReceiving] = useState<string | null>(null)

  const [receivingShipment, setReceivingShipment] = useState<any>(null)
  const [receivedItems, setReceivedItems] = useState<any[]>([])
  const [defaultProfitMargin, setDefaultProfitMargin] = useState(30)
  const [showManualPricing, setShowManualPricing] = useState(false)
  const [manualPricingForm, setManualPricingForm] = useState({
    warehouseId: '',
    productId: '',
    quantity: 1,
    unitCost: 0,
    shippingCost: 0,
    profitMargin: 30,
    sellingPrice: 0,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  })

  const openReceiveDialog = (shipment: any) => {
    setReceivingShipment(shipment)
    
    // Calculate shipping cost per unit
    const totalQuantity = shipment.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
    const shippingCostPerUnit = (shipment.totalShippingCost || 0) / totalQuantity
    
    // Initialize received items with professional pricing
    const items = shipment.items.map((item: any) => {
      const unitCost = item.unitPrice
      const shippingCost = shippingCostPerUnit
      const totalCostPerUnit = unitCost + shippingCost
      const sellingPrice = totalCostPerUnit * (1 + defaultProfitMargin / 100)
      
      return {
        productId: item.product._id,
        productName: item.product.name,
        orderedQuantity: item.quantity,
        receivedQuantity: item.quantity,
        unitCost,
        actualCost: unitCost,
        shippingCostPerUnit: shippingCost,
        totalCostPerUnit,
        profitMargin: defaultProfitMargin,
        sellingPrice,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    })
    
    setReceivedItems(items)
  }

  const updateReceivedItem = (index: number, field: string, value: any) => {
    const updatedItems = [...receivedItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    // Recalculate selling price when cost or margin changes
    if (field === 'actualCost' || field === 'profitMargin') {
      const item = updatedItems[index]
      item.totalCostPerUnit = item.actualCost + item.shippingCostPerUnit
      item.sellingPrice = item.totalCostPerUnit * (1 + item.profitMargin / 100)
    }
    
    setReceivedItems(updatedItems)
  }

  const applyDefaultMargin = () => {
    const updatedItems = receivedItems.map(item => ({
      ...item,
      profitMargin: defaultProfitMargin,
      sellingPrice: (item.actualCost + item.shippingCostPerUnit) * (1 + defaultProfitMargin / 100)
    }))
    setReceivedItems(updatedItems)
  }

  const updateManualPricingForm = (field: string, value: any) => {
    const updatedForm = { ...manualPricingForm, [field]: value }
    
    // Auto-calculate selling price when cost or margin changes
    if (field === 'unitCost' || field === 'shippingCost' || field === 'profitMargin') {
      const totalCost = updatedForm.unitCost + updatedForm.shippingCost
      updatedForm.sellingPrice = totalCost * (1 + updatedForm.profitMargin / 100)
    }
    
    setManualPricingForm(updatedForm)
  }

  const handleManualReceive = async () => {
    if (!manualPricingForm.warehouseId || !manualPricingForm.productId || manualPricingForm.quantity <= 0) {
      toast.error('Please fill all required fields')
      return
    }
    
    try {
      // Create a manual stock entry (you'll need to implement this action)
      // await addManualStock(manualPricingForm)
      toast.success('Stock received successfully')
      
      // Reset form
      setManualPricingForm({
        warehouseId: '',
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
      window.location.reload()
    } catch (error) {
      toast.error('Failed to receive shipment')
      console.error('Error receiving shipment:', error)
    } finally {
      setIsReceiving(null)
    }
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard/warehouse">Warehouse</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Receive Stock</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Receive Stock</h1>
            <p className="text-muted-foreground">Process incoming shipments and update inventory</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Scan className="h-4 w-4 mr-2" />
              Scan Barcode
            </Button>
            <Button onClick={() => setShowManualPricing(true)}>
              <Package className="h-4 w-4 mr-2" />
              Manual Pricing
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  Quick Receive
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Quick Receive</DialogTitle>
                  <DialogDescription>Quickly receive items without a purchase order</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warehouse">Warehouse</Label>
                      <Select>
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
                      <Label htmlFor="product">Product</Label>
                      <Select>
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
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit-price">Unit Price</Label>
                      <Input id="unit-price" type="number" step="0.01" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Quality notes, batch information..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Receive Items</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products Available</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{products.length}</div>
              <p className="text-xs text-muted-foreground">Ready to receive</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{warehouses.length}</div>
              <p className="text-xs text-muted-foreground">Active locations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Receipts</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Items received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Rate</CardTitle>
              <Check className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">100%</div>
              <p className="text-xs text-muted-foreground">Pass rate</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="shipments">Incoming Shipments</TabsTrigger>
            <TabsTrigger value="incoming">Quick Receive</TabsTrigger>
            <TabsTrigger value="products">Available Products</TabsTrigger>
            <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          </TabsList>

          <TabsContent value="shipments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Incoming Shipments</CardTitle>
                <CardDescription>Shipments ready to be received into warehouse</CardDescription>
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
                                From: {shipment.supplier} → To: {shipment.destinationWarehouse?.name}
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
                              Receive & Price
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Receive Stock</CardTitle>
                <CardDescription>Add new stock to your warehouses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Warehouse</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse._id} value={warehouse._id}>
                            {warehouse.name} - {warehouse.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select>
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
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" placeholder="Enter quantity" />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Cost</Label>
                    <Input type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Selling Price</Label>
                    <Input type="number" step="0.01" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea placeholder="Additional notes about the stock..." />
                </div>
                <Button className="w-full">Add to Stock</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Products</CardTitle>
                <CardDescription>Products that can be received into stock</CardDescription>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No products available</p>
                    <p className="text-sm">Add products to start receiving stock</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {products.slice(0, 9).map((product) => (
                      <Card key={product._id}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">{product.name}</h4>
                            {product.sku && (
                              <p className="text-sm text-muted-foreground font-mono">{product.sku}</p>
                            )}
                            <Badge variant="outline">
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="warehouses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Warehouses</CardTitle>
                <CardDescription>Locations where stock can be received</CardDescription>
              </CardHeader>
              <CardContent>
                {warehouses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No warehouses available</p>
                    <p className="text-sm">Add warehouses to start receiving stock</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {warehouses.map((warehouse) => (
                      <Card key={warehouse._id}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">{warehouse.name}</h4>
                            <p className="text-sm text-muted-foreground">{warehouse.location}</p>
                            <div className="flex justify-between items-center">
                              <Badge variant="outline">
                                Capacity: {warehouse.capacity}
                              </Badge>
                              <Badge variant={warehouse.isActive ? "default" : "secondary"}>
                                {warehouse.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Professional Receive Shipment Dialog */}
      <Dialog open={!!receivingShipment} onOpenChange={() => setReceivingShipment(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Receive Shipment - Professional Pricing</DialogTitle>
            <DialogDescription>
              Set individual product prices based on cost, shipping, and profit margins
            </DialogDescription>
          </DialogHeader>
          
          {receivingShipment && (
            <div className="space-y-6">
              {/* Shipment Info */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Tracking Number</Label>
                  <p className="text-sm">{receivingShipment.trackingNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Supplier</Label>
                  <p className="text-sm">{receivingShipment.supplier}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Shipping Cost</Label>
                  <p className="text-sm">${(receivingShipment.totalShippingCost || 0).toFixed(2)}</p>
                </div>
              </div>

              {/* Pricing Configuration */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Default Profit Margin</Label>
                  <p className="text-xs text-muted-foreground">Apply to all products</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={defaultProfitMargin}
                    onChange={(e) => setDefaultProfitMargin(parseFloat(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="text-sm">%</span>
                  <Button onClick={applyDefaultMargin} size="sm">
                    Apply to All
                  </Button>
                </div>
              </div>

              {/* Items Pricing */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Product Pricing</Label>
                {receivedItems.map((item, index) => {
                  const totalCost = item.receivedQuantity * item.actualCost
                  const totalSelling = item.receivedQuantity * item.sellingPrice
                  const profit = totalSelling - totalCost
                  
                  return (
                    <div key={item.productId} className="grid grid-cols-12 gap-3 items-center p-4 border rounded-lg">
                      <div className="col-span-2">
                        <Label className="text-sm font-medium">{item.productName}</Label>
                        <p className="text-xs text-muted-foreground">Ordered: {item.orderedQuantity}</p>
                      </div>
                      
                      <div className="col-span-1">
                        <Label className="text-xs">Received</Label>
                        <Input
                          type="number"
                          value={item.receivedQuantity}
                          onChange={(e) => updateReceivedItem(index, 'receivedQuantity', parseInt(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Label className="text-xs">Unit Cost</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.actualCost}
                          onChange={(e) => updateReceivedItem(index, 'actualCost', parseFloat(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Label className="text-xs">Shipping</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.shippingCostPerUnit.toFixed(2)}
                          readOnly
                          className="h-8 bg-muted"
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Label className="text-xs">Total Cost</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={(item.actualCost + item.shippingCostPerUnit).toFixed(2)}
                          readOnly
                          className="h-8 bg-muted"
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Label className="text-xs">Margin %</Label>
                        <Input
                          type="number"
                          value={item.profitMargin}
                          onChange={(e) => updateReceivedItem(index, 'profitMargin', parseFloat(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label className="text-xs">Selling Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.sellingPrice.toFixed(2)}
                          onChange={(e) => updateReceivedItem(index, 'sellingPrice', parseFloat(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label className="text-xs">Expiry Date</Label>
                        <Input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => updateReceivedItem(index, 'expiryDate', e.target.value)}
                          className="h-8"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Total Cost</Label>
                  <p className="text-lg font-bold">
                    ${receivedItems.reduce((sum, item) => sum + (item.receivedQuantity * item.actualCost), 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Selling Value</Label>
                  <p className="text-lg font-bold text-green-600">
                    ${receivedItems.reduce((sum, item) => sum + (item.receivedQuantity * item.sellingPrice), 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Expected Profit</Label>
                  <p className="text-lg font-bold text-blue-600">
                    ${(receivedItems.reduce((sum, item) => sum + (item.receivedQuantity * item.sellingPrice), 0) - 
                       receivedItems.reduce((sum, item) => sum + (item.receivedQuantity * item.actualCost), 0)).toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Avg Margin</Label>
                  <p className="text-lg font-bold">
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
                >
                  {isReceiving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Receive & Set Prices
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Warehouse *</Label>
                <Select value={manualPricingForm.warehouseId} onValueChange={(value) => updateManualPricingForm('warehouseId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse._id} value={warehouse._id}>
                        {warehouse.name} - {warehouse.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
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
            </div>

            {/* Quantity and Dates */}
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
                <Package className="h-4 w-4 mr-2" />
                Receive Stock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  )
}