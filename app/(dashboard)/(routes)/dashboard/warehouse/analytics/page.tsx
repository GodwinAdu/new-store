"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWarehouseStore } from "@/lib/store/warehouse-store"
import { fetchAllWarehouses } from "@/lib/actions/warehouse.actions"
import AnalyticsDashboard from "../_components/analytics-dashboard"

export default function WarehouseAnalyticsPage() {
  const router = useRouter()
  const { selectedWarehouseId, setSelectedWarehouseId } = useWarehouseStore()
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null)
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWarehouses()
  }, [])

  const fetchWarehouses = async () => {
    try {
      const warehouseData = await fetchAllWarehouses()
      setWarehouses(warehouseData)
      
      // Set first warehouse as default if none selected
      if (!selectedWarehouseId && warehouseData.length > 0) {
        const firstWarehouse = warehouseData[0]
        setSelectedWarehouseId(firstWarehouse._id)
        setSelectedWarehouse(firstWarehouse)
      } else if (selectedWarehouseId) {
        const warehouse = warehouseData.find(w => w._id === selectedWarehouseId)
        if (warehouse) setSelectedWarehouse(warehouse)
      }
    } catch (error) {
      console.error('Failed to fetch warehouses:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Warehouse Analytics</h1>
            <p className="text-muted-foreground">Advanced inventory insights and performance metrics</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Warehouse Analytics
            </h1>
            <p className="text-muted-foreground">Advanced inventory insights and performance metrics</p>
          </div>
        </div>
        
        {/* Warehouse Selector */}
        <div className="flex items-center gap-4">
          <Select
            value={selectedWarehouseId || ""}
            onValueChange={(value) => {
              const warehouse = warehouses.find(w => w._id === value)
              if (warehouse) {
                setSelectedWarehouseId(value)
                setSelectedWarehouse(warehouse)
              }
            }}
          >
            <SelectTrigger className="w-64">
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
      </div>

      {/* Analytics Dashboard */}
      {selectedWarehouse ? (
        <AnalyticsDashboard warehouseId={selectedWarehouse._id} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Warehouse Selected</CardTitle>
            <CardDescription>Please select a warehouse to view analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Choose a warehouse from the dropdown above to start viewing detailed analytics and insights.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}