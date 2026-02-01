"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    User,
    Gem,
    Users,
    Star,
    ChevronRight,
    UsersRound,
    Crown,
    Store,
    GraduationCap,
    Gavel,
    LifeBuoy,
    Smartphone,
    LogOut,
    ChevronDown,
    Dices,
    Settings,
    Moon,
    BarChart2,
    UserPlus,
    Info,
    FileText
} from "lucide-react"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function UserDropdown() {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(true)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSignOut = async () => {
        try {
            await signOut(auth)
        } catch (error) {
            console.error("Error signing out:", error)
        }
    }

    if (!user) return null

    const MenuItem = ({ icon: Icon, label, badge, subtext, onClick }: any) => (
        <button
            onClick={onClick}
            className="w-full flex items-start gap-4 px-4 py-3 hover:bg-white/5 transition-all text-left group"
        >
            <div className="relative mt-0.5">
                {Icon && <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />}
                {badge && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyber-pink rounded-full border-2 border-[#111111]" />
                )}
            </div>
            <div className="flex flex-col">
                <span className="text-[13px] font-bold text-white group-hover:text-cyber-pink transition-colors">{label}</span>
                {subtext && (
                    <span className="text-[10px] text-white/40 leading-tight mt-0.5 max-w-[180px]">{subtext}</span>
                )}
            </div>
        </button>
    )

    const ToggleMenuItem = ({ icon: Icon, label }: any) => (
        <div className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-all text-left group">
            <div className="flex items-center gap-4">
                <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                <span className="text-[13px] font-bold text-white group-hover:text-cyber-pink transition-colors">{label}</span>
            </div>
            <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={cn(
                    "w-10 h-5 rounded-full relative transition-colors duration-300",
                    isDarkMode ? "bg-cyber-pink" : "bg-white/10"
                )}
            >
                <motion.div
                    animate={{ x: isDarkMode ? 22 : 2 }}
                    className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-lg"
                />
            </button>
        </div>
    )

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1.5 pr-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-all group"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-pink to-[#FF2D6C] flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,45,108,0.3)] truncate">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <User className="w-4 h-4" />
                    )}
                </div>
                <div className="flex flex-col items-start hidden sm:flex">
                    <span className="text-[11px] font-black text-white leading-none uppercase tracking-wider max-w-[80px] truncate">
                        {user.displayName || user.email?.split("@")[0] || "User"}
                    </span>
                </div>
                <ChevronDown className={`w-3 h-3 text-white/40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-4 w-[300px] bg-[#111111] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-50 overflow-hidden rounded-3xl"
                    >
                        <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
                            {/* Header Section */}
                            <Link href="/profile" onClick={() => setIsOpen(false)}>
                                <div className="flex items-center gap-4 px-5 py-5 hover:bg-white/5 cursor-pointer group/header border-b border-white/5 transition-all">
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-cyber-pink/20 to-purple-500/20 border-2 border-white/10 group-hover/header:border-cyber-pink/50 transition-all flex items-center justify-center">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                                                <User className="w-7 h-7 text-white/20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-black text-sm uppercase tracking-wider truncate">
                                            {user.displayName || user.email?.split("@")[0] || "Visionary"}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <Gem className="w-3 h-3 text-white/30" />
                                                <span className="text-[11px] font-bold text-white/60">0</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-3 h-3 text-white/30" />
                                                <span className="text-[11px] font-bold text-white/60">0</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Star className="w-3 h-3 text-white/30" />
                                                <span className="text-[11px] font-bold text-white/60">0</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-white/20 group-hover/header:translate-x-1 group-hover/header:text-white transition-all" />
                                </div>
                            </Link>

                            {/* Premium CTA */}
                            <div className="px-5 py-4 border-b border-white/5">
                                <Link href="/upgrade" onClick={() => setIsOpen(false)}>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-gradient-to-r from-cyber-pink to-purple-600 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(255,45,108,0.2)] flex items-center justify-center gap-2 group/btn"
                                    >
                                        <Crown className="w-3.5 h-3.5 transition-transform group-hover/btn:rotate-12" />
                                        Upgrade
                                    </motion.button>
                                </Link>
                            </div>


                            {/* Programs Section */}
                            <div className="py-2">
                                <Link href="/games">
                                    <MenuItem icon={Dices} label="Games" />
                                </Link>

                                <div className="px-5 py-3 border-t border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Settings</span>
                                </div>
                                <Link href="/settings">
                                    <MenuItem icon={Settings} label="Settings" />
                                </Link>
                                <ToggleMenuItem icon={Moon} label="Dark theme" />

                                <div className="px-5 py-3 border-t border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Creator Tools</span>
                                </div>
                                <MenuItem icon={BarChart2} label="Statistics" />
                                <MenuItem icon={UserPlus} label="My Fans" />

                                <div className="px-5 py-3 border-t border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Special Programs</span>
                                </div>
                                <MenuItem icon={UsersRound} label="Agency Program" />
                                <Link href="/wallet">
                                    <MenuItem icon={Crown} label="VIP Loyalty" />
                                </Link>
                                <MenuItem icon={Store} label="MyVIP Store" badge={true} />
                                <MenuItem icon={GraduationCap} label="How to Creda" badge={true} />
                                <MenuItem icon={Gavel} label="Creda Cards Auction" />
                            </div>

                            {/* Info Section */}
                            <div className="border-t border-white/5 py-2">
                                <div className="px-5 py-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Service Info</span>
                                </div>
                                <MenuItem label="About" />
                                <MenuItem label="Creda's Agencies Program" />
                                <MenuItem label="Creda's Resellers Program" />
                                <MenuItem label="Help Center" />
                                <MenuItem label="Legal Information" />
                            </div>

                            {/* App Section */}
                            <div className="border-t border-white/5 py-2">
                                <MenuItem icon={LifeBuoy} label="Customer Support" />
                                <Link href="/get-app">
                                    <MenuItem
                                        icon={Smartphone}
                                        label="Get Creda App"
                                        badge={true}
                                        subtext="Stay connected with your friends anywhere and anytime!"
                                    />
                                </Link>
                            </div>

                            {/* Logout Section */}
                            <div className="border-t border-white/5 bg-white/[0.02]">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-4 px-5 py-5 text-white/60 hover:text-white transition-all group"
                                >
                                    <LogOut className="w-6 h-6 text-white group-hover:text-cyber-pink transition-colors" />
                                    <span className="text-[13px] font-bold uppercase tracking-widest">Logout</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
