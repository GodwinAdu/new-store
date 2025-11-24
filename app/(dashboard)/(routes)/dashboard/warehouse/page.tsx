import { fetchAllWarehouses } from "@/lib/actions/warehouse.actions"
import WarehouseDashboard from "./_components/warehouse-dashboard"

export default async function WarehousePage() {
  const warehouses = await fetchAllWarehouses()

  return <WarehouseDashboard warehouses={warehouses} />
}