"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Search,
    Download,
    Eye,
    Edit,
    Trash2,
    Plus,
    Building2,
    Phone,
    Mail,
    MapPin,
    Star,
    DollarSign,
    Package,
    Users,
    MessageSquare,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Clock,
    FileText,
    Send,
    History,
    Settings,
} from "lucide-react"
import { useState } from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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
} from "@/components/ui/alert-dialog"

interface Supplier {
    id: string
    name: string
    contactPerson: string
    email: string
    phone: string
    address: string
    city: string
    country: string
    status: "active" | "inactive" | "pending"
    rating: number
    totalOrders: number
    totalSpent: number
    paymentTerms: string
    category: string
    joinDate: string
    lastOrderDate: string
    website?: string
    taxId?: string
    bankAccount?: string
    creditLimit: number
    currentBalance: number
}

interface Order {
    id: string
    orderNumber: string
    date: string
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
    total: number
    items: number
    expectedDelivery: string
}


const mockSuppliers: Supplier[] = [
    {
        id: "1",
        name: "Fresh Farms Ltd",
        contactPerson: "John Smith",
        email: "john@freshfarms.com",
        phone: "+1 (555) 123-4567",
        address: "123 Farm Road",
        city: "Springfield",
        country: "USA",
        status: "active",
        rating: 4.8,
        totalOrders: 45,
        totalSpent: 125000,
        paymentTerms: "Net 30",
        category: "Poultry Supplier",
        joinDate: "2023-01-15",
        lastOrderDate: "2024-01-10",
        website: "www.freshfarms.com",
        taxId: "TAX-123456789",
        bankAccount: "****-****-****-1234",
        creditLimit: 50000,
        currentBalance: 12500,
    },
    {
        id: "2",
        name: "Poultry Express",
        contactPerson: "Sarah Johnson",
        email: "sarah@poultryexpress.com",
        phone: "+1 (555) 234-5678",
        address: "456 Chicken Lane",
        city: "Farmville",
        country: "USA",
        status: "active",
        rating: 4.5,
        totalOrders: 32,
        totalSpent: 89000,
        paymentTerms: "Net 15",
        category: "Poultry Supplier",
        joinDate: "2023-03-20",
        lastOrderDate: "2024-01-08",
        website: "www.poultryexpress.com",
        taxId: "TAX-987654321",
        bankAccount: "****-****-****-5678",
        creditLimit: 35000,
        currentBalance: 8900,
    },
    {
        id: "3",
        name: "Quality Chicken Co",
        contactPerson: "Mike Wilson",
        email: "mike@qualitychicken.com",
        phone: "+1 (555) 345-6789",
        address: "789 Quality Street",
        city: "Chickentown",
        country: "USA",
        status: "active",
        rating: 4.9,
        totalOrders: 67,
        totalSpent: 198000,
        paymentTerms: "Net 30",
        category: "Premium Supplier",
        joinDate: "2022-11-10",
        lastOrderDate: "2024-01-12",
        website: "www.qualitychicken.com",
        taxId: "TAX-456789123",
        bankAccount: "****-****-****-9012",
        creditLimit: 75000,
        currentBalance: 19800,
    },
    {
        id: "4",
        name: "Farm Direct",
        contactPerson: "Lisa Brown",
        email: "lisa@farmdirect.com",
        phone: "+1 (555) 456-7890",
        address: "321 Direct Road",
        city: "Countryside",
        country: "USA",
        status: "pending",
        rating: 4.2,
        totalOrders: 12,
        totalSpent: 28000,
        paymentTerms: "Net 45",
        category: "Local Supplier",
        joinDate: "2024-01-05",
        lastOrderDate: "2024-01-05",
        website: "www.farmdirect.com",
        taxId: "TAX-789123456",
        bankAccount: "****-****-****-3456",
        creditLimit: 20000,
        currentBalance: 2800,
    },
    {
        id: "5",
        name: "Premium Poultry",
        contactPerson: "David Lee",
        email: "david@premiumpoultry.com",
        phone: "+1 (555) 567-8901",
        address: "654 Premium Ave",
        city: "Luxuryville",
        country: "USA",
        status: "inactive",
        rating: 3.8,
        totalOrders: 8,
        totalSpent: 15000,
        paymentTerms: "Net 60",
        category: "Premium Supplier",
        joinDate: "2023-08-12",
        lastOrderDate: "2023-12-15",
        website: "www.premiumpoultry.com",
        taxId: "TAX-321654987",
        bankAccount: "****-****-****-7890",
        creditLimit: 25000,
        currentBalance: 1500,
    },
]

