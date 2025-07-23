import { Schema, model, models } from "mongoose"

const SupplierSchema: Schema = new Schema<ISupplier>(
  {
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    paymentTerms: { type: String, required: true },
    category: { type: String, required: true },
    joinDate: { type: Date, required: true },
    lastOrderDate: { type: Date, required: true },
    website: { type: String },
    taxId: { type: String },
    bankAccount: { type: String },
    creditLimit: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
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
  }, { timestamps: true, }
)

const Supplier = models.Supplier || model<ISupplier>("Supplier", SupplierSchema);

export default Supplier;
