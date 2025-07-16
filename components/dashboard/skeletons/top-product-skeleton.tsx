import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TopProductsSkeleton() {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader>
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="space-y-3 p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 rounded-lg" />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-5 w-12 rounded-full" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
