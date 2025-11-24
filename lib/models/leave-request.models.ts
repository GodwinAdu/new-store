import { model, models, Schema } from "mongoose";

const LeaveRequestSchema = new Schema({
  staffId: {
    type: Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  leaveType: {
    type: String,
    enum: ["annual-leave", "sick-leave", "maternity-leave", "paternity-leave", "emergency-leave", "study-leave"],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  days: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
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

const LeaveRequest = models.LeaveRequest || model('LeaveRequest', LeaveRequestSchema);

export default LeaveRequest;