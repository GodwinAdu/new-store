"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Package, 
  Truck, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  MapPin,
  Thermometer
} from "lucide-react"

interface ShipmentAnalytics {
  totalShipments: number
  pendingShipments: number
  inTransitShipments: number
  deliveredShipments: number
  delayedShipments: number
  recentShipments: any[]
}

interface ShipmentDashboardProps {
  analytics: ShipmentAnalytics
}

export function ShipmentDashboard({ analytics }: ShipmentDashboardProps) {
  const {
    totalShipments,
    pendingShipments,
    inTransitShipments,
    deliveredShipments,
    delayedShipments,
    recentShipments
  } = analytics

  const deliveryRate = totalShipments > 0 ? (deliveredShipments / totalShipments) * 100 : 0
  const onTimeRate = totalShipments > 0 ? ((deliveredShipments - delayedShipments) / totalShipments) * 100 : 0

  const stats = [
    {
      title: "Total Shipments",
      value: totalShipments,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Pending",
      value: pendingShipments,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "In Transit",
      value: inTransitShipments,
      icon: Truck,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Delivered",
      value: deliveredShipments,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Issues",
      value: delayedShipments,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Delivery Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Delivery Rate</span>
                <span>{deliveryRate.toFixed(1)}%</span>
              </div>
              <Progress value={deliveryRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>On-Time Rate</span>
                <span>{onTimeRate.toFixed(1)}%</span>
              </div>
              <Progress value={onTimeRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentShipments.slice(0, 4).map((shipment) => (
                <div key={shipment._id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded bg-background">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{shipment.shipmentNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {shipment.originWarehouse?.name} → {shipment.destinationWarehouse?.name}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      shipment.status === 'delivered' ? 'default' :
                      shipment.status === 'in-transit' ? 'secondary' :
                      shipment.status === 'pending' ? 'outline' : 'destructive'
                    }
                  >
                    {shipment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}