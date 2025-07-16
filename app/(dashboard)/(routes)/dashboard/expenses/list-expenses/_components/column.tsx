'use client';


import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { getCurrencySymbol } from '@/lib/settings/store.settings';

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: 'referenceNo',
        header: 'Details',
        cell: ({ row }) => <DetailButton data={row.original} />,
    },
    {
        accessorKey: 'paymentMethod',
        header: 'Payment Method',
    },
    {
        accessorKey: 'totalAmount',
        header: 'Total Amount',
    },
    {
        accessorKey: 'createdBy',
        header: 'Created By',
        cell: ({ row }) => <div>{row.original.createdBy?.fullName}</div>,
    },
    {
        id: 'actions',
        cell: ({ row }) => <CellAction data={row.original} />,
    },
];



// Button Component for Detail Column
const DetailButton = ({ data }: { data: any }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [currency, setCurrency] = useState<string>('');

    useEffect(() => {
        const fetchCurrency = async () => {
            try {
                setIsLoading(true);
                const result = await getCurrencySymbol();
                setCurrency(result);
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchCurrency()
    },[]);

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                        View
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] p-6 bg-white rounded-lg shadow-lg h-[70%] overflow-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-800">Expenses Details</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500">
                            Review the detailed information about this expenses.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        {/* Transaction Info */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">Expenses Information</h2>
                            <p><strong>Reference No:</strong> {data?.referenceNo}</p>
                            <p><strong>Expenses Date:</strong> {new Date(data.expenseDate).toLocaleString()}</p>
                            <p><strong>Expense For:</strong> {data.expenseFor}</p>
                            <p><strong>Expense Note:</strong> {data.expenseNote}</p>
                            <p><strong>Payment Method:</strong> {data.paymentMethod}</p>
                            <p><strong>Payment Amount:</strong> {isLoading ? '-' : currency} {data.paymentAmount}</p>
                            <p><strong>Payment Date:</strong> {new Date(data.paymentDate).toLocaleString()}</p>
                            <p><strong>Tax:</strong> {data.tax}</p>
                            <p><strong>Total Amount:</strong> {isLoading ? '-' : currency} {data.totalAmount}</p>
                        </div>

                        {/* Products */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">Refund</h2>
                            <p><strong>Is Refund:</strong> {data.isRefund ? 'Yes' : 'No'}</p>

                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">Recurring</h2>
                            <p><strong>Is Recurring:</strong> {data.recurring.isRefund ? 'Yes' : 'No'}</p>
                            <p><strong>Recurring Interval:</strong> {data.recurring.recurringInterval}</p>
                            <p><strong>Repetition:</strong> {data.recurring.repetition}</p>

                        </div>


                    </div>

                </DialogContent>
            </Dialog>


        </>
    );
};
