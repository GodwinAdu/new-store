"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Plus, Trash2, Upload, Save, FileText, AlertTriangle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createProductStock } from "@/lib/actions/product-batch.actions"
import { toast } from "sonner"

// Define the interface for a single stock item
interface StockItem {
    id: string // Unique ID for React keys
    product: string // Product _id
    sku: string
    quantity: number
    unitCost: number
    additionalExpenses: number
    expiryDate: string
    batchNumber: string
    supplier: string
    warehouseId: string // Warehouse _id
    temperature: number
    notes: string
    totalCost: number // Derived
    sellingPrice: number // Derived
}

interface BulkImportItem {
    sku: string
    product: string // Product name for display
    quantity: number
    unitCost: number
    additionalExpenses: number
    sellingPrice: number
    expiryDate: string
    batchNumber: string
    warehouseId: string // Warehouse name for display
    status: "valid" | "error" | "warning"
    errors: string[]
}

interface AddStockProps {
    products: IProduct[]
    warehouses: IWarehouse[]
}

export default function AddStock({ products, warehouses }: AddStockProps) {
    const [items, setItems] = useState<StockItem[]>([
        {
            id: crypto.randomUUID(),
            product: "",
            sku: "",
            quantity: 0,
            unitCost: 0,
            additionalExpenses: 0,
            expiryDate: "",
            batchNumber: "",
            supplier: "",
            warehouseId: "",
            temperature: 2,
            notes: "",
            totalCost: 0,
            sellingPrice: 0,
        },
    ])
    const [bulkImportData, setBulkImportData] = useState<BulkImportItem[]>([])
    const [selectedTab, setSelectedTab] = useState("manual")
    const [isProcessing, setIsProcessing] = useState(false)

    // Define a default markup percentage for selling price calculation
    const DEFAULT_MARKUP_PERCENTAGE = 0.2 // 20% markup

    // Helper function to calculate totalCost and sellingPrice
    const calculateDerivedValues = (item: StockItem): StockItem => {
        const quantity = item.quantity ?? 0
        const unitCost = item.unitCost ?? 0
        const additionalExpenses = item.additionalExpenses ?? 0

        const newTotalCost = quantity * unitCost + additionalExpenses
        const totalCostPerUnit = unitCost + (quantity > 0 ? additionalExpenses / quantity : 0)
        const newSellingPrice = totalCostPerUnit * (1 + DEFAULT_MARKUP_PERCENTAGE)

        return {
            ...item,
            totalCost: newTotalCost,
            sellingPrice: newSellingPrice,
        }
    }

    const handleItemChange = (index: number, field: keyof StockItem, value: any) => {
        setItems((prevItems) => {
            const newItems = [...prevItems]
            let updatedItem = { ...newItems[index], [field]: value }

            // Recalculate derived values if relevant fields change
            if (["quantity", "unitCost", "additionalExpenses"].includes(field as string)) {
                updatedItem = calculateDerivedValues(updatedItem)
            }

            newItems[index] = updatedItem
            return newItems
        })
    }

    const addStockItem = () => {
        setItems((prevItems) => [
            ...prevItems,
            {
                id: crypto.randomUUID(),
                product: "",
                sku: "",
                quantity: 0,
                unitCost: 0,
                additionalExpenses: 0,
                expiryDate: "",
                batchNumber: "",
                supplier: "",
                warehouseId: "",
                temperature: 2,
                notes: "",
                totalCost: 0,
                sellingPrice: 0,
            },
        ])
    }

    const removeStockItem = (index: number) => {
        setItems((prevItems) => prevItems.filter((_, i) => i !== index))
    }

    const handleBulkImport = (csvData: string) => {
        const lines = csvData.split("\n").filter((line) => line.trim())
        const headers = lines[0].split(",").map((h) => h.trim())
        const data: BulkImportItem[] = []

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(",").map((v) => v.trim())
            const item: BulkImportItem = {
                sku: values[0] || "",
                product: values[1] || "", // This will be product name, need to map to ID later
                quantity: Number.parseFloat(values[2]) || 0,
                unitCost: Number.parseFloat(values[3]) || 0,
                additionalExpenses: Number.parseFloat(values[4]) || 0,
                expiryDate: values[5] || "",
                batchNumber: values[6] || "",
                warehouseId: values[7] || "", // This will be warehouse name, need to map to ID later
                status: "valid",
                errors: [],
                sellingPrice: 0, // Initialize
            }

            // Calculate selling price for bulk import items
            const totalCostPerUnit = item.unitCost + (item.quantity > 0 ? item.additionalExpenses / item.quantity : 0)
            item.sellingPrice = totalCostPerUnit * (1 + DEFAULT_MARKUP_PERCENTAGE)

            // Basic validation for bulk import
            if (!item.sku) item.errors.push("SKU is required")
            if (!item.product) item.errors.push("Product name is required")
            if (item.quantity <= 0) item.errors.push("Quantity must be greater than 0")
            if (item.unitCost <= 0) item.errors.push("Unit cost must be greater than 0")
            if (!item.expiryDate) item.errors.push("Expiry date is required")
            if (!item.warehouseId) item.errors.push("Location is required")
            if (!item.batchNumber) item.errors.push("Batch number is required")

            if (item.errors.length > 0) {
                item.status = "error"
            } else if (item.quantity > 1000) {
                item.status = "warning"
                item.errors.push("Large quantity - please verify")
            }
            data.push(item)
        }
        setBulkImportData(data)
    }

    const onSubmit = async (event: React.FormEvent) => {
        try {
            event.preventDefault()
            setIsProcessing(true)

            // Basic client-side validation for manual entry
            const validItemsToSubmit = items.filter((item) => {
                // Simple check for required fields
                return (
                    item.product &&
                    item.sku &&
                    item.quantity > 0 &&
                    item.unitCost > 0 &&
                    item.expiryDate &&
                    item.warehouseId
                )
            })

            if (validItemsToSubmit.length === 0) {
                setIsProcessing(false)
                alert("No valid items to add to stock. Please fill in all required fields.")
                return
            }

            // Map to the format expected by the server action
            const itemsForServer = validItemsToSubmit.map((item) => ({
                product: item.product,
                warehouse: item.warehouseId,
                batchNumber: item.batchNumber,
                unitCost: item.unitCost,
                quantity: item.quantity,
                expiryDate: item.expiryDate,
                additionalExpenses: item.additionalExpenses,
                sellingPrice: item.sellingPrice,
                notes: item.notes,
            }));

            await createProductStock(itemsForServer)

            console.log(itemsForServer)

            toast.success("Successfully!")


        } catch (error) {
            console.log(error)
            toast.error("Something went wrong", {
                description: "Please try again later"
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0)
    const totalValue = items.reduce((sum, item) => sum + (item.totalCost ?? 0), 0)
    const validItemsCount = items.filter(
        (item) =>
            item.product &&
            item.sku &&
            item.quantity > 0 &&
            item.unitCost > 0 &&
            item.expiryDate &&
            item.warehouseId,
    ).length

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Add Stock</h1>
                    <p className="text-muted-foreground">Add new inventory items to warehouse stock</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" disabled={isProcessing}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                    </Button>
                    <Button onClick={onSubmit} disabled={isProcessing || validItemsCount === 0}>
                        {isProcessing ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <Package className="h-4 w-4 mr-2" />
                                Add to Stock
                            </>
                        )}
                    </Button>
                </div>
            </div>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
                <TabsList className="">
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="space-y-4">
                    <form onSubmit={onSubmit} className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Stock Items</CardTitle>
                                        <CardDescription>Add individual stock items with detailed information</CardDescription>
                                    </div>
                                    <Button onClick={addStockItem} size="sm" type="button">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Item
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {items.map((item, index) => (
                                        <Card key={item.id} className="p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-medium">Item #{index + 1}</h4>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeStockItem(index)}
                                                    disabled={items.length === 1}
                                                    type="button"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`product-${index}`}>Product</Label>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            const selectedProduct = products.find((p) => p._id === value)
                                                            handleItemChange(index, "product", value)
                                                            handleItemChange(index, "sku", selectedProduct?.sku || "")
                                                        }}
                                                        value={item.product}
                                                    >
                                                        <SelectTrigger id={`product-${index}`}>
                                                            <SelectValue placeholder="Select product" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {products.map((product) => (
                                                                <SelectItem key={product._id} value={product._id}>
                                                                    {product.name} ({product.sku})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                                                    <Input
                                                        id={`quantity-${index}`}
                                                        type="number"
                                                        placeholder="0"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`unitCost-${index}`}>Unit Cost ($)</Label>
                                                    <Input
                                                        id={`unitCost-${index}`}
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={item.unitCost}
                                                        onChange={(e) => handleItemChange(index, "unitCost", Number(e.target.value))}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`additionalExpenses-${index}`}>Additional Expenses ($)</Label>
                                                    <Input
                                                        id={`additionalExpenses-${index}`}
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={item.additionalExpenses}
                                                        onChange={(e) => handleItemChange(index, "additionalExpenses", Number(e.target.value))}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`sellingPrice-${index}`}>Suggested Selling Price ($)</Label>
                                                    <Input
                                                        id={`sellingPrice-${index}`}
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={(item.sellingPrice ?? 0).toFixed(2)}
                                                        readOnly // This is a derived field
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`expiryDate-${index}`}>Expiry Date</Label>
                                                    <Input
                                                        id={`expiryDate-${index}`}
                                                        type="date"
                                                        value={item.expiryDate}
                                                        onChange={(e) => handleItemChange(index, "expiryDate", e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`batchNumber-${index}`}>Batch Number</Label>
                                                    <Input
                                                        id={`batchNumber-${index}`}
                                                        placeholder="BATCH-001"
                                                        value={item.batchNumber}
                                                        onChange={(e) => handleItemChange(index, "batchNumber", e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`supplier-${index}`}>Supplier</Label>
                                                    <Select
                                                        onValueChange={(value) => handleItemChange(index, "supplier", value)}
                                                        value={item.supplier}
                                                    >
                                                        <SelectTrigger id={`supplier-${index}`}>
                                                            <SelectValue placeholder="Select supplier" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Fresh Farms Ltd">Fresh Farms Ltd</SelectItem>
                                                            <SelectItem value="Poultry Express">Poultry Express</SelectItem>
                                                            <SelectItem value="Quality Chicken Co">Quality Chicken Co</SelectItem>
                                                            <SelectItem value="Farm Direct">Farm Direct</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`warehouseId-${index}`}>Storage Location</Label>
                                                    <Select
                                                        onValueChange={(value) => handleItemChange(index, "warehouseId", value)}
                                                        value={item.warehouseId}
                                                    >
                                                        <SelectTrigger id={`warehouseId-${index}`}>
                                                            <SelectValue placeholder="Select location" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {warehouses.map((warehouse) => (
                                                                <SelectItem key={warehouse._id} value={warehouse._id}>
                                                                    {warehouse.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`temperature-${index}`}>Storage Temp (°C)</Label>
                                                    <Input
                                                        id={`temperature-${index}`}
                                                        type="number"
                                                        placeholder="2"
                                                        value={item.temperature}
                                                        onChange={(e) => handleItemChange(index, "temperature", Number(e.target.value))}
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-3">
                                                    <Label htmlFor={`notes-${index}`}>Notes</Label>
                                                    <Textarea
                                                        id={`notes-${index}`}
                                                        placeholder="Additional notes about this stock item..."
                                                        value={item.notes}
                                                        onChange={(e) => handleItemChange(index, "notes", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            {item.quantity > 0 && item.unitCost > 0 && (
                                                <div className="mt-4 p-3 bg-muted rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium">Total Cost:</span>
                                                        <span className="text-lg font-bold">${(item.totalCost ?? 0).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </TabsContent>
                <TabsContent value="bulk" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bulk Import</CardTitle>
                            <CardDescription>Import multiple stock items from CSV file or paste data</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground mb-2">Drop CSV file here or</p>
                                        <Button variant="outline" size="sm">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Choose File
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Or paste CSV data:</Label>
                                        <Textarea
                                            placeholder="SKU,Product,Quantity,Unit Cost,Additional Expenses,Expiry Date,Batch Number,Location&#10;SKU-001,Whole Chicken,100,8.50,0.50,2024-01-25,BATCH-001,A1-01&#10;SKU-002,Chicken Breast,50,12.00,0.25,2024-01-22,BATCH-002,A1-02"
                                            rows={6}
                                            onChange={(e) => handleBulkImport(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-2">CSV Format Requirements</h4>
                                        <div className="text-sm space-y-1 text-muted-foreground">
                                            <p>• SKU (required)</p>
                                            <p>• Product Name (required)</p>
                                            <p>• Quantity (required, number)</p>
                                            <p>• Unit Cost (required, number)</p>
                                            <p>• Additional Expenses (optional, number)</p>
                                            <p>• Expiry Date (required, YYYY-MM-DD)</p>
                                            <p>• Batch Number (required)</p>
                                            <p>• Storage Location (required)</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full bg-transparent">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Download Template
                                    </Button>
                                </div>
                            </div>
                            {bulkImportData.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">Import Preview</h4>
                                        <Badge variant="outline">
                                            {bulkImportData.filter((item) => item.status === "valid").length} valid,{" "}
                                            {bulkImportData.filter((item) => item.status === "error").length} errors
                                        </Badge>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>SKU</TableHead>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead>Quantity</TableHead>
                                                    <TableHead>Unit Cost</TableHead>
                                                    <TableHead>Add. Expenses</TableHead>
                                                    <TableHead>Suggested Selling Price</TableHead>
                                                    <TableHead>Issues</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {bulkImportData.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Badge
                                                                variant={
                                                                    item.status === "valid"
                                                                        ? "default"
                                                                        : item.status === "warning"
                                                                            ? "secondary"
                                                                            : "destructive"
                                                                }
                                                            >
                                                                {item.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{item.sku}</TableCell>
                                                        <TableCell>{item.product}</TableCell>
                                                        <TableCell>{item.quantity}</TableCell>
                                                        <TableCell>${item.unitCost}</TableCell>
                                                        <TableCell>${item.additionalExpenses}</TableCell>
                                                        <TableCell>${item.sellingPrice.toFixed(2)}</TableCell>
                                                        <TableCell>
                                                            {item.errors.length > 0 && (
                                                                <div className="text-sm text-red-600">{item.errors.join(", ")}</div>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline">Fix Errors</Button>
                                        <Button disabled={bulkImportData.filter((item) => item.status === "valid").length === 0}>
                                            Import Valid Items ({bulkImportData.filter((item) => item.status === "valid").length})
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            {/* Validation Alerts */}
            {validItemsCount > 0 && validItemsCount !== items.length && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        {items.length - validItemsCount} items have missing required fields and will not be added to stock.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}
