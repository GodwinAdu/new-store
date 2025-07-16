import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import { currentUserRole } from '@/lib/helpers/get-user-role'
import { redirect } from 'next/navigation'
import React from 'react'
import { AccountModal } from './_components/AccountModal'
import { fetchAllBranches } from '@/lib/actions/branch.actions'
import { currentUser } from '@/lib/helpers/current-user'
import { DataTable } from '@/components/table/data-table'
import { columns } from './_components/column';
import { fetchAllAccounts } from '@/lib/actions/account.acctions'

const page = async () => {
  const user = await currentUser();
  const role = await currentUserRole();
  // Redirect to the homepage if the user has no role
  if (!role) {
    redirect("/")
  }

  const branches = await fetchAllBranches() || [];

  // Destructure the 'addRole' permission from the user's role
  const { addListAccount } = role;

  const data = await fetchAllAccounts() || [];

  console.log(data,'account')

  return (
    <>
      <div className="flex justify-between items-center">
        <Heading
          title="All Account"
        />
        {addListAccount && (
          <AccountModal branches={branches} user={user} />
        )}
      </div>
      <Separator />
      <div className="py-4">
        <DataTable searchKey='name' columns={columns} data={data} />
      </div>
    </>
  )
}

export default page
