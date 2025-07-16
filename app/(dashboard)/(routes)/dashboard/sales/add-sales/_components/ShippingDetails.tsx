import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Control } from "react-hook-form"
import { SaleFormValues } from "@/lib/validators/sale-form-schema"

export function ShippingDetailsFields({ control }: { control: Control<SaleFormValues>; }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Shipping Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                    control={control}
                    name="shippingDetails"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Shipping Details</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Enter shipping details" className="resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="shippingAddress"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Shipping Address</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Enter shipping address" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="shippingCharges"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Shipping Charges</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Enter shipping charges" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="shippingStatus"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Shipping Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select shipping status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {["Ordered", "Packed", "Shipped", "Delivered", "Cancelled", "Suspended"].map(
                                        (status) => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="deliveryTo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Delivery To:</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Delivered to..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    )
}

