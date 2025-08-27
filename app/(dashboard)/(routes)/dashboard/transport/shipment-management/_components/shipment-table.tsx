"use client"

import { useState } from "react"
import { DataTable } from "@/components/table/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Eye, 
  MapPin, 
  CheckCircle, 
  Truck,
  Package,
  AlertTriangle,
  ClipboardCheck
} from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ShipmentDetailsDialog } from "./shipment-details-dialog"
import { TrackingDialog } from "./tracking-dialog"
import { UpdateStatusDialog } from "./update-status-dialog"
import { QualityCheckDialog } from "./quality-check-dialog"

interface ShipmentTableProps {
  shipments: any[]
}

export function ShipmentTable({ shipments }: ShipmentTableProps) {
  const [selectedShipment, setSelectedShipment] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showTracking, setShowTracking] = useState(false)
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [showQualityCheck, setShowQualityCheck] = useState(false)

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "outline" as const, icon: Package },
      "in-transit": { variant: "secondary" as const, icon: Truck },
      delivered: { variant: "default" as const, icon: CheckCircle },
      cancelled: { variant: "destructive" as const, icon: AlertTriangle },
      delayed: { variant: "destructive" as const, icon: AlertTriangle },
      damaged: { variant: "destructive" as const, icon: AlertTriangle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace("-", " ")}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority as keyof typeof priorityColors]}`}>
        {priority}
      </span>
    )
  }

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "shipmentNumber",
      header: "Shipment #",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("shipmentNumber")}</div>
      )
    },
    {
      accessorKey: "trackingNumber",
      header: "Tracking #",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("trackingNumber")}</div>
      )
    },
    {
      id: "route",
      header: "Route",
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{row.original.originWarehouse?.name}</div>
          <div className="text-muted-foreground">↓</div>
          <div>{row.original.destinationWarehouse?.name}</div>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status"))
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => getPriorityBadge(row.getValue("priority"))
    },
    {
      accessorKey: "scheduledPickupDate",
      header: "Pickup Date",
      cell: ({ row }) => (
        <div className="text-sm">
          {format(new Date(row.getValue("scheduledPickupDate")), "MMM dd, yyyy")}
        </div>
      )
    },
    {
      accessorKey: "estimatedDeliveryDate",
      header: "Est. Delivery",
      cell: ({ row }) => (
        <div className="text-sm">
          {format(new Date(row.getValue("estimatedDeliveryDate")), "MMM dd, yyyy")}
        </div>
      )
    },
    {
      accessorKey: "totalValue",
      header: "Value",
      cell: ({ row }) => (
        <div className="font-medium">
          ${row.getValue<number>("totalValue").toLocaleString()}
        </div>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedShipment(row.original)
                setShowDetails(true)
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedShipment(row.original)
                setShowTracking(true)
              }}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Track Shipment
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedShipment(row.original)
                setShowStatusUpdate(true)
              }}
            >
              <Truck className="mr-2 h-4 w-4" />
              Update Status
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedShipment(row.original)
                setShowQualityCheck(true)
              }}
            >
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Quality Check
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={shipments}
        searchKey="shipmentNumber"
        filterKey="status"
        filterOptions={[
          { label: "All", value: "" },
          { label: "Pending", value: "pending" },
          { label: "In Transit", value: "in-transit" },
          { label: "Delivered", value: "delivered" },
          { label: "Delayed", value: "delayed" }
        ]}
      />

      {selectedShipment && (
        <>
          <ShipmentDetailsDialog
            shipment={selectedShipment}
            open={showDetails}
            onOpenChange={setShowDetails}
          />
          <TrackingDialog
            shipment={selectedShipment}
            open={showTracking}
            onOpenChange={setShowTracking}
          />
          <UpdateStatusDialog
            shipment={selectedShipment}
            open={showStatusUpdate}
            onOpenChange={setShowStatusUpdate}
          />
          <QualityCheckDialog
            shipment={selectedShipment}
            open={showQualityCheck}
            onOpenChange={setShowQualityCheck}
          />
        </>
      )}
    </>
  )
}