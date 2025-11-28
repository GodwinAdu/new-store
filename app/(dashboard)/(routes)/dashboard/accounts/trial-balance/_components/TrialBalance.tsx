'use client'

import { useState, useEffect } from 'react'
import { DownloadIcon, PrinterIcon, RefreshCcw, ArrowUpDown, CheckCircle, AlertCircle } from 'lucide-react'
import { type ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { DataTable } from '@/components/table/data-table'
import { getTrialBalance } from '@/lib/actions/accounts.actions'

interface TrialBalanceData {
    _id: string
    name: string
    type: string
    accountNumber?: string
    debit: number
    credit: number
    balance: number
}

interface TrialBalanceResponse {
    accounts: TrialBalanceData[]
    totals: {
        debits: number
        credits: number
        difference: number
        isBalanced: boolean
    }
    summary: {
        totalAccounts: number
        asOfDate: string
    }
}

export default function TrialBalance() {
    const [trialBalanceData, setTrialBalanceData] = useState<TrialBalanceResponse | null>(null)
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        loadTrialBalance()
    }, [])
    
    const loadTrialBalance = async () => {
        setLoading(true)
        try {
            const data = await getTrialBalance()
            setTrialBalanceData(data)
        } catch (error) {
            console.error('Failed to load trial balance:', error)
        } finally {
            setLoading(false)
        }
    }

    const columns: ColumnDef<TrialBalanceData>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Account Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "accountNumber",
            header: "Account #",
            cell: ({ row }) => {
                const accountNumber = row.getValue("accountNumber") as string
                return accountNumber ? (
                    <span className="font-mono text-sm">{accountNumber}</span>
                ) : (
                    <span className="text-gray-400">-</span>
                )
            },
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => {
                const type = row.getValue("type") as string
                return (
                    <div className="flex items-center">
                        <span className={cn(
                            "rounded-full w-2 h-2 mr-2",
                            type === "asset" && "bg-green-500",
                            type === "liability" && "bg-red-500",
                            type === "revenue" && "bg-blue-500",
                            type === "expense" && "bg-yellow-500",
                        )} />
                        <span className="capitalize">{type}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: "credit",
            header: "Credit",
            cell: ({ row }) => {
                const amount = row.getValue("credit") as number
                return amount > 0 ? (
                    <span className="font-mono text-red-600">
                        ₵{amount.toLocaleString()}
                    </span>
                ) : (
                    <span className="text-gray-400">-</span>
                )
            },
        },
        {
            accessorKey: "debit",
            header: "Debit",
            cell: ({ row }) => {
                const amount = row.getValue("debit") as number
                return amount > 0 ? (
                    <span className="font-mono text-green-600">
                        ₵{amount.toLocaleString()}
                    </span>
                ) : (
                    <span className="text-gray-400">-</span>
                )
            },
        },
    ]

    if (loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        )
    }
    
    if (!trialBalanceData) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="text-center py-8">
                    <p className="text-gray-500">Failed to load trial balance data</p>
                    <Button onClick={loadTrialBalance} className="mt-4">
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        )
    }
    
    const { accounts, totals, summary } = trialBalanceData

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Trial Balance</h1>
                    <p className="text-muted-foreground">
                        View and analyze your account balances
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {/* <DateRangePicker date={date} onDateChange={setDate} /> */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={loadTrialBalance}>
                                    <RefreshCcw className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Refresh data</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            ₵{totals.credits.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total credit balance across all accounts
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ₵{totals.debits.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total debit balance across all accounts
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${
                            totals.difference === 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            ₵{totals.difference.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Difference between credits and debits
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Account Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary.totalAccounts}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Different types of accounts in the system
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Account Balances
                        {totals.isBalanced ? (
                            <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">Balanced</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">Unbalanced</span>
                            </div>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Trial balance as of {new Date(summary.asOfDate).toLocaleDateString()}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={accounts} />
                    
                    <div className="mt-6 border-t pt-4">
                        <div className="flex justify-between items-center font-bold text-lg">
                            <span>TOTALS:</span>
                            <div className="flex gap-8">
                                <span className="text-red-600">₵{totals.credits.toLocaleString()}</span>
                                <span className="text-green-600">₵{totals.debits.toLocaleString()}</span>
                            </div>
                        </div>
                        {!totals.isBalanced && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2 text-red-800">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        Trial balance is out of balance by ₵{Math.abs(totals.difference).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline" className="gap-2">
                    <DownloadIcon className="h-4 w-4" />
                    Export
                </Button>
                <Button className="gap-2">
                    <PrinterIcon className="h-4 w-4" />
                    Print
                </Button>
            </div>
        </div>
    )
}

