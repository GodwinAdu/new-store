"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Truck, 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  XCircle
} from "lucide-react"
import { updateShipmentStatus } from "@/lib/actions/shipment.actions"
import { toast } from "sonner"

const statusSchema = z.object({
  status: z.enum(["pending", "in-transit", "delivered", "cancelled", "delayed", "damaged"]),
  notes: z.string().optional()
})

type StatusFormData = z.infer<typeof statusSchema>

interface UpdateStatusDialogProps {
  shipment: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateStatusDialog({ 
  shipment, 
  open, 
  onOpenChange 
}: UpdateStatusDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<StatusFormData>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: shipment?.status || "pending",
      notes: ""
    }
  })

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      description: "Shipment is waiting to be picked up",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      value: "in-transit",
      label: "In Transit",
      description: "Shipment is on the way to destination",
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      value: "delivered",
      label: "Delivered",
      description: "Shipment has been delivered successfully",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      value: "delayed",
      label: "Delayed",
      description: "Shipment is delayed due to unforeseen circumstances",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      value: "damaged",
      label: "Damaged",
      description: "Shipment has been damaged during transport",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      value: "cancelled",
      label: "Cancelled",
      description: "Shipment has been cancelled",
      icon: XCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    }
  ]

  const onSubmit = async (data: StatusFormData) => {
    try {
      setLoading(true)
      
      await updateShipmentStatus(shipment._id, data.status, data.notes)
      
      toast.success("Shipment status updated successfully")
      form.reset()
      onOpenChange(false)
      
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || "Failed to update status")
    } finally {
      setLoading(false)
    }
  }

  const getCurrentStatusInfo = () => {
    return statusOptions.find(option => option.value === shipment?.status)
  }

  const currentStatus = getCurrentStatusInfo()

  if (!shipment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Update Shipment Status
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Current Status</span>
              <Badge variant="outline">
                {shipment.shipmentNumber}
              </Badge>
            </div>
            {currentStatus && (
              <div className={`flex items-center gap-2 p-2 rounded-lg ${currentStatus.bgColor}`}>
                <currentStatus.icon className={`h-4 w-4 ${currentStatus.color}`} />
                <div>
                  <div className="font-medium">{currentStatus.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {currentStatus.description}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => {
                          const Icon = option.icon
                          return (
                            <SelectItem 
                              key={option.value} 
                              value={option.value}
                              disabled={option.value === shipment.status}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${option.color}`} />
                                <div>
                                  <div className="font-medium">{option.label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {option.description}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes about the status change..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Change Warnings */}
              {form.watch("status") === "delivered" && (
                <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Delivery Confirmation</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    This will mark the shipment as delivered and update the transport status to available.
                  </p>
                </div>
              )}

              {(form.watch("status") === "damaged" || form.watch("status") === "delayed") && (
                <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Issue Reported</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    This will flag the shipment as having issues. Please provide detailed notes.
                  </p>
                </div>
              )}

              {form.watch("status") === "cancelled" && (
                <div className="p-3 border border-gray-200 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-800">
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">Cancellation</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    This will cancel the shipment and make the transport available for other shipments.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || form.watch("status") === shipment.status}
                >
                  {loading ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}