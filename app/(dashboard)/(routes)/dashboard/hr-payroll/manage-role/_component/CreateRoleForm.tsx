"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useParams, usePathname, useRouter } from "next/navigation"
import {
  Shield,
  Search,
  Save,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Users,
  Package,
  ShoppingCart,
  FileText,
  CreditCard,
  Settings,
  BarChart3,
  Clock,
  Briefcase,
  TrendingUp,
  Home,
  DollarSign,
  Loader2,
  Archive,
  Tag,
  Truck,
  Calculator,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { createRole, updateRole } from "@/lib/actions/role.actions"
import { toast } from "sonner"

// Define the permission schema with Zod
const RoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  displayName: z.string().min(1, "Display name is required"),
  description: z.string().min(1, "Description is required"),
  permissions: z.object({
    manageAccess: z.boolean().optional(),

    manageOnlyPos: z.boolean().optional(),
    dashboard: z.boolean().optional(),
    user: z.boolean().optional(),
    product: z.boolean().optional(),
    sales: z.boolean().optional(),
    purchase: z.boolean().optional(),
    stockTransfer: z.boolean().optional(),
    stockAdjustment: z.boolean().optional(),
    expenses: z.boolean().optional(),
    paymentAccount: z.boolean().optional(),
    report: z.boolean().optional(),

    addRole: z.boolean().optional(),
    manageRole: z.boolean().optional(),
    viewRole: z.boolean().optional(),
    editRole: z.boolean().optional(),
    deleteRole: z.boolean().optional(),

    addUser: z.boolean().optional(),
    manageUser: z.boolean().optional(),
    viewUser: z.boolean().optional(),
    editUser: z.boolean().optional(),
    deleteUser: z.boolean().optional(),

    listProduct: z.boolean().optional(),
    addProduct: z.boolean().optional(),
    manageProduct: z.boolean().optional(),
    viewProduct: z.boolean().optional(),
    editProduct: z.boolean().optional(),
    deleteProduct: z.boolean().optional(),

    addUnit: z.boolean().optional(),
    manageUnit: z.boolean().optional(),
    viewUnit: z.boolean().optional(),
    editUnit: z.boolean().optional(),
    deleteUnit: z.boolean().optional(),

    addBrand: z.boolean().optional(),
    manageBrand: z.boolean().optional(),
    viewBrand: z.boolean().optional(),
    editBrand: z.boolean().optional(),
    deleteBrand: z.boolean().optional(),

    addCategory: z.boolean().optional(),
    manageCategory: z.boolean().optional(),
    viewCategory: z.boolean().optional(),
    editCategory: z.boolean().optional(),
    deleteCategory: z.boolean().optional(),

    addPrintLabel: z.boolean().optional(),
    managePrintLabel: z.boolean().optional(),
    viewPrintLabel: z.boolean().optional(),

    addVariation: z.boolean().optional(),
    manageVariation: z.boolean().optional(),
    viewVariation: z.boolean().optional(),
    editVariation: z.boolean().optional(),
    deleteVariation: z.boolean().optional(),

    manageImportProduct: z.boolean().optional(),
    addSellingGroupPrice: z.boolean().optional(),
    manageSellingGroupPrice: z.boolean().optional(),
    viewSellingGroupPrice: z.boolean().optional(),
    editSellingGroupPrice: z.boolean().optional(),
    deleteSellingGroupPrice: z.boolean().optional(),

    addWarrant: z.boolean().optional(),
    manageWarrant: z.boolean().optional(),
    viewWarrant: z.boolean().optional(),
    editWarrant: z.boolean().optional(),
    deleteWarrant: z.boolean().optional(),

    manageAllSales: z.boolean().optional(),
    addSales: z.boolean().optional(),
    manageSales: z.boolean().optional(),
    viewSales: z.boolean().optional(),
    editSales: z.boolean().optional(),
    deleteSales: z.boolean().optional(),

    addOrder: z.boolean().optional(),
    manageOrder: z.boolean().optional(),
    viewOrder: z.boolean().optional(),
    editOrder: z.boolean().optional(),
    deleteOrder: z.boolean().optional(),
    listOrder: z.boolean().optional(),

    listSellReturn: z.boolean().optional(),

    importSales: z.boolean().optional(),

    listPurchase: z.boolean().optional(),
    addPurchase: z.boolean().optional(),
    managePurchase: z.boolean().optional(),
    viewPurchase: z.boolean().optional(),
    editPurchase: z.boolean().optional(),
    deletePurchase: z.boolean().optional(),

    listPurchaseReturn: z.boolean().optional(),

    importPurchase: z.boolean().optional(),

    listStockTransfer: z.boolean().optional(),
    addStockTransfer: z.boolean().optional(),
    manageStockTransfer: z.boolean().optional(),
    viewStockTransfer: z.boolean().optional(),
    editStockTransfer: z.boolean().optional(),
    deleteStockTransfer: z.boolean().optional(),

    listStockAdjustment: z.boolean().optional(),
    addStockAdjustment: z.boolean().optional(),
    manageStockAdjustment: z.boolean().optional(),
    viewStockAdjustment: z.boolean().optional(),
    editStockAdjustment: z.boolean().optional(),
    deleteStockAdjustment: z.boolean().optional(),

    addExpensesCategory: z.boolean().optional(),
    manageExpensesCategory: z.boolean().optional(),
    viewExpensesCategory: z.boolean().optional(),
    editExpensesCategory: z.boolean().optional(),
    deleteExpensesCategory: z.boolean().optional(),

    addExpenses: z.boolean().optional(),
    manageExpenses: z.boolean().optional(),
    viewExpenses: z.boolean().optional(),
    editExpenses: z.boolean().optional(),
    deleteExpenses: z.boolean().optional(),
    listExpenses: z.boolean().optional(),

    addListAccount: z.boolean().optional(),
    manageListAccount: z.boolean().optional(),
    viewListAccount: z.boolean().optional(),
    editListAccount: z.boolean().optional(),
    deleteListAccount: z.boolean().optional(),
    balanceSheet: z.boolean().optional(),
    trialBalance: z.boolean().optional(),
    cashFlow: z.boolean().optional(),
    paymentAccountReport: z.boolean().optional(),
    profitLostReport: z.boolean().optional(),
    itemsReport: z.boolean().optional(),
    registerReport: z.boolean().optional(),
    expensesReport: z.boolean().optional(),
    productSellReport: z.boolean().optional(),
    productPurchaseReport: z.boolean().optional(),
    sellReturnReport: z.boolean().optional(),
    purchaseReturnReport: z.boolean().optional(),
    stockTransferReport: z.boolean().optional(),
    stockAdjustmentReport: z.boolean().optional(),
    salesReport: z.boolean().optional(),
    purchaseReport: z.boolean().optional(),
    trendingProductReport: z.boolean().optional(),
    stockExpiryReport: z.boolean().optional(),
    stockReport: z.boolean().optional(),
    taxReport: z.boolean().optional(),
    saleRepresentativeReport: z.boolean().optional(),
    customerSupplierReport: z.boolean().optional(),
    // HR Access
    addHr: z.boolean().optional(),
    viewHr: z.boolean().optional(),
    editHr: z.boolean().optional(),
    deleteHr: z.boolean().optional(),
    manageHr: z.boolean().optional(),

    // Request Salary Access
    addRequestSalary: z.boolean().optional(),
    viewRequestSalary: z.boolean().optional(),
    editRequestSalary: z.boolean().optional(),
    deleteRequestSalary: z.boolean().optional(),
    manageRequestSalary: z.boolean().optional(),

    // Request Leave Access
    addRequestLeave: z.boolean().optional(),
    viewRequestLeave: z.boolean().optional(),
    editRequestLeave: z.boolean().optional(),
    deleteRequestLeave: z.boolean().optional(),
    manageRequestLeave: z.boolean().optional(),

    // Leave Category Access
    addLeaveCategory: z.boolean().optional(),
    viewLeaveCategory: z.boolean().optional(),
    editLeaveCategory: z.boolean().optional(),
    deleteLeaveCategory: z.boolean().optional(),
    manageLeaveCategory: z.boolean().optional(),

    hrReport: z.boolean().optional(),
  }),
})

