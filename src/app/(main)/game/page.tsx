"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Swords,
    Users,
    Lock,
    Trophy,
    Coins,
    ChevronRight,
    Zap,
    Shield,
    Crown,
    Target,
    ArrowRightLeft,
    TrendingUp,
    Sparkles,
    UserCircle2,
    Timer,
    Plus,
    BarChart3,
    ArrowLeft,
    Brain,
    Keyboard,
    Puzzle,
    Activity
} from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"

// Game definitions
const AVAILABLE_GAMES = [
    {
        id: "reaction-speed",
        slug: "reaction-speed",
        title: "Reaction Speed Duel",
        description: "Test your neuro-reflexes. Tap the target as soon as it appears. Fastest average over 15 rounds takes the pot.",
        icon: Zap,
        color: "text-cyber-pink",
        bgColor: "bg-cyber-pink/10",
        borderColor: "border-cyber-pink/20",
        difficulty: "Professional",
        duration: "30-45s",
        priority: true,
        features: ["Server-Verifiable", "Anti-Cheat Enabled", "Instant Result"]
    },
    {
        id: "math-speed",
        slug: "math-speed",
        title: "Math Speed Battle",
        description: "Absolute focus required. Solve 20 arithmetic equations faster than your opponent. Wrong answers add +2s penalties.",
        icon: Brain,
        color: "text-amber-400",
        bgColor: "bg-amber-400/10",
        borderColor: "border-amber-400/20",
        difficulty: "Mental Skill",
        duration: "45-60s",
        priority: true,
        features: ["Equal Difficulty", "Skill Only", "No RNG"]
    },
    {
        id: "memory-grid",
        slug: "memory-grid",
        title: "Memory Grid Challenge",
        description: "Pattern recognition under pressure. Reproduce the flashing grid sequence perfectly.",
        icon: Activity,
        color: "text-cyber-cyan",
        bgColor: "bg-cyber-cyan/10",
        borderColor: "border-cyber-cyan/20",
        difficulty: "High Tension",
        duration: "60-90s",
        priority: false,
        features: ["Progressive Diff", "Pattern Match", "Server Check"]
    },
    {
        id: "typing-speed",
        slug: "typing-speed",
        title: "Typing Speed Arena",
        description: "WPM vs WPM. Type the dynamic paragraph with 100% accuracy to win. No copy-paste allowed.",
        icon: Keyboard,
        color: "text-purple-400",
        bgColor: "bg-purple-400/10",
        borderColor: "border-purple-400/20",
        difficulty: "Physical Skill",
        duration: "60s",
        priority: true,
        features: ["WPM Tracking", "Input Analysis", "Global Standard"]
    },
    {
        id: "logic-puzzle",
        slug: "logic-puzzle",
        title: "Logic Puzzle Race",
        description: "Sequence completion and logic block races. First one to solve the pattern sequence wins.",
        icon: Puzzle,
        color: "text-green-400",
        bgColor: "bg-green-400/10",
        borderColor: "border-green-400/20",
        difficulty: "Strategic",
        duration: "1-2min",
        priority: false,
        features: ["Deterministic", "Puzzle Set Hash", "Audit Logged"]
    }
]

