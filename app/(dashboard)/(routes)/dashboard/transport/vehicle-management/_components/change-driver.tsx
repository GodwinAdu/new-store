"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Phone, Calendar, AlertTriangle, CheckCircle } from "lucide-react"

const driverChangeSchema = z.object({
    newDriverId: z.string().min(1, "Please select a new driver"),
    effectiveDate: z.string().min(1, "Effective date is required"),
    reason: z.string().min(5, "Reason must be at least 5 characters"),
    handoverNotes: z.string().optional(),
    notifyDriver: z.boolean(),
})

type DriverChangeFormValues = z.infer<typeof driverChangeSchema>

interface ChangeDriverDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentDriver: {
        name: string
        contact: string
    }
    onChange: (data: DriverChangeFormValues) => void
}

const availableDrivers = [
    {
        id: "driver-001",
        name: "Sarah Johnson",
        contact: "+1 (555) 234-5678",
        experience: "5 years",
        rating: 4.8,
        status: "available",
        specializations: ["Bus", "Van"],
    },
    {
        id: "driver-002",
        name: "Mike Rodriguez",
        contact: "+1 (555) 345-6789",
        experience: "8 years",
        rating: 4.9,
        status: "available",
        specializations: ["Bus", "Truck"],
    },
    {
        id: "driver-003",
        name: "Emily Chen",
        contact: "+1 (555) 456-7890",
        experience: "3 years",
        rating: 4.7,
        status: "available",
        specializations: ["Van", "Car"],
    },
    {
        id: "driver-004",
        name: "Robert Wilson",
        contact: "+1 (555) 567-8901",
        experience: "12 years",
        rating: 4.9,
        status: "on-leave",
        specializations: ["Bus", "Van", "Truck"],
    },
]

const changeReasons = [
    "Driver requested transfer",
    "Performance improvement needed",
    "Schedule conflict",
    "Driver resignation",
    "Temporary assignment",
    "Route optimization",
    "Driver promotion",
    "Medical leave",
    "Training assignment",
    "Other",
]

export function ChangeDriverDialog({ open, onOpenChange, currentDriver, onChange }: ChangeDriverDialogProps) {
    const [selectedDriver, setSelectedDriver] = useState<(typeof availableDrivers)[0] | null>(null)

    const form = useForm<DriverChangeFormValues>({
        resolver: zodResolver(driverChangeSchema),
        defaultValues: {
            newDriverId: "",
            effectiveDate: new Date().toISOString().split("T")[0],
            reason: "",
            handoverNotes: "",
            notifyDriver: true,
        },
    })

    const onSubmit = (data: DriverChangeFormValues) => {
        onChange(data)
        form.reset()
        setSelectedDriver(null)
        onOpenChange(false)
    }

    const handleDriverSelect = (driverId: string) => {
        const driver = availableDrivers.find((d) => d.id === driverId)
        setSelectedDriver(driver || null)
        form.setValue("newDriverId", driverId)
    }

    const setQuickReason = (reason: string) => {
        form.setValue("reason", reason)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Change Vehicle Driver
                    </DialogTitle>
                    <DialogDescription>Assign a new driver to this vehicle</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Current vs New Driver */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Driver Change</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Current Driver */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="text-sm font-medium text-gray-600 mb-3">Current Driver</div>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>
                                                {currentDriver.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{currentDriver.name}</div>
                                            <div className="text-sm text-gray-600 flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {currentDriver.contact}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* New Driver */}
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="text-sm font-medium text-gray-600 mb-3">New Driver</div>
                                    {selectedDriver ? (
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {selectedDriver.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{selectedDriver.name}</div>
                                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {selectedDriver.contact}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {selectedDriver.experience}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        ⭐ {selectedDriver.rating}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 text-sm">Select a new driver below</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Driver Selection */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="newDriverId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select New Driver</FormLabel>
                                        <Select onValueChange={handleDriverSelect} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose a driver" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {availableDrivers.map((driver) => (
                                                    <SelectItem key={driver.id} value={driver.id} disabled={driver.status !== "available"}>
                                                        <div className="flex items-center gap-3 py-2">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="text-xs">
                                                                    {driver.name
                                                                        .split(" ")
                                                                        .map((n) => n[0])
                                                                        .join("")}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">{driver.name}</span>
                                                                    {driver.status === "available" ? (
                                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                                    ) : (
                                                                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {driver.experience} • ⭐ {driver.rating} • {driver.specializations.join(", ")}
                                                                </div>
                                                                <div className="text-xs text-gray-400">{driver.contact}</div>
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

                            {/* Driver Details */}
                            {selectedDriver && (
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-medium mb-2">Driver Details</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Experience:</span> {selectedDriver.experience}
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Rating:</span> ⭐ {selectedDriver.rating}/5.0
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Status:</span>{" "}
                                            <Badge
                                                className={
                                                    selectedDriver.status === "available"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-orange-100 text-orange-800"
                                                }
                                            >
                                                {selectedDriver.status}
                                            </Badge>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Specializations:</span>{" "}
                                            {selectedDriver.specializations.join(", ")}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Change Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Change Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="effectiveDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                Effective Date
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormDescription>When should this change take effect?</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reason for Change</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Explain why the driver is being changed..."
                                                className="min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Quick Reason Buttons */}
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-700">Quick reasons:</div>
                                <div className="flex flex-wrap gap-2">
                                    {changeReasons.map((reason) => (
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

                            <FormField
                                control={form.control}
                                name="handoverNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Handover Notes (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Any special instructions or information for the new driver..."
                                                className="min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Information to help the new driver get started</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Changing Driver..." : "Change Driver"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
