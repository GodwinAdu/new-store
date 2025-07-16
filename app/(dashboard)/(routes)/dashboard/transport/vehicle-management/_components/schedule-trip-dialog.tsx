"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, MapPin, Users, Clock, Route, Plus, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const tripSchema = z.object({
    routeName: z.string().min(2, "Route name must be at least 2 characters"),
    startLocation: z.string().min(2, "Start location is required"),
    endLocation: z.string().min(2, "End location is required"),
    departureDate: z.date({
        required_error: "Departure date is required",
    }),
    departureTime: z.string().min(1, "Departure time is required"),
    estimatedDuration: z.number().min(1, "Duration must be at least 1 minute"),
    maxPassengers: z.number().min(1, "At least 1 passenger required"),
    tripType: z.enum(["scheduled", "charter", "emergency"]),
    priority: z.enum(["low", "medium", "high"]),
    notes: z.string().optional(),
    stops: z.array(z.string()).optional(),
})

type TripFormValues = z.infer<typeof tripSchema>

interface ScheduleTripDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    vehicleCapacity: number
    onSchedule: (data: TripFormValues) => void
}

const tripTypes = [
    { value: "scheduled", label: "Scheduled Route", description: "Regular scheduled service" },
    { value: "charter", label: "Charter Trip", description: "Private charter service" },
    { value: "emergency", label: "Emergency", description: "Emergency transport" },
]

const priorityLevels = [
    { value: "low", label: "Low Priority", color: "bg-gray-100 text-gray-800" },
    { value: "medium", label: "Medium Priority", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "High Priority", color: "bg-red-100 text-red-800" },
]

export function ScheduleTripDialog({ open, onOpenChange, vehicleCapacity, onSchedule }: ScheduleTripDialogProps) {
    const [stops, setStops] = useState<string[]>([])
    const [newStop, setNewStop] = useState("")

    const form = useForm<TripFormValues>({
        resolver: zodResolver(tripSchema),
        defaultValues: {
            routeName: "",
            startLocation: "",
            endLocation: "",
            departureTime: "",
            estimatedDuration: 30,
            maxPassengers: Math.min(vehicleCapacity, 20),
            tripType: "scheduled",
            priority: "medium",
            notes: "",
            stops: [],
        },
    })

    const addStop = () => {
        if (newStop.trim() && !stops.includes(newStop.trim())) {
            const updatedStops = [...stops, newStop.trim()]
            setStops(updatedStops)
            form.setValue("stops", updatedStops)
            setNewStop("")
        }
    }

    const removeStop = (stopToRemove: string) => {
        const updatedStops = stops.filter((stop) => stop !== stopToRemove)
        setStops(updatedStops)
        form.setValue("stops", updatedStops)
    }

    const onSubmit = (data: TripFormValues) => {
        onSchedule({ ...data, stops })
        form.reset()
        setStops([])
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Route className="h-5 w-5" />
                        Schedule New Trip
                    </DialogTitle>
                    <DialogDescription>Plan and schedule a new trip for this vehicle</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Trip Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Trip Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="routeName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Route Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Campus Shuttle Route A" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tripType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Trip Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {tripTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            <div>
                                                                <div className="font-medium">{type.label}</div>
                                                                <div className="text-sm text-gray-500">{type.description}</div>
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
                        </div>

                        <Separator />

                        {/* Route Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Route Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Main Campus" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="endLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Downtown Campus" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Intermediate Stops */}
                            <div className="space-y-3">
                                <Label>Intermediate Stops (Optional)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a stop location"
                                        value={newStop}
                                        onChange={(e) => setNewStop(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addStop())}
                                    />
                                    <Button type="button" onClick={addStop} size="sm">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                {stops.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {stops.map((stop, index) => (
                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                {stop}
                                                <button
                                                    type="button"
                                                    onClick={() => removeStop(stop)}
                                                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Schedule & Capacity */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Schedule & Capacity
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="departureDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Departure Date</FormLabel>
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
                                    name="departureTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Departure Time</FormLabel>
                                            <FormControl>
                                                <Input type="time" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="estimatedDuration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration (minutes)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="maxPassengers"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                Max Passengers
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max={vehicleCapacity}
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                                                />
                                            </FormControl>
                                            <FormDescription>Maximum {vehicleCapacity} passengers for this vehicle</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Priority Level</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {priorityLevels.map((priority) => (
                                                        <SelectItem key={priority.value} value={priority.value}>
                                                            <Badge className={priority.color}>{priority.label}</Badge>
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

                        {/* Additional Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Any special instructions or requirements for this trip..."
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
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
                                {form.formState.isSubmitting ? "Scheduling..." : "Schedule Trip"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
