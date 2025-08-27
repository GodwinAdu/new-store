"use server"

import { type User, withAuth } from "../helpers/auth";
import { connectToDB } from "../mongoose";
import Shipment from "../models/shipment.models";
import Transport from "../models/transport.models";
import Warehouse from "../models/warehouse.models";
import Product from "../models/product.models";
import { revalidatePath } from "next/cache";

interface ShipmentItemProps {
    productId: string;
    quantity: number;
    unitPrice: number;
    batchNumber?: string;
    expiryDate?: Date;
    condition?: "excellent" | "good" | "damaged";
    notes?: string;
}

interface CreateShipmentProps {
    originWarehouse: string;
    destinationWarehouse: string;
    transportId: string;
    items: ShipmentItemProps[];
    scheduledPickupDate: Date;
    estimatedDeliveryDate: Date;
    priority?: "low" | "medium" | "high" | "urgent";
    temperatureRequired?: boolean;
    minTemperature?: number;
    maxTemperature?: number;
    insured?: boolean;
    insuranceValue?: number;
    notes?: string;
}

async function _createShipment(user: User, values: CreateShipmentProps, path: string) {
    try {
        if (!user) throw new Error("User not authenticated");
        
        await connectToDB();
        
        // Generate unique shipment and tracking numbers
        const shipmentNumber = `SH${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const trackingNumber = `TK${Date.now()}${Math.floor(Math.random() * 10000)}`;
        
        // Validate transport and warehouses exist
        const [transport, originWarehouse, destinationWarehouse] = await Promise.all([
            Transport.findById(values.transportId),
            Warehouse.findById(values.originWarehouse),
            Warehouse.findById(values.destinationWarehouse)
        ]);
        
        if (!transport) throw new Error("Transport not found");
        if (!originWarehouse) throw new Error("Origin warehouse not found");
        if (!destinationWarehouse) throw new Error("Destination warehouse not found");
        
        // Calculate total value and prepare items
        let totalValue = 0;
        const processedItems = await Promise.all(
            values.items.map(async (item) => {
                const product = await Product.findById(item.productId);
                if (!product) throw new Error(`Product not found: ${item.productId}`);
                
                const itemTotal = item.quantity * item.unitPrice;
                totalValue += itemTotal;
                
                return {
                    ...item,
                    totalValue: itemTotal
                };
            })
        );
        
        const newShipment = new Shipment({
            shipmentNumber,
            trackingNumber,
            originWarehouse: values.originWarehouse,
            destinationWarehouse: values.destinationWarehouse,
            transportId: values.transportId,
            driverName: transport.driverName,
            driverContact: transport.driverContact,
            items: processedItems,
            totalValue,
            scheduledPickupDate: values.scheduledPickupDate,
            estimatedDeliveryDate: values.estimatedDeliveryDate,
            priority: values.priority || "medium",
            temperatureRequired: values.temperatureRequired || false,
            minTemperature: values.minTemperature,
            maxTemperature: values.maxTemperature,
            insured: values.insured || false,
            insuranceValue: values.insuranceValue,
            createdBy: user._id
        });
        
        await newShipment.save();
        
        // Update transport status to in-use
        await Transport.findByIdAndUpdate(values.transportId, { status: "in-use" });
        
        revalidatePath(path);
        
        return { success: true, shipmentNumber, trackingNumber };
    } catch (error) {
        console.log("Error creating shipment:", error);
        throw error;
    }
}

async function _fetchAllShipments(user: User) {
    try {
        if (!user) throw new Error("User not authorized");
        
        await connectToDB();
        
        const shipments = await Shipment.find({ del_flag: false })
            .populate("originWarehouse", "name location")
            .populate("destinationWarehouse", "name location")
            .populate("transportId", "name vehicleNumber")
            .populate("items.productId", "name sku")
            .populate("createdBy", "fullName")
            .sort({ createdAt: -1 });
            
        return JSON.parse(JSON.stringify(shipments));
    } catch (error) {
        console.log("Error fetching shipments:", error);
        throw error;
    }
}

async function _fetchShipmentById(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authorized");
        
        await connectToDB();
        
        const shipment = await Shipment.findById(id)
            .populate("originWarehouse")
            .populate("destinationWarehouse")
            .populate("transportId")
            .populate("items.productId")
            .populate("createdBy", "fullName")
            .populate("qualityCheck.performedBy", "fullName");
            
        if (!shipment) throw new Error("Shipment not found");
        
        return JSON.parse(JSON.stringify(shipment));
    } catch (error) {
        console.log("Error fetching shipment:", error);
        throw error;
    }
}

async function _updateShipmentStatus(user: User, id: string, status: string, notes?: string) {
    try {
        if (!user) throw new Error("User not authorized");
        
        await connectToDB();
        
        const updateData: any = { 
            status, 
            modifiedBy: user._id,
            mod_flag: true
        };
        
        // Set actual dates based on status
        if (status === "in-transit" && !await Shipment.findOne({ _id: id, actualPickupDate: { $exists: true } })) {
            updateData.actualPickupDate = new Date();
        }
        
        if (status === "delivered") {
            updateData.actualDeliveryDate = new Date();
            updateData.deliveryNotes = notes;
        }
        
        const shipment = await Shipment.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!shipment) throw new Error("Shipment not found");
        
        // Update transport status if delivered
        if (status === "delivered") {
            await Transport.findByIdAndUpdate(shipment.transportId, { status: "available" });
        }
        
        return { success: true };
    } catch (error) {
        console.log("Error updating shipment status:", error);
        throw error;
    }
}

async function _updateShipmentLocation(user: User, id: string, locationData: {
    latitude?: number;
    longitude?: number;
    address?: string;
    notes?: string;
}) {
    try {
        if (!user) throw new Error("User not authorized");
        
        await connectToDB();
        
        const locationUpdate = {
            ...locationData,
            timestamp: new Date(),
            updatedBy: user._id
        };
        
        const shipment = await Shipment.findByIdAndUpdate(
            id,
            {
                currentLocation: locationUpdate,
                $push: { locationHistory: locationUpdate },
                modifiedBy: user._id,
                mod_flag: true
            },
            { new: true }
        );
        
        if (!shipment) throw new Error("Shipment not found");
        
        return { success: true };
    } catch (error) {
        console.log("Error updating shipment location:", error);
        throw error;
    }
}

async function _performQualityCheck(user: User, id: string, qualityData: {
    results: string;
    issues?: string[];
    approved: boolean;
}) {
    try {
        if (!user) throw new Error("User not authorized");
        
        await connectToDB();
        
        const qualityCheck = {
            performed: true,
            performedBy: user._id,
            performedAt: new Date(),
            results: qualityData.results,
            issues: qualityData.issues || [],
            approved: qualityData.approved
        };
        
        const shipment = await Shipment.findByIdAndUpdate(
            id,
            {
                qualityCheck,
                modifiedBy: user._id,
                mod_flag: true
            },
            { new: true }
        );
        
        if (!shipment) throw new Error("Shipment not found");
        
        return { success: true };
    } catch (error) {
        console.log("Error performing quality check:", error);
        throw error;
    }
}

async function _getShipmentsByStatus(user: User, status: string) {
    try {
        if (!user) throw new Error("User not authorized");
        
        await connectToDB();
        
        const shipments = await Shipment.find({ status, del_flag: false })
            .populate("originWarehouse", "name")
            .populate("destinationWarehouse", "name")
            .populate("transportId", "name vehicleNumber")
            .sort({ scheduledPickupDate: 1 });
            
        return JSON.parse(JSON.stringify(shipments));
    } catch (error) {
        console.log("Error fetching shipments by status:", error);
        throw error;
    }
}

async function _getShipmentAnalytics(user: User) {
    try {
        if (!user) throw new Error("User not authorized");
        
        await connectToDB();
        
        const [
            totalShipments,
            pendingShipments,
            inTransitShipments,
            deliveredShipments,
            delayedShipments,
            recentShipments
        ] = await Promise.all([
            Shipment.countDocuments({ del_flag: false }),
            Shipment.countDocuments({ status: "pending", del_flag: false }),
            Shipment.countDocuments({ status: "in-transit", del_flag: false }),
            Shipment.countDocuments({ status: "delivered", del_flag: false }),
            Shipment.countDocuments({ 
                status: { $in: ["delayed", "damaged"] }, 
                del_flag: false 
            }),
            Shipment.find({ del_flag: false })
                .populate("originWarehouse", "name")
                .populate("destinationWarehouse", "name")
                .sort({ createdAt: -1 })
                .limit(5)
        ]);
        
        return {
            totalShipments,
            pendingShipments,
            inTransitShipments,
            deliveredShipments,
            delayedShipments,
            recentShipments: JSON.parse(JSON.stringify(recentShipments))
        };
    } catch (error) {
        console.log("Error fetching shipment analytics:", error);
        throw error;
    }
}

export const createShipment = await withAuth(_createShipment);
export const fetchAllShipments = await withAuth(_fetchAllShipments);
export const fetchShipmentById = await withAuth(_fetchShipmentById);
export const updateShipmentStatus = await withAuth(_updateShipmentStatus);
export const updateShipmentLocation = await withAuth(_updateShipmentLocation);
export const performQualityCheck = await withAuth(_performQualityCheck);
export const getShipmentsByStatus = await withAuth(_getShipmentsByStatus);
export const getShipmentAnalytics = await withAuth(_getShipmentAnalytics);