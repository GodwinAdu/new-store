
import { Skeleton } from "@/components/ui/skeleton"
import { ChartSkeleton } from "./chart-skeleton"
import { MetricsSkeleton } from "./metrics-skeleton"
import { RevenueBreakdownSkeleton } from "./revenue-breakdown-skeleton"
import { InventoryOverviewSkeleton } from "./inventory-overview-skeleton"
import { UserAnalyticsSkeleton } from "./user-analytics-skeleton"
import { TableSkeleton } from "./table-skeleton"
import { TopProductsSkeleton } from "./top-product-skeleton"
import { LowStockAlertsSkeleton } from "./low-stock-alert-skeleton"

export function DashboardSkeleton() {
    return (


        <div className="flex-1 space-y-8 p-6">
            {/* Title Section */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-10 w-80 mb-2" />
                        <Skeleton className="h-6 w-96" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-32 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            <MetricsSkeleton />

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ChartSkeleton title="Sales Analytics" height={350} showTabs={true} />
                </div>
                <div>
                    <RevenueBreakdownSkeleton />
                </div>
            </div>

            {/* Analytics Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                <InventoryOverviewSkeleton />
                <UserAnalyticsSkeleton />
            </div>

            {/* Bottom Row */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <TableSkeleton title="Recent Orders" rows={5} columns={7} />
                </div>
                <div className="space-y-6">
                    <TopProductsSkeleton />
                    <LowStockAlertsSkeleton />
                </div>
            </div>
        </div>
    )
}
