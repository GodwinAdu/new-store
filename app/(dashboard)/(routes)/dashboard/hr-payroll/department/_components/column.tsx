"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action";
import { format } from "date-fns";

export type DepartmentColumn = {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export const columns: ColumnDef<DepartmentColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
];
