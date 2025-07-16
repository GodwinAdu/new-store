
import { Separator } from '@/components/ui/separator'
import { BrandModal } from './_components/BrandModal'
import { columns } from './_components/column'

import Heading from '@/components/commons/Header'
import { DataTable } from '@/components/table/data-table'
import { fetchAllBrands } from '@/lib/actions/brand.actions'


const page = async () => {

    const brands = await fetchAllBrands()

    return (
        <>
            <div className="flex justify-between items-center px-3">
                <Heading title="Manage Brands" />
                <div className="flex gap-4">
                    <BrandModal />
                </div>
            </div>
            <Separator />
            <DataTable searchKey='name' data={brands} columns={columns} />
        </>
    )
}

export default page
