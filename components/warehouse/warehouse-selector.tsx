"use client"

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Warehouse } from "lucide-react";

interface WarehouseSelectorProps {
  userWarehouses: string[];
  selectedWarehouse?: string;
  onWarehouseChange?: (warehouseId: string) => void;
  className?: string;
}

export function WarehouseSelector({ 
  userWarehouses, 
  selectedWarehouse, 
  onWarehouseChange,
  className 
}: WarehouseSelectorProps) {
  const [selected, setSelected] = useState(selectedWarehouse || userWarehouses[0] || "");

  useEffect(() => {
    if (selectedWarehouse) {
      setSelected(selectedWarehouse);
    }
  }, [selectedWarehouse]);

  const handleChange = (value: string) => {
    setSelected(value);
    onWarehouseChange?.(value);
  };

  if (userWarehouses.length === 0) {
    return (
      <Badge variant="destructive" className={className}>
        <Warehouse className="mr-1 h-3 w-3" />
        No Warehouse Access
      </Badge>
    );
  }

  if (userWarehouses.length === 1) {
    return (
      <Badge variant="secondary" className={className}>
        <Warehouse className="mr-1 h-3 w-3" />
        Warehouse: {userWarehouses[0]}
      </Badge>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Warehouse className="h-4 w-4 text-muted-foreground" />
      <Select value={selected} onValueChange={handleChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select warehouse" />
        </SelectTrigger>
        <SelectContent>
          {userWarehouses.map((warehouseId) => (
            <SelectItem key={warehouseId} value={warehouseId}>
              Warehouse {warehouseId}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}