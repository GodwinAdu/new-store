"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CalendarIcon, User, Phone, Mail, MapPin, Shield, Car, X, Upload, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const driverSchema = z.object({
    // Personal Information
    firstName: z.string().min(2, "First name must be at least 2 characters").max(50, "First name too long"),
    lastName: z.string().min(2, "Last name must be at least 2 characters").max(50, "Last name too long"),
    email: z.string().email("Invalid email address"),
    phone: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .regex(/^\+?[\d\s\-()]+$/, "Invalid phone format"),
    alternatePhone: z.string().optional(),
    dateOfBirth: z.date({
        required_error: "Date of birth is required",
    }),

    // Address Information
    address: z.string().min(10, "Address must be at least 10 characters"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
    country: z.string().min(2, "Country is required"),

    // Employment Information
    employeeId: z.string().min(3, "Employee ID must be at least 3 characters"),
    hireDate: z.date({
        required_error: "Hire date is required",
    }),
    employmentType: z.enum(["full-time", "part-time", "contract", "temporary"]),
    department: z.string().min(2, "Department is required"),
    supervisor: z.string().min(2, "Supervisor name is required"),

    // License Information
    licenseNumber: z.string().min(5, "License number is required"),
    licenseClass: z.enum(["A", "B", "C", "CDL-A", "CDL-B", "CDL-C"]),
    licenseState: z.string().min(2, "License state is required"),
    licenseExpiry: z.date({
        required_error: "License expiry date is required",
    }),

    // Vehicle Specializations
    vehicleTypes: z.array(z.string()).min(1, "At least one vehicle type must be selected"),

    // Experience and Skills
    yearsExperience: z.number().min(0, "Experience cannot be negative").max(50, "Invalid experience"),
    previousEmployer: z.string().optional(),
    specialSkills: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),

    // Emergency Contact
    emergencyContactName: z.string().min(2, "Emergency contact name is required"),
    emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
    emergencyContactRelation: z.string().min(2, "Relationship is required"),

    // Medical and Background
    medicalClearance: z.boolean(),
    backgroundCheck: z.boolean(),
    drugTest: z.boolean(),

    // Additional Information
    notes: z.string().optional(),
    startDate: z.date({
        required_error: "Start date is required",
    }),
    salary: z.number().min(0, "Salary cannot be negative").optional(),
    isActive: z.boolean(),
})

type DriverFormValues = z.infer<typeof driverSchema>

interface CreateDriverDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreate: (data: DriverFormValues) => void
}

const employmentTypes = [
    { value: "full-time", label: "Full-time", description: "40+ hours per week" },
    { value: "part-time", label: "Part-time", description: "Less than 40 hours per week" },
    { value: "contract", label: "Contract", description: "Fixed-term contract" },
    { value: "temporary", label: "Temporary", description: "Temporary assignment" },
]

const licenseClasses = [
    { value: "C", label: "Class C", description: "Regular driver's license" },
    { value: "B", label: "Class B", description: "Large trucks, buses" },
    { value: "A", label: "Class A", description: "Tractor-trailers" },
    { value: "CDL-A", label: "CDL Class A", description: "Commercial - Heavy trucks" },
    { value: "CDL-B", label: "CDL Class B", description: "Commercial - Large trucks, buses" },
    { value: "CDL-C", label: "CDL Class C", description: "Commercial - Small hazmat vehicles" },
]

const vehicleTypeOptions = [
    "Bus",
    "Van",
    "Truck",
    "Car",
    "Motorcycle",
    "Emergency Vehicle",
    "School Bus",
    "Charter Bus",
    "Delivery Van",
    "Cargo Truck",
]

const skillOptions = [
    "Defensive Driving",
    "First Aid",
    "CPR",
    "Mechanical Knowledge",
    "GPS Navigation",
    "Customer Service",
    "Multi-language",
    "Night Driving",
    "Long Distance",
    "City Driving",
]

const languageOptions = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Chinese",
    "Japanese",
    "Korean",
    "Arabic",
]

const departments = [
    "Transportation",
    "Logistics",
    "Fleet Management",
    "Emergency Services",
    "School District",
    "Public Transit",
    "Delivery Services",
]

const states = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
]

