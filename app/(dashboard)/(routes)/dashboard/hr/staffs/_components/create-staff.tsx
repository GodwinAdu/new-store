"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    CalendarIcon,
    User,
    Phone,
    Mail,
    MapPin,
    X,
    Upload,
    AlertCircle,
    Clock,
    CreditCard,
    Briefcase,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

// Work Schedule Schema
const workScheduleSchema = z.object({
    day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
})

// Address Schema
const addressSchema = z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
})

// Card Details Schema
const cardDetailsSchema = z.object({
    idCardType: z.string().optional(),
    idCardNumber: z.string().optional(),
})

// Account Details Schema
const accountDetailsSchema = z.object({
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    accountType: z.string().optional(),
})

// Main Staff Schema
const staffSchema = z.object({

    // Basic Information
    username: z.string().min(3, "Username must be at least 3 characters").toLowerCase(),
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().optional(),
    emergencyNumber: z.string().optional(),
    dob: z.date().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.string().min(2, "Role is required"),
    avatarUrl: z.string().optional(),

    // Status Fields
    isActive: z.boolean(),
    availableAllSchedule: z.boolean(),
    requirePasswordChange: z.boolean(),

    // Address
    address: addressSchema.optional(),

    // Job Information
    jobTitle: z.string().optional(),
    departmentId: z.string().min(1, "Department is required"),
    workLocation: z.enum(["on-site", "remote", "hybrid"]).default("on-site"),
    startDate: z.date().optional(),

    // Work Schedule
    workSchedule: z.array(workScheduleSchema),

    // Warehouse (array of IDs)
    warehouse: z.array(z.string()),

    // Personal Details
    gender: z.enum(["male", "female", "other", "prefer-not-to-say"]).default("prefer-not-to-say"),
    bio: z.string().optional(),

    // Card and Account Details
    cardDetails: cardDetailsSchema.optional(),
    accountDetails: accountDetailsSchema.optional(),
})

type StaffFormValues = z.infer<typeof staffSchema>



const workLocations = [
    { value: "on-site", label: "On-site", description: "Work from office/facility" },
    { value: "remote", label: "Remote", description: "Work from home" },
    { value: "hybrid", label: "Hybrid", description: "Mix of on-site and remote" },
]

const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer-not-to-say", label: "Prefer not to say" },
]

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const idCardTypes = ["Driver's License", "Passport", "National ID", "Employee ID", "State ID", "Military ID"]

const accountTypes = ["Checking", "Savings", "Business Checking", "Business Savings"]

