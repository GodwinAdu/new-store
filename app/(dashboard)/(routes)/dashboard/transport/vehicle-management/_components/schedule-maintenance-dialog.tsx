"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Wrench, DollarSign, User, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const maintenanceSchema = z.object({
    type: z.string().min(1, "Maintenance type is required"),
    category: z.enum(["routine", "repair", "inspection", "emergency"]),
    scheduledDate: z.date({
        required_error: "Scheduled date is required",
    }),
    estimatedDuration: z.number().min(1, "Duration must be at least 1 hour"),
    estimatedCost: z.number().min(0, "Cost cannot be negative"),
    technician: z.string().min(1, "Technician assignment is required"),
    priority: z.enum(["low", "medium", "high", "critical"]),
    description: z.string().min(10, "Description must be at least 10 characters"),
    partsNeeded: z.string().optional(),
    serviceProvider: z.string().min(1, "Service provider is required"),
})

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>

interface ScheduleMaintenanceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSchedule: (data: MaintenanceFormValues) => void
}

const maintenanceTypes = [
    "Oil Change",
    "Tire Rotation",
    "Brake Inspection",
    "Engine Tune-up",
    "Transmission Service",
    "Air Filter Replacement",
    "Battery Check",
    "Cooling System Service",
    "Electrical System Check",
    "Safety Inspection",
    "Custom Service",
]

const categories = [
    { value: "routine", label: "Routine Maintenance", description: "Regular scheduled maintenance" },
    { value: "repair", label: "Repair Work", description: "Fix specific issues" },
    { value: "inspection", label: "Inspection", description: "Safety and compliance checks" },
    { value: "emergency", label: "Emergency Repair", description: "Urgent repair needed" },
]

const priorityLevels = [
    { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
    { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" },
]

const technicians = [
    "Mike Wilson - Senior Mechanic",
    "Sarah Davis - Electrical Specialist",
    "Tom Johnson - Engine Expert",
    "Lisa Brown - General Maintenance",
    "External Service Provider",
]

const serviceProviders = [
    "In-House Maintenance Team",
    "AutoCare Services",
    "Fleet Maintenance Pro",
    "Quick Fix Garage",
    "Premium Auto Service",
]

export function ScheduleMaintenanceDialog({ open, onOpenChange, onSchedule }: ScheduleMaintenanceDialogProps) {
    const form = useForm<MaintenanceFormValues>({
        resolver: zodResolver(maintenanceSchema),
        defaultValues: {
            type: "",
            category: "routine",
            estimatedDuration: 2,
            estimatedCost: 0,
            technician: "",
            priority: "medium",
            description: "",
            partsNeeded: "",
            serviceProvider: "",
        },
    })

    const onSubmit = (data: MaintenanceFormValues) => {
        onSchedule(data)
        form.reset()
        onOpenChange(false)
    }

    const watchedCategory = form.watch("category")
    const watchedPriority = form.watch("priority")

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Schedule Maintenance
                    </DialogTitle>
                    <DialogDescription>Plan and schedule maintenance work for this vehicle</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Maintenance Type & Category */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Maintenance Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Maintenance Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select maintenance type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {maintenanceTypes.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
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
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.value} value={category.value}>
                                                            <div>
                                                                <div className="font-medium">{category.label}</div>
                                                                <div className="text-sm text-gray-500">{category.description}</div>
                                                            </div>
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
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority Level</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full md:w-1/2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {priorityLevels.map((priority) => (
                                                    <SelectItem key={priority.value} value={priority.value}>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={priority.color}>{priority.label}</Badge>
                                                            {priority.value === "critical" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="mt-2">
                                            <Badge className={priorityLevels.find((p) => p.value === watchedPriority)?.color}>
                                                {priorityLevels.find((p) => p.value === watchedPriority)?.label} Priority
                                            </Badge>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator />

                        {/* Schedule & Resources */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Schedule & Resources</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="scheduledDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Scheduled Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                        >
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date < new Date()}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="estimatedDuration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estimated Duration (hours)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0.5"
                                                    step="0.5"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 1)}
                                                />
                                            </FormControl>
                                            <FormDescription>How long will this maintenance take?</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="technician"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                Assigned Technician
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select technician" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {technicians.map((tech) => (
                                                        <SelectItem key={tech} value={tech}>
                                                            {tech}
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
                                    name="serviceProvider"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Service Provider</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select service provider" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {serviceProviders.map((provider) => (
                                                        <SelectItem key={provider} value={provider}>
                                                            {provider}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Cost & Parts */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Cost & Parts
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="estimatedCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estimated Cost ($)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormDescription>Include labor and parts</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="partsNeeded"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Parts Needed (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Oil filter, brake pads" {...field} />
                                            </FormControl>
                                            <FormDescription>List specific parts if known</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Detailed Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the maintenance work to be performed, any issues to address, or special requirements..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>Provide detailed information about the maintenance work</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Scheduling..." : "Schedule Maintenance"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
