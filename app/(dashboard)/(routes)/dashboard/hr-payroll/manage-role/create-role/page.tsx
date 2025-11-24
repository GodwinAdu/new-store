

import { cn } from "@/lib/utils";
import { ArrowLeft,  } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CreateRoleForm from "../_component/CreateRoleForm";
import Heading from "@/components/commons/Header";


const page = async () => {


  return (
    <>
      <div className="flex justify-between items-center">
        <Heading
          title="Create Role"
          description="Add new role "
        />

        <Link
          href={`/`}
          className={cn(buttonVariants())}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
      </div>
      <Separator />
      <CreateRoleForm type="create" />
    </>
  );
};

export default page;
