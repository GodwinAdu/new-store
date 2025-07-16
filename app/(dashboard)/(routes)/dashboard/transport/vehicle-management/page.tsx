import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'

import { fetchAllTransport } from '@/lib/actions/transport.actions'
import { DataTable } from '@/components/table/data-table'
import { columns } from './_components/column'

const page = async () => {
    const transports = await fetchAllTransport();
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title='Manage Transports' />
                <div className="flex items-center gap-2">
                    {/* <CreateDriverDialog /> */}
                    <Link href="vehicle-management/create" className={cn(buttonVariants(), "group transition-all duration-300 hover:shadow-md")}>
                        <PlusCircle className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90 duration-300" />
                        Add Transport
                    </Link>
                </div>
            </div>
            <Separator />
            <div className="py-4">
                <DataTable searchKey='name' data={transports} columns={columns} />
            </div>
        </>
    )
}

export default page