"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Truck,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { format } from "date-fns"
import { updateShipmentLocation } from "@/lib/actions/shipment.actions"
import { toast } from "sonner"

interface TrackingDialogProps {
  shipment: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TrackingDialog({ 
  shipment, 
  open, 
  onOpenChange 
}: TrackingDialogProps) {
  const [loading, setLoading] = useState(false)
  const [locationData, setLocationData] = useState({
    latitude: "",
    longitude: "",
    address: "",
    notes: ""
  })

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }))
          setLoading(false)
          
          // Reverse geocoding would go here in a real app
          setLocationData(prev => ({
            ...prev,
            address: `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`
          }))
        },
        (error) => {
          console.error("Error getting location:", error)
          toast.error("Failed to get current location")
          setLoading(false)
        }
      )
    } else {
      toast.error("Geolocation is not supported by this browser")
    }
  }

  const updateLocation = async () => {
    try {
      setLoading(true)
      
      await updateShipmentLocation(shipment._id, {
        latitude: parseFloat(locationData.latitude) || undefined,
        longitude: parseFloat(locationData.longitude) || undefined,
        address: locationData.address,
        notes: locationData.notes
      })
      
      toast.success("Location updated successfully")
      setLocationData({ latitude: "", longitude: "", address: "", notes: "" })
    } catch (error: any) {
      toast.error(error.message || "Failed to update location")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in-transit":
        return <Truck className="h-4 w-4 text-blue-600" />
      case "delayed":
      case "damaged":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  if (!shipment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Track Shipment - {shipment.trackingNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(shipment.status)}
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="font-medium mb-1">Status</div>
                  <Badge variant={shipment.status === "delivered" ? "default" : "secondary"}>
                    {shipment.status.replace("-", " ")}
                  </Badge>
                </div>
                <div>
                  <div className="font-medium mb-1">Route</div>
                  <div className="text-sm">
                    {shipment.originWarehouse?.name} → {shipment.destinationWarehouse?.name}
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">ETA</div>
                  <div className="text-sm">
                    {format(new Date(shipment.estimatedDeliveryDate), "MMM dd, yyyy HH:mm")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Location */}
          {shipment.currentLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Current Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium">Address</div>
                    <div className="text-sm text-muted-foreground">
                      {shipment.currentLocation.address}
                    </div>
                  </div>
                  {shipment.currentLocation.latitude && shipment.currentLocation.longitude && (
                    <div>
                      <div className="font-medium">Coordinates</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {shipment.currentLocation.latitude}, {shipment.currentLocation.longitude}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">Last Updated</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(shipment.currentLocation.timestamp), "PPP p")}
                    </div>
                  </div>
                  {shipment.currentLocation.notes && (
                    <div>
                      <div className="font-medium">Notes</div>
                      <div className="text-sm text-muted-foreground">
                        {shipment.currentLocation.notes}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location History */}
          {shipment.locationHistory && shipment.locationHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Location History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipment.locationHistory
                    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((location: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="p-1 rounded-full bg-blue-100">
                        <MapPin className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{location.address}</div>
                        {location.latitude && location.longitude && (
                          <div className="text-sm text-muted-foreground font-mono">
                            {location.latitude}, {location.longitude}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(location.timestamp), "PPP p")}
                        </div>
                        {location.notes && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {location.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Update Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Update Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={getCurrentLocation}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Get Current Location
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Latitude</label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Enter latitude"
                    value={locationData.latitude}
                    onChange={(e) => setLocationData(prev => ({ ...prev, latitude: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Longitude</label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="Enter longitude"
                    value={locationData.longitude}
                    onChange={(e) => setLocationData(prev => ({ ...prev, longitude: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Address</label>
                <Input
                  placeholder="Enter current address"
                  value={locationData.address}
                  onChange={(e) => setLocationData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Additional notes about the location..."
                  value={locationData.notes}
                  onChange={(e) => setLocationData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <Button 
                onClick={updateLocation}
                disabled={loading || !locationData.address}
                className="w-full"
              >
                {loading ? "Updating..." : "Update Location"}
              </Button>
            </CardContent>
          </Card>

          {/* Map Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Map View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p>Map integration would be displayed here</p>
                  <p className="text-sm">
                    (Google Maps, Mapbox, or similar service)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}