export default function GamePage() {
    const [step, setStep] = useState<"mode" | "game">("mode")
    const [selectedMode, setSelectedMode] = useState<string | null>(null)
    const [selectedGame, setSelectedGame] = useState<string | null>(null)

    const handleModeSelect = (mode: string) => {
        setSelectedMode(mode)
        setStep("game")
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const resetSelection = () => {
        setStep("mode")
        setSelectedMode(null)
        setSelectedGame(null)
    }

    return (
        <div className="min-h-screen bg-[#080808] text-white selection:bg-cyber-pink/30">
            <Header />

            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-cyber-pink/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-cyber-cyan/5 rounded-full blur-[100px]" />
                <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[150px]" />
            </div>

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">

                <AnimatePresence mode="wait">
                    {step === "mode" ? (
                        <motion.div
                            key="mode-step"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            {/* Hero Section */}
                            <div className="mb-16">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 bg-cyber-pink/20 border border-cyber-pink/30 rounded-full">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyber-pink">Step 1: Choose Arena</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Liquidity Pool Active
                                        </div>
                                    </div>
                                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-[0.9]">
                                        Select Your <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-pink via-purple-500 to-cyber-cyan">
                                            Battle Mode
                                        </span>
                                    </h1>
                                    <p className="text-white/40 max-w-lg font-medium">Define your stakes and opponent count. Winner takes the locked vault.</p>
                                </div>
                            </div>

                            {/* Game Modes Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <GameModeCard
                                    title="1v1 Duel"
                                    subtitle="Mode A"
                                    icon={<Swords className="w-8 h-8" />}
                                    color="cyber-pink"
                                    description="Direct confrontation. Winner takes all (minus platform fee)."
                                    payout="2X - 20% Fee"
                                    features={[
                                        { icon: <Target className="w-4 h-4" />, text: "Instant Matchmaking" },
                                        { icon: <TrendingUp className="w-4 h-4" />, text: "Double Your Stake" },
                                        { icon: <Shield className="w-4 h-4" />, text: "Certified Fair Play" }
                                    ]}
                                    cta="Continue to Games"
                                    onClick={() => handleModeSelect('duel')}
                                />

                                <GameModeCard
                                    title="Multiplayer Arena"
                                    subtitle="Mode B"
                                    icon={<Users className="w-8 h-8" />}
                                    color="cyber-cyan"
                                    description="3-100 players. Ranked performance rewards."
                                    payout="Rank-Based Split"
                                    features={[
                                        { icon: <Trophy className="w-4 h-4" />, text: "Tiered Prize Pools" },
                                        { icon: <Users className="w-4 h-4" />, text: "3-100 Players" },
                                        { icon: <Sparkles className="w-4 h-4" />, text: "Bottom players lose" }
                                    ]}
                                    cta="Continue to Games"
                                    onClick={() => handleModeSelect('arena')}
                                    highlight
                                />

                                <GameModeCard
                                    title="Private Matches"
                                    subtitle="Mode C"
                                    icon={<Lock className="w-8 h-8" />}
                                    color="purple-500"
                                    description="Wager with friends or join creator-hosted rooms."
                                    payout="Custom Stakes"
                                    features={[
                                        { icon: <UserCircle2 className="w-4 h-4" />, text: "Friends-only" },
                                        { icon: <Crown className="w-4 h-4" />, text: "Creator-hosted" },
                                        { icon: <Plus className="w-4 h-4" />, text: "Influencer Rooms" }
                                    ]}
                                    cta="Continue to Games"
                                    onClick={() => handleModeSelect('private')}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="game-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            {/* Navigation / Header for Step 2 */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                                <div className="space-y-4">
                                    <button
                                        onClick={resetSelection}
                                        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group mb-4"
                                    >
                                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Modes</span>
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1 rounded-full border border-white/10 uppercase text-[10px] font-black tracking-[0.2em] bg-white/5`}>
                                            {selectedMode === 'duel' ? "1v1 Duel Selection" : selectedMode === 'arena' ? "Arena Selection" : "Private Match Selection"}
                                        </div>
                                        <div className="px-3 py-1 bg-cyber-pink/20 border border-cyber-pink/30 rounded-full">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyber-pink">Step 2: Choose Game</span>
                                        </div>
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-[0.9]">
                                        Arcade <span className="text-cyber-pink overflow-hidden">Laboratory</span>
                                    </h1>
                                    <p className="text-white/40 max-w-lg font-medium italic">All games are skill-based, server-verifiable, and short-session (30s-2m).</p>
                                </div>

                                <div className="hidden lg:flex gap-4">
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                                        <div className="flex items-center gap-3 mb-1">
                                            <Shield className="w-4 h-4 text-green-400" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Security</span>
                                        </div>
                                        <p className="text-xs font-bold text-white/80">Anti-Cheat Active</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                                        <div className="flex items-center gap-3 mb-1">
                                            <BarChart3 className="w-4 h-4 text-cyber-cyan" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Fairness</span>
                                        </div>
                                        <p className="text-xs font-bold text-white/80">Deterministic Inputs</p>
                                    </div>
                                </div>
                            </div>

                            {/* Specific Games Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {AVAILABLE_GAMES.map((game, index) => (
                                    <motion.div
                                        key={game.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        className={`group relative bg-[#111] border rounded-[32px] overflow-hidden cursor-pointer transition-all duration-300 ${game.priority ? 'ring-1 ring-white/10' : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100'}`}
                                    >
                                        <div className="p-8">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className={`p-4 rounded-2xl ${game.bgColor} border ${game.borderColor} transition-transform group-hover:scale-110 duration-500`}>
                                                    <game.icon className={`w-6 h-6 ${game.color}`} />
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-2 justify-end mb-1">
                                                        <Timer className="w-3 h-3 text-white/40" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{game.duration}</span>
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${game.priority ? 'text-cyber-pink' : 'text-white/20'}`}>
                                                        {game.priority ? "Live Now" : "Coming Soon"}
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">{game.title}</h3>
                                            <p className="text-white/40 text-xs font-medium leading-relaxed mb-6 h-12 overflow-hidden line-clamp-3">
                                                {game.description}
                                            </p>

                                            <div className="space-y-2 mb-8">
                                                {game.features.map((feature, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-white/60 uppercase tracking-widest">
                                                        <div className={`w-1 h-1 rounded-full ${game.priority ? 'bg-cyber-pink' : 'bg-white/20'}`} />
                                                        {feature}
                                                    </div>
                                                ))}
                                            </div>

                                            <Link
                                                href={game.priority ? `/game/${game.slug}?mode=${selectedMode}` : "#"}
                                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all
                                                    ${game.priority
                                                        ? 'bg-white text-black hover:bg-cyber-pink hover:text-white shadow-lg'
                                                        : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                                            >
                                                {game.priority ? "Initialize Match" : "Locked"}
                                                {game.priority && <ChevronRight className="w-4 h-4" />}
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Gameplay Policy */}
                            <div className="mt-16 p-8 bg-white/[0.02] border border-white/5 rounded-[40px] flex flex-col md:flex-row items-center gap-8">
                                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-cyber-pink/10 border border-cyber-pink/20 flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-cyber-pink" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-2 font-black italic">Fair Play & Audit Logs</h4>
                                    <p className="text-xs text-white/40 font-medium leading-relaxed">
                                        Every match on Creda Arcade stores an <span className="text-white">Audit Log</span> (Player IDs, Start/End timing, Input summary).
                                        Reaction times below 80ms are automatically flagged. Payouts are resolved server-side
                                        immediately after the match log is verified.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-center">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">RNG Status</p>
                                        <p className="text-xs font-black text-amber-500">DISABLED</p>
                                    </div>
                                    <div className="w-px h-8 bg-white/10" />
                                    <div className="text-center">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Latency Comp</p>
                                        <p className="text-xs font-black text-cyber-cyan">ACTIVE</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}

function GameModeCard({ title, subtitle, icon, color, description, payout, features, cta, onClick, highlight }: any) {
    const colorMap: any = {
        'cyber-pink': 'text-cyber-pink shadow-[0_0_20px_rgba(255,45,108,0.2)] border-cyber-pink/20',
        'cyber-cyan': 'text-cyber-cyan shadow-[0_0_20px_rgba(0,240,255,0.2)] border-cyber-cyan/20',
        'purple-500': 'text-purple-400 shadow-[0_0_20px_rgba(157,0,255,0.2)] border-purple-500/20'
    }

    const glowMap: any = {
        'cyber-pink': 'bg-cyber-pink/10',
        'cyber-cyan': 'bg-cyber-cyan/10',
        'purple-500': 'bg-purple-500/10'
    }

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={onClick}
            className={`cursor-pointer group relative bg-[#111] border rounded-[40px] overflow-hidden transition-all duration-500 ${highlight ? 'ring-2 ring-cyber-cyan/40 scale-105 z-10' : 'border-white/5'}`}
        >
            <div className={`absolute top-0 left-0 w-full h-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[80px] -translate-y-1/2 ${glowMap[color]}`} />

            <div className="p-8 md:p-10 flex flex-col h-full relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className={`p-4 rounded-3xl bg-white/5 border transition-all duration-500 group-hover:bg-white/10 ${colorMap[color]}`}>
                        {icon}
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-1">{subtitle}</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-black uppercase tracking-wider ${colorMap[color]}`}>{payout}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{title}</h2>
                    <p className="text-white/40 text-sm font-medium leading-relaxed">{description}</p>
                </div>

                <div className="flex gap-4 mb-8">
                    <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Min Stake</p>
                        <p className="text-lg font-black tracking-tight">1000 <span className="text-[10px] text-white/40">FRW</span></p>
                    </div>
                    <div className={`flex-1 rounded-2xl p-4 border ${colorMap[color]} bg-white/[0.02]`}>
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Potential</p>
                        <p className="text-lg font-black tracking-tight">{payout}</p>
                    </div>
                </div>

                <div className="space-y-4 flex-grow">
                    {features.map((feature: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-white/60">
                            <div className={`p-1.5 rounded-lg bg-white/5 ${colorMap[color]}`}>
                                {feature.icon}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">{feature.text}</span>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-10 py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
                    {cta}
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
            </div>
        </motion.div>
    )
}
