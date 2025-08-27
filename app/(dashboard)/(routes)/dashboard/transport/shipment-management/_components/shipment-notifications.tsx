"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Truck,
  Thermometer,
  MapPin,
  X
} from "lucide-react"
import { format, isAfter, isBefore, addHours } from "date-fns"

interface ShipmentNotificationsProps {
  shipments: any[]
}

interface Notification {
  id: string
  type: "warning" | "error" | "info" | "success"
  title: string
  message: string
  shipmentId: string
  shipmentNumber: string
  timestamp: Date
  priority: "low" | "medium" | "high" | "urgent"
}

export function ShipmentNotifications({ shipments }: ShipmentNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: Notification[] = []
      const now = new Date()

      shipments.forEach((shipment) => {
        const notificationId = `${shipment._id}-${shipment.status}`
        
        // Skip dismissed notifications
        if (dismissed.has(notificationId)) return

        // Overdue deliveries
        if (
          shipment.status === "in-transit" &&
          isAfter(now, new Date(shipment.estimatedDeliveryDate))
        ) {
          newNotifications.push({
            id: notificationId + "-overdue",
            type: "error",
            title: "Delivery Overdue",
            message: `Shipment ${shipment.shipmentNumber} is overdue for delivery`,
            shipmentId: shipment._id,
            shipmentNumber: shipment.shipmentNumber,
            timestamp: now,
            priority: "urgent"
          })
        }

        // Approaching delivery time (within 2 hours)
        if (
          shipment.status === "in-transit" &&
          isBefore(now, new Date(shipment.estimatedDeliveryDate)) &&
          isAfter(addHours(now, 2), new Date(shipment.estimatedDeliveryDate))
        ) {
          newNotifications.push({
            id: notificationId + "-approaching",
            type: "warning",
            title: "Delivery Approaching",
            message: `Shipment ${shipment.shipmentNumber} is scheduled for delivery within 2 hours`,
            shipmentId: shipment._id,
            shipmentNumber: shipment.shipmentNumber,
            timestamp: now,
            priority: "high"
          })
        }

        // Temperature alerts
        if (
          shipment.temperatureRequired &&
          shipment.currentTemperature &&
          (shipment.currentTemperature < shipment.minTemperature ||
           shipment.currentTemperature > shipment.maxTemperature)
        ) {
          newNotifications.push({
            id: notificationId + "-temperature",
            type: "error",
            title: "Temperature Alert",
            message: `Temperature out of range for shipment ${shipment.shipmentNumber}`,
            shipmentId: shipment._id,
            shipmentNumber: shipment.shipmentNumber,
            timestamp: now,
            priority: "urgent"
          })
        }

        // Delayed shipments
        if (shipment.status === "delayed") {
          newNotifications.push({
            id: notificationId + "-delayed",
            type: "warning",
            title: "Shipment Delayed",
            message: `Shipment ${shipment.shipmentNumber} has been delayed`,
            shipmentId: shipment._id,
            shipmentNumber: shipment.shipmentNumber,
            timestamp: now,
            priority: "high"
          })
        }

        // Damaged shipments
        if (shipment.status === "damaged") {
          newNotifications.push({
            id: notificationId + "-damaged",
            type: "error",
            title: "Shipment Damaged",
            message: `Shipment ${shipment.shipmentNumber} has been reported as damaged`,
            shipmentId: shipment._id,
            shipmentNumber: shipment.shipmentNumber,
            timestamp: now,
            priority: "urgent"
          })
        }

        // Successful deliveries
        if (
          shipment.status === "delivered" &&
          shipment.actualDeliveryDate &&
          isAfter(new Date(shipment.actualDeliveryDate), addHours(now, -1)) // Delivered within last hour
        ) {
          newNotifications.push({
            id: notificationId + "-delivered",
            type: "success",
            title: "Delivery Completed",
            message: `Shipment ${shipment.shipmentNumber} has been successfully delivered`,
            shipmentId: shipment._id,
            shipmentNumber: shipment.shipmentNumber,
            timestamp: new Date(shipment.actualDeliveryDate),
            priority: "medium"
          })
        }

        // Quality check required
        if (
          shipment.status === "delivered" &&
          !shipment.qualityCheck?.performed
        ) {
          newNotifications.push({
            id: notificationId + "-quality",
            type: "info",
            title: "Quality Check Required",
            message: `Quality check needed for delivered shipment ${shipment.shipmentNumber}`,
            shipmentId: shipment._id,
            shipmentNumber: shipment.shipmentNumber,
            timestamp: now,
            priority: "medium"
          })
        }

        // Location update missing (for in-transit shipments older than 4 hours)
        if (
          shipment.status === "in-transit" &&
          shipment.currentLocation &&
          isBefore(new Date(shipment.currentLocation.timestamp), addHours(now, -4))
        ) {
          newNotifications.push({
            id: notificationId + "-location",
            type: "warning",
            title: "Location Update Missing",
            message: `No recent location update for shipment ${shipment.shipmentNumber}`,
            shipmentId: shipment._id,
            shipmentNumber: shipment.shipmentNumber,
            timestamp: now,
            priority: "medium"
          })
        }
      })

      // Sort by priority and timestamp
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      newNotifications.sort((a, b) => {
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        return b.timestamp.getTime() - a.timestamp.getTime()
      })

      setNotifications(newNotifications)
    }

    generateNotifications()
    
    // Refresh notifications every minute
    const interval = setInterval(generateNotifications, 60000)
    return () => clearInterval(interval)
  }, [shipments, dismissed])

  const dismissNotification = (notificationId: string) => {
    setDismissed(prev => new Set([...prev, notificationId]))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "warning":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "info":
      default:
        return <Bell className="h-4 w-4 text-blue-600" />
    }
  }

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "success":
        return "bg-green-100 text-green-800 border-green-200"
      case "info":
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-blue-500 text-white"
      case "low":
      default:
        return "bg-gray-500 text-white"
    }
  }

  const activeNotifications = notifications.filter(n => !dismissed.has(n.id))
  const urgentCount = activeNotifications.filter(n => n.priority === "urgent").length
  const highCount = activeNotifications.filter(n => n.priority === "high").length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {activeNotifications.length > 0 && (
              <Badge variant="secondary">
                {activeNotifications.length}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {urgentCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {urgentCount} Urgent
              </Badge>
            )}
            {highCount > 0 && (
              <Badge className="bg-orange-500 text-white">
                {highCount} High
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active notifications</p>
            <p className="text-sm">All shipments are running smoothly</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {activeNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${getNotificationBadgeColor(notification.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">
                            {notification.title}
                          </h4>
                          <Badge 
                            className={`text-xs ${getPriorityBadgeColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{format(notification.timestamp, "MMM dd, HH:mm")}</span>
                          <span>•</span>
                          <span className="font-mono">
                            {notification.shipmentNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notification.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}