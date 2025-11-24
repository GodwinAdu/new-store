'use server'

import Vehicle from '@/lib/models/vehicle.models';
import Shipment from '@/lib/models/shipment.models';
import { Warehouse } from '@/lib/models/Warehouse';
import { connectToDB } from '../mongoose';
import Product from '@/lib/models/product.models';
import Purchase from '@/lib/models/purchase.models';

export async function getVehicles() {
  try {
    await connectToDB();

   const vehicles = await Vehicle.find().sort({ createdAt: -1 });

    // If no vehicles exist, create sample data
    if (vehicles.length === 0) {
      return []
    }

    console.log(vehicles, "vehicles log")

    return JSON.parse(JSON.stringify(vehicles));
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
}

export async function getShipments() {
  try {
    await connectToDB();

    const shipments = await Shipment.find()
      .populate([
        { path: 'items.product', model: Product, select: 'name sku' },
        { path: 'vehicle', model: Vehicle, select: 'plateNumber type' },
        { path: 'purchaseOrder', model: Purchase, select: 'orderNumber' },
        { path: 'destinationWarehouse', model: Warehouse, select: 'name location' },
      ])
      .sort({ createdAt: -1 });

    return JSON.parse(JSON.stringify(shipments));
  } catch (error) {
    throw new Error('Failed to fetch shipments');
  }
}

export async function getWarehouses() {
  try {
    await connectToDB();

    const warehouses = await Warehouse.find().sort({ createdAt: -1 });

    // If no warehouses exist, create sample data
    if (warehouses.length === 0) {
      return []
    }

    return JSON.parse(JSON.stringify(warehouses));
  } catch (error) {
    throw new Error('Failed to fetch warehouses');
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
      nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: 'available'
    });

    return JSON.parse(JSON.stringify(vehicle));
  } catch (error) {
    throw new Error('Failed to create vehicle');
  }
}

export async function createWarehouse(warehouseData: {
  name: string;
  location: string;
  address: string;
  manager: string;
  phone: string;
  capacity: number;
}) {
  try {
    await connectToDB();

    const warehouse = await Warehouse.create(warehouseData);

    return JSON.parse(JSON.stringify(warehouse));
  } catch (error) {
    throw new Error('Failed to create warehouse');
  }
}

export async function createShipment(shipmentData: {
  purchaseOrderId: string;
  supplier: string;
  destinationWarehouseId: string;
  estimatedDelivery: Date;
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
  driver: string;
  vehicleId: string;
}) {
  try {
    console.log('createShipment called with data:', shipmentData);
    await connectToDB();

    const trackingNumber = `SH${Date.now().toString().slice(-6)}`;
    const totalValue = shipmentData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    console.log('Generated tracking number:', trackingNumber);
    console.log('Total value:', totalValue);

    // Update vehicle status to in-transit
    if (shipmentData.vehicleId) {
      console.log('Updating vehicle status for:', shipmentData.vehicleId);
      await Vehicle.findByIdAndUpdate(shipmentData.vehicleId, {
        status: 'in-transit'
      });
    }

    const shipmentPayload = {
      trackingNumber,
      purchaseOrder: shipmentData.purchaseOrderId,
      supplier: shipmentData.supplier,
      destinationWarehouse: shipmentData.destinationWarehouseId,
      estimatedDelivery: shipmentData.estimatedDelivery,
      items: shipmentData.items.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        receivedQuantity: 0
      })),
      totalValue,
      driver: shipmentData.driver,
      vehicle: shipmentData.vehicleId,
      status: 'pending'
    };

    console.log('Creating shipment with payload:', shipmentPayload);

    const shipment = await Shipment.create(shipmentPayload);

    console.log('Shipment created successfully:', shipment._id);

    return JSON.parse(JSON.stringify(shipment));
  } catch (error) {
    console.error('Error in createShipment:', error);
    throw new Error(`Failed to create shipment: ${error}`);
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
    
    // Update vehicle status based on shipment status
    if (shipment && shipment.vehicle) {
      let vehicleStatus = 'available';
      
      if (status === 'in-transit') {
        vehicleStatus = 'in-transit';
      } else if (status === 'delivered' || status === 'received') {
        vehicleStatus = 'available';
      }
      
      await Vehicle.findByIdAndUpdate(shipment.vehicle, {
        status: vehicleStatus
      });
    }

    return JSON.parse(JSON.stringify(shipment));
  } catch (error) {
    throw new Error('Failed to update shipment status');
  }
}

