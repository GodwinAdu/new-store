"use client"

import { CellAction } from "@/components/table/cell-action";
import { deleteProduct } from "@/lib/actions/product.actions";
import { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2 } from "lucide-react";

const handleDelete = async (id: string): Promise<void> => {
    try {
        await deleteProduct(id)
        console.log("Item deleted successfully")
    } catch (error) {
        console.error("Delete error:", error)
        throw error // Re-throw to let CellAction handle the error
    }
}

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "barcode",
        header: "Barcode",
    },
    {
        accessorKey: "sku",
        header: "Sku",
    },
    {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
            <span
                className={`px-2 py-1 rounded text-sm font-medium ${row.original.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
            >
                {row.original.isActive ? "Active" : "Inactive"}
            </span>
        ),
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
