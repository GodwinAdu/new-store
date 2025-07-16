import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import { UnitModal } from './_components/UnitModal'
import { DataTable } from '@/components/table/data-table'
import { columns } from './_components/column'
import { fetchAllUnits } from '@/lib/actions/unit.actions'


const page = async () => {
  const data = await fetchAllUnits();

  return (
    <>
      <div className="flex justify-between items-center px-3">
        <Heading title="Manage Units" />
        <div className="flex gap-4">
          <UnitModal />
        </div>
      </div>
      <Separator />
      <DataTable searchKey='name' columns={columns} data={data} />
    </>
  )
}

export default page
