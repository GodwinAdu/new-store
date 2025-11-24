import { Schema, models, model } from 'mongoose';

export interface IShipment {
  trackingNumber: string;
  purchaseOrder: Schema.Types.ObjectId;
  supplier: string;
  destinationWarehouse: Schema.Types.ObjectId;
  status: 'pending' | 'loaded' | 'in-transit' | 'delivered' | 'received';
  loadedDate: Date;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  items: Array<{
    product: Schema.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    receivedQuantity: number;
  }>;
  totalValue: number;
  vehicle: Schema.Types.ObjectId;
  driver: string;
  notes?: string;
}

const shipmentSchema = new Schema<IShipment>({
  trackingNumber: { type: String, required: true, unique: true },
  purchaseOrder: { type: Schema.Types.ObjectId, ref: 'Purchase' },
  supplier: { type: String, required: true },
  destinationWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  status: {
    type: String,
    enum: ['pending', 'loaded', 'in-transit', 'delivered', 'received'],
    default: 'pending'
  },
  loadedDate: { type: Date, default: Date.now },
  estimatedDelivery: { type: Date, required: true },
  actualDelivery: Date,
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    receivedQuantity: { type: Number, default: 0 }
  }],
  totalValue: { type: Number, default: 0 },
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  driver: { type: String, required: true },
  notes: String
}, { timestamps: true });

const Shipment = models.Shipment ?? model<IShipment>('Shipment', shipmentSchema);

export default Shipment;