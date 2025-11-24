import { fetchAllProducts } from "@/lib/actions/product.actions"
import { fetchAllWarehouses } from "@/lib/actions/warehouse.actions"
import { getShipments } from "@/lib/actions/transport.actions"
import ReceiveStockClient from "./_components/receive-stock-client"

export default async function ReceiveStock() {
  const [products, warehouses, shipments] = await Promise.all([
    fetchAllProducts(),
    fetchAllWarehouses(),
    getShipments()
  ])

  return (
    <ReceiveStockClient 
      products={products}
      warehouses={warehouses}
      shipments={shipments}
    />
  )
}