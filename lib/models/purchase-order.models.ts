import { Schema, models, model } from 'mongoose';

export interface IPurchaseOrder {
  orderNumber: string;
  supplier: Schema.Types.ObjectId;
  warehouse: Schema.Types.ObjectId;
  items: Array<{
    product: Schema.Types.ObjectId;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalCost: number;
  orderDate: Date;
  expectedDelivery?: Date;
  receivedDate?: Date;
  notes?: string;
  approvedBy?: Schema.Types.ObjectId;
  approvedAt?: Date;
  createdBy: Schema.Types.ObjectId;
}

const purchaseOrderSchema = new Schema<IPurchaseOrder>({
  orderNumber: { type: String, required: true, unique: true },
  supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
  warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    totalCost: { type: Number, required: true }
  }],
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'ordered', 'received', 'cancelled'],
    default: 'draft'
  },
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  totalCost: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  expectedDelivery: Date,
  receivedDate: Date,
  notes: String,
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Staff' },
  approvedAt: Date,
  createdBy: { type: Schema.Types.ObjectId, ref: 'Staff', required: true }
}, { timestamps: true });

// Auto-generate order number
purchaseOrderSchema.pre('save', async function(next) {
  if (this.orderNumber) return ;
  
  const count = await model('PurchaseOrder').countDocuments();
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  this.orderNumber = `PO-${year}${month}-${String(count + 1).padStart(4, '0')}`;
 ;
});

const PurchaseOrder = models.PurchaseOrder ?? model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);

export default PurchaseOrder;
