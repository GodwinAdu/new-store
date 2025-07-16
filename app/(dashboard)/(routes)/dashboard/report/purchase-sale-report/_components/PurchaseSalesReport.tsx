'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

// Chart.js registration
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Legend
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    ChartTooltip,
    Legend
)

export default function PurchaseSaleReport() {
    const [darkMode, setDarkMode] = useState(false)

    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Sales',
                data: [6437, 5200, 7300, 4800, 6900, 7500],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
            },
            {
                label: 'Purchases',
                data: [4200, 4800, 6100, 4200, 5800, 6300],
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
            },
        ],
    }

    return (
        <div className={`min-h-screen p-8 ${darkMode ? 'dark' : ''}`}>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Purchase & Sale Report</h1>
                        <p className="text-muted-foreground">Purchase & sale details for the selected date range</p>
                    </div>
                    <div className="flex gap-4">
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All locations</SelectItem>
                                <SelectItem value="main">Main Store</SelectItem>
                                <SelectItem value="warehouse">Warehouse</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <Calendar className="mr-2 h-4 w-4" />
                            Filter by date
                        </Button>
                        <Button variant="outline" onClick={() => setDarkMode(!darkMode)}>
                            Toggle theme
                        </Button>
                    </div>
                </div>

                {/* Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sales vs Purchases Overview</CardTitle>
                        <CardDescription>Monthly comparison of sales and purchases</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Purchases Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Purchases</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Purchase:</span>
                                <span className="font-semibold">GHS 0.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Purchase Including tax:</span>
                                <span className="font-semibold">GHS 0.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Purchase Return Including Tax:</span>
                                <span className="font-semibold">GHS 0.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger className="flex items-center">
                                            <span className="text-muted-foreground">Purchase Due:</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Total amount due for purchases</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <span className="font-semibold">GHS 0.00</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sales Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Sale:</span>
                                <span className="font-semibold">GHS 6,437.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Sale Including tax:</span>
                                <span className="font-semibold">GHS 6,437.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Sell Return Including Tax:</span>
                                <span className="font-semibold">GHS 0.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger className="flex items-center">
                                            <span className="text-muted-foreground">Sale Due:</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Total amount due from sales</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <span className="font-semibold">GHS 1,737.50</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Overall Summary</CardTitle>
                        <CardDescription>Sale - Sale Return - Purchase - Purchase Return</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-lg">
                            <span>Sale - Purchase:</span>
                            <span className="font-bold text-green-500">GHS 6,437.00</span>
                        </div>
                        <div className="flex justify-between items-center text-lg">
                            <span>Due amount:</span>
                            <span className="font-bold text-green-500">GHS 1,737.50</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end">
                    <Button>
                        Print Report
                    </Button>
                </div>
            </div>
        </div>
    )
}

