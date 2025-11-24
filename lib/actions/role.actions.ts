'use server'

import { connectToDB } from '../mongoose';
import Role from '@/lib/models/role.models';
import Staff from '@/lib/models/staff.models';
import { requirePermission } from '@/lib/middleware/auth';

export async function createDefaultRoles() {
  try {
    await connectToDB();

    const existingRoles = await Role.find();
    if (existingRoles.length > 0) return;

    const defaultRoles = [
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access',
        permissions: {
          manageAccess: true,
          dashboard: true,
          manageProduct: true,
          manageSales: true,
          managePurchase: true,
          manageExpenses: true,
          manageListAccount: true,
          balanceSheet: true,
          manageHr: true,
          manageRole: true,
          manageUser: true
        }
      },
      {
        name: 'manager',
        displayName: 'Manager',
        description: 'Management level access',
        permissions: {
          dashboard: true,
          viewProduct: true,
          addProduct: true,
          editProduct: true,
          viewSales: true,
          addSales: true,
          editSales: true,
          viewPurchase: true,
          addPurchase: true,
          viewExpenses: true,
          addExpenses: true,
          viewListAccount: true,
          salesReport: true,
          purchaseReport: true
        }
      },
      {
        name: 'cashier',
        displayName: 'Cashier',
        description: 'POS and basic sales access',
        permissions: {
          manageOnlyPos: true,
          viewProduct: true,
          addSales: true,
          viewSales: true
        }
      },
      {
        name: 'accountant',
        displayName: 'Accountant',
        description: 'Financial management access',
        permissions: {
          dashboard: true,
          viewExpenses: true,
          addExpenses: true,
          editExpenses: true,
          manageListAccount: true,
          balanceSheet: true,
          profitLostReport: true,
          expensesReport: true
        }
      }
    ];

    await Role.insertMany(defaultRoles);
    return { success: true, message: 'Default roles created' };
  } catch (error) {
    throw new Error('Failed to create default roles');
  }
}

export async function getRoles() {
  try {
    await requirePermission('viewRole');
    await connectToDB();

    const roles = await Role.find({ delete_flag: false }).sort({ name: 1 });
    return JSON.parse(JSON.stringify(roles));
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
    await requirePermission('addRole');
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
    await requirePermission('editRole');
    await connectToDB();

    const role = await Role.findByIdAndUpdate(roleId, roleData, { new: true });
    return JSON.parse(JSON.stringify(role));
  } catch (error) {
    throw new Error('Failed to update role');
  }
}

export async function deleteRole(roleId: string) {
  try {
    await requirePermission('deleteRole');
    await connectToDB();

    // Check if role is in use
    const staffCount = await Staff.countDocuments({ role: roleId });
    if (staffCount > 0) {
      throw new Error('Cannot delete role that is assigned to staff members');
    }

    await Role.findByIdAndUpdate(roleId, { delete_flag: true });
    return { success: true };
  } catch (error) {
    throw new Error('Failed to delete role');
  }
}

export async function getStaffWithRoles() {
  try {
    await requirePermission('viewUser');
    await connectToDB();

    const staff = await Staff.find({ del_flag: false })
      .populate('departmentId', 'name')
      .sort({ fullName: 1 });

    const staffWithRoles = await Promise.all(
      staff.map(async (member) => {
        const role = await Role.findOne({ name: member.role });
        return {
          id: member._id,
          fullName: member.fullName,
          email: member.email,
          role: member.role,
          roleDisplayName: role?.displayName || member.role,
          department: member.departmentId?.name,
          isActive: member.isActive,
          permissions: role?.permissions || {}
        };
      })
    );

    return JSON.parse(JSON.stringify(staffWithRoles));
  } catch (error) {
    throw new Error('Failed to fetch staff with roles');
  }
}

export async function fetchRoleById(roleId: string) {
  try {
    await connectToDB()

    const role = await Role.findById(roleId)
    if(!role) throw new Error("No role found");

    return JSON.parse(JSON.stringify(role))
  } catch (error) {
    console.log("something went wrong",error);
      throw error
  }
}