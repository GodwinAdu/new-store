"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Truck, User, Settings, MapPin, Phone, Hash, Users, PlusCircle } from "lucide-react"
import { createVehicle } from "@/lib/actions/transport.actions"
import { toast } from "sonner"
import { usePathname, useRouter } from "next/navigation"

const transportFormSchema = z.object({
    name: z
        .string()
        .min(2, {
            message: "Vehicle name must be at least 2 characters.",
        })
        .max(50, {
            message: "Vehicle name must not exceed 50 characters.",
        }),
    type: z.string().min(1, {
        message: "Please select a vehicle type.",
    }),
    capacity: z
        .number()
        .min(1, {
            message: "Capacity must be at least 1.",
        })
        .max(1000, {
            message: "Capacity must not exceed 1000.",
        }),
    location: z
        .string()
        .min(2, {
            message: "Location must be at least 2 characters.",
        })
        .max(100, {
            message: "Location must not exceed 100 characters.",
        }),
    vehicleNumber: z
        .string()
        .min(3, {
            message: "Vehicle number must be at least 3 characters.",
        })
        .max(20, {
            message: "Vehicle number must not exceed 20 characters.",
        })
        .regex(/^[A-Z0-9-]+$/, {
            message: "Vehicle number can only contain uppercase letters, numbers, and hyphens.",
        }),
    driverName: z
        .string()
        .min(2, {
            message: "Driver name must be at least 2 characters.",
        })
        .max(50, {
            message: "Driver name must not exceed 50 characters.",
        }),
    driverContact: z
        .string()
        .min(10, {
            message: "Driver contact must be at least 10 characters.",
        })
        .regex(/^\+?[\d\s\-$$$$]+$/, {
            message: "Please enter a valid phone number.",
        }),
    status: z.enum(["available", "in-use", "maintenance"], {
        message: "Please select a status.",
    }),
    isActive: z.boolean(),
})

type TransportFormValues = z.infer<typeof transportFormSchema>

const vehicleTypes = [
    { value: "bus", label: "Bus" },
    { value: "van", label: "Van" },
    { value: "truck", label: "Truck" },
    { value: "car", label: "Car" },
    { value: "motorcycle", label: "Motorcycle" },
    { value: "bicycle", label: "Bicycle" },
    { value: "other", label: "Other" },
]

const statusOptions = [
    { value: "available", label: "Available", color: "bg-green-100 text-green-800 border-green-200" },
    { value: "in-use", label: "In Use", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { value: "maintenance", label: "Maintenance", color: "bg-orange-100 text-orange-800 border-orange-200" },
]

type Props = {
    type: "create" | "update",
    initialData?: any
}
export default function TransportForm({ initialData, type }: Props) {
    const router = useRouter();
    const path = usePathname();

    const form = useForm<TransportFormValues>({
        resolver: zodResolver(transportFormSchema),
        defaultValues: initialData ?? {
            name: "",
            type: "",
            capacity: 1,
            location: "",
            vehicleNumber: "",
            driverName: "",
            driverContact: "",
            status: "available",
            isActive: true,
        },
    })

    async function onSubmit(data: TransportFormValues) {
        try {
            if (type === "create") {
                await createVehicle({
                    plateNumber: data.vehicleNumber,
                    type: data.type,
                    capacity: data.capacity.toString(),
                    driver: data.driverName,
                    fuelType: 'petrol',
                    mileage: 0
                })
            }

            if (type === "update") { }
            form.reset();
            router.push('/dashboard/transport/vehicle-management')
            toast.success(type === "create" ? "Create Successfully" : "Update  Successfully", {
                description: type === "create" ? "New transport was created successfully" : " transport was updated successfully"
            })
        } catch (error) {
            console.error("Error submitting form:", error)
            toast.error("Something went wrong", {
                description: "Please try again later"
            })
        }
    }

    const watchedStatus = form.watch("status")
    const isSubmitting = form.formState.isSubmitting

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <Card className="shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-primary/60 to-primary/70 text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Truck className="h-6 w-6" />
                            Vehicle Registration Form
                        </CardTitle>
                        <CardDescription className="text-blue-100">
                            Fill in the details below to register a new transport vehicle
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                {/* Vehicle Information Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Truck className="h-5 w-5 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Vehicle Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., School Bus #1" {...field} />
                                                    </FormControl>
                                                    <FormDescription>Enter a descriptive name for the vehicle.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Vehicle Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select vehicle type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {vehicleTypes.map((type) => (
                                                                <SelectItem key={type.value} value={type.value}>
                                                                    {type.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>Choose the type of vehicle from the list.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="capacity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        Capacity
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max="1000"
                                                            placeholder="e.g., 50"
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>Maximum number of passengers the vehicle can carry.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="vehicleNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-1">
                                                        <Hash className="h-4 w-4" />
                                                        Vehicle Number
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g., ABC-1234"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>Official registration number of the vehicle.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="location"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        Current Location
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Main Campus Parking" {...field} />
                                                    </FormControl>
                                                    <FormDescription>Where the vehicle is currently parked or stationed.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                {/* Driver Information Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <User className="h-5 w-5 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Driver Information</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="driverName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Driver Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., John Smith" {...field} />
                                                    </FormControl>
                                                    <FormDescription>Full name of the assigned driver.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="driverContact"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-1">
                                                        <Phone className="h-4 w-4" />
                                                        Driver Contact
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., +1 (555) 123-4567" {...field} />
                                                    </FormControl>
                                                    <FormDescription>Phone number to reach the driver.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                {/* Status & Settings Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Settings className="h-5 w-5 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Status & Settings</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Current Status</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {statusOptions.map((status) => (
                                                                <SelectItem key={status.value} value={status.value}>
                                                                    <div className="flex items-center gap-2">
                                                                        <div
                                                                            className={`w-2 h-2 rounded-full ${status.value === "available"
                                                                                ? "bg-green-500"
                                                                                : status.value === "in-use"
                                                                                    ? "bg-blue-500"
                                                                                    : "bg-orange-500"
                                                                                }`}
                                                                        ></div>
                                                                        {status.label}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="mt-2">
                                                        <Badge className={statusOptions.find((s) => s.value === watchedStatus)?.color}>
                                                            {statusOptions.find((s) => s.value === watchedStatus)?.label}
                                                        </Badge>
                                                    </div>
                                                    <FormDescription>Current operational status of the vehicle.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="isActive"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">Active Status</FormLabel>
                                                        <FormDescription>
                                                            {field.value
                                                                ? "Vehicle is active and available for scheduling"
                                                                : "Vehicle is inactive and won't appear in scheduling"}
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end pt-6">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-2 text-base font-medium"
                                    >
                                        {isSubmitting ? (
                                            type === "create" ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                                    <span>Adding Vehicle...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                                    <span>Updating Vehicle...</span>
                                                </div>
                                            )
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <PlusCircle className="h-5 w-5" />
                                                <span>{type === "create" ? "Add Vehicle" : "Update Vehicle"}</span>
                                            </div>
                                        )}
                                    </Button>

                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