export function CreateDriverDialog() {
    const [currentStep, setCurrentStep] = useState(1)
    const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([])
    const [selectedSkills, setSelectedSkills] = useState<string[]>([])
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

    const form = useForm<DriverFormValues>({
        resolver: zodResolver(driverSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            alternatePhone: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            country: "United States",
            employeeId: "",
            employmentType: "full-time",
            department: "",
            supervisor: "",
            licenseNumber: "",
            licenseClass: "C",
            licenseState: "",
            vehicleTypes: [],
            yearsExperience: 0,
            previousEmployer: "",
            specialSkills: [],
            languages: [],
            emergencyContactName: "",
            emergencyContactPhone: "",
            emergencyContactRelation: "",
            medicalClearance: false,
            backgroundCheck: false,
            drugTest: false,
            notes: "",
            salary: 0,
            isActive: true,
        },
    })

    const totalSteps = 5

    const onSubmit = (data: DriverFormValues) => {
        const finalData = {
            ...data,
            vehicleTypes: selectedVehicleTypes,
            specialSkills: selectedSkills,
            languages: selectedLanguages,
        }
        console.log("Driver Data Submitted:", finalData)
        form.reset()
        setCurrentStep(1)
        setSelectedVehicleTypes([])
        setSelectedSkills([])
        setSelectedLanguages([])

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

    const toggleVehicleType = (type: string) => {
        const updated = selectedVehicleTypes.includes(type)
            ? selectedVehicleTypes.filter((t) => t !== type)
            : [...selectedVehicleTypes, type]
        setSelectedVehicleTypes(updated)
        form.setValue("vehicleTypes", updated)
    }

    const toggleSkill = (skill: string) => {
        const updated = selectedSkills.includes(skill)
            ? selectedSkills.filter((s) => s !== skill)
            : [...selectedSkills, skill]
        setSelectedSkills(updated)
        form.setValue("specialSkills", updated)
    }

    const toggleLanguage = (language: string) => {
        const updated = selectedLanguages.includes(language)
            ? selectedLanguages.filter((l) => l !== language)
            : [...selectedLanguages, language]
        setSelectedLanguages(updated)
        form.setValue("languages", updated)
    }

    const generateEmployeeId = () => {
        const firstName = form.getValues("firstName")
        const lastName = form.getValues("lastName")
        if (firstName && lastName) {
            const id = `${firstName.substring(0, 2).toUpperCase()}${lastName.substring(0, 2).toUpperCase()}${Math.floor(
                Math.random() * 1000,
            )
                .toString()
                .padStart(3, "0")}`
            form.setValue("employeeId", id)
        }
    }

    const getStepTitle = (step: number) => {
        switch (step) {
            case 1:
                return "Personal Information"
            case 2:
                return "Address & Contact"
            case 3:
                return "Employment Details"
            case 4:
                return "License & Qualifications"
            case 5:
                return "Emergency Contact & Final Details"
            default:
                return "Driver Information"
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Create Driver</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Create New Driver
                    </DialogTitle>
                    <DialogDescription>
                        Add a new driver to your fleet. Complete all required information across {totalSteps} steps.
                    </DialogDescription>
                </DialogHeader>

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
                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <Avatar className="h-20 w-20 mx-auto mb-4">
                                        <AvatarFallback className="text-2xl">
                                            {form.watch("firstName")?.[0]}
                                            {form.watch("lastName")?.[0]}
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
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Smith" {...field} />
                                                </FormControl>
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
                                                    <Input type="email" placeholder="john.smith@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-1">
                                                    <Phone className="h-4 w-4" />
                                                    Phone Number *
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
                                        name="alternatePhone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Alternate Phone</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+1 (555) 987-6543" {...field} />
                                                </FormControl>
                                                <FormDescription>Optional secondary contact number</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="dateOfBirth"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Date of Birth *</FormLabel>
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
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
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
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Street Address *</FormLabel>
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
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="New York" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>State *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select state" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {states.map((state) => (
                                                            <SelectItem key={state} value={state}>
                                                                {state}
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
                                        name="zipCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ZIP Code *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="10001" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="United States" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Employment Details */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Employment Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="employeeId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Employee ID *</FormLabel>
                                                <div className="flex gap-2">
                                                    <FormControl>
                                                        <Input placeholder="EMP001" {...field} />
                                                    </FormControl>
                                                    <Button type="button" onClick={generateEmployeeId} variant="outline" size="sm">
                                                        Generate
                                                    </Button>
                                                </div>
                                                <FormDescription>Unique identifier for the employee</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="department"
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
                                                            <SelectItem key={dept} value={dept}>
                                                                {dept}
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
                                        name="employmentType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Employment Type *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {employmentTypes.map((type) => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                <div>
                                                                    <div className="font-medium">{type.label}</div>
                                                                    <div className="text-sm text-gray-500">{type.description}</div>
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
                                        name="supervisor"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Supervisor *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Jane Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="hireDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Hire Date *</FormLabel>
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
                                                            disabled={(date) => date > new Date()}
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
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Start Date *</FormLabel>
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
                                        name="salary"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Annual Salary (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="50000"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormDescription>Annual salary in USD</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="yearsExperience"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Years of Experience *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="50"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="previousEmployer"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Previous Employer (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ABC Transport Company" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* Step 4: License & Qualifications */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    License & Qualifications
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="licenseNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>License Number *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="D123456789" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="licenseClass"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>License Class *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {licenseClasses.map((license) => (
                                                            <SelectItem key={license.value} value={license.value}>
                                                                <div>
                                                                    <div className="font-medium">{license.label}</div>
                                                                    <div className="text-sm text-gray-500">{license.description}</div>
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
                                        name="licenseState"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>License State *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select state" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {states.map((state) => (
                                                            <SelectItem key={state} value={state}>
                                                                {state}
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
                                        name="licenseExpiry"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>License Expiry Date *</FormLabel>
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
                                                            disabled={(date) => date < new Date()}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Vehicle Types */}
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-1 font-medium">
                                        <Car className="h-4 w-4" />
                                        Vehicle Types Qualified to Drive *
                                    </Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                        {vehicleTypeOptions.map((type) => (
                                            <div
                                                key={type}
                                                onClick={() => toggleVehicleType(type)}
                                                className={cn(
                                                    "p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50",
                                                    selectedVehicleTypes.includes(type)
                                                        ? "border-blue-500 bg-blue-50 text-blue-700"
                                                        : "border-gray-200",
                                                )}
                                            >
                                                <div className="text-sm font-medium">{type}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {form.formState.errors.vehicleTypes && (
                                        <p className="text-sm text-red-500">{form.formState.errors.vehicleTypes.message}</p>
                                    )}
                                </div>

                                {/* Special Skills */}
                                <div className="space-y-3">
                                    <Label className="font-medium">Special Skills & Certifications</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {skillOptions.map((skill) => (
                                            <Badge
                                                key={skill}
                                                variant={selectedSkills.includes(skill) ? "default" : "outline"}
                                                className="cursor-pointer"
                                                onClick={() => toggleSkill(skill)}
                                            >
                                                {skill}
                                                {selectedSkills.includes(skill) && <X className="h-3 w-3 ml-1" />}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Languages */}
                                <div className="space-y-3">
                                    <Label className="font-medium">Languages Spoken</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {languageOptions.map((language) => (
                                            <Badge
                                                key={language}
                                                variant={selectedLanguages.includes(language) ? "default" : "outline"}
                                                className="cursor-pointer"
                                                onClick={() => toggleLanguage(language)}
                                            >
                                                {language}
                                                {selectedLanguages.includes(language) && <X className="h-3 w-3 ml-1" />}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Emergency Contact & Final Details */}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Emergency Contact</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="emergencyContactName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contact Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Jane Smith" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="emergencyContactPhone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contact Phone *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+1 (555) 987-6543" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="emergencyContactRelation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Relationship *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Spouse, Parent, Sibling" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator />

                                <h3 className="text-lg font-semibold">Medical & Background Clearances</h3>

                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="medicalClearance"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Medical Clearance Completed</FormLabel>
                                                    <FormDescription>Driver has passed required medical examination</FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="backgroundCheck"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Background Check Completed</FormLabel>
                                                    <FormDescription>Criminal background check has been completed</FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="drugTest"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Drug Test Completed</FormLabel>
                                                    <FormDescription>Pre-employment drug screening has been completed</FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Additional Notes</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Any additional information about the driver..."
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Optional notes about the driver&apos;s qualifications, restrictions, or special considerations
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Active Driver</FormLabel>
                                                <FormDescription>Driver is active and available for assignments</FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {/* Summary */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Driver Summary
                                    </h4>
                                    <div className="text-sm space-y-1">
                                        <p>
                                            <strong>Name:</strong> {form.watch("firstName")} {form.watch("lastName")}
                                        </p>
                                        <p>
                                            <strong>Employee ID:</strong> {form.watch("employeeId")}
                                        </p>
                                        <p>
                                            <strong>Department:</strong> {form.watch("department")}
                                        </p>
                                        <p>
                                            <strong>License:</strong> {form.watch("licenseClass")} - {form.watch("licenseNumber")}
                                        </p>
                                        <p>
                                            <strong>Vehicle Types:</strong> {selectedVehicleTypes.join(", ") || "None selected"}
                                        </p>
                                        <p>
                                            <strong>Experience:</strong> {form.watch("yearsExperience")} years
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
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>

                                {currentStep < totalSteps ? (
                                    <Button type="button" onClick={nextStep}>
                                        Next
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? "Creating Driver..." : "Create Driver"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
