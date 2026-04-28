import { Suspense } from "react"
import PurchaseOrderClient from "./_components/purchase-order-client"
import { getPurchaseOrders } from "@/lib/actions/advanced-stock.actions"
import { fetchAllWarehouses } from "@/lib/actions/warehouse.actions"
import Supplier from "@/lib/models/supplier.models"
import Product from "@/lib/models/product.models"
import { connectToDB } from "@/lib/mongoose"

async function getData() {
  await connectToDB()
  const [pos, warehouses, suppliers, products] = await Promise.all([
    getPurchaseOrders(),
    fetchAllWarehouses(),
    Supplier.find({ status: 'active' }).lean(),
    Product.find({ isActive: true }).lean()
  ])
  
  return {
    purchaseOrders: pos,
    warehouses,
    suppliers: JSON.parse(JSON.stringify(suppliers)),
    products: JSON.parse(JSON.stringify(products))
  }
}

export default async function PurchaseOrdersPage() {
  const data = await getData()
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PurchaseOrderClient {...data} />
    </Suspense>
  )
}
