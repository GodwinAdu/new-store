
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchRoleById } from "@/lib/actions/role.actions";
import Heading from "@/components/commons/Header";
import CreateRoleForm from "../_component/CreateRoleForm";

type Props = Promise<{ schoolId: string, adminId: string, manageRoleId: string }>
const page = async ({ params }: { params: Props}) => {



 const { schoolId,adminId,manageRoleId } = await params;

  const initialData = await fetchRoleById(manageRoleId)


  return (
    <>
      <div className="flex justify-between items-center">
        <Heading
          title="Update Role"
          description="manage role and update it"
        />

        <Link
          href={`/${schoolId}/admin/${adminId}/system-config/manage-role`}
          className={cn(buttonVariants())}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
      </div>
      <Separator />
      <CreateRoleForm type="update" initialData={initialData} />
    </>
  )
}

export default page
