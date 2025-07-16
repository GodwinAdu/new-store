import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import SalesTable from './_components/all-sales-table'

const page = () => {
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading
                    title="All Sales"
                />

            </div>
            <Separator />
            <div className="py-4">
                <SalesTable />
            </div>
        </>
    )
}

export default page