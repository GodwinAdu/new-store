'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { PrinterIcon } from 'lucide-react'
import { DateRangePicker } from '@/components/commons/DateRangePicker'
import { DateRange } from 'react-day-picker'
import { getTopProductsByRange } from '@/lib/actions/sale.actions'

const currentYear = new Date().getFullYear();

export default function TrendingProducts() {
    const [numberOfProducts, setNumberOfProducts] = useState(5)
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(currentYear, 0, 1),
        to: new Date(currentYear, 11, 31),
    });
    const [productsData, setProductsData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (dateRange?.from && dateRange?.to) {
                    const response = await getTopProductsByRange(dateRange.from, dateRange.to, numberOfProducts);
                    setProductsData(response);
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [dateRange?.to, dateRange?.from, numberOfProducts]);
    console.log(productsData);

    return (
        <div className="min-h-screen bg-background p-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold">Trending Products</CardTitle>
                            <CardDescription>Monitor your top performing products</CardDescription>
                        </div>
                        <Button variant="outline" size="icon">
                            <PrinterIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Filters Section */}
                        <div className="flex gap-4 items-center">
                            <DateRangePicker
                                className="w-[300px]"
                                onDateRangeChange={setDateRange}
                            />
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                                <Input type="number" value={numberOfProducts} onChange={(e) => setNumberOfProducts(Number(e.target.value))} placeholder="Number of products" />
                            </div>
                        </div>
                        {/* Chart Section */}
                        <Card className="pt-6">
                            <CardHeader>
                                <CardTitle className="text-lg font-medium">Top Trending Products</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={productsData}
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis
                                                dataKey="productName"
                                                className="text-xs"
                                                tick={{ fill: 'hsl(var(--foreground))' }}
                                            />
                                            <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--background))',
                                                    border: '1px solid hsl(var(--border))',
                                                }}
                                            />
                                            <Bar
                                                dataKey="totalQuantity"
                                                fill="hsl(var(--primary))"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