// Role presets for POS system
const rolePresets = {
  admin: {
    label: "System Administrator",
    description: "Full access to all system features and settings",
    permissions: {
      manageAccess: true,
      manageOnlyPos: false,
      dashboard: true,
      user: true,
      product: true,
      sales: true,
      purchase: true,
      stockTransfer: true,
      stockAdjustment: true,
      expenses: true,
      paymentAccount: true,
      report: true,
      addRole: true,
      manageRole: true,
      viewRole: true,
      editRole: true,
      deleteRole: true,
      addUser: true,
      manageUser: true,
      viewUser: true,
      editUser: true,
      deleteUser: true,
      listProduct: true,
      addProduct: true,
      manageProduct: true,
      viewProduct: true,
      editProduct: true,
      deleteProduct: true,
    },
  },
  supervisor: {
    label: "Store Supervisor",
    description: "Limited access to POS features",
    permissions: {
      manageAccess: false,
      manageOnlyPos: true,
      dashboard: true,
      user: false,
      product: false,
      sales: true,
      purchase: false,
      stockTransfer: false,
      stockAdjustment: false,
      expenses: false,
      paymentAccount: false,
      report: false,
      addSales: true,
      viewSales: true,
      listProduct: true,
      viewProduct: true,
      addOrder: true,
      viewOrder: true,
      listOrder: true,
    },
  },
  manager: {
    label: "Store Manager",
    description: "Full access to all POS features and management",
    permissions: {
      manageAccess: true,
      manageOnlyPos: false,
      dashboard: true,
      user: true,
      product: true,
      sales: true,
      purchase: true,
      stockTransfer: true,
      stockAdjustment: true,
      expenses: true,
      paymentAccount: true,
      report: true,
      addRole: true,
      manageRole: true,
      viewRole: true,
      editRole: true,
      deleteRole: true,
      addUser: true,
      manageUser: true,
      viewUser: true,
      editUser: true,
      deleteUser: true,
      listProduct: true,
      addProduct: true,
      manageProduct: true,
      viewProduct: true,
      editProduct: true,
      deleteProduct: true,
      manageAllSales: true,
      addSales: true,
      manageSales: true,
      viewSales: true,
      editSales: true,
      deleteSales: true,
    },
  },
  cashier: {
    label: "Cashier",
    description: "Basic POS operations and sales",
    permissions: {
      manageAccess: false,
      manageOnlyPos: true,
      dashboard: true,
      user: false,
      product: false,
      sales: true,
      purchase: false,
      stockTransfer: false,
      stockAdjustment: false,
      expenses: false,
      paymentAccount: false,
      report: false,
      addSales: true,
      viewSales: true,
      listProduct: true,
      viewProduct: true,
      addOrder: true,
      viewOrder: true,
      listOrder: true,
    },
  },
  inventory: {
    label: "Inventory Manager",
    description: "Product and stock management access",
    permissions: {
      manageAccess: false,
      manageOnlyPos: false,
      dashboard: true,
      user: false,
      product: true,
      sales: false,
      purchase: true,
      stockTransfer: true,
      stockAdjustment: true,
      expenses: false,
      paymentAccount: false,
      report: true,
      listProduct: true,
      addProduct: true,
      manageProduct: true,
      viewProduct: true,
      editProduct: true,
      deleteProduct: true,
      addUnit: true,
      manageUnit: true,
      viewUnit: true,
      editUnit: true,
      deleteUnit: true,
      addBrand: true,
      manageBrand: true,
      viewBrand: true,
      editBrand: true,
      deleteBrand: true,
      addCategory: true,
      manageCategory: true,
      viewCategory: true,
      editCategory: true,
      deleteCategory: true,
      stockReport: true,
      stockExpiryReport: true,
      itemsReport: true,
    },
  },
  accountant: {
    label: "Accountant",
    description: "Financial and accounting access",
    permissions: {
      manageAccess: false,
      manageOnlyPos: false,
      dashboard: true,
      user: false,
      product: false,
      sales: false,
      purchase: false,
      stockTransfer: false,
      stockAdjustment: false,
      expenses: true,
      paymentAccount: true,
      report: true,
      addExpenses: true,
      manageExpenses: true,
      viewExpenses: true,
      editExpenses: true,
      deleteExpenses: true,
      listExpenses: true,
      addListAccount: true,
      manageListAccount: true,
      viewListAccount: true,
      editListAccount: true,
      deleteListAccount: true,
      balanceSheet: true,
      trialBalance: true,
      cashFlow: true,
      paymentAccountReport: true,
      profitLostReport: true,
      expensesReport: true,
      salesReport: true,
      purchaseReport: true,
      taxReport: true,
    },
  },
}

