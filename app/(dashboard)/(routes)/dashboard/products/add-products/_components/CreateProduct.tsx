'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from '@/hooks/use-toast'
import MultiText from '@/components/commons/MultiText'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import MultiSelect from '@/components/commons/MultiSelect'
import { cn } from '@/lib/utils'
import { createProduct } from '@/lib/actions/product.actions'
import { playErrorSound, playSuccessSound } from '@/lib/audio'
import { ImageUploader } from '@/components/commons/ImageUpload'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { IBranch } from '@/lib/models/branch.models'



const productSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    brandId: z.string().optional(),
    categoryId: z.string().optional(),
    expiryDate: z.date().optional(),
    barcode: z.string(),
    sku: z.string(),
    warrantId: z.string().optional(),
    variation: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    colors: z.array(z.string()).optional(),
    sizes: z.array(z.string()).optional(),
    branchIds: z.array(z.string()),
    vendorPrice: z.object({
        unitId: z.string(),
        productPrice: z.coerce.number(),
        productQuantity: z.coerce.number(),
        costPrice: z.coerce.number(),
    }),
    manualPrice: z.array(z.object({
        tax: z.coerce.number().optional(),
        unitId: z.string().optional(),
        price: z.coerce.number().optional(),
    })).optional(),
    retailPrice: z.object({
        retailUnitId: z.string().optional(),
        retailMarkupPercentage: z.coerce.number().min(0).optional(),
        retailSellingPrice: z.coerce.number().min(0).optional(),
        retailMargin: z.coerce.number().min(0).optional(),
        retailUnitQuantity: z.coerce.number().min(0).optional(),
        retailUnitCost: z.coerce.number().min(0).optional(),
    }).optional(),
    wholesalePrice: z.object({
        wholesaleUnitId: z.string().optional(),
        wholesaleMarkupPercentage: z.coerce.number().min(0).optional(),
        wholesaleMargin: z.coerce.number().min(0).optional(),
        wholesaleUnitQuantity: z.coerce.number().min(0).optional(),
        wholesaleUnitCost: z.coerce.number().min(0).optional(),
        wholesaleSellingPrice: z.coerce.number().min(0).optional(),
    }).optional(),
    unit: z.array(z.string()),
    stock: z.coerce.number().min(0),
    alertQuantity: z.coerce.number().optional(),
    active: z.boolean(),
    selling: z.boolean(),
    stockCalculationMethod: z.string(),
    images: z.array(z.string().url()).min(1, {
        message: "At least one image is required.",
    }),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductProps {
    type: 'create' | 'update';
    warrants: IWarrant[];
    variations: IVariation[];
    initialData?: ProductFormValues;
    categories: ICategory[];
    brands: IBrand[];
    units: IUnit[];
    branch: IBranch,
    branches: IBranch[],
    user: IUser,
    currency: string
}

