"use client"

import { CellAction } from "@/components/table/cell-action"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { deleteBrand } from "@/lib/actions/brand.actions"
import { ColumnDef } from "@tanstack/react-table"
import { AlertTriangle, CheckCircle, Clock, Edit, Trash2 } from "lucide-react"


const getStatusBadge = (status: string) => {
    const statusConfig = {
        active: { label: "Active", variant: "default" as const, icon: CheckCircle },
        inactive: { label: "Inactive", variant: "secondary" as const, icon: AlertTriangle },
        pending: { label: "Pending", variant: "default" as const, icon: Clock },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon
    return (
        <Badge variant={config.variant} className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    )
}

const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
        pending: { label: "Pending", variant: "secondary" as const },
        confirmed: { label: "Confirmed", variant: "default" as const },
        shipped: { label: "Shipped", variant: "default" as const },
        delivered: { label: "Delivered", variant: "default" as const },
        cancelled: { label: "Cancelled", variant: "destructive" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
}
const handleDelete = async (id: string): Promise<void> => {
    try {
        await deleteBrand(id)
        console.log("Item deleted successfully")
    } catch (error) {
        console.error("Delete error:", error)
        throw error // Re-throw to let CellAction handle the error
    }
}


export const columns: ColumnDef<IBrand>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage
                        src={`/placeholder.svg?height=32&width=32&text=${row.original.name.charAt(0)}`}
                    />
                    <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-medium">{row.original.name}</div>
                    <div className="text-sm text-muted-foreground">{row.original.contactPerson}</div>
                </div>
            </div>
        )
    },
    {
        accessorKey: "createdBy",
        header: "Created By",
        cell: ({ row }) => (
            <div>{row.original.createdBy?.fullName}</div>
        )
    },
    {
        id: "actions",
        cell: ({ row }) =>
            <CellAction
                data={row.original}
                onDelete={handleDelete}
                actions={[
                    {
                        label: "Edit",
                        type: "edit",
                        href: `/dashboard/products/brands/${row.original._id}`,
                        icon: <Edit className="h-4 w-4" />,
                        permissionKey: "editUser",
                    },
                    {
                        label: "Delete",
                        type: "delete",
                        icon: <Trash2 className="h-4 w-4" />,
                        permissionKey: "deleteUser",
                    },
                ]}
            />
    },
];
