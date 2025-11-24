import { model, models, Schema } from "mongoose";

const AwardSchema = new Schema({
  staffId: {
    type: Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  awardDate: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  del_flag: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Award = models.Award || model('Award', AwardSchema);

export default Award;