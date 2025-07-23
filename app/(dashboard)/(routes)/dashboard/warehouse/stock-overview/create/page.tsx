import React from 'react'
import AddStock from '../_components/create-stock-form'
import { fetchAllProducts } from '@/lib/actions/product.actions'
import { fetchAllWarehouses } from '@/lib/actions/warehouse.actions'

const page = async () => {

  const [products, warehouses] = await Promise.all([
    fetchAllProducts(),
    fetchAllWarehouses()
  ])
  return (
    <><AddStock products={products} warehouses={warehouses} /></>
  )
}

export default page