

import React from 'react'

const page = async ({ params }: { params: Promise<{ unitId: string }> }) => {
    const { unitId } = await params;
    return (
        <div>page {unitId}</div>
    )
}

export default page