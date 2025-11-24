import {  checkPermission } from '@/lib/actions/auth.actions';
import { currentUser } from '../helpers/session';

export async function requireAuth() {
  const user = await currentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requirePermission(permission: string) {
  const user = await requireAuth();
  const hasPermission = await checkPermission(permission);
  
  if (!hasPermission) {
    throw new Error(`Permission denied: ${permission}`);
  }
  
  return user;
}

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD: 'dashboard',
  
  // Products
  VIEW_PRODUCT: 'viewProduct',
  ADD_PRODUCT: 'addProduct',
  EDIT_PRODUCT: 'editProduct',
  DELETE_PRODUCT: 'deleteProduct',
  MANAGE_PRODUCT: 'manageProduct',
  
  // Sales
  VIEW_SALES: 'viewSales',
  ADD_SALES: 'addSales',
  EDIT_SALES: 'editSales',
  DELETE_SALES: 'deleteSales',
  MANAGE_SALES: 'manageSales',
  
  // Purchase
  VIEW_PURCHASE: 'viewPurchase',
  ADD_PURCHASE: 'addPurchase',
  EDIT_PURCHASE: 'editPurchase',
  DELETE_PURCHASE: 'deletePurchase',
  MANAGE_PURCHASE: 'managePurchase',
  
  // Accounts
  VIEW_EXPENSES: 'viewExpenses',
  ADD_EXPENSES: 'addExpenses',
  EDIT_EXPENSES: 'editExpenses',
  DELETE_EXPENSES: 'deleteExpenses',
  MANAGE_EXPENSES: 'manageExpenses',
  
  VIEW_LIST_ACCOUNT: 'viewListAccount',
  ADD_LIST_ACCOUNT: 'addListAccount',
  EDIT_LIST_ACCOUNT: 'editListAccount',
  DELETE_LIST_ACCOUNT: 'deleteListAccount',
  
  // Reports
  BALANCE_SHEET: 'balanceSheet',
  PROFIT_LOST_REPORT: 'profitLostReport',
  SALES_REPORT: 'salesReport',
  PURCHASE_REPORT: 'purchaseReport',
  EXPENSES_REPORT: 'expensesReport',
  
  // HR
  VIEW_HR: 'viewHr',
  ADD_HR: 'addHr',
  EDIT_HR: 'editHr',
  DELETE_HR: 'deleteHr',
  MANAGE_HR: 'manageHr',
  
  // Roles
  VIEW_ROLE: 'viewRole',
  ADD_ROLE: 'addRole',
  EDIT_ROLE: 'editRole',
  DELETE_ROLE: 'deleteRole',
  MANAGE_ROLE: 'manageRole',
  
  // Users
  VIEW_USER: 'viewUser',
  ADD_USER: 'addUser',
  EDIT_USER: 'editUser',
  DELETE_USER: 'deleteUser',
  MANAGE_USER: 'manageUser',
  
  // POS
  MANAGE_ONLY_POS: 'manageOnlyPos',
  
  // Admin
  MANAGE_ACCESS: 'manageAccess'
} as const;