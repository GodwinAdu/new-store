"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign,
  Calendar,
  MapPin,
  Thermometer,
  Shield
} from "lucide-react"

interface ShipmentAnalyticsProps {
  shipments: any[]
}

export function ShipmentAnalytics({ shipments }: ShipmentAnalyticsProps) {
  // Calculate analytics
  const totalShipments = shipments.length
  const deliveredShipments = shipments.filter(s => s.status === "delivered").length
  const inTransitShipments = shipments.filter(s => s.status === "in-transit").length
  const delayedShipments = shipments.filter(s => s.status === "delayed" || s.status === "damaged").length
  
  const totalValue = shipments.reduce((sum, s) => sum + (s.totalValue || 0), 0)
  const averageValue = totalShipments > 0 ? totalValue / totalShipments : 0
  
  const temperatureControlledShipments = shipments.filter(s => s.temperatureRequired).length
  const insuredShipments = shipments.filter(s => s.insured).length
  
  const deliveryRate = totalShipments > 0 ? (deliveredShipments / totalShipments) * 100 : 0
  const onTimeDeliveries = shipments.filter(s => 
    s.status === "delivered" && 
    s.actualDeliveryDate && 
    s.estimatedDeliveryDate &&
    new Date(s.actualDeliveryDate) <= new Date(s.estimatedDeliveryDate)
  ).length
  const onTimeRate = deliveredShipments > 0 ? (onTimeDeliveries / deliveredShipments) * 100 : 0
  
  // Priority distribution
  const priorityStats = {
    urgent: shipments.filter(s => s.priority === "urgent").length,
    high: shipments.filter(s => s.priority === "high").length,
    medium: shipments.filter(s => s.priority === "medium").length,
    low: shipments.filter(s => s.priority === "low").length
  }
  
  // Recent trends (last 7 days vs previous 7 days)
  const now = new Date()
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  
  const recentShipments = shipments.filter(s => new Date(s.createdAt) >= last7Days).length
  const previousShipments = shipments.filter(s => 
    new Date(s.createdAt) >= previous7Days && new Date(s.createdAt) < last7Days
  ).length
  
  const trendPercentage = previousShipments > 0 
    ? ((recentShipments - previousShipments) / previousShipments) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  Avg: ${averageValue.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-50">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivery Rate</p>
                <p className="text-2xl font-bold">{deliveryRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  {deliveredShipments} of {totalShipments}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-50">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On-Time Rate</p>
                <p className="text-2xl font-bold">{onTimeRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  {onTimeDeliveries} on time
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-50">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly Trend</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  {trendPercentage >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                  {Math.abs(trendPercentage).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  vs last week
                </p>
              </div>
              <div className="p-2 rounded-lg bg-orange-50">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Delivered ({deliveredShipments})</span>
                <span>{deliveryRate.toFixed(1)}%</span>
              </div>
              <Progress value={deliveryRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>In Transit ({inTransitShipments})</span>
                <span>{totalShipments > 0 ? ((inTransitShipments / totalShipments) * 100).toFixed(1) : 0}%</span>
              </div>
              <Progress 
                value={totalShipments > 0 ? (inTransitShipments / totalShipments) * 100 : 0} 
                className="h-2" 
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Issues ({delayedShipments})</span>
                <span>{totalShipments > 0 ? ((delayedShipments / totalShipments) * 100).toFixed(1) : 0}%</span>
              </div>
              <Progress 
                value={totalShipments > 0 ? (delayedShipments / totalShipments) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(priorityStats).map(([priority, count]) => {
                const percentage = totalShipments > 0 ? (count / totalShipments) * 100 : 0
                const colors = {
                  urgent: "bg-red-100 text-red-800",
                  high: "bg-orange-100 text-orange-800",
                  medium: "bg-blue-100 text-blue-800",
                  low: "bg-gray-100 text-gray-800"
                }
                
                return (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={colors[priority as keyof typeof colors]}>
                        {priority}
                      </Badge>
                      <span className="text-sm">{count} shipments</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Special Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Thermometer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Temperature Controlled</p>
                <p className="text-2xl font-bold">{temperatureControlledShipments}</p>
                <p className="text-xs text-muted-foreground">
                  {totalShipments > 0 ? ((temperatureControlledShipments / totalShipments) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Insured Shipments</p>
                <p className="text-2xl font-bold">{insuredShipments}</p>
                <p className="text-xs text-muted-foreground">
                  {totalShipments > 0 ? ((insuredShipments / totalShipments) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Active Routes</p>
                <p className="text-2xl font-bold">{inTransitShipments}</p>
                <p className="text-xs text-muted-foreground">
                  Currently in transit
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}