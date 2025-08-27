"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Upload, Download, FileText, CheckCircle, AlertTriangle, 
  X, Eye, Save, RefreshCw, FileSpreadsheet, Database
} from "lucide-react"
import { toast } from "sonner"
import Heading from "@/components/commons/Header"
import { createProduct } from "@/lib/actions/product.actions"

interface ImportedProduct {
  name: string
  description?: string
  category?: string
  sku?: string
  price?: number
  costPrice?: number
  status: 'valid' | 'error' | 'warning'
  errors: string[]
  warnings: string[]
}

export default function ImportProductsClient() {
  const [importedData, setImportedData] = useState<ImportedProduct[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("upload")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        
        if (file.name.endsWith('.csv')) {
          parseCSV(text)
        } else if (file.name.endsWith('.json')) {
          parseJSON(text)
        } else {
          toast.error('Unsupported file format. Please use CSV or JSON.')
        }
      } catch (error) {
        toast.error('Error reading file. Please check the format.')
      }
    }
    
    reader.readAsText(file)
    event.target.value = ''
  }

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      toast.error('CSV file must have at least a header and one data row')
      return
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const products: ImportedProduct[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const product: ImportedProduct = {
        name: '',
        status: 'valid',
        errors: [],
        warnings: []
      }

      headers.forEach((header, index) => {
        const value = values[index] || ''
        
        switch (header) {
          case 'name':
          case 'product name':
            product.name = value
            break
          case 'description':
            product.description = value
            break
          case 'category':
            product.category = value
            break
          case 'sku':
            product.sku = value
            break
          case 'price':
          case 'selling price':
            product.price = parseFloat(value) || undefined
            break
          case 'cost price':
          case 'cost':
            product.costPrice = parseFloat(value) || undefined
            break
        }
      })

      validateProduct(product)
      products.push(product)
    }

    setImportedData(products)
    setActiveTab("preview")
    toast.success(`Parsed ${products.length} products from CSV`)
  }

  const parseJSON = (jsonText: string) => {
    try {
      const data = JSON.parse(jsonText)
      const products: ImportedProduct[] = []

      const items = Array.isArray(data) ? data : [data]
      
      items.forEach(item => {
        const product: ImportedProduct = {
          name: item.name || '',
          description: item.description,
          category: item.category,
          sku: item.sku,
          price: parseFloat(item.price) || undefined,
          costPrice: parseFloat(item.costPrice || item.cost) || undefined,
          status: 'valid',
          errors: [],
          warnings: []
        }

        validateProduct(product)
        products.push(product)
      })

      setImportedData(products)
      setActiveTab("preview")
      toast.success(`Parsed ${products.length} products from JSON`)
    } catch (error) {
      toast.error('Invalid JSON format')
    }
  }

  const validateProduct = (product: ImportedProduct) => {
    if (!product.name || product.name.trim().length < 2) {
      product.errors.push('Product name is required (min 2 characters)')
      product.status = 'error'
    }

    if (product.price && product.price <= 0) {
      product.errors.push('Price must be greater than 0')
      product.status = 'error'
    }

    if (product.costPrice && product.costPrice <= 0) {
      product.errors.push('Cost price must be greater than 0')
      product.status = 'error'
    }

    if (!product.category) {
      product.warnings.push('No category specified')
      if (product.status !== 'error') product.status = 'warning'
    }

    if (!product.sku) {
      product.warnings.push('No SKU specified')
      if (product.status !== 'error') product.status = 'warning'
    }
  }

  const importProducts = async () => {
    const validProducts = importedData.filter(p => p.status !== 'error')
    
    if (validProducts.length === 0) {
      toast.error('No valid products to import')
      return
    }

    setIsProcessing(true)
    setProgress(0)

    let imported = 0
    let failed = 0

    for (let i = 0; i < validProducts.length; i++) {
      const product = validProducts[i]
      
      try {
        await createProduct({
          name: product.name,
          description: product.description || '',
          category: product.category || 'Uncategorized',
          sku: product.sku || `SKU-${Date.now()}-${i}`,
          sellingPrice: product.price || 0,
          costPrice: product.costPrice || 0
        })
        
        imported++
      } catch (error) {
        failed++
        console.error('Failed to import product:', product.name, error)
      }

      setProgress(((i + 1) / validProducts.length) * 100)
    }

    setIsProcessing(false)
    setProgress(100)
    
    if (imported > 0) {
      toast.success(`Successfully imported ${imported} products`)
    }
    
    if (failed > 0) {
      toast.error(`Failed to import ${failed} products`)
    }

    // Clear data after import
    setTimeout(() => {
      setImportedData([])
      setProgress(0)
      setActiveTab("upload")
    }, 2000)
  }

  const sampleProducts = [
    {
      name: "Wireless Bluetooth Headphones",
      description: "Premium noise-cancelling wireless headphones with 30-hour battery life",
      category: "Electronics",
      sku: "WBH-001",
      price: 149.99,
      costPrice: 75.00
    },
    {
      name: "Organic Cotton T-Shirt",
      description: "100% organic cotton, comfortable fit, available in multiple colors",
      category: "Clothing",
      sku: "OCT-002",
      price: 24.99,
      costPrice: 12.50
    },
    {
      name: "Stainless Steel Water Bottle",
      description: "Insulated 32oz water bottle, keeps drinks cold for 24 hours",
      category: "Home & Garden",
      sku: "SWB-003",
      price: 34.99,
      costPrice: 18.00
    },
    {
      name: "Wireless Phone Charger",
      description: "Fast wireless charging pad compatible with all Qi-enabled devices",
      category: "Electronics",
      sku: "WPC-004",
      price: 39.99,
      costPrice: 20.00
    },
    {
      name: "Yoga Mat Premium",
      description: "Non-slip eco-friendly yoga mat with carrying strap",
      category: "Sports & Fitness",
      sku: "YMP-005",
      price: 59.99,
      costPrice: 30.00
    },
    {
      name: "Coffee Mug Set",
      description: "Set of 4 ceramic coffee mugs with ergonomic handles",
      category: "Home & Garden",
      sku: "CMS-006",
      price: 29.99,
      costPrice: 15.00
    },
    {
      name: "LED Desk Lamp",
      description: "Adjustable LED desk lamp with USB charging port and touch controls",
      category: "Electronics",
      sku: "LDL-007",
      price: 79.99,
      costPrice: 40.00
    },
    {
      name: "Running Shoes",
      description: "Lightweight running shoes with breathable mesh upper",
      category: "Sports & Fitness",
      sku: "RS-008",
      price: 89.99,
      costPrice: 45.00
    }
  ]

  const downloadTemplate = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const headers = 'name,description,category,sku,price,cost price'
      const rows = sampleProducts.map(product => 
        `"${product.name}","${product.description}","${product.category}","${product.sku}",${product.price},${product.costPrice}`
      )
      const csvContent = [headers, ...rows].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'products-template.csv'
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const jsonContent = JSON.stringify(sampleProducts, null, 2)
      
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'products-template.json'
      a.click()
      URL.revokeObjectURL(url)
    }
    
    toast.success(`${format.toUpperCase()} template with ${sampleProducts.length} sample products downloaded`)
  }

  const loadSampleData = () => {
    const products: ImportedProduct[] = sampleProducts.map(product => ({
      ...product,
      status: 'valid' as const,
      errors: [],
      warnings: []
    }))
    
    setImportedData(products)
    setActiveTab("preview")
    toast.success(`Loaded ${products.length} sample products for testing`)
  }

  const stats = {
    total: importedData.length,
    valid: importedData.filter(p => p.status === 'valid').length,
    warnings: importedData.filter(p => p.status === 'warning').length,
    errors: importedData.filter(p => p.status === 'error').length
  }

  return (
    <div className="space-y-6">
      <Heading title="Import Products" description="Bulk import products from CSV or JSON files" />
      
      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="preview" disabled={importedData.length === 0}>
            Preview ({importedData.length})
          </TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Products File
                </CardTitle>
                <CardDescription>
                  Upload a CSV or JSON file containing product data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    Drag and drop your file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Choose File
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p>Supported formats: CSV, JSON</p>
                  <p>Maximum file size: 10MB</p>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Import Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm">Required Fields:</h4>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Product Name (minimum 2 characters)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm">Optional Fields:</h4>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Description</li>
                      <li>• Category</li>
                      <li>• SKU (auto-generated if not provided)</li>
                      <li>• Price / Selling Price</li>
                      <li>• Cost Price</li>
                    </ul>
                  </div>
                  
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Products with errors will be skipped during import. 
                      Review the preview before importing.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {importedData.length > 0 && (
            <>
              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Products</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
                    <div className="text-sm text-muted-foreground">Valid</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.warnings}</div>
                    <div className="text-sm text-muted-foreground">Warnings</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </CardContent>
                </Card>
              </div>

              {/* Import Progress */}
              {isProcessing && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Importing products...</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Import Actions */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImportedData([])
                      setActiveTab("upload")
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Data
                  </Button>
                </div>
                
                <Button
                  onClick={importProducts}
                  disabled={isProcessing || stats.valid === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Import {stats.valid} Products
                </Button>
              </div>

              {/* Products Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Preview</CardTitle>
                  <CardDescription>
                    Review products before importing. Products with errors will be skipped.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Issues</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importedData.map((product, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {product.status === 'valid' && (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Valid
                                </Badge>
                              )}
                              {product.status === 'warning' && (
                                <Badge variant="secondary">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Warning
                                </Badge>
                              )}
                              {product.status === 'error' && (
                                <Badge variant="destructive">
                                  <X className="h-3 w-3 mr-1" />
                                  Error
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category || 'N/A'}</TableCell>
                            <TableCell className="font-mono text-sm">{product.sku || 'Auto-generated'}</TableCell>
                            <TableCell>{product.price ? `$${product.price.toFixed(2)}` : 'N/A'}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {product.errors.map((error, i) => (
                                  <div key={i} className="text-xs text-red-600">{error}</div>
                                ))}
                                {product.warnings.map((warning, i) => (
                                  <div key={i} className="text-xs text-orange-600">{warning}</div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Sample Data Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Load Sample Data
              </CardTitle>
              <CardDescription>
                Load sample products to test the import functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Load {sampleProducts.length} realistic sample products with categories like Electronics, Clothing, Sports & Fitness
                </div>
                <Button onClick={loadSampleData} variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Load Sample Data
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  CSV Template
                </CardTitle>
                <CardDescription>
                  Download a CSV template with {sampleProducts.length} realistic sample products
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <p>CSV format with headers:</p>
                  <code className="block bg-gray-100 p-2 rounded text-xs">
                    name,description,category,sku,price,cost price
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Includes {sampleProducts.length} sample products across multiple categories
                  </p>
                </div>
                <Button onClick={() => downloadTemplate('csv')} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  JSON Template
                </CardTitle>
                <CardDescription>
                  Download a JSON template with {sampleProducts.length} realistic sample products
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <p>JSON array format:</p>
                  <code className="block bg-gray-100 p-2 rounded text-xs">
                    [{`{"name": "Product", "description": "...", "price": 29.99}`}]
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Includes {sampleProducts.length} sample products with full details
                  </p>
                </div>
                <Button onClick={() => downloadTemplate('json')} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download JSON Template
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Format Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Field Formats</CardTitle>
              <CardDescription>
                Field names and formats supported by the import system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">CSV Headers (case-insensitive):</h4>
                  <div className="text-xs space-y-1">
                    <div><code>name</code> or <code>product name</code> - Product name (required)</div>
                    <div><code>description</code> - Product description</div>
                    <div><code>category</code> - Product category</div>
                    <div><code>sku</code> - Stock keeping unit</div>
                    <div><code>price</code> or <code>selling price</code> - Selling price</div>
                    <div><code>cost price</code> or <code>cost</code> - Cost price</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">JSON Properties:</h4>
                  <div className="text-xs space-y-1">
                    <div><code>name</code> - Product name (required)</div>
                    <div><code>description</code> - Product description</div>
                    <div><code>category</code> - Product category</div>
                    <div><code>sku</code> - Stock keeping unit</div>
                    <div><code>price</code> - Selling price (number)</div>
                    <div><code>costPrice</code> or <code>cost</code> - Cost price (number)</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}