"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { createDepartment, updateDepartment } from "@/lib/actions/department.actions";
import { useEffect } from "react";
import { DepartmentColumn } from "./column";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional()
});

interface DepartmentModalProps {
    open?: boolean;
    onClose?: () => void;
    initialData?: DepartmentColumn;
}

export function DepartmentModal({ open, onClose, initialData }: DepartmentModalProps) {
    const router = useRouter();
    const isEdit = !!initialData;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name,
                description: initialData.description,
            });
        }
    }, [initialData, form]);

    const { isSubmitting } = form.formState;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (isEdit) {
                await updateDepartment(initialData.id, values);
                toast.success("Department updated successfully");
            } else {
                await createDepartment(values);
                toast.success("Department created successfully");
            }
            form.reset();
            onClose?.();
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
        }
    }

    const dialogContent = (
        <DialogContent className="sm:max-w-[425px] w-[96%]">
            <DialogHeader>
                <DialogTitle>{isEdit ? "Edit Department" : "Create New Department"}</DialogTitle>
                <DialogDescription>
                    {isEdit ? "Update department information" : "Create a new department"}
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Sales Department" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Department description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button disabled={isSubmitting} type="submit" className="w-full">
                            {isSubmitting ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update" : "Create")}
                        </Button>
                    </form>
                </Form>
            </div>
        </DialogContent>
    );

    if (isEdit) {
        return (
            <Dialog open={open} onOpenChange={onClose}>
                {dialogContent}
            </Dialog>
        );
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="h-7 gap-1" size="sm">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add Department
                    </span>
                </Button>
            </DialogTrigger>
            {dialogContent}
        </Dialog>
    );
}