// Permission category definitions for POS system
const permissionCategories = {
  global: {
    title: "Global Access",
    icon: <Shield className="h-5 w-5" />,
    permissions: ["manageAccess", "manageOnlyPos"],
  },
  core: {
    title: "Core Modules",
    icon: <Home className="h-5 w-5" />,
    permissions: [
      "dashboard",
      "user",
      "product",
      "sales",
      "purchase",
      "stockTransfer",
      "stockAdjustment",
      "expenses",
      "paymentAccount",
      "report",
    ],
  },
  roles: {
    title: "Role Management",
    icon: <Users className="h-5 w-5" />,
    permissions: ["addRole", "manageRole", "viewRole", "editRole", "deleteRole"],
  },
  users: {
    title: "User Management",
    icon: <Users className="h-5 w-5" />,
    permissions: ["addUser", "manageUser", "viewUser", "editUser", "deleteUser"],
  },
  products: {
    title: "Product Management",
    icon: <Package className="h-5 w-5" />,
    permissions: [
      "listProduct",
      "addProduct",
      "manageProduct",
      "viewProduct",
      "editProduct",
      "deleteProduct",
      "manageImportProduct",
    ],
  },
  units: {
    title: "Unit Management",
    icon: <Calculator className="h-5 w-5" />,
    permissions: ["addUnit", "manageUnit", "viewUnit", "editUnit", "deleteUnit"],
  },
  brands: {
    title: "Brand Management",
    icon: <Tag className="h-5 w-5" />,
    permissions: ["addBrand", "manageBrand", "viewBrand", "editBrand", "deleteBrand"],
  },
  categories: {
    title: "Category Management",
    icon: <Archive className="h-5 w-5" />,
    permissions: ["addCategory", "manageCategory", "viewCategory", "editCategory", "deleteCategory"],
  },
  printLabels: {
    title: "Print Labels",
    icon: <FileText className="h-5 w-5" />,
    permissions: ["addPrintLabel", "managePrintLabel", "viewPrintLabel"],
  },
  variations: {
    title: "Product Variations",
    icon: <Settings className="h-5 w-5" />,
    permissions: ["addVariation", "manageVariation", "viewVariation", "editVariation", "deleteVariation"],
  },
  pricing: {
    title: "Pricing Management",
    icon: <DollarSign className="h-5 w-5" />,
    permissions: [
      "addSellingGroupPrice",
      "manageSellingGroupPrice",
      "viewSellingGroupPrice",
      "editSellingGroupPrice",
      "deleteSellingGroupPrice",
    ],
  },
  warranty: {
    title: "Warranty Management",
    icon: <Shield className="h-5 w-5" />,
    permissions: ["addWarrant", "manageWarrant", "viewWarrant", "editWarrant", "deleteWarrant"],
  },
  sales: {
    title: "Sales Management",
    icon: <ShoppingCart className="h-5 w-5" />,
    permissions: ["manageAllSales", "addSales", "manageSales", "viewSales", "editSales", "deleteSales", "importSales"],
  },
  orders: {
    title: "Order Management",
    icon: <FileText className="h-5 w-5" />,
    permissions: ["addOrder", "manageOrder", "viewOrder", "editOrder", "deleteOrder", "listOrder"],
  },
  returns: {
    title: "Returns Management",
    icon: <TrendingUp className="h-5 w-5" />,
    permissions: ["listSellReturn", "listPurchaseReturn"],
  },
  purchases: {
    title: "Purchase Management",
    icon: <Truck className="h-5 w-5" />,
    permissions: [
      "listPurchase",
      "addPurchase",
      "managePurchase",
      "viewPurchase",
      "editPurchase",
      "deletePurchase",
      "importPurchase",
    ],
  },
  stockTransfer: {
    title: "Stock Transfer",
    icon: <Archive className="h-5 w-5" />,
    permissions: [
      "listStockTransfer",
      "addStockTransfer",
      "manageStockTransfer",
      "viewStockTransfer",
      "editStockTransfer",
      "deleteStockTransfer",
    ],
  },
  stockAdjustment: {
    title: "Stock Adjustment",
    icon: <Settings className="h-5 w-5" />,
    permissions: [
      "listStockAdjustment",
      "addStockAdjustment",
      "manageStockAdjustment",
      "viewStockAdjustment",
      "editStockAdjustment",
      "deleteStockAdjustment",
    ],
  },
  expenseCategories: {
    title: "Expense Categories",
    icon: <FileText className="h-5 w-5" />,
    permissions: [
      "addExpensesCategory",
      "manageExpensesCategory",
      "viewExpensesCategory",
      "editExpensesCategory",
      "deleteExpensesCategory",
    ],
  },
  expenses: {
    title: "Expense Management",
    icon: <CreditCard className="h-5 w-5" />,
    permissions: ["addExpenses", "manageExpenses", "viewExpenses", "editExpenses", "deleteExpenses", "listExpenses"],
  },
  accounts: {
    title: "Account Management",
    icon: <DollarSign className="h-5 w-5" />,
    permissions: ["addListAccount", "manageListAccount", "viewListAccount", "editListAccount", "deleteListAccount"],
  },
  financialReports: {
    title: "Financial Reports",
    icon: <BarChart3 className="h-5 w-5" />,
    permissions: ["balanceSheet", "trialBalance", "cashFlow", "paymentAccountReport", "profitLostReport"],
  },
  businessReports: {
    title: "Business Reports",
    icon: <TrendingUp className="h-5 w-5" />,
    permissions: [
      "itemsReport",
      "registerReport",
      "expensesReport",
      "productSellReport",
      "productPurchaseReport",
      "sellReturnReport",
      "purchaseReturnReport",
      "stockTransferReport",
      "stockAdjustmentReport",
      "salesReport",
      "purchaseReport",
      "trendingProductReport",
      "stockExpiryReport",
      "stockReport",
      "taxReport",
      "saleRepresentativeReport",
      "customerSupplierReport",
      "hrReport",
    ],
  },
  hr: {
    title: "HR Management",
    icon: <Briefcase className="h-5 w-5" />,
    permissions: ["addHr", "viewHr", "editHr", "deleteHr", "manageHr"],
  },
  salary: {
    title: "Salary Requests",
    icon: <DollarSign className="h-5 w-5" />,
    permissions: [
      "addRequestSalary",
      "viewRequestSalary",
      "editRequestSalary",
      "deleteRequestSalary",
      "manageRequestSalary",
    ],
  },
  leave: {
    title: "Leave Requests",
    icon: <Clock className="h-5 w-5" />,
    permissions: [
      "addRequestLeave",
      "viewRequestLeave",
      "editRequestLeave",
      "deleteRequestLeave",
      "manageRequestLeave",
    ],
  },
  leaveCategory: {
    title: "Leave Categories",
    icon: <FileText className="h-5 w-5" />,
    permissions: [
      "addLeaveCategory",
      "viewLeaveCategory",
      "editLeaveCategory",
      "deleteLeaveCategory",
      "manageLeaveCategory",
    ],
  },
}

