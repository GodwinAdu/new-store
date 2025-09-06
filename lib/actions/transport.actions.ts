'use server'

import Vehicle from '@/lib/models/vehicle.models';
import Shipment from '@/lib/models/shipment.models';
import Warehouse from '@/lib/models/warehouse.models';
import { connectToDB } from '../mongoose';

export async function getVehicles() {
  try {
    await connectToDB();
    
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    
    // If no vehicles exist, create sample data
    if (vehicles.length === 0) {
      const sampleVehicles = [
        {
          plateNumber: 'ABC-123',
          type: 'Truck',
          capacity: '5 tons',
          status: 'available',
          driver: 'John Doe',
          lastMaintenance: new Date('2024-01-15'),
          nextMaintenance: new Date('2024-04-15'),
          fuelType: 'Diesel',
          mileage: 45000
        },
        {
          plateNumber: 'XYZ-789',
          type: 'Van',
          capacity: '2 tons',
          status: 'in-transit',
          driver: 'Jane Smith',
          lastMaintenance: new Date('2024-02-01'),
          nextMaintenance: new Date('2024-05-01'),
          fuelType: 'Gasoline',
          mileage: 32000
        },
        {
          plateNumber: 'DEF-456',
          type: 'Motorcycle',
          capacity: '50 kg',
          status: 'maintenance',
          driver: 'Mike Johnson',
          lastMaintenance: new Date('2024-12-01'),
          nextMaintenance: new Date('2025-03-01'),
          fuelType: 'Gasoline',
          mileage: 15000
        }
      ];
      
      await Vehicle.insertMany(sampleVehicles);
      return await Vehicle.find().sort({ createdAt: -1 });
    }
    
    return JSON.parse(JSON.stringify(vehicles));
  } catch (error) {
    throw new Error('Failed to fetch vehicles');
  }
}

export async function getShipments() {
  try {
    await connectToDB();
    
    const shipments = await Shipment.find()
      .populate('items.product', 'name sku')
      .populate('vehicle', 'plateNumber type')
      .sort({ createdAt: -1 });
    
    // If no shipments exist, create sample data
    if (shipments.length === 0) {
      const sampleShipments = [
        {
          trackingNumber: 'SH001',
          origin: 'Warehouse A',
          destination: 'Customer Location',
          status: 'in-transit',
          estimatedDelivery: new Date('2024-12-25'),
          items: [],
          driver: 'John Doe'
        },
        {
          trackingNumber: 'SH002',
          origin: 'Warehouse B',
          destination: 'Store Location',
          status: 'delivered',
          estimatedDelivery: new Date('2024-12-20'),
          actualDelivery: new Date('2024-12-19'),
          items: [],
          driver: 'Jane Smith'
        }
      ];
      
      await Shipment.insertMany(sampleShipments);
      return await Shipment.find().populate('items.product', 'name sku').populate('vehicle', 'plateNumber type').sort({ createdAt: -1 });
    }
    
    return JSON.parse(JSON.stringify(shipments));
  } catch (error) {
    throw new Error('Failed to fetch shipments');
  }
}

export async function createVehicle(vehicleData: {
  plateNumber: string;
  type: string;
  capacity: string;
  driver: string;
  fuelType?: string;
  mileage?: number;
}) {
  try {
    await connectToDB();
    
    const vehicle = await Vehicle.create({
      ...vehicleData,
      lastMaintenance: new Date(),
      nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      status: 'available'
    });
    
    return JSON.parse(JSON.stringify(vehicle));
  } catch (error) {
    throw new Error('Failed to create vehicle');
  }
}

export async function updateVehicle(vehicleId: string, updateData: {
  plateNumber?: string;
  type?: string;
  capacity?: string;
  driver?: string;
  status?: string;
  fuelType?: string;
  mileage?: number;
}) {
  try {
    await connectToDB();
    
    const vehicle = await Vehicle.findByIdAndUpdate(vehicleId, updateData, { new: true });
    
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    return JSON.parse(JSON.stringify(vehicle));
  } catch (error) {
    throw new Error('Failed to update vehicle');
  }
}

export async function deleteVehicle(vehicleId: string) {
  try {
    await connectToDB();
    
    const vehicle = await Vehicle.findByIdAndDelete(vehicleId);
    
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    return { success: true };
  } catch (error) {
    throw new Error('Failed to delete vehicle');
  }
}

export async function scheduleMaintenanceVehicle(vehicleId: string, maintenanceDate: Date) {
  try {
    await connectToDB();
    
    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      {
        status: 'maintenance',
        lastMaintenance: maintenanceDate,
        nextMaintenance: new Date(maintenanceDate.getTime() + 90 * 24 * 60 * 60 * 1000)
      },
      { new: true }
    );
    
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    
    return JSON.parse(JSON.stringify(vehicle));
  } catch (error) {
    throw new Error('Failed to schedule maintenance');
  }
}

export async function getVehiclesByStatus(status: string) {
  try {
    await connectToDB();
    
    const vehicles = await Vehicle.find({ status }).sort({ createdAt: -1 });
    
    return JSON.parse(JSON.stringify(vehicles));
  } catch (error) {
    throw new Error('Failed to fetch vehicles by status');
  }
}

export async function getVehicleMaintenanceSchedule() {
  try {
    await connectToDB();
    
    const upcomingMaintenance = await Vehicle.find({
      nextMaintenance: {
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      }
    }).sort({ nextMaintenance: 1 });
    
    return JSON.parse(JSON.stringify(upcomingMaintenance));
  } catch (error) {
    throw new Error('Failed to fetch maintenance schedule');
  }
}

export async function createShipment(shipmentData: {
  origin: string;
  destination: string;
  estimatedDelivery: Date;
  items: Array<{ productId: string; quantity: number }>;
  driver?: string;
  purchaseOrderId?: string;
  stockTransferId?: string;
}) {
  try {
    await connectToDB();
    
    const trackingNumber = `SH${Date.now().toString().slice(-6)}`;
    
    const shipment = await Shipment.create({
      trackingNumber,
      origin: shipmentData.origin,
      destination: shipmentData.destination,
      estimatedDelivery: shipmentData.estimatedDelivery,
      items: shipmentData.items.map(item => ({
        product: item.productId,
        quantity: item.quantity
      })),
      driver: shipmentData.driver,
      status: 'pending'
    });
    
    return JSON.parse(JSON.stringify(shipment));
  } catch (error) {
    throw new Error('Failed to create shipment');
  }
}

export async function updateShipmentStatus(shipmentId: string, status: string, actualDelivery?: Date) {
  try {
    await connectToDB();
    
    const updateData: any = { status };
    if (actualDelivery) {
      updateData.actualDelivery = actualDelivery;
    }
    
    const shipment = await Shipment.findByIdAndUpdate(shipmentId, updateData, { new: true });
    
    return JSON.parse(JSON.stringify(shipment));
  } catch (error) {
    throw new Error('Failed to update shipment status');
  }
}

export async function getShipmentsByStatus(status: string) {
  try {
    await connectToDB();
    
    const shipments = await Shipment.find({ status })
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });
    
    return JSON.parse(JSON.stringify(shipments));
  } catch (error) {
    throw new Error('Failed to fetch shipments by status');
  }
}