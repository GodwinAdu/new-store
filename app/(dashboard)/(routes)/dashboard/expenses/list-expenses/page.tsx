import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import ExpensesTable from './_components/ExpensesTable'


const page = () => {
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading
                    title="All Expenses"
                />

            </div>
            <Separator />
            <div className="py-4">
                <ExpensesTable />
            </div>
        </>
    )
}

export default page