import Heading from '@/components/commons/Header'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { currentUserRole } from '@/lib/helpers/get-user-role'
import { cn } from '@/lib/utils'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

const page = async () => {
     // Fetch the current user's role
  const role = await currentUserRole();
  // Redirect to the homepage if the user has no role
 
  // Destructure the 'addRole' permission from the user's role
  const { addPurchase } = role;
  return (
    <>
       <div className="flex justify-between items-center">
        <Heading
          title="Manage Purchase"
        />
        { (
          <Link
            href={`add-purchase/create`}
            className={cn(buttonVariants())}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Purchase
          </Link>
        )}
      </div>
      <Separator />
    </>
  )
}

export default page
