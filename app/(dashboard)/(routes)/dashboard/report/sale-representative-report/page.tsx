import React from 'react'
import SaleRepresentativeReport from './_components/SaleRepresentativeReport'
import { getCurrencySymbol } from '@/lib/settings/store.settings'

const page = async () => {
  const currency = await getCurrencySymbol()
  return (
    <>
    <SaleRepresentativeReport currency={currency} />
    </>
  )
}

export default page