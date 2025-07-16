"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

const topProducts = [
    {
        name: "Wireless Headphones",
        sales: 245,
        revenue: "$73,455",
        percentage: 85,
        trend: "up",
        change: "+12%",
        image: "/placeholder.svg?height=40&width=40",
    },
    {
        name: "Smart Watch",
        sales: 189,
        revenue: "$75,561",
        percentage: 72,
        trend: "up",
        change: "+8%",
        image: "/placeholder.svg?height=40&width=40",
    },
    {
        name: "Bluetooth Speaker",
        sales: 156,
        revenue: "$31,200",
        percentage: 58,
        trend: "down",
        change: "-3%",
        image: "/placeholder.svg?height=40&width=40",
    },
    {
        name: "USB-C Hub",
        sales: 134,
        revenue: "$20,100",
        percentage: 45,
        trend: "up",
        change: "+15%",
        image: "/placeholder.svg?height=40&width=40",
    },
    {
        name: "Laptop Stand",
        sales: 98,
        revenue: "$8,820",
        percentage: 32,
        trend: "up",
        change: "+5%",
        image: "/placeholder.svg?height=40&width=40",
    },
]

export function TopProducts() {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Top Products</CardTitle>
                <CardDescription>Best performing products this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {topProducts.map((product, index) => (
                    <div key={product.name} className="space-y-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-sm">
                                #{index + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{product.name}</span>
                                    <Badge
                                        variant="outline"
                                        className={`text-xs ${product.trend === "up"
                                                ? "text-green-600 border-green-200 bg-green-50 dark:bg-green-950 dark:text-green-400"
                                                : "text-red-600 border-red-200 bg-red-50 dark:bg-red-950 dark:text-red-400"
                                            }`}
                                    >
                                        {product.trend === "up" ? (
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3 mr-1" />
                                        )}
                                        {product.change}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                                    <span>{product.sales} sold</span>
                                    <span className="font-medium text-foreground">{product.revenue}</span>
                                </div>
                            </div>
                        </div>
                        <Progress value={product.percentage} className="h-2" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
