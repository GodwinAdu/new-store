"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { 
  Printer, Download, Eye, Package, Barcode, Settings, QrCode, 
  Palette, Save, Upload, FileText, Grid, List, Filter,
  Copy, Trash2, RotateCcw, Zap, Star, Calendar,
  Search
} from "lucide-react"
import Heading from "@/components/commons/Header"
import { toast } from "sonner"
import { generateQRCodeSVG, generateBarcodeSVG } from "./qr-generator"
import TemplateManager from "./template-manager"
import PrintPreview from "./print-preview"
import BatchOperations from "./batch-operations"

interface PrintLabelsClientProps {
  products: any[]
  stockData: any[]
}

export default function PrintLabelsClient({ products, stockData }: PrintLabelsClientProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [activeTemplate, setActiveTemplate] = useState('standard')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [labelSettings, setLabelSettings] = useState({
    // Basic Settings
    size: "2x1",
    copies: 1,
    template: 'standard',
    
    // Content Settings
    includeName: true,
    includeSKU: true,
    includePrice: true,
    includeBarcode: true,
    includeQRCode: false,
    includeDate: false,
    includeCategory: false,
    includeDescription: false,
    
    // Design Settings
    fontSize: 10,
    fontFamily: 'Arial',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000000',
    padding: 4,
    
    // Advanced Settings
    customText: '',
    logoUrl: '',
    orientation: 'horizontal',
    alignment: 'left',
    spacing: 2
  })
  
  const [templates] = useState([
    {
      id: 'standard',
      name: 'Standard Label',
      description: 'Basic product label with name, SKU, and price',
      settings: {
        includeName: true,
        includeSKU: true,
        includePrice: true,
        includeBarcode: true,
        fontSize: 10,
        fontFamily: 'Arial'
      }
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean design with just name and price',
      settings: {
        includeName: true,
        includeSKU: false,
        includePrice: true,
        includeBarcode: false,
        fontSize: 12,
        fontFamily: 'Helvetica'
      }
    },
    {
      id: 'detailed',
      name: 'Detailed',
      description: 'Comprehensive label with all information',
      settings: {
        includeName: true,
        includeSKU: true,
        includePrice: true,
        includeBarcode: true,
        includeQRCode: true,
        includeDate: true,
        includeCategory: true,
        fontSize: 8,
        fontFamily: 'Arial'
      }
    },
    {
      id: 'qr-focus',
      name: 'QR Code Focus',
      description: 'Modern label with prominent QR code',
      settings: {
        includeName: true,
        includeSKU: true,
        includePrice: true,
        includeBarcode: false,
        includeQRCode: true,
        fontSize: 10,
        fontFamily: 'Roboto'
      }
    }
  ])
  
  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory
    return matchesSearch && matchesCategory
  })
  
  // Get unique categories
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  const handleProductSelect = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId])
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p._id))
    } else {
      setSelectedProducts([])
    }
  }

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setLabelSettings(prev => ({ ...prev, ...template.settings, template: templateId }))
      setActiveTemplate(templateId)
      toast.success(`Applied ${template.name} template`)
    }
  }
  

  
  const generateAdvancedLabels = () => {
    const selectedProductData = products.filter(p => selectedProducts.includes(p._id))
    
    if (selectedProductData.length === 0) {
      toast.error('Please select at least one product')
      return
    }
    
    const labelWidth = labelSettings.size === '3x1' ? '3in' : labelSettings.size === '1x1' ? '1in' : '2in'
    const labelHeight = labelSettings.size === '1x1' ? '1in' : '1in'
    
    const printContent = selectedProductData.map(product => {
      const stock = stockData.find(s => s.product?._id === product._id)
      const currentDate = new Date().toLocaleDateString()
      
      return `
        <div class="label" style="
          width: ${labelWidth}; 
          height: ${labelHeight}; 
          border: ${labelSettings.borderWidth}px ${labelSettings.borderStyle} ${labelSettings.borderColor}; 
          padding: ${labelSettings.padding}px; 
          margin: ${labelSettings.spacing}px;
          display: inline-block;
          font-family: ${labelSettings.fontFamily}, sans-serif;
          font-size: ${labelSettings.fontSize}px;
          background-color: ${labelSettings.backgroundColor};
          color: ${labelSettings.textColor};
          text-align: ${labelSettings.alignment};
          vertical-align: top;
          box-sizing: border-box;
          page-break-inside: avoid;
        ">
          ${labelSettings.includeName ? `<div style="font-weight: bold; font-size: ${labelSettings.fontSize + 2}px; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${product.name}</div>` : ''}
          ${labelSettings.includeSKU ? `<div style="margin-bottom: 1px;">SKU: ${product.sku || 'N/A'}</div>` : ''}
          ${labelSettings.includeCategory && product.category ? `<div style="margin-bottom: 1px; font-style: italic;">${product.category}</div>` : ''}
          ${labelSettings.includePrice && stock ? `<div style="font-weight: bold; margin-bottom: 2px;">$${stock.sellingPrice?.toFixed(2) || '0.00'}</div>` : ''}
          ${labelSettings.includeDate ? `<div style="font-size: ${labelSettings.fontSize - 2}px; margin-bottom: 1px;">${currentDate}</div>` : ''}
          ${labelSettings.customText ? `<div style="font-size: ${labelSettings.fontSize - 1}px; margin-bottom: 1px;">${labelSettings.customText}</div>` : ''}
          ${labelSettings.includeDescription && product.description ? `<div style="font-size: ${labelSettings.fontSize - 2}px; margin-bottom: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${product.description}</div>` : ''}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
            ${labelSettings.includeBarcode ? `<img src="${generateBarcodeSVG(product.sku || product._id, 60, 20)}" style="max-width: 60px; height: 20px;" alt="Barcode"/>` : ''}
            ${labelSettings.includeQRCode ? `<img src="${generateQRCodeSVG(JSON.stringify({id: product._id, name: product.name, sku: product.sku}), 30)}" style="width: 30px; height: 30px;" alt="QR Code"/>` : ''}
          </div>
        </div>
      `
    }).join('')

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Product Labels - ${selectedProductData.length} items</title>
            <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&family=Roboto:wght@300;400;500&family=Helvetica&display=swap" rel="stylesheet">
            <style>
              body { 
                margin: 0; 
                padding: 10px; 
                font-family: ${labelSettings.fontFamily}, sans-serif;
              }
              .label { 
                page-break-inside: avoid; 
              }
              @media print {
                body { margin: 0; padding: 5px; }
                .label { margin: 1px; }
              }
            </style>
          </head>
          <body>
            ${printContent.repeat(labelSettings.copies)}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
      
      toast.success(`Printing ${selectedProductData.length * labelSettings.copies} labels`)
    }
  }
  
  const exportLabels = (format: 'pdf' | 'csv' | 'json') => {
    const selectedProductData = products.filter(p => selectedProducts.includes(p._id))
    
    if (format === 'csv') {
      const csvContent = [
        ['Product Name', 'SKU', 'Price', 'Category', 'Stock'].join(','),
        ...selectedProductData.map(product => {
          const stock = stockData.find(s => s.product?._id === product._id)
          return [
            `"${product.name}"`,
            product.sku || 'N/A',
            stock?.sellingPrice?.toFixed(2) || '0.00',
            product.category || 'N/A',
            stock?.remaining || 0
          ].join(',')
        })
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `product-labels-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success('Labels exported as CSV')
    } else if (format === 'json') {
      const jsonData = selectedProductData.map(product => {
        const stock = stockData.find(s => s.product?._id === product._id)
        return {
          id: product._id,
          name: product.name,
          sku: product.sku,
          price: stock?.sellingPrice,
          category: product.category,
          stock: stock?.remaining,
          labelSettings
        }
      })
      
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `product-labels-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success('Labels exported as JSON')
    }
  }
  
  const saveTemplate = () => {
    const templateName = prompt('Enter template name:')
    if (templateName) {
      const customTemplate = {
        id: `custom-${Date.now()}`,
        name: templateName,
        description: 'Custom template',
        settings: { ...labelSettings }
      }
      
      localStorage.setItem(`label-template-${customTemplate.id}`, JSON.stringify(customTemplate))
      toast.success(`Template "${templateName}" saved`)
    }
  }
  
  const batchSelectByCategory = (category: string) => {
    const categoryProducts = products.filter(p => p.category === category).map(p => p._id)
    setSelectedProducts(prev => [...new Set([...prev, ...categoryProducts])])
    toast.success(`Selected all products in ${category} category`)
  }
  
  const batchSelectLowStock = () => {
    const lowStockProducts = products.filter(product => {
      const stock = stockData.find(s => s.product?._id === product._id)
      return stock && stock.remaining < 10
    }).map(p => p._id)
    
    setSelectedProducts(prev => [...new Set([...prev, ...lowStockProducts])])
    toast.success(`Selected ${lowStockProducts.length} low stock products`)
  }

  const previewLabels = () => {
    const selectedProductData = products.filter(p => selectedProducts.includes(p._id))
    
    const previewContent = selectedProductData.slice(0, 6).map(product => {
      const stock = stockData.find(s => s.product?._id === product._id)
      const currentDate = new Date().toLocaleDateString()
      
      return (
        <div 
          key={product._id} 
          className="border p-2 text-xs relative overflow-hidden"
          style={{
            width: labelSettings.size === '3x1' ? '144px' : labelSettings.size === '1x1' ? '48px' : '96px',
            height: '48px',
            borderColor: labelSettings.borderColor,
            borderWidth: `${labelSettings.borderWidth}px`,
            borderStyle: labelSettings.borderStyle,
            backgroundColor: labelSettings.backgroundColor,
            color: labelSettings.textColor,
            fontSize: `${labelSettings.fontSize}px`,
            fontFamily: labelSettings.fontFamily,
            padding: `${labelSettings.padding}px`,
            textAlign: labelSettings.alignment as any
          }}
        >
          {labelSettings.includeName && (
            <div className="font-bold truncate" style={{ fontSize: `${labelSettings.fontSize + 2}px` }}>
              {product.name}
            </div>
          )}
          {labelSettings.includeSKU && <div className="truncate">SKU: {product.sku || 'N/A'}</div>}
          {labelSettings.includeCategory && product.category && (
            <div className="italic truncate text-xs">{product.category}</div>
          )}
          {labelSettings.includePrice && stock && (
            <div className="font-bold">${stock.sellingPrice?.toFixed(2) || '0.00'}</div>
          )}
          {labelSettings.includeDate && (
            <div className="text-xs">{currentDate}</div>
          )}
          {labelSettings.customText && (
            <div className="text-xs truncate">{labelSettings.customText}</div>
          )}
          <div className="flex justify-between items-center mt-1">
            {labelSettings.includeBarcode && (
              <img 
                src={generateBarcodeSVG(product.sku || product._id, 40, 12)} 
                alt="Barcode" 
                className="max-w-10 h-3"
              />
            )}
            {labelSettings.includeQRCode && (
              <img 
                src={generateQRCodeSVG(JSON.stringify({id: product._id, name: product.name, sku: product.sku}), 16)} 
                alt="QR Code" 
                className="w-4 h-4"
              />
            )}
          </div>
        </div>
      )
    })

    return previewContent
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Heading title="Advanced Label Printing" description="Create professional product labels with modern features" />
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Labels</DialogTitle>
                <DialogDescription>
                  Export selected products data in various formats
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => exportLabels('csv')} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button onClick={() => exportLabels('json')} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  JSON
                </Button>
                <Button onClick={saveTemplate} variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="sm" onClick={() => previewLabels()}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          
          <Button 
            onClick={generateAdvancedLabels} 
            disabled={selectedProducts.length === 0}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Labels ({selectedProducts.length})
          </Button>
        </div>
      </div>

      <Separator />

      {/* Batch Operations */}
      <BatchOperations
        products={filteredProducts}
        stockData={stockData}
        selectedProducts={selectedProducts}
        onUpdateSelection={setSelectedProducts}
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Templates & Settings */}
        <Card className="xl:col-span-1">
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="p-4">
              <TemplateManager
                currentSettings={labelSettings}
                onApplyTemplate={(settings) => {
                  setLabelSettings(prev => ({ ...prev, ...settings }))
                  toast.success('Template applied successfully')
                }}
                onSaveTemplate={(template) => {
                  toast.success(`Template "${template.name}" saved`)
                }}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4 p-4">
              <div className="space-y-4">
                {/* Basic Settings */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Basic Settings</Label>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Label Size</Label>
                    <Select value={labelSettings.size} onValueChange={(value) => setLabelSettings({...labelSettings, size: value})}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1x1">1" × 1" (Small)</SelectItem>
                        <SelectItem value="2x1">2" × 1" (Standard)</SelectItem>
                        <SelectItem value="3x1">3" × 1" (Large)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Copies per Product</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="50" 
                      value={labelSettings.copies}
                      onChange={(e) => setLabelSettings({...labelSettings, copies: parseInt(e.target.value) || 1})}
                      className="h-8"
                    />
                  </div>
                </div>
                
                {/* Content Settings */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Content</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'includeName', label: 'Name' },
                      { key: 'includeSKU', label: 'SKU' },
                      { key: 'includePrice', label: 'Price' },
                      { key: 'includeBarcode', label: 'Barcode' },
                      { key: 'includeQRCode', label: 'QR Code' },
                      { key: 'includeDate', label: 'Date' },
                      { key: 'includeCategory', label: 'Category' },
                      { key: 'includeDescription', label: 'Description' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Switch
                          checked={labelSettings[key as keyof typeof labelSettings] as boolean}
                          onCheckedChange={(checked) => setLabelSettings({...labelSettings, [key]: checked})}
                        />
                        <Label className="text-xs">{label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Design Settings */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Design</Label>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Font Size</Label>
                    <Slider
                      value={[labelSettings.fontSize]}
                      onValueChange={([value]) => setLabelSettings({...labelSettings, fontSize: value})}
                      max={16}
                      min={6}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground text-center">{labelSettings.fontSize}px</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Font Family</Label>
                    <Select value={labelSettings.fontFamily} onValueChange={(value) => setLabelSettings({...labelSettings, fontFamily: value})}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Background</Label>
                      <Input
                        type="color"
                        value={labelSettings.backgroundColor}
                        onChange={(e) => setLabelSettings({...labelSettings, backgroundColor: e.target.value})}
                        className="h-8 w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Text Color</Label>
                      <Input
                        type="color"
                        value={labelSettings.textColor}
                        onChange={(e) => setLabelSettings({...labelSettings, textColor: e.target.value})}
                        className="h-8 w-full"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Custom Text */}
                <div className="space-y-2">
                  <Label className="text-xs">Custom Text</Label>
                  <Textarea
                    placeholder="Add custom text to labels..."
                    value={labelSettings.customText}
                    onChange={(e) => setLabelSettings({...labelSettings, customText: e.target.value})}
                    className="h-16 text-xs"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Product Selection */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Select Products
                </CardTitle>
                <CardDescription>
                  Choose products to print labels for ({selectedProducts.length} of {filteredProducts.length} selected)
                </CardDescription>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={batchSelectLowStock}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Low Stock
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedProducts(filteredProducts.map(p => p._id))
                    } else {
                      setSelectedProducts([])
                    }
                  }}
                />
                <Label className="text-sm whitespace-nowrap">Select All</Label>
              </div>
            </div>
            
            {/* Batch Actions */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground mr-2">Quick select:</span>
                {categories.slice(0, 4).map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => batchSelectByCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              {viewMode === 'list' ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const stock = stockData.find(s => s.product?._id === product._id)
                      return (
                        <TableRow key={product._id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedProducts.includes(product._id)}
                              onCheckedChange={(checked) => handleProductSelect(product._id, !!checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              {product.description && (
                                <div className="text-sm text-muted-foreground truncate max-w-48">
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {product.sku || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {product.category && (
                              <Badge variant="outline" className="text-xs">
                                {product.category}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {stock ? `$${stock.sellingPrice?.toFixed(2) || '0.00'}` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={stock?.remaining > 10 ? "default" : stock?.remaining > 0 ? "secondary" : "destructive"}
                            >
                              {stock?.remaining || 0} units
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredProducts.map((product) => {
                    const stock = stockData.find(s => s.product?._id === product._id)
                    const isSelected = selectedProducts.includes(product._id)
                    
                    return (
                      <div
                        key={product._id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => handleProductSelect(product._id, !isSelected)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Checkbox checked={isSelected} readOnly />
                          {stock?.remaining <= 5 && (
                            <Badge variant="destructive" className="text-xs">Low</Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm truncate">{product.name}</h4>
                          <p className="text-xs text-muted-foreground font-mono">{product.sku || 'N/A'}</p>
                          {product.category && (
                            <Badge variant="outline" className="text-xs">{product.category}</Badge>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">
                              {stock ? `$${stock.sellingPrice?.toFixed(2) || '0.00'}` : 'N/A'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {stock?.remaining || 0} units
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Preview Section */}
      <PrintPreview
        products={products}
        stockData={stockData}
        selectedProducts={selectedProducts}
        labelSettings={labelSettings}
        onPrint={generateAdvancedLabels}
      />
    </div>
  )
}