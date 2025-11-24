"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package } from "lucide-react"
import { getLowStockItems } from "@/lib/actions/warehouse.actions"

interface LowStockAlertsProps {
  warehouseId: string
}

export default function LowStockAlerts({ warehouseId }: LowStockAlertsProps) {
  const [lowStockItems, setLowStockItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (warehouseId) {
      fetchLowStockItems()
    }
  }, [warehouseId])

  const fetchLowStockItems = async () => {
    setLoading(true)
    try {
      const items = await getLowStockItems(warehouseId, 10)
      setLowStockItems(items)
    } catch (error) {
      console.error('Failed to fetch low stock items:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Low Stock Alerts
          </CardTitle>
          <CardDescription>Loading low stock items...</CardDescription>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Low Stock Alerts
        </CardTitle>
        <CardDescription>Items that need restocking (≤10 units)</CardDescription>
      </CardHeader>
      <CardContent>
        {lowStockItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No low stock alerts</p>
            <p className="text-sm">All items are well stocked</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lowStockItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="space-y-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  {item.product.sku && (
                    <p className="text-sm text-muted-foreground font-mono">{item.product.sku}</p>
                  )}
                  <Badge variant="destructive">Low Stock</Badge>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-lg font-bold text-red-600">{item.remaining} units</div>
                  <div className="text-sm text-muted-foreground">
                    ${item.sellingPrice?.toFixed(2)} each
                  </div>
                  <Button size="sm" variant="outline">
                    Reorder
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}