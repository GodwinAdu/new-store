import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SaleFormValues } from "@/lib/validators/sale-form-schema";

import { Control } from "react-hook-form";

export function InvoiceNoField({ control }: { control: Control<SaleFormValues>; }) {
    return (
        <FormField
            control={control}
            name="invoiceNo"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Invoice No</FormLabel>
                    <FormControl>
                        <Input placeholder="Invoice No.." {...field} />
                    </FormControl>
                    <FormDescription>Keep blank to auto generate</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

