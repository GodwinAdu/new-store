import { model, models, Schema } from "mongoose";

const SalaryRequestSchema = new Schema({
  staffId: {
    type: Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  requestDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: "Staff",
    default: null,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  del_flag: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const SalaryRequest = models.SalaryRequest || model('SalaryRequest', SalaryRequestSchema);

export default SalaryRequest;