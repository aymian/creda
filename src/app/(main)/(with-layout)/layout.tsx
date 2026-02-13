"use client"

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BottomNav } from "@/components/BottomNav";
import { usePathname } from "next/navigation";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const isProfilePage = pathname?.startsWith('/') && pathname?.split('/').length === 2 && !['login', 'signup', 'messages', 'settings', 'wallet', 'deposit', 'withdraw', 'create', 'call', 'earnings', 'manage', 'onboarding', 'upgrade', 'payment', 'get-app'].includes(pathname.split('/')[1]);

    return (
        <>
            <Header />
            <main className="pt-16 min-h-[calc(100vh-64px)] pb-32 lg:pb-0">
                {children}
            </main>
            <BottomNav />
            {!isProfilePage && <Footer />}
        </>
    );
}
