"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Loader2, MapPin, Building2, User, Hash, FileText, CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"



const formSchema = z.object({
    name: z
        .string()
        .min(2, "Warehouse name must be at least 2 characters")
        .max(100, "Warehouse name must be less than 100 characters")
        .regex(/^[a-zA-Z0-9\s\-_]+$/, "Only letters, numbers, spaces, hyphens, and underscores allowed"),
    location: z
        .string()
        .min(5, "Location must be at least 5 characters")
        .max(200, "Location must be less than 200 characters"),
    description: z.string().max(500, "Description must be less than 500 characters").optional(),
    capacity: z.number().min(1, "Capacity must be at least 1").max(1000000, "Capacity cannot exceed 1,000,000"),
    managerId: z
        .string()
        .min(2, "Manager ID must be at least 2 characters")
        .max(50, "Manager ID must be less than 50 characters"),
    type: z.enum(["main", "secondary", "cold", "frozen", "distribution"], {
        required_error: "Please select a warehouse type",
    }),
    isActive: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

const warehouseTypes = [
    { value: "main", label: "Main Storage", description: "Primary storage facility" },
    { value: "secondary", label: "Secondary Storage", description: "Backup storage facility" },
    { value: "cold", label: "Cold Storage", description: "Temperature-controlled storage" },
    { value: "frozen", label: "Frozen Storage", description: "Sub-zero temperature storage" },
    { value: "distribution", label: "Distribution Center", description: "Shipping and receiving hub" },
]

const WarehouseModal = () => {
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)


    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            location: "",
            description: "",
            capacity: 1000,
            managerId: "",
            type: undefined,
            isActive: true,
        },
    })

    async function onSubmit(values: FormData) {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000))

            console.log("Warehouse data:", values)

            toast.success("Success!", {
                description: `Warehouse "${values.name}" has been created successfully.`,
            })
            form.reset()
            setOpen(false)
        } catch (error) {
            console.log(error)
            toast.error("Error", {
                description: "Failed to create warehouse. Please try again.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const selectedType = warehouseTypes.find((type) => type.value === form.watch("type"))

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Warehouse
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[96%] md:max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Building2 className="h-5 w-5" />
                        Add New Warehouse
                    </DialogTitle>
                    <DialogDescription>
                        Create a new warehouse facility to expand your storage network. All fields marked with * are required.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-6">
                            {/* Warehouse Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            Warehouse Name *
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Downtown Distribution Center" {...field} disabled={isSubmitting} />
                                        </FormControl>
                                        <FormDescription>Choose a unique, descriptive name for your warehouse</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Location */}
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            Location *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., 123 Industrial Blvd, City, State 12345"
                                                {...field}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormDescription>Full address including street, city, state, and postal code</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Type and Capacity Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Warehouse Type *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select warehouse type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {warehouseTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{type.label}</span>
                                                                <span className="text-xs text-muted-foreground">{type.description}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {selectedType && (
                                                <div className="mt-2">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {selectedType.description}
                                                    </Badge>
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="capacity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Hash className="h-4 w-4" />
                                                Capacity (sq ft) *
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="10000"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                                    disabled={isSubmitting}
                                                />
                                            </FormControl>
                                            <FormDescription>Total storage capacity in square feet</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Manager ID */}
                            <FormField
                                control={form.control}
                                name="managerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Manager ID *
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., MGR001 or john.doe" {...field} disabled={isSubmitting} />
                                        </FormControl>
                                        <FormDescription>Employee ID or username of the warehouse manager</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Description
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Additional details about this warehouse facility..."
                                                className="min-h-[100px] resize-none"
                                                {...field}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Optional: Special features, equipment, or notes about this warehouse
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Active Status */}
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="flex items-center gap-2 text-base">
                                                <CheckCircle className="h-4 w-4" />
                                                Active Status
                                            </FormLabel>
                                            <FormDescription>Enable this warehouse for immediate use in operations</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isSubmitting}
                                className="mt-2 sm:mt-0"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="gap-2">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating Warehouse...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Create Warehouse
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default WarehouseModal
