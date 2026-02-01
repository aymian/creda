"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Gamepad2,
    Trophy,
    Users,
    Zap,
    Play,
    Star,
    Flame,
    TrendingUp,
    ShieldCheck,
    Lock,
    Timer,
    Sword,
    Boxes,
    Dices,
    ChevronRight,
    ArrowUpRight,
    Sparkles,
    AlertCircle
} from "lucide-react"

const GAME_MODES = [
    {
        id: "focus-pool",
        title: "The Focus Pool",
        subtitle: "Pari-Mutuel Stakes",
        description: "Stake 50 Coins. Stay 'Locked In' for 2 hours. Survivors split the total pot from those who fail.",
        pot: "12,500",
        participants: "250",
        icon: Timer,
        color: "#FF2D6C",
        difficulty: "Hard",
        tag: "High Stakes"
    },
    {
        id: "tribe-duels",
        title: "Tribe Duels",
        subtitle: "1v1 PvP Focus",
        description: "Challenge a creator to a focus duel. First to 10 Focused Hours wins the exclusive bounty.",
        pot: "Exclusive Badge",
        participants: "Duel 1v1",
        icon: Sword,
        color: "#00F0FF",
        difficulty: "Competitive",
        tag: "PvP"
    },
    {
        id: "focus-parlays",
        title: "Focus Parlays",
        subtitle: "Multi-Task Streaks",
        description: "Chain habits for 5 days. Hit the streak for 10x Multiplier. One miss and you bust.",
        pot: "10x Multiplier",
        participants: "8.1K Live",
        icon: Boxes,
        color: "#9D00FF",
        difficulty: "Insane",
        tag: "Streak"
    }
]

import { Header } from "@/components/header"

