'use server'

import { connectToDB } from '../mongoose';
import Supplier from '../models/supplier.models';
import { currentUser } from '../helpers/session';


export async function createSupplier(supplierData: {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  category: string;
  paymentTerms: string;
  website?: string;
  taxId?: string;
  bankAccount?: string;
  creditLimit?: number;
}) {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');

    await connectToDB();

    // Check if email already exists
    const existingSupplier = await Supplier.findOne({ email: supplierData.email });
    if (existingSupplier) {
      throw new Error('Email already exists');
    }

    const supplier = await Supplier.create({
      ...supplierData,
      joinDate: new Date(),
      lastOrderDate: new Date(),
      creditLimit: supplierData.creditLimit || 0,
      createdBy: user._id,
    });

    return JSON.parse(JSON.stringify(supplier));
  } catch (error) {
    throw new Error(`Failed to create supplier: ${error}`);
  }
}

export async function getAllSuppliers() {
  try {
    await connectToDB();
    
    const suppliers = await Supplier.find({ del_flag: false })
      .populate('createdBy', 'fullName')
      .populate('modifiedBy', 'fullName')
      .sort({ createdAt: -1 });

    const formattedSuppliers = suppliers.map((supplier: any) => ({
      id: supplier._id.toString(),
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      city: supplier.city,
      country: supplier.country,
      status: supplier.status,
      rating: supplier.rating,
      totalOrders: supplier.totalOrders,
      totalSpent: supplier.totalSpent,
      paymentTerms: supplier.paymentTerms,
      category: supplier.category,
      joinDate: new Date(supplier.joinDate).toLocaleDateString(),
      lastOrderDate: new Date(supplier.lastOrderDate).toLocaleDateString(),
      website: supplier.website,
      taxId: supplier.taxId,
      bankAccount: supplier.bankAccount,
      creditLimit: supplier.creditLimit,
      currentBalance: supplier.currentBalance,
      createdAt: new Date(supplier.createdAt).toLocaleDateString(),
    }));

    return formattedSuppliers;
  } catch (error) {
    throw new Error('Failed to fetch suppliers');
  }
}

export async function getSupplierById(supplierId: string) {
  try {
    await connectToDB();
    
    const supplier = await Supplier.findById(supplierId)
      .populate('createdBy', 'fullName')
      .populate('modifiedBy', 'fullName');

    if (!supplier || supplier.del_flag) {
      throw new Error('Supplier not found');
    }

    return JSON.parse(JSON.stringify(supplier));
  } catch (error) {
    throw new Error('Failed to fetch supplier');
  }
}

export async function updateSupplier(supplierId: string, updateData: {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  status?: string;
  category?: string;
  paymentTerms?: string;
  website?: string;
  taxId?: string;
  bankAccount?: string;
  creditLimit?: number;
}) {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');

    await connectToDB();

    // Check if email exists for other suppliers
    if (updateData.email) {
      const existingSupplier = await Supplier.findOne({ 
        email: updateData.email, 
        _id: { $ne: supplierId } 
      });
      if (existingSupplier) {
        throw new Error('Email already exists');
      }
    }

    const supplier = await Supplier.findByIdAndUpdate(
      supplierId,
      {
        ...updateData,
        modifiedBy: user._id,
        mod_flag: true,
      },
      { new: true }
    );

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    return JSON.parse(JSON.stringify(supplier));
  } catch (error) {
    throw new Error(`Failed to update supplier: ${error}`);
  }
}

export async function deleteSupplier(supplierId: string) {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');

    await connectToDB();

    const supplier = await Supplier.findByIdAndUpdate(
      supplierId,
      {
        del_flag: true,
        modifiedBy: user._id,
      },
      { new: true }
    );

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    return { success: true };
  } catch (error) {
    throw new Error('Failed to delete supplier');
  }
}

export async function getSupplierStats() {
  try {
    await connectToDB();
    
    const totalSuppliers = await Supplier.countDocuments({ del_flag: false });
    const activeSuppliers = await Supplier.countDocuments({ del_flag: false, status: 'active' });
    const pendingSuppliers = await Supplier.countDocuments({ del_flag: false, status: 'pending' });
    
    const suppliers = await Supplier.find({ del_flag: false });
    const totalSpent = suppliers.reduce((sum, supplier) => sum + supplier.totalSpent, 0);
    const averageRating = suppliers.length > 0 
      ? suppliers.reduce((sum, supplier) => sum + supplier.rating, 0) / suppliers.length 
      : 0;

    return {
      totalSuppliers,
      activeSuppliers,
      pendingSuppliers,
      totalSpent,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  } catch (error) {
    throw new Error('Failed to fetch supplier statistics');
  }
}

export async function updateSupplierStatus(supplierId: string, status: string) {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');

    await connectToDB();

    const supplier = await Supplier.findByIdAndUpdate(
      supplierId,
      {
        status,
        modifiedBy: user._id,
        mod_flag: true,
      },
      { new: true }
    );

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    return { success: true };
  } catch (error) {
    throw new Error('Failed to update supplier status');
  }
}