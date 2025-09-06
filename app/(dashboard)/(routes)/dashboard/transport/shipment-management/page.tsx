'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Plus, MapPin, Calendar, Search, Eye, Edit, Truck } from 'lucide-react';
import { getShipments, createShipment } from '@/lib/actions/transport.actions';

interface Shipment {
  _id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: string;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  items: Array<{
    product: {
      name: string;
      sku: string;
    };
    quantity: number;
  }>;
  driver?: string;
  notes?: string;
}

export default function ShipmentManagement() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newShipment, setNewShipment] = useState({
    origin: '',
    destination: '',
    estimatedDelivery: '',
    driver: ''
  });

  useEffect(() => {
    loadShipments();
  }, []);

  useEffect(() => {
    filterShipments();
  }, [shipments, searchTerm, statusFilter]);

  const loadShipments = async () => {
    try {
      const data = await getShipments();
      setShipments(data);
    } catch (error) {
      console.error('Failed to load shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterShipments = () => {
    let filtered = shipments;

    if (searchTerm) {
      filtered = filtered.filter(shipment =>
        shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(shipment => shipment.status === statusFilter);
    }

    setFilteredShipments(filtered);
  };

  const handleCreateShipment = async () => {
    try {
      await createShipment({
        origin: newShipment.origin,
        destination: newShipment.destination,
        estimatedDelivery: new Date(newShipment.estimatedDelivery),
        items: [],
        driver: newShipment.driver
      });
      setShowCreateDialog(false);
      setNewShipment({ origin: '', destination: '', estimatedDelivery: '', driver: '' });
      loadShipments();
    } catch (error) {
      console.error('Failed to create shipment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-3xl font-bold">Shipment Management</h1>
          <p className="text-gray-600">Track and manage shipments and deliveries</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Shipment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Shipment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Origin</label>
                <Input
                  value={newShipment.origin}
                  onChange={(e) => setNewShipment({...newShipment, origin: e.target.value})}
                  placeholder="Enter origin location"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Destination</label>
                <Input
                  value={newShipment.destination}
                  onChange={(e) => setNewShipment({...newShipment, destination: e.target.value})}
                  placeholder="Enter destination"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Estimated Delivery</label>
                <Input
                  type="date"
                  value={newShipment.estimatedDelivery}
                  onChange={(e) => setNewShipment({...newShipment, estimatedDelivery: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Driver</label>
                <Input
                  value={newShipment.driver}
                  onChange={(e) => setNewShipment({...newShipment, driver: e.target.value})}
                  placeholder="Enter driver name"
                />
              </div>
              <Button onClick={handleCreateShipment} className="w-full">
                Create Shipment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by tracking number, origin, or destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShipments.map((shipment) => (
          <Card key={shipment._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{shipment.trackingNumber}</CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{shipment.origin} → {shipment.destination}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getStatusColor(shipment.status)}>
                    {shipment.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Items:</span>
                  <span className="text-sm font-medium">{shipment.items?.length || 0}</span>
                </div>
                {shipment.driver && (
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{shipment.driver}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">ETA: {new Date(shipment.estimatedDelivery).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedShipment(shipment)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Shipment Details - {selectedShipment?.trackingNumber}</DialogTitle>
                      </DialogHeader>
                      {selectedShipment && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium">Route</h4>
                              <p>{selectedShipment.origin} → {selectedShipment.destination}</p>
                            </div>
                            <div>
                              <h4 className="font-medium">Status</h4>
                              <Badge className={getStatusColor(selectedShipment.status)}>
                                {selectedShipment.status}
                              </Badge>
                            </div>
                            <div>
                              <h4 className="font-medium">Driver</h4>
                              <p>{selectedShipment.driver || 'Not assigned'}</p>
                            </div>
                            <div>
                              <h4 className="font-medium">ETA</h4>
                              <p>{new Date(selectedShipment.estimatedDelivery).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {selectedShipment.items && selectedShipment.items.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Items</h4>
                              <div className="space-y-2">
                                {selectedShipment.items.map((item, index) => (
                                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span>{item.product?.name || 'Unknown Product'}</span>
                                    <span>Qty: {item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredShipments.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Shipments Found</h3>
              <p className="text-gray-600">No shipments match your current filters</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}