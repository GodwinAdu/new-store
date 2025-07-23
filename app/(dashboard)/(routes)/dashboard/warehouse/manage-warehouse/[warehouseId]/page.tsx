import React from 'react'

const page = async ({ params }: { params: Promise<{ warehouseId: string }> }) => {
    const {warehouseId} = await params;
    return (
        <div>warehouse page {warehouseId}</div>
    )
}

export default page 