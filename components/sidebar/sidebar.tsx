import { NavMain } from "./nav-main"


const SideContent = ({ role, hasWarehouseAccess, userRole }: { role: any, hasWarehouseAccess: boolean, userRole?: string }) => {

    return (
        <>
            <NavMain role={role} hasWarehouseAccess={hasWarehouseAccess} userRole={userRole} />
        </>
    )
}

export default SideContent
