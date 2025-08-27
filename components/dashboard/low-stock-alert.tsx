"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, Plus } from "lucide-react"

export function LowStockAlerts({ data }: { data: any }) {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                            Stock Alerts
                        </CardTitle>
                        <CardDescription>Items running low on inventory</CardDescription>
                    </div>
                    <Badge 
                        variant={data.lowStockCount > 0 ? "destructive" : "secondary"}
                        className={data.lowStockCount > 0 ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" : ""}
                    >
                        {data.lowStockCount || 0} alerts
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.lowStockCount === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Package className="h-12 w-12 mx-auto mb-2 opacity-50 text-green-500" />
                            <p className="font-medium text-green-600 dark:text-green-400">All items well stocked!</p>
                            <p className="text-sm">No low stock alerts at this time</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                        {data.lowStockCount} item{data.lowStockCount !== 1 ? 's' : ''} need restocking
                                    </p>
                                </div>
                                <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                                    Consider restocking these items to avoid stockouts
                                </p>
                            </div>
                            
                            <div className="space-y-3">
                                {/* Placeholder for actual low stock items */}
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                                            <Package className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Low stock items</p>
                                            <p className="text-xs text-muted-foreground">Check inventory for details</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <Plus className="h-4 w-4 mr-1" />
                                        Restock
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}