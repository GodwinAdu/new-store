import { Schema, models, model } from 'mongoose';

export interface IAccount {
  name: string;
  type: 'cash' | 'bank' | 'credit' | 'asset' | 'liability' | 'equity';
  balance: number;
  accountNumber?: string;
  bankName?: string;
  status: 'active' | 'inactive' | 'closed';
  description?: string;
}

const accountSchema = new Schema<IAccount>({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['cash', 'bank', 'credit', 'asset', 'liability', 'equity'],
    required: true
  },
  balance: { type: Number, default: 0 },
  accountNumber: String,
  bankName: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'closed'],
    default: 'active'
  },
  description: String
}, { timestamps: true });

const Account = models.Account ?? model<IAccount>('Account', accountSchema);

export default Account;