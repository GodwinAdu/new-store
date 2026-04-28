"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, FileText, CheckCircle, XCircle, Package } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreatePurchaseOrder from "./create-purchase-order"
import ReceivePurchaseOrder from "./receive-purchase-order"
import { approvePurchaseOrder, cancelPurchaseOrder } from "@/lib/actions/advanced-stock.actions"
import { toast } from "sonner"

interface PurchaseOrderClientProps {
  purchaseOrders: any[]
  warehouses: any[]
  suppliers: any[]
  products: any[]
}

export default function PurchaseOrderClient({ purchaseOrders, warehouses, suppliers, products }: PurchaseOrderClientProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [receivingPO, setReceivingPO] = useState<any>(null)
  const [selectedTab, setSelectedTab] = useState("all")

  const handleApprove = async (poId: string) => {
    try {
      await approvePurchaseOrder(poId, 'current-user-id')
      toast.success('Purchase order approved')
      window.location.reload()
    } catch (error) {
      toast.error('Failed to approve')
    }
  }

  const handleCancel = async (poId: string) => {
    try {
      await cancelPurchaseOrder(poId)
      toast.success('Purchase order cancelled')
      window.location.reload()
    } catch (error) {
      toast.error('Failed to cancel')
    }
  }

  const filteredPOs = selectedTab === "all" 
    ? purchaseOrders 
    : purchaseOrders.filter(po => po.status === selectedTab)

  const stats = {
    total: purchaseOrders.length,
    draft: purchaseOrders.filter(po => po.status === 'draft').length,
    pending: purchaseOrders.filter(po => po.status === 'pending').length,
    approved: purchaseOrders.filter(po => po.status === 'approved').length,
    received: purchaseOrders.filter(po => po.status === 'received').length
  }

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
                <BreadcrumbPage>Purchase Orders</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Purchase Orders</h1>
            <p className="text-muted-foreground">Manage supplier orders and stock receiving</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create PO
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total POs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.received}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4">
            {filteredPOs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No purchase orders found</p>
                </CardContent>
              </Card>
            ) : (
              filteredPOs.map((po) => (
                <Card key={po._id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{po.orderNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          Supplier: {po.supplier?.name} • Warehouse: {po.warehouse?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(po.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          po.status === 'received' ? 'default' :
                          po.status === 'approved' ? 'secondary' :
                          po.status === 'draft' ? 'outline' : 'secondary'
                        }>
                          {po.status}
                        </Badge>
                        <p className="text-lg font-bold mt-2">${po.totalCost.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {po.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm bg-muted/50 p-2 rounded">
                          <span>{item.product?.name}</span>
                          <span>{item.quantity} × ${item.unitCost.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {po.status === 'draft' && (
                        <Button size="sm" onClick={() => handleApprove(po._id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      )}
                      {po.status === 'approved' && (
                        <Button size="sm" onClick={() => setReceivingPO(po)}>
                          <Package className="h-4 w-4 mr-2" />
                          Receive
                        </Button>
                      )}
                      {(po.status === 'draft' || po.status === 'pending') && (
                        <Button size="sm" variant="destructive" onClick={() => handleCancel(po._id)}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreatePurchaseOrder
        open={showCreate}
        onOpenChange={setShowCreate}
        warehouses={warehouses}
        suppliers={suppliers}
        products={products}
        onSuccess={() => window.location.reload()}
      />

      {receivingPO && (
        <ReceivePurchaseOrder
          open={!!receivingPO}
          onOpenChange={() => setReceivingPO(null)}
          purchaseOrder={receivingPO}
          onSuccess={() => window.location.reload()}
        />
      )}
    </SidebarInset>
  )
}
