"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft, Search, Plus, Eye, Check, X, Truck, Package } from "lucide-react"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"

const transferHistory = [
    {
        id: "TRF-001",
        date: "2024-01-15",
        product: "Chicken Breast",
        sku: "SKU-002",
        fromWarehouse: "Warehouse A",
        toWarehouse: "Cold Storage",
        quantity: 50,
        status: "In Transit",
        requestedBy: "John Smith",
        approvedBy: "Manager",
        transferDate: "2024-01-15",
        expectedArrival: "2024-01-15 16:00",
        actualArrival: null,
        reason: "Stock Rebalancing",
        notes: "Moving excess stock to cold storage",
        progress: 75,
    },
    {
        id: "TRF-002",
        date: "2024-01-14",
        product: "Whole Chicken",
        sku: "SKU-001",
        fromWarehouse: "Cold Storage",
        toWarehouse: "Warehouse B",
        quantity: 30,
        status: "Completed",
        requestedBy: "Sarah Wilson",
        approvedBy: "Manager",
        transferDate: "2024-01-14",
        expectedArrival: "2024-01-14 14:00",
        actualArrival: "2024-01-14 13:45",
        reason: "Customer Demand",
        notes: "High demand at Warehouse B location",
        progress: 100,
    },
    {
        id: "TRF-003",
        date: "2024-01-13",
        product: "Chicken Wings",
        sku: "SKU-006",
        fromWarehouse: "Warehouse A",
        toWarehouse: "Warehouse B",
        quantity: 25,
        status: "Pending",
        requestedBy: "Mike Johnson",
        approvedBy: null,
        transferDate: null,
        expectedArrival: null,
        actualArrival: null,
        reason: "Stock Rebalancing",
        notes: "Balancing inventory across locations",
        progress: 0,
    },
    {
        id: "TRF-004",
        date: "2024-01-12",
        product: "Chicken Thighs",
        sku: "SKU-003",
        fromWarehouse: "Warehouse B",
        toWarehouse: "Cold Storage",
        quantity: 40,
        status: "Cancelled",
        requestedBy: "Tom Brown",
        approvedBy: "Manager",
        transferDate: null,
        expectedArrival: null,
        actualArrival: null,
        reason: "Quality Issues",
        notes: "Transfer cancelled due to quality concerns",
        progress: 0,
    },
]

const warehouses = [
    { id: "warehouse-a", name: "Warehouse A", location: "Main Storage", capacity: "85%" },
    { id: "warehouse-b", name: "Warehouse B", location: "Secondary", capacity: "62%" },
    { id: "cold-storage", name: "Cold Storage", location: "Refrigerated", capacity: "45%" },
]

