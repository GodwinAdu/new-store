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
import { updateBrand, fetchBrandById } from "@/lib/actions/brand.actions";
import { useEffect, useState } from "react";
import Heading from "@/components/commons/Header";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const brandSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    isActive: z.boolean()
});

export default function EditBrandPage({ params }: { params: Promise<{ brandId: string }> }) {
    const [loading, setLoading] = useState(true);
    const [brandId, setBrandId] = useState<string>("");
    const router = useRouter();

    const form = useForm<z.infer<typeof brandSchema>>({
        resolver: zodResolver(brandSchema),
        defaultValues: {
            name: "",
            isActive: true,
        },
    });

    const { isSubmitting } = form.formState;

    useEffect(() => {
        const loadData = async () => {
            try {
                const resolvedParams = await params;
                setBrandId(resolvedParams.brandId);

                const brand = await fetchBrandById(resolvedParams.brandId);

                form.reset({
                    name: brand.name,
                    isActive: brand.isActive,
                });
            } catch (error) {
                toast.error("Failed to load brand");
                router.push("/dashboard/products/brands");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [params, form, router]);

    async function onSubmit(values: z.infer<typeof brandSchema>) {
        try {
            await updateBrand(brandId, values);
            toast.success("Brand updated successfully");
            router.push("/dashboard/products/brands");
            router.refresh();
        } catch {
            toast.error("Failed to update brand");
        }
    }

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <>
            <div className="flex items-center gap-4 px-3">
                <Link href="/dashboard/products/brands">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <Heading title="Edit Brand" />
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
                                    <FormLabel>Brand Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter brand name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Active</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4">
                            <Button disabled={isSubmitting} type="submit">
                                {isSubmitting ? "Updating..." : "Update Brand"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/products/brands")}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </>
    );
}
