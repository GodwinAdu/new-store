"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Package, 
  Truck, 
  MapPin, 
  Calendar, 
  DollarSign,
  Thermometer,
  Shield,
  User,
  Phone,
  FileText
} from "lucide-react"
import { format } from "date-fns"

interface ShipmentDetailsDialogProps {
  shipment: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShipmentDetailsDialog({ 
  shipment, 
  open, 
  onOpenChange 
}: ShipmentDetailsDialogProps) {
  if (!shipment) return null

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      "in-transit": "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      delayed: "bg-orange-100 text-orange-800",
      damaged: "bg-red-100 text-red-800"
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Shipment Details - {shipment.shipmentNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4" />
                  <span className="font-medium">Status</span>
                </div>
                <Badge className={getStatusColor(shipment.status)}>
                  {shipment.status.replace("-", " ")}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Priority</span>
                </div>
                <Badge className={getPriorityColor(shipment.priority)}>
                  {shipment.priority}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">Total Value</span>
                </div>
                <div className="text-lg font-bold">
                  ${shipment.totalValue?.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Route Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Route Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Origin</h4>
                  <div className="space-y-1">
                    <div className="font-medium">{shipment.originWarehouse?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {shipment.originWarehouse?.location}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Destination</h4>
                  <div className="space-y-1">
                    <div className="font-medium">{shipment.destinationWarehouse?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {shipment.destinationWarehouse?.location}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transport & Driver Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Transport & Driver
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="h-4 w-4" />
                    <span className="font-medium">Vehicle</span>
                  </div>
                  <div>{shipment.transportId?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {shipment.transportId?.vehicleNumber}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Driver</span>
                  </div>
                  <div>{shipment.driverName}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">Contact</span>
                  </div>
                  <div>{shipment.driverContact}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="font-medium">Scheduled Pickup</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(shipment.scheduledPickupDate), "PPP p")}
                    </div>
                  </div>
                  {shipment.actualPickupDate && (
                    <div>
                      <div className="font-medium">Actual Pickup</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(shipment.actualPickupDate), "PPP p")}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium">Estimated Delivery</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(shipment.estimatedDeliveryDate), "PPP p")}
                    </div>
                  </div>
                  {shipment.actualDeliveryDate && (
                    <div>
                      <div className="font-medium">Actual Delivery</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(shipment.actualDeliveryDate), "PPP p")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Shipment Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shipment.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.productId?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        SKU: {item.productId?.sku} | Condition: {item.condition}
                      </div>
                      {item.batchNumber && (
                        <div className="text-sm text-muted-foreground">
                          Batch: {item.batchNumber}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">Qty: {item.quantity}</div>
                      <div className="text-sm text-muted-foreground">
                        ${item.unitPrice} each
                      </div>
                      <div className="font-medium">
                        Total: ${item.totalValue?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Special Requirements */}
          {(shipment.temperatureRequired || shipment.insured) && (
            <Card>
              <CardHeader>
                <CardTitle>Special Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shipment.temperatureRequired && (
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <Thermometer className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Temperature Control</div>
                        <div className="text-sm text-muted-foreground">
                          {shipment.minTemperature}°C - {shipment.maxTemperature}°C
                        </div>
                      </div>
                    </div>
                  )}
                  {shipment.insured && (
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <Shield className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Insured</div>
                        <div className="text-sm text-muted-foreground">
                          Value: ${shipment.insuranceValue?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quality Check */}
          {shipment.qualityCheck?.performed && (
            <Card>
              <CardHeader>
                <CardTitle>Quality Check</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Performed by:</span>
                    <span className="font-medium">{shipment.qualityCheck.performedBy?.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Date:</span>
                    <span>{format(new Date(shipment.qualityCheck.performedAt), "PPP p")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Status:</span>
                    <Badge variant={shipment.qualityCheck.approved ? "default" : "destructive"}>
                      {shipment.qualityCheck.approved ? "Approved" : "Rejected"}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Results:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {shipment.qualityCheck.results}
                    </p>
                  </div>
                  {shipment.qualityCheck.issues?.length > 0 && (
                    <div>
                      <span className="font-medium">Issues:</span>
                      <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                        {shipment.qualityCheck.issues.map((issue: string, index: number) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Location */}
          {shipment.currentLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Current Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>{shipment.currentLocation.address}</div>
                  {shipment.currentLocation.latitude && shipment.currentLocation.longitude && (
                    <div className="text-sm text-muted-foreground">
                      Coordinates: {shipment.currentLocation.latitude}, {shipment.currentLocation.longitude}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Last updated: {format(new Date(shipment.currentLocation.timestamp), "PPP p")}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tracking Number */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">Tracking Number</div>
                  <div className="font-mono text-lg">{shipment.trackingNumber}</div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigator.clipboard.writeText(shipment.trackingNumber)}
                >
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}