export default function StockTransfer() {
    const [selectedTab, setSelectedTab] = useState("active")

    const activeTransfers = transferHistory.filter((t) => t.status === "In Transit").length
    const pendingTransfers = transferHistory.filter((t) => t.status === "Pending").length
    const completedTransfers = transferHistory.filter((t) => t.status === "Completed").length

    return (
      

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Stock Transfer</h1>
                        <p className="text-muted-foreground">Transfer inventory between warehouses and track movements</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            Bulk Transfer
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Transfer
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create Stock Transfer</DialogTitle>
                                    <DialogDescription>Transfer inventory between warehouses</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="from-warehouse">From Warehouse</Label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select source warehouse" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {warehouses.map((warehouse) => (
                                                        <SelectItem key={warehouse.id} value={warehouse.id}>
                                                            {warehouse.name} - {warehouse.location}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="to-warehouse">To Warehouse</Label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select destination warehouse" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {warehouses.map((warehouse) => (
                                                        <SelectItem key={warehouse.id} value={warehouse.id}>
                                                            {warehouse.name} - {warehouse.location}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="product">Product</Label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select product" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="whole-chicken">Whole Chicken</SelectItem>
                                                    <SelectItem value="chicken-breast">Chicken Breast</SelectItem>
                                                    <SelectItem value="chicken-thighs">Chicken Thighs</SelectItem>
                                                    <SelectItem value="chicken-wings">Chicken Wings</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="available-stock">Available Stock</Label>
                                            <Input id="available-stock" value="245" disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="transfer-quantity">Transfer Quantity</Label>
                                            <Input id="transfer-quantity" type="number" placeholder="0" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="reason">Transfer Reason</Label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select reason" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="stock-rebalancing">Stock Rebalancing</SelectItem>
                                                    <SelectItem value="customer-demand">Customer Demand</SelectItem>
                                                    <SelectItem value="warehouse-maintenance">Warehouse Maintenance</SelectItem>
                                                    <SelectItem value="quality-issues">Quality Issues</SelectItem>
                                                    <SelectItem value="expiry-management">Expiry Management</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="priority">Priority</Label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="urgent">Urgent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="expected-date">Expected Transfer Date</Label>
                                        <Input id="expected-date" type="datetime-local" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea id="notes" placeholder="Additional details about the transfer..." />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline">Save as Draft</Button>
                                    <Button>Create Transfer</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Transfers</CardTitle>
                            <Truck className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{activeTransfers}</div>
                            <p className="text-xs text-muted-foreground">Currently in transit</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                            <Package className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{pendingTransfers}</div>
                            <p className="text-xs text-muted-foreground">Awaiting approval</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <Check className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{completedTransfers}</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
                            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{transferHistory.length}</div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {warehouses.map((warehouse) => (
                        <Card key={warehouse.id}>
                            <CardHeader>
                                <CardTitle className="text-base">{warehouse.name}</CardTitle>
                                <CardDescription>{warehouse.location}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Capacity</span>
                                        <span>{warehouse.capacity}</span>
                                    </div>
                                    <Progress value={Number.parseInt(warehouse.capacity)} className="h-2" />
                                    <div className="text-xs text-muted-foreground">
                                        {transferHistory.filter((t) => t.fromWarehouse === warehouse.name).length} outgoing transfers
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="active">Active Transfers</TabsTrigger>
                        <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                        <TabsTrigger value="history">Transfer History</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Transfers</CardTitle>
                                <CardDescription>Transfers currently in progress</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {transferHistory
                                        .filter((transfer) => transfer.status === "In Transit")
                                        .map((transfer) => (
                                            <div key={transfer.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium">{transfer.id}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {transfer.product} • {transfer.quantity} units
                                                    </p>
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <ArrowRightLeft className="h-3 w-3 mr-1" />
                                                        {transfer.fromWarehouse} → {transfer.toWarehouse}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={transfer.progress} className="w-32 h-2" />
                                                        <span className="text-xs">{transfer.progress}%</span>
                                                    </div>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <Badge variant="secondary">In Transit</Badge>
                                                    <p className="text-xs text-muted-foreground">
                                                        ETA: {transfer.expectedArrival?.split(" ")[1]}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pending" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending Approvals</CardTitle>
                                <CardDescription>Transfer requests awaiting approval</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Transfer ID</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>From → To</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Requested By</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transferHistory
                                            .filter((transfer) => transfer.status === "Pending")
                                            .map((transfer) => (
                                                <TableRow key={transfer.id}>
                                                    <TableCell className="font-medium">{transfer.id}</TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium">{transfer.product}</div>
                                                            <div className="text-sm text-muted-foreground">{transfer.sku}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm">{transfer.fromWarehouse}</span>
                                                            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">{transfer.toWarehouse}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{transfer.quantity}</TableCell>
                                                    <TableCell>{transfer.reason}</TableCell>
                                                    <TableCell>{transfer.requestedBy}</TableCell>
                                                    <TableCell>{transfer.date}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm">
                                                                <Check className="h-4 w-4 text-green-600" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm">
                                                                <X className="h-4 w-4 text-red-600" />
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

                    <TabsContent value="history" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Transfer History</CardTitle>
                                        <CardDescription>Complete history of stock transfers</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Search transfers..." className="pl-8 w-64" />
                                        </div>
                                        <Select>
                                            <SelectTrigger className="w-32">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="in-transit">In Transit</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Transfer ID</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>From → To</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Requested By</TableHead>
                                            <TableHead>Completion</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transferHistory.map((transfer) => (
                                            <TableRow key={transfer.id}>
                                                <TableCell className="font-medium">{transfer.id}</TableCell>
                                                <TableCell>{transfer.date}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-medium">{transfer.product}</div>
                                                        <div className="text-sm text-muted-foreground">{transfer.sku}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">{transfer.fromWarehouse}</span>
                                                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{transfer.toWarehouse}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">{transfer.quantity}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            transfer.status === "Completed"
                                                                ? "default"
                                                                : transfer.status === "In Transit"
                                                                    ? "secondary"
                                                                    : transfer.status === "Pending"
                                                                        ? "outline"
                                                                        : "destructive"
                                                        }
                                                    >
                                                        {transfer.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{transfer.requestedBy}</TableCell>
                                                <TableCell>{transfer.actualArrival || transfer.expectedArrival || "N/A"}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Transfer Volume</CardTitle>
                                    <CardDescription>Monthly transfer statistics</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-3xl font-bold">{transferHistory.length}</div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Completed</span>
                                                <span>{completedTransfers}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>In Transit</span>
                                                <span>{activeTransfers}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Pending</span>
                                                <span>{pendingTransfers}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Top Transfer Routes</CardTitle>
                                    <CardDescription>Most common transfer paths</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {[
                                            { route: "Warehouse A → Cold Storage", count: 8 },
                                            { route: "Cold Storage → Warehouse B", count: 5 },
                                            { route: "Warehouse B → Warehouse A", count: 3 },
                                        ].map((route, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <span className="text-sm">{route.route}</span>
                                                <span className="text-sm font-medium">{route.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Transfer Efficiency</CardTitle>
                                    <CardDescription>Performance metrics</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="text-2xl font-bold">94%</div>
                                            <div className="text-sm text-muted-foreground">On-time completion rate</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-2xl font-bold">2.3h</div>
                                            <div className="text-sm text-muted-foreground">Average transfer time</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
    )
}
