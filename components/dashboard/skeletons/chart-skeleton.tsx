import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ChartSkeletonProps {
    title?: string
    height?: number
    showTabs?: boolean
}

export function ChartSkeleton({ title = "Chart", height = 350, showTabs = false }: ChartSkeletonProps) {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            </CardHeader>
            <CardContent>
                {showTabs && (
                    <div className="mb-4">
                        <div className="flex space-x-1 bg-muted/50 p-1 rounded-lg">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-8 w-20 rounded-md" />
                            ))}
                        </div>
                    </div>
                )}
                <div className="space-y-4">
                    <Skeleton className={`w-full rounded-lg`} style={{ height: `${height}px` }} />
                </div>
            </CardContent>
        </Card>
    )
}
