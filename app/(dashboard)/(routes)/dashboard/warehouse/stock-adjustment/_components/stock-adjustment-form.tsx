'use client'
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { calculateQuantity, cn, findAutomatedPrice, findManualPrice } from "@/lib/utils"
import { format } from "date-fns"
import { ProductSearch } from "./ProductSearch"
import { IBranch } from "@/lib/models/branch.models"
import { useCartStockAdjustmentStore } from "@/hooks/use-cart-stock-adjustment"
import { useSelectSellingGroup } from "@/hooks/use-select-selling-group"
import { playErrorSound, playSuccessSound } from "@/lib/audio"
import { toast } from "@/hooks/use-toast"
import { createStockAdjustment } from "@/lib/actions/stock-adjustment.actions"
import { useParams, usePathname, useRouter } from "next/navigation"

type Price = {
  unitId: {
    _id: string;
    name: string;
  };
  price: number;
  tax: number;
}[]

const formSchema = z.object({
  referenceNo: z.string().optional(),
  adjustmentDate: z.date(),
  adjustmentType: z.string().min(1, {
    message: "Please select an adjustment type."
  }),
  totalAmount: z.coerce.number(),
  reason: z.string().min(5, {
    message: "Please enter a reason."
  }),
})

export default function StockAdjustmentForm({ branch,currency }: { branch: IBranch,currency:string }) {
  const { cartItems } = useCartStockAdjustmentStore();
  const { selectedValue } = useSelectSellingGroup()
  const router = useRouter();
  const path = usePathname();
  const params = useParams();
  const { storeId, branchId } = params;
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      referenceNo: "",
      adjustmentDate: new Date(),
      adjustmentType: "",
      totalAmount: 0,
      reason: "",
    },
  })

  const subtotal = cartItems.reduce((sum, item) => {
    const price =
      branch.inventorySettings.pricingType === "manual"
        ? findManualPrice(item.item?.manualPrice as Price, item?.unit as string)
        : findAutomatedPrice(
          {
            ...item?.item,
            retailPrice: {
              retailUnitCost: item?.item?.retailPrice?.retailSellingPrice || 0,
              retailMarkupPercentage: item?.item?.retailPrice?.retailMarkupPercentage || 0,
            },
            wholesalePrice: {
              wholesaleUnitCost: item?.item?.wholesalePrice?.wholesaleSellingPrice || 0,
              wholesaleMarkupPercentage: item?.item?.wholesalePrice?.wholesaleMarkupPercentage || 0,
            },
          },
          item?.item?.unit as unknown as { _id: string; quantity: number; }[],
          item?.unit as string,
          selectedValue as string,
        )
    return sum + (price ?? 0) * item.quantity
  }, 0)
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const proceedValues = {
        ...values,
        products: cartItems.map((item: any) => ({
          ...item,
          productId: item.item._id,
          totalQuantity: calculateQuantity(
            item.unit,
            item.quantity,
            item.item.unit,
          ),
          subTotal: findManualPrice(
            item.item.manualPrice as Price,
            item.unit as string,
          ) * item.quantity,
        })),
        totalAmount: subtotal,
      };
      await createStockAdjustment(proceedValues, path);
      form.reset();
      playSuccessSound();
      router.push(`/${storeId}/dashboard/${branchId}/stock-adjustment/list-stock-adjustments`)
      toast({
        title: "Stock Adjustment created successfully",
        description: "Stock adjustment has been created successfully.",
        variant: "success",
      })
      console.log(proceedValues)
    } catch (error) {
      console.error("Error submitting form:", error);
      playErrorSound()
      toast({
        title: "Something went wrong",
        description: "Please try again later...",
        variant: "destructive",
      })

    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="w-full mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Add Stock Adjustment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              <FormField
                control={form.control}
                name="referenceNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference No</FormLabel>
                    <FormControl>
                      <Input placeholder="reference no" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adjustmentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Adjustment Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              " pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adjustmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adjustment</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="please select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="abnormal">Abnormal</SelectItem>
                        <SelectItem value="remove">Remove</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Card>
              <CardContent className="space-y-4">
                <ProductSearch currency={currency} branch={branch} />
                <div className="flex justify-end">
                  <p className="text-lg font-semibold">Total Amount: {currency} {subtotal.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell a little bit about why you made the adjustment"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="lg">
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}

