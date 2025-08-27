"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Minus, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createShipment } from "@/lib/actions/shipment.actions"
import { fetchAllTransport } from "@/lib/actions/transport.actions"
import { fetchAllWarehouses } from "@/lib/actions/warehouse.actions"
import { fetchAllProducts } from "@/lib/actions/product.actions"
import { toast } from "sonner"

const shipmentSchema = z.object({
  originWarehouse: z.string().min(1, "Origin warehouse is required"),
  destinationWarehouse: z.string().min(1, "Destination warehouse is required"),
  transportId: z.string().min(1, "Transport is required"),
  scheduledPickupDate: z.string().min(1, "Pickup date is required"),
  estimatedDeliveryDate: z.string().min(1, "Delivery date is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  temperatureRequired: z.boolean(),
  minTemperature: z.number().optional(),
  maxTemperature: z.number().optional(),
  insured: z.boolean(),
  insuranceValue: z.number().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Unit price must be positive"),
    batchNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    condition: z.enum(["excellent", "good", "damaged"]),
    notes: z.string().optional()
  })).min(1, "At least one item is required")
})

type ShipmentFormData = z.infer<typeof shipmentSchema>

export function CreateShipmentDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [transports, setTransports] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  const form = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      priority: "medium",
      temperatureRequired: false,
      insured: false,
      items: [{
        productId: "",
        quantity: 1,
        unitPrice: 0,
        condition: "excellent"
      }]
    }
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true)
        const [transportsData, warehousesData, productsData] = await Promise.all([
          fetchAllTransport(),
          fetchAllWarehouses(),
          fetchAllProducts()
        ])
        
        setTransports(transportsData.filter((t: any) => t.status === "available"))
        setWarehouses(warehousesData.filter((w: any) => w.isActive))
        setProducts(productsData.filter((p: any) => p.isActive))
      } catch (error) {
        console.error("Failed to load data:", error)
        toast.error("Failed to load form data")
      } finally {
        setDataLoading(false)
      }
    }
    
    if (open) {
      loadData()
    }
  }, [open])

  const addItem = () => {
    const currentItems = form.getValues("items")
    form.setValue("items", [
      ...currentItems,
      {
        productId: "",
        quantity: 1,
        unitPrice: 0,
        condition: "excellent" as const
      }
    ])
  }

  const removeItem = (index: number) => {
    const currentItems = form.getValues("items")
    if (currentItems.length > 1) {
      form.setValue("items", currentItems.filter((_, i) => i !== index))
    }
  }

  const onSubmit = async (data: ShipmentFormData) => {
    try {
      setLoading(true)
      
      const result = await createShipment(data, "/dashboard/transport/shipment-management")
      
      if (result.success) {
        toast.success(`Shipment created successfully! Tracking: ${result.trackingNumber}`)
        form.reset()
        setOpen(false)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create shipment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Package className="h-4 w-4" />
          Create Shipment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Shipment</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="originWarehouse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origin Warehouse</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select origin warehouse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dataLoading ? (
                            <SelectItem value="loading" disabled>Loading warehouses...</SelectItem>
                          ) : warehouses.length === 0 ? (
                            <SelectItem value="empty" disabled>No warehouses available</SelectItem>
                          ) : (
                            warehouses.map((warehouse) => (
                              <SelectItem key={warehouse._id} value={warehouse._id}>
                                {warehouse.name} - {warehouse.location}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destinationWarehouse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Warehouse</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination warehouse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dataLoading ? (
                            <SelectItem value="loading" disabled>Loading warehouses...</SelectItem>
                          ) : warehouses.length === 0 ? (
                            <SelectItem value="empty" disabled>No warehouses available</SelectItem>
                          ) : (
                            warehouses.map((warehouse) => (
                              <SelectItem key={warehouse._id} value={warehouse._id}>
                                {warehouse.name} - {warehouse.location}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transportId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transport Vehicle</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dataLoading ? (
                            <SelectItem value="loading" disabled>Loading transports...</SelectItem>
                          ) : transports.length === 0 ? (
                            <SelectItem value="empty" disabled>No available transports</SelectItem>
                          ) : (
                            transports.map((transport) => (
                              <SelectItem key={transport._id} value={transport._id}>
                                {transport.name} - {transport.vehicleNumber}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scheduledPickupDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Pickup Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedDeliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Delivery Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Shipment Items</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.watch("items").map((_, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Product</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {dataLoading ? (
                                <SelectItem value="loading" disabled>Loading products...</SelectItem>
                              ) : products.length === 0 ? (
                                <SelectItem value="empty" disabled>No products available</SelectItem>
                              ) : (
                                products.map((product) => (
                                  <SelectItem key={product._id} value={product._id}>
                                    {product.name} {product.sku && `(${product.sku})`}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.condition`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="damaged">Damaged</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={form.watch("items").length === 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Special Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Special Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="temperatureRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Temperature Control</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Requires temperature monitoring
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="insured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Insurance</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Add insurance coverage
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch("temperatureRequired") && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minTemperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Temperature (°C)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxTemperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Temperature (°C)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {form.watch("insured") && (
                  <FormField
                    control={form.control}
                    name="insuranceValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Value ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes or special instructions..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Shipment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}