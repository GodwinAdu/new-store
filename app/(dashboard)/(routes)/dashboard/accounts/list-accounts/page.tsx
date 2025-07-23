import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import { AccountModal } from './_components/AccountModal'



const page = async () => {






  return (
    <>
      <div className="flex justify-between items-center">
        <Heading
          title="All Account"
        />
        <AccountModal />
      </div>
      <Separator />
      <div className="py-4">
        {/* <DataTable searchKey='name' columns={columns} data={data} /> */}
      </div>
    </>
  )
}

export default page
