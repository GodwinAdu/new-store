import { Schema, models, model } from 'mongoose';

export interface IIncome {
  description: string;
  amount: number;
  category: string;
  account: Schema.Types.ObjectId;
  date: Date;
  status: 'pending' | 'received' | 'cancelled';
  paymentMethod?: string;
  reference?: string;
  notes?: string;
  createdBy: Schema.Types.ObjectId;
}

const incomeSchema = new Schema<IIncome>({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'received', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: String,
  reference: String,
  notes: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'Staff', required: true }
}, { timestamps: true });

const Income = models.Income ?? model<IIncome>('Income', incomeSchema);

export default Income;