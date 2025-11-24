import { Schema, models, model } from 'mongoose';

export interface IPurchase {
  supplier: Schema.Types.ObjectId;
  items: Array<{
    product: Schema.Types.ObjectId;
    unit: Schema.Types.ObjectId;
    quantity: number;
    baseQuantity: number;
    unitPrice: number;
    baseUnitPrice: number;
    totalCost: number;
  }>;
  orderType: 'regular' | 'transport' | 'wholesale';
  status: 'pending' | 'ordered' | 'shipped' | 'received' | 'cancelled';
  transportDetails?: {
    carrier: string;
    trackingNumber?: string;
    estimatedDelivery?: Date;
    shippingCost: number;
  };
  wholesaleDetails?: {
    bulkDiscount: number;
    minimumQuantity: number;
    contractNumber?: string;
  };
  subtotal: number;
  shippingCost: number;
  discount: number;
  totalCost: number;
  orderDate: Date;
  receivedDate?: Date;
  notes?: string;
}

const purchaseSchema = new Schema<IPurchase>({
  supplier: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
      quantity: { type: Number, required: true },
      baseQuantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      baseUnitPrice: { type: Number, required: true },
      totalCost: { type: Number, required: true },
    },
  ],
  orderType: {
    type: String,
    enum: ['regular', 'transport', 'wholesale'],
    default: 'regular'
  },
  status: {
    type: String,
    enum: ['pending', 'ordered', 'shipped', 'received', 'cancelled'],
    default: 'pending'
  },
  transportDetails: {
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    shippingCost: { type: Number, default: 0 }
  },
  wholesaleDetails: {
    bulkDiscount: { type: Number, default: 0 },
    minimumQuantity: { type: Number, default: 0 },
    contractNumber: String
  },
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalCost: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  receivedDate: Date,
  notes: String
}, { timestamps: true });

const Purchase = models.Purchase ?? model<IPurchase>('Purchase', purchaseSchema);

export default Purchase;
