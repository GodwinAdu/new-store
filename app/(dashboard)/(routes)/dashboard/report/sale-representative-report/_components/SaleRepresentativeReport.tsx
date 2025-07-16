'use client'

import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRange } from 'react-day-picker'
import { DateRangePicker } from '@/components/commons/DateRangePicker'
import { getSalesRepresentation } from '@/lib/actions/combined.actions'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

const currentYear = new Date().getFullYear()
export default function SaleRepresentativeReport({ currency }: { currency: string }) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(currentYear, 0, 1),
        to: new Date(currentYear, 11, 31),
    });
    const [isLoading, setIsLoading] = useState(false);
    interface SalesData {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor: string;
        }[];
    }

    const [representationData, setRepresentationData] = useState<{
        totalCanceled: number;
        totalDelivered: number;
        totalExpenses: number;
        salesData: SalesData;
    }>({
        totalCanceled: 0,
        totalDelivered: 0,
        totalExpenses: 0,
        salesData: {
            labels: [],
            datasets: [],
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                if (dateRange?.from && dateRange?.to) {
                    const response = await getSalesRepresentation(dateRange.from, dateRange.to);
                    setRepresentationData({
                        totalCanceled: response.totalCanceled,
                        totalDelivered: response.totalDelivered,
                        totalExpenses: response.totalExpenses,
                        salesData: response.salesData
                    });
                }
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dateRange?.to, dateRange?.from,]);

    const {
        totalCanceled,
        totalDelivered,
        totalExpenses,
        salesData,
    } = representationData;

    console.log(salesData);


    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Sales Representative Report</h1>
                <div className="flex items-center gap-4">
                    <DateRangePicker
                        className="w-[300px]"
                        onDateRangeChange={setDateRange}
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className='bg-primary/5 border-none shadow-lg'>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold"><span>{currency}</span> {(totalDelivered).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className='bg-primary/5 border-none shadow-lg'>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold"><span>{currency}</span> {(totalCanceled).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            No returns this period
                        </p>
                    </CardContent>
                </Card>
                <Card className='bg-primary/5 border-none shadow-lg'>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold"><span>{currency}</span> {(totalExpenses).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            No expenses recorded
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <Bar data={salesData} options={{ responsive: true }} />
                </CardContent>
            </Card>

          
        </div>
    )
}

