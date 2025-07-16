"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    Shield,
    Search,
    Users,
    Package,
    ShoppingCart,
    FileText,
    CreditCard,
    Settings,
    BarChart3,
    Clock,
    Briefcase,
    TrendingUp,
    Home,
    DollarSign,
    ChevronDown,
    ChevronUp,
    Eye,
    Edit,
    Trash,
    CheckCircle2,
    XCircle,
    Info,
    Archive,
    Tag,
    Truck,
    Calculator,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

// Permission category definitions for POS system
const permissionCategories = {
    global: {
        title: "Global Access",
        icon: <Shield className="h-5 w-5" />,
        permissions: ["manageAccess", "manageOnlyPos"],
    },
    core: {
        title: "Core Modules",
        icon: <Home className="h-5 w-5" />,
        permissions: [
            "dashboard",
            "user",
            "product",
            "sales",
            "purchase",
            "stockTransfer",
            "stockAdjustment",
            "expenses",
            "paymentAccount",
            "report",
        ],
    },
    roles: {
        title: "Role Management",
        icon: <Users className="h-5 w-5" />,
        permissions: ["addRole", "manageRole", "viewRole", "editRole", "deleteRole"],
    },
    users: {
        title: "User Management",
        icon: <Users className="h-5 w-5" />,
        permissions: ["addUser", "manageUser", "viewUser", "editUser", "deleteUser"],
    },
    products: {
        title: "Product Management",
        icon: <Package className="h-5 w-5" />,
        permissions: [
            "listProduct",
            "addProduct",
            "manageProduct",
            "viewProduct",
            "editProduct",
            "deleteProduct",
            "manageImportProduct",
        ],
    },
    units: {
        title: "Unit Management",
        icon: <Calculator className="h-5 w-5" />,
        permissions: ["addUnit", "manageUnit", "viewUnit", "editUnit", "deleteUnit"],
    },
    brands: {
        title: "Brand Management",
        icon: <Tag className="h-5 w-5" />,
        permissions: ["addBrand", "manageBrand", "viewBrand", "editBrand", "deleteBrand"],
    },
    categories: {
        title: "Category Management",
        icon: <Archive className="h-5 w-5" />,
        permissions: ["addCategory", "manageCategory", "viewCategory", "editCategory", "deleteCategory"],
    },
    printLabels: {
        title: "Print Labels",
        icon: <FileText className="h-5 w-5" />,
        permissions: ["addPrintLabel", "managePrintLabel", "viewPrintLabel"],
    },
    variations: {
        title: "Product Variations",
        icon: <Settings className="h-5 w-5" />,
        permissions: ["addVariation", "manageVariation", "viewVariation", "editVariation", "deleteVariation"],
    },
    pricing: {
        title: "Pricing Management",
        icon: <DollarSign className="h-5 w-5" />,
        permissions: [
            "addSellingGroupPrice",
            "manageSellingGroupPrice",
            "viewSellingGroupPrice",
            "editSellingGroupPrice",
            "deleteSellingGroupPrice",
        ],
    },
    warranty: {
        title: "Warranty Management",
        icon: <Shield className="h-5 w-5" />,
        permissions: ["addWarrant", "manageWarrant", "viewWarrant", "editWarrant", "deleteWarrant"],
    },
    sales: {
        title: "Sales Management",
        icon: <ShoppingCart className="h-5 w-5" />,
        permissions: ["manageAllSales", "addSales", "manageSales", "viewSales", "editSales", "deleteSales", "importSales"],
    },
    orders: {
        title: "Order Management",
        icon: <FileText className="h-5 w-5" />,
        permissions: ["addOrder", "manageOrder", "viewOrder", "editOrder", "deleteOrder", "listOrder"],
    },
    returns: {
        title: "Returns Management",
        icon: <TrendingUp className="h-5 w-5" />,
        permissions: ["listSellReturn", "listPurchaseReturn"],
    },
    purchases: {
        title: "Purchase Management",
        icon: <Truck className="h-5 w-5" />,
        permissions: [
            "listPurchase",
            "addPurchase",
            "managePurchase",
            "viewPurchase",
            "editPurchase",
            "deletePurchase",
            "importPurchase",
        ],
    },
    stockTransfer: {
        title: "Stock Transfer",
        icon: <Archive className="h-5 w-5" />,
        permissions: [
            "listStockTransfer",
            "addStockTransfer",
            "manageStockTransfer",
            "viewStockTransfer",
            "editStockTransfer",
            "deleteStockTransfer",
        ],
    },
    stockAdjustment: {
        title: "Stock Adjustment",
        icon: <Settings className="h-5 w-5" />,
        permissions: [
            "listStockAdjustment",
            "addStockAdjustment",
            "manageStockAdjustment",
            "viewStockAdjustment",
            "editStockAdjustment",
            "deleteStockAdjustment",
        ],
    },
    expenseCategories: {
        title: "Expense Categories",
        icon: <FileText className="h-5 w-5" />,
        permissions: [
            "addExpensesCategory",
            "manageExpensesCategory",
            "viewExpensesCategory",
            "editExpensesCategory",
            "deleteExpensesCategory",
        ],
    },
    expenses: {
        title: "Expense Management",
        icon: <CreditCard className="h-5 w-5" />,
        permissions: ["addExpenses", "manageExpenses", "viewExpenses", "editExpenses", "deleteExpenses", "listExpenses"],
    },
    accounts: {
        title: "Account Management",
        icon: <DollarSign className="h-5 w-5" />,
        permissions: ["addListAccount", "manageListAccount", "viewListAccount", "editListAccount", "deleteListAccount"],
    },
    financialReports: {
        title: "Financial Reports",
        icon: <BarChart3 className="h-5 w-5" />,
        permissions: ["balanceSheet", "trialBalance", "cashFlow", "paymentAccountReport", "profitLostReport"],
    },
    businessReports: {
        title: "Business Reports",
        icon: <TrendingUp className="h-5 w-5" />,
        permissions: [
            "itemsReport",
            "registerReport",
            "expensesReport",
            "productSellReport",
            "productPurchaseReport",
            "sellReturnReport",
            "purchaseReturnReport",
            "stockTransferReport",
            "stockAdjustmentReport",
            "salesReport",
            "purchaseReport",
            "trendingProductReport",
            "stockExpiryReport",
            "stockReport",
            "taxReport",
            "saleRepresentativeReport",
            "customerSupplierReport",
            "hrReport"
        ],
    },
    hr: {
        title: "HR Management",
        icon: <Briefcase className="h-5 w-5" />,
        permissions: ["addHr", "viewHr", "editHr", "deleteHr", "manageHr"],
    },
    salary: {
        title: "Salary Requests",
        icon: <DollarSign className="h-5 w-5" />,
        permissions: [
            "addRequestSalary",
            "viewRequestSalary",
            "editRequestSalary",
            "deleteRequestSalary",
            "manageRequestSalary",
        ],
    },
    leave: {
        title: "Leave Requests",
        icon: <Clock className="h-5 w-5" />,
        permissions: [
            "addRequestLeave",
            "viewRequestLeave",
            "editRequestLeave",
            "deleteRequestLeave",
            "manageRequestLeave",
        ],
    },
    leaveCategory: {
        title: "Leave Categories",
        icon: <FileText className="h-5 w-5" />,
        permissions: [
            "addLeaveCategory",
            "viewLeaveCategory",
            "editLeaveCategory",
            "deleteLeaveCategory",
            "manageLeaveCategory",
        ],
    }
}

