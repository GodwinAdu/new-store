"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, Download, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { bulkImportStock } from "@/lib/actions/advanced-stock.actions"

interface BulkImportStockProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouses: any[]
  onSuccess?: () => void
}

export default function BulkImportStock({ open, onOpenChange, warehouses, onSuccess }: BulkImportStockProps) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const downloadTemplate = () => {
    const csv = `Product Code (SKU/Barcode),Warehouse ID,Quantity,Unit Cost,Selling Price
PROD001,${warehouses[0]?._id || 'warehouse_id'},100,10.00,15.00
PROD002,${warehouses[0]?._id || 'warehouse_id'},50,20.00,30.00`
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk_import_template.csv'
    a.click()
    toast.success('Template downloaded')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      const text = await file.text()
      const lines = text.split('\n').slice(1) // Skip header
      
      const items = lines
        .filter(line => line.trim())
        .map(line => {
          const [productCode, warehouseId, quantity, unitCost, sellingPrice] = line.split(',')
          return {
            productCode: productCode.trim(),
            warehouseId: warehouseId.trim(),
            quantity: parseInt(quantity),
            unitCost: unitCost ? parseFloat(unitCost) : undefined,
            sellingPrice: sellingPrice ? parseFloat(sellingPrice) : undefined
          }
        })

      const result = await bulkImportStock(items)
      setResults(result)
      
      if (result.success.length > 0) {
        toast.success(`${result.success.length} items imported successfully`)
        onSuccess?.()
      }
      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} items failed`)
      }
    } catch (error) {
      toast.error('Failed to import file')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Stock</DialogTitle>
          <DialogDescription>
            Upload CSV file to add multiple products at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold mb-2">Instructions</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Download the CSV template</li>
              <li>Fill in product codes (SKU or barcode), warehouse IDs, quantities, and prices</li>
              <li>Upload the completed file</li>
              <li>Review results and fix any errors</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button onClick={downloadTemplate} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <Label htmlFor="file-upload" className="flex-1">
              <Button asChild variant="default" className="w-full" disabled={loading}>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {loading ? 'Uploading...' : 'Upload CSV'}
                </span>
              </Button>
            </Label>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {results && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Success</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{results.success.length}</p>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold">Failed</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{results.failed.length}</p>
                </div>
              </div>

              {results.failed.length > 0 && (
                <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Failed Items</h4>
                  <div className="space-y-2">
                    {results.failed.map((item: any, i: number) => (
                      <div key={i} className="text-sm p-2 bg-red-50 rounded">
                        <p className="font-mono">{item.productCode}</p>
                        <p className="text-red-600">{item.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
