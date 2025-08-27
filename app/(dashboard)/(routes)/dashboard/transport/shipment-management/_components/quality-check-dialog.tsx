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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Plus,
  Minus
} from "lucide-react"
import { performQualityCheck } from "@/lib/actions/shipment.actions"
import { toast } from "sonner"

const qualityCheckSchema = z.object({
  results: z.string().min(1, "Quality check results are required"),
  issues: z.array(z.string()).optional(),
  approved: z.boolean()
})

type QualityCheckFormData = z.infer<typeof qualityCheckSchema>

interface QualityCheckDialogProps {
  shipment: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QualityCheckDialog({ 
  shipment, 
  open, 
  onOpenChange 
}: QualityCheckDialogProps) {
  const [loading, setLoading] = useState(false)
  const [issues, setIssues] = useState<string[]>([])
  const [newIssue, setNewIssue] = useState("")

  const form = useForm<QualityCheckFormData>({
    resolver: zodResolver(qualityCheckSchema),
    defaultValues: {
      results: "",
      issues: [],
      approved: true
    }
  })

  const addIssue = () => {
    if (newIssue.trim()) {
      const updatedIssues = [...issues, newIssue.trim()]
      setIssues(updatedIssues)
      form.setValue("issues", updatedIssues)
      setNewIssue("")
    }
  }

  const removeIssue = (index: number) => {
    const updatedIssues = issues.filter((_, i) => i !== index)
    setIssues(updatedIssues)
    form.setValue("issues", updatedIssues)
  }

  const onSubmit = async (data: QualityCheckFormData) => {
    try {
      setLoading(true)
      
      await performQualityCheck(shipment._id, {
        results: data.results,
        issues: issues,
        approved: data.approved
      })
      
      toast.success("Quality check completed successfully")
      form.reset()
      setIssues([])
      onOpenChange(false)
      
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || "Failed to perform quality check")
    } finally {
      setLoading(false)
    }
  }

  if (!shipment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Quality Check - {shipment.shipmentNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Shipment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shipment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-medium">Tracking Number</div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {shipment.trackingNumber}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Current Status</div>
                  <Badge variant="outline">{shipment.status}</Badge>
                </div>
                <div>
                  <div className="font-medium">Total Value</div>
                  <div className="text-sm text-muted-foreground">
                    ${shipment.totalValue?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Items Count</div>
                  <div className="text-sm text-muted-foreground">
                    {shipment.items?.length || 0} items
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items to Check */}
          <Card>
            <CardHeader>
              <CardTitle>Items to Inspect</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shipment.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.productId?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Qty: {item.quantity} | Condition: {item.condition}
                      </div>
                      {item.batchNumber && (
                        <div className="text-sm text-muted-foreground">
                          Batch: {item.batchNumber}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${item.totalValue?.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quality Check Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="results"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quality Check Results</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the overall condition of the shipment, any observations, and inspection results..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Issues Section */}
              <div className="space-y-3">
                <FormLabel>Issues Found (Optional)</FormLabel>
                
                {/* Add Issue Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Describe any issues found..."
                    value={newIssue}
                    onChange={(e) => setNewIssue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIssue())}
                  />
                  <Button type="button" variant="outline" onClick={addIssue}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Issues List */}
                {issues.length > 0 && (
                  <div className="space-y-2">
                    {issues.map((issue, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-lg bg-red-50">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-sm">{issue}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIssue(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Approval Switch */}
              <FormField
                control={form.control}
                name="approved"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        {field.value ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        Quality Check Approved
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        {field.value 
                          ? "Shipment meets quality standards and is approved for delivery"
                          : "Shipment has quality issues and requires attention"
                        }
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Warning for non-approved shipments */}
              {!form.watch("approved") && (
                <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Quality Issues Detected</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    This shipment will be flagged for quality issues. Consider updating the shipment status to "damaged" or "delayed" if necessary.
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
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Complete Quality Check"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}