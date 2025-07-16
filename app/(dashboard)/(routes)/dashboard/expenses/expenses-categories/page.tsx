import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import { fetchAllBranches } from '@/lib/actions/branch.actions'
import { currentUser } from '@/lib/helpers/current-user'
import React from 'react'
import { ExpensesCategoriesModal } from './_components/ExpensesCategoriesModal'
import { DataTable } from '@/components/table/data-table'
import { columns } from './_components/column'
import { fetchAllExpensesCategoriesWithBranchId } from '@/lib/actions/expenses-category.actions'

const page = async () => {
    const user = await currentUser();
    const branches = await fetchAllBranches() || [];
    const data = await fetchAllExpensesCategoriesWithBranchId() || [];
  return (
    <>
      <div className="flex justify-between items-center px-3">
        <Heading title="Expenses Categories" />
        <div className="flex gap-4">
          <ExpensesCategoriesModal user={user} branches={branches} />
        </div>
      </div>
      <Separator /> 
      <DataTable searchKey='name' data={data} columns={columns} />
    </>
  )
}

export default page
