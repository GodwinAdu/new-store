import { model, models, Schema } from "mongoose";

const ShipmentItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalValue: { type: Number, required: true },
    batchNumber: { type: String },
    expiryDate: { type: Date },
    condition: { type: String, enum: ["excellent", "good", "damaged"], default: "excellent" },
    notes: { type: String }
});

const LocationUpdateSchema = new Schema({
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Staff" },
    notes: { type: String }
});

const ShipmentSchema = new Schema({
    shipmentNumber: { type: String, required: true, unique: true },
    trackingNumber: { type: String, required: true, unique: true },
    
    // Origin and Destination
    originWarehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    destinationWarehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    
    // Transport Details
    transportId: { type: Schema.Types.ObjectId, ref: "Transport", required: true },
    driverName: { type: String, required: true },
    driverContact: { type: String, required: true },
    
    // Shipment Items
    items: [ShipmentItemSchema],
    totalValue: { type: Number, required: true },
    totalWeight: { type: Number },
    totalVolume: { type: Number },
    
    // Status and Timeline
    status: {
        type: String,
        enum: ["pending", "in-transit", "delivered", "cancelled", "delayed", "damaged"],
        default: "pending"
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: "medium"
    },
    
    // Dates
    scheduledPickupDate: { type: Date, required: true },
    actualPickupDate: { type: Date },
    estimatedDeliveryDate: { type: Date, required: true },
    actualDeliveryDate: { type: Date },
    
    // Location Tracking
    currentLocation: LocationUpdateSchema,
    locationHistory: [LocationUpdateSchema],
    
    // Temperature and Conditions (for sensitive goods)
    temperatureRequired: { type: Boolean, default: false },
    minTemperature: { type: Number },
    maxTemperature: { type: Number },
    currentTemperature: { type: Number },
    humidity: { type: Number },
    
    // Documents and Photos
    documents: [{
        name: { type: String },
        url: { type: String },
        type: { type: String },
        uploadedAt: { type: Date, default: Date.now }
    }],
    photos: [{
        url: { type: String },
        description: { type: String },
        takenAt: { type: Date, default: Date.now },
        location: { type: String }
    }],
    
    // Delivery Information
    receivedBy: { type: String },
    receivedAt: { type: Date },
    deliveryNotes: { type: String },
    signature: { type: String }, // Base64 encoded signature
    
    // Quality Control
    qualityCheck: {
        performed: { type: Boolean, default: false },
        performedBy: { type: Schema.Types.ObjectId, ref: "Staff" },
        performedAt: { type: Date },
        results: { type: String },
        issues: [{ type: String }],
        approved: { type: Boolean, default: false }
    },
    
    // Insurance and Risk
    insured: { type: Boolean, default: false },
    insuranceValue: { type: Number },
    riskLevel: { type: String, enum: ["low", "medium", "high"], default: "low" },
    
    // Notifications
    notifications: [{
        type: { type: String },
        message: { type: String },
        sentAt: { type: Date, default: Date.now },
        recipients: [{ type: String }]
    }],
    
    // System Fields
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Staff" },
    del_flag: { type: Boolean, default: false },
    mod_flag: { type: Boolean, default: false }
}, {
    timestamps: true,
    versionKey: false
});

// Indexes for better performance
ShipmentSchema.index({ shipmentNumber: 1 });
ShipmentSchema.index({ trackingNumber: 1 });
ShipmentSchema.index({ status: 1 });
ShipmentSchema.index({ originWarehouse: 1, destinationWarehouse: 1 });
ShipmentSchema.index({ scheduledPickupDate: 1 });
ShipmentSchema.index({ estimatedDeliveryDate: 1 });

const Shipment = models.Shipment ?? model("Shipment", ShipmentSchema);

export default Shipment;