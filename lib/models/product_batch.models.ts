// models/ProductBatch.ts
import { Schema, models, model, CallbackError, Model } from 'mongoose';

const productBatchSchema = new Schema<IProductBatch>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  batchNumber: {
    type: String,
    unique: true, // Optional: prevents duplicates if multiple users create same batch
  },
  unitCost: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  remaining: { type: Number, required: true },
  isDepleted: { type: Boolean, default: false },
  depletedAt: { type: Date },
  expiryDate: { type: Date },
  status: { type: String },
  additionalExpenses: { type: Number,default:0 },
  notes: { type: String },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Staff",
    default: null
  },
  modifiedBy: {
    type: Schema.Types.ObjectId,
    ref: "Staff",
    default: null
  },
  del_flag: {
    type: Boolean,
    default: false
  },
  mod_flag: {
    type: Boolean,
    default: false
  },

}, {
  timestamps: true
});
// Pre-save hook to generate batch number
productBatchSchema.pre('save', async function (next) {
  if (this.batchNumber) return next(); // Skip if already set

  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // "07"
  const year = now.getFullYear(); // "2025"

  const startOfMonth = new Date(year, now.getMonth(), 1);
  const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59);

  try {
    const count = await model('ProductBatch').countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const sequence = String(count + 1).padStart(4, '0'); // "0001", "0002", etc.
    this.batchNumber = `BATCH-${month}-${year}-${sequence}`;
    next();
  } catch (err) {
    next(err as CallbackError | undefined);
  }
});

productBatchSchema.index({ product: 1, warehouse: 1, isDepleted: 1, batchNumber: 1 });

type ProductBatchModel = Model<IProductBatch>

const ProductBatch: ProductBatchModel = models.ProductBatch ?? model<IProductBatch>('ProductBatch', productBatchSchema);

export default ProductBatch;
