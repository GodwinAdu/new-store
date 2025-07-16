// models/ProductBatch.ts
import { Schema, models, model } from 'mongoose';

const productBatchSchema = new Schema<IProductBatch>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  purchasePrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  remaining: { type: Number, required: true },
  isDepleted: { type: Boolean, default: false },   // NEW
  depletedAt: { type: Date },
  expiryDate: { type: Date },
}, {
  timestamps: true
});

productBatchSchema.index({ product: 1, warehouse: 1, isDepleted: 1 });


const ProductBatch = models.ProductBatch ?? model<IProductBatch>('ProductBatch', productBatchSchema);

export default ProductBatch;
