"use client"

import { Badge } from "@/components/ui/badge"
import { MetricsCards } from "./metrics-cards"
import { AdvancedSalesChart } from "./advanced-sales-chart"
import { RevenueBreakdown } from "./revenue-breakdown"
import { InventoryOverview } from "./inventory-overview"
import { UserAnalytics } from "./user-analytics"
import { RecentOrders } from "./recent-orders"
import { TopProducts } from "./top-products"
import { LowStockAlerts } from "./low-stock-alert"



export function DashboardContent() {

    return (
        <div className="flex-1 space-y-8 p-6">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                            Dashboard Overview
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Welcome back, John! Here's what's happening with your business today.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300"
                        >
                            ● Live Data
                        </Badge>
                        <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
                        >
                            Last updated: 2 min ago
                        </Badge>
                    </div>
                </div>
            </div>

            <MetricsCards />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <AdvancedSalesChart />
                </div>
                <div>
                    <RevenueBreakdown />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <InventoryOverview />
                <UserAnalytics />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <RecentOrders />
                </div>
                <div className="space-y-6">
                    <TopProducts />
                    <LowStockAlerts />
                </div>
            </div>
        </div>
    )
}
