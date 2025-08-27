'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  TrendingDown,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  unitPrice: number
  costPrice: number
  supplier: string
  lastRestocked: string
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
}

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Premium Coffee',
    sku: 'COF-001',
    category: 'Beverages',
    currentStock: 50,
    minStock: 20,
    maxStock: 100,
    unitPrice: 4.99,
    costPrice: 2.50,
    supplier: 'Coffee Roasters Inc',
    lastRestocked: '2024-01-15',
    status: 'in-stock'
  },
  {
    id: '2',
    name: 'Croissant',
    sku: 'BAK-002',
    category: 'Bakery',
    currentStock: 8,
    minStock: 15,
    maxStock: 50,
    unitPrice: 2.99,
    costPrice: 1.20,
    supplier: 'Fresh Bakery Co',
    lastRestocked: '2024-01-14',
    status: 'low-stock'
  },
  {
    id: '3',
    name: 'Energy Drink',
    sku: 'BEV-003',
    category: 'Beverages',
    currentStock: 0,
    minStock: 10,
    maxStock: 60,
    unitPrice: 3.49,
    costPrice: 1.80,
    supplier: 'Energy Plus Ltd',
    lastRestocked: '2024-01-10',
    status: 'out-of-stock'
  }
]

export function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const lowStockItems = inventory.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock')
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.costPrice), 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'low-stock': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'out-of-stock': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const handleRestock = (itemId: string, quantity: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStock = item.currentStock + quantity
        const newStatus = newStock === 0 ? 'out-of-stock' : 
                         newStock <= item.minStock ? 'low-stock' : 'in-stock'
        return {
          ...item,
          currentStock: newStock,
          status: newStatus,
          lastRestocked: new Date().toISOString().split('T')[0]
        }
      }
      return item
    }))
    toast.success(`Restocked ${quantity} units successfully`)
  }

  const handleQuickRestock = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId)
    if (item) {
      const restockAmount = item.maxStock - item.currentStock
      handleRestock(itemId, restockAmount)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(inventory.map(item => item.category)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" placeholder="Enter product name" />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" placeholder="Enter SKU" />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beverages">Beverages</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="bakery">Bakery</SelectItem>
                        <SelectItem value="snacks">Snacks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="unitPrice">Unit Price</Label>
                      <Input id="unitPrice" type="number" placeholder="0.00" />
                    </div>
                    <div>
                      <Label htmlFor="costPrice">Cost Price</Label>
                      <Input id="costPrice" type="number" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="currentStock">Current Stock</Label>
                      <Input id="currentStock" type="number" placeholder="0" />
                    </div>
                    <div>
                      <Label htmlFor="minStock">Min Stock</Label>
                      <Input id="minStock" type="number" placeholder="0" />
                    </div>
                    <div>
                      <Label htmlFor="maxStock">Max Stock</Label>
                      <Input id="maxStock" type="number" placeholder="0" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input id="supplier" placeholder="Enter supplier name" />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      toast.success('Item added successfully')
                      setIsAddDialogOpen(false)
                    }}>
                      Add Item
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInventory.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <Badge variant="outline" className="text-xs">{item.sku}</Badge>
                      <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                        {item.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>Stock: {item.currentStock}/{item.maxStock}</span>
                      <span>•</span>
                      <span>Price: ${item.unitPrice}</span>
                      <span>•</span>
                      <span>Last restocked: {item.lastRestocked}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {item.status !== 'in-stock' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleQuickRestock(item.id)}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Quick Restock
                    </Button>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Restock
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Restock {item.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Current Stock: {item.currentStock}</Label>
                        </div>
                        <div>
                          <Label htmlFor="quantity">Quantity to Add</Label>
                          <Input 
                            id="quantity" 
                            type="number" 
                            placeholder="Enter quantity"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const quantity = parseInt((e.target as HTMLInputElement).value)
                                if (quantity > 0) {
                                  handleRestock(item.id, quantity)
                                }
                              }
                            }}
                          />
                        </div>
                        <Button 
                          className="w-full"
                          onClick={(e) => {
                            const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement
                            const quantity = parseInt(input?.value || '0')
                            if (quantity > 0) {
                              handleRestock(item.id, quantity)
                            }
                          }}
                        >
                          Add Stock
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}