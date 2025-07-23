import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import PurchaseForm from '../_components/PurchaseForm'
import { fetchAllProducts } from '@/lib/actions/product.actions'
import { fetchAllWarehouses } from '@/lib/actions/warehouse.actions'

const page = async () => {
  const [products, warehouses] = await Promise.all([
    fetchAllProducts(),
    fetchAllWarehouses()
  ])
  return (
    <>
      <div className="flex justify-between items-center">
        <Heading
          title="Create Purchase Order"
          description='Add a new purchase order from suppliers'
        />

      </div>
      <Separator />
      <div className="py-4">
        <PurchaseForm products={products} warehouses={warehouses} />
      </div>
    </>
  )
}

export default page
