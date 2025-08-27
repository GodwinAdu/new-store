import { model, models, Schema } from "mongoose";

const CustomerSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: [2, "Name must be at least 2 characters."],
  },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  loyaltyPoints: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  tier: { 
    type: String, 
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  notes: { type: String },
  birthday: { type: Date },
  preferences: [{ type: String }],
  isActive: { type: Boolean, default: true },
  lastVisit: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: "Staff", default: null },
  del_flag: { type: Boolean, default: false }
}, {
  timestamps: true,
  versionKey: false
});

const Customer = models.Customer || model("Customer", CustomerSchema);
export default Customer;