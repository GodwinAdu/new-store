"use client"

import { ArrowDownIcon, ArrowUpIcon, DollarSign, Package, ShoppingCart, TrendingUp, Users, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const metrics = [
    {
        title: "Total Revenue",
        value: "$124,563",
        change: "+12.5%",
        changeType: "positive" as const,
        icon: DollarSign,
        description: "vs last month",
        gradient: "from-green-500 to-emerald-600",
        bgGradient: "from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950",
    },
    {
        title: "Total Orders",
        value: "1,429",
        change: "+8.2%",
        changeType: "positive" as const,
        icon: ShoppingCart,
        description: "vs last month",
        gradient: "from-blue-500 to-cyan-600",
        bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950",
    },
    {
        title: "Active Users",
        value: "8,429",
        change: "+15.3%",
        changeType: "positive" as const,
        icon: Users,
        description: "vs last month",
        gradient: "from-purple-500 to-pink-600",
        bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950",
    },
    {
        title: "Inventory Value",
        value: "$89,432",
        change: "-2.1%",
        changeType: "negative" as const,
        icon: Package,
        description: "vs last month",
        gradient: "from-orange-500 to-red-600",
        bgGradient: "from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950",
    },
    {
        title: "Profit Margin",
        value: "24.8%",
        change: "+3.2%",
        changeType: "positive" as const,
        icon: TrendingUp,
        description: "vs last month",
        gradient: "from-indigo-500 to-purple-600",
        bgGradient: "from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950",
    },
    {
        title: "Conversion Rate",
        value: "3.24%",
        change: "+0.8%",
        changeType: "positive" as const,
        icon: Target,
        description: "vs last month",
        gradient: "from-teal-500 to-green-600",
        bgGradient: "from-teal-50 to-green-50 dark:from-teal-950 dark:to-green-950",
    },
]

export function MetricsCards() {
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
