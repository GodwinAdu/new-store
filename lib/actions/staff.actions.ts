'use server'

import { connectToDB } from '../mongoose';
import Staff from '../models/staff.models';
import Department from '../models/deparment.models';
import Role from '../models/role.models';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from './auth.actions';
import { currentUser } from '../helpers/session';

export async function createStaff(staffData: {
  fullName: string;
  email: string;
  phoneNumber?: string;
  emergencyNumber?: string;
  role: string;
  departmentId: string;
  jobTitle?: string;
  password: string;
  gender?: string;
  dob?: string;
  startDate?: string;
  workLocation?: string;
  bio?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  cardDetails?: {
    idCardType?: string;
    idCardNumber?: string;
  };
  accountDetails?: {
    accountName?: string;
    accountNumber?: string;
    accountType?: string;
  };
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    await connectToDB();

    // Check if email already exists
    const existingStaff = await Staff.findOne({ email: staffData.email });
    if (existingStaff) {
      throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(staffData.password, 12);

    // Generate username from email
    const username = staffData.email.split('@')[0].toLowerCase();

    const staff = await Staff.create({
      ...staffData,
      username,
      password: hashedPassword,
      dob: staffData.dob ? new Date(staffData.dob) : null,
      startDate: staffData.startDate ? new Date(staffData.startDate) : null,
      createdBy: currentUser.id,
    });

    return JSON.parse(JSON.stringify(staff));
  } catch (error) {
    throw new Error(`Failed to create staff: ${error}`);
  }
}

export async function getAllStaff() {
  try {
    await connectToDB();
    
    const staff = await Staff.find({ del_flag: false })
      .populate('departmentId', 'name')
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 });

    // Format data for table
    const formattedStaff = staff.map((member: any) => ({
      id: member._id.toString(),
      fullName: member.fullName,
      email: member.email,
      phoneNumber: member.phoneNumber || '',
      role: member.role,
      department: member.departmentId?.name || 'N/A',
      jobTitle: member.jobTitle || '',
      isActive: member.isActive,
      onLeave: member.onLeave,
      createdAt: new Date(member.createdAt).toLocaleDateString(),
    }));

    return formattedStaff;
  } catch (error) {
    throw new Error('Failed to fetch staff');
  }
}

export async function getStaffById(staffId: string) {
  try {
    await connectToDB();
    
    const staff = await Staff.findById(staffId)
      .populate('departmentId', 'name description')
      .populate('createdBy', 'fullName')
      .populate('modifiedBy', 'fullName');

    if (!staff || staff.del_flag) {
      throw new Error('Staff not found');
    }

    return JSON.parse(JSON.stringify(staff));
  } catch (error) {
    throw new Error('Failed to fetch staff');
  }
}

export async function updateStaff(staffId: string, updateData: {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  emergencyNumber?: string;
  role?: string;
  departmentId?: string;
  jobTitle?: string;
  gender?: string;
  dob?: string;
  startDate?: string;
  workLocation?: string;
  bio?: string;
  isActive?: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  cardDetails?: {
    idCardType?: string;
    idCardNumber?: string;
  };
  accountDetails?: {
    accountName?: string;
    accountNumber?: string;
    accountType?: string;
  };
}) {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');

    await connectToDB();

    // Check if email exists for other users
    if (updateData.email) {
      const existingStaff = await Staff.findOne({ 
        email: updateData.email, 
        _id: { $ne: staffId } 
      });
      if (existingStaff) {
        throw new Error('Email already exists');
      }
    }

    const staff = await Staff.findByIdAndUpdate(
      staffId,
      {
        ...updateData,
        dob: updateData.dob ? new Date(updateData.dob) : undefined,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        modifiedBy: user._id,
        mod_flag: true,
        action_type: 'updated',
      },
      { new: true }
    ).populate('departmentId', 'name');

    if (!staff) {
      throw new Error('Staff not found');
    }

    return JSON.parse(JSON.stringify(staff));
  } catch (error) {
    throw new Error(`Failed to update staff: ${error}`);
  }
}

export async function deleteStaff(staffId: string) {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');

    await connectToDB();

    const staff = await Staff.findByIdAndUpdate(
      staffId,
      {
        del_flag: true,
        modifiedBy: user._id,
        action_type: 'deleted',
      },
      { new: true }
    );

    if (!staff) {
      throw new Error('Staff not found');
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getDepartments() {
  try {
    await connectToDB();
    
    const departments = await Department.find({ del_flag: false })
      .select('_id name description')
      .sort({ name: 1 });

    return JSON.parse(JSON.stringify(departments));
  } catch (error) {
    throw new Error('Failed to fetch departments');
  }
}

export async function getRoles() {
  try {
    await connectToDB();
    
    const roles = await Role.find({ delete_flag: false })
      .select('_id name displayName')
      .sort({ name: 1 });

    return JSON.parse(JSON.stringify(roles));
  } catch (error) {
    throw new Error('Failed to fetch roles');
  }
}

export async function getStaffStats() {
  try {
    await connectToDB();
    
    const totalStaff = await Staff.countDocuments({ del_flag: false });
    const activeStaff = await Staff.countDocuments({ del_flag: false, isActive: true });
    const inactiveStaff = await Staff.countDocuments({ del_flag: false, isActive: false });
    const onLeave = await Staff.countDocuments({ del_flag: false, onLeave: true });

    return {
      totalStaff,
      activeStaff,
      inactiveStaff,
      onLeave,
    };
  } catch (error) {
    throw new Error('Failed to fetch staff statistics');
  }
}