"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Package, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"

export function InventoryOverview({ data }: { data: any }) {
    const stockStatus = [
        {
            label: "In Stock",
            value: Math.max(0, (data.totalProducts || 0) - (data.lowStockCount || 0)),
            total: data.totalProducts || 0,
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900",
            icon: CheckCircle
        },
        {
            label: "Low Stock",
            value: data.lowStockCount || 0,
            total: data.totalProducts || 0,
            color: "text-orange-600",
            bgColor: "bg-orange-100 dark:bg-orange-900",
            icon: AlertTriangle
        },
        {
            label: "Out of Stock",
            value: 0,
            total: data.totalProducts || 0,
            color: "text-red-600",
            bgColor: "bg-red-100 dark:bg-red-900",
            icon: Package
        }
    ]

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center">
                            <Package className="h-5 w-5 mr-2 text-blue-500" />
                            Inventory Overview
                        </CardTitle>
                        <CardDescription>Current stock status and alerts</CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                        Live
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{data.totalProducts || 0}</div>
                            <div className="text-xs text-muted-foreground">Total Products</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{Math.max(0, (data.totalProducts || 0) - (data.lowStockCount || 0))}</div>
                            <div className="text-xs text-muted-foreground">In Stock</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{data.lowStockCount || 0}</div>
                            <div className="text-xs text-muted-foreground">Need Restock</div>
                        </div>
                    </div>

                    {/* Stock Status Breakdown */}
                    <div className="space-y-4">
                        {stockStatus.map((status, index) => {
                            const percentage = status.total > 0 ? (status.value / status.total) * 100 : 0
                            const Icon = status.icon
                            
                            return (
                                <div key={status.label} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className={`p-1 rounded-full ${status.bgColor}`}>
                                                <Icon className={`h-3 w-3 ${status.color}`} />
                                            </div>
                                            <span className="text-sm font-medium">{status.label}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold">{status.value}</span>
                                            <span className="text-xs text-muted-foreground ml-1">
                                                ({percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                    </div>
                                    <Progress 
                                        value={percentage} 
                                        className="h-2"
                                    />
                                </div>
                            )
                        })}
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-4 border-t space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Inventory Health</span>
                            <Badge 
                                variant={data.lowStockCount > 0 ? "destructive" : "secondary"}
                                className={data.lowStockCount === 0 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
                            >
                                {data.lowStockCount === 0 ? "Healthy" : "Needs Attention"}
                            </Badge>
                        </div>
                        
                        {data.lowStockCount > 0 && (
                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                        {data.lowStockCount} item{data.lowStockCount !== 1 ? 's' : ''} running low
                                    </p>
                                </div>
                                <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                                    Review inventory levels and consider restocking
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}