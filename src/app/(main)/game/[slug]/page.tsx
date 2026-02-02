"use client"

import React, { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Lock,
    ShieldCheck,
    Coins,
    ChevronRight,
    ArrowLeft,
    User,
    Zap,
    Trophy,
    ArrowRightLeft,
    CheckCircle2,
    QrCode,
    Timer,
    AlertCircle,
    Activity,
    Wifi,
    Wallet,
    X,
    CreditCard
} from "lucide-react"
import { Header } from "@/components/header"
import { ReactionGame } from "@/components/game/ReactionGame"
import { MathGame } from "@/components/game/MathGame"
import { TypingGame } from "@/components/game/TypingGame"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { doc, onSnapshot, updateDoc, increment } from "firebase/firestore"

export default function GameInstancePage() {
    const { slug } = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()

    // Game Flow States
    const [gameState, setGameState] = useState<"lobby" | "connecting" | "matchmaking" | "playing" | "payout">("lobby")
    const [matchData, setMatchData] = useState<any>(null)
    const [accessCode, setAccessCode] = useState<string>("")
    const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
    const [inputCode, setInputCode] = useState("")
    const [connectionProgress, setConnectionProgress] = useState(0)

    // Wallet States
    const [balance, setBalance] = useState(0)
    const [showTopUpModal, setShowTopUpModal] = useState(false)

    // Sync Balance
    useEffect(() => {
        if (!user) return
        const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
            if (doc.exists()) {
                setBalance(doc.data().balance || 0)
            }
        })
        return () => unsub()
    }, [user])

    // Generate code on mount
    useEffect(() => {
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        setAccessCode(code)
    }, [])

    // Expiration Timer
    useEffect(() => {
        if (gameState === "lobby" && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1)
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [timeLeft, gameState])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const startConnection = () => {
        if (balance < 1000) {
            setShowTopUpModal(true)
            return
        }
        setGameState("connecting")
    }

    const handleSimulatorJoin = () => {
        if (balance < 1000) {
            setShowTopUpModal(true)
            return
        }
        // Simulation: Sender also enters connecting state
        handleCodeSubmit()
    }

    const handleCodeSubmit = async () => {
        if (balance < 1000) {
            setShowTopUpModal(true)
            return
        }

        // Deduct Funds logic
        if (user) {
            try {
                await updateDoc(doc(db, "users", user.uid), {
                    balance: increment(-1000)
                })
            } catch (e) {
                console.error("Deduction failed", e)
            }
        }

        setGameState("matchmaking")
        let progress = 0
        const interval = setInterval(() => {
            progress += 5
            setConnectionProgress(progress)
            if (progress >= 100) {
                clearInterval(interval)
                setTimeout(() => setGameState("playing"), 500)
            }
        }, 120)
    }

    // Handle game completion
    const onGameComplete = async (score: number, logs: any) => {
        setMatchData({ score, logs })
        setGameState("payout")

        // Winner Payout
        if (user) {
            try {
                await updateDoc(doc(db, "users", user.uid), {
                    balance: increment(1600)
                })
            } catch (e) {
                console.error("Payout failed", e)
            }
        }
    }

    const renderGame = () => {
        switch (slug) {
            case "reaction-speed":
                return <ReactionGame onComplete={onGameComplete} />
            case "math-speed":
                return <MathGame onComplete={onGameComplete} />
            case "typing-speed":
                return <TypingGame onComplete={onGameComplete} />
            default:
                return <div>Game not found or under development.</div>
        }
    }

    return (
        <div className="min-h-screen bg-[#080808] text-white selection:bg-cyber-pink/30">
            <Header />

            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-cyber-pink/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[120px]" />
            </div>

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">

                {gameState === "lobby" && (
                    <button
                        onClick={() => router.push('/game')}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-all group mb-12"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Arcade</span>
                    </button>
                )}

                <AnimatePresence mode="wait">

                    {/* STEP 1: LOBBY & CODE GENERATION */}
                    {gameState === "lobby" && (
                        <motion.div
                            key="lobby"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-cyber-pink/10 border border-cyber-pink/20 rounded-xl">
                                            <QrCode className="w-6 h-6 text-cyber-pink" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyber-pink">Room Protocol Alpha</span>
                                    </div>
                                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-none">
                                        Match <br /> <span className="text-cyber-pink">Terminal</span>
                                    </h1>
                                    <p className="text-white/40 font-medium max-w-sm lowercase leading-relaxed">
                                        Share your unique access code with your opponent or enter theirs to initialize the secure neuro-link.
                                    </p>

                                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Wager Fee</span>
                                            <span className="text-sm font-black text-white">1000 FRW</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Platform Cut</span>
                                            <span className="text-sm font-black text-cyber-pink">20%</span>
                                        </div>
                                        <div className="h-px bg-white/5 w-full" />
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Potential Payout</span>
                                            <span className="text-lg font-black text-green-400">1600 FRW</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#111] border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110 duration-700">
                                        <ShieldCheck className="w-56 h-56 text-white" />
                                    </div>

                                    <div className="relative z-10 space-y-10">
                                        <div className="text-center space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Your Access Code</p>
                                            <div className="flex items-center justify-center gap-4">
                                                {accessCode.split("").map((digit, i) => (
                                                    <div key={i} className="w-10 h-14 bg-black/40 border-2 border-white/10 rounded-xl flex items-center justify-center text-2xl font-black italic text-cyber-pink">
                                                        {digit}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-center gap-2 text-white/40">
                                                <Timer className="w-3 h-3" />
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${timeLeft < 60 ? 'text-red-500 animate-pulse' : ''}`}>
                                                    {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : "CODE EXPIRED"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="h-px bg-white/5" />

                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-center text-white/20">Or Connect to Opponent</p>
                                            <div className="flex flex-col gap-3">
                                                <button
                                                    disabled={timeLeft === 0}
                                                    onClick={handleSimulatorJoin}
                                                    className="w-full py-6 bg-cyber-pink text-white disabled:opacity-20 disabled:cursor-not-allowed rounded-[32px] font-black uppercase tracking-[0.3em] text-xs hover:scale-105 transition-all flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(255,45,108,0.3)]"
                                                >
                                                    {timeLeft > 0 ? "Initializing Room (Wait)" : "Reinitialize Room"}
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                                <button
                                                    disabled={timeLeft === 0}
                                                    onClick={startConnection}
                                                    className="w-full py-6 bg-white text-black disabled:opacity-20 disabled:cursor-not-allowed rounded-[32px] font-black uppercase tracking-[0.3em] text-xs hover:scale-105 transition-all flex items-center justify-center gap-4"
                                                >
                                                    Enter Received Code
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* DEDUCTION NOTIFICATION (TRANSITION) */}
                    {gameState === "playing" && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl"
                        >
                            <Coins className="w-4 h-4 text-red-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">-1000 FRW ENTRY FEE DEDUCTED</span>
                        </motion.div>
                    )}

                    {/* STEP 2: ENTER CODE PAGE */}
                    {gameState === "connecting" && (
                        <motion.div
                            key="connecting"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="max-w-md mx-auto text-center space-y-10 py-10"
                        >
                            <div className="space-y-4">
                                <div className="p-4 bg-cyber-pink/10 border border-cyber-pink/20 rounded-2xl w-fit mx-auto">
                                    <Wifi className="w-8 h-8 text-cyber-pink animate-pulse" />
                                </div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter italic">Receive Link</h2>
                                <p className="text-white/40 text-sm font-medium">Input the 6-digit code shared by your opponent.</p>
                            </div>

                            <div className="relative group">
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={inputCode}
                                    onChange={(e) => setInputCode(e.target.value)}
                                    className="w-full bg-black/40 border-2 border-white/10 rounded-[32px] px-8 py-8 text-5xl font-black text-center text-cyber-pink focus:border-cyber-pink focus:outline-none transition-all placeholder:text-white/5 tracking-[0.3em]"
                                    placeholder="000000"
                                    autoFocus
                                />
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#080808] px-4 font-black text-[10px] uppercase tracking-widest text-white/20">
                                    Encrypted Channel
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setGameState("lobby")}
                                    className="px-8 py-5 border border-white/10 rounded-full font-black uppercase tracking-[0.2em] text-[10px] text-white/40 hover:text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={inputCode.length < 6}
                                    onClick={handleCodeSubmit}
                                    className="flex-1 py-5 bg-white text-black disabled:opacity-30 disabled:cursor-not-allowed rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all shadow-xl"
                                >
                                    Initialize Connection
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: MATCHMAKING PROGRESS */}
                    {gameState === "matchmaking" && (
                        <motion.div
                            key="matchmaking"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="max-w-2xl mx-auto text-center space-y-12 py-20"
                        >
                            <div className="relative inline-block">
                                <svg className="w-48 h-48 transform -rotate-90">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-white/5"
                                    />
                                    <motion.circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={552}
                                        strokeDashoffset={552 - (552 * connectionProgress) / 100}
                                        className="text-cyber-pink"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black italic tracking-tighter">{connectionProgress}%</span>
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Syncing</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-black uppercase tracking-tighter italic text-cyber-pink animate-pulse">Connecting...</h2>
                                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Handshaking with Remote Server Terminal</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                                <div className={`h-1 rounded-full transition-all duration-500 ${connectionProgress > 30 ? 'bg-cyber-pink shadow-[0_0_10px_rgba(255,45,108,0.5)]' : 'bg-white/5'}`} />
                                <div className={`h-1 rounded-full transition-all duration-500 ${connectionProgress > 60 ? 'bg-cyber-pink shadow-[0_0_10px_rgba(255,45,108,0.5)]' : 'bg-white/5'}`} />
                                <div className={`h-1 rounded-full transition-all duration-500 ${connectionProgress > 90 ? 'bg-cyber-pink shadow-[0_0_10px_rgba(255,45,108,0.5)]' : 'bg-white/5'}`} />
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: THE ACTUAL GAME PLAY */}
                    {gameState === "playing" && (
                        <motion.div
                            key="playing"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            {renderGame()}
                        </motion.div>
                    )}

                    {/* STEP 5: PAYOUT / RESULT */}
                    {gameState === "payout" && (
                        <motion.div
                            key="payout"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="bg-[#111] border border-white/10 rounded-[50px] overflow-hidden">
                                <div className="bg-gradient-to-r from-cyber-pink/20 to-purple-600/20 p-12 text-center border-b border-white/10">
                                    <div className="inline-block p-6 bg-white rounded-full mb-6">
                                        <Trophy className="w-12 h-12 text-black" />
                                    </div>
                                    <h2 className="text-5xl font-black uppercase tracking-tighter italic mb-4">MATCH VERIFIED</h2>
                                    <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Neural logs synchronized. Stake reallocation complete.</p>
                                </div>

                                <div className="p-12 space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="p-8 bg-black/40 rounded-[32px] border border-white/5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-6">Wager Settlement</p>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-white/40">Total Pool</span>
                                                    <span className="font-bold">2000 FRW</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm text-cyber-pink">
                                                    <span className="font-bold">Platform Fee (20%)</span>
                                                    <span className="font-bold">-400 FRW</span>
                                                </div>
                                                <div className="h-px bg-white/5" />
                                                <div className="flex justify-between items-center text-lg">
                                                    <span className="text-white font-black italic">WINNER PAYOUT</span>
                                                    <span className="font-black text-green-400">1600 FRW</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-cyber-pink/5 rounded-[32px] border border-cyber-pink/20 flex flex-col items-center justify-center text-center">
                                            <Activity className="w-8 h-8 text-cyber-pink mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Performance Stat</p>
                                            <h4 className="text-4xl font-black italic tracking-tighter text-white">
                                                {matchData?.score} {slug === 'reaction-speed' ? 'ms' : slug === 'typing-speed' ? 'WPM' : 's'}
                                            </h4>
                                            <div className="mt-6 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                                                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Added to Wallet Card</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <ShieldCheck className="w-5 h-5 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest">System Audit Log</p>
                                                <p className="text-[10px] text-white/20 font-bold uppercase font-mono">FRW_PAYOUT_LOG_{Math.random().toString(36).substring(7).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => router.push('/wallet')}
                                            className="px-8 py-3 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-cyber-pink hover:text-white transition-all flex items-center gap-2"
                                        >
                                            Go to Wallet
                                            <ArrowRightLeft className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* INSUFFICIENT FUNDS MODAL */}
                <AnimatePresence>
                    {showTopUpModal && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                                onClick={() => setShowTopUpModal(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-[#111] border border-white/10 rounded-[40px] p-10 max-w-md w-full shadow-2xl overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Wallet className="w-48 h-48 text-white" />
                                </div>
                                <button
                                    onClick={() => setShowTopUpModal(false)}
                                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white/40" />
                                </button>

                                <div className="relative z-10 text-center space-y-6">
                                    <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="w-10 h-10 text-red-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Low Balance</h2>
                                        <p className="text-white/40 text-sm font-medium leading-relaxed">Your current balance (<span className="text-white">{balance.toLocaleString()} FRW</span>) is insufficient to cover the <span className="text-white">1000 FRW</span> entry fee.</p>
                                    </div>

                                    <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-3">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
                                            <span>Required Entry</span>
                                            <span className="text-white">1000 FRW</span>
                                        </div>
                                        <div className="h-px bg-white/5" />
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
                                            <span>Current Card</span>
                                            <span className="text-red-500">{balance.toLocaleString()} FRW</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => router.push('/wallet')}
                                            className="w-full py-5 bg-white text-black rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl"
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            Top Up Creda Card
                                        </button>
                                        <button
                                            onClick={() => setShowTopUpModal(false)}
                                            className="w-full py-4 text-white/20 font-black uppercase tracking-[0.2em] text-[8px] hover:text-white transition-colors"
                                        >
                                            Dismiss Notice
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
