"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const salesData = [
    { month: "Jan", revenue: 45000, orders: 120 },
    { month: "Feb", revenue: 52000, orders: 145 },
    { month: "Mar", revenue: 48000, orders: 135 },
    { month: "Apr", revenue: 61000, orders: 168 },
    { month: "May", revenue: 55000, orders: 152 },
    { month: "Jun", revenue: 67000, orders: 189 },
    { month: "Jul", revenue: 72000, orders: 201 },
    { month: "Aug", revenue: 69000, orders: 195 },
    { month: "Sep", revenue: 78000, orders: 218 },
    { month: "Oct", revenue: 82000, orders: 235 },
    { month: "Nov", revenue: 89000, orders: 248 },
    { month: "Dec", revenue: 94000, orders: 267 },
]

const chartConfig = {
    revenue: {
        label: "Revenue",
        color: "hsl(var(--chart-1))",
    },
}

export function SalesChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Monthly revenue and order trends</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={salesData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `$${value / 1000}k`}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="hsl(var(--chart-1))"
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
