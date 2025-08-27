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
    cashReceived: { type: Number },
    isVoided: { type: Boolean, default: false },
    voidReason: { type: String },
    voidedAt: { type: Date }
  },
  { timestamps: true }
);

saleSchema.index({ warehouse: 1, saleDate: -1 });

// PRE-SAVE: consume batches FIFO
saleSchema.pre('save', async function (next) {
  const sale = this as ISale;

  let totalRevenue = 0;
  let totalCost = 0;

  for (const item of sale.items) {
    let qtyNeeded = item.quantity;
    let costAccum = 0;

    // 1️⃣ pull only active (non‑depleted) batches for this product & warehouse
    const batches = await ProductBatch.find({
      product: item.product,
      warehouse: sale.warehouse,
      isDepleted: false,
      remaining: { $gt: 0 },
    }).sort({ createdAt: 1 });             // FIFO – earliest batch first

    for (const batch of batches) {
      if (qtyNeeded <= 0) break;

      // 2️⃣ take as much as possible from this batch
      const take = Math.min(qtyNeeded, batch.remaining);

      costAccum += take * batch.purchasePrice;
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
      return next(new Error(`Insufficient stock for product ${item.product}`));
    }

    // 4️⃣ record revenue & cost for this line
    item.total = item.unitPrice * item.quantity;
    (item as any).costOfGoods = costAccum;          // add field if you wish

    totalRevenue += item.total;
    totalCost += costAccum;
  }

  // 5️⃣ final sale summaries
  (sale as any).totalRevenue = totalRevenue;        // optional
  (sale as any).totalCost = totalCost;           // optional
  (sale as any).profit = totalRevenue - totalCost;

  next();
});

const Sale = models.Sale ?? model<ISale>('Sale', saleSchema);

export default Sale;
