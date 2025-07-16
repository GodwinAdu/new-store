import React from 'react'
import ProfitLossReport from './_components/ProfitLostReport'
import { getCurrencySymbol } from '@/lib/settings/store.settings'

const page = async () => {
  const currency = await getCurrencySymbol()
  return (
    <>
      <ProfitLossReport currency={currency} />
    </>
  )
}

export default page