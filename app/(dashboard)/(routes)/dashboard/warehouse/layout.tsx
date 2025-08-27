import { hasWarehouseAccess } from "@/lib/helpers/warehouse-access";
import { currentUser } from "@/lib/helpers/session";
import { redirect } from "next/navigation";

export default async function WarehouseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [hasAccess, user] = await Promise.all([
        hasWarehouseAccess(),
        currentUser()
    ]);

    // Allow access if user has warehouse access or is admin
    if (!hasAccess && user?.role !== "admin") {
        redirect("/dashboard/warehouse-access-denied");
    }

    return <>{children}</>;
}