"use client"

import type React from "react"
import { useState, useMemo } from "react"
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    type SortingState,
    type ColumnFiltersState,
    type VisibilityState,
    type Row,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
    File,
    Printer,
    Search,
    Download,
    RefreshCw,
    Eye,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    MoreHorizontal,
    Grid3X3,
    List,
    LayoutGrid,
    SlidersHorizontal,
} from "lucide-react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { cn } from "@/lib/utils"

// Custom saveAs function to replace file-saver
const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.style.display = "none"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

interface FilterOption {
    _id: string
    label: string
    value: string
}

interface FilterGroup {
    id: string
    label: string
    type: "select" | "multiselect" | "date" | "number" | "text"
    options?: FilterOption[]
}

interface QuickFilter {
    id: string
    label: string
    value: string
    count?: number
}

interface BulkAction {
    id: string
    label: string
    icon: React.ReactNode
    action: (selectedRows: Row<any>[]) => void
    variant?: "default" | "destructive"
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    searchPlaceholder?: string
    filterGroups?: FilterGroup[]
    quickFilters?: QuickFilter[]
    bulkActions?: BulkAction[]
    onFilterChange?: (filters: Record<string, string>) => void
    isLoading?: boolean
    enableRowSelection?: boolean
    enableBulkActions?: boolean
    enableExport?: boolean
    enableColumnVisibility?: boolean
    enableSearch?: boolean
    enablePagination?: boolean
    title?: string
    description?: string
    emptyStateTitle?: string
    emptyStateDescription?: string
    className?: string
}

type ViewDensity = "compact" | "comfortable" | "spacious"

