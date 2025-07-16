import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import ProductFormDialog from './_components/product-form-dialog'
import { fetchAllUnits } from '@/lib/actions/unit.actions'
import { fetchAllBrands } from '@/lib/actions/brand.actions'
import { fetchAllCategories } from '@/lib/actions/category.actions'
import { DataTable } from '@/components/table/data-table'
import { columns } from './_components/column'
import { fetchAllProducts } from '@/lib/actions/product.actions'

const page = async () => {

  const [units, brands, categories,products] = await Promise.all([
    fetchAllUnits(),
    fetchAllBrands(),
    fetchAllCategories(),
    fetchAllProducts()
  ])


  return (
    <>
      <div className="flex justify-between items-center">
        <Heading
          title="Manage Products"
        />
        <ProductFormDialog
          units={units}
          brands={brands}
          categories={categories}
        />
      </div>
      <Separator />
      <div className="py-4">
        <DataTable searchKey='name' data={products} columns={columns} />
      </div>
    </>
  )
}

export default page
