"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Zap, Filter, Calendar, DollarSign, Package, 
  TrendingDown, AlertTriangle, Star, CheckCircle,
  Users, Clock, BarChart3
} from "lucide-react"
import { toast } from "sonner"

interface BatchOperationsProps {
  products: any[]
  stockData: any[]
  selectedProducts: string[]
  onUpdateSelection: (productIds: string[]) => void
}

export default function BatchOperations({ products, stockData, selectedProducts, onUpdateSelection }: BatchOperationsProps) {
  const [batchCriteria, setBatchCriteria] = useState({
    stockLevel: 'all',
    priceRange: { min: '', max: '' },
    category: 'all',
    dateRange: 'all'
  })

  // Get categories
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  // Batch selection functions
  const selectLowStock = (threshold: number = 10) => {
    const lowStockProducts = products.filter(product => {
      const stock = stockData.find(s => s.product?._id === product._id)
      return stock && stock.remaining <= threshold
    }).map(p => p._id)
    
    onUpdateSelection([...new Set([...selectedProducts, ...lowStockProducts])])
    toast.success(`Selected ${lowStockProducts.length} low stock products`)
  }

  const selectOutOfStock = () => {
    const outOfStockProducts = products.filter(product => {
      const stock = stockData.find(s => s.product?._id === product._id)
      return !stock || stock.remaining === 0
    }).map(p => p._id)
    
    onUpdateSelection([...new Set([...selectedProducts, ...outOfStockProducts])])
    toast.success(`Selected ${outOfStockProducts.length} out of stock products`)
  }

  const selectByCategory = (category: string) => {
    const categoryProducts = products.filter(p => p.category === category).map(p => p._id)
    onUpdateSelection([...new Set([...selectedProducts, ...categoryProducts])])
    toast.success(`Selected ${categoryProducts.length} products from ${category} category`)
  }

  const selectByPriceRange = (min: number, max: number) => {
    const priceRangeProducts = products.filter(product => {
      const stock = stockData.find(s => s.product?._id === product._id)
      if (!stock || !stock.sellingPrice) return false
      return stock.sellingPrice >= min && stock.sellingPrice <= max
    }).map(p => p._id)
    
    onUpdateSelection([...new Set([...selectedProducts, ...priceRangeProducts])])
    toast.success(`Selected ${priceRangeProducts.length} products in price range $${min}-$${max}`)
  }

  const selectHighValue = () => {
    const sortedByPrice = products
      .map(product => {
        const stock = stockData.find(s => s.product?._id === product._id)
        return { product, price: stock?.sellingPrice || 0 }
      })
      .sort((a, b) => b.price - a.price)
      .slice(0, Math.ceil(products.length * 0.2)) // Top 20%
      .map(item => item.product._id)
    
    onUpdateSelection([...new Set([...selectedProducts, ...sortedByPrice])])
    toast.success(`Selected top ${sortedByPrice.length} high-value products`)
  }

  const selectRecentlyAdded = () => {
    const recentProducts = products
      .filter(product => {
        const createdAt = new Date(product.createdAt || product._id)
        const daysDiff = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        return daysDiff <= 7 // Last 7 days
      })
      .map(p => p._id)
    
    onUpdateSelection([...new Set([...selectedProducts, ...recentProducts])])
    toast.success(`Selected ${recentProducts.length} recently added products`)
  }

  const selectBestSellers = () => {
    // Mock best sellers logic - in real app, this would use sales data
    const bestSellers = products
      .filter(product => {
        const stock = stockData.find(s => s.product?._id === product._id)
        return stock && stock.remaining < 50 // Assuming low stock means high sales
      })
      .slice(0, 20)
      .map(p => p._id)
    
    onUpdateSelection([...new Set([...selectedProducts, ...bestSellers])])
    toast.success(`Selected ${bestSellers.length} best-selling products`)
  }

  const clearSelection = () => {
    onUpdateSelection([])
    toast.success('Selection cleared')
  }

  const invertSelection = () => {
    const unselected = products.filter(p => !selectedProducts.includes(p._id)).map(p => p._id)
    onUpdateSelection(unselected)
    toast.success(`Inverted selection - now ${unselected.length} products selected`)
  }

  // Statistics
  const stats = {
    total: products.length,
    selected: selectedProducts.length,
    lowStock: products.filter(p => {
      const stock = stockData.find(s => s.product?._id === p._id)
      return stock && stock.remaining <= 10
    }).length,
    outOfStock: products.filter(p => {
      const stock = stockData.find(s => s.product?._id === p._id)
      return !stock || stock.remaining === 0
    }).length,
    categories: categories.length
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 rounded-t-lg border-b">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          Smart Batch Operations
        </CardTitle>
        <CardDescription className="text-base mt-2">
          Intelligent product selection and bulk operations for efficient label printing workflows
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        {/* Professional Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800 dark:to-blue-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Products</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-green-600">{stats.selected}</div>
            <div className="text-xs text-muted-foreground">Selected</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
            <div className="text-xs text-muted-foreground">Low Stock</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            <div className="text-xs text-muted-foreground">Out of Stock</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-purple-600">{stats.categories}</div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </div>
        </div>
        
        <Separator />
        
        {/* Enhanced Quick Actions */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-700">
            <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-md">
              <Filter className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Smart Selection Tools</h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectLowStock(10)}
              className="justify-start"
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Low Stock
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={selectOutOfStock}
              className="justify-start"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Out of Stock
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={selectHighValue}
              className="justify-start"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              High Value
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={selectBestSellers}
              className="justify-start"
            >
              <Star className="h-4 w-4 mr-2" />
              Best Sellers
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={selectRecentlyAdded}
              className="justify-start"
            >
              <Clock className="h-4 w-4 mr-2" />
              Recent
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={invertSelection}
              className="justify-start"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Invert
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              className="justify-start text-red-600 hover:text-red-700"
            >
              <Package className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateSelection(products.map(p => p._id))}
              className="justify-start"
            >
              <Users className="h-4 w-4 mr-2" />
              Select All
            </Button>
          </div>
        </div>
        
        <Separator />
        
        {/* Category Selection */}
        {categories.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Select by Category</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const categoryCount = products.filter(p => p.category === category).length
                return (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    onClick={() => selectByCategory(category)}
                    className="justify-between"
                  >
                    {category}
                    <Badge variant="secondary" className="ml-2">
                      {categoryCount}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </div>
        )}
        
        <Separator />
        
        {/* Advanced Filters */}
        <div className="space-y-4">
          <h4 className="font-medium">Advanced Filters</h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Price Range */}
            <div className="space-y-2">
              <Label className="text-sm">Price Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={batchCriteria.priceRange.min}
                  onChange={(e) => setBatchCriteria(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, min: e.target.value }
                  }))}
                  className="h-8"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={batchCriteria.priceRange.max}
                  onChange={(e) => setBatchCriteria(prev => ({
                    ...prev,
                    priceRange: { ...prev.priceRange, max: e.target.value }
                  }))}
                  className="h-8"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    const min = parseFloat(batchCriteria.priceRange.min) || 0
                    const max = parseFloat(batchCriteria.priceRange.max) || Infinity
                    selectByPriceRange(min, max)
                  }}
                  disabled={!batchCriteria.priceRange.min && !batchCriteria.priceRange.max}
                >
                  Apply
                </Button>
              </div>
            </div>
            
            {/* Stock Level */}
            <div className="space-y-2">
              <Label className="text-sm">Stock Level</Label>
              <div className="flex gap-2">
                <Select
                  value={batchCriteria.stockLevel}
                  onValueChange={(value) => setBatchCriteria(prev => ({ ...prev, stockLevel: value }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="low">Low Stock (≤10)</SelectItem>
                    <SelectItem value="medium">Medium Stock (11-50)</SelectItem>
                    <SelectItem value="high">High Stock (&gt;50)</SelectItem>
                    <SelectItem value="out">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  size="sm"
                  onClick={() => {
                    let filtered: string[] = []
                    
                    switch (batchCriteria.stockLevel) {
                      case 'low':
                        selectLowStock(10)
                        return
                      case 'medium':
                        filtered = products.filter(product => {
                          const stock = stockData.find(s => s.product?._id === product._id)
                          return stock && stock.remaining > 10 && stock.remaining <= 50
                        }).map(p => p._id)
                        break
                      case 'high':
                        filtered = products.filter(product => {
                          const stock = stockData.find(s => s.product?._id === product._id)
                          return stock && stock.remaining > 50
                        }).map(p => p._id)
                        break
                      case 'out':
                        selectOutOfStock()
                        return
                      default:
                        filtered = products.map(p => p._id)
                    }
                    
                    onUpdateSelection([...new Set([...selectedProducts, ...filtered])])
                    toast.success(`Selected ${filtered.length} products`)
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}