export function ModernDataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = "Search...",
    filterGroups = [],
    quickFilters = [],
    bulkActions = [],
    onFilterChange,
    isLoading = false,
    enableRowSelection = true,
    enableBulkActions = true,
    enableExport = true,
    enableColumnVisibility = true,
    enableSearch = true,
    enablePagination = true,
    title,
    description,
    emptyStateTitle = "No data found",
    emptyStateDescription = "No results match your search criteria.",
    className,
}: DataTableProps<TData, TValue>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [globalFilter, setGlobalFilter] = useState("")
    const [viewDensity, setViewDensity] = useState<ViewDensity>("comfortable")
    const [showFilters, setShowFilters] = useState(false)
    const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null)

    // Add selection column if row selection is enabled
    const enhancedColumns = useMemo(() => {
        if (!enableRowSelection) return columns

        const selectionColumn: ColumnDef<TData, TValue> = {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        }

        return [selectionColumn, ...columns]
    }, [columns, enableRowSelection])

    const table = useReactTable({
        data,
        columns: enhancedColumns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    })

    const selectedRows = table.getFilteredSelectedRowModel().rows
    const hasSelection = selectedRows.length > 0

    // Export functions with fixed file handling
    const exportToCSV = () => {
        try {
            const csvData = data.map((row) =>
                columns.reduce((acc, col) => {
                    if (col.accessorKey) {
                        acc[col.header as string] = row[col.accessorKey as keyof typeof row]
                    }
                    return acc
                }, {} as any),
            )

            const worksheet = XLSX.utils.json_to_sheet(csvData)
            const csv = XLSX.utils.sheet_to_csv(worksheet)
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
            downloadFile(blob, "data.csv")
        } catch (error) {
            console.error("Error exporting CSV:", error)
        }
    }

    const exportToExcel = () => {
        try {
            const excelData = data.map((row) =>
                columns.reduce((acc, col) => {
                    if (col.accessorKey) {
                        acc[col.header as string] = row[col.accessorKey as keyof typeof row]
                    }
                    return acc
                }, {} as any),
            )

            const workbook = XLSX.utils.book_new()
            const worksheet = XLSX.utils.json_to_sheet(excelData)
            XLSX.utils.book_append_sheet(workbook, worksheet, "Data")
            XLSX.writeFile(workbook, "data.xlsx")
        } catch (error) {
            console.error("Error exporting Excel:", error)
        }
    }

    const exportToPDF = () => {
        try {
            const doc = new jsPDF()
            autoTable(doc, {
                head: [columns.map((col) => col.header)],
                body: data.map((row) => columns.map((col) => row[col.accessorKey as keyof typeof row] || "")),
            })
            doc.save("data.pdf")
        } catch (error) {
            console.error("Error exporting PDF:", error)
        }
    }

    const getDensityClasses = () => {
        switch (viewDensity) {
            case "compact":
                return "text-xs"
            case "spacious":
                return "text-base py-4"
            default:
                return "text-sm py-2"
        }
    }

    const LoadingSkeleton = () => (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex space-x-4">
                    {Array.from({ length: columns.length }).map((_, j) => (
                        <Skeleton key={j} className="h-8 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    )

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{emptyStateTitle}</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm">{emptyStateDescription}</p>
            {globalFilter && (
                <Button variant="outline" onClick={() => setGlobalFilter("")} className="mt-4">
                    Clear search
                </Button>
            )}
        </div>
    )

    return (
        <div className={cn("space-y-4", className)}>
            {/* Header */}
            {(title || description) && (
                <div className="space-y-1">
                    {title && (
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            {title}
                        </h2>
                    )}
                    {description && <p className="text-sm text-gray-600">{description}</p>}
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col gap-4 p-4 bg-white rounded-lg border shadow-sm">
                {/* Top Row - Search and Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        {/* Global Search */}
                        {enableSearch && (
                            <div className="relative max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder={searchPlaceholder}
                                    value={globalFilter}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                />
                            </div>
                        )}

                        {/* Quick Filters */}
                        {quickFilters.length > 0 && (
                            <div className="flex items-center gap-2">
                                {quickFilters.map((filter) => (
                                    <Button
                                        key={filter.id}
                                        variant={activeQuickFilter === filter.id ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setActiveQuickFilter(activeQuickFilter === filter.id ? null : filter.id)}
                                        className="h-8"
                                    >
                                        {filter.label}
                                        {filter.count && (
                                            <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                                                {filter.count}
                                            </Badge>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {/* Bulk Actions */}
                        {enableBulkActions && hasSelection && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <MoreHorizontal className="h-4 w-4 mr-2" />
                                        Actions ({selectedRows.length})
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {bulkActions.map((action) => (
                                        <DropdownMenuItem
                                            key={action.id}
                                            onClick={() => action.action(selectedRows)}
                                            className={cn(action.variant === "destructive" && "text-red-600 focus:text-red-600")}
                                        >
                                            {action.icon}
                                            <span className="ml-2">{action.label}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {/* Filters Toggle */}
                        {filterGroups.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn(showFilters && "bg-gray-100")}
                            >
                                <SlidersHorizontal className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                        )}

                        {/* View Density */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>View Density</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setViewDensity("compact")}>
                                    <List className="h-4 w-4 mr-2" />
                                    Compact
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setViewDensity("comfortable")}>
                                    <LayoutGrid className="h-4 w-4 mr-2" />
                                    Comfortable
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setViewDensity("spacious")}>
                                    <Grid3X3 className="h-4 w-4 mr-2" />
                                    Spacious
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Column Visibility */}
                        {enableColumnVisibility && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-2" />
                                        Columns
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {table
                                        .getAllColumns()
                                        .filter((column) => column.getCanHide())
                                        .map((column) => (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {/* Export Options */}
                        {enableExport && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={exportToCSV}>
                                        <File className="h-4 w-4 mr-2" />
                                        CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={exportToExcel}>
                                        <File className="h-4 w-4 mr-2" />
                                        Excel
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={exportToPDF}>
                                        <Printer className="h-4 w-4 mr-2" />
                                        PDF
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {/* Refresh */}
                        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && filterGroups.length > 0 && (
                    <div className="border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filterGroups.map((group) => (
                                <div key={group.id} className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">{group.label}</label>
                                    {group.type === "select" && group.options && (
                                        <Select>
                                            <SelectTrigger className="h-8">
                                                <SelectValue placeholder={`Select ${group.label.toLowerCase()}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {group.options.map((option) => (
                                                    <SelectItem key={option._id} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {group.type === "text" && (
                                        <Input placeholder={`Filter by ${group.label.toLowerCase()}`} className="h-8" />
                                    )}
                                    {group.type === "date" && <Input type="date" className="h-8" />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-gray-50">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={cn(
                                            "font-semibold text-gray-900 border-b",
                                            header.column.getCanSort() && "cursor-pointer select-none",
                                            getDensityClasses(),
                                        )}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center space-x-2">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && (
                                                <div className="flex flex-col">
                                                    {header.column.getIsSorted() === "asc" ? (
                                                        <ArrowUp className="h-3 w-3 text-gray-600" />
                                                    ) : header.column.getIsSorted() === "desc" ? (
                                                        <ArrowDown className="h-3 w-3 text-gray-600" />
                                                    ) : (
                                                        <ArrowUpDown className="h-3 w-3 text-gray-400" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={enhancedColumns.length} className="p-4">
                                    <LoadingSkeleton />
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={cn(
                                        "hover:bg-gray-50 transition-colors",
                                        row.getIsSelected() && "bg-blue-50 hover:bg-blue-100",
                                        getDensityClasses(),
                                    )}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="border-b border-gray-100">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={enhancedColumns.length} className="p-0">
                                    <EmptyState />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {enablePagination && (
                <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border shadow-sm">
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                            <span>Rows per page:</span>
                            <Select
                                value={table.getState().pagination.pageSize.toString()}
                                onValueChange={(value) => table.setPageSize(Number(value))}
                            >
                                <SelectTrigger className="h-8 w-16">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={pageSize.toString()}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            {enableRowSelection && (
                                <span>
                                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                                    selected
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </span>
                        <div className="flex items-center space-x-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                                className="h-8 w-8 p-0"
                            >
                                {"<<"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="h-8 w-8 p-0"
                            >
                                {"<"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="h-8 w-8 p-0"
                            >
                                {">"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                                className="h-8 w-8 p-0"
                            >
                                {">>"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
