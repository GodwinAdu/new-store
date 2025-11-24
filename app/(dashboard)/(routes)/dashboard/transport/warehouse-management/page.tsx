'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Building, MapPin, User, Phone, Package, Edit, Trash2 } from 'lucide-react';
import { getWarehouses, createWarehouse, getShipments, receiveShipment } from '@/lib/actions/transport.actions';

interface Warehouse {
  _id: string;
  name: string;
  location: string;
  address: string;
  manager: string;
  phone: string;
  capacity: number;
  status: string;
}

interface Shipment {
  _id: string;
  trackingNumber: string;
  supplier: string;
  status: string;
  items: Array<{
    product: { name: string; sku: string };
    quantity: number;
    receivedQuantity: number;
  }>;
  totalValue: number;
}

export default function WarehouseManagement() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [pendingShipments, setPendingShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [newWarehouse, setNewWarehouse] = useState({
    name: '',
    location: '',
    address: '',
    manager: '',
    phone: '',
    capacity: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [warehousesData, shipmentsData] = await Promise.all([
        getWarehouses(),
        getShipments()
      ]);
      setWarehouses(warehousesData);
      setPendingShipments(shipmentsData.filter((s: Shipment) => s.status === 'delivered'));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWarehouse = async () => {
    try {
      await createWarehouse(newWarehouse);
      setShowCreateDialog(false);
      setNewWarehouse({
        name: '',
        location: '',
        address: '',
        manager: '',
        phone: '',
        capacity: 0
      });
      loadData();
    } catch (error) {
      console.error('Failed to create warehouse:', error);
    }
  };

  const handleReceiveShipment = async () => {
    if (!selectedShipment) return;
    
    try {
      const receivedItems = selectedShipment.items.map(item => ({
        productId: item.product.sku,
        receivedQuantity: item.quantity
      }));
      
      await receiveShipment(selectedShipment._id, receivedItems);
      setShowReceiveDialog(false);
      setSelectedShipment(null);
      loadData();
    } catch (error) {
      console.error('Failed to receive shipment:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Warehouse Management</h1>
            <p className="text-gray-600">Manage warehouses and receive shipments</p>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({length: 6}).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Warehouse Management</h1>
          <p className="text-gray-600">Manage warehouses and receive shipments</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Warehouse
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Warehouse</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={newWarehouse.name}
                    onChange={(e) => setNewWarehouse({...newWarehouse, name: e.target.value})}
                    placeholder="Main Warehouse"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={newWarehouse.location}
                    onChange={(e) => setNewWarehouse({...newWarehouse, location: e.target.value})}
                    placeholder="Downtown"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={newWarehouse.address}
                  onChange={(e) => setNewWarehouse({...newWarehouse, address: e.target.value})}
                  placeholder="123 Main St, City"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Manager</label>
                  <Input
                    value={newWarehouse.manager}
                    onChange={(e) => setNewWarehouse({...newWarehouse, manager: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={newWarehouse.phone}
                    onChange={(e) => setNewWarehouse({...newWarehouse, phone: e.target.value})}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Capacity (sq ft)</label>
                <Input
                  type="number"
                  value={newWarehouse.capacity}
                  onChange={(e) => setNewWarehouse({...newWarehouse, capacity: Number(e.target.value)})}
                  placeholder="10000"
                />
              </div>
              <Button onClick={handleCreateWarehouse} className="w-full">
                Create Warehouse
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {pendingShipments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Pending Receipts ({pendingShipments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingShipments.map((shipment) => (
                <Card key={shipment._id} className="cursor-pointer hover:bg-gray-50" 
                      onClick={() => {
                        setSelectedShipment(shipment);
                        setShowReceiveDialog(true);
                      }}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{shipment.trackingNumber}</span>
                        <Badge className="bg-orange-100 text-orange-800">Delivered</Badge>
                      </div>
                      <p className="text-sm text-gray-600">From: {shipment.supplier}</p>
                      <p className="text-sm text-gray-600">Items: {shipment.items.length}</p>
                      <p className="text-sm font-medium">${shipment.totalValue.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouses found</h3>
            <p className="text-gray-500 mb-4">Create your first warehouse to get started</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Warehouse
            </Button>
          </div>
        ) : (
          warehouses.map((warehouse) => (
            <Card key={warehouse._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{warehouse.name}</CardTitle>
                <Building className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{warehouse.location}</span>
                  </div>
                  <div className="text-sm text-gray-600">{warehouse.address}</div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{warehouse.manager}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{warehouse.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Capacity:</span>
                    <span className="text-sm font-medium">{warehouse.capacity.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={warehouse.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {warehouse.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receive Shipment - {selectedShipment?.trackingNumber}</DialogTitle>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Supplier:</p>
                  <p className="font-medium">{selectedShipment.supplier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Value:</p>
                  <p className="font-medium">${selectedShipment.totalValue.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Items to Receive:</h4>
                <div className="space-y-2">
                  {selectedShipment.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleReceiveShipment} className="flex-1">
                  Confirm Receipt
                </Button>
                <Button variant="outline" onClick={() => setShowReceiveDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}