"use client"

import {
  ChevronRight,
  Combine,
  Mail,
  Menu,
  HistoryIcon,
  Trash,
  LucideReceiptText,
  Car,
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  DollarSign,
  CreditCard
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon?: React.ComponentType;
  roleField?: keyof IRole | string;
  isActive?: boolean;
  items?: NavItem[];
}


interface NavMainProps {
  role: IRole | undefined;
}

export function NavMain({ role }: NavMainProps) {
  const pathname = usePathname();

  const [openGroup, setOpenGroup] = useState<string | null>(null)








  const navMain: (NavItem | false)[] = [
    {
      title: "Overview",
      url: `/dashboard`,
      icon: Menu,
      isActive: false,
      roleField: "dashboard"
    },
    {
      title: "Transport System",
      url: "#",
      icon: Car,
      isActive: false,
      // roleField: "settings",
      items: [
        {
          title: "Vehicle Management",
          url: `/dashboard/transport/vehicle-management`,
          // roleField: "vehicleManagement"
        },
        {
          title: "Shipment Management",
          url: `/dashboard/transport/shipment-management`,
          // roleField: "shipmentManagement"
        },
      ]
    },
    {
      title: "Warehouse",
      url: "#",
      icon: LucideReceiptText,
      isActive: true,
      roleField: "product",
      items: [
        {
          title: "Stock Overview",
          url: `/dashboard/warehouse/stock-overview`,
          // roleField: "listProduct"
        },
        {
          title: "Low Stock Alert",
          url: `/dashboard/warehouse/low-stock-alert`,
          // roleField: "listProduct"
        },
        {
          title: "Stock Adjustment",
          url: `/dashboard/warehouse/stock-adjustment`,
          roleField: "stockAdjustment"
        },
        {
          title: "Stock Transfer",
          url: `/dashboard/warehouse/stock-transfer`,
          roleField: "stockTransfer"
        },
        {
          title: "Receive Stock",
          url: `/dashboard/warehouse/receive-stock`,
          // roleField: "manageCustomer"
        },
        {
          title: "Manage Warehouse",
          url: `/dashboard/warehouse/manage-warehouse`,
          // roleField: "listProduct"
        },
      ],
    },
    {
      title: "Products",
      url: "#",
      icon: Package,
      isActive: true,
      roleField: "product",
      items: [
        {
          title: "List Products",
          url: `/dashboard/products/list-products`,
          roleField: "listProduct"
        },
        {
          title: "Add Products",
          url: `/dashboard/products/add-products`,
          roleField: "manageProduct"
        },
        {
          title: "Units",
          url: `/dashboard/products/units`,
          roleField: "manageUnit"
        },
        {
          title: "Brands",
          url: `/dashboard/products/brands`,
          roleField: "manageCategory"
        },
        {
          title: "Categories",
          url: `/dashboard/products/categories`,
          roleField: "manageCategory"
        },
        {
          title: "Print Labels",
          url: `/dashboard/products/print-labels`,
          roleField: "managePrintLabel"
        },
        {
          title: "Variations",
          url: `/dashboard/products/variations`,
          roleField: "manageVariation"
        },
        {
          title: "Import Products",
          url: `/dashboard/products/import-products`,
          roleField: "manageImportProduct"
        },
        {
          title: "Selling group price",
          url: `/dashboard/products/selling-group-price`,
          roleField: "manageSellingGroupPrice"
        },
        {
          title: "Warrants",
          url: `/dashboard/products/warrants`,
          roleField: "manageWarrant"
        }
      ],
    },
    {
      title: "Sales",
      url: "#",
      icon: ShoppingCart,
      isActive: true,
      roleField: "sales",
      items: [
        {
          title: "All Sales",
          url: `/dashboard/sales/all-sales`,
          roleField: "manageAllSales"
        },
        {
          title: "Add Sales",
          url: `/dashboard/sales/add-sales`,
          roleField: "manageSales"
        },
        {
          title: "POS",
          url: `/pos`,
          roleField: "manageOrder"
        },
        {
          title: "List Sell Return",
          url: `/dashboard/sales/list-sell-return`,
          roleField: "listSellReturn"
        },
        {
          title: "Shipment",
          url: `/dashboard/sales/shipment`,
          roleField: "manageShipment"
        },
        {
          title: "Discount",
          url: `/dashboard/sales/discount`,
          roleField: "manageDiscount"
        },
        {
          title: "Import Sales",
          url: `/dashboard/sales/import-sales`,
          roleField: "importSales"
        }
      ],
    },
    {
      title: "Purchases",
      url: "#",
      icon: Truck,
      isActive: true,
      roleField: "purchase",
      items: [
        {
          title: "List Purchase",
          url: `/dashboard/purchase/list-purchase`,
          roleField: "listPurchase"
        },
        {
          title: "Purchase Groups",
          url: `/dashboard/purchase/list-purchase`,
          roleField: "listPurchase"
        },
        {
          title: "Add Purchase",
          url: `/dashboard/purchase/add-purchase`,
          roleField: "managePurchase"
        },
        {
          title: "List Purchase Return",
          url: `/dashboard/purchase/list-purchase-return`,
          roleField: "listPurchaseReturn"
        },
        {
          title: "Suppliers",
          url: `/dashboard/purchase/suppliers`,
          roleField: "importPurchase"
        }
      ],
    },
    {
      title: "Expenses",
      url: "#",
      icon: CreditCard,
      isActive: true,
      roleField: "expenses",
      items: [
        {
          title: "Expenses Categories",
          url: `/dashboard/expenses/expenses-categories`,
          roleField: "manageExpensesCategory"
        },
        {
          title: "Add Expenses",
          url: `/dashboard/expenses/add-expenses`,
          roleField: "manageExpenses"
        }, {
          title: "List Expenses",
          url: `/dashboard/expenses/list-expenses`,
          roleField: "listExpenses"
        }
      ],
    },
    {
      title: "Account Management",
      url: "#",
      icon: DollarSign,
      roleField: "paymentAccount",
      items: [
        {
          title: "List Accounts",
          url: `/dashboard/accounts/list-accounts`,
          roleField: "manageListAccount"
        },
        {
          title: "Balance Sheet",
          url: `/dashboard/accounts/balance-sheet`,
          roleField: "balanceSheet"
        }, {
          title: "Trial Balance",
          url: `/dashboard/accounts/trial-balance`,
          roleField: "trialBalance"
        }, {
          title: "Cash Flow",
          url: `/dashboard/accounts/cash-flow`,
          roleField: "cashFlow"
        }, {
          title: "Payment Account Report",
          url: `/dashboard/accounts/payment-account-report`,
          roleField: "paymentAccountReport"
        },
        {
          title: "Salary Structure",
          url: `/dashboard/hr-payroll/salary-structure`,
          roleField: "manageHr"
        },
        {
          title: "Salary Assign",
          url: `/dashboard/hr-payroll/salary-assign`,
          roleField: "manageHr"
        },
        {
          title: "Salary Payment",
          url: `/dashboard/hr-payroll/salary-payment`,
          roleField: "manageHr"
        },
      ],
    },
    {
      title: "Hr and Payroll",
      url: "#",
      icon: Combine,
      roleField: "hrManagement",
      items: [
        {
          title: "Departments",
          url: `/dashboard/hr/department`,
          roleField: "manageHr"
        },
        {
          title: "Staffs",
          url: `/dashboard/hr/staffs`,
          roleField: "manageHr"
        },
        {
          title: "Roles",
          url: `/dashboard/hr/manage-role`,
          roleField: "manageHr"
        },
        {
          title: "Request Salary",
          url: `/dashboard/hr-payroll/request-salary`,
          roleField: "manageRequestSalary",
        },
        {
          title: "Manage Salary Request",
          url: `/dashboard/hr-payroll/manage-request-salary`,
          roleField: "manageHr"
        },
        {
          title: "Request Leave",
          url: `/dashboard/hr-payroll/request-leave`,
          roleField: "manageRequestLeave",
        },
        {
          title: "Manage Leave",
          url: `/dashboard/hr-payroll/manage-leave`,
          roleField: "manageHr"
        },
        {
          title: "Awards",
          url: `/dashboard/hr-payroll/awards`,
          roleField: "manageHr"
        },
      ],
    },
    {
      title: "Reports",
      url: "#",
      icon: BarChart3,
      roleField: "report",
      items: [
        {
          title: "Profit/Lost Report",
          url: `/dashboard/report/profit-lost-report`,
          roleField: "profitLostReport"
        },
        {
          title: "Items Report",
          url: `/dashboard/report/items-report`,
          roleField: "itemsReport"
        },
        {
          title: "Register Report",
          url: `/dashboard/report/register-report`,
          roleField: "registerReport"
        },
        {
          title: "Expenses Report",
          url: `/dashboardreport//expenses-report`,
          roleField: "expensesReport"
        }, {
          title: "Product Sell Report",
          url: `/dashboard/report/product-sell-report`,
          roleField: "productSellReport"
        }, {
          title: "Product Purchase Report",
          url: `/dashboard/report/product-purchase-report`,
          roleField: "productPurchaseReport"
        }, {
          title: "Sell Return Report",
          url: `/dashboard/report/sell-return-report`,
          roleField: "sellReturnReport"
        }, {
          title: "Purchase Return Report",
          url: `/dashboard/report/purchase-return-report`,
          roleField: "purchaseReturnReport"
        }, {
          title: "Trending Product Report",
          url: `/dashboard/report/trending-product-report`,
          roleField: "trendingProductReport"
        }, {
          title: "Purchase & Sale Report",
          url: `/dashboard/report/purchase-sale-report`,
          // roleField: ""
        }, {
          title: "Stock Adjustment Report",
          url: `/dashboard/report/stock-adjustment-report`,
          roleField: "stockAdjustmentReport"
        }, {
          title: "Stock Transfer Report",
          url: `/dashboard/report/stock-transfer-report`,
          roleField: "stockTransferReport"
        }, {
          title: "Stock Expiry Report",
          url: `/dashboard/report/stock-expiry-report`,
          roleField: "stockExpiryReport"
        }, {
          title: "Stock Report",
          url: `/dashboard/report/stock-report`,
          roleField: "stockReport"
        }, {
          title: "Customer Group Report",
          url: `/dashboard/report/customer-group-report`,
          roleField: "customerGroupReport"
        }, {
          title: "Customer & Supplier Report",
          url: `/dashboard/report/customer-supplier-report`,
          roleField: "customerSupplierReport"
        }, {
          title: "Tax Report",
          url: `/dashboard/report/tax-report`,
          roleField: "taxReport"
        }, {
          title: "Sale Representative Report",
          url: `/dashboard/report/sale-representative-report`,
          roleField: "saleRepresentativeReport",
        }
      ],
    },
    {
      title: "Messaging Hub",
      url: "#",
      icon: Mail,
      roleField: "message",
      items: [
        {
          title: "Bulk Emails",
          url: `/dashboard/messaging/bulk-email`,
          roleField: "message",
        },
        {
          title: "Email Message",
          url: `/dashboard/messaging/email`,
          roleField: "message",
        },
      ],
    },
    {
      title: "History",
      url: `/dashboard/history`,
      icon: HistoryIcon,
      isActive: false,
    },
    {
      title: "Trash",
      url: `/dashboard/trash`,
      icon: Trash,
      isActive: false,
    }

  ];
  const isActive = useCallback(
    (url: string) => {
      const dashboardPath = `/dashboard`;

      if (pathname === dashboardPath || pathname === `${dashboardPath}/`) {
        return url === pathname; // Only activate when it exactly matches the dashboard
      }

      return pathname.startsWith(url) && url !== dashboardPath;
    },
    [pathname, ,]
  );

  // Automatically open collapsible if an item inside is active
  useEffect(() => {
    navMain.filter((group): group is NavItem => group !== false).forEach((group) => {
      if (group.items?.some((item) => isActive(item.url))) {
        setOpenGroup(group.title);
      }
    });
  }, [pathname]);


  return (

    <SidebarGroup className="scrollbar-hide">
      <SidebarGroupLabel>Nav links</SidebarGroupLabel>
      <SidebarMenu >
        {navMain
          .filter((item): item is NavItem => item !== false)
          .filter((item) => !item.roleField || (role && role[item.roleField as keyof IRole]))
          .map((item) =>
            item.items ? (
              <Collapsible
                key={item.title}
                open={openGroup === item.title}
                onOpenChange={() => setOpenGroup((prev) => (prev === item.title ? null : item.title))}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={cn(
                        "transition-colors hover:bg-primary/10 hover:text-primary",
                        item.items?.some((subItem) => isActive(subItem.url)) && "bg-primary text-white font-medium",
                      )}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight
                        className={`ml-auto shrink-0 transition-transform duration-200 ${openGroup === item.title ? "rotate-90" : ""}`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items
                        ?.filter((subItem) => !subItem?.roleField || (role && role[subItem?.roleField as keyof IRole]))
                        .map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              className={cn(
                                "transition-colors hover:text-primary",
                                isActive(subItem.url) && "bg-primary/10 text-primary font-medium",
                              )}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "transition-colors hover:bg-primary/10 hover:text-primary",
                    isActive(item.url) && "bg-primary text-white font-medium",
                  )}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ),
          )}
      </SidebarMenu>
    </SidebarGroup>

  )
}
