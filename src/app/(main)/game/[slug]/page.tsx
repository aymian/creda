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

    // Game Flow States
    const [gameState, setGameState] = useState<"lobby" | "connecting" | "playing" | "payout">("lobby")
    const [matchData, setMatchData] = useState<any>(null)
    const [accessCode, setAccessCode] = useState<string>("")
    const [timeLeft, setTimeLeft] = useState(600)
    const [inputCode, setInputCode] = useState("")
    const [connectionProgress, setConnectionProgress] = useState(0)

    // Wallet & Match States
    const [balance, setBalance] = useState(0)
    const [showTopUpModal, setShowTopUpModal] = useState(false)
    const [matchDocId, setMatchDocId] = useState<string | null>(null)
    const [isReceiver, setIsReceiver] = useState(false)
    const [remoteMatchData, setRemoteMatchData] = useState<any>(null)
    const [senderDeducted, setSenderDeducted] = useState(false)

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
                senderPhoto: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
                gameType: slug,
                createdAt: serverTimestamp(),
                staked: 1000,
                pool: 2000
            })
        }

        generateMatch()
    }, [user, slug])

    // 3. Global Match Listener 
    useEffect(() => {
        if (!matchDocId) return

        const unsub = onSnapshot(doc(db, "matches", matchDocId), (docSnap) => {
            if (!docSnap.exists()) return
            const data = docSnap.data()
            setRemoteMatchData(data)

            // Transition: Lobby -> Connecting
            if (data.status === "connecting" && gameState === "lobby") {
                setGameState("connecting")
                startSync()
            }

            // Transition: Connecting -> Playing
            if (data.status === "playing" && gameState === "connecting") {
                setGameState("playing")
            }

            // Transition: Completion
            if (data.status === "completed" && data.winnerId && gameState !== "payout") {
                const isWinner = data.winnerId === user?.uid
                setMatchData({ isWinner })
                setGameState("payout")
            }
        })

        return () => unsub()
    }, [matchDocId, gameState, user])

    // 4. Sender Deduction Trigger
    useEffect(() => {
        if (!isReceiver && remoteMatchData?.status === "connecting" && !senderDeducted && user) {
            setSenderDeducted(true)
            updateDoc(doc(db, "users", user.uid), {
                balance: increment(-1000)
            })
        }
    }, [remoteMatchData?.status, isReceiver, user, senderDeducted])

    const startSync = () => {
        let progress = 0
        const interval = setInterval(() => {
            progress += 2
            setConnectionProgress(progress)
            if (progress >= 100) {
                clearInterval(interval)
                // Sender updates status to 'playing' once sync is complete
                if (!isReceiver && matchDocId) {
                    updateDoc(doc(db, "matches", matchDocId), { status: "playing" })
                }
            }
        }, 60)
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

        if (!snap.exists() || snap.data().status !== "waiting") {
            alert("Match invalid or already started.")
            return
        }

        // Deduct 1000 FRW immediately
        await updateDoc(doc(db, "users", user.uid), {
            balance: increment(-1000)
        })

        setIsReceiver(true)
        setMatchDocId(inputCode)

        await updateDoc(matchRef, {
            receiverId: user.uid,
            receiverUsername: user.displayName || "Opponent",
            receiverPhoto: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
            status: "connecting"
        })
    }

    const onGameComplete = async (score: number, logs: any) => {
        if (!user || !matchDocId) return

        const field = isReceiver ? "receiverScore" : "senderScore"
        await updateDoc(doc(db, "matches", matchDocId), {
            [field]: score,
            [`${field}Logs`]: logs
        })

        const matchRef = doc(db, "matches", matchDocId)
        const freshSnap = await getDoc(matchRef)
        const d = freshSnap.data()

        if (d?.senderScore !== undefined && d?.receiverScore !== undefined) {
            let winnerId = ""
            if (slug === "reaction-speed" || slug === "math-speed") {
                winnerId = d.senderScore < d.receiverScore ? d.senderId : d.receiverId
            } else {
                winnerId = d.senderScore > d.receiverScore ? d.senderId : d.receiverId
            }

            await updateDoc(matchRef, {
                status: "completed",
                winnerId: winnerId
            })

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

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
                <AnimatePresence mode="wait">

                    {gameState === "lobby" && (
                        <motion.div key="lobby" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3">
                                        <QrCode className="w-6 h-6 text-cyber-pink" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-cyber-pink">Live Terminal Sync</span>
                                    </div>
                                    <h1 className="text-6xl font-black uppercase tracking-tighter italic">Match <span className="text-cyber-pink">Terminal</span></h1>
                                    <p className="text-white/40 text-sm">Share your identity code to initialize the neuro-link.</p>

                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-3">
                                        <div className="flex justify-between text-[10px] font-black text-white/20 uppercase"><span>Entry Fee</span><span className="text-white">1000 FRW</span></div>
                                        <div className="flex justify-between text-[10px] font-black text-white/20 uppercase"><span>Winner's Pot</span><span className="text-green-400">1600 FRW</span></div>
                                    </div>
                                </div>

                                <div className="bg-[#111] border border-white/10 rounded-[40px] p-10 space-y-10">
                                    <div className="text-center space-y-4">
                                        <p className="text-[10px] font-black uppercase text-white/20">Your Identity Code</p>
                                        <div className="flex items-center justify-center gap-3">
                                            {accessCode.split("").map((digit, i) => (
                                                <div key={i} className="w-10 h-14 bg-black/40 border-2 border-white/10 rounded-xl flex items-center justify-center text-2xl font-black italic text-cyber-pink shadow-[0_0_20px_rgba(255,45,108,0.1)]">
                                                    {digit}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="ENTER RECEIVED CODE"
                                            value={inputCode}
                                            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                            className="w-full bg-black/40 border-2 border-white/5 rounded-3xl py-6 text-center text-xl font-black tracking-[0.3em] outline-none focus:border-cyber-pink/50 transition-all placeholder:text-white/5"
                                        />
                                        <button onClick={handleJoinWithCode} className="w-full py-6 bg-white text-black rounded-[32px] font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all">Initialize Connection</button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {gameState === "connecting" && (
                        <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto text-center space-y-12 py-20">
                            <div className="flex items-center justify-center gap-8 mb-12">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-24 h-24 rounded-full border-2 border-cyber-pink p-1 overflow-hidden shadow-[0_0_30px_rgba(255,45,108,0.3)]">
                                        <img src={remoteMatchData?.senderPhoto} className="w-full h-full object-cover rounded-full" alt="S" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-white/40">{remoteMatchData?.senderUsername}</span>
                                </div>
                                <div className="text-cyber-pink animate-pulse"><ArrowRightLeft className="w-8 h-8" /></div>
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-24 h-24 rounded-full border-2 border-cyber-cyan p-1 overflow-hidden shadow-[0_0_30px_rgba(0,242,255,0.3)]">
                                        <img src={remoteMatchData?.receiverPhoto} className="w-full h-full object-cover rounded-full" alt="R" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-white/40">{remoteMatchData?.receiverUsername || "SYNCING..."}</span>
                                </div>
                            </div>

                            <div className="relative inline-block scale-125">
                                <svg className="w-48 h-48 transform -rotate-90">
                                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                                    <motion.circle
                                        cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="6" fill="transparent"
                                        strokeDasharray={552} strokeDashoffset={552 - (552 * connectionProgress) / 100}
                                        className="text-cyber-pink"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black italic text-white">{connectionProgress}%</span>
                                    <span className="text-[7px] font-black uppercase tracking-[0.4em] text-cyber-pink">Terminal Sync</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Establishing P2P Bridge</h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Staking verified • 1000 FRW Locked in Escrow</p>
                            </div>
                        </motion.div>
                    )}

                    {gameState === "playing" && (
                        <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl">
                                <Coins className="w-3 h-3 text-red-500" />
                                <span className="text-[9px] font-black uppercase text-red-500">1000 FRW COMMITTED TO POOL</span>
                            </div>
                            {renderGame()}
                        </motion.div>
                    )}

                    {gameState === "payout" && (
                        <motion.div key="payout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
                            <div className="bg-[#111] border border-white/10 rounded-[50px] overflow-hidden">
                                <div className={`p-16 text-center ${matchData.isWinner ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                    <Trophy className={`w-20 h-20 mx-auto mb-8 ${matchData.isWinner ? 'text-green-400' : 'text-white/10'}`} />
                                    <h2 className="text-7xl font-black uppercase italic tracking-tighter mb-4">{matchData.isWinner ? "VICTORY" : "DEFEAT"}</h2>
                                    <p className="text-white/40 font-black uppercase tracking-widest text-[10px]">
                                        {matchData.isWinner ? "1600 FRW ADDED TO YOUR CREDA CARD" : "1000 FRW LOST. NO PAYOUT ALLOCATED."}
                                    </p>
                                </div>
                                <div className="p-12 flex flex-col items-center">
                                    <button onClick={() => router.push('/wallet')} className="w-full max-w-sm py-6 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">Verify Balance</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