const mockOrders: Order[] = [
    {
        id: "1",
        orderNumber: "PO-2024-001",
        date: "2024-01-10",
        status: "delivered",
        total: 15000,
        items: 25,
        expectedDelivery: "2024-01-12",
    },
    {
        id: "2",
        orderNumber: "PO-2024-002",
        date: "2024-01-08",
        status: "shipped",
        total: 8500,
        items: 18,
        expectedDelivery: "2024-01-15",
    },
    {
        id: "3",
        orderNumber: "PO-2024-003",
        date: "2024-01-05",
        status: "confirmed",
        total: 12000,
        items: 22,
        expectedDelivery: "2024-01-18",
    },
]


const getStatusBadge = (status: string) => {
    const statusConfig = {
        active: { label: "Active", variant: "default" as const, icon: CheckCircle },
        inactive: { label: "Inactive", variant: "secondary" as const, icon: AlertTriangle },
        pending: { label: "Pending", variant: "default" as const, icon: Clock },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon
    return (
        <Badge variant={config.variant} className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    )
}

const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
        pending: { label: "Pending", variant: "secondary" as const },
        confirmed: { label: "Confirmed", variant: "default" as const },
        shipped: { label: "Shipped", variant: "default" as const },
        delivered: { label: "Delivered", variant: "default" as const },
        cancelled: { label: "Cancelled", variant: "destructive" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
}


const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
        <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
    ))
}

