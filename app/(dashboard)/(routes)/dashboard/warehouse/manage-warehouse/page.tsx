import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import { DataTable } from '@/components/table/data-table'
import WarehouseModal from './_components/warehouse-modal'
import { columns } from './_components/column'
import { fetchAllWarehouses } from '@/lib/actions/warehouse.actions'
import { fetchAllStaffs } from '@/lib/actions/employee.actions'



const page = async () => {
  const [data, staffs] = await Promise.all([
    fetchAllWarehouses(),
    fetchAllStaffs()
  ])

  return (
    <>
      <div className="flex justify-between items-center">
        <Heading title='Manage Warehouses' />
        <div className="flex items-center gap-2">
          <WarehouseModal staffs={staffs} />
        </div>
      </div>
      <Separator />
      <div className="py-4">
        <DataTable searchKey='name' data={data} columns={columns} />
      </div>
    </>
  )
}

export default page