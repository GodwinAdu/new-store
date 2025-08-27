"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, ZoomIn, ZoomOut, RotateCw, Maximize2, Download, Printer } from "lucide-react"
import { generateQRCodeSVG, generateBarcodeSVG } from "./qr-generator"

interface PrintPreviewProps {
  products: any[]
  stockData: any[]
  selectedProducts: string[]
  labelSettings: any
  onPrint: () => void
}

export default function PrintPreview({ products, stockData, selectedProducts, labelSettings, onPrint }: PrintPreviewProps) {
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const selectedProductData = products.filter(p => selectedProducts.includes(p._id))
  
  const renderLabel = (product: any, index: number) => {
    const stock = stockData.find(s => s.product?._id === product._id)
    const currentDate = new Date().toLocaleDateString()
    
    const labelWidth = labelSettings.size === '3x1' ? 192 : labelSettings.size === '1x1' ? 64 : 128
    const labelHeight = 64
    
    return (
      <div
        key={`${product._id}-${index}`}
        className="border relative overflow-hidden bg-white"
        style={{
          width: `${labelWidth * (zoom / 100)}px`,
          height: `${labelHeight * (zoom / 100)}px`,
          borderColor: labelSettings.borderColor,
          borderWidth: `${labelSettings.borderWidth}px`,
          borderStyle: labelSettings.borderStyle,
          backgroundColor: labelSettings.backgroundColor,
          color: labelSettings.textColor,
          fontSize: `${labelSettings.fontSize * (zoom / 100)}px`,
          fontFamily: labelSettings.fontFamily,
          padding: `${labelSettings.padding * (zoom / 100)}px`,
          textAlign: labelSettings.alignment as any,
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top left'
        }}
      >
        {/* Product Name */}
        {labelSettings.includeName && (
          <div 
            className="font-bold truncate leading-tight"
            style={{ 
              fontSize: `${(labelSettings.fontSize + 2) * (zoom / 100)}px`,
              marginBottom: `${2 * (zoom / 100)}px`
            }}
          >
            {product.name}
          </div>
        )}
        
        {/* SKU */}
        {labelSettings.includeSKU && (
          <div 
            className="truncate"
            style={{ marginBottom: `${1 * (zoom / 100)}px` }}
          >
            SKU: {product.sku || 'N/A'}
          </div>
        )}
        
        {/* Category */}
        {labelSettings.includeCategory && product.category && (
          <div 
            className="italic truncate"
            style={{ 
              fontSize: `${(labelSettings.fontSize - 1) * (zoom / 100)}px`,
              marginBottom: `${1 * (zoom / 100)}px`
            }}
          >
            {product.category}
          </div>
        )}
        
        {/* Price */}
        {labelSettings.includePrice && stock && (
          <div 
            className="font-bold"
            style={{ marginBottom: `${2 * (zoom / 100)}px` }}
          >
            ${stock.sellingPrice?.toFixed(2) || '0.00'}
          </div>
        )}
        
        {/* Date */}
        {labelSettings.includeDate && (
          <div 
            style={{ 
              fontSize: `${(labelSettings.fontSize - 2) * (zoom / 100)}px`,
              marginBottom: `${1 * (zoom / 100)}px`
            }}
          >
            {currentDate}
          </div>
        )}
        
        {/* Custom Text */}
        {labelSettings.customText && (
          <div 
            className="truncate"
            style={{ 
              fontSize: `${(labelSettings.fontSize - 1) * (zoom / 100)}px`,
              marginBottom: `${1 * (zoom / 100)}px`
            }}
          >
            {labelSettings.customText}
          </div>
        )}
        
        {/* Description */}
        {labelSettings.includeDescription && product.description && (
          <div 
            className="truncate"
            style={{ 
              fontSize: `${(labelSettings.fontSize - 2) * (zoom / 100)}px`,
              marginBottom: `${1 * (zoom / 100)}px`
            }}
          >
            {product.description}
          </div>
        )}
        
        {/* Barcode and QR Code */}
        <div 
          className="flex justify-between items-center absolute bottom-0 left-0 right-0"
          style={{ 
            padding: `${labelSettings.padding * (zoom / 100)}px`,
            marginTop: `${2 * (zoom / 100)}px`
          }}
        >
          {labelSettings.includeBarcode && (
            <img 
              src={generateBarcodeSVG(product.sku || product._id, 60, 20)} 
              alt="Barcode" 
              style={{
                maxWidth: `${60 * (zoom / 100)}px`,
                height: `${20 * (zoom / 100)}px`
              }}
            />
          )}
          
          {labelSettings.includeQRCode && (
            <img 
              src={generateQRCodeSVG(JSON.stringify({id: product._id, name: product.name, sku: product.sku}), 30)} 
              alt="QR Code" 
              style={{
                width: `${30 * (zoom / 100)}px`,
                height: `${30 * (zoom / 100)}px`
              }}
            />
          )}
        </div>
        
        {/* Label Index */}
        <div 
          className="absolute top-0 right-0 bg-black text-white text-xs px-1 rounded-bl"
          style={{ fontSize: `${8 * (zoom / 100)}px` }}
        >
          {index + 1}
        </div>
      </div>
    )
  }
  
  const generateAllLabels = () => {
    const allLabels = []
    for (const product of selectedProductData) {
      for (let i = 0; i < labelSettings.copies; i++) {
        allLabels.push({ product, copyIndex: i })
      }
    }
    return allLabels
  }
  
  const allLabels = generateAllLabels()
  const totalLabels = allLabels.length
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Print Preview
            </CardTitle>
            <CardDescription>
              Preview of {totalLabels} labels ({selectedProductData.length} products × {labelSettings.copies} copies)
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                disabled={zoom <= 25}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <span className="text-sm px-2 min-w-12 text-center">{zoom}%</span>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                disabled={zoom >= 200}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Fullscreen Preview */}
            <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Fullscreen
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>Full Preview - {totalLabels} Labels</DialogTitle>
                  <DialogDescription>
                    Complete preview of all labels to be printed
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{selectedProductData.length} Products</Badge>
                      <Badge variant="outline">{labelSettings.copies}x Copies</Badge>
                      <Badge>{totalLabels} Total Labels</Badge>
                    </div>
                    
                    <Button onClick={onPrint} className="bg-green-600 hover:bg-green-700">
                      <Printer className="h-4 w-4 mr-2" />
                      Print All Labels
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                    {allLabels.map((item, index) => 
                      renderLabel(item.product, index)
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button onClick={onPrint} disabled={totalLabels === 0}>
              <Printer className="h-4 w-4 mr-2" />
              Print ({totalLabels})
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {totalLabels > 0 ? (
          <div className="space-y-4">
            {/* Preview Grid */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 justify-items-center">
                {allLabels.slice(0, 12).map((item, index) => 
                  renderLabel(item.product, index)
                )}
              </div>
              
              {totalLabels > 12 && (
                <div className="text-center mt-4">
                  <Badge variant="secondary" className="text-sm">
                    Showing 12 of {totalLabels} labels
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Fullscreen" to see all labels
                  </p>
                </div>
              )}
            </div>
            
            {/* Print Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">{selectedProductData.length}</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">{labelSettings.copies}</div>
                <div className="text-sm text-muted-foreground">Copies Each</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-600">{totalLabels}</div>
                <div className="text-sm text-muted-foreground">Total Labels</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-600">{labelSettings.size}</div>
                <div className="text-sm text-muted-foreground">Label Size</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select products to see preview</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}