"use client"

import React from "react"
import { motion } from "framer-motion"
import { Home, Compass, Plus, MessageCircle, User, Star } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

export function BottomNav() {
    const pathname = usePathname()
    const { user } = useAuth()

    const items = [
        { icon: Home, label: "Home", href: "/" },
        { icon: Compass, label: "Explore", href: "/explore" },
        { icon: Plus, label: "Create", href: "/create", isMain: true },
        { icon: MessageCircle, label: "Chats", href: "/messages", badge: 5 },
        {
            icon: user?.photoURL ? (() => <img src={user.photoURL || undefined} className="w-6 h-6 rounded-full object-cover" alt="" />) : User,
            label: "Profile",
            href: user ? `/${user.displayName || 'profile'}` : "/login"
        },
    ]

    return (
        <div id="bottom-nav-container" className="lg:hidden fixed bottom-6 left-6 right-6 z-[100] pointer-events-none">
            <div className="w-full h-16 bg-[#121212]/90 backdrop-blur-2xl border border-white/5 rounded-[2rem] flex items-center justify-around pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.8)] px-2">
                {items.map((item, idx) => {
                    const isActive = pathname === item.href

                    if (item.isMain) {
                        return (
                            <Link key={idx} href={item.href} className="relative z-10">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-12 h-12 bg-cyber-pink rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,45,108,0.4)] border border-white/10"
                                >
                                    <Plus className="w-6 h-6 text-white" />
                                </motion.div>
                            </Link>
                        )
                    }

                    return (
                        <Link key={idx} href={item.href} className="flex flex-col items-center justify-center w-12 h-12 relative group">
                            <motion.div
                                whileTap={{ scale: 0.8 }}
                                className={cn(
                                    "transition-all duration-300",
                                    isActive ? "text-cyber-pink scale-110" : "text-white/40 group-hover:text-white"
                                )}
                            >
                                <item.icon className="w-6 h-6" />
                            </motion.div>

                            {item.badge && !isActive && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-cyber-pink rounded-full border border-[#0C0C0C]" />
                            )}

                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-indicator"
                                    className="absolute -bottom-1 w-1 h-1 bg-cyber-pink rounded-full shadow-[0_0_8px_rgba(255,45,108,0.8)]"
                                />
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
