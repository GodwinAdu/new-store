"use client"

import React, { useState } from "react"
import { Edit, Loader2, MoreHorizontal } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import Link from "next/link"
import { playErrorSound, playSuccessSound } from "@/lib/audio"
import { toast } from "@/hooks/use-toast"
import { DeleteDialog } from "@/components/commons/DeleteDialog"
import useClientRole from "@/hooks/use-client-role"


interface CellActionProps {
    data: IProduct
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
    const router = useRouter()
    const params = useParams()
    const [loading, setLoading] = useState(false)
    const { isLoading, role } = useClientRole()

    const handleDelete = async (id: string) => {
        try {
            setLoading(true)

            router.refresh()
            playSuccessSound()
            toast({
                title: "Deleted successfully",
                description: "You've deleted the product successfully",
                variant: "success",
            })
        } catch (error) {
            console.error("Delete error:", error)
            playErrorSound()
            toast({
                title: "Something Went Wrong",
                description: "Please try again later",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {isLoading ? (
                    <DropdownMenuItem className="text-center items-center flex justify-center">
                        <Loader2 className="animate-spin h-4 w-4" />
                    </DropdownMenuItem>
                ) : (
                    <>
                        {role?.editExpenses && (
                            <DropdownMenuItem asChild>
                                <Link href={`/${params.storeId}/dashboard/${params.branchId}/expenses/add-expenses/${data?._id}`}>
                                    <Edit className="mr-2 h-4 w-4" /> Update
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {role?.deleteExpenses && (
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="bg-red-500 hover:bg-red-800">
                                <DeleteDialog
                                    id={data?._id}
                                    title="Are you sure you want to delete this Expenses?"
                                    description="This action cannot be undone. Are you sure you want to proceed?"
                                    onContinue={handleDelete}
                                    isLoading={loading}
                                />
                            </DropdownMenuItem>
                        )}
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

