'use server'


import { SalaryStructure } from '@/lib/models/SalaryStructure';
import { Employee } from '@/lib/models/Employee';
import { SalaryPayment } from '@/lib/models/SalaryPayment';
import { connectToDB } from '../mongoose';

// Salary Structure Actions
export async function getSalaryStructures() {
  await connectToDB();
  return await SalaryStructure.find().sort({ createdAt: -1 });
}

export async function createSalaryStructure(data: any) {
  await connectToDB();
  const totalSalary = data.basicSalary + 
    data.allowances.reduce((sum: number, allowance: any) => sum + allowance.amount, 0) -
    data.deductions.reduce((sum: number, deduction: any) => sum + deduction.amount, 0);
  
  return await SalaryStructure.create({ ...data, totalSalary });
}

export async function updateSalaryStructure(id: string, data: any) {
  await connectToDB();
  const totalSalary = data.basicSalary + 
    data.allowances.reduce((sum: number, allowance: any) => sum + allowance.amount, 0) -
    data.deductions.reduce((sum: number, deduction: any) => sum + deduction.amount, 0);
  
  return await SalaryStructure.findByIdAndUpdate(id, { ...data, totalSalary, updatedAt: new Date() }, { new: true });
}

export async function deleteSalaryStructure(id: string) {
  await connectToDB();
  return await SalaryStructure.findByIdAndDelete(id);
}

// Employee Actions
export async function getEmployees() {
  await connectToDB();
  return await Employee.find().populate('salaryStructure').sort({ createdAt: -1 });
}

export async function createEmployee(data: any) {
  await connectToDB();
  return await Employee.create(data);
}

export async function updateEmployee(id: string, data: any) {
  await connectToDB();
  return await Employee.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
}

export async function assignSalaryStructure(employeeId: string, salaryStructureId: string) {
  await connectToDB();
  return await Employee.findByIdAndUpdate(employeeId, { salaryStructure: salaryStructureId, updatedAt: new Date() }, { new: true });
}

// Salary Payment Actions
export async function getSalaryPayments() {
  await connectToDB();
  return await SalaryPayment.find().populate('employee').sort({ createdAt: -1 });
}

export async function createSalaryPayment(data: any) {
  await connectToDB();
  const totalAllowances = data.allowances.reduce((sum: number, allowance: any) => sum + allowance.amount, 0);
  const totalDeductions = data.deductions.reduce((sum: number, deduction: any) => sum + deduction.amount, 0);
  const grossSalary = data.basicSalary + totalAllowances;
  const netSalary = grossSalary - totalDeductions;
  
  return await SalaryPayment.create({
    ...data,
    totalAllowances,
    totalDeductions,
    grossSalary,
    netSalary
  });
}

export async function updateSalaryPayment(id: string, data: any) {
  await connectToDB();
  return await SalaryPayment.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
}

export async function processSalaryPayment(id: string) {
  await connectToDB();
  return await SalaryPayment.findByIdAndUpdate(id, { 
    status: 'paid', 
    paymentDate: new Date(),
    updatedAt: new Date() 
  }, { new: true });
}

export async function generateMonthlyPayroll(month: number, year: number) {
  await connectToDB();
  const employees = await Employee.find({ status: 'active' }).populate('salaryStructure');
  
  const payrollData = [];
  for (const employee of employees) {
    if (!employee.salaryStructure) continue;
    
    const existingPayment = await SalaryPayment.findOne({
      employee: employee._id,
      'payPeriod.month': month,
      'payPeriod.year': year
    });
    
    if (existingPayment) continue;
    
    const structure = employee.salaryStructure;
    const totalAllowances = structure.allowances.reduce((sum: number, allowance: any) => sum + allowance.amount, 0);
    const totalDeductions = structure.deductions.reduce((sum: number, deduction: any) => sum + deduction.amount, 0);
    const grossSalary = structure.basicSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;
    
    const payment = await SalaryPayment.create({
      employee: employee._id,
      payPeriod: { month, year },
      basicSalary: structure.basicSalary,
      allowances: structure.allowances,
      deductions: structure.deductions,
      totalAllowances,
      totalDeductions,
      grossSalary,
      netSalary,
      status: 'pending'
    });
    
    payrollData.push(payment);
  }
  
  return payrollData;
}