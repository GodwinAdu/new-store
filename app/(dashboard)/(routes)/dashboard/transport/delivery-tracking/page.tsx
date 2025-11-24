'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Package, Clock, CheckCircle, Truck, Search, Eye, Navigation } from 'lucide-react';
import { getShipments, updateShipmentStatus } from '@/lib/actions/transport.actions';

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

export default function DeliveryTracking() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

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
        shipment.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destinationWarehouse?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.driver?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(shipment => shipment.status === statusFilter);
    }

    setFilteredShipments(filtered);
  };

  const handleStatusUpdate = async (shipmentId: string, newStatus: string) => {
    try {
      const actualDelivery = newStatus === 'delivered' ? new Date() : undefined;
      await updateShipmentStatus(shipmentId, newStatus, actualDelivery);
      loadShipments();
    } catch (error) {
      console.error('Failed to update shipment status:', error);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in-transit': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getDeliveryStatus = (shipment: Shipment) => {
    const now = new Date();
    const eta = new Date(shipment.estimatedDelivery);
    
    if (shipment.status === 'delivered') {
      return { text: 'Delivered', color: 'text-green-600' };
    }
    
    if (now > eta) {
      return { text: 'Overdue', color: 'text-red-600' };
    }
    
    const hoursUntilDelivery = Math.ceil((eta.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (hoursUntilDelivery <= 24) {
      return { text: `${hoursUntilDelivery}h remaining`, color: 'text-orange-600' };
    }
    
    return { text: 'On schedule', color: 'text-blue-600' };
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
          <h1 className="text-3xl font-bold">Delivery Tracking</h1>
          <p className="text-gray-600">Real-time tracking of shipments and deliveries</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">
                  {shipments.filter(s => s.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {shipments.filter(s => s.status === 'in-transit').length}
                </div>
                <div className="text-sm text-gray-600">In Transit</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {shipments.filter(s => s.status === 'delivered').length}
                </div>
                <div className="text-sm text-gray-600">Delivered</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {shipments.filter(s => {
                    const eta = new Date(s.estimatedDelivery);
                    return new Date() > eta && s.status !== 'delivered';
                  }).length}
                </div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by tracking number, location, or driver..."
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

      {/* Shipments List */}
      <div className="space-y-4">
        {filteredShipments.map((shipment) => {
          const deliveryStatus = getDeliveryStatus(shipment);
          
          return (
            <Card key={shipment._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                      {getStatusIcon(shipment.status)}
                    </div>
                    
                    <div>
                      <div className="font-medium text-lg">{shipment.trackingNumber}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {shipment.supplier} → {shipment.destinationWarehouse?.name || 'Warehouse'}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        {shipment.driver && (
                          <span>Driver: {shipment.driver}</span>
                        )}
                        <span>{shipment.items?.length || 0} items</span>
                        <span className={deliveryStatus.color}>
                          {deliveryStatus.text}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">ETA</div>
                      <div className="font-medium">
                        {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                      </div>
                      {shipment.actualDelivery && (
                        <div className="text-sm text-green-600">
                          Delivered: {new Date(shipment.actualDelivery).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <Badge className={getStatusColor(shipment.status)}>
                      {shipment.status}
                    </Badge>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Track
                      </Button>
                      
                      {shipment.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusUpdate(shipment._id, 'in-transit')}
                        >
                          Start Transit
                        </Button>
                      )}
                      
                      {shipment.status === 'in-transit' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusUpdate(shipment._id, 'delivered')}
                        >
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>
                      {shipment.status === 'pending' && '0%'}
                      {shipment.status === 'in-transit' && '50%'}
                      {shipment.status === 'delivered' && '100%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        shipment.status === 'delivered' ? 'bg-green-500' :
                        shipment.status === 'in-transit' ? 'bg-blue-500' : 'bg-gray-400'
                      }`}
                      style={{
                        width: shipment.status === 'pending' ? '10%' :
                               shipment.status === 'in-transit' ? '50%' :
                               shipment.status === 'delivered' ? '100%' : '0%'
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
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
    </div>
  );
}