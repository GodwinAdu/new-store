import { Separator } from "@/components/ui/separator";
import TransportForm from "../_components/transport-form";
import Heading from "@/components/commons/Header";

export default function Page() {
  return (
    <>
      <div className="flex justify-between items-center">
        <Heading title='Add New Transport' />
      </div>
      <Separator />
      <TransportForm type="create" />
    </>
  )
}
