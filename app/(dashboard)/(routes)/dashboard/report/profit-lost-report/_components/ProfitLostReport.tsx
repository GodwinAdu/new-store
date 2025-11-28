'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2, Download, BarChart3, PieChart } from 'lucide-react'
import { motion } from 'framer-motion'
import { DateRange } from 'react-day-picker'
import { DateRangePicker } from '@/components/commons/DateRangePicker'
import { getProfitLossReport } from '@/lib/actions/profit-loss.actions'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts'

interface ProfitLossData {
  summary: {
    totalSales: number;
    totalCOGS: number;
    grossProfit: number;
    grossProfitMargin: number;
    totalExpenses: number;
    totalOtherIncome: number;
    netProfit: number;
    netProfitMargin: number;
    period: { start: string; end: string };
  };
  inventory: {
    openingStock: { byPurchasePrice: number; bySalePrice: number };
    closingStock: { byPurchasePrice: number; bySalePrice: number };
  };
  breakdown: {
    expenses: Record<string, number>;
    otherIncome: Record<string, number>;
  };
  transactions: {
    salesCount: number;
    expensesCount: number;
    incomesCount: number;
  };
}

const currentYear = new Date().getFullYear();
export default function ProfitLossReport() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(currentYear, 0, 1),
        to: new Date(currentYear, 11, 31),
    });
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState<ProfitLossData | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            if (dateRange?.from && dateRange?.to) {
                const data = await getProfitLossReport(dateRange.from, dateRange.to);
                setReportData(data);
            }
        } catch (error) {
            console.error('Error fetching profit-loss data:', error);
            toast.error('Failed to fetch profit-loss report');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange?.from, dateRange?.to]);

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        if (!reportData) return;
        
        const csvContent = [
            ['Profit & Loss Report'],
            [`Period: ${new Date(reportData.summary.period.start).toLocaleDateString()} - ${new Date(reportData.summary.period.end).toLocaleDateString()}`],
            ['Generated:', new Date().toLocaleString()],
            [''],
            ['REVENUE'],
            ['Total Sales', `₵${reportData.summary.totalSales.toLocaleString()}`],
            [''],
            ['COST OF GOODS SOLD'],
            ['Total COGS', `₵${reportData.summary.totalCOGS.toLocaleString()}`],
            [''],
            ['GROSS PROFIT'],
            ['Gross Profit', `₵${reportData.summary.grossProfit.toLocaleString()}`],
            ['Gross Profit Margin (%)', `${reportData.summary.grossProfitMargin.toFixed(2)}%`],
            [''],
            ['OPERATING EXPENSES'],
            ['Total Expenses', `₵${reportData.summary.totalExpenses.toLocaleString()}`],
            ...Object.entries(reportData.breakdown.expenses).map(([category, amount]) => 
                [`  ${category}`, `₵${amount.toLocaleString()}`]
            ),
            [''],
            ['OTHER INCOME'],
            ['Total Other Income', `₵${reportData.summary.totalOtherIncome.toLocaleString()}`],
            ...Object.entries(reportData.breakdown.otherIncome).map(([category, amount]) => 
                [`  ${category}`, `₵${amount.toLocaleString()}`]
            ),
            [''],
            ['NET PROFIT'],
            ['Net Profit', `₵${reportData.summary.netProfit.toLocaleString()}`],
            ['Net Profit Margin (%)', `${reportData.summary.netProfitMargin.toFixed(2)}%`],
            [''],
            ['INVENTORY'],
            ['Opening Stock (Purchase Price)', `₵${reportData.inventory.openingStock.byPurchasePrice.toLocaleString()}`],
            ['Opening Stock (Sale Price)', `₵${reportData.inventory.openingStock.bySalePrice.toLocaleString()}`],
            ['Closing Stock (Purchase Price)', `₵${reportData.inventory.closingStock.byPurchasePrice.toLocaleString()}`],
            ['Closing Stock (Sale Price)', `₵${reportData.inventory.closingStock.bySalePrice.toLocaleString()}`]
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `profit-loss-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Report exported successfully');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
                <div className="container mx-auto p-4">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                            <p className="text-muted-foreground">Generating profit & loss report...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            <div className="container mx-auto p-4 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Profit & Loss Report</h1>
                        <p className="text-muted-foreground">Comprehensive financial performance analysis</p>
                        {reportData && (
                            <p className="text-sm text-muted-foreground">
                                Period: {new Date(reportData.summary.period.start).toLocaleDateString()} - {new Date(reportData.summary.period.end).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <DateRangePicker
                            className="w-[300px]"
                            onDateRangeChange={setDateRange}
                        />
                        <Button onClick={fetchData} disabled={isLoading} variant="outline">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                        </Button>
                    </div>
                </div>

                {/* Empty State */}
                {reportData && reportData.transactions.salesCount === 0 && reportData.transactions.expensesCount === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="text-center py-12">
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                        <BarChart3 className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">No Financial Data Available</h3>
                                        <p className="text-muted-foreground mt-2">
                                            No sales, expenses, or income records found for the selected period.
                                            <br />Start by making sales or recording expenses to generate your profit & loss report.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Summary Cards */}
                {reportData && (reportData.transactions.salesCount > 0 || reportData.transactions.expensesCount > 0) && (
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
                                        <p className="text-2xl font-bold flex items-center">₵{isLoading ? <Loader2 className='w-4 h-4 animate-spin ml-2' /> : (reportData?.summary.totalSales ?? 0).toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-primary/10 rounded-full">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                    <span>Transactions: {reportData?.transactions.salesCount || 0}</span>
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
                                    <p className="text-2xl font-bold flex items-center">₵{isLoading ? <Loader2 className='w-4 h-4 animate-spin ml-2' /> : (reportData?.summary.grossProfit ?? 0).toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Sales - Cost of Goods Sold</p>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className={reportData?.summary.grossProfitMargin && reportData.summary.grossProfitMargin > 0 ? 'text-green-600' : 'text-red-600'}>
                                        {reportData?.summary.grossProfitMargin?.toFixed(1) || 0}% margin
                                    </span>
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
                                    <p className="text-2xl font-bold flex items-center">₵{isLoading ? <Loader2 className='w-4 h-4 animate-spin ml-2' /> : (reportData?.summary.netProfit ?? 0).toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">After expenses & other income</p>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    {reportData?.summary.netProfit && reportData.summary.netProfit >= 0 ? (
                                        <><ArrowUpRight className="w-4 h-4 mr-1 text-green-600" />
                                        <span className="text-green-600">{reportData.summary.netProfitMargin.toFixed(1)}% margin</span></>
                                    ) : (
                                        <><ArrowDownRight className="w-4 h-4 mr-1 text-red-600" />
                                        <span className="text-red-600">{reportData?.summary.netProfitMargin?.toFixed(1) || 0}% margin</span></>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
                )}

                {/* Main Content */}
                {reportData && (reportData.transactions.salesCount > 0 || reportData.transactions.expensesCount > 0) && (
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
                                            <p className="font-medium">₵{reportData?.inventory.openingStock.byPurchasePrice.toLocaleString() || '0.00'}</p>
                                        </div>
                                        <div className="flex justify-between items-start group">
                                            <div>
                                                <p className="font-medium group-hover:text-primary transition-colors">Opening Stock</p>
                                                <p className="text-sm text-muted-foreground">(By sale price)</p>
                                            </div>
                                            <p className="font-medium">₵{reportData?.inventory.openingStock.bySalePrice.toLocaleString() || '0.00'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 space-y-4">
                                        <div className="flex justify-between items-start group">
                                            <div>
                                                <p className="font-medium group-hover:text-primary transition-colors">Cost of Goods Sold</p>
                                                <p className="text-sm text-muted-foreground">(FIFO method)</p>
                                            </div>
                                            <p className="font-medium">₵{reportData?.summary.totalCOGS.toLocaleString() || '0.00'}</p>
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
                                            <p className="font-medium">₵{reportData?.inventory.closingStock.byPurchasePrice.toLocaleString() || '0.00'}</p>
                                        </div>
                                        <div className="flex justify-between items-start group">
                                            <div>
                                                <p className="font-medium group-hover:text-primary transition-colors">Closing Stock</p>
                                                <p className="text-sm text-muted-foreground">(By sale price)</p>
                                            </div>
                                            <p className="font-medium">₵{reportData?.inventory.closingStock.bySalePrice.toLocaleString() || '0.00'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 space-y-4">
                                        <div className="flex justify-between items-start group">
                                            <div>
                                                <p className="font-medium group-hover:text-primary transition-colors">Total Sales Revenue</p>
                                                <p className="text-sm text-muted-foreground">(Current period)</p>
                                            </div>
                                            <p className="font-medium">₵{reportData?.summary.totalSales.toLocaleString() || '0.00'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
                )}

                {/* Additional Details */}
                {reportData && (reportData.transactions.salesCount > 0 || reportData.transactions.expensesCount > 0) && (
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
                                                <p className="font-medium">Total Other Income</p>
                                                <p className="text-sm text-muted-foreground">Non-sales income</p>
                                            </div>
                                            <p className="font-medium flex items-center">₵{isLoading ? <Loader2 className='w-4 h-4 animate-spin ml-2' /> : (reportData?.summary.totalOtherIncome ?? 0).toLocaleString()}</p>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                                            <div>
                                                <p className="font-medium">Total Expenses</p>
                                                <p className="text-sm text-muted-foreground">Operating expenses</p>
                                            </div>
                                            <p className="font-medium flex items-center">₵{isLoading ? <Loader2 className='w-4 h-4 animate-spin ml-2' /> : (reportData?.summary.totalExpenses ?? 0).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                )}

                {/* Charts Section */}
                {reportData && (reportData.transactions.salesCount > 0 || reportData.transactions.expensesCount > 0) && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Profit Analysis Chart */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 shadow-xl">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <BarChart3 className="h-5 w-5 text-primary" />
                                        <h3 className="text-lg font-semibold">Profit Analysis</h3>
                                    </div>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[
                                                { name: 'Sales', value: reportData.summary.totalSales, fill: '#10b981' },
                                                { name: 'COGS', value: reportData.summary.totalCOGS, fill: '#f59e0b' },
                                                { name: 'Expenses', value: reportData.summary.totalExpenses, fill: '#ef4444' },
                                                { name: 'Net Profit', value: reportData.summary.netProfit, fill: '#3b82f6' }
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip formatter={(value) => [`₵${Number(value).toLocaleString()}`, 'Amount']} />
                                                <Bar dataKey="value" fill="#8884d8" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Expense Breakdown Chart */}
                        {Object.keys(reportData.breakdown.expenses).length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 shadow-xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <PieChart className="h-5 w-5 text-primary" />
                                            <h3 className="text-lg font-semibold">Expense Breakdown</h3>
                                        </div>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RechartsPieChart>
                                                    <Pie
                                                        data={Object.entries(reportData.breakdown.expenses).map(([category, amount], index) => ({
                                                            name: category,
                                                            value: amount,
                                                            fill: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][index % 5]
                                                        }))}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {Object.entries(reportData.breakdown.expenses).map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][index % 5]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => [`₵${Number(value).toLocaleString()}`, 'Amount']} />
                                                </RechartsPieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Detailed Breakdown */}
                {reportData && (reportData.transactions.salesCount > 0 || reportData.transactions.expensesCount > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 shadow-xl">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-6">Financial Summary</h3>
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Expenses */}
                                    {Object.keys(reportData.breakdown.expenses).length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-red-600 mb-3">Operating Expenses</h4>
                                            <div className="space-y-2">
                                                {Object.entries(reportData.breakdown.expenses).map(([category, amount]) => (
                                                    <div key={category} className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                                                        <span className="text-sm">{category}</span>
                                                        <span className="text-red-600 font-medium">₵{amount.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Other Income */}
                                    {Object.keys(reportData.breakdown.otherIncome).length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-green-600 mb-3">Other Income</h4>
                                            <div className="space-y-2">
                                                {Object.entries(reportData.breakdown.otherIncome).map(([category, amount]) => (
                                                    <div key={category} className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                                                        <span className="text-sm">{category}</span>
                                                        <span className="text-green-600 font-medium">₵{amount.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Actions */}
                {reportData && (reportData.transactions.salesCount > 0 || reportData.transactions.expensesCount > 0) && (
                <div className="flex justify-end gap-4">
                    <Button onClick={handleExport} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
                        <Printer className="w-4 h-4 mr-2" />
                        Print Report
                    </Button>
                </div>
                )}
            </div>
        </div>
    )
}

