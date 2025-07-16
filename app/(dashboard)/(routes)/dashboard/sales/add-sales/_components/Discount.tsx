import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SaleFormValues } from "@/lib/validators/sale-form-schema";

import { Control } from "react-hook-form";

interface DiscountFieldProps {
    control: Control<SaleFormValues>;
}

export function DiscountField({ control }: DiscountFieldProps) {
    return (
        <FormField
            control={control}
            name="discountAmount"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Discount Amount (%)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Enter discount" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

