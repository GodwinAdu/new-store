"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"

const revenueData = [
    { name: "Product Sales", value: 65, amount: "$81,250", color: "hsl(var(--chart-1))" },
    { name: "Subscriptions", value: 20, amount: "$25,000", color: "hsl(var(--chart-2))" },
    { name: "Services", value: 10, amount: "$12,500", color: "hsl(var(--chart-3))" },
    { name: "Other", value: 5, amount: "$6,250", color: "hsl(var(--chart-4))" },
]

const chartConfig = {
    value: {
        label: "Percentage",
    },
}

export function RevenueBreakdown() {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold">Revenue Breakdown</CardTitle>
                        <CardDescription>Revenue distribution by category</CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">$125K Total</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={revenueData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={100}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {revenueData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <div className="space-y-3 mt-4">
                    {revenueData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="font-medium">{item.name}</span>
                            </div>
                            <div className="text-right">
                                <div className="font-bold">{item.amount}</div>
                                <div className="text-sm text-muted-foreground">{item.value}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
