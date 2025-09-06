'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRightLeft, Plus, Search, Eye, CheckCircle, XCircle, Warehouse, Package } from 'lucide-react';
import { getAllStockTransfers, createStockTransfer, approveStockTransfer, completeStockTransfer, getWarehouses, getWarehouseStock } from '@/lib/actions/stock-transfer.actions';
import { getProducts } from '@/lib/actions/pos.actions';

interface StockTransfer {
  _id: string;
  transferNumber: string;
  fromWarehouse: { name: string; location: string };
  toWarehouse: { name: string; location: string };
  status: string;
  transferDate: string;
  items: Array<{
    product: { name: string; sku: string };
    quantity: number;
    unitCost: number;
  }>;
  requestedBy: { name: string };
  approvedBy?: { name: string };
  shipment?: { trackingNumber: string; status: string };
  reason: string;
  notes?: string;
}

interface Warehouse {
  _id: string;
  name: string;
  location: string;
  type: string;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
}

export default function StockTransfer() {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouseStock, setWarehouseStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [newTransfer, setNewTransfer] = useState({
    fromWarehouseId: '',
    toWarehouseId: '',
    reason: '',
    notes: '',
    items: [{ productId: '', quantity: 1, unitCost: 0 }]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transfersData, warehousesData, productsData] = await Promise.all([
        getAllStockTransfers(),
        getWarehouses(),
        getProducts()
      ]);
      setTransfers(transfersData);
      setWarehouses(warehousesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouseStock = async (warehouseId: string) => {
    try {
      const stock = await getWarehouseStock(warehouseId);
      setWarehouseStock(stock);
    } catch (error) {
      console.error('Failed to load warehouse stock:', error);
    }
  };

  const handleCreateTransfer = async () => {
    try {
      await createStockTransfer({
        fromWarehouseId: newTransfer.fromWarehouseId,
        toWarehouseId: newTransfer.toWarehouseId,
        items: newTransfer.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost
        })),
        reason: newTransfer.reason,
        notes: newTransfer.notes,
        requestedBy: '507f1f77bcf86cd799439011' // Mock user ID
      });
      
      setShowCreateDialog(false);
      setNewTransfer({
        fromWarehouseId: '',
        toWarehouseId: '',
        reason: '',
        notes: '',
        items: [{ productId: '', quantity: 1, unitCost: 0 }]
      });
      loadData();
    } catch (error) {
      console.error('Failed to create transfer:', error);
    }
  };

  const handleApproveTransfer = async (transferId: string) => {
    try {
      await approveStockTransfer(transferId, '507f1f77bcf86cd799439011');
      loadData();
    } catch (error) {
      console.error('Failed to approve transfer:', error);
    }
  };

  const handleCompleteTransfer = async (transferId: string) => {
    try {
      await completeStockTransfer(transferId);
      loadData();
    } catch (error) {
      console.error('Failed to complete transfer:', error);
    }
  };

  const addItem = () => {
    setNewTransfer({
      ...newTransfer,
      items: [...newTransfer.items, { productId: '', quantity: 1, unitCost: 0 }]
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...newTransfer.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'productId') {
      const product = products.find(p => p._id === value);
      if (product) {
        updatedItems[index].unitCost = product.price;
      }
    }
    
    setNewTransfer({ ...newTransfer, items: updatedItems });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.fromWarehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toWarehouse.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold">Stock Transfer</h1>
          <p className="text-gray-600">Transfer inventory between warehouses</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Stock Transfer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Warehouse</Label>
                  <Select value={newTransfer.fromWarehouseId} onValueChange={(value) => {
                    setNewTransfer({...newTransfer, fromWarehouseId: value});
                    loadWarehouseStock(value);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse._id} value={warehouse._id}>
                          {warehouse.name} - {warehouse.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>To Warehouse</Label>
                  <Select value={newTransfer.toWarehouseId} onValueChange={(value) => setNewTransfer({...newTransfer, toWarehouseId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.filter(w => w._id !== newTransfer.fromWarehouseId).map((warehouse) => (
                        <SelectItem key={warehouse._id} value={warehouse._id}>
                          {warehouse.name} - {warehouse.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Reason for Transfer</Label>
                <Input
                  value={newTransfer.reason}
                  onChange={(e) => setNewTransfer({...newTransfer, reason: e.target.value})}
                  placeholder="Enter reason for transfer"
                />
              </div>

              <div>
                <Label>Items to Transfer</Label>
                <div className="space-y-2">
                  {newTransfer.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 items-center">
                      <Select value={item.productId} onValueChange={(value) => updateItem(index, 'productId', value)}>
                        <SelectTrigger>
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
                      <Input
                        type="number"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Unit Cost"
                        value={item.unitCost}
                        onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                      />
                      <Button variant="outline" onClick={() => {
                        const items = newTransfer.items.filter((_, i) => i !== index);
                        setNewTransfer({...newTransfer, items});
                      }}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addItem}>Add Item</Button>
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={newTransfer.notes}
                  onChange={(e) => setNewTransfer({...newTransfer, notes: e.target.value})}
                  placeholder="Additional notes..."
                />
              </div>

              <Button onClick={handleCreateTransfer} className="w-full">
                Create Transfer Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transfers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transfers List */}
      <div className="space-y-4">
        {filteredTransfers.map((transfer) => (
          <Card key={transfer._id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <ArrowRightLeft className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="font-medium">{transfer.transferNumber}</div>
                    <div className="text-sm text-gray-600">
                      {transfer.fromWarehouse.name} → {transfer.toWarehouse.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transfer.items.length} items • {new Date(transfer.transferDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(transfer.status)}>
                    {transfer.status}
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedTransfer(transfer)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Transfer Details - {selectedTransfer?.transferNumber}</DialogTitle>
                        </DialogHeader>
                        {selectedTransfer && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium">From</h4>
                                <p>{selectedTransfer.fromWarehouse.name}</p>
                                <p className="text-sm text-gray-600">{selectedTransfer.fromWarehouse.location}</p>
                              </div>
                              <div>
                                <h4 className="font-medium">To</h4>
                                <p>{selectedTransfer.toWarehouse.name}</p>
                                <p className="text-sm text-gray-600">{selectedTransfer.toWarehouse.location}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Items</h4>
                              <div className="space-y-2">
                                {selectedTransfer.items.map((item, index) => (
                                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span>{item.product.name} ({item.product.sku})</span>
                                    <span>{item.quantity} × ${item.unitCost.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium">Reason</h4>
                              <p className="text-sm">{selectedTransfer.reason}</p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    {transfer.status === 'pending' && (
                      <Button size="sm" onClick={() => handleApproveTransfer(transfer._id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    
                    {transfer.status === 'in-transit' && (
                      <Button size="sm" onClick={() => handleCompleteTransfer(transfer._id)}>
                        <Package className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}