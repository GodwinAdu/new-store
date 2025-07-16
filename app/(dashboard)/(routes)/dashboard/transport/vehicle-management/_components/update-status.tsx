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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, MapPin, AlertCircle, CheckCircle, Clock } from "lucide-react"

const statusUpdateSchema = z.object({
    newStatus: z.enum(["available", "in-use", "maintenance"]),
    location: z.string().min(2, "Location is required"),
    reason: z.string().min(5, "Reason must be at least 5 characters"),
    estimatedDuration: z.number().optional(),
    notes: z.string().optional(),
})

type StatusUpdateFormValues = z.infer<typeof statusUpdateSchema>

interface UpdateStatusDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentStatus: string
    currentLocation: string
    onUpdate: (data: StatusUpdateFormValues) => void
}

const statusOptions = [
    {
        value: "available",
        label: "Available",
        description: "Vehicle is ready for use",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="h-4 w-4" />,
    },
    {
        value: "in-use",
        label: "In Use",
        description: "Vehicle is currently on a trip",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Clock className="h-4 w-4" />,
    },
    {
        value: "maintenance",
        label: "Maintenance",
        description: "Vehicle is under maintenance",
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: <AlertCircle className="h-4 w-4" />,
    },
]

const commonReasons = {
    available: [
        "Trip completed",
        "Maintenance completed",
        "Vehicle inspection passed",
        "Driver shift ended",
        "Scheduled availability",
    ],
    "in-use": ["Trip started", "Emergency deployment", "Charter service", "Training exercise", "Special event transport"],
    maintenance: [
        "Scheduled maintenance",
        "Repair needed",
        "Safety inspection",
        "Cleaning and sanitization",
        "Tire replacement",
        "Engine issues",
    ],
}

export function UpdateStatusDialog({
    open,
    onOpenChange,
    currentStatus,
    currentLocation,
    onUpdate,
}: UpdateStatusDialogProps) {
    const form = useForm<StatusUpdateFormValues>({
        resolver: zodResolver(statusUpdateSchema),
        defaultValues: {
            newStatus: currentStatus as "available" | "in-use" | "maintenance",
            location: currentLocation,
            reason: "",
            notes: "",
        },
    })

    const watchedStatus = form.watch("newStatus")
    const currentStatusOption = statusOptions.find((s) => s.value === currentStatus)
    const newStatusOption = statusOptions.find((s) => s.value === watchedStatus)

    const onSubmit = (data: StatusUpdateFormValues) => {
        onUpdate(data)
        form.reset()
        onOpenChange(false)
    }

    const setQuickReason = (reason: string) => {
        form.setValue("reason", reason)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Update Vehicle Status
                    </DialogTitle>
                    <DialogDescription>Change the current status and location of this vehicle</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Current vs New Status */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Status Change</h3>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="text-center">
                                    <div className="text-sm text-gray-600 mb-2">Current Status</div>
                                    <Badge className={currentStatusOption?.color}>
                                        <div className="flex items-center gap-1">
                                            {currentStatusOption?.icon}
                                            {currentStatusOption?.label}
                                        </div>
                                    </Badge>
                                </div>
                                <div className="text-2xl text-gray-400">→</div>
                                <div className="text-center">
                                    <div className="text-sm text-gray-600 mb-2">New Status</div>
                                    <Badge className={newStatusOption?.color}>
                                        <div className="flex items-center gap-1">
                                            {newStatusOption?.icon}
                                            {newStatusOption?.label}
                                        </div>
                                    </Badge>
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="newStatus"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Status</FormLabel>
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
                                                            {status.icon}
                                                            <div>
                                                                <div className="font-medium">{status.label}</div>
                                                                <div className="text-sm text-gray-500">{status.description}</div>
                                                            </div>
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

                        <Separator />

                        {/* Location Update */}
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        Current Location
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Main Campus Parking" {...field} />
                                    </FormControl>
                                    <FormDescription>Update the vehicle&#39;s current location</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Reason for Change */}
                        <div className="space-y-3">
                            <FormField
                                control={form.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reason for Status Change</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Explain why the status is being changed..."
                                                className="min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Quick Reason Buttons */}
                            {commonReasons[watchedStatus] && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-700">Quick reasons:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {commonReasons[watchedStatus].map((reason) => (
                                            <Button
                                                key={reason}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setQuickReason(reason)}
                                                className="text-xs"
                                            >
                                                {reason}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Duration for In-Use or Maintenance */}
                        {(watchedStatus === "in-use" || watchedStatus === "maintenance") && (
                            <FormField
                                control={form.control}
                                name="estimatedDuration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Estimated Duration (hours) {watchedStatus === "maintenance" ? "*" : "(Optional)"}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0.5"
                                                step="0.5"
                                                placeholder="e.g., 2.5"
                                                {...field}
                                                onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || undefined)}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            How long will the vehicle be {watchedStatus === "in-use" ? "on this trip" : "in maintenance"}?
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Additional Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Any additional information or special instructions..."
                                            className="min-h-[60px]"
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
                                {form.formState.isSubmitting ? "Updating..." : "Update Status"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