export default function AllSupplier() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isOrdersOpen, setIsOrdersOpen] = useState(false)
    const [isMessageOpen, setIsMessageOpen] = useState(false)
    const [messageContent, setMessageContent] = useState("")
    const [messageSubject, setMessageSubject] = useState("")

    const filteredSuppliers = mockSuppliers.filter((supplier) => {
        const matchesSearch =
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || supplier.status === statusFilter
        const matchesCategory = categoryFilter === "all" || supplier.category === categoryFilter

        return matchesSearch && matchesStatus && matchesCategory
    })

    const totalSuppliers = mockSuppliers.length
    const activeSuppliers = mockSuppliers.filter((supplier) => supplier.status === "active").length
    const totalSpent = mockSuppliers.reduce((sum, supplier) => sum + supplier.totalSpent, 0)
    const averageRating = mockSuppliers.reduce((sum, supplier) => sum + supplier.rating, 0) / mockSuppliers.length

    const handleViewProfile = (supplier: Supplier) => {
        setSelectedSupplier(supplier)
        setIsProfileOpen(true)
    }

    const handleEditSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier)
        setIsEditOpen(true)
    }

    const handleViewOrders = (supplier: Supplier) => {
        setSelectedSupplier(supplier)
        setIsOrdersOpen(true)
    }

    const handleSendMessage = (supplier: Supplier) => {
        setSelectedSupplier(supplier)
        setIsMessageOpen(true)
    }

    const handleDeactivateSupplier = (supplier: Supplier) => {
        // Handle deactivation logic here
        console.log("Deactivating supplier:", supplier.name)
    }

    const handleSendMessageSubmit = () => {
        // Handle message sending logic here
        console.log("Sending message to:", selectedSupplier?.name)
        console.log("Subject:", messageSubject)
        console.log("Content:", messageContent)
        setIsMessageOpen(false)
        setMessageSubject("")
        setMessageContent("")
    }

    return (
        <>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Supplier Management</h1>
                        <p className="text-muted-foreground">Manage supplier relationships and procurement partners</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Supplier
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Add New Supplier</DialogTitle>
                                    <DialogDescription>Add a new supplier to your procurement network</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="supplier-name">Supplier Name</Label>
                                            <Input id="supplier-name" placeholder="Company name" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact-person">Contact Person</Label>
                                            <Input id="contact-person" placeholder="Full name" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" placeholder="email@company.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input id="phone" placeholder="+1 (555) 123-4567" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input id="address" placeholder="Street address" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input id="city" placeholder="City" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="country">Country</Label>
                                            <Input id="country" placeholder="Country" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category</Label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="poultry-supplier">Poultry Supplier</SelectItem>
                                                    <SelectItem value="premium-supplier">Premium Supplier</SelectItem>
                                                    <SelectItem value="local-supplier">Local Supplier</SelectItem>
                                                    <SelectItem value="feed-supplier">Feed Supplier</SelectItem>
                                                    <SelectItem value="equipment-supplier">Equipment Supplier</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="payment-terms">Payment Terms</Label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select terms" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="net-15">Net 15</SelectItem>
                                                    <SelectItem value="net-30">Net 30</SelectItem>
                                                    <SelectItem value="net-45">Net 45</SelectItem>
                                                    <SelectItem value="net-60">Net 60</SelectItem>
                                                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea id="notes" placeholder="Additional information about the supplier..." />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => setIsCreateDialogOpen(false)}>Add Supplier</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalSuppliers}</div>
                            <p className="text-xs text-muted-foreground">+3 from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeSuppliers}</div>
                            <p className="text-xs text-muted-foreground">
                                {Math.round((activeSuppliers / totalSuppliers) * 100)}% of total
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">+12% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                            <div className="flex items-center mt-1">{getRatingStars(averageRating)}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Suppliers</CardTitle>
                                <CardDescription>View and manage all suppliers</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search suppliers..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 w-[300px]"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[130px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="Poultry Supplier">Poultry Supplier</SelectItem>
                                        <SelectItem value="Premium Supplier">Premium Supplier</SelectItem>
                                        <SelectItem value="Local Supplier">Local Supplier</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="all" className="w-full">
                            <TabsList>
                                <TabsTrigger value="all">All Suppliers</TabsTrigger>
                                <TabsTrigger value="active">Active</TabsTrigger>
                                <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
                                <TabsTrigger value="recent">Recent</TabsTrigger>
                            </TabsList>
                            <TabsContent value="all" className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Supplier</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Payment Terms</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSuppliers.map((supplier) => (
                                            <TableRow key={supplier.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage
                                                                src={`/placeholder.svg?height=32&width=32&text=${supplier.name.charAt(0)}`}
                                                            />
                                                            <AvatarFallback>{supplier.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{supplier.name}</div>
                                                            <div className="text-sm text-muted-foreground">{supplier.contactPerson}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Mail className="h-3 w-3" />
                                                            {supplier.email}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Phone className="h-3 w-3" />
                                                            {supplier.phone}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        <span className="text-sm">
                                                            {supplier.city}, {supplier.country}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                                                <TableCell>{supplier.category}</TableCell>
                                                {/* <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <div className="flex">{getRatingStars(supplier.rating)}</div>
                                                        <span className="text-sm font-medium">{supplier.rating}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{supplier.totalOrders}</TableCell>
                                                <TableCell>${supplier.totalSpent.toLocaleString()}</TableCell> */}
                                                <TableCell>{supplier.paymentTerms}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <Settings className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleViewProfile(supplier)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Profile
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEditSupplier(supplier)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Supplier
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleViewOrders(supplier)}>
                                                                <Package className="mr-2 h-4 w-4" />
                                                                View Orders
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleSendMessage(supplier)}>
                                                                <MessageSquare className="mr-2 h-4 w-4" />
                                                                Send Message
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Deactivate
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This will deactivate the supplier "{supplier.name}". They will no longer be able
                                                                            to receive new orders, but existing orders will remain intact.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDeactivateSupplier(supplier)}
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        >
                                                                            Deactivate
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                            <TabsContent value="active">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Supplier</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Rating</TableHead>
                                            <TableHead>Orders</TableHead>
                                            <TableHead>Total Spent</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSuppliers
                                            .filter((supplier) => supplier.status === "active")
                                            .map((supplier) => (
                                                <TableRow key={supplier.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage
                                                                    src={`/placeholder.svg?height=32&width=32&text=${supplier.name.charAt(0)}`}
                                                                />
                                                                <AvatarFallback>{supplier.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{supplier.name}</div>
                                                                <div className="text-sm text-muted-foreground">{supplier.contactPerson}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="text-sm">{supplier.email}</div>
                                                            <div className="text-sm text-muted-foreground">{supplier.phone}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <div className="flex">{getRatingStars(supplier.rating)}</div>
                                                            <span className="text-sm font-medium">{supplier.rating}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{supplier.totalOrders}</TableCell>
                                                    <TableCell>${supplier.totalSpent.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button size="sm" variant="outline">
                                                            Create Order
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                            <TabsContent value="top-rated">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Supplier</TableHead>
                                            <TableHead>Rating</TableHead>
                                            <TableHead>Orders</TableHead>
                                            <TableHead>Total Spent</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSuppliers
                                            .filter((supplier) => supplier.rating >= 4.5)
                                            .sort((a, b) => b.rating - a.rating)
                                            .map((supplier) => (
                                                <TableRow key={supplier.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage
                                                                    src={`/placeholder.svg?height=32&width=32&text=${supplier.name.charAt(0)}`}
                                                                />
                                                                <AvatarFallback>{supplier.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{supplier.name}</div>
                                                                <div className="text-sm text-muted-foreground">{supplier.contactPerson}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <div className="flex">{getRatingStars(supplier.rating)}</div>
                                                            <span className="text-sm font-medium">{supplier.rating}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{supplier.totalOrders}</TableCell>
                                                    <TableCell>${supplier.totalSpent.toLocaleString()}</TableCell>
                                                    <TableCell>{supplier.category}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button size="sm">Create Order</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                            <TabsContent value="recent">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Supplier</TableHead>
                                            <TableHead>Join Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Orders</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSuppliers
                                            .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
                                            .slice(0, 10)
                                            .map((supplier) => (
                                                <TableRow key={supplier.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage
                                                                    src={`/placeholder.svg?height=32&width=32&text=${supplier.name.charAt(0)}`}
                                                                />
                                                                <AvatarFallback>{supplier.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{supplier.name}</div>
                                                                <div className="text-sm text-muted-foreground">{supplier.contactPerson}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{new Date(supplier.joinDate).toLocaleDateString()}</TableCell>
                                                    <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                                                    <TableCell>{supplier.category}</TableCell>
                                                    <TableCell>{supplier.totalOrders}</TableCell>
                                                    <TableCell className="text-right">
                                                        {supplier.status === "pending" ? (
                                                            <div className="flex gap-2 justify-end">
                                                                <Button size="sm" variant="outline">
                                                                    Approve
                                                                </Button>
                                                                <Button size="sm" variant="destructive">
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button size="sm" variant="outline">
                                                                View Profile
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Supplier Profile Sheet */}
            <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <SheetContent className="w-[600px] sm:w-[800px]">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${selectedSupplier?.name.charAt(0)}`} />
                                <AvatarFallback>{selectedSupplier?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {selectedSupplier?.name}
                        </SheetTitle>
                        <SheetDescription>Complete supplier profile and relationship details</SheetDescription>
                    </SheetHeader>

                    {selectedSupplier && (
                        <div className="mt-6 space-y-6">
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="financial">Financial</TabsTrigger>
                                    <TabsTrigger value="performance">Performance</TabsTrigger>
                                    <TabsTrigger value="documents">Documents</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-4">
                                    <div className="grid gap-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Contact Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span>{selectedSupplier.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span>{selectedSupplier.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    <span>
                                                        {selectedSupplier.address}, {selectedSupplier.city}, {selectedSupplier.country}
                                                    </span>
                                                </div>
                                                {selectedSupplier.website && (
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                                        <span>{selectedSupplier.website}</span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Business Details</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-sm font-medium">Category</Label>
                                                        <p className="text-sm text-muted-foreground">{selectedSupplier.category}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">Status</Label>
                                                        <div className="mt-1">{getStatusBadge(selectedSupplier.status)}</div>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">Payment Terms</Label>
                                                        <p className="text-sm text-muted-foreground">{selectedSupplier.paymentTerms}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium">Rating</Label>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <div className="flex">{getRatingStars(selectedSupplier.rating)}</div>
                                                            <span className="text-sm font-medium">{selectedSupplier.rating}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="financial" className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Financial Summary</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Total Spent:</span>
                                                        <span className="font-medium">${selectedSupplier.totalSpent.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Current Balance:</span>
                                                        <span className="font-medium">${selectedSupplier.currentBalance.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Credit Limit:</span>
                                                        <span className="font-medium">${selectedSupplier.creditLimit.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm">Available Credit:</span>
                                                        <span className="font-medium text-green-600">
                                                            ${(selectedSupplier.creditLimit - selectedSupplier.currentBalance).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">Payment Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div>
                                                    <Label className="text-sm font-medium">Payment Terms</Label>
                                                    <p className="text-sm text-muted-foreground">{selectedSupplier.paymentTerms}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium">Tax ID</Label>
                                                    <p className="text-sm text-muted-foreground">{selectedSupplier.taxId}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium">Bank Account</Label>
                                                    <p className="text-sm text-muted-foreground">{selectedSupplier.bankAccount}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="performance" className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{selectedSupplier.totalOrders}</div>
                                                <p className="text-xs text-muted-foreground">Since {selectedSupplier.joinDate}</p>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    ${Math.round(selectedSupplier.totalSpent / selectedSupplier.totalOrders).toLocaleString()}
                                                </div>
                                                <p className="text-xs text-muted-foreground">Per order value</p>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">Last Order</CardTitle>
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    {Math.floor(
                                                        (new Date().getTime() - new Date(selectedSupplier.lastOrderDate).getTime()) /
                                                        (1000 * 60 * 60 * 24),
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">Days ago</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Performance Metrics</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>On-time Delivery</span>
                                                        <span>95%</span>
                                                    </div>
                                                    <div className="w-full bg-secondary rounded-full h-2">
                                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "95%" }}></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>Quality Score</span>
                                                        <span>92%</span>
                                                    </div>
                                                    <div className="w-full bg-secondary rounded-full h-2">
                                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "92%" }}></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>Communication</span>
                                                        <span>88%</span>
                                                    </div>
                                                    <div className="w-full bg-secondary rounded-full h-2">
                                                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "88%" }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="documents" className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Documents & Certifications</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium">Business License</p>
                                                            <p className="text-sm text-muted-foreground">Valid until Dec 2024</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="outline">
                                                        View
                                                    </Button>
                                                </div>
                                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium">Food Safety Certificate</p>
                                                            <p className="text-sm text-muted-foreground">Valid until Mar 2024</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="outline">
                                                        View
                                                    </Button>
                                                </div>
                                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium">Insurance Certificate</p>
                                                            <p className="text-sm text-muted-foreground">Valid until Jun 2024</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="outline">
                                                        View
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Edit Supplier Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Supplier</DialogTitle>
                        <DialogDescription>Update supplier information and settings</DialogDescription>
                    </DialogHeader>
                    {selectedSupplier && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-supplier-name">Supplier Name</Label>
                                    <Input id="edit-supplier-name" defaultValue={selectedSupplier.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-contact-person">Contact Person</Label>
                                    <Input id="edit-contact-person" defaultValue={selectedSupplier.contactPerson} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input id="edit-email" type="email" defaultValue={selectedSupplier.email} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-phone">Phone</Label>
                                    <Input id="edit-phone" defaultValue={selectedSupplier.phone} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-address">Address</Label>
                                <Input id="edit-address" defaultValue={selectedSupplier.address} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-city">City</Label>
                                    <Input id="edit-city" defaultValue={selectedSupplier.city} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-country">Country</Label>
                                    <Input id="edit-country" defaultValue={selectedSupplier.country} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-category">Category</Label>
                                    <Select defaultValue={selectedSupplier.category.toLowerCase().replace(" ", "-")}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="poultry-supplier">Poultry Supplier</SelectItem>
                                            <SelectItem value="premium-supplier">Premium Supplier</SelectItem>
                                            <SelectItem value="local-supplier">Local Supplier</SelectItem>
                                            <SelectItem value="feed-supplier">Feed Supplier</SelectItem>
                                            <SelectItem value="equipment-supplier">Equipment Supplier</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-payment-terms">Payment Terms</Label>
                                    <Select defaultValue={selectedSupplier.paymentTerms.toLowerCase().replace(" ", "-")}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="net-15">Net 15</SelectItem>
                                            <SelectItem value="net-30">Net 30</SelectItem>
                                            <SelectItem value="net-45">Net 45</SelectItem>
                                            <SelectItem value="net-60">Net 60</SelectItem>
                                            <SelectItem value="cod">Cash on Delivery</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-credit-limit">Credit Limit</Label>
                                    <Input id="edit-credit-limit" type="number" defaultValue={selectedSupplier.creditLimit} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-status">Status</Label>
                                    <Select defaultValue={selectedSupplier.status}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => setIsEditOpen(false)}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Orders Sheet */}
            <Sheet open={isOrdersOpen} onOpenChange={setIsOrdersOpen}>
                <SheetContent className="w-[600px] sm:w-[800px]">
                    <SheetHeader>
                        <SheetTitle>Orders from {selectedSupplier?.name}</SheetTitle>
                        <SheetDescription>View all purchase orders and order history</SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Input placeholder="Search orders..." className="w-[300px]" />
                                <Select defaultValue="all">
                                    <SelectTrigger className="w-[130px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                New Order
                            </Button>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Expected Delivery</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                                        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                                        <TableCell>{order.items} items</TableCell>
                                        <TableCell>${order.total.toLocaleString()}</TableCell>
                                        <TableCell>{new Date(order.expectedDelivery).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <Settings className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Order
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <History className="mr-2 h-4 w-4" />
                                                        Track Shipment
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Send Message Dialog */}
            <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Send Message</DialogTitle>
                        <DialogDescription>Send a message to {selectedSupplier?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="message-subject">Subject</Label>
                            <Input
                                id="message-subject"
                                placeholder="Enter message subject"
                                value={messageSubject}
                                onChange={(e) => setMessageSubject(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message-content">Message</Label>
                            <Textarea
                                id="message-content"
                                placeholder="Type your message here..."
                                rows={6}
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message-priority">Priority</Label>
                            <Select defaultValue="medium">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMessageOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSendMessageSubmit}>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
