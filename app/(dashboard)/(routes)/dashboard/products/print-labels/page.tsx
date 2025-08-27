import { fetchAllProducts } from "@/lib/actions/product.actions"
import { fetchAllStocks } from "@/lib/actions/product-batch.actions"
import PrintLabelsClient from "./_components/print-labels-client"

export default async function PrintLabelsPage() {
  const [products, stockData] = await Promise.all([
    fetchAllProducts(),
    fetchAllStocks()
  ])

  return (
    <PrintLabelsClient 
      products={products}
      stockData={stockData}
    />
  )
}