// Permission descriptions for POS system
const permissionDescriptions = {
  manageAccess: "Full system access with all permissions",
  manageOnlyPos: "Restricted to POS operations only",
  dashboard: "Access to dashboard and overview",
  user: "Access user management module",
  product: "Access product management module",
  sales: "Access sales management module",
  purchase: "Access purchase management module",
  stockTransfer: "Access stock transfer module",
  stockAdjustment: "Access stock adjustment module",
  expenses: "Access expense management module",
  paymentAccount: "Access payment account module",
  report: "Access reporting module",

  addRole: "Create new roles",
  manageRole: "Full role management access",
  viewRole: "View existing roles",
  editRole: "Modify existing roles",
  deleteRole: "Remove roles from system",

  addUser: "Create new users",
  manageUser: "Full user management access",
  viewUser: "View user information",
  editUser: "Modify user details",
  deleteUser: "Remove users from system",

  listProduct: "View product listings",
  addProduct: "Add new products",
  manageProduct: "Full product management",
  viewProduct: "View product details",
  editProduct: "Modify product information",
  deleteProduct: "Remove products",

  addUnit: "Create measurement units",
  manageUnit: "Full unit management",
  viewUnit: "View unit information",
  editUnit: "Modify units",
  deleteUnit: "Remove units",

  addBrand: "Create product brands",
  manageBrand: "Full brand management",
  viewBrand: "View brand information",
  editBrand: "Modify brands",
  deleteBrand: "Remove brands",

  addCategory: "Create product categories",
  manageCategory: "Full category management",
  viewCategory: "View categories",
  editCategory: "Modify categories",
  deleteCategory: "Remove categories",

  addPrintLabel: "Create print labels",
  managePrintLabel: "Manage print labels",
  viewPrintLabel: "View print labels",

  addVariation: "Create product variations",
  manageVariation: "Full variation management",
  viewVariation: "View variations",
  editVariation: "Modify variations",
  deleteVariation: "Remove variations",

  manageImportProduct: "Import products from external sources",

  addSellingGroupPrice: "Create selling group prices",
  manageSellingGroupPrice: "Full price group management",
  viewSellingGroupPrice: "View price groups",
  editSellingGroupPrice: "Modify price groups",
  deleteSellingGroupPrice: "Remove price groups",

  addWarrant: "Create warranties",
  manageWarrant: "Full warranty management",
  viewWarrant: "View warranties",
  editWarrant: "Modify warranties",
  deleteWarrant: "Remove warranties",

  manageAllSales: "Access all sales records",
  addSales: "Create new sales",
  manageSales: "Full sales management",
  viewSales: "View sales records",
  editSales: "Modify sales",
  deleteSales: "Remove sales records",

  addOrder: "Create new orders",
  manageOrder: "Full order management",
  viewOrder: "View orders",
  editOrder: "Modify orders",
  deleteOrder: "Remove orders",
  listOrder: "View order listings",

  listSellReturn: "View sales returns",
  importSales: "Import sales data",

  listPurchase: "View purchase listings",
  addPurchase: "Create new purchases",
  managePurchase: "Full purchase management",
  viewPurchase: "View purchase details",
  editPurchase: "Modify purchases",
  deletePurchase: "Remove purchases",

  listPurchaseReturn: "View purchase returns",
  importPurchase: "Import purchase data",

  listStockTransfer: "View stock transfers",
  addStockTransfer: "Create stock transfers",
  manageStockTransfer: "Full transfer management",
  viewStockTransfer: "View transfer details",
  editStockTransfer: "Modify transfers",
  deleteStockTransfer: "Remove transfers",

  listStockAdjustment: "View stock adjustments",
  addStockAdjustment: "Create adjustments",
  manageStockAdjustment: "Full adjustment management",
  viewStockAdjustment: "View adjustments",
  editStockAdjustment: "Modify adjustments",
  deleteStockAdjustment: "Remove adjustments",

  addExpensesCategory: "Create expense categories",
  manageExpensesCategory: "Full category management",
  viewExpensesCategory: "View expense categories",
  editExpensesCategory: "Modify categories",
  deleteExpensesCategory: "Remove categories",

  addExpenses: "Create new expenses",
  manageExpenses: "Full expense management",
  viewExpenses: "View expenses",
  editExpenses: "Modify expenses",
  deleteExpenses: "Remove expenses",
  listExpenses: "View expense listings",

  addListAccount: "Create accounts",
  manageListAccount: "Full account management",
  viewListAccount: "View accounts",
  editListAccount: "Modify accounts",
  deleteListAccount: "Remove accounts",

  balanceSheet: "Access balance sheet reports",
  trialBalance: "Access trial balance reports",
  cashFlow: "Access cash flow reports",
  paymentAccountReport: "View payment account reports",
  profitLostReport: "Access profit & loss reports",
  itemsReport: "View items reports",
  registerReport: "Access register reports",
  expensesReport: "View expense reports",
  productSellReport: "Access product sales reports",
  productPurchaseReport: "View purchase reports",
  sellReturnReport: "Access return reports",
  purchaseReturnReport: "View purchase return reports",
  stockTransferReport: "Access transfer reports",
  stockAdjustmentReport: "View adjustment reports",
  salesReport: "Access sales reports",
  purchaseReport: "View purchase reports",
  trendingProductReport: "Access trending reports",
  stockExpiryReport: "View expiry reports",
  stockReport: "Access stock reports",
  taxReport: "View tax reports",
  saleRepresentativeReport: "Access sales rep reports",
  customerSupplierReport: "View customer/supplier reports",

  addHr: "Create HR records",
  viewHr: "View HR information",
  editHr: "Modify HR records",
  deleteHr: "Remove HR records",
  manageHr: "Full HR management",

  addRequestSalary: "Create salary requests",
  viewRequestSalary: "View salary requests",
  editRequestSalary: "Modify salary requests",
  deleteRequestSalary: "Remove salary requests",
  manageRequestSalary: "Full salary request management",

  addRequestLeave: "Create leave requests",
  viewRequestLeave: "View leave requests",
  editRequestLeave: "Modify leave requests",
  deleteRequestLeave: "Remove leave requests",
  manageRequestLeave: "Full leave request management",

  addLeaveCategory: "Create leave categories",
  viewLeaveCategory: "View leave categories",
  editLeaveCategory: "Modify leave categories",
  deleteLeaveCategory: "Remove leave categories",
  manageLeaveCategory: "Full leave category management",

  hrReport: "Access HR reports",
}

