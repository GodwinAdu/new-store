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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";



const formSchema = z.object({
    name: z.string().min(2, {
        message: "name must be at least 2 characters.",
    }),
    balance: z.coerce.number().min(0, {
        message: "balance must be at least 0.",
    }),
    description: z.string().optional(),
    active: z.boolean()
});

export function AccountModal() {
   
    const router = useRouter();

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            balance: 0,
            description: "",
          
            active: false,
        },
    });

    const { isSubmitting } = form.formState;

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            // await createAccount(values)
            form.reset();
            router.refresh();
            toast.success( "Created successfully",{
                description: "New brand was added successfully...",
            });
        } catch{
            toast( "Something went wrong",{
                description: "Please try again later...",
            });
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="h-7 gap-1" size="sm">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        New Account
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-[96%]">
                <DialogHeader>
                    <DialogTitle>Create Account</DialogTitle>
                    <DialogDescription>Creating a new Payment Account .</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Enter Account Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Eg. Minerals"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="balance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account Balance</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Eg. Minerals"
                                                {...field}
                                            />
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
                                            <Textarea
                                                placeholder="Eg. Minerals"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                           
                            <FormField
                                control={form.control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md ">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Is active
                                            </FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <Button disabled={isSubmitting} type="submit">
                                {isSubmitting ? "Creating..." : "Create"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
