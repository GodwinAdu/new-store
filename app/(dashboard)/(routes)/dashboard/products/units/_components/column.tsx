"use client"

import { CellAction } from "@/components/table/cell-action";
import { deleteUnit } from "@/lib/actions/unit.actions";
import { ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Create the delete function
const handleDelete = async (id: string): Promise<void> => {
  try {
    await deleteUnit(id)
    console.log("Item deleted successfully")
  } catch (error) {
    console.error("Delete error:", error)
    throw error // Re-throw to let CellAction handle the error
  }
}

export const columns: ColumnDef<IUnit>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "shortName",
    header: "Short Name",
    cell: ({ row }) => (
      <div>{row.original.shortName || "-"}</div>
    )
  },
  {
    accessorKey: "unitType",
    header: "Type",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.unitType}</div>
    )
  },
  {
    accessorKey: "baseUnit",
    header: "Base Unit",
    cell: ({ row }) => (
      <div>{row.original.baseUnit?.name || "-"}</div>
    )
  },
  {
    accessorKey: "conversionFactor",
    header: "Conversion",
    cell: ({ row }) => (
      <div>
        {row.original.unitType === "derived" 
          ? `1 ${row.original.name} = ${row.original.conversionFactor} ${row.original.baseUnit?.name || "units"}`
          : "Base unit"
        }
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
            href: `/dashboard/products/units/${row.original._id}`,
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
