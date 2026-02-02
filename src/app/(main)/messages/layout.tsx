import { Header } from "@/components/header";

export default function MessagesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <main className="pt-16 min-h-[calc(100vh-64px)] overflow-hidden">
                {children}
            </main>
        </>
    );
}
