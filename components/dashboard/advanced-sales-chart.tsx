"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Bar,
    BarChart,
    ComposedChart,
    Line,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

const salesData = [
    { month: "Jan", revenue: 45000, orders: 120, profit: 12000, customers: 89 },
    { month: "Feb", revenue: 52000, orders: 145, profit: 15600, customers: 102 },
    { month: "Mar", revenue: 48000, orders: 135, profit: 14400, customers: 95 },
    { month: "Apr", revenue: 61000, orders: 168, profit: 18300, customers: 118 },
    { month: "May", revenue: 55000, orders: 152, profit: 16500, customers: 107 },
    { month: "Jun", revenue: 67000, orders: 189, profit: 20100, customers: 134 },
    { month: "Jul", revenue: 72000, orders: 201, profit: 21600, customers: 142 },
    { month: "Aug", revenue: 69000, orders: 195, profit: 20700, customers: 138 },
    { month: "Sep", revenue: 78000, orders: 218, profit: 23400, customers: 156 },
    { month: "Oct", revenue: 82000, orders: 235, profit: 24600, customers: 167 },
    { month: "Nov", revenue: 89000, orders: 248, profit: 26700, customers: 178 },
    { month: "Dec", revenue: 94000, orders: 267, profit: 28200, customers: 189 },
]

const chartConfig = {
    revenue: {
        label: "Revenue",
        color: "hsl(var(--chart-1))",
    },
    orders: {
        label: "Orders",
        color: "hsl(var(--chart-2))",
    },
    profit: {
        label: "Profit",
        color: "hsl(var(--chart-3))",
    },
    customers: {
        label: "Customers",
        color: "hsl(var(--chart-4))",
    },
}

export function AdvancedSalesChart() {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold">Sales Analytics</CardTitle>
                        <CardDescription className="text-base">Comprehensive performance metrics and trends</CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">Real-time</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="revenue" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                        <TabsTrigger
                            value="revenue"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                        >
                            Revenue
                        </TabsTrigger>
                        <TabsTrigger
                            value="orders"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
                        >
                            Orders
                        </TabsTrigger>
                        <TabsTrigger
                            value="profit"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
                        >
                            Profit
                        </TabsTrigger>
                        <TabsTrigger
                            value="customers"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                        >
                            Customers
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="revenue" className="space-y-4">
                        <ChartContainer config={chartConfig}>
                            <ResponsiveContainer width="100%" height={350}>
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
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
                                        strokeWidth={3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </TabsContent>

                    <TabsContent value="orders">
                        <ChartContainer config={chartConfig}>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="orders" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </TabsContent>

                    <TabsContent value="profit">
                        <ChartContainer config={chartConfig}>
                            <ResponsiveContainer width="100%" height={350}>
                                <ComposedChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => `$${value / 1000}k`}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="profit" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </TabsContent>

                    <TabsContent value="customers">
                        <ChartContainer config={chartConfig}>
                            <ResponsiveContainer width="100%" height={350}>
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area
                                        type="monotone"
                                        dataKey="customers"
                                        stroke="hsl(var(--chart-4))"
                                        fillOpacity={1}
                                        fill="url(#colorCustomers)"
                                        strokeWidth={3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
