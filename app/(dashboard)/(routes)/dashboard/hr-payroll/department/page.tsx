import Heading from '@/components/commons/Header'
import React from 'react'
import { DepartmentModal } from './_components/DepartmentModal'
import { Separator } from '@/components/ui/separator'
import { fetchAllDepartments } from '@/lib/actions/department.actions'
import { DataTable } from '@/components/table/data-table'
import { columns, DepartmentColumn } from './_components/column'
import { format } from 'date-fns'

const page = async () => {
  const data = await fetchAllDepartments();

  const formattedData: DepartmentColumn[] = data.map((item: any) => ({
    id: item._id,
    name: item.name,
    description: item.description || 'N/A',
    createdBy: item.createdBy?.fullName || 'Unknown',
    createdAt: format(new Date(item.createdAt), 'MMM dd, yyyy'),
  }));

  return (
    <>
      <div className="flex justify-between items-center px-3">
        <Heading title="Manage Department" />
        <div className="flex gap-4">
          <DepartmentModal />
        </div>
      </div>
      <Separator />
      <div className="py-4">
        <DataTable searchKey='name' data={formattedData} columns={columns} />
      </div>
    </>
  )
}

export default page
