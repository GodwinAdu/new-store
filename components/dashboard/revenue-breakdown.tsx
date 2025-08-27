"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function RevenueBreakdown({ data }: { data: any }) {
    const paymentData = [
        { name: 'Cash', value: data.todayRevenue * 0.4, color: '#10B981' },
        { name: 'Card', value: data.todayRevenue * 0.45, color: '#3B82F6' },
        { name: 'Mobile', value: data.todayRevenue * 0.15, color: '#8B5CF6' }
    ]

    const totalRevenue = paymentData.reduce((sum, item) => sum + item.value, 0)

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold">Revenue Breakdown</CardTitle>
                        <CardDescription>Payment method distribution</CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                        Today
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {paymentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => [`$${value.toFixed(2)}`, 'Revenue']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-4">
                        {paymentData.map((item, index) => (
                            <div key={item.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="text-sm font-medium">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">${item.value.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {totalRevenue > 0 ? ((item.value / totalRevenue) * 100).toFixed(1) : 0}%
                                        </p>
                                    </div>
                                </div>
                                <Progress 
                                    value={totalRevenue > 0 ? (item.value / totalRevenue) * 100 : 0} 
                                    className="h-2"
                                />
                            </div>
                        ))}
                    </div>
                    
                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Total Revenue</span>
                            <span className="text-lg font-bold">${totalRevenue.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}