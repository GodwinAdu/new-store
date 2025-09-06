import { Schema, models, model } from 'mongoose';

export interface IStockTransfer {
  transferNumber: string;
  fromWarehouse: Schema.Types.ObjectId;
  toWarehouse: Schema.Types.ObjectId;
  items: Array<{
    product: Schema.Types.ObjectId;
    quantity: number;
    unitCost: number;
  }>;
  status: 'pending' | 'in-transit' | 'completed' | 'cancelled';
  requestedBy: Schema.Types.ObjectId;
  approvedBy?: Schema.Types.ObjectId;
  shipment?: Schema.Types.ObjectId;
  transferDate: Date;
  completedDate?: Date;
  notes?: string;
  reason: string;
}

const stockTransferSchema = new Schema<IStockTransfer>({
  transferNumber: { type: String, required: true, unique: true },
  fromWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  toWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true }
  }],
  status: {
    type: String,
    enum: ['pending', 'in-transit', 'completed', 'cancelled'],
    default: 'pending'
  },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Staff' },
  shipment: { type: Schema.Types.ObjectId, ref: 'Shipment' },
  transferDate: { type: Date, default: Date.now },
  completedDate: Date,
  notes: String,
  reason: { type: String, required: true }
}, { timestamps: true });

const StockTransfer = models.StockTransfer ?? model<IStockTransfer>('StockTransfer', stockTransferSchema);

export default StockTransfer;