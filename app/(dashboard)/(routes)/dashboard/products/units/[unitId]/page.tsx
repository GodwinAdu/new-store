"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { updateUnit, fetchBaseUnits, fetchUnitById } from "@/lib/actions/unit.actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import Heading from "@/components/commons/Header";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
    name: z.string().min(2, { message: "name must be at least 2 characters." }),
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

export default function EditUnitPage({ params }: { params: Promise<{ unitId: string }> }) {
    const [baseUnits, setBaseUnits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [unitId, setUnitId] = useState<string>("");
    const router = useRouter();

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
        const loadData = async () => {
            try {
                const resolvedParams = await params;
                setUnitId(resolvedParams.unitId);
                
                const [unit, units] = await Promise.all([
                    fetchUnitById(resolvedParams.unitId),
                    fetchBaseUnits()
                ]);
                
                setBaseUnits(units);
                form.reset({
                    name: unit.name,
                    shortName: unit.shortName || "",
                    unitType: unit.unitType,
                    baseUnit: unit.baseUnit?._id || "",
                    conversionFactor: unit.conversionFactor || 1,
                    isActive: unit.isActive,
                });
            } catch (error) {
                toast.error("Failed to load unit");
                router.push("/dashboard/products/units");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [params, form, router]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await updateUnit(unitId, values);
            toast.success("Unit updated successfully");
            router.push("/dashboard/products/units");
            router.refresh();
        } catch {
            toast.error("Failed to update unit");
        }
    }

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <>
            <div className="flex items-center gap-4 px-3">
                <Link href="/dashboard/products/units">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <Heading title="Edit Unit" />
            </div>
            <Separator />
            <div className="p-6 max-w-2xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Unit Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Box, Dozen, Piece" {...field} />
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
                                        <Input placeholder="e.g., pcs, dz, box" {...field} />
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
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                            <Select onValueChange={field.onChange} value={field.value}>
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
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Is active</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-4">
                            <Button disabled={isSubmitting} type="submit">
                                {isSubmitting ? "Updating..." : "Update Unit"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/products/units")}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </>
    );
}
