import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

import { Control } from "react-hook-form";
import { SaleFormValues } from "@/lib/validators/sale-form-schema";

interface PaymentTermsFieldProps {
    control: Control<SaleFormValues>;
}

export function PaymentTermsField({ control }: PaymentTermsFieldProps) {
    return (
        <FormField
            control={control}
            name="payTerms"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <FormControl>
                        <div className="flex items-center">
                            <Select
                                onValueChange={(value) => field.onChange(`${field?.value?.split(" ")[0] || 1} ${value}`)}
                                defaultValue="day"
                            >
                                <SelectTrigger className="w-28">
                                    <SelectValue placeholder="Select Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="day">Day</SelectItem>
                                    <SelectItem value="month">Month</SelectItem>
                                    <SelectItem value="year">Year</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                className="flex-1 ml-2"
                                placeholder="Enter value"
                                value={field?.value?.split(" ")[0]}
                                onChange={(e) => field.onChange(`${e.target.value} ${field?.value?.split(" ")[1] || "day"}`)}
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

