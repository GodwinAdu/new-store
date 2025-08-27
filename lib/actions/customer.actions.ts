'use server'

import Customer from '@/lib/models/customer.models';
import { connectToDB } from '../mongoose';

export async function getCustomers() {
  try {
    await connectToDB();
    const customers = await Customer.find({ del_flag: false, isActive: true })
      .sort({ lastVisit: -1 })
      .limit(100);
    return JSON.parse(JSON.stringify(customers));
  } catch (error) {
    throw new Error('Failed to fetch customers');
  }
}

export async function createCustomer(data: any) {
  try {
    await connectToDB();
    const customer = await Customer.create(data);
    return JSON.parse(JSON.stringify(customer));
  } catch (error) {
    throw new Error('Failed to create customer');
  }
}

export async function updateCustomerPoints(customerId: string, points: number) {
  try {
    await connectToDB();
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      { 
        $inc: { loyaltyPoints: points },
        lastVisit: new Date()
      },
      { new: true }
    );
    return JSON.parse(JSON.stringify(customer));
  } catch (error) {
    throw new Error('Failed to update customer points');
  }
}