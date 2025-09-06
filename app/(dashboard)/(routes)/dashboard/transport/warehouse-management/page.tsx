'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Warehouse, Package, MapPin, Users, BarChart3, Search, Eye } from 'lucide-react';
import { getWarehouses, getWarehouseStock } from '@/lib/actions/stock-transfer.actions';

interface Warehouse {
  _id: string;
  name: string;
  location: string;
  type: string;
  capacity: number;
  isActive: boolean;
}

interface WarehouseStock {
  product: {
    _id: string;
    name: string;
    sku: string;
    price: number;
  };
  totalQuantity: number;
  batches: Array<{
    quantity: number;
    costPerUnit: number;
    batchNumber: string;
    expiryDate: string;
  }>;
}

export default function WarehouseManagement() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [warehouseStock, setWarehouseStock] = useState<WarehouseStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      const data = await getWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouseStock = async (warehouseId: string) => {
    setStockLoading(true);
    try {
      const stock = await getWarehouseStock(warehouseId);
      setWarehouseStock(stock);
    } catch (error) {
      console.error('Failed to load warehouse stock:', error);
    } finally {
      setStockLoading(false);
    }
  };

  const handleViewWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    loadWarehouseStock(warehouse._id);
  };

  const getWarehouseTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'main': return 'bg-blue-100 text-blue-800';
      case 'distribution': return 'bg-green-100 text-green-800';
      case 'storage': return 'bg-purple-100 text-purple-800';
      case 'retail': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateWarehouseUtilization = (warehouse: Warehouse) => {
    const totalStock = warehouseStock.reduce((sum, item) => sum + item.totalQuantity, 0);
    const utilization = warehouse.capacity > 0 ? (totalStock / warehouse.capacity) * 100 : 0;
    return Math.min(utilization, 100);
  };

  const filteredStock = warehouseStock.filter(item =>
    item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Warehouse Management</h1>
          <p className="text-gray-600">Monitor warehouse operations and inventory levels</p>
        </div>
      </div>

      {/* Warehouse Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => (
          <Card key={warehouse._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{warehouse.name}</CardTitle>
              <Warehouse className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{warehouse.location}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Type:</span>
                  <Badge className={getWarehouseTypeColor(warehouse.type)}>
                    {warehouse.type || 'General'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Capacity:</span>
                  <span className="text-sm font-medium">{warehouse.capacity.toLocaleString()} units</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={warehouse.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {warehouse.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => handleViewWarehouse(warehouse)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Warehouse className="h-5 w-5" />
                        {selectedWarehouse?.name} - Inventory Details
                      </DialogTitle>
                    </DialogHeader>
                    
                    {selectedWarehouse && (
                      <div className="space-y-6">
                        {/* Warehouse Info */}
                        <div className="grid grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                <div>
                                  <div className="text-2xl font-bold">{warehouseStock.length}</div>
                                  <div className="text-sm text-gray-600">Product Types</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-green-600" />
                                <div>
                                  <div className="text-2xl font-bold">
                                    {warehouseStock.reduce((sum, item) => sum + item.totalQuantity, 0).toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">Total Units</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-purple-600" />
                                <div>
                                  <div className="text-2xl font-bold">
                                    {calculateWarehouseUtilization(selectedWarehouse).toFixed(1)}%
                                  </div>
                                  <div className="text-sm text-gray-600">Utilization</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        {/* Stock Search */}
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="relative">
                              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Search products in warehouse..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Stock List */}
                        <div className="max-h-96 overflow-y-auto">
                          {stockLoading ? (
                            <div className="flex items-center justify-center h-32">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {filteredStock.map((item) => (
                                <div key={item.product._id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div>
                                    <div className="font-medium">{item.product.name}</div>
                                    <div className="text-sm text-gray-600">SKU: {item.product.sku}</div>
                                    <div className="text-sm text-gray-500">
                                      {item.batches.length} batch{item.batches.length !== 1 ? 'es' : ''}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold">{item.totalQuantity}</div>
                                    <div className="text-sm text-gray-600">units</div>
                                    <div className="text-sm text-green-600">
                                      ${(item.totalQuantity * item.product.price).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {filteredStock.length === 0 && !stockLoading && (
                                <div className="text-center py-8 text-gray-500">
                                  {searchTerm ? 'No products match your search' : 'No inventory in this warehouse'}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Warehouse Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Warehouse Network Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{warehouses.length}</div>
              <div className="text-sm text-gray-600">Total Warehouses</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {warehouses.filter(w => w.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Warehouses</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {warehouses.reduce((sum, w) => sum + w.capacity, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Capacity</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {new Set(warehouses.map(w => w.type)).size}
              </div>
              <div className="text-sm text-gray-600">Warehouse Types</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}