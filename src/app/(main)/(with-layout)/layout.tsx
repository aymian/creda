import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <main className="pt-16 min-h-[calc(100vh-64px)]">
                {children}
            </main>
            <Footer />
        </>
    );
}
