"use client"

import { useEffect, useState } from "react";
import { LucideReceiptText, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WarehouseNavSectionProps {
  role: IRole | undefined;
  openGroup: string | null;
  setOpenGroup: (group: string | null) => void;
  isActive: (url: string) => boolean;
  hasWarehouseAccess: boolean;
}

export function WarehouseNavSection({ 
  role, 
  openGroup, 
  setOpenGroup, 
  isActive, 
  hasWarehouseAccess 
}: WarehouseNavSectionProps) {
  // Temporarily show warehouse section for debugging
  // if (!hasWarehouseAccess) {
  //   return null;
  // }

  const warehouseItems = [
    {
      title: "Manage Warehouse",
      url: `/dashboard/warehouse/manage-warehouse`,
    },
    {
      title: "Stock Overview",
      url: `/dashboard/warehouse/stock-overview`,
    },
    {
      title: "Low Stock Alert",
      url: `/dashboard/warehouse/low-stock-alert`,
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
    },
  ];

  return (
    <Collapsible
      key="Warehouse"
      open={openGroup === "Warehouse"}
      onOpenChange={() => setOpenGroup(openGroup === "Warehouse" ? null : "Warehouse")}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip="Warehouse"
            className={cn(
              "transition-colors hover:bg-primary/10 hover:text-primary",
              warehouseItems.some((subItem) => isActive(subItem.url)) && "bg-primary text-white font-medium",
            )}
          >
            <LucideReceiptText />
            <span>Warehouse</span>
            <ChevronRight
              className={`ml-auto shrink-0 transition-transform duration-200 ${
                openGroup === "Warehouse" ? "rotate-90" : ""
              }`}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {warehouseItems
              .filter((subItem) => !subItem?.roleField || (role && role[subItem?.roleField as keyof IRole]))
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
  );
}