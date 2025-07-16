'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import { getCurrencySymbol } from '@/lib/settings/store.settings';
import { useEffect, useState } from 'react';

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: 'saleDate',
        header: 'Sale Date',
        cell: ({ row }) => <div>{new Date(row.original.saleDate).toLocaleDateString()}</div>,
    },
    {
        accessorKey: 'customerId',
        header: 'Customer',
        cell: ({ row }) => (
            <div>{row.original.customerId === null ? 'Walk in customer' : ''}</div>
        ),
    },
    {
        accessorKey: 'product',
        header: 'Product',
        cell: ({ row }) => <ProductButton data={row.original} />,
    },
    {
        accessorKey: 'totalAmount',
        header: 'Total Amount',
        cell: ({ row }) => <div>{row.original.totalAmount}</div>,
    },
    {
        accessorKey: 'paymentMethod',
        header: 'Payment Method',
    },
    {
        accessorKey: 'shippingStatus',
        header: 'Status',
        cell: ({ row }) => (
            row.original.shippingStatus && (
                <span
                    className={`px-2 py-1 mr-2 rounded text-sm font-medium ${row.original.shippingStatus === "Delivered" || row.original.shippingStatus === "Shipped"
                        ? "bg-green-100 text-green-700"
                        : row.original.shippingStatus === "Cancelled" || row.original.shippingStatus === "Suspended"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                >
                    {row.original.shippingStatus}
                </span>
            )
        ),
    },
    {
        accessorKey: 'account',
        header: 'Account Linked',
        cell: ({ row }) => <div>{row.original.account?.name}</div>,
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

// Button Component for Product Column
const ProductButton = ({ data }: { data: any }) => {
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
                        <DialogTitle className="text-xl font-bold text-gray-800">Sale Details</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500">
                            Review the detailed information about this transaction.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                        {/* Transaction Info */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">Transaction Information</h2>
                            <p><strong>Invoice No:</strong> {data?.invoiceNo}</p>
                            <p><strong>Sale Date:</strong> {new Date(data.saleDate).toLocaleString()}</p>
                            <p><strong>Delivery To:</strong> {data.deliveryTo}</p>
                            <p><strong>Payment Method:</strong> {data.paymentMethod}</p>
                            <p><strong>Payment Date:</strong> {new Date(data.paymentDate).toLocaleString()}</p>
                            <p><strong>Shipping Address:</strong> {data.shippingAddress}</p>
                            <p><strong>Shipping Charges:</strong> {isLoading ? '-' : currency} {data.shippingCharges}</p>
                            <p><strong>Shipping Status:</strong> {data.shippingStatus}</p>
                        </div>

                        {/* Products */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">Products</h2>
                            <div className="border border-gray-200 rounded-md p-4">
                                {data.products.map((product, index) => (
                                    <div
                                        key={product._id}
                                        className="flex justify-between items-center border-b border-gray-200 py-2 last:border-none"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Image
                                            width={100}
                                            height={100}
                                                src={product.productId.images[0]}
                                                alt={product.productId.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-800">{product.productId.name}</p>
                                                <p className="text-sm text-gray-500">Unit: {product.unit.name}{`(${product.unit.quantity})`}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p>Qty: {product.quantity}</p>
                                            <p className="font-medium text-gray-800">
                                                Subtotal: {isLoading ? '-' : currency} {product.subTotal}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="mt-6 border-t pt-4">
                            <h2 className="text-lg font-semibold text-gray-700">Summary</h2>
                            <p><strong>Discount:</strong> {isLoading ? '-' : currency} {data.discountAmount}</p>
                            <p><strong>Tax Amount:</strong> {isLoading ? '-' : currency} {data.taxAmount}</p>
                            <p className="text-xl font-bold text-gray-800">
                                Total Amount: {isLoading ? '-' : currency} {data.totalAmount}
                            </p>
                        </div>
                    </div>

                </DialogContent>
            </Dialog>


        </>
    );
};
