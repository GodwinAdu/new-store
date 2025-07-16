'use client'

import { useState } from 'react'
import { Calendar, Download, FileSpreadsheet, FileIcon as FilePdf, Printer, Search, BarChart3, ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

export default function StockAdjustmentReport() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState('table')

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b">
                <div className="flex h-16 items-center px-4 md:px-6">
                    <h1 className="text-2xl font-semibold">Stock Adjustment Report</h1>
                    <div className="ml-auto flex items-center space-x-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Analytics
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[625px]">
                                <DialogHeader>
                                    <DialogTitle>Stock Adjustment Analytics</DialogTitle>
                                    <DialogDescription>
                                        Detailed analysis of your stock adjustments over time.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4">
                                    <div className="h-[300px] bg-muted rounded-lg flex items-center justify-center">
                                        Chart Placeholder
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-6 space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All locations</SelectItem>
                                <SelectItem value="warehouse">Warehouse</SelectItem>
                                <SelectItem value="store">Store</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <Calendar className="w-4 h-4 mr-2" />
                            Filter by date
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search in all columns..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="transition-all hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Normal</CardTitle>
                            <Badge variant="secondary">Today</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">GHS 0.00</div>
                            <p className="text-xs text-muted-foreground">+0% from last month</p>
                        </CardContent>
                    </Card>
                    <Card className="transition-all hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Abnormal</CardTitle>
                            <Badge variant="secondary">Today</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">GHS 0.00</div>
                            <p className="text-xs text-muted-foreground">+0% from last month</p>
                        </CardContent>
                    </Card>
                    <Card className="transition-all hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Stock Adjustment</CardTitle>
                            <Badge variant="secondary">Today</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">GHS 0.00</div>
                            <p className="text-xs text-muted-foreground">+0% from last month</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="table">Table View</TabsTrigger>
                            <TabsTrigger value="grid">Grid View</TabsTrigger>
                        </TabsList>
                        <div className="flex flex-wrap items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Download className="w-4 h-4 mr-2" />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[200px]">
                                    <DropdownMenuLabel>Choose format</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                                        Export to Excel
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Download className="w-4 h-4 mr-2" />
                                        Export to CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <FilePdf className="w-4 h-4 mr-2" />
                                        Export to PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Printer className="w-4 h-4 mr-2" />
                                        Print
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Column Visibility</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Action</DropdownMenuItem>
                                    <DropdownMenuItem>Date</DropdownMenuItem>
                                    <DropdownMenuItem>Reference No</DropdownMenuItem>
                                    <DropdownMenuItem>Location</DropdownMenuItem>
                                    <DropdownMenuItem>Adjustment Type</DropdownMenuItem>
                                    <DropdownMenuItem>Total Amount</DropdownMenuItem>
                                    <DropdownMenuItem>Total Amount Recovered</DropdownMenuItem>
                                    <DropdownMenuItem>Reason</DropdownMenuItem>
                                    <DropdownMenuItem>Added By</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <TabsContent value="table" className="space-y-4">
                        <div className="rounded-lg border bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">
                                            <Button variant="ghost" size="sm" className="h-8 flex items-center gap-2">
                                                Action
                                                <ArrowUpDown className="w-4 h-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" size="sm" className="h-8 flex items-center gap-2">
                                                Date
                                                <ArrowUpDown className="w-4 h-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>Reference No</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Adjustment Type</TableHead>
                                        <TableHead className="text-right">Total Amount</TableHead>
                                        <TableHead className="text-right">Amount Recovered</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Added By</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-[400px] text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                <BarChart3 className="w-8 h-8" />
                                                <p>No data available</p>
                                                <p className="text-sm">Try adjusting your filters or search terms</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground">Show</p>
                                <Select defaultValue="50">
                                    <SelectTrigger className="w-[70px]">
                                        <SelectValue placeholder="50" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">entries</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled>
                                    Previous
                                </Button>
                                <Button variant="outline" size="sm" disabled>
                                    Next
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="grid" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 0 }).map((_, i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <CardTitle>Adjustment #{i + 1}</CardTitle>
                                        <CardDescription>Reference No: REF-{i + 1}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Date:</span>
                                                <span className="text-sm">-</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Location:</span>
                                                <span className="text-sm">-</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Amount:</span>
                                                <span className="text-sm font-medium">GHS 0.00</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

