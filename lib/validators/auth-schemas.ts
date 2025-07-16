import { z } from "zod";

export const stepOneSchema = z.object({
    storeName: z.string().min(2, {
        message: "Store name must be at least 2 characters.",
    })
        .trim(),
    storeEmail: z.string().min(2, {
        message: "Store email is required.",
    })
        .trim(),
    numberOfBranches: z.coerce.string(),
});

export const stepTwoSchema = z.object({
    fullName: z.string().min(2, {
        message: "Full name must be at least 2 characters.",
    })
        .trim(),
    email: z.string().email({
        message: "Invalid email address.",
    })
        .trim(),
    password: z
        .string()
        .min(8, { message: 'Be at least 8 characters long' })
        .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
        .regex(/[0-9]/, { message: 'Contain at least one number.' })
        .regex(/[^a-zA-Z0-9]/, {
            message: 'Contain at least one special character.',
        })
        .trim(),
});

export const LoginFormSchema = z.object({
    email: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }).trim(),
    password: z
        .string()
        .min(8, { message: 'Be at least 8 characters long' })
        .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
        .regex(/[0-9]/, { message: 'Contain at least one number.' })
        .regex(/[^a-zA-Z0-9]/, {
            message: 'Contain at least one special character.',
        })
        .trim(),
        rememberMe:z.boolean()
})