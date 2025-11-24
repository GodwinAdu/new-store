import { model, models, Schema } from "mongoose";

const CashDrawerEventSchema = new Schema({
  type: {
    type: String,
    enum: ['no_sale', 'sale', 'cash_in', 'cash_out', 'count'],
    required: true
  },
  reason: { type: String, required: true },
  amount: { type: Number, default: 0 },
  cashier: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
  warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse" },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String },
  requiresApproval: { type: Boolean, default: false },
  approvedBy: { type: Schema.Types.ObjectId, ref: "Staff" },
  approvedAt: { type: Date }
}, {
  timestamps: true,
  versionKey: false
});

const CashDrawerEvent = models.CashDrawerEvent || model("CashDrawerEvent", CashDrawerEventSchema);
export default CashDrawerEvent;