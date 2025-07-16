import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function UserAnalyticsSkeleton() {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
                {/* User Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-7 w-7 rounded-lg" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="space-y-1">
                                <Skeleton className="h-7 w-16" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Top Customers */}
                <div className="space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-5 w-12 rounded-full" />
                                    </div>
                                    <Skeleton className="h-3 w-32" />
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-6" />
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
