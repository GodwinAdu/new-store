'use server'

import { connectToDB } from '../mongoose';
import Staff from '@/lib/models/staff.models';
import Role from '@/lib/models/role.models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function login(credentials: { email: string; password: string }) {
  try {
    await connectToDB();
    
    const staff = await Staff.findOne({ 
      email: credentials.email, 
      isActive: true, 
      del_flag: false 
    }).populate('departmentId', 'name');
    
    if (!staff) {
      throw new Error('Invalid credentials');
    }
    
    const isValidPassword = await bcrypt.compare(credentials.password, staff.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    
    // Get role permissions
    const role = await Role.findOne({ name: staff.role });
    
    const token = jwt.sign(
      { 
        userId: staff._id, 
        email: staff.email, 
        role: staff.role,
        permissions: role?.permissions || {}
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    // Set cookie
    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    return {
      success: true,
      user: {
        id: staff._id,
        fullName: staff.fullName,
        email: staff.email,
        role: staff.role,
        department: staff.departmentId?.name,
        permissions: role?.permissions || {}
      }
    };
  } catch (error) {
    throw new Error('Login failed');
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    await connectToDB();
    const staff = await Staff.findById(decoded.userId).populate('departmentId', 'name');
    const role = await Role.findOne({ name: staff?.role });
    
    if (!staff || !staff.isActive || staff.del_flag) {
      return null;
    }
    
    return {
      id: staff._id,
      fullName: staff.fullName,
      email: staff.email,
      role: staff.role,
      department: staff.departmentId?.name,
      permissions: role?.permissions || {}
    };
  } catch (error) {
    return null;
  }
}

export async function logout() {
  cookies().delete('auth-token');
  return { success: true };
}

export async function checkPermission(permission: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    return user.permissions[permission] === true;
  } catch (error) {
    return false;
  }
}

export async function getRoles() {
  try {
    await connectToDB();
    return await Role.find({ delete_flag: false }).sort({ name: 1 });
  } catch (error) {
    throw new Error('Failed to fetch roles');
  }
}

export async function createRole(roleData: {
  name: string;
  displayName: string;
  description?: string;
  permissions: Record<string, boolean>;
}) {
  try {
    await connectToDB();
    
    const role = await Role.create(roleData);
    return JSON.parse(JSON.stringify(role));
  } catch (error) {
    throw new Error('Failed to create role');
  }
}

export async function updateRole(roleId: string, roleData: {
  name?: string;
  displayName?: string;
  description?: string;
  permissions?: Record<string, boolean>;
}) {
  try {
    await connectToDB();
    
    const role = await Role.findByIdAndUpdate(roleId, roleData, { new: true });
    return JSON.parse(JSON.stringify(role));
  } catch (error) {
    throw new Error('Failed to update role');
  }
}