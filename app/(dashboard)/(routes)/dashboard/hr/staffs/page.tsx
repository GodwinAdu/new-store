import Heading from '@/components/commons/Header'
import React from 'react'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { DataTable } from '@/components/table/data-table'
import { columns } from './_components/column'
import { fetchAllStaffs } from '@/lib/actions/employee.actions'


const page = async () => {
  const staffs = await fetchAllStaffs()

  return (
    <>
      <div className="flex justify-between items-center">
        <Heading title='Manage Staffs' />
        <Link
          href={`staffs/create`}
          className={cn(buttonVariants())}
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Staff
        </Link>
      </div>
      <Separator />
      <DataTable searchKey='fullName' columns={columns} data={staffs} />

    </>
  )
}

export default page