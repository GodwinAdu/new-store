import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import { GroupModal } from './_components/GroupModal'
import { DataTable } from '@/components/table/data-table'
import { columns } from './_components/column'
import { fetchAllSellingGroups } from '@/lib/actions/selling-group.actions'

const page = async () => {
  const data = await fetchAllSellingGroups() || [];
  return (
    <>
      <div className="flex justify-between items-center px-3">
        <Heading title="Selling Group Price" />
        <div className="flex gap-4">
          <GroupModal />
        </div>
      </div>
      <Separator />

      <DataTable searchKey='name' columns={columns} data={data} />

    </>
  )
}

export default page
