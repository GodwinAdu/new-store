"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { useRouter } from "next/navigation"

import Link from "next/link"
import { LoginFormSchema } from "@/lib/validators/auth-schemas"
import { toast } from "sonner"
import { loginStaff } from "@/lib/actions/employee.actions"
import { Checkbox } from "@/components/ui/checkbox"


const LoginForm = () => {
    const router = useRouter()
    // 1. Define your form.
    const form = useForm<z.infer<typeof LoginFormSchema>>({
        resolver: zodResolver(LoginFormSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false
        },
    })

    const { isSubmitting } = form.formState

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof LoginFormSchema>) {
        try {
            await loginStaff(values)

            toast.success("Logged In Successfully", {
                description: "Welcome back!",
            });

            router.push(`/dashboard`);

            form.reset();
        } catch {
            toast.error("Something went wrong", {
                description: "Please try again later",
            })

        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center">
                                <FormLabel htmlFor="password">Email</FormLabel>
                            </div>
                            <FormControl>
                                <Input type="email" placeholder="Eg. johndoe12@example.com" {...field} />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center">
                                <FormLabel htmlFor="password">Password</FormLabel>
                                <Link
                                    href="/forget_password"
                                    className="ml-auto text-sm underline-offset-2 hover:underline"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                            <FormControl>
                                <Input type="password" placeholder="password" {...field} />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Remember me</FormLabel>
                                <FormDescription>Stay logged in on this device for 30days</FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                <Button disabled={isSubmitting} className="w-full" type="submit">{
                    isSubmitting ? "Please wait..." : "Log In"
                }</Button>
            </form>
        </Form>
    )
}

export default LoginForm
