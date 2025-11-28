"use client"

import { CellAction } from "@/components/table/cell-action";
import { deleteVehicle } from "@/lib/actions/transport.actions";
import { ColumnDef } from "@tanstack/react-table"
import { Edit, Eye, Trash2 } from "lucide-react";

// Create the delete function
const handleDelete = async (id: string): Promise<void> => {
    try {
        await deleteVehicle(id)
        console.log("Vehicle deleted successfully")
    } catch (error) {
        console.error("Delete error:", error)
        throw error
    }
}


export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        accessorKey: "vehicleNumber",
        header: "Vehicle Number",
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
                        href: `/dashboard/transport/vehicle-management/${row.original._id}`,
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
