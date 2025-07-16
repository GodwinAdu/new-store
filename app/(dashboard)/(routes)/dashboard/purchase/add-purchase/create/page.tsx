import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import PurchaseForm from '../_components/PurchaseForm'

const page = () => {
  return (
    <>
       <div className="flex justify-between items-center">
        <Heading
          title="Purchase Form"
        />

      </div>
      <Separator />
      <div className="py-4">
        <PurchaseForm />
      </div>
    </>
  )
}

export default page
