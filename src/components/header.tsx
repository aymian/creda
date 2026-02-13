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
            <header id="global-header" className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F0F] border-b border-white/5 transition-transform duration-300">
                <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">

                    {/* Left Section: Logo */}
                    <div className="flex items-center flex-1">
                        <Link href="/">
                            <CredaLogo size={64} />
                        </Link>
                    </div>

                    {/* Center Section: Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => {
                            const content = (
                                <>
                                    <div className="relative">
                                        <div
                                            className={cn(
                                                "p-1 transition-colors relative z-10",
                                                activeTab === item.id ? "text-white" : "text-white/40 group-hover:text-white"
                                            )}
                                        >
                                            <item.icon className="w-5 h-5 stroke-[1.5]" />
                                        </div>
                                        {item.badge && (
                                            <span className="absolute -top-1 -right-1 bg-[#FF2D6C] text-white text-[9px] font-bold px-1 rounded-full border border-[#0F0F0F]">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>

                                    <span className={cn(
                                        "text-[10px] font-medium mt-1 transition-colors uppercase tracking-wider",
                                        activeTab === item.id ? "text-white" : "text-white/40 group-hover:text-white"
                                    )}>
                                        {item.label}
                                    </span>

                                    {activeTab === item.id && (
                                        <div
                                            className="absolute bottom-[-14px] left-6 right-6 h-0.5 bg-white rounded-full"
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
                                        className="relative px-5 py-2 flex flex-col items-center justify-center group"
                                    >
                                        {content}
                                    </Link>
                                )
                            }

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className="relative px-5 py-2 flex flex-col items-center justify-center group"
                                >
                                    {content}
                                </button>
                            )
                        })}
                    </nav>

                    {/* Right Section: Actions */}
                    <div className="flex items-center justify-end gap-3 lg:gap-5 flex-1">
                        <Link href="/create">
                            <div
                                className="p-2 bg-[#FF2D6C] rounded-lg cursor-pointer group transition-all"
                            >
                                <Plus className="w-4 h-4 text-white" />
                            </div>
                        </Link>

                        <Search
                            onClick={() => setIsSearchOpen(true)}
                            className="w-5 h-5 text-white/40 hover:text-white transition-colors cursor-pointer"
                        />

                        {/* Coins/Star */}
                        <div className="relative cursor-pointer group">
                            <Star className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                            <div className="absolute top-0 right-0 w-2 h-2 bg-[#FF2D6C] rounded-full border border-[#0F0F0F]" />
                        </div>

                        {/* Notifications */}
                        <div
                            className="relative cursor-pointer p-1.5 hover:bg-white/5 rounded-lg transition-all"
                        >
                            <Bell className="w-5 h-5 text-white/40 hover:text-white transition-colors" />
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF2D6C] rounded-full border border-[#0F0F0F]" />
                        </div>

                        <div className="hidden lg:block h-5 w-px bg-white/10 mx-1" />

                        <div className="flex items-center gap-3 lg:gap-5 lg:min-w-[140px] justify-end">
                            {loading ? (
                                <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                            ) : user ? (
                                <UserDropdown />
                            ) : (
                                <>
                                    <Link href="/login" className="text-white/60 hover:text-white font-bold text-xs transition-colors whitespace-nowrap">
                                        Sign in
                                    </Link>

                                    <Link href="/login" className="hidden sm:block">
                                        <button
                                            className="bg-[#FF2D6C] text-white px-5 py-2 rounded-full font-bold text-xs transition-all whitespace-nowrap hover:opacity-90"
                                        >
                                            Get Started
                                        </button>
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
