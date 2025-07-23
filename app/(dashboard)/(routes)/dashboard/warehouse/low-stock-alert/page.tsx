"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Search, Settings, Bell, Package, ShoppingCart, Edit } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

const lowStockItems = [
  {
    id: "SKU-002",
    name: "Chicken Breast",
    category: "Fresh Poultry",
    warehouse: "Cold Storage",
    currentStock: 15,
    minStock: 25,
    maxStock: 200,
    unitCost: 12.0,
    supplier: "Poultry Express",
    lastRestocked: "2024-01-10",
    daysLow: 3,
    priority: "High",
    autoReorder: true,
    reorderPoint: 25,
    reorderQuantity: 100,
  },
  {
    id: "SKU-006",
    name: "Chicken Wings",
    category: "Fresh Poultry",
    warehouse: "Warehouse B",
    currentStock: 8,
    minStock: 20,
    maxStock: 150,
    unitCost: 7.25,
    supplier: "Fresh Farms Ltd",
    lastRestocked: "2024-01-08",
    daysLow: 5,
    priority: "Critical",
    autoReorder: false,
    reorderPoint: 20,
    reorderQuantity: 75,
  },
  {
    id: "SKU-007",
    name: "Chicken Drumsticks",
    category: "Fresh Poultry",
    warehouse: "Warehouse A",
    currentStock: 22,
    minStock: 30,
    maxStock: 250,
    unitCost: 8.0,
    supplier: "Quality Chicken Co",
    lastRestocked: "2024-01-12",
    daysLow: 1,
    priority: "Medium",
    autoReorder: true,
    reorderPoint: 30,
    reorderQuantity: 120,
  },
]

const alertSettings = [
  {
    id: "email-alerts",
    name: "Email Notifications",
    description: "Send email alerts when stock falls below minimum",
    enabled: true,
  },
  {
    id: "sms-alerts",
    name: "SMS Notifications",
    description: "Send SMS alerts for critical stock levels",
    enabled: false,
  },
  {
    id: "dashboard-alerts",
    name: "Dashboard Alerts",
    description: "Show alerts on main dashboard",
    enabled: true,
  },
  {
    id: "auto-reorder",
    name: "Auto Reorder",
    description: "Automatically create purchase orders for low stock items",
    enabled: false,
  },
]

export default function LowStockAlert() {
  const [selectedTab, setSelectedTab] = useState("alerts")

  const criticalItems = lowStockItems.filter((item) => item.priority === "Critical").length
  const highPriorityItems = lowStockItems.filter((item) => item.priority === "High").length
  const totalValue = lowStockItems.reduce((sum, item) => sum + item.currentStock * item.unitCost, 0)

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
                <BreadcrumbPage>Low Stock Alert</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Low Stock Alerts</h1>
            <p className="text-muted-foreground">Monitor and manage inventory items below minimum levels</p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Alert Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Alert Settings</DialogTitle>
                  <DialogDescription>Configure low stock alert preferences</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {alertSettings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">{setting.name}</div>
                        <div className="text-xs text-muted-foreground">{setting.description}</div>
                      </div>
                      <Switch checked={setting.enabled} />
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Button>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Create Purchase Orders
            </Button>
          </div>
        </div>

        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalItems}</div>
              <p className="text-xs text-muted-foreground">Immediate attention required</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{highPriorityItems}</div>
              <p className="text-xs text-muted-foreground">Reorder soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Low Stock Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockItems.length}</div>
              <p className="text-xs text-muted-foreground">Items below minimum</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Value at Risk</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Current stock value</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
            <TabsTrigger value="reorder">Reorder Points</TabsTrigger>
            <TabsTrigger value="history">Alert History</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Low Stock Items</CardTitle>
                    <CardDescription>Items currently below minimum stock levels</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search items..." className="pl-8 w-64" />
                    </div>
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min/Max</TableHead>
                      <TableHead>Days Low</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Auto Reorder</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>{item.warehouse}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.currentStock}</span>
                            <AlertTriangle
                              className={`h-4 w-4 ${item.priority === "Critical"
                                  ? "text-red-600"
                                  : item.priority === "High"
                                    ? "text-yellow-600"
                                    : "text-orange-600"
                                }`}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.minStock} / {item.maxStock}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.daysLow} days</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.priority === "Critical"
                                ? "destructive"
                                : item.priority === "High"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {item.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.supplier}</TableCell>
                        <TableCell>
                          <Badge variant={item.autoReorder ? "default" : "outline"}>
                            {item.autoReorder ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Bell className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reorder" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reorder Point Management</CardTitle>
                <CardDescription>Configure automatic reorder points and quantities</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Reorder Point</TableHead>
                      <TableHead>Reorder Quantity</TableHead>
                      <TableHead>Lead Time</TableHead>
                      <TableHead>Auto Reorder</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>{item.currentStock}</TableCell>
                        <TableCell>
                          <Input type="number" value={item.reorderPoint} className="w-20" onChange={() => { }} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={item.reorderQuantity} className="w-20" onChange={() => { }} />
                        </TableCell>
                        <TableCell>
                          <Select>
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Days" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 day</SelectItem>
                              <SelectItem value="2">2 days</SelectItem>
                              <SelectItem value="3">3 days</SelectItem>
                              <SelectItem value="7">1 week</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Switch checked={item.autoReorder} />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alert History</CardTitle>
                <CardDescription>Recent low stock alerts and actions taken</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      date: "2024-01-15 09:30",
                      product: "Chicken Breast",
                      action: "Alert Generated",
                      status: "Active",
                      user: "System",
                    },
                    {
                      date: "2024-01-14 14:20",
                      product: "Chicken Wings",
                      action: "Purchase Order Created",
                      status: "Resolved",
                      user: "John Smith",
                    },
                    {
                      date: "2024-01-14 11:15",
                      product: "Chicken Wings",
                      action: "Alert Generated",
                      status: "Resolved",
                      user: "System",
                    },
                    {
                      date: "2024-01-13 16:45",
                      product: "Chicken Drumsticks",
                      action: "Stock Adjusted",
                      status: "Resolved",
                      user: "Sarah Wilson",
                    },
                  ].map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{alert.product}</p>
                        <p className="text-sm text-muted-foreground">{alert.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.date} • {alert.user}
                        </p>
                      </div>
                      <Badge variant={alert.status === "Active" ? "destructive" : "default"}>{alert.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