export default function GamesPage() {
    const [liveWinTicker, setLiveWinTicker] = useState("Alpha_V just won 500 Coins in the Deep Work Pool!")

    // Simulate a live ticker
    useEffect(() => {
        const users = ["Pixel_Lord", "NeonRunner", "CryptoQueen", "ZenFocus", "HabitMaster"]
        const wins = [250, 1000, 50, 1500, 300]
        const games = ["Focus Pool", "Tribe Duel", "Habit Parlay"]

        const interval = setInterval(() => {
            const user = users[Math.floor(Math.random() * users.length)]
            const win = wins[Math.floor(Math.random() * wins.length)]
            const game = games[Math.floor(Math.random() * games.length)]
            setLiveWinTicker(`${user} just won ${win} Coins in the ${game}!`)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen bg-[#0C0C0C] text-white overflow-x-hidden">
            <Header />

            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyber-pink/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px]" />
            </div>

            <main className="max-w-[1440px] mx-auto px-6 py-32 relative z-10">
                {/* Header & Live Ticker */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-cyber-pink/10 rounded-[28px] border border-cyber-pink/30 flex items-center justify-center shadow-[0_0_30px_rgba(255,45,108,0.2)]">
                            <Gamepad2 className="w-8 h-8 text-cyber-pink" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter">Creda Arcade</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Stakes & Rewards</span>
                                <div className="w-1 h-1 rounded-full bg-cyber-pink animate-ping" />
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-4 min-w-[340px]">
                        <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={liveWinTicker}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="text-[11px] font-black uppercase tracking-wider text-white/80"
                            >
                                {liveWinTicker}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                </div>

                {/* The Focus Pool - Featured Large Card */}
                <section className="mb-20">
                    <div className="relative rounded-[50px] overflow-hidden border border-white/10 p-1 md:p-3 bg-gradient-to-br from-white/10 to-transparent">
                        <div className="relative rounded-[45px] bg-[#111] overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                            <div className="p-10 md:p-16 flex flex-col justify-center space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="px-4 py-1.5 bg-cyber-pink text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(255,45,108,0.4)]">
                                        Live Pool
                                    </div>
                                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
                                        <Users className="w-3 h-3" />
                                        1.2K Participating
                                    </div>
                                </div>
                                <h2 className="text-6xl font-black uppercase tracking-tighter leading-none italic">
                                    The Focus <br /> <span className="text-cyber-pink">Pool</span>
                                </h2>
                                <p className="text-white/60 text-lg font-medium max-w-md">
                                    The ultimate Pari-Mutuel stake. Lock your phone for 2 hours. If you fail, your 50 coins go to the survivors.
                                    <span className="text-white"> Will you stay locked in?</span>
                                </p>
                                <div className="flex flex-wrap gap-6 pt-4">
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 min-w-[160px]">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Current Pot</p>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-green-400" />
                                            <span className="text-3xl font-black tracking-tighter text-white">45,800</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 min-w-[160px]">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Entry Fee</p>
                                        <div className="flex items-center gap-2">
                                            <Dices className="w-5 h-5 text-cyber-pink" />
                                            <span className="text-3xl font-black tracking-tighter text-white">50</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="group w-full md:w-fit px-12 py-5 bg-white text-black rounded-[24px] font-black uppercase tracking-[0.2em] text-[12px] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4">
                                    Enter Deep Work Pool
                                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                            <div className="relative min-h-[400px] bg-gradient-to-br from-cyber-pink to-purple-900 border-l border-white/5 overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <motion.div
                                        animate={{
                                            rotate: 360,
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{
                                            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                                            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                                        }}
                                        className="w-80 h-80 rounded-full border-[20px] border-white/10 relative"
                                    >
                                        <div className="absolute inset-[20px] rounded-full border-[1px] border-white/30 border-dashed" />
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                            <Timer className="w-16 h-16 text-white mb-2" />
                                            <span className="text-4xl font-black tracking-tighter text-white">02:00:00</span>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Secondary Game Modes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
                    {/* Tribe Duels */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="bg-[#111] border border-white/5 rounded-[50px] overflow-hidden group p-10 flex flex-col justify-between min-h-[450px]"
                    >
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="p-5 bg-cyber-cyan/10 rounded-3xl border border-cyber-cyan/30">
                                    <Sword className="w-8 h-8 text-cyber-cyan" />
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-1">Stallion vs Oracle</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
                                        <span className="text-xs font-black uppercase tracking-wider text-cyber-cyan">Duel in progress</span>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">Tribe <br /> <span className="text-cyber-cyan">Duels</span></h3>
                            <p className="text-white/40 font-bold leading-relaxed">Two creators enter. One piece of exclusive content is staked. First to hit the focus mission claims the glory.</p>

                            {/* Visual Progress Bar */}
                            <div className="space-y-4 pt-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Alpha Team</span>
                                    <span className="text-lg font-black text-cyber-cyan italic">8.5 / 10h</span>
                                </div>
                                <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "85%" }}
                                        className="h-full bg-cyber-cyan shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                                    />
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-10 py-5 bg-cyber-cyan/10 hover:bg-cyber-cyan text-cyber-cyan hover:text-black rounded-3xl font-black uppercase tracking-widest text-[11px] transition-all border border-cyber-cyan/20">
                            Challenge a Creator
                        </button>
                    </motion.div>

                    {/* Focus Parlays */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="bg-[#111] border border-white/5 rounded-[50px] overflow-hidden group p-10 flex flex-col justify-between min-h-[450px]"
                    >
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="p-5 bg-purple-500/10 rounded-3xl border border-purple-500/30">
                                    <Boxes className="w-8 h-8 text-purple-400" />
                                </div>
                                <div className="bg-purple-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(157,0,255,0.4)]">
                                    10X Win Potential
                                </div>
                            </div>
                            <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">Focus <br /> <span className="text-purple-400">Parlays</span></h3>
                            <p className="text-white/40 font-bold leading-relaxed">Bigger the streak, bigger the payout. Complete 5 consecutive days of deep work missions to unlock the coin multiplier.</p>

                            <div className="grid grid-cols-5 gap-3 pt-4">
                                {[1, 2, 3, 4, 5].map(day => (
                                    <div key={day} className={`aspect-square rounded-2xl flex flex-col items-center justify-center border ${day < 4 ? 'bg-purple-500/20 border-purple-500/50 text-white' : 'bg-white/5 border-white/5 text-white/20'}`}>
                                        <span className="text-[10px] font-black mb-1">D{day}</span>
                                        {day < 4 ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button className="w-full mt-10 py-5 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white rounded-3xl font-black uppercase tracking-widest text-[11px] transition-all border border-purple-500/20">
                            Start Parlay Chain
                        </button>
                    </motion.div>
                </div>

                {/* Responsible Gaming & Footer Stats */}
                <div className="mt-20 flex flex-col md:flex-row gap-10 items-start">
                    <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-[40px] p-10">
                        <div className="flex items-center gap-4 mb-6">
                            <AlertCircle className="w-6 h-6 text-white/20" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Responsible Gaming 2026</h4>
                        </div>
                        <p className="text-sm font-medium text-white/40 leading-relaxed mb-8">
                            Creda Arcade is built on ethical reward mechanics. Creda Coins are virtual assets earned through production, not purchase.
                            Enable <span className="text-cyber-pink">Cool-Down Mode</span> to balance your arcade sessions.
                        </p>
                        <div className="flex gap-4">
                            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Setting Limits</button>
                            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-cyber-pink">Cool-Down On</button>
                        </div>
                    </div>

                    <div className="w-full md:w-[400px] flex flex-col gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-[30px] p-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                <span className="text-xs font-black uppercase tracking-widest text-white/60">Luck Multiplier</span>
                            </div>
                            <span className="text-xl font-black text-white italic">2.4X</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-[30px] p-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Flame className="w-5 h-5 text-cyber-pink" />
                                <span className="text-xs font-black uppercase tracking-widest text-white/60">Arcade Streak</span>
                            </div>
                            <span className="text-xl font-black text-white italic">14 Days</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
