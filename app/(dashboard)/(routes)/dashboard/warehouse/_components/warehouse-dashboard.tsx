"use client"

import { useState, useEffect } from "react"
import { useWarehouseStore } from "@/lib/store/warehouse-store"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, AlertTriangle, TrendingUp, Warehouse, BarChart3 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StockOverview from "./stock-overview"
import LowStockAlerts from "./low-stock-alerts"
import StockAdjustment from "./stock-adjustment"
import StockTransfer from "./stock-transfer"
import ReceiveStock from "./receive-stock"
import { getWarehouseStats } from "@/lib/actions/warehouse.actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface WarehouseDashboardProps {
  warehouses: any[]
}

export default function WarehouseDashboard({ warehouses }: WarehouseDashboardProps) {
  const { selectedWarehouseId, setSelectedWarehouseId } = useWarehouseStore()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouseId) {
      setSelectedWarehouseId(warehouses[0]._id)
    }
  }, [warehouses, selectedWarehouseId, setSelectedWarehouseId])

  useEffect(() => {
    if (selectedWarehouseId) {
      fetchStats()
    }
  }, [selectedWarehouseId])

  const fetchStats = async () => {
    if (!selectedWarehouseId) return
    
    try {
      const warehouseStats = await getWarehouseStats(selectedWarehouseId)
      setStats(warehouseStats)
    } catch (error) {
      console.error('Failed to fetch warehouse stats:', error)
    }
  }

  const currentWarehouse = warehouses.find(w => w._id === selectedWarehouseId)

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
              <BreadcrumbItem>
                <BreadcrumbPage>Warehouse Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Warehouse Management</h1>
            <p className="text-muted-foreground">Manage inventory across all warehouse locations</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/warehouse/analytics">
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
                <SelectTrigger className="w-[200px]">
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
        </div>

        {currentWarehouse && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                {currentWarehouse.name}
              </CardTitle>
              <CardDescription>
                {currentWarehouse.location} • Manager: {currentWarehouse.manager} • Capacity: {currentWarehouse.capacity}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {stats && (
          <div className="grid auto-rows-min gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">Unique items</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.totalQuantity}</div>
                <p className="text-xs text-muted-foreground">Units in stock</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">${stats.totalValue?.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total inventory value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.lowStockCount}</div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBatches}</div>
                <p className="text-xs text-muted-foreground">Stock batches</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Stock Overview</TabsTrigger>
            <TabsTrigger value="alerts">Low Stock Alerts</TabsTrigger>
            <TabsTrigger value="adjustment">Stock Adjustment</TabsTrigger>
            <TabsTrigger value="transfer">Stock Transfer</TabsTrigger>
            <TabsTrigger value="receive">Receive Stock</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <StockOverview warehouseId={selectedWarehouseId} />
          </TabsContent>

          <TabsContent value="alerts">
            <LowStockAlerts warehouseId={selectedWarehouseId} />
          </TabsContent>

          <TabsContent value="adjustment">
            <StockAdjustment warehouseId={selectedWarehouseId} warehouses={warehouses} />
          </TabsContent>

          <TabsContent value="transfer">
            <StockTransfer warehouseId={selectedWarehouseId} warehouses={warehouses} />
          </TabsContent>

          <TabsContent value="receive">
            <ReceiveStock warehouseId={selectedWarehouseId} />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}