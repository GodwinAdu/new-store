import Heading from "@/components/commons/Header";
import { Separator } from "@/components/ui/separator";
import { ExpensesCategoriesModal } from "./_components/expense-category-modal";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const page = async () => {

    return (
        <>
            <div className="flex justify-between items-center px-3">
                <Heading title="Manage Expenses" />
                <div className="flex gap-5 items-center">
                    <ExpensesCategoriesModal />
                    <Link href='expenses/create' className={cn(buttonVariants({ size: "sm" }),'h-7 gap-1')}>
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Add Expenses
                        </span>
                    </Link>
                </div>
            </div>
            <Separator />
            <div className="py-4"></div>
        </>
    )
}

export default page
