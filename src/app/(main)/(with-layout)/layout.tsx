import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BottomNav } from "@/components/BottomNav";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <main className="pt-16 min-h-[calc(100vh-64px)] pb-32 lg:pb-0">
                {children}
            </main>
            <BottomNav />
            <Footer />
        </>
    );
}
