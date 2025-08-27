import { getUserWarehouses } from "@/lib/helpers/warehouse-access";
import { WarehouseSelector } from "./warehouse-selector";

interface WarehouseProviderProps {
  children?: React.ReactNode;
  showSelector?: boolean;
  className?: string;
}

export async function WarehouseProvider({ 
  children, 
  showSelector = false, 
  className 
}: WarehouseProviderProps) {
  const userWarehouses = await getUserWarehouses();

  return (
    <div className="space-y-4">
      {showSelector && (
        <WarehouseSelector 
          userWarehouses={userWarehouses} 
          className={className}
        />
      )}
      {children}
    </div>
  );
}