"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Eye, MoreHorizontal } from "lucide-react"

export function RecentOrders({ data }: { data: any[] }) {
    const getPaymentMethodColor = (method: string) => {
        switch (method) {
            case 'cash': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            case 'card': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            case 'mobile': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }
    }

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold">Recent Orders</CardTitle>
                        <CardDescription>Latest transactions from your store</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                        View All
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No recent orders found</p>
                        </div>
                    ) : (
                        data.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                            #{order.id.slice(-2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-medium">Order #{order.id.slice(-8)}</p>
                                            <Badge className={`text-xs ${getPaymentMethodColor(order.paymentMethod)}`}>
                                                {order.paymentMethod}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                            <span>{new Date(order.date).toLocaleString()}</span>
                                            <span>•</span>
                                            <span>{order.items} item{order.items !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <p className="text-sm font-bold">${order.total.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">Total</p>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}