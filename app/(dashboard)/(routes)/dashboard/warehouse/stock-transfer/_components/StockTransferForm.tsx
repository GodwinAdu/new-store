"use client"

import { useState } from "react"
import { CalendarIcon, SearchIcon, Trash2Icon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn, findAutomatedPrice, findManualPrice } from "@/lib/utils"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ProductSearch } from "./ProductSearch"
import { useCartStockTransferStore } from "@/hooks/use-cart-stock-transfer"
import { IBranch } from "@/lib/models/branch.models"
import { useSelectSellingGroup } from "@/hooks/use-select-selling-group"

const formSchema = z.object({
  date: z.date(),
  referenceNo: z.string().optional(),
  status: z.string(),
  locationFrom: z.string(),
  locationTo: z.string(),
  shippingCharges: z.number().min(0).default(0),
  additionalNotes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

type Price = {
  unitId: {
    _id: string;
    name: string;
  };
  price: number;
  tax: number;
}[]


export default function StockTransferForm({ branch }: { branch: IBranch }) {
  const { cartItems } = useCartStockTransferStore();
  const { selectedValue } = useSelectSellingGroup()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      status: "",
      locationFrom: "",
      locationTo: "",
      shippingCharges: 0,
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

  function onSubmit(data: FormValues) {
    console.log(data,'data')
  }

  return (
    <Card className="w-full  mx-auto">
      <CardHeader>
        <CardTitle>Add Stock Transfer</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date*</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "MM/dd/yyyy HH:mm") : "Select date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenceNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference No:</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter reference number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in transit">In Transit</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="locationFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (From)*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="warehouse1">Warehouse 1</SelectItem>
                        <SelectItem value="warehouse2">Warehouse 2</SelectItem>
                        <SelectItem value="store1">Store 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locationTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (To)*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Please Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="warehouse1">Warehouse 1</SelectItem>
                        <SelectItem value="warehouse2">Warehouse 2</SelectItem>
                        <SelectItem value="store1">Store 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <Card>
              <CardContent className="space-y-4">
                <ProductSearch branch={branch} />
                <div className="flex justify-end">
                  <p className="text-lg font-semibold">Total Amount: {subtotal.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shippingCharges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipping Charges:</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter any additional notes here" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

