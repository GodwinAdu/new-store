
import { TourProvider } from "@/app/context/TourContext";
import TourLayout from "@/app/provider/TourLayout";
import Navbar from "@/components/dashboard/Navbar";
import AppSidebarMain from "@/components/sidebar/app-sidebar-main";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { currentUser } from "@/lib/helpers/session";


export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [user] = await Promise.all([
        currentUser() ?? null,
    ]);

    return (
        <TourProvider>
            <TourLayout>
                <SidebarProvider className="sidebar">
                    <AppSidebarMain />
                    <SidebarInset >
                        <Navbar user={user} />
                        <div className="relative scrollbar-hide">
                            <div id="main-content" className="py-4 px-4 overflow-hidden scrollbar-hide">
                                {children}
                                {/* <UseCheckStoreExpired /> */}
                            </div>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </TourLayout>
        </TourProvider>
    );
}