// Function to get a human-readable name from a camelCase permission key
const getReadableName = (key: string) => {
    // Handle special cases
    if (key === "hr") return "HR"
    if (key === "manageOnlyPos") return "POS Only Mode"
    if (key === "manageAccess") return "Full Access"

    // Convert camelCase to Title Case with spaces
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
}

interface IRole {
    _id: string
    name: string
    displayName: string
    description: string
    permissions: Record<string, boolean>
    createdAt: string
    updatedAt: string
    userCount: any[] // Array of user IDs or user objects
}

const RolesDisplayPage = ({ roles }: { roles: IRole[] }) => {
    const router = useRouter()

    const [selectedRole, setSelectedRole] = useState<IRole | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedSections, setExpandedSections] = useState<string[]>([])
    const [viewMode, setViewMode] = useState<"list" | "grid" | "comparison">("list")
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [roleToDelete, setRoleToDelete] = useState<IRole | null>(null)
    const [permissionFilter, setPermissionFilter] = useState<string>("all")

    // Set the first role as selected by default
    useEffect(() => {
        if (roles.length > 0 && !selectedRole) {
            setSelectedRole(roles[0])
        }
    }, [roles, selectedRole])

    // Function to count enabled permissions in a category for a role
    const countEnabledPermissions = (role: IRole, category: string) => {
        const permissions = permissionCategories[category as keyof typeof permissionCategories].permissions
        return permissions.filter((p) => role.permissions[p]).length
    }

    // Function to get total permissions in a category
    const getTotalPermissions = (category: string) => {
        return permissionCategories[category as keyof typeof permissionCategories].permissions.length
    }

    // Function to check if a permission matches the search term
    const matchesSearch = (permission: string) => {
        if (!searchTerm) return true

        const searchLower = searchTerm.toLowerCase()
        const permissionName = getReadableName(permission).toLowerCase()

        return permissionName.includes(searchLower)
    }

    // Toggle expanding/collapsing all sections
    const toggleAllSections = () => {
        if (expandedSections.length === Object.keys(permissionCategories).length) {
            setExpandedSections([])
        } else {
            setExpandedSections(Object.keys(permissionCategories))
        }
    }

    // Function to handle role deletion
    const handleDeleteRole = () => {
        if (roleToDelete) {
            // Filter out the role to delete
            // Note: This should be replaced with actual API call

            // If the deleted role was selected, select the first remaining role
            if (selectedRole && selectedRole._id === roleToDelete._id) {
                const remainingRoles = roles.filter((role) => role._id !== roleToDelete._id)
                setSelectedRole(remainingRoles.length > 0 ? remainingRoles[0] : null)
            }

            setShowDeleteDialog(false)
            setRoleToDelete(null)
        }
    }

    // Function to calculate the total number of permissions for a role
    const getTotalEnabledPermissions = (role: IRole) => {
        return Object.values(role.permissions).filter(Boolean).length
    }

    // Function to calculate the total number of all possible permissions
    const getTotalPossiblePermissions = () => {
        return Object.values(permissionCategories).reduce((total, category) => total + category.permissions.length, 0)
    }

    // Function to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date)
    }

    // Filter roles based on permission filter
    const filteredRoles = roles.filter((role) => {
        if (permissionFilter === "all") return true

        // Check if the role has the specific permission enabled
        return role.permissions[permissionFilter as keyof typeof role.permissions]
    })

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col space-y-8">
                {/* Header */}
                <div className="flex justify-end">
                    <div className="">
                        <Select value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "grid" | "comparison")}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="View Mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="list">List View</SelectItem>
                                <SelectItem value="grid">Grid View</SelectItem>
                                <SelectItem value="comparison">Comparison View</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Main Content */}
                {viewMode === "comparison" ? (
                    <RoleComparisonView roles={roles} />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Roles List */}
                        <Card className="lg:col-span-1">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Roles</CardTitle>
                                    <Badge variant="outline">{roles.length}</Badge>
                                </div>
                                <CardDescription>All available user roles for POS system</CardDescription>

                                <div className="mt-2 space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search roles..."
                                            className="pl-10"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <Select value={permissionFilter} onValueChange={setPermissionFilter}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Filter by permission" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            <SelectItem value="manageAccess">Global Access</SelectItem>
                                            <SelectItem value="dashboard">Dashboard Access</SelectItem>
                                            <SelectItem value="sales">Sales Management</SelectItem>
                                            <SelectItem value="product">Product Management</SelectItem>
                                            <SelectItem value="purchase">Purchase Management</SelectItem>
                                            <SelectItem value="expenses">Expense Management</SelectItem>
                                            <SelectItem value="paymentAccount">Payment Account</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="space-y-2">
                                    {viewMode === "list" ? (
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Role</TableHead>
                                                        <TableHead className="text-right">Users</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredRoles
                                                        .filter((role) =>
                                                            searchTerm
                                                                ? role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                                role.description.toLowerCase().includes(searchTerm.toLowerCase())
                                                                : true,
                                                        )
                                                        .map((role) => (
                                                            <TableRow key={role._id} className={selectedRole?._id === role._id ? "bg-muted/50" : ""}>
                                                                <TableCell className="font-medium cursor-pointer" onClick={() => setSelectedRole(role)}>
                                                                    <div>
                                                                        <div className="font-medium">{role.displayName}</div>
                                                                        <div className="text-sm text-muted-foreground">{role.description}</div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Badge variant="outline">{role?.userCount?.length || 0}</Badge>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon">
                                                                                <ChevronDown className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem
                                                                                onClick={() => setSelectedRole(role)}
                                                                                className="cursor-pointer"
                                                                            >
                                                                                <Eye className="mr-2 h-4 w-4" />
                                                                                View Details
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() =>
                                                                                    router.push(
                                                                                        `/dashboard/hr/manage-role/${role._id}`,
                                                                                    )
                                                                                }
                                                                                className="cursor-pointer"
                                                                            >
                                                                                <Edit className="mr-2 h-4 w-4" />
                                                                                Edit Role
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() => {
                                                                                    setRoleToDelete(role)
                                                                                    setShowDeleteDialog(true)
                                                                                }}
                                                                                className="cursor-pointer text-destructive focus:text-destructive"
                                                                            >
                                                                                <Trash className="mr-2 h-4 w-4" />
                                                                                Delete Role
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3">
                                            {filteredRoles
                                                .filter((role) =>
                                                    searchTerm
                                                        ? role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        role.description.toLowerCase().includes(searchTerm.toLowerCase())
                                                        : true,
                                                )
                                                .map((role) => (
                                                    <div
                                                        key={role._id}
                                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedRole?._id === role._id ? "bg-muted/50 border-primary" : ""
                                                            }`}
                                                        onClick={() => setSelectedRole(role)}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-medium">{role.displayName}</h3>
                                                                <p className="text-sm text-muted-foreground">{role.description}</p>
                                                            </div>
                                                            <Badge variant="outline">{role.userCount?.length || 0} users</Badge>
                                                        </div>

                                                        <div className="mt-3 flex items-center justify-between">
                                                            <div className="text-xs text-muted-foreground">Updated {formatDate(role?.updatedAt)}</div>

                                                            <div className="flex gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        router.push(
                                                                            `/dashboard/hr/manage-role/${role._id}`,
                                                                        )
                                                                    }}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        setRoleToDelete(role)
                                                                        setShowDeleteDialog(true)
                                                                    }}
                                                                >
                                                                    <Trash className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Role Details */}
                        {selectedRole && (
                            <Card className="lg:col-span-2">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-primary" />
                                            <CardTitle>{selectedRole.displayName}</CardTitle>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    router.push(`/dashboard/hr/manage-role/${selectedRole._id}`)
                                                }
                                                className="gap-1"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    setRoleToDelete(selectedRole)
                                                    setShowDeleteDialog(true)
                                                }}
                                                className="gap-1"
                                            >
                                                <Trash className="h-4 w-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>

                                    <CardDescription>{selectedRole.description}</CardDescription>

                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex flex-col p-3 border rounded-md">
                                            <span className="text-sm text-muted-foreground">Internal Name</span>
                                            <span className="font-medium">{selectedRole.name}</span>
                                        </div>

                                        <div className="flex flex-col p-3 border rounded-md">
                                            <span className="text-sm text-muted-foreground">Users Assigned</span>
                                            <span className="font-medium">{selectedRole?.userCount?.length || 0}</span>
                                        </div>

                                        <div className="flex flex-col p-3 border rounded-md">
                                            <span className="text-sm text-muted-foreground">Permissions</span>
                                            <span className="font-medium">
                                                {getTotalEnabledPermissions(selectedRole)} / {getTotalPossiblePermissions()}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    placeholder="Search permissions..."
                                                    className="w-[250px]"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />

                                                {searchTerm && (
                                                    <Badge variant="outline" className="gap-1">
                                                        <Search className="h-3 w-3" />
                                                        {searchTerm}
                                                    </Badge>
                                                )}
                                            </div>

                                            <Button type="button" variant="outline" size="sm" onClick={toggleAllSections} className="gap-1">
                                                {expandedSections.length === Object.keys(permissionCategories).length ? (
                                                    <>
                                                        <ChevronUp className="h-4 w-4" />
                                                        Collapse All
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="h-4 w-4" />
                                                        Expand All
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        <Accordion
                                            type="multiple"
                                            value={expandedSections}
                                            onValueChange={setExpandedSections}
                                            className="space-y-4"
                                        >
                                            {Object.entries(permissionCategories).map(([category, { title, icon, permissions }]) => {
                                                const enabledCount = countEnabledPermissions(selectedRole, category)
                                                const totalCount = getTotalPermissions(category)
                                                const hasMatchingPermissions = permissions.some((permission) => matchesSearch(permission))

                                                if (searchTerm && !hasMatchingPermissions) return null

                                                return (
                                                    <AccordionItem key={category} value={category} className="border rounded-lg overflow-hidden">
                                                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                                            <div className="flex items-center justify-between w-full">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">{icon}</div>
                                                                    <div>
                                                                        <h3 className="font-medium text-left">{title}</h3>
                                                                        <p className="text-sm text-muted-foreground text-left">
                                                                            {enabledCount} of {totalCount} permissions enabled
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <Badge
                                                                    variant={enabledCount > 0 ? "default" : "outline"}
                                                                    className={enabledCount === 0 ? "text-muted-foreground" : ""}
                                                                >
                                                                    {enabledCount === totalCount
                                                                        ? "Full Access"
                                                                        : enabledCount > 0
                                                                            ? "Partial Access"
                                                                            : "No Access"}
                                                                </Badge>
                                                            </div>
                                                        </AccordionTrigger>

                                                        <AccordionContent className="px-4 py-3 border-t bg-white dark:bg-gray-950">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {permissions.map((permission) => {
                                                                    if (searchTerm && !matchesSearch(permission)) return null

                                                                    const isEnabled = selectedRole.permissions[permission]

                                                                    return (
                                                                        <div key={permission} className="flex items-start gap-3 p-3 rounded-md border">
                                                                            {isEnabled ? (
                                                                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                                                            ) : (
                                                                                <XCircle className="h-5 w-5 text-gray-300 dark:text-gray-600 mt-0.5" />
                                                                            )}

                                                                            <div>
                                                                                <div className="font-medium">{getReadableName(permission)}</div>
                                                                                <div className="text-sm text-muted-foreground">
                                                                                    {isEnabled ? "Enabled" : "Disabled"}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                )
                                            })}
                                        </Accordion>
                                    </div>
                                </CardContent>

                                <CardFooter className="border-t bg-muted/50 flex justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Last updated: {formatDate(selectedRole.updatedAt)}
                                    </div>

                                    <div className="text-sm text-muted-foreground">Created: {formatDate(selectedRole.createdAt)}</div>
                                </CardFooter>
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Role</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the role `{roleToDelete?.displayName}`? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {roleToDelete && (roleToDelete.userCount?.length || 0) > 0 && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 my-2">
                            <div className="flex items-start gap-2">
                                <Info className="h-5 w-5 text-amber-500 mt-0.5" />
                                <div>
                                    <p className="font-medium">Warning: Users will be affected</p>
                                    <p className="text-sm">
                                        This role is currently assigned to {roleToDelete.userCount?.length || 0} users. Deleting it will
                                        remove these permissions from those users.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteRole}>
                            Delete Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// Role Comparison View Component
const RoleComparisonView = ({ roles }: { roles: IRole[] }) => {
    const [selectedRoles, setSelectedRoles] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState("")

    // Toggle role selection for comparison
    const toggleRoleSelection = (roleId: string) => {
        if (selectedRoles.includes(roleId)) {
            setSelectedRoles(selectedRoles.filter((id) => id !== roleId))
        } else {
            setSelectedRoles([...selectedRoles, roleId])
        }
    }

    // Get selected roles data
    const selectedRolesData = roles.filter((role) => selectedRoles.includes(role._id as string))

    // Function to check if a permission matches the search term
    const matchesSearch = (permission: string) => {
        if (!searchTerm) return true

        const searchLower = searchTerm.toLowerCase()
        const permissionName = getReadableName(permission).toLowerCase()

        return permissionName.includes(searchLower)
    }

    // Filter categories based on search
    const filteredCategories = Object.entries(permissionCategories).filter(([_, { permissions }]) => {
        if (!searchTerm) return true
        return permissions.some((permission) => matchesSearch(permission))
    })

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Role Comparison</CardTitle>
                    <CardDescription>Select roles to compare their permissions side by side</CardDescription>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {roles.map((role) => (
                            <Badge
                                key={role._id}
                                variant={selectedRoles.includes(role._id as string) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => toggleRoleSelection(role._id as string)}
                            >
                                {role.displayName}
                                {selectedRoles.includes(role._id as string) && <XCircle className="ml-1 h-3 w-3" />}
                            </Badge>
                        ))}
                    </div>
                </CardHeader>

                <CardContent>
                    {selectedRolesData.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Select roles above to compare their permissions
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search permissions..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-1/3">Permission</TableHead>
                                            {selectedRolesData.map((role) => (
                                                <TableHead key={role._id}>{role.displayName}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCategories.map(([category, { title, permissions }]) => (
                                            <React.Fragment key={category}>
                                                <TableRow className="bg-muted/50">
                                                    <TableCell colSpan={selectedRolesData.length + 1} className="font-bold">
                                                        {title}
                                                    </TableCell>
                                                </TableRow>

                                                {permissions
                                                    .filter((permission) => matchesSearch(permission))
                                                    .map((permission) => (
                                                        <TableRow key={permission}>
                                                            <TableCell>{getReadableName(permission)}</TableCell>
                                                            {selectedRolesData.map((role) => (
                                                                <TableCell key={`${role._id}-${permission}`}>
                                                                    {role.permissions[permission] ? (
                                                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                                    ) : (
                                                                        <XCircle className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                                                                    )}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                            </React.Fragment>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default RolesDisplayPage
