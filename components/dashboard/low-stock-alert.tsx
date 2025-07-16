"use client"

import { AlertTriangle, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const lowStockItems = [
    {
        name: "iPhone Cases",
        currentStock: 5,
        minStock: 20,
        status: "Critical",
        sku: "IPH-CASE-001",
    },
    {
        name: "Screen Protectors",
        currentStock: 12,
        minStock: 25,
        status: "Low",
        sku: "SCR-PROT-002",
    },
    {
        name: "Charging Cables",
        currentStock: 8,
        minStock: 30,
        status: "Critical",
        sku: "CHG-CBL-003",
    },
    {
        name: "Power Banks",
        currentStock: 15,
        minStock: 20,
        status: "Low",
        sku: "PWR-BNK-004",
    },
]

const getStatusColor = (status: string) => {
    switch (status) {
        case "Critical":
            return "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300"
        case "Low":
            return "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-300"
        default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
    }
}

export function LowStockAlerts() {
    return (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900">
                        <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    Stock Alerts
                </CardTitle>
                <CardDescription>Items that need immediate restocking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {lowStockItems.map((item) => (
                    <div
                        key={item.sku}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                                <p className="text-xs text-muted-foreground">
                                    {item.currentStock} left (min: {item.minStock})
                                </p>
                            </div>
                        </div>
                        <div className="text-right space-y-2">
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                            <Button size="sm" variant="outline" className="w-full text-xs bg-transparent">
                                Reorder
                            </Button>
                        </div>
                    </div>
                ))}
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                    View All Alerts
                </Button>
            </CardContent>
        </Card>
    )
}
