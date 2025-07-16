import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import { currentUserRole } from '@/lib/helpers/get-user-role'
import { redirect } from 'next/navigation'
import React from 'react'
import { fetchAllBrands } from '@/lib/actions/brand.actions'
import { fetchAllCategories } from '@/lib/actions/category.actions'
import ListProductTable from './_components/list-product-table'


const page = async () => {
  // Fetch the current user's role
  const role = await currentUserRole();
  // Redirect to the homepage if the user has no role
  if (!role) {
    redirect("/")
  }

  const brands = await fetchAllBrands() || [];

  const categories = await fetchAllCategories() || [];

  return (
    <>
      <div className="flex justify-between items-center">
        <Heading
          title="All Products List"
        />

      </div>
      <Separator />
      <div className="py-4">
        <ListProductTable brands={brands} categories={categories} />
      </div>
    </>
  )
}

export default page
