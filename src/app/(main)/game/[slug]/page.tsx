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
import { doc, onSnapshot, updateDoc, increment, setDoc, getDoc, serverTimestamp } from "firebase/firestore"

export default function GameInstancePage() {
    const { slug } = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()
    const mode = searchParams.get("mode") || "duel"

    // Game Flow States
    const [gameState, setGameState] = useState<"lobby" | "connecting" | "matchmaking" | "playing" | "payout">("lobby")
    const [matchData, setMatchData] = useState<any>(null)
    const [accessCode, setAccessCode] = useState<string>("")
    const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
    const [inputCode, setInputCode] = useState("")
    const [connectionProgress, setConnectionProgress] = useState(0)

    // Wallet & Match States
    const [balance, setBalance] = useState(0)
    const [showTopUpModal, setShowTopUpModal] = useState(false)
    const [matchDocId, setMatchDocId] = useState<string | null>(null)
    const [isReceiver, setIsReceiver] = useState(false)
    const [remoteMatchData, setRemoteMatchData] = useState<any>(null)

    // 1. Sync User Balance
    useEffect(() => {
        if (!user) return
        const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
            if (doc.exists()) {
                setBalance(doc.data().balance || 0)
            }
        })
        return () => unsub()
    }, [user])

    // 2. Generate and Register Match (on Lobby mount)
    useEffect(() => {
        if (!user || matchDocId) return

        const generateMatch = async () => {
            const code = Math.floor(100000 + Math.random() * 900000).toString()
            setAccessCode(code)
            setMatchDocId(code)

            await setDoc(doc(db, "matches", code), {
                status: "waiting",
                senderId: user.uid,
                senderUsername: user.displayName || "Anonymous",
                gameType: slug,
                createdAt: serverTimestamp(),
                expiresAt: Date.now() + 600000,
                staked: 1000,
                pool: 2000
            })
        }

        generateMatch()
    }, [user, slug])

    // 3. Global Match Listener (Real-time sync between browsers)
    useEffect(() => {
        if (!matchDocId) return

        const unsub = onSnapshot(doc(db, "matches", matchDocId), (docSnap) => {
            if (!docSnap.exists()) return
            const data = docSnap.data()
            setRemoteMatchData(data)

            // Auto-transition based on remote status
            if (data.status === "connecting" && gameState === "lobby") {
                setGameState("connecting")
            }
            if (data.status === "matchmaking" && gameState === "connecting") {
                startLocalMatchmaking()
            }
            if (data.status === "playing" && gameState === "matchmaking") {
                setGameState("playing")
            }
            if (data.status === "completed" && data.winnerId && gameState === "playing") {
                // Determine if WE are the winner
                const isWinner = data.winnerId === user?.uid
                setMatchData({ ...matchData, isWinner, finalPayout: isWinner ? 1600 : 0 })
                setGameState("payout")
            }
        })

        return () => unsub()
    }, [matchDocId, gameState, user])

    // 4. Expiration Timer (Visual Only)
    useEffect(() => {
        if (gameState === "lobby" && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
            return () => clearInterval(timer)
        }
    }, [timeLeft, gameState])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // 5. RECEIVER JOIN LOGIC
    const handleJoinWithCode = async () => {
        if (!user || inputCode.length < 6) return
        if (balance < 1000) {
            setShowTopUpModal(true)
            return
        }

        const matchRef = doc(db, "matches", inputCode)
        const snap = await getDoc(matchRef)

        if (!snap.exists()) {
            alert("Match code invalid or expired.")
            return
        }

        const data = snap.data()
        if (data.status !== "waiting") {
            alert("Match already in progress or completed.")
            return
        }

        // Deduct 1000 FRW
        await updateDoc(doc(db, "users", user.uid), {
            balance: increment(-1000)
        })

        setIsReceiver(true)
        setMatchDocId(inputCode)

        await updateDoc(matchRef, {
            receiverId: user.uid,
            status: "connecting",
            startTime: serverTimestamp()
        })
    }

    // 6. SENDER INITIALIZE LOGIC
    const handleSenderStart = async () => {
        if (!user || !matchDocId) return
        if (balance < 1000) {
            setShowTopUpModal(true)
            return
        }

        // Deduct 1000 FRW
        await updateDoc(doc(db, "users", user.uid), {
            balance: increment(-1000)
        })

        // Move to matchmaking state locally and remotely
        setGameState("matchmaking")
        await updateDoc(doc(db, "matches", matchDocId), {
            status: "matchmaking"
        })
    }

    const startLocalMatchmaking = () => {
        setGameState("matchmaking")
        let progress = 0
        const interval = setInterval(() => {
            progress += 5
            setConnectionProgress(progress)
            if (progress >= 100) {
                clearInterval(interval)
                // If we are the one finishing progress, change remote status
                updateDoc(doc(db, "matches", matchDocId!), { status: "playing" })
            }
        }, 120)
    }

    // 7. GAME COMPLETION LOGIC
    const onGameComplete = async (score: number, logs: any) => {
        if (!user || !matchDocId) return

        // Write locally first
        const field = isReceiver ? "receiverScore" : "senderScore"
        await updateDoc(doc(db, "matches", matchDocId), {
            [field]: score,
            [`${field}Logs`]: logs
        })

        // Wait for results listener to trigger "completed" status
        // A simple "Resolution" logic would usually be server-side
        // For this demo, we check if BOTH scores exist and update status
        const matchRef = doc(db, "matches", matchDocId)
        const freshSnap = await getDoc(matchRef)
        const d = freshSnap.data()

        if (d?.senderScore !== undefined && d?.receiverScore !== undefined) {
            let winnerId = ""
            if (slug === "reaction-speed" || slug === "math-speed") {
                // Lower is better
                winnerId = d.senderScore < d.receiverScore ? d.senderId : d.receiverId
            } else {
                // Higher is better (Typing WPM)
                winnerId = d.senderScore > d.receiverScore ? d.senderId : d.receiverId
            }

            await updateDoc(matchRef, {
                status: "completed",
                winnerId: winnerId
            })

            // Pay the winner 1600 FRW
            if (user.uid === winnerId) {
                await updateDoc(doc(db, "users", winnerId), {
                    balance: increment(1600)
                })
            }
        }
    }

    const renderGame = () => {
        switch (slug) {
            case "reaction-speed": return <ReactionGame onComplete={onGameComplete} />
            case "math-speed": return <MathGame onComplete={onGameComplete} />
            case "typing-speed": return <TypingGame onComplete={onGameComplete} />
            default: return <div>Game not found.</div>
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
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyber-pink tracking-widest">Live Terminal Sync</span>
                                    </div>
                                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-none">
                                        Match <br /> <span className="text-cyber-pink">Terminal</span>
                                    </h1>
                                    <p className="text-white/40 font-medium max-w-sm lowercase leading-relaxed">
                                        Both users must initialize connection. Once the opponent enters your code, the neuro-link connects automatically.
                                    </p>

                                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/20">
                                            <span>Required Entry</span>
                                            <span className="text-white">1000 FRW</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/20">
                                            <span>Potential Pot</span>
                                            <span className="text-green-400">1600 FRW</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#111] border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
                                    <div className="relative z-10 space-y-10">
                                        <div className="text-center space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Your Identity Code</p>
                                            <div className="flex items-center justify-center gap-3">
                                                {accessCode.split("").map((digit, i) => (
                                                    <div key={i} className="w-10 h-14 bg-black/40 border-[1.5px] border-white/10 rounded-xl flex items-center justify-center text-2xl font-black italic text-cyber-pink shadow-[0_0_20px_rgba(255,45,108,0.1)]">
                                                        {digit}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-center gap-2 text-white/20">
                                                <Timer className="w-3 h-3" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Waiting for remote join...</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                maxLength={6}
                                                placeholder="ENTER RECEIVED CODE"
                                                value={inputCode}
                                                onChange={(e) => setInputCode(e.target.value)}
                                                className="w-full bg-black/40 border-2 border-white/5 rounded-3xl py-6 px-4 text-center text-xl font-black tracking-[0.3em] focus:border-cyber-pink/50 outline-none transition-all placeholder:text-white/5"
                                            />
                                            <button
                                                onClick={handleJoinWithCode}
                                                className="w-full py-6 bg-white text-black rounded-[32px] font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] transition-all flex items-center justify-center gap-4"
                                            >
                                                Initialize Connection
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: CONNECTING ANIMATION (SHARED) */}
                    {(gameState === "connecting" || gameState === "matchmaking") && (
                        <motion.div
                            key="connecting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="max-w-2xl mx-auto text-center space-y-12 py-20"
                        >
                            <div className="relative inline-block">
                                <svg className="w-56 h-56 transform -rotate-90">
                                    <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                                    <motion.circle
                                        cx="112"
                                        cy="112"
                                        r="100"
                                        stroke="currentColor"
                                        strokeWidth="6"
                                        fill="transparent"
                                        strokeDasharray={628}
                                        strokeDashoffset={628 - (628 * connectionProgress) / 100}
                                        className="text-cyber-pink"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black italic tracking-tighter italic text-white">{connectionProgress}%</span>
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-cyber-pink">Terminal Sync</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white">Establishing P2P Bridge</h2>
                                <div className="flex flex-col gap-2">
                                    {remoteMatchData?.senderUsername && (
                                        <p className="text-xs font-bold text-cyber-pink uppercase tracking-widest animate-pulse">
                                            Opponent Found: {remoteMatchData.senderUsername}
                                        </p>
                                    )}
                                    <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em]">Staking verified • Funds Locked in Escrow</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: PLAYING */}
                    {gameState === "playing" && (
                        <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl">
                                <Coins className="w-3 h-3 text-red-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-red-500">1000 FRW COMMITTED TO POOL</span>
                            </div>
                            {renderGame()}
                        </motion.div>
                    )}

                    {/* STEP 4: PAYOUT & RESULT */}
                    {gameState === "payout" && (
                        <motion.div key="payout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
                            <div className="bg-[#111] border border-white/10 rounded-[50px] overflow-hidden">
                                <div className={`p-12 text-center border-b border-white/5 ${matchData.isWinner ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                    <div className={`inline-block p-6 rounded-full mb-6 ${matchData.isWinner ? 'bg-green-500 text-black' : 'bg-white/5 text-white/40'}`}>
                                        <Trophy className="w-12 h-12" />
                                    </div>
                                    <h2 className="text-6xl font-black uppercase tracking-tighter italic mb-4">
                                        {matchData.isWinner ? "YOU WON!" : "DEFEATED"}
                                    </h2>
                                    <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
                                        {matchData.isWinner ? "The 1600 FRW pot has been added to your card." : "Better luck next time. No funds returned."}
                                    </p>
                                </div>

                                <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Performance Metrics</p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-white/40">Your Score</span>
                                                <span className="font-black text-white">{isReceiver ? remoteMatchData.receiverScore : remoteMatchData.senderScore}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-white/40">Opponent Score</span>
                                                <span className="font-black text-white">{isReceiver ? remoteMatchData.senderScore : remoteMatchData.receiverScore}</span>
                                            </div>
                                            <div className="h-px bg-white/5 my-2" />
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-white/40">Payout Status</span>
                                                <span className={`font-black uppercase ${matchData.isWinner ? 'text-green-400' : 'text-red-500'}`}>
                                                    {matchData.isWinner ? "+1600 FRW" : "ZERO"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/5 rounded-[40px] text-center">
                                        <Wallet className="w-8 h-8 text-cyber-pink mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Updated Balance</p>
                                        <h4 className="text-4xl font-black italic tracking-tighter mb-6">{balance.toLocaleString()} FRW</h4>
                                        <button
                                            onClick={() => router.push('/wallet')}
                                            className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[9px] hover:scale-105 transition-all"
                                        >
                                            Verify in Wallet
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
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-[#111] border border-white/10 rounded-[40px] p-10 max-w-md w-full text-center space-y-8 shadow-[0_0_100px_rgba(255,45,108,0.1)]">
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <AlertCircle className="w-10 h-10 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">Low Balance</h2>
                                    <p className="text-white/40 text-sm mt-2">You need 1000 FRW to enter the arena.</p>
                                </div>
                                <button
                                    onClick={() => router.push('/wallet')}
                                    className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                                >
                                    <CreditCard className="w-4 h-4" /> Top Up Card
                                </button>
                                <button onClick={() => setShowTopUpModal(false)} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Close</button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
