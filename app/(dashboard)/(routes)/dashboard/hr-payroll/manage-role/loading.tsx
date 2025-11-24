import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export default function Loading() {
    return (
        <>
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[250px]" /> {/* Title */}
                    <Skeleton className="h-4 w-[350px]" /> {/* Description */}
                </div>
                <Skeleton className="h-10 w-[120px] rounded-md" /> {/* Create role button */}
            </div>
            <Separator className="my-4" />

            {/* Skeleton for RolesDisplayPage */}
            <div className="space-y-6">
                {/* Role cards */}
                {Array(3).fill(null).map((_, index) => (
                    <div key={index} className="border rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-[180px]" /> {/* Role name */}
                            <div className="flex space-x-2">
                                <Skeleton className="h-9 w-9 rounded-md" /> {/* Edit button */}
                                <Skeleton className="h-9 w-9 rounded-md" /> {/* Delete button */}
                            </div>
                        </div>

                        <Separator />

                        {/* Role description */}
                        <Skeleton className="h-4 w-full max-w-[600px]" />

                        {/* Permissions section */}
                        <div className="pt-4">
                            <Skeleton className="h-5 w-[120px] mb-3" /> {/* Permissions heading */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Array(9).fill(null).map((_, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4 rounded-sm" /> {/* Checkbox */}
                                        <Skeleton className="h-4 w-[120px]" /> {/* Permission name */}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Users with this role */}
                        <div className="pt-4">
                            <Skeleton className="h-5 w-[150px] mb-3" /> {/* Users heading */}
                            <div className="flex flex-wrap gap-2">
                                {Array(4).fill(null).map((_, i) => (
                                    <Skeleton key={i} className="h-8 w-[120px] rounded-full" />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}