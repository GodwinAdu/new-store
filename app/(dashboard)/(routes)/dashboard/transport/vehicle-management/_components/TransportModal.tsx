"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Loader2, PlusCircle } from "lucide-react"
import { format } from "date-fns"

import { Button, buttonVariants } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const formSchema = z.object({
    term: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    session: z
        .string()
        .min(2, {
            message: "Period is required (e.g., 2023-2024).",
        })
        .regex(/^\d{4}\s*-\s*\d{4}$/, {
            message: "Period must be in format YYYY - YYYY",
        }),
    startDate: z.date(),
    endDate: z.date(),
})

export function TransportModal() {
    const router = useRouter()
    const [open, setOpen] = useState(false)

    // Define your form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            term: "",
            startDate: undefined,
            endDate: undefined,
        },
    })

    const { isSubmitting, isDirty } = form.formState

    // Handle form submission
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {



            // Dismiss loading toast
            toast.success("Success! 🎉", {
                description: "New session was created successfully.",
                // variant: "success",
            })

            router.refresh()
            form.reset()
            setOpen(false)
        } catch (error) {
            console.error("Error creating session:", error)
            toast.error("Something went wrong", {
                description: "We couldn't create your session. Please try again.",
            })
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className={cn(buttonVariants(), "group transition-all duration-300 hover:shadow-md")}>
                        <PlusCircle className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90 duration-300" />
                        Add Session
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Create New Session</DialogTitle>
                        <DialogDescription>Set up an academic session with the relevant details.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                            <FormField
                                control={form.control}
                                name="term"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Term</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="eg. Please select Term" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {["First Term", "Second Term", "Third Term"].map((term) => (
                                                    <SelectItem key={term} value={term}>
                                                        {term}
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
                                name="session"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base">Academic Period</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="2023 - 2024"
                                                {...field}
                                                className="transition-all duration-300 focus:ring-2 focus:ring-offset-1"
                                            />
                                        </FormControl>
                                        <FormDescription>The academic year span (e.g., 2023 - 2024).</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-base">Start Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                    >
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date()}
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
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-base">End Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                    >
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date()}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    className="transition-all duration-300"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting || !isDirty} className="transition-all duration-300">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Session"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>


        </>
    )
}
