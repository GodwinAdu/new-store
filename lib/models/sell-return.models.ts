import mongoose from 'mongoose';

const sellReturnSchema = new mongoose.Schema({
  originalSale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  }],
  refundAmount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['Defective', 'Wrong Item', 'Customer Request', 'Damaged', 'Expired', 'Other']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected'],
    default: 'pending'
  },
  returnDate: {
    type: Date,
    default: Date.now
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
}, {
  timestamps: true
});

const SellReturn = mongoose.models.SellReturn || mongoose.model('SellReturn', sellReturnSchema);

export default SellReturn;