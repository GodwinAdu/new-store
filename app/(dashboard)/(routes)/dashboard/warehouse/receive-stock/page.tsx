import { fetchAllProducts } from "@/lib/actions/product.actions"
import { fetchAllWarehouses } from "@/lib/actions/warehouse.actions"
import ReceiveStockClient from "./_components/receive-stock-client"

export default async function ReceiveStock() {
  const [products, warehouses] = await Promise.all([
    fetchAllProducts(),
    fetchAllWarehouses()
  ])

  return (
    <ReceiveStockClient 
      products={products}
      warehouses={warehouses}
    />
  )
}