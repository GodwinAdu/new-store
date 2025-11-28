'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { importSalesData } from '@/lib/actions/sales-dashboard.actions'
import { Upload, Download, FileText, CheckCircle, AlertCircle, Info, ArrowLeft, RefreshCw, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function ImportSalesPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any[]>([])
  const [sampleData, setSampleData] = useState('')
  const [previewData, setPreviewData] = useState<any[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
        setResults([])
        await previewFile(selectedFile)
      } else {
        toast.error('Please select a CSV file')
      }
    }
  }

  const previewFile = async (file: File) => {
    try {
      const csvText = await file.text()
      const csvData = parseCSV(csvText)
      const preview = csvData.slice(0, 5) // Show first 5 rows
      setPreviewData(preview)
      validateData(csvData)
    } catch (error) {
      toast.error('Failed to preview file')
    }
  }

  const validateData = (data: any[]) => {
    const errors: string[] = []
    
    data.forEach((row, index) => {
      if (!row.product_sku) errors.push(`Row ${index + 2}: Missing product_sku`)
      if (!row.quantity || isNaN(parseInt(row.quantity))) errors.push(`Row ${index + 2}: Invalid quantity`)
      if (!row.unit_price || isNaN(parseFloat(row.unit_price))) errors.push(`Row ${index + 2}: Invalid unit_price`)
      if (row.payment_method && !['cash', 'card', 'mobile'].includes(row.payment_method)) {
        errors.push(`Row ${index + 2}: Invalid payment_method (must be cash, card, or mobile)`)
      }
    })
    
    setValidationErrors(errors.slice(0, 10)) // Show first 10 errors
  }

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      return row
    })
  }

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file to import')
      return
    }

    setImporting(true)
    setProgress(0)

    try {
      const csvText = await file.text()
      const csvData = parseCSV(csvText)
      
      // Transform CSV data to expected format
      const salesData = csvData.map((row: any) => ({
        customerEmail: row.customer_email || '',
        items: [
          {
            productSku: row.product_sku || '',
            quantity: parseInt(row.quantity) || 1,
            unitPrice: parseFloat(row.unit_price) || 0
          }
        ],
        paymentMethod: row.payment_method || 'cash',
        saleDate: row.sale_date || new Date().toISOString(),
        notes: row.notes || ''
      }))

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const importResults = await importSalesData(salesData)
      setResults(importResults)
      
      const successCount = importResults.filter(r => r.success).length
      const failCount = importResults.filter(r => !r.success).length
      
      toast.success(`Import completed: ${successCount} successful, ${failCount} failed`)
    } catch (error) {
      toast.error('Failed to import sales data')
    } finally {
      setImporting(false)
      setProgress(0)
    }
  }

  const downloadSample = () => {
    const sampleCSV = `customer_email,product_sku,quantity,unit_price,payment_method,sale_date,notes
john@example.com,PROD-001,2,15.99,cash,2024-01-15T10:30:00Z,Sample order
jane@example.com,PROD-002,1,25.50,card,2024-01-15T11:00:00Z,Another sample
,PROD-003,3,8.75,mobile,2024-01-15T11:30:00Z,Walk-in customer
test@example.com,PROD-004,5,12.00,cash,2024-01-15T12:00:00Z,Bulk order
,PROD-005,1,45.99,card,2024-01-15T12:30:00Z,Premium item`

    const blob = new Blob([sampleCSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sales-import-sample.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Sample file downloaded')
  }

  const clearFile = () => {
    setFile(null)
    setPreviewData([])
    setValidationErrors([])
    setResults([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const clearResults = () => {
    setResults([])
  }

  const handleSampleDataImport = async () => {
    if (!sampleData.trim()) {
      toast.error('Please enter sample data')
      return
    }

    setImporting(true)
    try {
      const csvData = parseCSV(sampleData)
      const salesData = csvData.map((row: any) => ({
        customerEmail: row.customer_email || '',
        items: [
          {
            productSku: row.product_sku || '',
            quantity: parseInt(row.quantity) || 1,
            unitPrice: parseFloat(row.unit_price) || 0
          }
        ],
        paymentMethod: row.payment_method || 'cash',
        saleDate: row.sale_date || new Date().toISOString(),
        notes: row.notes || ''
      }))

      const importResults = await importSalesData(salesData)
      setResults(importResults)
      
      const successCount = importResults.filter(r => r.success).length
      toast.success(`Sample data imported: ${successCount} records`)
    } catch (error) {
      toast.error('Failed to import sample data')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Import Sales Data</h1>
            <p className="text-muted-foreground">Bulk import sales orders from CSV files</p>
          </div>
        </div>
        {results.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {results.filter(r => r.success).length} successful, {results.filter(r => !r.success).length} failed
            </p>
            <p className="text-2xl font-bold text-primary">{results.length} total</p>
          </div>
        )}
      </div>

      <Tabs defaultValue="file" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">File Upload</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  CSV File Import
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadSample}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Sample
                  </Button>
                  {file && (
                    <Button variant="outline" size="sm" onClick={clearFile}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Select CSV File</Label>
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={importing}
                />
              </div>

              {file && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB • {previewData.length} rows detected
                        </p>
                      </div>
                    </div>
                    <Badge variant={validationErrors.length > 0 ? 'destructive' : 'default'}>
                      {validationErrors.length > 0 ? `${validationErrors.length} errors` : 'Valid'}
                    </Badge>
                  </div>
                </div>
              )}

              {validationErrors.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Validation Errors Found:</p>
                      <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="text-red-600">• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {importing && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Importing sales data...
                    </span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <Button 
                onClick={handleImport}
                disabled={!file || importing || validationErrors.length > 0}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                size="lg"
              >
                {importing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Importing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Import {previewData.length} Sales Records
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* File Preview */}
          {previewData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Data Preview (First 5 rows)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Customer Email</th>
                        <th className="text-left p-2">Product SKU</th>
                        <th className="text-left p-2">Quantity</th>
                        <th className="text-left p-2">Unit Price</th>
                        <th className="text-left p-2">Payment Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{row.customer_email || 'Walk-in'}</td>
                          <td className="p-2 font-mono">{row.product_sku}</td>
                          <td className="p-2">{row.quantity}</td>
                          <td className="p-2">₵{parseFloat(row.unit_price || 0).toFixed(2)}</td>
                          <td className="p-2">
                            <Badge variant="outline">{row.payment_method || 'cash'}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Manual CSV Data Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sampleData">Paste CSV Data</Label>
                <Textarea
                  id="sampleData"
                  value={sampleData}
                  onChange={(e) => setSampleData(e.target.value)}
                  placeholder="customer_email,product_sku,quantity,unit_price,payment_method,sale_date,notes
john@example.com,PROD-001,2,15.99,cash,2024-01-15T10:30:00Z,Sample order
jane@example.com,PROD-002,1,25.50,card,2024-01-15T11:00:00Z,Another sample"
                  rows={10}
                  disabled={importing}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSampleDataImport}
                  disabled={!sampleData.trim() || importing}
                  className="flex-1"
                >
                  {importing ? 'Importing...' : 'Import Manual Data'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSampleData('')}
                  disabled={importing}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CSV Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            CSV Format Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your CSV file should contain the following columns:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Required Columns:</h4>
                <ul className="text-sm space-y-1">
                  <li><code className="bg-accent px-1 rounded">product_sku</code> - Product SKU/Code</li>
                  <li><code className="bg-accent px-1 rounded">quantity</code> - Quantity sold</li>
                  <li><code className="bg-accent px-1 rounded">unit_price</code> - Price per unit (₵)</li>
                  <li><code className="bg-accent px-1 rounded">payment_method</code> - cash, card, or mobile</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Optional Columns:</h4>
                <ul className="text-sm space-y-1">
                  <li><code className="bg-accent px-1 rounded">customer_email</code> - Customer email</li>
                  <li><code className="bg-accent px-1 rounded">sale_date</code> - Sale date (ISO format)</li>
                  <li><code className="bg-accent px-1 rounded">notes</code> - Order notes</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Import Results</span>
              <Button variant="outline" size="sm" onClick={clearResults}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Results
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">{results.filter(r => r.success).length}</p>
                      <p className="text-sm text-green-600">Successful</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold text-red-600">{results.filter(r => !r.success).length}</p>
                      <p className="text-sm text-red-600">Failed</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{results.length}</p>
                      <p className="text-sm text-blue-600">Total Processed</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">Row {index + 2}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.success ? 'Successfully imported' : 'Import failed'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono text-sm ${
                        result.success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.success ? `#${result.saleId?.slice(-8)}` : 'Error'}
                      </p>
                      {!result.success && (
                        <p className="text-xs text-red-600 max-w-xs truncate">
                          {result.error}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}