export function CreateStaffForm({ roles, departments }) {
    const [currentStep, setCurrentStep] = useState(1)
    const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([])
    const [workSchedule, setWorkSchedule] = useState<Array<{ day: string; startTime: string; endTime: string }>>([])

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            username: "",
            fullName: "",
            email: "",
            phoneNumber: "",
            emergencyNumber: "",
            password: "",
            role: "",
            avatarUrl: "",
            isActive: true,
            availableAllSchedule: false,
            requirePasswordChange: true,
            address: {
                street: "",
                city: "",
                state: "",
                country: "United States",
                zipCode: "",
            },
            jobTitle: "",
            departmentId: "",
            workLocation: "on-site",
            workSchedule: [],
            warehouse: [],
            gender: "prefer-not-to-say",
            bio: "",
            cardDetails: {
                idCardType: "",
                idCardNumber: "",
            },
            accountDetails: {
                accountName: "",
                accountNumber: "",
                accountType: "",
            },
        },
    })

    const totalSteps = 5

    const onSubmit = (data: StaffFormValues) => {
        const finalData = {
            ...data,
            warehouse: selectedWarehouses,
            workSchedule: workSchedule,
        }
        console.log("Staff Data Submitted:", finalData)
        form.reset()
        setCurrentStep(1)
        setSelectedWarehouses([])
        setWorkSchedule([])
    }

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const generateUsername = () => {
        const fullName = form.getValues("fullName")
        if (fullName && fullName.trim()) {
            const names = fullName.toLowerCase().trim().split(/\s+/) // Split by any whitespace
            let username = ""

            if (names.length === 1) {
                // Single name: use the name + random number
                username = `${names[0]}${Math.floor(Math.random() * 100)}`
            } else if (names.length === 2) {
                // Two names: first.last
                username = `${names[0]}.${names[1]}`
            } else {
                // Multiple names: first.last (using first and last name)
                username = `${names[0]}.${names[names.length - 1]}`
            }

            // Ensure username is lowercase and set it
            form.setValue("username", username.toLowerCase())
        }
    }

    const addWorkSchedule = () => {
        setWorkSchedule([...workSchedule, { day: "Monday", startTime: "09:00", endTime: "17:00" }])
    }

    const removeWorkSchedule = (index: number) => {
        setWorkSchedule(workSchedule.filter((_, i) => i !== index))
    }

    const updateWorkSchedule = (index: number, field: string, value: string) => {
        const updated = [...workSchedule]
        updated[index] = { ...updated[index], [field]: value }
        setWorkSchedule(updated)
        form.setValue("workSchedule", updated)
    }

    const getStepTitle = (step: number) => {
        switch (step) {
            case 1:
                return "Basic Information"
            case 2:
                return "Address & Contact"
            case 3:
                return "Job Details & Department"
            case 4:
                return "Work Schedule & Location"
            case 5:
                return "Additional Details & Documents"
            default:
                return "Staff Information"
        }
    }

    return (
        <>

            {/* Progress Indicator */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                        Step {currentStep} of {totalSteps}
                    </span>
                    <span className="text-sm text-gray-500">{getStepTitle(currentStep)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <Avatar className="h-20 w-20 mx-auto mb-4">
                                    <AvatarFallback className="text-2xl">
                                        {form
                                            .watch("fullName")
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <Button type="button" variant="outline" size="sm">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Photo
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="John Smith"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e)
                                                        // Auto-generate username when full name changes (if username is empty)
                                                        if (!form.getValues("username")) {
                                                            setTimeout(() => {
                                                                const fullName = e.target.value
                                                                if (fullName && fullName.trim()) {
                                                                    const names = fullName.toLowerCase().trim().split(/\s+/)
                                                                    let username = ""

                                                                    if (names.length === 1) {
                                                                        username = `${names[0]}${Math.floor(Math.random() * 100)}`
                                                                    } else if (names.length === 2) {
                                                                        username = `${names[0]}.${names[1]}`
                                                                    } else {
                                                                        username = `${names[0]}.${names[names.length - 1]}`
                                                                    }

                                                                    form.setValue("username", username.toLowerCase())
                                                                }
                                                            }, 100)
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username *</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input placeholder="john.smith" {...field} />
                                                </FormControl>
                                                <Button type="button" onClick={generateUsername} variant="outline" size="sm">
                                                    Generate
                                                </Button>
                                            </div>
                                            <FormDescription>Unique username for login</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1">
                                                <Mail className="h-4 w-4" />
                                                Email Address *
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="john.smith@company.com" {...field} />
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
                                            <FormLabel>Password *</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} />
                                            </FormControl>
                                            <FormDescription>Minimum 8 characters</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1">
                                                <Phone className="h-4 w-4" />
                                                Phone Number
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1 (555) 123-4567" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="emergencyNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Emergency Contact</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1 (555) 987-6543" {...field} />
                                            </FormControl>
                                            <FormDescription>Emergency contact number</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dob"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date of Birth</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                        defaultMonth={field.value || new Date(1990, 0)} // Default to 1990 if no value
                                                        captionLayout="dropdown"
                                                        startMonth={new Date(1970, 0)}
                                                        endMonth={new Date(new Date().getFullYear(), 0)}
                                                        autoFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>Select your date of birth</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {genderOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Address & Contact */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Address Information
                            </h3>

                            <FormField
                                control={form.control}
                                name="address.street"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Street Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 Main Street, Apt 4B" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <FormField
                                    control={form.control}
                                    name="address.city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="New York" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address.state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State</FormLabel>
                                            <FormControl>
                                                <Input placeholder="NY" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address.zipCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ZIP Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="10001" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address.country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input placeholder="United States" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Brief description about the staff member..."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Optional personal or professional bio</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {/* Step 3: Job Details & Department */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Job Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {roles.map((role) => (
                                                        <SelectItem key={role._id} value={role.displayName}>
                                                            {role.displayName}
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
                                    name="jobTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Senior Developer" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="departmentId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select department" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {departments.map((dept) => (
                                                        <SelectItem key={dept._id} value={dept._id}>
                                                            {dept.name}
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
                                    name="workLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Work Location</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {workLocations.map((location) => (
                                                        <SelectItem key={location.value} value={location.value}>
                                                            <div>
                                                                <div className="font-medium">{location.label}</div>
                                                                <div className="text-sm text-gray-500">{location.description}</div>
                                                            </div>
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
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Start Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                        >
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="font-medium">Status Settings</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="isActive"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Active Staff Member</FormLabel>
                                                    <FormDescription>Staff member is active and can access systems</FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="availableAllSchedule"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Available All Schedule</FormLabel>
                                                    <FormDescription>Available for work at any time</FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="requirePasswordChange"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Require Password Change</FormLabel>
                                                    <FormDescription>User must change password on first login</FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Work Schedule & Location */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Work Schedule
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="font-medium">Weekly Schedule</Label>
                                    <Button type="button" onClick={addWorkSchedule} variant="outline" size="sm">
                                        Add Schedule
                                    </Button>
                                </div>

                                {workSchedule.map((schedule, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                                        <Select value={schedule.day} onValueChange={(value) => updateWorkSchedule(index, "day", value)}>
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {daysOfWeek.map((day) => (
                                                    <SelectItem key={day} value={day}>
                                                        {day}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Input
                                            type="time"
                                            value={schedule.startTime}
                                            onChange={(e) => updateWorkSchedule(index, "startTime", e.target.value)}
                                            className="w-32"
                                        />

                                        <span className="text-sm text-gray-500">to</span>

                                        <Input
                                            type="time"
                                            value={schedule.endTime}
                                            onChange={(e) => updateWorkSchedule(index, "endTime", e.target.value)}
                                            className="w-32"
                                        />

                                        <Button type="button" onClick={() => removeWorkSchedule(index)} variant="outline" size="sm">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                {workSchedule.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No work schedule added yet. Click "Add Schedule" to create one.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Additional Details & Documents */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Card & Account Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium">ID Card Information</h4>
                                    <FormField
                                        control={form.control}
                                        name="cardDetails.idCardType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ID Card Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select ID type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {idCardTypes.map((type) => (
                                                            <SelectItem key={type} value={type}>
                                                                {type}
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
                                        name="cardDetails.idCardNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ID Card Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="ID123456789" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium">Bank Account Details</h4>
                                    <FormField
                                        control={form.control}
                                        name="accountDetails.accountName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Account Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Smith" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="accountDetails.accountNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Account Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="1234567890" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="accountDetails.accountType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Account Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select account type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {accountTypes.map((type) => (
                                                            <SelectItem key={type} value={type}>
                                                                {type}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Summary */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Staff Summary
                                </h4>
                                <div className="text-sm space-y-1">
                                    <p>
                                        <strong>Name:</strong> {form.watch("fullName")}
                                    </p>
                                    <p>
                                        <strong>Username:</strong> {form.watch("username")}
                                    </p>
                                    <p>
                                        <strong>Email:</strong> {form.watch("email")}
                                    </p>
                                    <p>
                                        <strong>Role:</strong> {form.watch("role")}
                                    </p>
                                    <p>
                                        <strong>Department:</strong> {form.watch("departmentId")}
                                    </p>
                                    <p>
                                        <strong>Work Location:</strong> {form.watch("workLocation")}
                                    </p>
                                    <p>
                                        <strong>Work Schedule:</strong> {workSchedule.length} entries
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6">
                        <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                            Previous
                        </Button>
                        <div className="flex gap-3">
                            {currentStep < totalSteps ? (
                                <Button type="button" onClick={nextStep}>
                                    Next
                                </Button>
                            ) : (
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? "Creating Staff..." : "Create Staff"}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </Form>
        </>
    )
}
