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
import { toast } from "sonner";
import { createUnit, fetchBaseUnits } from "@/lib/actions/unit.actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";



const formSchema = z.object({
    name: z.string().min(2, {
        message: "name must be at least 2 characters.",
    }),
    shortName: z.string().optional(),
    unitType: z.enum(["base", "derived"]),
    baseUnit: z.string().optional(),
    conversionFactor: z.number().min(1).optional(),
    isActive: z.boolean()
}).refine((data) => {
    if (data.unitType === "derived") {
        return data.baseUnit && data.conversionFactor && data.conversionFactor > 0;
    }
    return true;
}, {
    message: "Derived units must have a base unit and conversion factor greater than 0",
    path: ["conversionFactor"]
});

export function UnitModal() {
    const [baseUnits, setBaseUnits] = useState<any[]>([]);
    const router = useRouter();
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            shortName: "",
            unitType: "base",
            baseUnit: "",
            conversionFactor: 1,
            isActive: false,
        },
    });

    const { isSubmitting } = form.formState;
    const watchUnitType = form.watch("unitType");

    useEffect(() => {
        const loadBaseUnits = async () => {
            try {
                const units = await fetchBaseUnits();
                setBaseUnits(units);
            } catch (error) {
                console.error('Failed to fetch base units:', error);
            }
        };
        loadBaseUnits();
    }, []);

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await createUnit(values)

            form.reset();
            router.refresh();
            toast.success("Created successfully", {
                description: "New unit was added successfully...",
            });
        } catch {
            toast("Something went wrong", {
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
                        New Unit
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-[96%]">
                <DialogHeader>
                    <DialogTitle>Create Product Unit</DialogTitle>
                    <DialogDescription>Create base units (piece) or derived units (box, dozen) with conversion factors.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Box, Dozen, Piece"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="shortName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Short Name (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., pcs, dz, box"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unitType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select unit type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="base">Base Unit (e.g., Piece)</SelectItem>
                                                <SelectItem value="derived">Derived Unit (e.g., Box, Dozen)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {watchUnitType === "derived" && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="baseUnit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Base Unit</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select base unit" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {baseUnits.map((unit) => (
                                                            <SelectItem key={unit._id} value={unit._id}>
                                                                {unit.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="conversionFactor"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Conversion Factor</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="e.g., 12 (1 dozen = 12 pieces)"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            <FormField
                                control={form.control}
                                name="isActive"
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
