import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  address: { type: String, required: true },
  manager: { type: String, required: true },
  phone: { type: String, required: true },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Warehouse = mongoose.models.Warehouse || mongoose.model('Warehouse', warehouseSchema);