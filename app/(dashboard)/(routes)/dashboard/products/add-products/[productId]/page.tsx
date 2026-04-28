"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { updateProduct, fetchProductById } from "@/lib/actions/product.actions";
import { fetchAllUnits } from "@/lib/actions/unit.actions";
import { fetchAllBrands } from "@/lib/actions/brand.actions";
import { fetchAllCategories } from "@/lib/actions/category.actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import Heading from "@/components/commons/Header";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import MultiText from "@/components/commons/MultiText";
import MultiSelect from "@/components/commons/MultiSelect";

const productSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    brandId: z.string().optional(),
    categoryId: z.string().optional(),
    barcode: z.string().min(1, "Barcode is required"),
    sku: z.string().min(1, "SKU is required"),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    color: z.array(z.string()).optional(),
    size: z.array(z.string()).optional(),
    unit: z.array(z.string()),
    defaultCost: z.coerce.number().min(0).optional(),
    defaultMargin: z.coerce.number().min(0).optional(),
    reorderPoint: z.coerce.number().min(0).optional(),
    reorderQuantity: z.coerce.number().min(0).optional(),
    isActive: z.boolean()
});

export default function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
    const [brands, setBrands] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [productId, setProductId] = useState<string>("");
    const router = useRouter();

    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            barcode: "",
            sku: "",
            description: "",
            tags: [],
            color: [],
            size: [],
            unit: [],
            defaultCost: 0,
            defaultMargin: 30,
            reorderPoint: 10,
            reorderQuantity: 50,
            isActive: true,
        },
    });

    const { isSubmitting } = form.formState;

    useEffect(() => {
        const loadData = async () => {
            try {
                const resolvedParams = await params;
                setProductId(resolvedParams.productId);

                const [product, brandsData, categoriesData, unitsData] = await Promise.all([
                    fetchProductById(resolvedParams.productId),
                    fetchAllBrands(),
                    fetchAllCategories(),
                    fetchAllUnits()
                ]);

                setBrands(brandsData);
                setCategories(categoriesData);
                setUnits(unitsData);

                form.reset({
                    name: product.name,
                    brandId: product.brandId?._id || "",
                    categoryId: product.categoryId?._id || "",
                    barcode: product.barcode,
                    sku: product.sku,
                    description: product.description || "",
                    tags: product.tags || [],
                    color: product.color || [],
                    size: product.size || [],
                    unit: product.unit?.map((u: any) => u._id || u) || [],
                    defaultCost: product.defaultCost || 0,
                    defaultMargin: product.defaultMargin || 30,
                    reorderPoint: product.reorderPoint || 10,
                    reorderQuantity: product.reorderQuantity || 50,
                    isActive: product.isActive,
                });
            } catch (error) {
                toast.error("Failed to load product");
                router.push("/dashboard/products/add-products");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [params, form, router]);

    async function onSubmit(values: z.infer<typeof productSchema>) {
        try {
            await updateProduct(productId, values);
            toast.success("Product updated successfully");
            router.push("/dashboard/products/add-products");
            router.refresh();
        } catch {
            toast.error("Failed to update product");
        }
    }

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <>
            <div className="flex items-center gap-4 px-3">
                <Link href="/dashboard/products/add-products">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <Heading title="Edit Product" />
            </div>
            <Separator />
            <div className="p-6 max-w-4xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter product name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="barcode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Barcode</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter barcode" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="sku"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SKU</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter SKU" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="brandId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brand</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select brand" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {brands.map((brand) => (
                                                    <SelectItem key={brand._id} value={brand._id}>
                                                        {brand.name}
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
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category._id} value={category._id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter product description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tags</FormLabel>
                                        <FormControl>
                                            <MultiText
                                                placeholder="Add tags"
                                                value={field.value ?? []}
                                                onChange={(tag) => field.onChange([...field.value ?? [], tag])}
                                                onRemove={(tagToRemove) =>
                                                    field.onChange([...(field.value ?? []).filter((tag) => tag !== tagToRemove)])
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Colors</FormLabel>
                                        <FormControl>
                                            <MultiText
                                                placeholder="Add colors"
                                                value={field.value ?? []}
                                                onChange={(color) => field.onChange([...field.value ?? [], color])}
                                                onRemove={(colorToRemove) =>
                                                    field.onChange([...(field.value ?? []).filter((color) => color !== colorToRemove)])
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="size"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sizes</FormLabel>
                                        <FormControl>
                                            <MultiText
                                                placeholder="Add sizes"
                                                value={field.value ?? []}
                                                onChange={(size) => field.onChange([...field.value ?? [], size])}
                                                onRemove={(sizeToRemove) =>
                                                    field.onChange([...(field.value ?? []).filter((size) => size !== sizeToRemove)])
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Units</FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                placeholder="Select units"
                                                data={units}
                                                value={field.value}
                                                onChange={(_id) => field.onChange([...field.value, _id])}
                                                onRemove={(idToRemove) =>
                                                    field.onChange([...field.value.filter((id) => id !== idToRemove)])
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="defaultCost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Default Cost</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="defaultMargin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Default Margin (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="30" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reorderPoint"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reorder Point</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="10" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reorderQuantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reorder Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="50" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                {isSubmitting ? "Updating..." : "Update Product"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/products/add-products")}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </>
    );
}
