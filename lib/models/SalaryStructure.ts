import mongoose from 'mongoose';

const salaryStructureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  position: { type: String, required: true },
  basicSalary: { type: Number, required: true },
  allowances: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' }
  }],
  deductions: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' }
  }],
  totalSalary: { type: Number, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const SalaryStructure = mongoose.models.SalaryStructure || mongoose.model('SalaryStructure', salaryStructureSchema);