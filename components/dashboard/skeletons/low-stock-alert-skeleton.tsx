import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LowStockAlertsSkeleton() {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-7 rounded-lg" />
                    <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                        <div className="text-right space-y-2">
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-7 w-16 rounded-md" />
                        </div>
                    </div>
                ))}
                <Skeleton className="h-9 w-full rounded-md" />
            </CardContent>
        </Card>
    )
}
