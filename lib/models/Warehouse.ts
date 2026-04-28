import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },
  capacity: { type: Number, required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  type: { type: String, enum: ['main', 'secondary', 'cold', 'frozen', 'distribution'], default: 'main' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Warehouse = mongoose.models.Warehouse || mongoose.model('Warehouse', warehouseSchema);