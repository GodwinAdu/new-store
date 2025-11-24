'use server'


import { SalaryStructure } from '@/lib/models/SalaryStructure';
import { Employee } from '@/lib/models/Employee';
import { SalaryPayment } from '@/lib/models/SalaryPayment';
import { connectToDB } from '../mongoose';

// Salary Structure Actions
export async function getSalaryStructures() {
  await connectToDB();
  
  const structures = await SalaryStructure.find().sort({ createdAt: -1 });
  
  // Create sample data if none exists
  if (structures.length === 0) {
    const sampleStructures = [
      {
        title: 'Senior Developer',
        department: 'Engineering',
        position: 'Software Engineer',
        basicSalary: 8000,
        allowances: [
          { name: 'Transport', amount: 500, type: 'fixed' },
          { name: 'Medical', amount: 300, type: 'fixed' }
        ],
        deductions: [
          { name: 'Tax', amount: 800, type: 'fixed' },
          { name: 'Insurance', amount: 200, type: 'fixed' }
        ],
        totalSalary: 7800,
        status: 'active'
      },
      {
        title: 'Sales Manager',
        department: 'Sales',
        position: 'Manager',
        basicSalary: 6000,
        allowances: [
          { name: 'Commission', amount: 1000, type: 'fixed' },
          { name: 'Transport', amount: 400, type: 'fixed' }
        ],
        deductions: [
          { name: 'Tax', amount: 600, type: 'fixed' },
          { name: 'Insurance', amount: 150, type: 'fixed' }
        ],
        totalSalary: 6650,
        status: 'active'
      }
    ];
    
    await SalaryStructure.insertMany(sampleStructures);
    return await SalaryStructure.find().sort({ createdAt: -1 });
  }
  
  return structures;
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
  
  const employees = await Employee.find().populate('salaryStructure').sort({ createdAt: -1 });
  
  // Create sample data if none exists
  if (employees.length === 0) {
    const structures = await SalaryStructure.find();
    if (structures.length > 0) {
      const sampleEmployees = [
        {
          employeeId: 'EMP001',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@company.com',
          phone: '+1234567890',
          department: 'Engineering',
          position: 'Software Engineer',
          hireDate: new Date('2023-01-15'),
          salaryStructure: structures[0]._id,
          bankAccount: {
            accountNumber: '1234567890',
            bankName: 'First Bank',
            accountHolder: 'John Doe'
          },
          status: 'active'
        },
        {
          employeeId: 'EMP002',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@company.com',
          phone: '+1234567891',
          department: 'Sales',
          position: 'Manager',
          hireDate: new Date('2023-03-01'),
          salaryStructure: structures[1]._id,
          bankAccount: {
            accountNumber: '0987654321',
            bankName: 'Second Bank',
            accountHolder: 'Jane Smith'
          },
          status: 'active'
        }
      ];
      
      await Employee.insertMany(sampleEmployees);
      return await Employee.find().populate('salaryStructure').sort({ createdAt: -1 });
    }
  }
  
  return employees;
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