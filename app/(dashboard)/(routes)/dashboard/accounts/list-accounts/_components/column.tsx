"use client"

import { ColumnDef } from "@tanstack/react-table"


export const columns: ColumnDef<IAccount>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "balance",
        header: "Balance",
    },
    {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
            <span
                className={`px-2 py-1 rounded text-sm font-medium ${
                    row.original.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
            >
                {row.original.active ? "Active" : "Inactive"}
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
        // cell: ({ row }) => <CellAction data={row.original} />
    },
];
