"use client"

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, FileText, Check, X, Eye, TrendingUp, TrendingDown } from "lucide-react"
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
import { useState } from "react"

const adjustmentHistory = [
  {
    id: "ADJ-001",
    date: "2024-01-15",
    product: "Chicken Breast",
    sku: "SKU-002",
    warehouse: "Cold Storage",
    type: "Increase",
    quantity: 50,
    reason: "Stock Count Correction",
    user: "John Smith",
    status: "Approved",
    approvedBy: "Manager",
    notes: "Physical count showed 65 units, system showed 15",
  },
  {
    id: "ADJ-002",
    date: "2024-01-14",
    product: "Chicken Wings",
    sku: "SKU-006",
    warehouse: "Warehouse B",
    type: "Decrease",
    quantity: 12,
    reason: "Damaged Goods",
    user: "Sarah Wilson",
    status: "Pending",
    approvedBy: null,
    notes: "Damaged during transport, not suitable for sale",
  },
  {
    id: "ADJ-003",
    date: "2024-01-13",
    product: "Whole Chicken",
    sku: "SKU-001",
    warehouse: "Warehouse A",
    type: "Increase",
    quantity: 25,
    reason: "Supplier Bonus",
    user: "Mike Johnson",
    status: "Approved",
    approvedBy: "Manager",
    notes: "Supplier provided extra units as promotion",
  },
  {
    id: "ADJ-004",
    date: "2024-01-12",
    product: "Chicken Thighs",
    sku: "SKU-003",
    warehouse: "Cold Storage",
    type: "Decrease",
    quantity: 8,
    reason: "Expired Products",
    user: "Tom Brown",
    status: "Rejected",
    approvedBy: "Manager",
    notes: "Expiry date verification failed",
  },
]

const adjustmentReasons = [
  "Stock Count Correction",
  "Damaged Goods",
  "Expired Products",
  "Theft/Loss",
  "Supplier Bonus",
  "Quality Issues",
  "System Error",
  "Transfer Error",
  "Other",
]

export default function StockAdjustment() {
  const [selectedTab, setSelectedTab] = useState("new")

  const pendingAdjustments = adjustmentHistory.filter((adj) => adj.status === "Pending").length
  const totalAdjustments = adjustmentHistory.length
  const approvedAdjustments = adjustmentHistory.filter((adj) => adj.status === "Approved").length

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
                <BreadcrumbPage>Stock Adjustment</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Stock Adjustment</h1>
            <p className="text-muted-foreground">Adjust inventory levels and track stock changes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Adjustment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Stock Adjustment</DialogTitle>
                  <DialogDescription>Adjust inventory levels for products</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="current-stock">Current Stock</Label>
                      <Input id="current-stock" value="15" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adjustment-type">Adjustment Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="increase">Increase</SelectItem>
                          <SelectItem value="decrease">Decrease</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" type="number" placeholder="0" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {adjustmentReasons.map((reason) => (
                          <SelectItem key={reason} value={reason.toLowerCase().replace(/\s+/g, "-")}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Additional details about the adjustment..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference Document</Label>
                    <Input id="reference" placeholder="Document number or reference" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Create Adjustment</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <FileText className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingAdjustments}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Adjustments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAdjustments}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <Check className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedAdjustments}</div>
              <p className="text-xs text-muted-foreground">Successfully processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Value Impact</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">$1,250</div>
              <p className="text-xs text-muted-foreground">Net adjustment value</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="new">New Adjustment</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="history">Adjustment History</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stock Adjustment</CardTitle>
                <CardDescription>Quickly adjust stock levels for multiple products</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="warehouse-select">Warehouse</Label>
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
                    <div className="space-y-2">
                      <Label htmlFor="adjustment-reason">Reason</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {adjustmentReasons.map((reason) => (
                            <SelectItem key={reason} value={reason.toLowerCase().replace(/\s+/g, "-")}>
                              {reason}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reference-doc">Reference Document</Label>
                      <Input id="reference-doc" placeholder="Document number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adjustment-notes">Notes</Label>
                      <Textarea id="adjustment-notes" placeholder="Additional details..." />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Products to Adjust</h3>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Adjustment</TableHead>
                        <TableHead>New Stock</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Select>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="chicken-breast">Chicken Breast</SelectItem>
                              <SelectItem value="chicken-wings">Chicken Wings</SelectItem>
                              <SelectItem value="whole-chicken">Whole Chicken</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">15</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select>
                              <SelectTrigger className="w-20">
                                <SelectValue placeholder="+" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="increase">+</SelectItem>
                                <SelectItem value="decrease">-</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input type="number" placeholder="0" className="w-20" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">15</span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">Save as Draft</Button>
                  <Button>Submit for Approval</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Stock adjustments awaiting manager approval</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Adjustment ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustmentHistory
                      .filter((adj) => adj.status === "Pending")
                      .map((adjustment) => (
                        <TableRow key={adjustment.id}>
                          <TableCell className="font-medium">{adjustment.id}</TableCell>
                          <TableCell>{adjustment.date}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{adjustment.product}</div>
                              <div className="text-sm text-muted-foreground">{adjustment.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell>{adjustment.warehouse}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {adjustment.type === "Increase" ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <span>{adjustment.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{adjustment.quantity}</TableCell>
                          <TableCell>{adjustment.reason}</TableCell>
                          <TableCell>{adjustment.user}</TableCell>
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
                    <CardTitle>Adjustment History</CardTitle>
                    <CardDescription>Complete history of stock adjustments</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search adjustments..." className="pl-8 w-64" />
                    </div>
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
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
                      <TableHead>Adjustment ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustmentHistory.map((adjustment) => (
                      <TableRow key={adjustment.id}>
                        <TableCell className="font-medium">{adjustment.id}</TableCell>
                        <TableCell>{adjustment.date}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{adjustment.product}</div>
                            <div className="text-sm text-muted-foreground">{adjustment.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>{adjustment.warehouse}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {adjustment.type === "Increase" ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span>{adjustment.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{adjustment.quantity}</TableCell>
                        <TableCell>{adjustment.reason}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              adjustment.status === "Approved"
                                ? "default"
                                : adjustment.status === "Pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {adjustment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{adjustment.user}</TableCell>
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

          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Adjustment Summary</CardTitle>
                  <CardDescription>Monthly adjustment statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Adjustments</span>
                      <span className="text-sm font-medium">{totalAdjustments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Approved</span>
                      <span className="text-sm font-medium text-green-600">{approvedAdjustments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pending</span>
                      <span className="text-sm font-medium text-yellow-600">{pendingAdjustments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Rejected</span>
                      <span className="text-sm font-medium text-red-600">
                        {adjustmentHistory.filter((adj) => adj.status === "Rejected").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Adjustment Reasons</CardTitle>
                  <CardDescription>Most common reasons for adjustments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { reason: "Stock Count Correction", count: 8 },
                      { reason: "Damaged Goods", count: 5 },
                      { reason: "Expired Products", count: 3 },
                      { reason: "Supplier Bonus", count: 2 },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.reason}</span>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
