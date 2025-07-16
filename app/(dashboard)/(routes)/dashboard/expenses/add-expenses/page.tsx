import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import ExpenseForm from './_components/ExpensesForm'
import { fetchAllAccounts } from '@/lib/actions/account.acctions'
import { fetchAllExpensesCategoriesWithBranchId } from '@/lib/actions/expenses-category.actions'
import { getCurrencySymbol, paymentMethods } from '@/lib/settings/store.settings'

const page = async () => {
  const accounts = await fetchAllAccounts() || [];
  const categories = await fetchAllExpensesCategoriesWithBranchId() || [];
  const currency = await getCurrencySymbol();
  const methods = await paymentMethods();
  return (
    <>
      <div className="flex justify-between items-center px-3">
        <Heading title="Expenses" />
      </div>
      <Separator /> 
      <ExpenseForm currency={currency} paymentMethods={methods} accounts={accounts} categories={categories} />
    </>
  )
}

export default page
