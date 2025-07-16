import { Separator } from "@/components/ui/separator";
import TransportForm from "../_components/transport-form";
import Heading from "@/components/commons/Header";
import { fetchTransportById } from "@/lib/actions/transport.actions";

export default async function Page({ params }: { params: Promise<{ transportId: string }> }) {
    const { transportId } = await params;

    const data = await fetchTransportById(transportId)
    return (
        <>
            <div className="flex justify-between items-center">
                <Heading title='Add New Transport' />
            </div>
            <Separator />
            <TransportForm type="update" initialData={data} />
        </>
    )
}
