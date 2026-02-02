"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    ThumbsUp,
    Users,
    Compass,
    MessageCircle,
    Plus,
    LogIn,
    Star,
    Menu,
    X,
    Trophy,
    CreditCard,
    Bell,
    LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { UserDropdown } from "@/components/UserDropdown"
import { CredaLogo } from "@/components/logo"
import { SearchModal } from "@/components/SearchModal"
import { auth } from "@/lib/firebase"

const NAV_ITEMS = [
    { icon: ThumbsUp, label: "For You", id: "foryou" },
    { icon: Users, label: "Following", id: "following" },
    { icon: Compass, label: "Explore", id: "explore" },
    { icon: MessageCircle, label: "Chats", id: "chats", badge: 5, href: "/messages" },
]

export function Header() {
    const { user, loading } = useAuth()
    const [activeTab, setActiveTab] = useState("foryou")
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 's' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                e.preventDefault()
                setIsSearchOpen(true)
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsSearchOpen(true)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <>
            <header id="global-header" className="fixed top-0 left-0 right-0 z-50 bg-[#0C0C0C]/80 backdrop-blur-3xl border-b border-white/5 transition-transform duration-300">
                <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">

                    {/* Left Section: Pure Neon Logo */}
                    <div className="flex items-center flex-1">
                        <Link href="/">
                            <CredaLogo size={80} />
                        </Link>
                    </div>

                    {/* Center Section: Navigation */}
                    <nav className="hidden lg:flex items-center gap-2">
                        {NAV_ITEMS.map((item) => {
                            const content = (
                                <>
                                    <div className="relative">
                                        <motion.div
                                            whileHover={{ scale: 1.2 }}
                                            className={cn(
                                                "p-1 transition-colors relative z-10",
                                                activeTab === item.id ? "text-white" : "text-white/40 group-hover:text-white"
                                            )}
                                        >
                                            <item.icon className="w-6 h-6" />
                                        </motion.div>
                                        {item.badge && (
                                            <span className="absolute -top-1 -right-2 bg-cyber-pink text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#0C0C0C]">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>

                                    <span className={cn(
                                        "text-[10px] font-bold mt-1 transition-colors uppercase tracking-wider",
                                        activeTab === item.id ? "text-white" : "text-white/40 group-hover:text-white"
                                    )}>
                                        {item.label}
                                    </span>

                                    {activeTab === item.id && (
                                        <motion.div
                                            layoutId="header-underline"
                                            className="absolute bottom-[-14px] left-6 right-6 h-0.5 bg-cyber-pink rounded-full shadow-[0_0_12px_rgba(255,45,108,0.8)]"
                                        />
                                    )}
                                </>
                            )

                            if (item.href) {
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        onClick={() => setActiveTab(item.id)}
                                        className="relative px-6 py-2 flex flex-col items-center justify-center group"
                                    >
                                        {content}
                                    </Link>
                                )
                            }

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className="relative px-6 py-2 flex flex-col items-center justify-center group"
                                >
                                    {content}
                                </button>
                            )
                        })}
                    </nav>

                    {/* Right Section: Actions */}
                    <div className="flex items-center justify-end gap-3 lg:gap-6 flex-1">
                        <div className="flex items-center gap-3 lg:gap-5 text-white/40">
                            <Search
                                onClick={() => setIsSearchOpen(true)}
                                className="w-5 h-5 hover:text-white transition-colors cursor-pointer"
                            />

                            {/* Coins/Star - Visible on Mobile too */}
                            <motion.div whileHover={{ rotate: 15 }} className="relative cursor-pointer">
                                <Star className="w-5 h-5 hover:text-white transition-colors" />
                                <div className="absolute top-0 right-0 w-2 h-2 bg-cyber-pink rounded-full border-2 border-[#0C0C0C]" />
                            </motion.div>

                            {/* Notifications - Visible on Mobile too */}
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative cursor-pointer p-2 hover:bg-white/5 rounded-xl transition-all"
                            >
                                <Bell className="w-5 h-5 text-white/40 hover:text-cyber-pink transition-colors" />
                                <div className="absolute top-2 right-2 w-2 h-2 bg-cyber-pink rounded-full border-2 border-[#0C0C0C]" />
                            </motion.div>
                        </div>

                        <div className="hidden lg:block h-6 w-px bg-white/10 mx-2" />

                        <div className="flex items-center gap-3 lg:gap-6 lg:min-w-[140px] justify-end">
                            {loading ? (
                                <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                            ) : user ? (
                                <UserDropdown />
                            ) : (
                                <>
                                    <Link href="/login" className="text-white/60 hover:text-white font-bold text-xs lg:text-sm transition-colors whitespace-nowrap">
                                        Sign in
                                    </Link>

                                    <Link href="/login" className="hidden sm:block">
                                        <motion.button
                                            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(255, 45, 108, 0.4)" }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-cyber-pink text-white px-4 lg:px-8 py-2 lg:py-3 rounded-full font-black text-xs lg:text-sm transition-all shadow-[0_0_15px_rgba(255,45,108,0.3)] whitespace-nowrap"
                                        >
                                            Get Started
                                        </motion.button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </header>
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    )
}
