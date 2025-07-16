import Heading from '@/components/commons/Header'
import React from 'react'

import { Separator } from '@/components/ui/separator'
import { getAllRoles } from '@/lib/actions/role.actions'
import { fetchAllDepartments } from '@/lib/actions/department.actions'
import Link from 'next/link'
import { ArrowLeftCircle } from 'lucide-react'
import { CreateStaffForm } from '../_components/create-staff'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'


const page = async () => {
    const [roles, departments] = await Promise.all([
        getAllRoles(),
        fetchAllDepartments()
    ])
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title='Create New Staff' />
                <Link href='/dashboard/hr/staffs' className={cn(buttonVariants())}><ArrowLeftCircle className='w-4 h-4' />Back</Link>
            </div>
            <Separator />
        <div className="py-6 px-4">
            <CreateStaffForm roles={roles} departments={departments} />
        </div>
        </>
    )
}

export default page