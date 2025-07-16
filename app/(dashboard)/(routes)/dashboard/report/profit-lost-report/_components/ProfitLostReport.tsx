'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { DateRange } from 'react-day-picker'
import { DateRangePicker } from '@/components/commons/DateRangePicker'
import { fetchProfitLossDataByRange } from '@/lib/actions/combined.actions'

const currentYear = new Date().getFullYear();
export default function ProfitLossReport({ currency }: { currency: string }) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(currentYear, 0, 1),
        to: new Date(currentYear, 11, 31),
    });
    const [isLoading, setIsLoading] = useState(false);
    const [financialData, setFinancialData] = useState({
        totalSales: 0,
        totalProfitLoss: 0,
        totalExpenses: 0,
        totalAdjustments: 0,
        netProfit: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                if (dateRange?.from && dateRange?.to) {
                    const response = await fetchProfitLossDataByRange(dateRange.from, dateRange.to);
                    setFinancialData({
                        totalSales: response.totalSales,
                        totalProfitLoss: response.sales.profitOrLoss,
                        totalExpenses: response.totalExpenses,
                        totalAdjustments: response.totalAdjustments,
                        netProfit: response.netProfit,
                    });
                }
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dateRange?.from, dateRange?.to]);

    const { totalSales, totalProfitLoss, totalExpenses, totalAdjustments, netProfit } = financialData;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            <div className="container mx-auto p-4 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Profit / Loss Report</h1>
                        <p className="text-muted-foreground">Financial overview and analysis</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <DateRangePicker
                            className="w-[300px]"
                            onDateRangeChange={setDateRange}
                        />
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="bg-primary/5 border-none shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                                        <p className="text-2xl font-bold flex items-center"><span>{currency}</span> {isLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : (totalSales ?? 0).toFixed(2)}</p>
                                    </div>
                                    <div className="p-3 bg-primary/10 rounded-full">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm text-green-600">
                                    <ArrowUpRight className="w-4 h-4 mr-1" />
                                    <span>12.5% from last month</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-none shadow-lg">
                            <CardContent className="p-6">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Gross Profit</p>
                                    <p className="text-2xl font-bold flex items-center"><span>{currency}</span> {isLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : (totalProfitLoss ?? 0).toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">Total sell price - Total purchase price</p>
                                </div>
                                <div className="mt-4 flex items-center text-green-600 text-sm">
                                    <ArrowUpRight className="w-4 h-4 mr-1" />
                                    <span>8.2% increase</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-none shadow-lg">
                            <CardContent className="p-6">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                                    <p className="text-2xl font-bold flex items-center"><span>{currency}</span> {isLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : (netProfit ?? 0).toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">After adjustments & expenses</p>
                                </div>
                                <div className="mt-4 flex items-center text-red-600 text-sm">
                                    <ArrowDownRight className="w-4 h-4 mr-1" />
                                    <span>3.1% decrease</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 shadow-xl">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Opening Balance</h3>
                                <div className="space-y-4 divide-y">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start group">
                                            <div>
                                                <p className="font-medium group-hover:text-primary transition-colors">Opening Stock</p>
                                                <p className="text-sm text-muted-foreground">(By purchase price)</p>
                                            </div>
                                            <p className="font-medium">GHS 60,170,496.27</p>
                                        </div>
                                        <div className="flex justify-between items-start group">
                                            <div>
                                                <p className="font-medium group-hover:text-primary transition-colors">Opening Stock</p>
                                                <p className="text-sm text-muted-foreground">(By sale price)</p>
                                            </div>
                                            <p className="font-medium">GHS 119,031,860.16</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 space-y-4">
                                        <div className="flex justify-between items-start group">
                                            <div>
                                                <p className="font-medium group-hover:text-primary transition-colors">Total Purchase</p>
                                                <p className="text-sm text-muted-foreground">(Exc. tax, Discount)</p>
                                            </div>
                                            <p className="font-medium">GHS 0.00</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 shadow-xl">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Closing Balance</h3>
                                <div className="space-y-4 divide-y">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start group">
                                            <div>
                                                <p className="font-medium group-hover:text-primary transition-colors">Closing Stock</p>
                                                <p className="text-sm text-muted-foreground">(By purchase price)</p>
                                            </div>
                                            <p className="font-medium">GHS 60,165,946.27</p>
                                        </div>
                                        <div className="flex justify-between items-start group">
                                            <div>
                                                <p className="font-medium group-hover:text-primary transition-colors">Closing Stock</p>
                                                <p className="text-sm text-muted-foreground">(By sale price)</p>
                                            </div>
                                            <p className="font-medium">GHS 119,025,378.16</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 space-y-4">
                                        <div className="flex justify-between items-start group">
                                            <div>
                                                <p className="font-medium group-hover:text-primary transition-colors">Total Sales</p>
                                                <p className="text-sm text-muted-foreground">(Exc. tax, Discount)</p>
                                            </div>
                                            <p className="font-medium">GHS 6,437.00</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Additional Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 shadow-xl">
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold">Profit Calculation</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Detailed breakdown of profit calculations and adjustments
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                                            <div>
                                                <p className="font-medium">Total Stock Adjustment</p>
                                                <p className="text-sm text-muted-foreground">Current period</p>
                                            </div>
                                            <p className="font-medium flex item-center"><span>{currency}</span> {isLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : (totalAdjustments ?? 0).toFixed(2)}</p>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                                            <div>
                                                <p className="font-medium">Total Expenses</p>
                                                <p className="text-sm text-muted-foreground">Current period</p>
                                            </div>
                                            <p className="font-medium flex items-center"><span>{currency}</span> {isLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : (totalExpenses ?? 0).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button className="bg-primary hover:bg-primary/90">
                        <Printer className="w-4 h-4 mr-2" />
                        Print Report
                    </Button>
                </div>
            </div>
        </div>
    )
}

