"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { stepOneSchema, stepTwoSchema } from "@/lib/validators/auth-schemas";
import { toast } from "sonner";



const calculateSetupPrice = (branches: number) => {
    if (branches === 1) {
        return 200;
    }
    return (branches / 5) * 500;
};

const SignupForm = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [setupPrice, setSetupPrice] = useState(500);
    const [isLoading,setIsLoading] = useState(false);

    const formStepOne = useForm<z.infer<typeof stepOneSchema>>({
        resolver: zodResolver(stepOneSchema),
        defaultValues: {
            storeName: "",
            storeEmail: "",
            numberOfBranches: "1",
        },
    });

    const formStepTwo = useForm<z.infer<typeof stepTwoSchema>>({
        resolver: zodResolver(stepTwoSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
        },
    });

    const numberOfBranches = formStepOne.watch("numberOfBranches");


    useEffect(() => {
        const branches = formStepOne.watch("numberOfBranches");
        setSetupPrice(calculateSetupPrice(Number(branches)));
    }, [numberOfBranches, formStepOne]);

    const handleNext = () => {
        formStepOne.trigger().then((isValid) => {
            if (isValid) setStep(2);
        });
    };

    const handlePrevious = () => setStep(1);

    const onSubmitStepTwo = async (values: z.infer<typeof stepTwoSchema>) => {
        try {
            setIsLoading(true);
            const formData = {
                ...formStepOne.getValues(),
                ...values,
            };

            // await signUpUser(formData)

            formStepOne.reset();
            formStepTwo.reset();
            toast.success("Registration Successful",{
                description: "Welcome to the store!",
            });
            router.push("/sign-in");
        } catch {

            toast.error("Something went wrong",{
                description: "Please try again later",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {step === 1 && (
                <Form {...formStepOne}>
                    <form className="space-y-4">
                        <FormField
                            control={formStepOne.control}
                            name="storeName"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center">
                                        <FormLabel htmlFor="storeName">Store Name</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Input placeholder="Eg. Awesome Store" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={formStepOne.control}
                            name="storeEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Store Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Eg. store@email.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={formStepOne.control}
                            name="numberOfBranches"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Number of Branches</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        defaultValue={String(field.value)}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select branches" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {[1, 5, 10, 15, 20, 25, 30].map((num) => (
                                                <SelectItem key={num} value={String(num)}>
                                                    {num}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <p className="text-gray-600">
                            Setup Price:{" "}
                            <span className="font-bold text-green-700">GH₵{setupPrice}</span> Monthly
                        </p>
                        <Button type="button" onClick={handleNext}>
                            Next
                        </Button>
                    </form>
                </Form>
            )}

            {step === 2 && (
                <Form {...formStepTwo}>
                    <form className="space-y-4" onSubmit={formStepTwo.handleSubmit(onSubmitStepTwo)}>
                        <FormField
                            control={formStepTwo.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Eg. John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={formStepTwo.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Eg. johndoe@email.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={formStepTwo.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Eg. ********" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-between">
                            <Button variant="destructive" onClick={handlePrevious}>
                                Previous
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button disabled={isLoading}>
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {isLoading ? "Please wait ..." : "Sign up"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            To complete the setup, you’ll need to make a payment of{" "}
                                            <span className="font-bold text-green-700">
                                                GH₵{setupPrice}
                                            </span>. Starting from next Month. This is a monthly subscription.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="text-red-500">Cancel</AlertDialogCancel>
                                        <AlertDialogAction>
                                            <Button
                                                onClick={() => {
                                                    formStepTwo.handleSubmit(onSubmitStepTwo)();
                                                }}
                                            >
                                                Register
                                            </Button>
                                        </AlertDialogAction>

                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    );
};

export default SignupForm;
