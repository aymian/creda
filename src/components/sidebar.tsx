"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
    LayoutDashboard,
    Compass,
    Target,
    Zap,
    BookOpen,
    BarChart3,
    Settings,
    ChevronRight,
    Search,
    Bell,
    MessageCircle,
    User,
    Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

const SIDEBAR_ITEMS = [
    { icon: LayoutDashboard, label: "Intelligence", href: "/", id: "feed" },
    { icon: Compass, label: "Discovery", href: "/explore", id: "explore" },
    { icon: Target, label: "Missions", href: "/focus", id: "focus" },
    { icon: Zap, label: "Activity", href: "/streaks", id: "streaks" },
    { icon: BookOpen, label: "Vault", href: "/library", id: "library" },
    { icon: BarChart3, label: "Analytics", href: "/insights", id: "insights" },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isHovered, setIsHovered] = useState(false)
    const [isFocusMode, setIsFocusMode] = useState(false)

    return (
        <motion.aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={cn(
                "fixed left-0 top-0 h-screen bg-[#0C0C0C] border-r border-white/5 z-[60] py-8 transition-all duration-500 ease-[0.23, 1, 0.32, 1]",
                isHovered ? "w-64" : "w-20"
            )}
        >
            <div className="flex flex-col h-full items-center justify-between">

                {/* Branding / Logo Area */}
                <div className="w-full px-4 flex justify-center">
                    <Link href="/">
                        <div className="relative group">
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center transition-all group-hover:border-cyber-pink/50 group-hover:bg-cyber-pink/10">
                                <Zap className={cn(
                                    "w-6 h-6 transition-all",
                                    isFocusMode ? "text-cyber-cyan fill-cyber-cyan drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]" : "text-white group-hover:text-cyber-pink"
                                )} />
                            </div>
                            {isFocusMode && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-cyan rounded-full animate-ping" />
                            )}
                        </div>
                    </Link>
                </div>

                {/* Navigation Items */}
                <nav className="w-full px-3 flex flex-col gap-2 mt-8">
                    {/* Primary Action Button */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "flex items-center gap-4 px-4 py-4 rounded-2xl bg-cyber-pink text-white shadow-[0_10px_20px_rgba(255,45,108,0.2)] mb-4 cursor-pointer overflow-hidden",
                            !isHovered && "justify-center px-0 w-12 mx-auto"
                        )}
                    >
                        <Plus className="w-6 h-6 shrink-0" />
                        <motion.span
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            className={cn(
                                "text-[12px] font-black uppercase tracking-[0.2em] whitespace-nowrap",
                                !isHovered && "hidden"
                            )}
                        >
                            Broadcast
                        </motion.span>
                    </motion.div>

                    {SIDEBAR_ITEMS.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <Link key={item.id} href={item.href}>
                                <motion.div
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                        "relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group",
                                        isActive
                                            ? "bg-cyber-pink/10 text-cyber-pink"
                                            : "text-white/40 hover:text-white"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute left-0 w-1 h-6 bg-cyber-pink rounded-full shadow-[0_0_12px_rgba(255,45,108,0.8)]"
                                        />
                                    )}

                                    <Icon className={cn(
                                        "w-6 h-6 shrink-0 transition-colors",
                                        isActive ? "text-cyber-pink" : "group-hover:text-white"
                                    )} />

                                    <motion.span
                                        animate={{
                                            opacity: isHovered ? 1 : 0,
                                            x: isHovered ? 0 : -10
                                        }}
                                        className={cn(
                                            "text-[12px] font-black uppercase tracking-[0.2em] whitespace-nowrap",
                                            !isHovered && "hidden"
                                        )}
                                    >
                                        {item.label}
                                    </motion.span>
                                </motion.div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Focus Mode Control */}
                <div className="w-full px-3 mt-4">
                    <motion.div
                        onClick={() => setIsFocusMode(!isFocusMode)}
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                            "flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer transition-all border",
                            isFocusMode
                                ? "bg-cyber-cyan/10 border-cyber-cyan/20 text-cyber-cyan shadow-[0_0_30px_rgba(0,242,255,0.1)]"
                                : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                        )}
                    >
                        <Target className={cn(
                            "w-6 h-6 shrink-0",
                            isFocusMode && "animate-pulse"
                        )} />
                        <motion.div
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            className={cn(
                                "flex flex-col whitespace-nowrap",
                                !isHovered && "hidden"
                            )}
                        >
                            <span className="text-[11px] font-black uppercase tracking-widest leading-none">Focus Mode</span>
                            <span className="text-[9px] font-bold text-white/20 uppercase mt-1">
                                {isFocusMode ? "Neural Lock on" : "Neural Lock off"}
                            </span>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Footer Section: Quick Actions & Settings */}
                <div className="w-full px-3 flex flex-col gap-2 mt-auto">
                    <div className="w-full h-px bg-white/5 my-4 mx-2" />

                    <Link href="/settings">
                        <motion.div
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-white/40 hover:text-white transition-all group"
                        >
                            <Settings className="w-6 h-6 shrink-0" />
                            <motion.span
                                animate={{ opacity: isHovered ? 1 : 0 }}
                                className={cn(
                                    "text-[13px] font-black uppercase tracking-wider whitespace-nowrap",
                                    !isHovered && "hidden"
                                )}
                            >
                                Settings
                            </motion.span>
                        </motion.div>
                    </Link>

                    <div className="w-full flex justify-center py-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 p-0.5 flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky"
                                alt="U"
                                className="w-full h-full rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Expansion Trigger Button (Visual only) */}
            <div className="absolute top-1/2 -right-3 -translate-y-1/2">
                <div className="w-6 h-6 bg-[#111111] border border-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                    <ChevronRight className={cn(
                        "w-3 h-3 text-white/40 transition-transform duration-500",
                        isHovered ? "rotate-180" : ""
                    )} />
                </div>
            </div>
        </motion.aside>
    )
}
