"use client"

import React, { useState, useEffect, use } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Trophy,
    Users,
    Zap,
    Timer,
    ShieldCheck,
    TrendingUp,
    ChevronLeft,
    AlertCircle,
    ArrowUpRight,
    Lock
} from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, onSnapshot, updateDoc, increment, arrayUnion, setDoc, getDoc } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import { Header } from "@/components/header"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface GameData {
    id: string
    title: string
    totalPot: number
    playerCount: number
    entryFee: number
    status: "active" | "ended"
    startTime?: any
    durationMinutes: number
}

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { user } = useAuth()
    const [game, setGame] = useState<GameData | null>(null)
    const [loading, setLoading] = useState(true)
    const [isJoining, setIsJoining] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return

        const unsub = onSnapshot(doc(db, "games", id), async (docSnap) => {
            if (docSnap.exists()) {
                setGame({ id: docSnap.id, ...docSnap.data() } as GameData)
                setError(null)
            } else {
                // AUTO-INITIALIZE FOR DEMO
                const defaultGame = {
                    title: "The Focus Pool",
                    totalPot: 45800,
                    playerCount: 124,
                    entryFee: 50,
                    status: "active",
                    durationMinutes: 120,
                    participants: []
                }
                try {
                    await setDoc(doc(db, "games", id), defaultGame)
                    setGame({ id, ...defaultGame } as GameData)
                    setError(null)
                } catch (err) {
                    console.error("Error creating demo game:", err)
                    setError("Mission not found")
                }
            }
            setLoading(false)
        })

        return () => unsub()
    }, [id])

    const handleJoinMission = async () => {
        if (!user || !game) return

        setIsJoining(true)
        setError(null)

        try {
            // In a real app, you'd check user's balance first
            const gameRef = doc(db, "games", id)

            await updateDoc(gameRef, {
                totalPot: increment(game.entryFee),
                playerCount: increment(1),
                participants: arrayUnion(user.uid)
            })

            // Also record the participation in user's profile or a subcollection
            await setDoc(doc(db, "games", id, "participants", user.uid), {
                uid: user.uid,
                joinedAt: new Date(),
                status: "locked-in"
            })

        } catch (err: any) {
            console.error("Error joining mission:", err)
            setError("Failed to join the mission. Please try again.")
        } finally {
            setIsJoining(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-pink" />
            </div>
        )
    }

    if (error && !game) {
        return (
            <div className="min-h-screen bg-[#0C0C0C] flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-16 h-16 text-white/20 mb-4" />
                <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Mission Status: Offline</h1>
                <p className="text-white/40 mb-8 max-w-sm">The requested focus mission could not be located in the neural network.</p>
                <Link href="/games" className="px-8 py-3 bg-white/5 border border-white/10 rounded-full font-bold hover:bg-white/10 transition-all">
                    Back to Arcade
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0C0C0C] text-white">
            <Header />

            <main className="max-w-5xl mx-auto px-6 py-32">
                {/* Back Link */}
                <Link href="/games" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-12 group transition-all">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Link / Arcade</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Big Pot Display */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[#111] p-12"
                        >
                            {/* Ambient Light */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-pink/20 rounded-full blur-[100px] -z-10" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyber-cyan/10 rounded-full blur-[100px] -z-10" />

                            <div className="space-y-2 mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-cyber-pink animate-ping" />
                                    <span className="text-[10px] font-black text-cyber-pink uppercase tracking-[0.4em]">Live Focus Pool</span>
                                </div>
                                <h1 className="text-7xl font-black tracking-tighter uppercase italic line-height-[0.9]">
                                    THE <span className="text-cyber-pink">POT</span>
                                </h1>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Current Liquidity</p>
                                <div className="flex items-baseline gap-4">
                                    <span className="text-8xl font-black tracking-tighter text-white tabular-nums">
                                        {game?.totalPot.toLocaleString() || "0"}
                                    </span>
                                    <span className="text-2xl font-black text-cyber-pink italic uppercase tracking-widest">Coins</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mt-16 pt-10 border-t border-white/5">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Active Creators</p>
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-white/40" />
                                        <span className="text-2xl font-black tracking-tighter">{game?.playerCount || 0}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Target Duration</p>
                                    <div className="flex items-center gap-3">
                                        <Timer className="w-5 h-5 text-white/40" />
                                        <span className="text-2xl font-black tracking-tighter">{game?.durationMinutes || 0}m</span>
                                    </div>
                                </div>
                                <div className="space-y-2 hidden md:block">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Win Probability</p>
                                    <div className="flex items-center gap-3 text-green-400">
                                        <TrendingUp className="w-5 h-5" />
                                        <span className="text-2xl font-black tracking-tighter">High</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Trading Floor Feed Visual */}
                        <div className="bg-white/5 border border-white/5 rounded-[30px] p-8">
                            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                Real-time Action Stream
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { user: "Neon_01", action: "Staked 100", time: "2m ago" },
                                    { user: "AlphaFlow", action: "Locked In", time: "5m ago" },
                                    { user: "ZenMaster", action: "Started Mission", time: "12m ago" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/[0.03] last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black">
                                                {item.user[0]}
                                            </div>
                                            <span className="text-xs font-bold">{item.user}</span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-[10px] font-black text-cyber-cyan uppercase tracking-widest">{item.action}</span>
                                            <span className="text-[10px] font-bold text-white/20 uppercase">{item.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: CTA & Rules */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/5 border border-white/10 rounded-[30px] p-8 sticky top-32"
                        >
                            <div className="space-y-6">
                                <div className="p-6 bg-cyber-pink/10 border border-cyber-pink/20 rounded-2xl text-center">
                                    <p className="text-[10px] font-black text-cyber-pink uppercase tracking-widest mb-1">Your Stake Required</p>
                                    <div className="text-4xl font-black tracking-tighter">{game?.entryFee || 0} Coins</div>
                                </div>

                                <button
                                    onClick={handleJoinMission}
                                    disabled={isJoining}
                                    className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 disabled:opacity-50"
                                >
                                    {isJoining ? "Processing..." : "Join Mission"}
                                    {!isJoining && <ArrowUpRight className="w-4 h-4" />}
                                </button>

                                <div className="space-y-4 pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                            <ShieldCheck className="w-4 h-4 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Risk Profile</p>
                                            <p className="text-xs text-white/40 font-medium">Your stake is pooled. Loss if focus breaks.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                            <AlertCircle className="w-4 h-4 text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">House Fee</p>
                                            <p className="text-xs text-white/40 font-medium">3% commission taken from losers' pool.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="p-8 border border-white/5 rounded-[30px] bg-gradient-to-br from-white/[0.02] to-transparent">
                            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-4">The Logic</h4>
                            <ul className="space-y-3">
                                {[
                                    "Stay locked in for full duration.",
                                    "Break focus = Loss of stake.",
                                    "Success = Split losers' pool.",
                                    "Instant coin distribution."
                                ].map((rule, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs font-medium text-white/40">
                                        <div className="w-1 h-1 rounded-full bg-cyber-pink" />
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* Ambient Background Noise */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] -z-50" />
        </div>
    )
}
