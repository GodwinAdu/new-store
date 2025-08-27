import React from 'react'
import { AppSidebar } from './app-sidebar'
import { currentUserRole } from '@/lib/helpers/get-user-role';
import { currentUser } from '@/lib/helpers/session';
import { hasWarehouseAccess } from '@/lib/helpers/warehouse-access';


const AppSidebarMain = async () => {

    const [user, userRole, warehouseAccess] = await Promise.all([
        currentUser(),
        currentUserRole(),
        hasWarehouseAccess(),
    ])


    return (
        <>
            <AppSidebar userRole={userRole as IRole} user={user} hasWarehouseAccess={warehouseAccess} />
        </>
    )
}

export default AppSidebarMain
