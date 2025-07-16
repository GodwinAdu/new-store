"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export const columns: ColumnDef<IRole>[] = [
    {
        accessorKey: "fullName",
        header: "Full Name",
        cell: ({ row }) => {
            const name = row.original.fullName;
            return (
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarImage src="" alt={name} />
                        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p>{name}</p>
                </div>
            );
        }
    },
    {
        accessorKey: "email",
        header: "Email Address",
    },
    {
        accessorKey: "phone",
        header: "Phone Number",
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />
    },
];
