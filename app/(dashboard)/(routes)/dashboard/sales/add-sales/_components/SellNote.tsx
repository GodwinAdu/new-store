import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { SaleFormValues } from "@/lib/validators/sale-form-schema";
import { Control } from "react-hook-form";

export function SellNoteField({ control }:{ control: Control<SaleFormValues>;}) {
  return (
    <FormField
      control={control}
      name="sellNote"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Sell Note</FormLabel>
          <FormControl>
            <Textarea placeholder="Add a note about this sale" className="resize-none" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

