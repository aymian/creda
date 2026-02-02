import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Creda | 2026 Focus Revolution",
  description: "The only social network designed to make you focused, not distracted.",
};

import { AuthProvider } from "@/context/AuthContext";
import { LogoutModal } from "@/components/LogoutModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-cyber-pink selection:text-white bg-[#0C0C0C]`}
      >
        <AuthProvider>
          {children}
          <LogoutModal />
        </AuthProvider>
      </body>
    </html>
  );
}
