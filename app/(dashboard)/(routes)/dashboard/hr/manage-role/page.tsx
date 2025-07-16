import Heading from '@/components/commons/Header'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getAllRoles } from '@/lib/actions/role.actions'
import { cn } from '@/lib/utils'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { currentUserRole } from '@/lib/helpers/get-user-role'
import RolesDisplayPage from './_component/Roles'


type RolePermissions = {
  addRole?: boolean;
  // add other permissions as needed
};

const page = async () => {

  const [role, values] = await Promise.all([
    currentUserRole(),
    getAllRoles(),
  ]);

  const addRole =
    role?.permissions && 'addRole' in role.permissions
      ? (role.permissions as RolePermissions).addRole
      : false;

  return (
    <>
      <div className="flex justify-between items-center">
        <Heading
          title="Role Management"
          description="View and manage user roles and their permissions."
        />
        {addRole && (
          <Link
            href={`manage-role/create-role`}
            className={cn(buttonVariants())}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create role
          </Link>
        )}
      </div>
      <Separator />
      <div className="">
        <RolesDisplayPage roles={values} />
      </div>
    </>
  )
}

export default page