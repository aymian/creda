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
    { icon: MessageCircle, label: "Chats", id: "chats", badge: 5 },
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
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0C0C0C]/80 backdrop-blur-3xl border-b border-white/5">
                <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">

                    {/* Left Section: Pure Neon Logo */}
                    <div className="flex items-center flex-1">
                        <Link href="/">
                            <CredaLogo size={80} />
                        </Link>
                    </div>

                    {/* Center Section: Navigation */}
                    <nav className="hidden lg:flex items-center gap-2">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className="relative px-6 py-2 flex flex-col items-center justify-center group"
                            >
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
                            </button>
                        ))}
                    </nav>

                    {/* Right Section: Actions */}
                    <div className="flex items-center justify-end gap-6 flex-1">
                        <div className="flex items-center gap-5 text-white/40">
                            <Search
                                onClick={() => setIsSearchOpen(true)}
                                className="w-5 h-5 hover:text-white transition-colors cursor-pointer"
                            />
                            <motion.div whileHover={{ rotate: 15 }} className="relative">
                                <Star className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />
                                <div className="absolute top-0 right-0 w-2 h-2 bg-cyber-pink rounded-full border-2 border-[#0C0C0C]" />
                            </motion.div>
                            <Link href="/create">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className="relative cursor-pointer p-2 hover:bg-white/5 rounded-xl transition-all"
                                >
                                    <Plus className="w-5 h-5 text-white/40 hover:text-cyber-pink transition-colors" />
                                </motion.div>
                            </Link>
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative cursor-pointer p-2 hover:bg-white/5 rounded-xl transition-all"
                            >
                                <Bell className="w-5 h-5 text-white/40 hover:text-cyber-pink transition-colors" />
                                <div className="absolute top-2 right-2 w-2 h-2 bg-cyber-pink rounded-full border-2 border-[#0C0C0C]" />
                            </motion.div>
                        </div>

                        <div className="h-6 w-px bg-white/10 mx-2" />

                        <div className="flex items-center gap-6 min-w-[140px] justify-end">
                            {loading ? (
                                <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
                            ) : user ? (
                                <UserDropdown />
                            ) : (
                                <>
                                    <Link href="/login" className="text-white/60 hover:text-white font-bold text-sm transition-colors whitespace-nowrap">
                                        Sign in
                                    </Link>

                                    <Link href="/login">
                                        <motion.button
                                            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(255, 45, 108, 0.4)" }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-cyber-pink text-white px-8 py-3 rounded-full font-black text-sm transition-all shadow-[0_0_15px_rgba(255,45,108,0.3)] whitespace-nowrap"
                                        >
                                            Get Started
                                        </motion.button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden p-2 text-white/60 hover:text-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="lg:hidden border-t border-white/5 bg-[#0C0C0C] p-6 space-y-6"
                        >
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-4">
                                <Search className="w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="bg-transparent border-none outline-none text-white ml-3 flex-grow placeholder:text-white/20 font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {NAV_ITEMS.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-5 rounded-2xl transition-all",
                                            activeTab === item.id
                                                ? "bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/30 shadow-[0_0_20px_rgba(255,45,108,0.1)]"
                                                : "bg-white/5 text-white/40 border border-white/5"
                                        )}
                                    >
                                        <item.icon className="w-7 h-7" />
                                        <span className="font-black text-xs uppercase">{item.label}</span>
                                    </button>
                                ))}
                            </div>

                            {user ? (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 rounded-full bg-cyber-pink flex items-center justify-center text-white font-black">
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white font-black text-sm uppercase tracking-wider">{user.email?.split('@')[0]}</span>
                                            <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Active Focus Session</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => auth.signOut()}
                                        className="w-full flex items-center justify-center gap-3 bg-white/5 text-white/40 py-5 rounded-2xl font-black border border-white/5 hover:bg-cyber-pink/10 hover:text-cyber-pink transition-all"
                                    >
                                        <LogOut className="w-6 h-6" />
                                        AUTHORIZE EXIT
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login" className="w-full">
                                    <button className="w-full flex items-center justify-center gap-3 bg-cyber-pink text-white py-5 rounded-2xl font-black shadow-[0_0_30px_rgba(255,45,108,0.4)]">
                                        <LogIn className="w-6 h-6" />
                                        SIGN IN
                                    </button>
                                </Link>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    )
}
