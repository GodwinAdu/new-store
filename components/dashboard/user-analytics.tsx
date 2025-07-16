"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, UserCheck, UserX } from "lucide-react"

const userStats = [
    {
        title: "Total Users",
        value: "12,429",
        change: "+12.5%",
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
        title: "New Users",
        value: "1,234",
        change: "+8.2%",
        icon: UserPlus,
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
        title: "Active Users",
        value: "8,429",
        change: "+15.3%",
        icon: UserCheck,
        color: "text-purple-600",
        bgColor: "bg-purple-100 dark:bg-purple-900",
    },
    {
        title: "Churned Users",
        value: "234",
        change: "-2.1%",
        icon: UserX,
        color: "text-red-600",
        bgColor: "bg-red-100 dark:bg-red-900",
    },
]

const topUsers = [
    {
        name: "Sarah Johnson",
        email: "sarah@example.com",
        orders: 45,
        spent: "$12,450",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "VIP",
    },
    {
        name: "Mike Davis",
        email: "mike@example.com",
        orders: 38,
        spent: "$9,850",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "Premium",
    },
    {
        name: "Emily Brown",
        email: "emily@example.com",
        orders: 32,
        spent: "$8,200",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "Regular",
    },
    {
        name: "David Wilson",
        email: "david@example.com",
        orders: 28,
        spent: "$7,100",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "Regular",
    },
]

export function UserAnalytics() {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader>
                <CardTitle className="text-xl font-bold">User Analytics</CardTitle>
                <CardDescription>User engagement and customer insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    {userStats.map((stat) => (
                        <div key={stat.title} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-xs text-green-600 dark:text-green-400">{stat.change}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Top Customers</h4>
                    <div className="space-y-3">
                        {topUsers.map((user, index) => (
                            <div
                                key={user.email}
                                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                                <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
                                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold">
                                        {user.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium truncate">{user.name}</p>
                                        <Badge
                                            variant="secondary"
                                            className={`text-xs ${user.status === "VIP"
                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                                    : user.status === "Premium"
                                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                                }`}
                                        >
                                            {user.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-xs text-muted-foreground">{user.orders} orders</span>
                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">{user.spent}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold">#{index + 1}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
