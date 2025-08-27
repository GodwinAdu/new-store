"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Package, TrendingUp } from "lucide-react"

export function TopProducts({ data }: { data: any[] }) {
    const maxRevenue = Math.max(...data.map(p => p.revenue), 1)

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                            Top Products
                        </CardTitle>
                        <CardDescription>Best performing items this month</CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        Live
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No product data available</p>
                        </div>
                    ) : (
                        data.map((product, index) => (
                            <div key={product.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {product.quantity} units sold
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">${product.revenue.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">Revenue</p>
                                    </div>
                                </div>
                                <Progress 
                                    value={(product.revenue / maxRevenue) * 100} 
                                    className="h-2"
                                />
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}