export async function receiveShipment(shipmentId: string, receivedItems: Array<{ 
  productId: string; 
  receivedQuantity: number;
  sellingPrice?: number;
  expiryDate?: Date;
}>) {
  try {
    await connectToDB();

    const shipment = await Shipment.findById(shipmentId).populate([{path:'purchaseOrder',model:Purchase}]);
    if (!shipment) throw new Error('Shipment not found');

    // Create product batches for received items at destination warehouse
    const ProductBatch = (await import('@/lib/models/product_batch.models')).default;
    for (const receivedItem of receivedItems) {
      const originalItem = shipment.items.find(item => 
        item.product.toString() === receivedItem.productId
      );
      
      if (originalItem) {
        await ProductBatch.create({
          product: receivedItem.productId,
          warehouseId: shipment.destinationWarehouse, // Store in destination warehouse
          quantity: receivedItem.receivedQuantity,
          remaining: receivedItem.receivedQuantity,
          unitCost: originalItem.unitPrice,
          sellingPrice: receivedItem.sellingPrice || originalItem.unitPrice * 1.3, // User-defined or 30% markup
          expiryDate: receivedItem.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // User-defined or 1 year default
          isDepleted: false
        });
      }
    }

    // Update product inventory
    const Product = (await import('@/lib/models/product.models')).default;
    for (const receivedItem of receivedItems) {
      await Product.findByIdAndUpdate(receivedItem.productId, {
        $inc: { stock: receivedItem.receivedQuantity }
      });
    }

    // Update related purchase order status
    if (shipment.purchaseOrder) {
      const Purchase = (await import('@/lib/models/purchase.models')).default;
      await Purchase.findByIdAndUpdate(shipment.purchaseOrder, {
        status: 'received',
        receivedDate: new Date()
      });
    }

    // Make vehicle available
    if (shipment.vehicle) {
      await Vehicle.findByIdAndUpdate(shipment.vehicle, {
        status: 'available'
      });
    }

    // Delete the shipment after successful receipt
    await Shipment.findByIdAndDelete(shipmentId);

    return { success: true, message: 'Shipment received and processed successfully' };
  } catch (error) {
    console.error('Error in receiveShipment:', error);
    throw new Error(`Failed to receive shipment: ${error}`);
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

export async function updateVehicle(vehicleId: string, updateData: any) {
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

export async function getTransportStats() {
  try {
    await connectToDB();

    const [vehicles, shipments, warehouses] = await Promise.all([
      Vehicle.find(),
      Shipment.find(),
      Warehouse.find()
    ]);

    const vehicleStats = {
      total: vehicles.length,
      available: vehicles.filter(v => v.status === 'available').length,
      inTransit: vehicles.filter(v => v.status === 'in-transit').length,
      maintenance: vehicles.filter(v => v.status === 'maintenance').length
    };

    const shipmentStats = {
      total: shipments.length,
      pending: shipments.filter(s => s.status === 'pending').length,
      inTransit: shipments.filter(s => s.status === 'in-transit').length,
      delivered: shipments.filter(s => s.status === 'delivered').length,
      overdue: shipments.filter(s => {
        const eta = new Date(s.estimatedDelivery);
        return new Date() > eta && s.status !== 'delivered';
      }).length
    };

    return {
      vehicles: vehicleStats,
      shipments: shipmentStats,
      warehouses: warehouses.length
    };
  } catch (error) {
    throw new Error('Failed to fetch transport statistics');
  }
}