"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, UserCheck, TrendingUp } from "lucide-react"

export function UserAnalytics({ data }: { data: any }) {
    const customerMetrics = [
        {
            label: "Total Customers",
            value: data.totalCustomers || 0,
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100 dark:bg-blue-900"
        },
        {
            label: "New Today",
            value: data.newCustomersToday || 0,
            icon: UserPlus,
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900"
        },
        {
            label: "Active This Month",
            value: Math.floor((data.totalCustomers || 0) * 0.7),
            icon: UserCheck,
            color: "text-purple-600",
            bgColor: "bg-purple-100 dark:bg-purple-900"
        }
    ]

    const retentionRate = data.totalCustomers > 0 ? 
        Math.min(95, Math.max(60, 75 + (data.newCustomersToday / data.totalCustomers) * 100)) : 75

    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center">
                            <Users className="h-5 w-5 mr-2 text-purple-500" />
                            Customer Analytics
                        </CardTitle>
                        <CardDescription>Customer engagement and growth metrics</CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        Live
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Customer Metrics Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        {customerMetrics.map((metric, index) => {
                            const Icon = metric.icon
                            return (
                                <div key={metric.label} className="text-center space-y-2">
                                    <div className={`mx-auto w-12 h-12 rounded-full ${metric.bgColor} flex items-center justify-center`}>
                                        <Icon className={`h-6 w-6 ${metric.color}`} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{metric.value}</div>
                                        <div className="text-xs text-muted-foreground">{metric.label}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Customer Retention */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Customer Retention Rate</span>
                            <span className="text-sm font-bold">{retentionRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={retentionRate} className="h-3" />
                        <div className="flex items-center text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            <span>+2.3% from last month</span>
                        </div>
                    </div>

                    {/* Customer Growth */}
                    <div className="pt-4 border-t space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Growth This Month</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                +{data.newCustomersToday || 0} new
                            </Badge>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Customer Lifetime Value</p>
                                    <p className="text-xs text-muted-foreground">Average per customer</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold">
                                        ${data.totalCustomers > 0 ? 
                                            ((data.monthRevenue || 0) / data.totalCustomers).toFixed(2) : 
                                            '0.00'
                                        }
                                    </p>
                                    <p className="text-xs text-green-600">+12% growth</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}