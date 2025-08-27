"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { MetricsCards } from "./metrics-cards"
import { AdvancedSalesChart } from "./advanced-sales-chart"
import { RevenueBreakdown } from "./revenue-breakdown"
import { InventoryOverview } from "./inventory-overview"
import { UserAnalytics } from "./user-analytics"
import { RecentOrders } from "./recent-orders"
import { TopProducts } from "./top-products"
import { LowStockAlerts } from "./low-stock-alert"
import { getDashboardStats, getRevenueChart } from "@/lib/actions/dashboard.actions"



export function DashboardContent() {
    const [dashboardData, setDashboardData] = useState<any>({})
    const [revenueData, setRevenueData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(new Date())

    useEffect(() => {
        loadDashboardData()
        const interval = setInterval(loadDashboardData, 120000) // Update every 2 minutes
        return () => clearInterval(interval)
    }, [])

    const loadDashboardData = async () => {
        try {
            const [stats, revenue] = await Promise.all([
                getDashboardStats(),
                getRevenueChart()
            ])
            setDashboardData(stats)
            setRevenueData(revenue)
            setLastUpdated(new Date())
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex-1 space-y-8 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="grid gap-4 md:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

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
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </Badge>
                    </div>
                </div>
            </div>

            <MetricsCards data={dashboardData} />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <AdvancedSalesChart data={revenueData} />
                </div>
                <div>
                    <RevenueBreakdown data={dashboardData} />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <InventoryOverview data={dashboardData} />
                <UserAnalytics data={dashboardData} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <RecentOrders data={dashboardData.recentOrders || []} />
                </div>
                <div className="space-y-6">
                    <TopProducts data={dashboardData.topProducts || []} />
                    <LowStockAlerts data={dashboardData} />
                </div>
            </div>
        </div>
    )
}