export default function CreateProductForm({
    user,
    warrants,
    variations,
    branches,
    branch,
    units,
    type,
    categories,
    brands,
    initialData,
    currency,
}: ProductProps) {

    const [wholesaleSellingPrice, setWholesaleSellingPrice] = useState<number>(0)
    const [retailSellingPrice, setRetailSellingPrice] = useState<number>(0)
    const [productUnits, setProductUnits] = useState<IUnit[] | []>([])
    const [calculateStock, setCalculateStock] = useState(0);
    const [costPerUnit, setCostPerUnit] = useState(0);
    const [pricePerUnit, setPricePerUnit] = useState(0);
    const [wholesaleMargin, setWholesaleMargin] = useState(0);
    const [selectedBranches, setSelectedBranches] = useState<IBranch[]>([]);
    const [retailMargin, setRetailMargin] = useState(0);

    const router = useRouter();




    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: initialData ?? {
            name: '',
            barcode: '',
            sku: '',
            unit: [],
            active: true,
            tags: [],
            colors: [],
            sizes: [],
            images: []
        },
    })


    const [isSubmitting, setIsSubmitting] = useState(false)

    const selectedUnitIds = form.watch('unit');
    const stockMethod = form.watch('stockCalculationMethod')
    const productQuantity = form.watch('vendorPrice.productQuantity')
    const vendorUnit = form.watch('vendorPrice.unitId');
    // const productPrice = form.watch("vendorPrice.productPrice");



    useEffect(() => {
        const matchBranches = branches.filter((branch) =>
            user.accessLocation.includes(branch._id)
        );
        setSelectedBranches(matchBranches);
    }, [branches, user]);
    const selling = form.watch('selling')

    useEffect(() => {
        if (units && Array.isArray(units) && Array.isArray(selectedUnitIds)) {
            const matchedUnits = units.filter((unit) => selectedUnitIds.includes(unit._id))
            setProductUnits(matchedUnits)

        }
    }, [selectedUnitIds, units, form]);

    // Set unitId for each productUnit when the component renders
    useEffect(() => {
        productUnits.forEach((unit, index) => {
            form.setValue(`manualPrice.${index}.unitId`, unit._id);
        });
    }, [productUnits, form]);


    const automaticStock = (
        productUnits: IUnit[], // All available units
        productQuantity: number, // Quantity entered by the user in the vendor's unit
        stockMethod: string, // The unit in which the stock should be calculated
        vendorUnit: string // The unit the vendor used to specify the quantity
    ) => {
        // Find the units corresponding to the stock method and vendor unit
        const matchingUnit = productUnits.find((unit) => unit._id === stockMethod);
        const vendorMatchingUnit = productUnits.find((unit) => unit._id === vendorUnit);

        // Validate that both units are found
        if (!matchingUnit) {
            throw new Error("No matching unit found for the specified stock calculation method.");
        }
        if (!vendorMatchingUnit) {
            throw new Error("No matching unit found for the vendor's unit.");
        }

        // Calculate the base unit equivalent of the vendor's quantity
        const baseUnitQuantity = productQuantity * vendorMatchingUnit.quantity;

        // Convert the base unit quantity into the desired stock calculation unit
        const calculatedStock = Math.round(baseUnitQuantity / matchingUnit.quantity); // Rounded to the nearest integer
        form.setValue('stock', calculatedStock);

        setCalculateStock(calculatedStock)

    };


    


  





    // const { control, watch, setValue, getValues } = form;


    const onSubmit = async (values: ProductFormValues) => {
        setIsSubmitting(true)
        try {
            if (type === 'create') {
                await createProduct(values)
            };
            playSuccessSound();


            toast({
                title: "Product created",
                description: "The product has been successfully created.",
                variant: 'success'
            })
        } catch (error) {
            console.error("Error in creating product:", error);
            playErrorSound();
            toast({
                title: "Error",
                description: "An error occurred while creating the product.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Product</CardTitle>
                        <CardDescription>Enter the details for the new product.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="images"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Images</FormLabel>
                                        <FormControl>
                                            <ImageUploader {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category._id} value={category._id}>{category.name}</SelectItem>
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
                        </div>
                        <div className="grid py-4 gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Tags</FormLabel>
                                            <FormControl>
                                                <MultiText
                                                    placeholder="Add some tags (Optional)"
                                                    value={field.value ?? []}
                                                    onChange={(tag) =>
                                                        field.onChange([...field.value ?? [], tag])
                                                    }
                                                    onRemove={(tagToRemove) =>
                                                        field.onChange([
                                                            ...(field.value ?? []).filter(
                                                                (tag) => tag !== tagToRemove
                                                            ),
                                                        ])
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="sizes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Sizes</FormLabel>
                                            <FormControl>
                                                <MultiText
                                                    placeholder="Add some sizes (Optional)"
                                                    value={field.value ?? []}
                                                    onChange={(size) =>
                                                        field.onChange([...field.value ?? [], size])
                                                    }
                                                    onRemove={(sizeToRemove) =>
                                                        field.onChange([
                                                            ...(field.value ?? []).filter(
                                                                (size) => size !== sizeToRemove
                                                            ),
                                                        ])
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="colors"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Colors</FormLabel>
                                            <FormControl>
                                                <MultiText
                                                    placeholder="Add some colors (Optional)"
                                                    value={field.value ?? []}
                                                    onChange={(color) =>
                                                        field.onChange([...field.value ?? [], color])
                                                    }
                                                    onRemove={(colorToRemove) =>
                                                        field.onChange([
                                                            ...(field.value ?? []).filter(
                                                                (color) => color !== colorToRemove
                                                            ),
                                                        ])
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="branchIds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Add Branches</FormLabel>
                                            <FormControl>
                                                {selectedBranches && selectedBranches.length > 0 ? (
                                                    <MultiSelect
                                                        placeholder="Select Units"
                                                        data={selectedBranches}
                                                        value={field.value}
                                                        onChange={(_id) =>
                                                            field.onChange([...field.value, _id])
                                                        }
                                                        onRemove={(idToRemove) =>
                                                            field.onChange([
                                                                ...field.value.filter(
                                                                    (id) => id !== idToRemove
                                                                ),
                                                            ])
                                                        }
                                                    />
                                                ) : null}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>



                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="stockCalculationMethod"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Choose How to Calculate Stock</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex flex-col space-y-1"
                                                >
                                                    {productUnits.map((unit) => (
                                                        <FormItem key={unit._id} className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value={unit._id} />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                {unit.name}
                                                            </FormLabel>
                                                        </FormItem>
                                                    ))}


                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{branch.inventorySettings.stockType === 'manual' ? 'Enter Stock' : 'Stock'}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder={branch.inventorySettings.stockType === 'manual' ? 'Enter stock' : 'Calculated automatically'}
                                                    disabled={branch.inventorySettings.stockType !== 'manual'}
                                                    {...field}
                                                    value={branch.inventorySettings.stockType === 'manual' ? field.value : calculateStock}
                                                    onChange={(e) => {
                                                        if (branch.inventorySettings.stockType === 'manual') {
                                                            field.onChange(parseFloat(e.target.value));
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="alertQuantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Alert Low Product</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Enter  level" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="warrantId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Warrant(Optional)</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                }}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select warrant" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {warrants?.map((warrant) => (
                                                        <SelectItem key={warrant._id} value={warrant._id}>
                                                            {warrant.name}
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
                                    name="variation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Variation(Optional)</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                }}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Variation" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {variations?.map((variation) => (
                                                        <SelectItem key={variation._id} value={variation._id}>
                                                            {variation.name}
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
                                    name="active"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Active
                                                </FormLabel>
                                                <FormDescription>
                                                    This product will be active for sale if checked.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <div className="p-6">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Product"}
                        </Button>
                    </div>
                </Card>
            </form>
        </Form>
    )
}

