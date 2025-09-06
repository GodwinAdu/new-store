import { Schema, models, model } from 'mongoose';

export interface IShipment {
  trackingNumber: string;
  origin: string;
  destination: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  estimatedDelivery: Date;
  actualDelivery?: Date;
  items: Array<{
    product: Schema.Types.ObjectId;
    quantity: number;
  }>;
  vehicle?: Schema.Types.ObjectId;
  driver?: string;
  notes?: string;
}

const shipmentSchema = new Schema<IShipment>({
  trackingNumber: { type: String, required: true, unique: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  estimatedDelivery: { type: Date, required: true },
  actualDelivery: Date,
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true }
  }],
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
  driver: String,
  notes: String
}, { timestamps: true });

const Shipment = models.Shipment ?? model<IShipment>('Shipment', shipmentSchema);

export default Shipment;