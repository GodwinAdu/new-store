"use client";

import { useContext, useEffect, useState } from "react";
import { Copy, Edit, Eye, Loader2, MoreHorizontal, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";
import { deleteBrand } from "@/lib/actions/brand.actions";
import { playErrorSound, playSuccessSound } from "@/lib/audio";
import { toast } from "@/hooks/use-toast";
import { DeleteDialog } from "@/components/commons/DeleteDialog";
import useClientRole from "@/hooks/use-client-role";




interface CellActionProps {
    data: IAccount;
}

export const CellAction: React.FC<CellActionProps> = ({
    data,
}) => {
    const router = useRouter();
    const params = useParams();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const { isLoading, role } = useClientRole()


    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            await deleteBrand(id);
            playSuccessSound()
            router.refresh();
            toast({
                title: "Deleted successfully",
                description: "You've delete User successfully",
                variant: "success",
            });
        } catch {
            playErrorSound()
            toast({
                title: "Something Went Wrong",
                description: "Please try again later",
                variant: "destructive",
            });
        } finally {
            setOpen(false);
            setLoading(false);
        }
    };

    return (
        <>
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
                        <>
                            <DropdownMenuItem className="text-center items-center flex justify-center">
                                <Loader2 className="animate-spin h-4 w-4" />
                            </DropdownMenuItem>
                        </>
                    ) : (
                        <>
                            {role?.editBrand && (
                                <Link
                                    href={`/${params.storeId}/dashboard/${params.branchId}/products/brands/${data?._id}`}
                                >
                                    <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" /> Update
                                    </DropdownMenuItem>
                                </Link>
                            )}

                            {role?.deleteBrand && (
                                <DropdownMenuItem
                                    onClick={(e) => { e.preventDefault(); setDeleteDialogOpen(true); }}
                                >
                                    <Trash className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            )}

                        </>
                    )}


                </DropdownMenuContent>
            </DropdownMenu>
            {isDeleteDialogOpen && (
                <DeleteDialog
                    id={data?._id}
                    isDeleteDialogOpen={isDeleteDialogOpen}
                    title="Are you sure you want to delete Brand?"
                    description="This action cannot be undone. Are you sure you want to proceed?"
                    onCancel={() => setDeleteDialogOpen(false)}
                    onContinue={handleDelete}
                />
            )}
        </>
    );
};
