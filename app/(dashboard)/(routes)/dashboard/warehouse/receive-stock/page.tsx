"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, Scan, Check, X, Thermometer, Calendar } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

const incomingShipments = [
  {
    id: "SH-001",
    poNumber: "PO-001",
    supplier: "Fresh Farms Ltd",
    expectedDate: "2024-01-15",
    status: "Expected",
    items: [
      {
        sku: "SKU-001",
        product: "Whole Chicken",
        expectedQty: 100,
        receivedQty: 0,
        unitPrice: 8.5,
        expiryDate: "2024-01-25",
        temperature: "2°C",
        qualityCheck: "Pending",
      },
      {
        sku: "SKU-002",
        product: "Chicken Breast",
        expectedQty: 50,
        receivedQty: 0,
        unitPrice: 12.0,
        expiryDate: "2024-01-22",
        temperature: "2°C",
        qualityCheck: "Pending",
      },
    ],
  },
  {
    id: "SH-002",
    poNumber: "PO-002",
    supplier: "Poultry Express",
    expectedDate: "2024-01-14",
    status: "Arrived",
    items: [
      {
        sku: "SKU-003",
        product: "Chicken Thighs",
        expectedQty: 75,
        receivedQty: 75,
        unitPrice: 9.75,
        expiryDate: "2024-01-24",
        temperature: "1°C",
        qualityCheck: "Passed",
      },
    ],
  },
]

const receivingHistory = [
  {
    id: "RCV-001",
    date: "2024-01-14",
    shipmentId: "SH-002",
    poNumber: "PO-002",
    supplier: "Poultry Express",
    itemsReceived: 1,
    totalQuantity: 75,
    status: "Completed",
    receivedBy: "John Smith",
    qualityStatus: "Passed",
    discrepancies: 0,
  },
  {
    id: "RCV-002",
    date: "2024-01-13",
    shipmentId: "SH-003",
    poNumber: "PO-003",
    supplier: "Quality Chicken Co",
    itemsReceived: 3,
    totalQuantity: 150,
    status: "Completed",
    receivedBy: "Sarah Wilson",
    qualityStatus: "Passed",
    discrepancies: 2,
  },
]

