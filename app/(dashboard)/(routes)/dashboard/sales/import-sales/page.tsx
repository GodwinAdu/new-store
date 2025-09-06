'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { importSalesData } from '@/lib/actions/sales-dashboard.actions'
import { Upload, Download, FileText, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { toast } from 'sonner'

export default function ImportSalesPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any[]>([])
  const [sampleData, setSampleData] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
        setResults([])
      } else {
        toast.error('Please select a CSV file')
      }
    }
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
john@example.com,PROD-001,2,4.99,cash,2024-01-15T10:30:00Z,Sample order
jane@example.com,PROD-002,1,7.99,card,2024-01-15T11:00:00Z,Another sample
,PROD-003,3,2.99,mobile,2024-01-15T11:30:00Z,Walk-in customer`

    const blob = new Blob([sampleCSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sales-import-sample.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Sample file downloaded')
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
      <div>
        <h1 className="text-3xl font-bold">Import Sales Data</h1>
        <p className="text-muted-foreground">Bulk import sales orders from CSV files</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              CSV File Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Select CSV File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={importing}
              />
            </div>

            {file && (
              <div className="p-3 bg-accent/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                </div>
              </div>
            )}

            {importing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Importing...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <div className="flex space-x-2">
              <Button 
                onClick={handleImport}
                disabled={!file || importing}
                className="flex-1"
              >
                {importing ? 'Importing...' : 'Import Sales'}
              </Button>
              <Button variant="outline" onClick={downloadSample}>
                <Download className="h-4 w-4 mr-2" />
                Sample
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Data Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Manual CSV Data
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
john@example.com,PROD-001,2,4.99,cash,2024-01-15T10:30:00Z,Sample order"
                rows={8}
                disabled={importing}
              />
            </div>

            <Button 
              onClick={handleSampleDataImport}
              disabled={!sampleData.trim() || importing}
              className="w-full"
            >
              Import Manual Data
            </Button>
          </CardContent>
        </Card>
      </div>

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
                  <li><code className="bg-accent px-1 rounded">unit_price</code> - Price per unit</li>
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
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {results.filter(r => r.success).length} Successful
                </Badge>
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {results.filter(r => !r.success).length} Failed
                </Badge>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-2 rounded text-sm ${
                      result.success 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>Row {index + 1}</span>
                    </div>
                    <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                      {result.success ? `Sale ID: ${result.saleId?.slice(-8)}` : result.error}
                    </span>
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