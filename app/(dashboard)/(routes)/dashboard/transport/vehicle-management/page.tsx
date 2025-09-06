'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Truck, Plus, Calendar, User, Fuel, Gauge, Settings, Edit, Trash2, Wrench, Search, Eye } from 'lucide-react';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, scheduleMaintenanceVehicle, getVehicleMaintenanceSchedule } from '@/lib/actions/transport.actions';

interface Vehicle {
  _id: string;
  plateNumber: string;
  type: string;
  capacity: string;
  status: string;
  driver: string;
  lastMaintenance: Date;
  nextMaintenance?: Date;
  fuelType?: string;
  mileage?: number;
}

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [newVehicle, setNewVehicle] = useState({
    plateNumber: '',
    type: '',
    capacity: '',
    driver: '',
    fuelType: '',
    mileage: 0
  });

  const [editVehicle, setEditVehicle] = useState({
    plateNumber: '',
    type: '',
    capacity: '',
    driver: '',
    status: '',
    fuelType: '',
    mileage: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      const [vehiclesData, maintenanceData] = await Promise.all([
        getVehicles(),
        getVehicleMaintenanceSchedule()
      ]);
      setVehicles(vehiclesData);
      setMaintenanceSchedule(maintenanceData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    let filtered = vehicles;

    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter);
    }

    setFilteredVehicles(filtered);
  };

  const handleCreateVehicle = async () => {
    try {
      await createVehicle(newVehicle);
      setShowCreateDialog(false);
      setNewVehicle({ plateNumber: '', type: '', capacity: '', driver: '', fuelType: '', mileage: 0 });
      loadData();
    } catch (error) {
      console.error('Failed to create vehicle:', error);
    }
  };

  const handleEditVehicle = async () => {
    if (!selectedVehicle) return;
    try {
      await updateVehicle(selectedVehicle._id, editVehicle);
      setShowEditDialog(false);
      setSelectedVehicle(null);
      loadData();
    } catch (error) {
      console.error('Failed to update vehicle:', error);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(vehicleId);
        loadData();
      } catch (error) {
        console.error('Failed to delete vehicle:', error);
      }
    }
  };

  const handleScheduleMaintenance = async (vehicleId: string) => {
    try {
      await scheduleMaintenanceVehicle(vehicleId, new Date());
      loadData();
    } catch (error) {
      console.error('Failed to schedule maintenance:', error);
    }
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setEditVehicle({
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
      capacity: vehicle.capacity,
      driver: vehicle.driver,
      status: vehicle.status,
      fuelType: vehicle.fuelType || '',
      mileage: vehicle.mileage || 0
    });
    setShowEditDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceStatus = (vehicle: Vehicle) => {
    if (!vehicle.nextMaintenance) return null;
    const daysUntil = Math.ceil((new Date(vehicle.nextMaintenance).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 0) return { text: 'Overdue', color: 'text-red-600' };
    if (daysUntil <= 7) return { text: `${daysUntil}d`, color: 'text-orange-600' };
    if (daysUntil <= 30) return { text: `${daysUntil}d`, color: 'text-yellow-600' };
    return { text: `${daysUntil}d`, color: 'text-green-600' };
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
          <h1 className="text-3xl font-bold">Vehicle Management</h1>
          <p className="text-gray-600">Manage fleet vehicles and maintenance schedules</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Plate Number</Label>
                  <Input
                    value={newVehicle.plateNumber}
                    onChange={(e) => setNewVehicle({...newVehicle, plateNumber: e.target.value})}
                    placeholder="ABC-123"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={newVehicle.type} onValueChange={(value) => setNewVehicle({...newVehicle, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Truck">Truck</SelectItem>
                      <SelectItem value="Van">Van</SelectItem>
                      <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                      <SelectItem value="Car">Car</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Capacity</Label>
                  <Input
                    value={newVehicle.capacity}
                    onChange={(e) => setNewVehicle({...newVehicle, capacity: e.target.value})}
                    placeholder="5 tons"
                  />
                </div>
                <div>
                  <Label>Driver</Label>
                  <Input
                    value={newVehicle.driver}
                    onChange={(e) => setNewVehicle({...newVehicle, driver: e.target.value})}
                    placeholder="Driver name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fuel Type</Label>
                  <Select value={newVehicle.fuelType} onValueChange={(value) => setNewVehicle({...newVehicle, fuelType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gasoline">Gasoline</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Mileage</Label>
                  <Input
                    type="number"
                    value={newVehicle.mileage}
                    onChange={(e) => setNewVehicle({...newVehicle, mileage: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
              </div>
              <Button onClick={handleCreateVehicle} className="w-full">
                Add Vehicle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{vehicles.filter(v => v.status === 'available').length}</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{vehicles.filter(v => v.status === 'in-transit').length}</div>
                <div className="text-sm text-gray-600">In Transit</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{vehicles.filter(v => v.status === 'maintenance').length}</div>
                <div className="text-sm text-gray-600">Maintenance</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{maintenanceSchedule.length}</div>
                <div className="text-sm text-gray-600">Due Soon</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vehicles..."
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
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="out-of-service">Out of Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const maintenanceStatus = getMaintenanceStatus(vehicle);
          return (
            <Card key={vehicle._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{vehicle.plateNumber}</CardTitle>
                <Truck className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="text-sm font-medium">{vehicle.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Capacity:</span>
                    <span className="text-sm font-medium">{vehicle.capacity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={getStatusColor(vehicle.status)}>
                      {vehicle.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{vehicle.driver}</span>
                  </div>
                  {vehicle.fuelType && (
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{vehicle.fuelType}</span>
                    </div>
                  )}
                  {vehicle.mileage && (
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{vehicle.mileage.toLocaleString()} km</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Last: {new Date(vehicle.lastMaintenance).toLocaleDateString()}</span>
                    </div>
                    {maintenanceStatus && (
                      <span className={`text-sm font-medium ${maintenanceStatus.color}`}>
                        {maintenanceStatus.text}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(vehicle)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {vehicle.status === 'available' && (
                      <Button variant="outline" size="sm" onClick={() => handleScheduleMaintenance(vehicle._id)}>
                        <Wrench className="h-4 w-4 mr-1" />
                        Maintain
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDeleteVehicle(vehicle._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Plate Number</Label>
                <Input
                  value={editVehicle.plateNumber}
                  onChange={(e) => setEditVehicle({...editVehicle, plateNumber: e.target.value})}
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={editVehicle.type} onValueChange={(value) => setEditVehicle({...editVehicle, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                    <SelectItem value="Car">Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Driver</Label>
                <Input
                  value={editVehicle.driver}
                  onChange={(e) => setEditVehicle({...editVehicle, driver: e.target.value})}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editVehicle.status} onValueChange={(value) => setEditVehicle({...editVehicle, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in-transit">In Transit</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="out-of-service">Out of Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mileage</Label>
                <Input
                  type="number"
                  value={editVehicle.mileage}
                  onChange={(e) => setEditVehicle({...editVehicle, mileage: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Fuel Type</Label>
                <Select value={editVehicle.fuelType} onValueChange={(value) => setEditVehicle({...editVehicle, fuelType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleEditVehicle} className="w-full">
              Update Vehicle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}