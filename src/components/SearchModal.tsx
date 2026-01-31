"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    X,
    TrendingUp,
    ArrowRight,
    Clock,
    Command,
    Zap
} from "lucide-react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, query, getDocs, limit, getCountFromServer } from "firebase/firestore"

interface UserResult {
    id: string
    name: string
    handle: string
    followers: string
    followersCount?: number
    photoURL?: string
    email?: string
}

interface SearchModalProps {
    isOpen: boolean
    onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [queryText, setQueryText] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    // Mock Data for "Wow" Factor
    const trendingTags = ["#CyberPunk", "#DigitalArt", "#FutureTech", "#Crypto", "#Visionary"]
    const recentSearches = ["Elon Musk", "AI Tools", "#DesignTrends"]
    const [suggestedUsers, setSuggestedUsers] = useState<UserResult[]>([])

    // Fetch Real Users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const q = query(collection(db, "users"), limit(50))
                const snapshot = await getDocs(q)
                const userPromises = snapshot.docs.map(async doc => {
                    const data = doc.data()

                    let followerCount = 0
                    try {
                        // Check subcollection count first (Source of Truth)
                        const followersRef = collection(db, "users", doc.id, "followers")
                        const snapshot = await getCountFromServer(followersRef)
                        followerCount = snapshot.data().count
                    } catch (e) {
                        // Fallback to legacy fields
                        if (Array.isArray(data.followers)) {
                            followerCount = data.followers.length
                        } else if (typeof data.followers === 'number') {
                            followerCount = data.followers
                        }
                    }

                    return {
                        id: doc.id,
                        name: data.displayName || data.username || data.email || "User",
                        handle: data.username ? `@${data.username}` : (data.email || "User"),
                        followersCount: followerCount, // Store number for sorting
                        followers: followerCount.toLocaleString(), // Display string
                        photoURL: data.photoURL,
                        email: data.email
                    }
                })

                const users = await Promise.all(userPromises)

                // Sort by followers desc
                users.sort((a, b) => b.followersCount - a.followersCount)
                setSuggestedUsers(users)
            } catch (error) {
                console.error("Error fetching search users:", error)
            }
        }

        if (isOpen) {
            fetchUsers()
        }
    }, [isOpen])

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => { document.body.style.overflow = "unset" }
    }, [isOpen])

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onClose])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    }

    const modalVariants = {
        hidden: { scale: 0.95, opacity: 0, y: 20 },
        visible: {
            scale: 1,
            opacity: 1,
            y: 0,
            transition: { type: "spring" as const, damping: 25, stiffness: 300 }
        },
        exit: { scale: 0.95, opacity: 0, y: 10 }
    }

    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: (i: number) => ({
            x: 0,
            opacity: 1,
            transition: { delay: i * 0.05 + 0.2 }
        })
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-[#0C0C0C]/60 backdrop-blur-xl transition-all"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        variants={modalVariants}
                        className="relative w-full max-w-2xl bg-[#111111] border border-white/10 rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[80vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Glow Effects */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-cyber-pink/5 blur-[100px] pointer-events-none" />

                        {/* Header / Input */}
                        <div className="relative p-6 border-b border-white/5 flex items-center gap-4">
                            <Search className="w-6 h-6 text-cyber-pink" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search visionaries, trends, or ideas..."
                                className="flex-1 bg-transparent text-xl font-bold text-white placeholder:text-white/20 outline-none border-none"
                                value={queryText}
                                onChange={(e) => setQueryText(e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest">
                                    ESC to close
                                </span>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-white/40" />
                                </button>
                            </div>
                        </div>

                        {/* Content Scrollable */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

                            {/* Section 1: Quick Actions / Trending */}
                            {!queryText && (
                                <motion.div variants={itemVariants} custom={0} initial="hidden" animate="visible" className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-cyber-pink">
                                        <TrendingUp className="w-3 h-3" /> Trending Now
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {trendingTags.map((tag, i) => (
                                            <motion.button
                                                key={tag}
                                                onClick={() => setQueryText(tag)}
                                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 45, 108, 0.1)", borderColor: "rgba(255, 45, 108, 0.3)" }}
                                                whileTap={{ scale: 0.95 }}
                                                className="px-4 py-2 bg-white/5 border border-white/5 rounded-full text-sm font-bold text-white/60 hover:text-white transition-all"
                                            >
                                                {tag}
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Section 2: Suggestions */}
                            <motion.div variants={itemVariants} custom={1} initial="hidden" animate="visible" className="space-y-4">
                                <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-white/20">
                                    {queryText ? "Results" : "Suggested Visionaries"}
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {suggestedUsers.filter(u =>
                                        !queryText ||
                                        (u.name && u.name.toLowerCase().includes(queryText.toLowerCase())) ||
                                        (u.handle && u.handle.includes(queryText.toLowerCase()))
                                    ).map((user, i) => (
                                        <motion.div
                                            key={user.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => {
                                                onClose()
                                                router.push(`/${user.handle.replace('@', '')}`)
                                            }}
                                            className="group flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-cyber-pink to-purple-600 flex items-center justify-center text-xs font-black text-white">
                                                    {user.photoURL ? (
                                                        <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.name?.[0]?.toUpperCase() || 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-white group-hover:text-cyber-pink transition-colors">{user.name}</h4>
                                                    <p className="text-xs text-white/40">{user.handle}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-white/20">{user.followers} followers</span>
                                                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 duration-300" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Section 3: Recent */}
                            {!queryText && (
                                <motion.div variants={itemVariants} custom={2} initial="hidden" animate="visible" className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-white/20">
                                        <Clock className="w-3 h-3" /> Recent History
                                    </div>
                                    <div className="space-y-1">
                                        {recentSearches.map((term, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors">
                                                <div className="flex items-center gap-3 text-white/40 group-hover:text-white transition-colors">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-sm font-medium">{term}</span>
                                                </div>
                                                <X className="w-4 h-4 text-white/10 hover:text-white transition-colors" />
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-[#0A0A0A] border-t border-white/5 flex items-center justify-between text-[10px] text-white/20 font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1"><Command className="w-3 h-3" /> Navigate</span>
                                <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Select</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-3 h-3 text-cyber-pink" />
                                Powered by Creda Intelligence
                            </div>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
