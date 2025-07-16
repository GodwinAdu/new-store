"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Eye, MoreHorizontal } from "lucide-react"

const recentOrders = [
    {
        id: "ORD-001",
        customer: "John Smith",
        email: "john@example.com",
        product: "Wireless Headphones",
        amount: "$299.99",
        status: "Completed",
        date: "2024-01-15",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    {
        id: "ORD-002",
        customer: "Sarah Johnson",
        email: "sarah@example.com",
        product: "Smart Watch",
        amount: "$399.99",
        status: "Processing",
        date: "2024-01-15",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    {
        id: "ORD-003",
        customer: "Mike Davis",
        email: "mike@example.com",
        product: "Laptop Stand",
        amount: "$89.99",
        status: "Shipped",
        date: "2024-01-14",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    {
        id: "ORD-004",
        customer: "Emily Brown",
        email: "emily@example.com",
        product: "USB-C Hub",
        amount: "$149.99",
        status: "Completed",
        date: "2024-01-14",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    {
        id: "ORD-005",
        customer: "David Wilson",
        email: "david@example.com",
        product: "Bluetooth Speaker",
        amount: "$199.99",
        status: "Pending",
        date: "2024-01-13",
        avatar: "/placeholder.svg?height=32&width=32",
    },
]

const getStatusColor = (status: string) => {
    switch (status) {
        case "Completed":
            return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300"
        case "Processing":
            return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
        case "Shipped":
            return "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-300"
        case "Pending":
            return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300"
        default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
    }
}

export function RecentOrders() {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold">Recent Orders</CardTitle>
                        <CardDescription>Latest customer orders and their status</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Eye className="h-4 w-4" />
                        View All
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-border/50">
                            <TableHead>Customer</TableHead>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentOrders.map((order) => (
                            <TableRow key={order.id} className="border-border/50 hover:bg-muted/30">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={order.avatar || "/placeholder.svg"} />
                                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                                                {order.customer
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{order.customer}</div>
                                            <div className="text-sm text-muted-foreground">{order.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-sm">{order.id}</TableCell>
                                <TableCell>{order.product}</TableCell>
                                <TableCell className="font-bold">{order.amount}</TableCell>
                                <TableCell>
                                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{order.date}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
