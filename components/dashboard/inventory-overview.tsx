"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

const inventoryData = [
    { name: "In Stock", value: 65, count: 1250, color: "hsl(var(--chart-1))", icon: CheckCircle },
    { name: "Low Stock", value: 20, count: 385, color: "hsl(var(--chart-2))", icon: AlertTriangle },
    { name: "Out of Stock", value: 10, count: 192, color: "hsl(var(--chart-3))", icon: XCircle },
    { name: "Overstocked", value: 5, count: 96, color: "hsl(var(--chart-4))", icon: Package },
]

const chartConfig = {
    value: {
        label: "Percentage",
    },
}

export function InventoryOverview() {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold">Inventory Status</CardTitle>
                        <CardDescription>Current stock distribution across all products</CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">1,923 Items</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={inventoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={100}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {inventoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <div className="space-y-3 mt-4">
                    {inventoryData.map((item) => (
                        <div
                            key={item.name}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${item.color}20` }}>
                                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                                </div>
                                <span className="font-medium">{item.name}</span>
                            </div>
                            <div className="text-right">
                                <div className="font-bold">{item.count} items</div>
                                <div className="text-sm text-muted-foreground">{item.value}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