export default function ReceiveStock() {
  const [selectedTab, setSelectedTab] = useState("incoming")

  const expectedShipments = incomingShipments.filter((s) => s.status === "Expected").length
  const arrivedShipments = incomingShipments.filter((s) => s.status === "Arrived").length
  const totalItems = incomingShipments.reduce((sum, shipment) => sum + shipment.items.length, 0)

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
                <BreadcrumbPage>Receive Stock</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Receive Stock</h1>
            <p className="text-muted-foreground">Process incoming shipments and update inventory</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Scan className="h-4 w-4 mr-2" />
              Scan Barcode
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Package className="h-4 w-4 mr-2" />
                  Quick Receive
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Quick Receive</DialogTitle>
                  <DialogDescription>Quickly receive items without a purchase order</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Supplier</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fresh-farms">Fresh Farms Ltd</SelectItem>
                          <SelectItem value="poultry-express">Poultry Express</SelectItem>
                          <SelectItem value="quality-chicken">Quality Chicken Co</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="warehouse">Warehouse</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warehouse-a">Warehouse A</SelectItem>
                          <SelectItem value="warehouse-b">Warehouse B</SelectItem>
                          <SelectItem value="cold-storage">Cold Storage</SelectItem>
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
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit-price">Unit Price</Label>
                      <Input id="unit-price" type="number" step="0.01" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry-date">Expiry Date</Label>
                      <Input id="expiry-date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature (°C)</Label>
                      <Input id="temperature" type="number" placeholder="2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Quality notes, batch information..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Receive Items</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expected Shipments</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{expectedShipments}</div>
              <p className="text-xs text-muted-foreground">Awaiting delivery</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Arrived Today</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{arrivedShipments}</div>
              <p className="text-xs text-muted-foreground">Ready for processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items to Process</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">Total line items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Checks</CardTitle>
              <Check className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-xs text-muted-foreground">Pass rate this month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="incoming">Incoming Shipments</TabsTrigger>
            <TabsTrigger value="receiving">Receiving Process</TabsTrigger>
            <TabsTrigger value="quality">Quality Control</TabsTrigger>
            <TabsTrigger value="history">Receiving History</TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-4">
            <div className="space-y-4">
              {incomingShipments.map((shipment) => (
                <Card key={shipment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{shipment.id}</CardTitle>
                        <CardDescription>
                          {shipment.poNumber} • {shipment.supplier} • Expected: {shipment.expectedDate}
                        </CardDescription>
                      </div>
                      <Badge variant={shipment.status === "Arrived" ? "default" : "secondary"}>{shipment.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Expected Qty</TableHead>
                          <TableHead>Received Qty</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Expiry Date</TableHead>
                          <TableHead>Temperature</TableHead>
                          <TableHead>Quality</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shipment.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{item.product}</div>
                                <div className="text-sm text-muted-foreground">{item.sku}</div>
                              </div>
                            </TableCell>
                            <TableCell>{item.expectedQty}</TableCell>
                            <TableCell>
                              {shipment.status === "Arrived" ? (
                                <Input type="number" defaultValue={item.receivedQty} className="w-20" />
                              ) : (
                                item.receivedQty
                              )}
                            </TableCell>
                            <TableCell>${item.unitPrice}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {item.expiryDate}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Thermometer className="h-4 w-4 text-blue-600" />
                                {item.temperature}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.qualityCheck === "Passed"
                                    ? "default"
                                    : item.qualityCheck === "Failed"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {item.qualityCheck}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {shipment.status === "Arrived" && (
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm">
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {shipment.status === "Arrived" && (
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline">Save Progress</Button>
                        <Button>Complete Receiving</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="receiving" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Receiving Checklist</CardTitle>
                <CardDescription>Standard receiving process for all shipments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { step: "Verify shipment documentation", completed: true },
                    { step: "Check vehicle temperature logs", completed: true },
                    { step: "Inspect packaging condition", completed: false },
                    { step: "Count and verify quantities", completed: false },
                    { step: "Check product quality and freshness", completed: false },
                    { step: "Verify expiry dates", completed: false },
                    { step: "Record temperature readings", completed: false },
                    { step: "Update inventory system", completed: false },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox checked={item.completed} />
                      <span className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                        {item.step}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quality Control Standards</CardTitle>
                <CardDescription>Quality checks for chicken products</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-medium">Temperature Requirements</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Fresh Chicken</span>
                        <span className="font-medium">0°C to 4°C</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Frozen Chicken</span>
                        <span className="font-medium">-18°C or below</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium">Visual Inspection</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox />
                        <span className="text-sm">No discoloration</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox />
                        <span className="text-sm">No unusual odor</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox />
                        <span className="text-sm">Proper packaging</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox />
                        <span className="text-sm">Valid expiry dates</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Failed Quality Checks</CardTitle>
                <CardDescription>Items that failed quality inspection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      date: "2024-01-12",
                      product: "Chicken Wings",
                      supplier: "Farm Direct",
                      reason: "Temperature above 4°C",
                      action: "Rejected",
                      quantity: 25,
                    },
                    {
                      date: "2024-01-10",
                      product: "Whole Chicken",
                      supplier: "Fresh Farms Ltd",
                      reason: "Packaging damaged",
                      action: "Partial Accept",
                      quantity: 5,
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{item.product}</p>
                        <p className="text-sm text-muted-foreground">{item.supplier}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm">{item.reason}</p>
                        <Badge variant="destructive">{item.action}</Badge>
                        <p className="text-xs text-muted-foreground">{item.quantity} units</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Receiving History</CardTitle>
                    <CardDescription>Complete history of received shipments</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search history..." className="pl-8 w-64" />
                    </div>
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receive ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Shipment</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Received By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivingHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.id}</TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{record.shipmentId}</div>
                            <div className="text-sm text-muted-foreground">{record.poNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>{record.supplier}</TableCell>
                        <TableCell>{record.itemsReceived}</TableCell>
                        <TableCell className="font-medium">{record.totalQuantity}</TableCell>
                        <TableCell>
                          <Badge variant="default">{record.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={record.qualityStatus === "Passed" ? "default" : "destructive"}>
                            {record.qualityStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.receivedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
