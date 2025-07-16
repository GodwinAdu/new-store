import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function InventoryOverviewSkeleton() {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            </CardHeader>
            <CardContent>
                {/* Pie Chart */}
                <div className="flex justify-center mb-4">
                    <Skeleton className="h-[250px] w-[250px] rounded-full" />
                </div>

                {/* Inventory Items */}
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-7 w-7 rounded-lg" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <div className="text-right space-y-1">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-3 w-8" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
