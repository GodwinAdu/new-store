import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SaleFormValues } from "@/lib/validators/sale-form-schema";
import { Control } from "react-hook-form";

export function TaxField({ control }:{ control: Control<SaleFormValues>;}) {
    return (
        <FormField
            control={control}
            name="taxAmount"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Tax Amount (%)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Enter tax" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

