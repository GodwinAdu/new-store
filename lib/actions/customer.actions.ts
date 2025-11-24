'use server'

import { connectToDB } from '../mongoose'
import Customer from '../models/customer.models'

export async function getCustomers() {
  try {
    await connectToDB()
    const customers = await Customer.find({ 
      del_flag: false, 
      isActive: true 
    }).sort({ lastVisit: -1 })
    
    return JSON.parse(JSON.stringify(customers))
  } catch (error) {
    throw new Error('Failed to fetch customers')
  }
}

export async function createCustomer(customerData: {
  name: string
  email?: string
  phone?: string
  address?: string
  birthday?: string
  notes?: string
  preferences?: string[]
}) {
  try {
    await connectToDB()
    
    const customer = await Customer.create({
      ...customerData,
      birthday: customerData.birthday ? new Date(customerData.birthday) : undefined,
      createdBy: '68967efe1f4c5f60921bc7d9' // Default staff ID
    })
    
    return JSON.parse(JSON.stringify(customer))
  } catch (error) {
    throw new Error('Failed to create customer')
  }
}

export async function updateCustomer(customerId: string, updateData: {
  name?: string
  email?: string
  phone?: string
  address?: string
  birthday?: string
  notes?: string
  preferences?: string[]
}) {
  try {
    await connectToDB()
    
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      {
        ...updateData,
        birthday: updateData.birthday ? new Date(updateData.birthday) : undefined,
        lastVisit: new Date()
      },
      { new: true }
    )
    
    return JSON.parse(JSON.stringify(customer))
  } catch (error) {
    throw new Error('Failed to update customer')
  }
}

export async function updateCustomerPoints(customerId: string, points: number) {
  try {
    await connectToDB()
    
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      { 
        $inc: { loyaltyPoints: points },
        lastVisit: new Date()
      },
      { new: true }
    )
    
    // Update tier based on total spent
    if (customer) {
      let newTier = 'bronze'
      if (customer.totalSpent >= 5000) newTier = 'platinum'
      else if (customer.totalSpent >= 2000) newTier = 'gold'
      else if (customer.totalSpent >= 500) newTier = 'silver'
      
      if (newTier !== customer.tier) {
        await Customer.findByIdAndUpdate(customerId, { tier: newTier })
      }
    }
    
    return JSON.parse(JSON.stringify(customer))
  } catch (error) {
    throw new Error('Failed to update customer points')
  }
}

export async function deleteCustomer(customerId: string) {
  try {
    await connectToDB()
    
    await Customer.findByIdAndUpdate(customerId, { 
      del_flag: true,
      isActive: false 
    })
    
    return { success: true }
  } catch (error) {
    throw new Error('Failed to delete customer')
  }
}

export async function getCustomerStats() {
  try {
    await connectToDB()
    
    const customers = await Customer.find({ del_flag: false, isActive: true })
    
    const totalCustomers = customers.length
    const loyaltyMembers = customers.filter(c => c.loyaltyPoints > 0).length
    const avgSpent = customers.length > 0 
      ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length 
      : 0
    const vipCustomers = customers.filter(c => c.tier === 'gold' || c.tier === 'platinum').length
    
    return {
      totalCustomers,
      loyaltyMembers,
      avgSpent,
      vipCustomers
    }
  } catch (error) {
    throw new Error('Failed to fetch customer stats')
  }
}