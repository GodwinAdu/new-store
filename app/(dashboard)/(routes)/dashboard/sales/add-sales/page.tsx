import Heading from '@/components/commons/Header'
import { Separator } from '@/components/ui/separator'
import { currentBranch } from '@/lib/helpers/current-branch';
import { currentUser } from '@/lib/helpers/current-user';
import React from 'react'
import { fetchAllAccounts } from '@/lib/actions/account.acctions';
import CreateSaleForm from './_components/create-sale-form';
import { getCurrencySymbol, paymentMethods } from '@/lib/settings/store.settings';



const page = async ({ params }: { params: BranchIdParams }) => {

    const { branchId } = await params;
    const user = await currentUser();
    const branch = await currentBranch(branchId);
    const accounts = await fetchAllAccounts();
    const methods = await paymentMethods() || [];
    const currency = await getCurrencySymbol();

    return (
        <div className='space-y-2'>
            <div className="">
                <Heading
                    title="Add New Sale"
                />
            </div>
            <Separator />
            <div className="py-4">
                <CreateSaleForm
                    branch={branch}
                    accounts={accounts}
                    currency={currency}
                    paymentMethods={methods}
                />
            </div>
        </div>
    )
}

export default page
