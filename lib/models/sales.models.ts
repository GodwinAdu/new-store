// models/Sale.ts

import { Schema, Document, models, model } from 'mongoose';
import ProductBatch from './product_batch.models';

export interface ISaleItem {
  product: Schema.Types.ObjectId;   // ref: Product
  quantity: number;          // units sold
  unitPrice: number;         // selling price per unit
  total?: number;            // auto‑calculated (quantity * unitPrice)
  costOfGoods?: number;      // auto‑calculated from batches
}

export interface ISale extends Document {
  warehouse: Schema.Types.ObjectId; // ref: Warehouse
  items: ISaleItem[];
  totalRevenue?: number;     // Σ line totals
  totalCost?: number;        // Σ costOfGoods
  profit?: number;           // totalRevenue – totalCost
  saleDate: Date;
  paymentMethod?: string;
  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;            // Final total amount
  cashReceived?: number;
  cashier?: Schema.Types.ObjectId;
  
  // Payment Verification Fields
  paymentStatus?: 'pending' | 'verified' | 'rejected' | 'completed';
  verificationCode?: string;
  verifiedBy?: Schema.Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
  
  modifiedBy?: Schema.Types.ObjectId;
  modificationHistory?: Array<{
    modifiedBy: Schema.Types.ObjectId;
    modifiedAt: Date;
    changes: any;
    reason?: string;
  }>;
  isVoided?: boolean;
  voidReason?: string;
  voidedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const saleSchema = new Schema<ISale>(
  {
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        total: Number,
        costOfGoods: Number,
      },
    ],
    totalRevenue: Number,
    totalCost: Number,
    profit: Number,
    saleDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, enum: ['cash', 'card', 'mobile'], default: 'cash' },
    subtotal: { type: Number },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number },
    cashReceived: { type: Number },
    cashier: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
    
    // Payment Verification
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'verified', 'rejected', 'completed'], 
      default: 'pending' 
    },
    verificationCode: { type: String, sparse: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "Staff" },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
    
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Staff" },
    modificationHistory: [{
      modifiedBy: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
      modifiedAt: { type: Date, default: Date.now },
      changes: { type: Schema.Types.Mixed },
      reason: { type: String }
    }],
    isVoided: { type: Boolean, default: false },
    voidReason: { type: String },
    voidedAt: { type: Date }
  },
  { timestamps: true }
);

saleSchema.index({ warehouse: 1, saleDate: -1 });
saleSchema.index({ verificationCode: 1 }, { unique: true, sparse: true });
saleSchema.index({ paymentStatus: 1, saleDate: -1 });

// Generate unique verification code and consume batches FIFO before save
saleSchema.pre('save', async function () {
  const sale = this as ISale;
  
  // Generate verification code if not exists
  if (!sale.verificationCode) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    sale.verificationCode = `VRF-${timestamp}-${random}`;
  }

  let totalRevenue = 0;
  let totalCost = 0;

  for (const item of sale.items) {
    let qtyNeeded = item.quantity;
    let costAccum = 0;

    // 1️⃣ pull only active (non‑depleted) batches for this product & warehouse
    const batches = await ProductBatch.find({
      product: item.product,
      warehouseId: sale.warehouse,
      isDepleted: false,
      remaining: { $gt: 0 },
    }).sort({ createdAt: 1 });             // FIFO – earliest batch first

    for (const batch of batches) {
      if (qtyNeeded <= 0) break;

      // 2️⃣ take as much as possible from this batch
      const take = Math.min(qtyNeeded, batch.remaining);

      costAccum += take * (batch.unitCost || 0);
      batch.remaining -= take;
      qtyNeeded -= take;

      // 3️⃣ flag batch as depleted if empty
      if (batch.remaining === 0) {
        batch.isDepleted = true;
        batch.depletedAt = new Date();
      }
      await batch.save();
    }

    if (qtyNeeded > 0) {
      // not enough stock overall – abort save
      throw new Error(`Insufficient stock for product ${item.product}`);
    }

    // 4️⃣ record revenue & cost for this line
    item.total = item.unitPrice * item.quantity;
    item.costOfGoods = costAccum;

    totalRevenue += item.total;
    totalCost += costAccum;
  }

  // 5️⃣ final sale summaries
  sale.totalRevenue = totalRevenue;
  sale.totalCost = totalCost;
  sale.profit = totalRevenue - totalCost;
});

const Sale = models.Sale ?? model<ISale>('Sale', saleSchema);

export default Sale;
