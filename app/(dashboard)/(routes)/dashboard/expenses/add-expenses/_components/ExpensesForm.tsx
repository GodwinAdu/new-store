"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon } from 'lucide-react'
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { playErrorSound, playSuccessSound } from "@/lib/audio"
import { createExpenses } from "@/lib/actions/expenses.actions"
import { useParams, usePathname, useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { paymentMethods } from '../../../../../../../../../lib/settings/store.settings';
import { getCurrencySymbol } from '@/lib/settings/store.settings';


const formSchema = z.object({
  categoryId: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  expenseDate: z.date(),
  referenceNo: z.string().optional(),
  expenseFor: z.string(),
  tax: z.coerce.number(),
  totalAmount: z.coerce.number(),
  expenseNote: z.string(),
  isRefund: z.boolean(),
  recurring: z.object({
    isRecurring: z.boolean(),
    recurringInterval: z.string(),
    repetition: z.coerce.number(),
  }),
  paymentDate: z.date(),
  paymentMethod: z.string(),
  paymentAmount: z.coerce.number(),
  account: z.string(),
})

interface Category {
  _id: string;
  name: string;
}

interface Account {
  _id: string;
  name: string;
}

interface ExpenseFormProps {
  accounts: Account[];
  categories: Category[];
  currency: string;
  paymentMethods: {
    name: string
  }[]
}

export default function ExpenseForm({ accounts, categories, currency, paymentMethods }: ExpenseFormProps) {
  const router = useRouter();
  const path = usePathname();
  const params = useParams();

  const { storeId, branchId } = params;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      expenseDate: new Date(),
      referenceNo: "",
      expenseFor: "",
      tax: 0,
      totalAmount: 0,
      expenseNote: "",
      isRefund: false,
      recurring: {
        isRecurring: false,
        recurringInterval: "1 day",
        repetition: 1,
      },
      paymentDate: new Date(),
      paymentMethod: "",
      paymentAmount: 0,
      account: "",
    },
  });

  const checkRefund = form.watch('isRefund')

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createExpenses(values, path)
      playSuccessSound();
      form.reset();
      router.push(`/${storeId}/dashboard/${branchId}/expenses/list-expenses`);
      toast({
        title: "Expense Created Successfully",
        description: "New expense was added successfully...",
        variant: "success",
      });

    } catch (error) {
      console.log('something went wrong', error);
      playErrorSound();
      toast({
        title: "Something went wrong",
        description: "An error occurred while creating the expense. Please try again later.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>Add Expense</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category._id} value={category._id}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expenseDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
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
                  name="referenceNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference No</FormLabel>
                      <FormControl>
                        <Input placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expenseFor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expenses For</FormLabel>
                      <FormControl>
                        <Input placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applicable Tax (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount <span>({currency})</span></FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Expense note</Label>
                <Textarea placeholder="Add any additional notes here" />
              </div>

              <FormField
                control={form.control}
                name="isRefund"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0  p-4 shadow">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Is Refund
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              {checkRefund !== true && (
                <div className="grid gap-4 md:grid-cols-3">

                  <FormField
                    control={form.control}
                    name="recurring.isRecurring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 ">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Is Recurring
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recurring.recurringInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recurring Intervals</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Select
                              onValueChange={(value) =>
                                field.onChange(`${field.value.split(" ")[0] || 1} ${value}`)
                              }
                              defaultValue="day"
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue placeholder="Select Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="day">Day</SelectItem>
                                <SelectItem value="week">Week</SelectItem>
                                <SelectItem value="month">Month</SelectItem>
                                <SelectItem value="year">Year</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              className="flex-1 ml-2"
                              placeholder="Enter value"
                              value={field.value.split(" ")[0]}
                              onChange={(e) =>
                                field.onChange(`${e.target.value} ${field.value.split(" ")[1] || "day"}`)
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recurring.repetition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No. of Repetition</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="No. of repetitions" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

              )}

              <CardHeader>
                <CardTitle>Add payment</CardTitle>
              </CardHeader>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="paymentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Amount <span>({currency})</span></FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="payment amount" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Payment Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
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
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethods.map(method => (
                            <SelectItem key={method.name} value={method.name}>
                              {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="account"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Account</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts?.map(account => (
                            <SelectItem key={account._id} value={account._id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


              <div className="flex justify-end">
                <Button type="submit">Save</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form >
  )
}