// Function to get a human-readable name from a camelCase permission key
const getReadableName = (key: string) => {
  // Handle special cases
  if (key === "hr") return "HR"
  if (key === "manageOnlyPos") return "POS Only Mode"
  if (key === "manageAccess") return "Full Access"

  // Convert camelCase to Title Case with spaces
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
}

interface IRole {
  _id?: string
  name?: string
  displayName?: string
  description?: string
  permissions?: Record<string, boolean>
}

const CreateRoleForm = ({ type, initialData }: { type: "create" | "update"; initialData?: IRole }) => {
  const path = usePathname()
  const router = useRouter()
  const params = useParams()
  const { schoolId, userId } = params
  const roleId = initialData?._id as string

  const [searchTerm, setSearchTerm] = useState("")
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  // Create default values for the form
  const defaultValues = {
    name: initialData?.name || "",
    displayName: initialData?.displayName || "",
    description: initialData?.description || "",
    permissions:
      initialData?.permissions ||
      Object.fromEntries(Object.keys(RoleSchema.shape.permissions.shape).map((key) => [key, false])),
  }

  // Initialize form with existing permissions or defaults
  const form = useForm<z.infer<typeof RoleSchema>>({
    resolver: zodResolver(RoleSchema),
    defaultValues,
  })

  const { isSubmitting } = form.formState
  const submit = initialData ? "Update" : "Create"
  const submitting = initialData ? "Updating..." : "Creating..."

  // Function to apply a role preset
  const applyRolePreset = (presetKey: string) => {
    if (rolePresets[presetKey as keyof typeof rolePresets]) {
      const preset = rolePresets[presetKey as keyof typeof rolePresets]

      // Get current form values
      const currentValues = form.getValues()

      // Update only the permissions, keeping other fields intact
      form.reset({
        ...currentValues,
        permissions: preset.permissions as Record<string, boolean>,
      })

      setSelectedPreset(presetKey)

      toast.success(`Applied ${preset.label} preset`, {
        description: preset.description,
      })
    }
  }

  // Function to toggle all permissions in a category
  const toggleCategoryPermissions = (category: string, value: boolean) => {
    const updatedValues = { ...form.getValues() }

    // Get all permissions in this category
    const permissionsInCategory = permissionCategories[category as keyof typeof permissionCategories].permissions

    // Update all permissions in the category
    permissionsInCategory.forEach((permission) => {
      updatedValues.permissions[permission as keyof typeof updatedValues.permissions] = value
    })

    form.reset(updatedValues)
  }

  // Function to check if a permission matches the search term
  const matchesSearch = (permission: string) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    const permissionName = getReadableName(permission).toLowerCase()
    const description = permissionDescriptions[permission as keyof typeof permissionDescriptions]?.toLowerCase()

    return permissionName.includes(searchLower) || (description && description.includes(searchLower))
  }

  // Function to count enabled permissions in a category
  const countEnabledPermissions = (category: string) => {
    const permissions = permissionCategories[category as keyof typeof permissionCategories].permissions
    const values = form.getValues().permissions
    return permissions.filter((p) => values[p as keyof typeof values]).length
  }

  // Function to get total permissions in a category
  const getTotalPermissions = (category: string) => {
    return permissionCategories[category as keyof typeof permissionCategories].permissions.length
  }

  // Toggle expanding/collapsing all sections
  const toggleAllSections = () => {
    if (expandedSections.length === Object.keys(permissionCategories).length) {
      setExpandedSections([])
    } else {
      setExpandedSections(Object.keys(permissionCategories))
    }
  }

  // Handle form submission
  async function onSubmit(values: z.infer<typeof RoleSchema>) {
    try {
      if (type === "create") {
        await createRole(values, path)
      } else {
        await updateRole(roleId, values, path)
      }

      form.reset()

      toast.success(`Role ${type === "create" ? "Created" : "Updated"} successfully`, {
        description: `A role was ${type === "create" ? "created" : "updated"} successfully...`,
      })

      router.push(`/dashboard/hr/manage-role`)
    } catch (error) {
      console.log("something went wrong", error)
      toast.error("Something went wrong", {
        description: "Please try again later...",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-md border-0">
            <CardHeader className="bg-gray-50 dark:bg-gray-900 rounded-t-lg border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {type === "create" ? "Create New Role" : "Update Role"}
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      {type === "create"
                        ? "Define a new role with specific permissions for your POS system"
                        : "Modify existing role permissions"}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
              {/* Role Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Role Name..." {...field} />
                      </FormControl>
                      <FormDescription>Internal name used by the system</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Display Name..." {...field} />
                      </FormControl>
                      <FormDescription>Name shown to users in the interface</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Write a short description..." {...field} />
                      </FormControl>
                      <FormDescription>Brief explanation of this role&apos;s purpose</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Permissions Section */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h2 className="text-xl font-bold">Role Permissions</h2>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select onValueChange={applyRolePreset} value={selectedPreset || undefined}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Apply preset" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(rolePresets).map(([key, preset]) => (
                          <SelectItem key={key} value={key}>
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search permissions..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={toggleAllSections} className="gap-1">
                      {expandedSections.length === Object.keys(permissionCategories).length ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Collapse All
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Expand All
                        </>
                      )}
                    </Button>

                    {searchTerm && (
                      <Badge variant="outline" className="gap-1">
                        <Search className="h-3 w-3" />
                        {searchTerm}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                      <span>Enabled</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                      <span>Disabled</span>
                    </div>
                  </div>
                </div>

                <Accordion
                  type="multiple"
                  value={expandedSections}
                  onValueChange={setExpandedSections}
                  className="space-y-4"
                >
                  {Object.entries(permissionCategories).map(([category, { title, icon, permissions }]) => {
                    const enabledCount = countEnabledPermissions(category)
                    const totalCount = getTotalPermissions(category)
                    const hasMatchingPermissions = permissions.some((permission) => matchesSearch(permission))

                    if (searchTerm && !hasMatchingPermissions) return null

                    return (
                      <AccordionItem key={category} value={category} className="border rounded-lg overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-md bg-primary/10 text-primary">{icon}</div>
                              <div>
                                <h3 className="font-medium text-left">{title}</h3>
                                <p className="text-sm text-muted-foreground text-left">
                                  {enabledCount} of {totalCount} permissions enabled
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mr-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 gap-1"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleCategoryPermissions(category, true)
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      <span className="sr-only md:not-sr-only md:inline-block">Enable All</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Enable all permissions in this category</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 gap-1"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toggleCategoryPermissions(category, false)
                                      }}
                                    >
                                      <XCircle className="h-4 w-4 text-red-500" />
                                      <span className="sr-only md:not-sr-only md:inline-block">Disable All</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Disable all permissions in this category</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="px-4 py-3 border-t bg-white dark:bg-gray-950">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {permissions.map((permission) => {
                              if (searchTerm && !matchesSearch(permission)) return null

                              // Explicitly type permission as keyof typeof RoleSchema.shape.permissions.shape
                              type PermissionKey = keyof typeof RoleSchema.shape.permissions.shape
                              const permissionKey = permission as PermissionKey

                              return (
                                <FormField
                                  key={permission}
                                  control={form.control}
                                  name={`permissions.${permissionKey}` as const}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                      <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                      </FormControl>
                                      <div className="space-y-1 leading-none flex-1">
                                        <FormLabel className="font-medium">{getReadableName(permission)}</FormLabel>
                                        <FormDescription>
                                          {permissionDescriptions[permission as keyof typeof permissionDescriptions] ||
                                            `Control access to ${getReadableName(permission).toLowerCase()} functionality`}
                                        </FormDescription>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              )
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 p-6 bg-gray-50 dark:bg-gray-900 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Changes to permissions will be logged in the audit trail</span>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/${schoolId}/admin/${userId}/system-config/manage-role`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSubmitting ? submitting : submit}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
}

export default CreateRoleForm
