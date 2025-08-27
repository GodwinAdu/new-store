"use client"

import { ArrowDownIcon, ArrowUpIcon, DollarSign, Package, ShoppingCart, TrendingUp, Users, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MetricsCards({ data }: { data: any }) {
    const metrics = [
        {
            title: "Today's Revenue",
            value: `$${data.todayRevenue?.toFixed(2) || '0.00'}`,
            change: data.yesterdayRevenue ? 
                `${((data.todayRevenue - data.yesterdayRevenue) / data.yesterdayRevenue * 100).toFixed(1)}%` : 
                '+0%',
            changeType: data.todayRevenue >= (data.yesterdayRevenue || 0) ? "positive" as const : "negative" as const,
            icon: DollarSign,
            description: "vs yesterday",
            gradient: "from-green-500 to-emerald-600",
            bgGradient: "from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950",
        },
        {
            title: "Today's Orders",
            value: `${data.todayTransactions || 0}`,
            change: data.yesterdayTransactions ? 
                `${((data.todayTransactions - data.yesterdayTransactions) / data.yesterdayTransactions * 100).toFixed(1)}%` : 
                '+0%',
            changeType: data.todayTransactions >= (data.yesterdayTransactions || 0) ? "positive" as const : "negative" as const,
            icon: ShoppingCart,
            description: "vs yesterday",
            gradient: "from-blue-500 to-cyan-600",
            bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950",
        },
        {
            title: "Total Customers",
            value: `${data.totalCustomers || 0}`,
            change: data.newCustomersToday > 0 ? `+${data.newCustomersToday}` : '0',
            changeType: "positive" as const,
            icon: Users,
            description: "new today",
            gradient: "from-purple-500 to-pink-600",
            bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950",
        },
        {
            title: "Total Products",
            value: `${data.totalProducts || 0}`,
            change: data.lowStockCount > 0 ? `${data.lowStockCount}` : '0',
            changeType: data.lowStockCount > 0 ? "negative" as const : "positive" as const,
            icon: Package,
            description: "low stock",
            gradient: "from-orange-500 to-red-600",
            bgGradient: "from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950",
        },
        {
            title: "Month Revenue",
            value: `$${data.monthRevenue?.toFixed(2) || '0.00'}`,
            change: "+12.5%",
            changeType: "positive" as const,
            icon: TrendingUp,
            description: "vs last month",
            gradient: "from-indigo-500 to-purple-600",
            bgGradient: "from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950",
        },
        {
            title: "Avg Order Value",
            value: `$${data.todayTransactions > 0 ? (data.todayRevenue / data.todayTransactions).toFixed(2) : '0.00'}`,
            change: "+3.2%",
            changeType: "positive" as const,
            icon: Target,
            description: "vs yesterday",
            gradient: "from-teal-500 to-green-600",
            bgGradient: "from-teal-50 to-green-50 dark:from-teal-950 dark:to-green-950",
        },
    ]

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric, index) => (
                <Card
                    key={metric.title}
                    className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-float bg-gradient-to-br ${metric.bgGradient}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.gradient} shadow-lg`}>
                            <metric.icon className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold mb-2">{metric.value}</div>
                        <div className="flex items-center text-sm">
                            <span
                                className={`flex items-center font-medium ${metric.changeType === "positive"
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                    }`}
                            >
                                {metric.changeType === "positive" ? (
                                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                                ) : (
                                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                                )}
                                {metric.change}
                            </span>
                            <span className="ml-2 text-muted-foreground">{metric.description}</span>
                        </div>
                    </CardContent>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
                </Card>
            ))}
        </div>
    )
}