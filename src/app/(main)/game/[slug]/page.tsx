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
    CreditCard,
    DollarSign,
    Euro
} from "lucide-react"
import { Header } from "@/components/header"
import { ReactionGame } from "@/components/game/ReactionGame"
import { MathGame } from "@/components/game/MathGame"
import { TypingGame } from "@/components/game/TypingGame"
import { PuzzleGame } from "@/components/game/PuzzleGame"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { doc, onSnapshot, updateDoc, increment, setDoc, getDoc, serverTimestamp } from "firebase/firestore"

type Currency = 'FRW' | 'USD' | 'EUR';

export default function GameInstancePage() {
    const { slug } = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user } = useAuth()

    // Game Flow States
    const [gameState, setGameState] = useState<"lobby" | "connecting" | "countdown" | "playing" | "payout">("lobby")
    const [matchData, setMatchData] = useState<any>(null)
    const [accessCode, setAccessCode] = useState<string>("")
    const [inputCode, setInputCode] = useState("")
    const [connectionProgress, setConnectionProgress] = useState(0)
    const [preStartTimer, setPreStartTimer] = useState(5)

    // Wallet & Match States
    const [balance, setBalance] = useState(0)
    const [showTopUpModal, setShowTopUpModal] = useState(false)
    const [matchDocId, setMatchDocId] = useState<string | null>(null)
    const [isReceiver, setIsReceiver] = useState(false)
    const [remoteMatchData, setRemoteMatchData] = useState<any>(null)
    const [senderDeducted, setSenderDeducted] = useState(false)

    // Stake Selection (For Sender)
    const [stakeAmount, setStakeAmount] = useState<number>(1000)
    const [stakeCurrency, setStakeCurrency] = useState<Currency>('FRW')

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
                currency: 'FRW',
                pool: 2000
            })
        }

        generateMatch()
    }, [user, slug])

    // Update Stake in Firestore (Sender Only)
    const updateStake = async (val: number, curr: Currency) => {
        if (isReceiver || !matchDocId) return

        let min = 1000;
        let max = 10000000;
        if (curr !== 'FRW') {
            min = 1;
            max = 10000;
        }

        const cleanVal = Math.max(min, Math.min(max, val));
        setStakeAmount(cleanVal);
        setStakeCurrency(curr);

        await updateDoc(doc(db, "matches", matchDocId), {
            staked: cleanVal,
            currency: curr,
            pool: cleanVal * 2
        })
    }

    // 3. Global Match Listener 
    useEffect(() => {
        if (!matchDocId) return

        const unsub = onSnapshot(doc(db, "matches", matchDocId), (docSnap) => {
            if (!docSnap.exists()) return
            const data = docSnap.data()
            setRemoteMatchData(data)

            // Sync stake for receiver
            if (isReceiver) {
                setStakeAmount(data.staked)
                setStakeCurrency(data.currency)
            }

            // Transition: Lobby -> Connecting
            if (data.status === "connecting" && gameState === "lobby") {
                setGameState("connecting")
                startSync()
            }

            // Transition: Connecting -> Countdown
            if (data.status === "countdown" && gameState === "connecting") {
                setGameState("countdown")
                startCountdown()
            }

            // Transition: Countdown -> Playing
            if (data.status === "playing" && gameState === "countdown") {
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
    }, [matchDocId, gameState, user, isReceiver])

    // 4. Sender Deduction Trigger
    useEffect(() => {
        if (!isReceiver && remoteMatchData?.status === "connecting" && !senderDeducted && user) {
            setSenderDeducted(true)
            updateDoc(doc(db, "users", user.uid), {
                balance: increment(-remoteMatchData.staked)
            })
        }
    }, [remoteMatchData?.status, isReceiver, user, senderDeducted, remoteMatchData?.staked])

    const startSync = () => {
        let progress = 0
        const interval = setInterval(() => {
            progress += 2
            setConnectionProgress(progress)
            if (progress >= 100) {
                clearInterval(interval)
                // Sender updates status to 'countdown' once sync is complete
                if (!isReceiver && matchDocId) {
                    updateDoc(doc(db, "matches", matchDocId), { status: "countdown" })
                }
            }
        }, 60)
    }

    const startCountdown = () => {
        let count = 5
        setPreStartTimer(count)
        const interval = setInterval(() => {
            count -= 1
            setPreStartTimer(count)
            if (count <= 0) {
                clearInterval(interval)
                if (!isReceiver && matchDocId) {
                    updateDoc(doc(db, "matches", matchDocId), { status: "playing" })
                }
            }
        }, 1000)
    }

    // 5. RECEIVER JOIN LOGIC
    const handleJoinWithCode = async () => {
        if (!user || inputCode.length < 6) return

        const matchRef = doc(db, "matches", inputCode)
        const snap = await getDoc(matchRef)

        if (!snap.exists() || snap.data().status !== "waiting") {
            alert("Match invalid or already started.")
            return
        }

        const data = snap.data()
        if (balance < data.staked) {
            setShowTopUpModal(true)
            return
        }

        // Deduct Stake immediately
        await updateDoc(doc(db, "users", user.uid), {
            balance: increment(-data.staked)
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
            if (slug === "reaction-speed" || slug === "math-speed" || slug === "logic-puzzle") {
                winnerId = d.senderScore < d.receiverScore ? d.senderId : d.receiverId
            } else {
                winnerId = d.senderScore > d.receiverScore ? d.senderId : d.receiverId
            }

            await updateDoc(matchRef, {
                status: "completed",
                winnerId: winnerId
            })

            if (user.uid === winnerId) {
                const payout = d.pool * 0.8; // 20% fee
                await updateDoc(doc(db, "users", winnerId), {
                    balance: increment(payout)
                })
            }
        }
    }

    const renderGame = () => {
        switch (slug) {
            case "reaction-speed": return <ReactionGame onComplete={onGameComplete} />
            case "math-speed": return <MathGame onComplete={onGameComplete} />
            case "typing-speed": return <TypingGame onComplete={onGameComplete} />
            case "logic-puzzle": return <PuzzleGame onComplete={onGameComplete} />
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

                                    <div className="space-y-6">
                                        <p className="text-white/40 text-sm">Define your stakes. Your opponent must match this amount to join.</p>

                                        {!isReceiver && (
                                            <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Entry Stake</span>
                                                    <div className="flex gap-2">
                                                        {(['FRW', 'USD', 'EUR'] as Currency[]).map(c => (
                                                            <button
                                                                key={c}
                                                                onClick={() => updateStake(stakeAmount, c)}
                                                                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${stakeCurrency === c ? 'bg-cyber-pink text-white shadow-[0_0_20px_rgba(255,45,108,0.3)]' : 'bg-white/5 text-white/20'}`}
                                                            >
                                                                {c}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={stakeAmount}
                                                        onChange={(e) => updateStake(parseInt(e.target.value) || 0, stakeCurrency)}
                                                        className="w-full bg-black/40 border-2 border-white/5 rounded-3xl py-6 px-8 text-3xl font-black text-white outline-none focus:border-cyber-pink transition-all"
                                                    />
                                                    <div className="absolute right-8 top-1/2 -translate-y-1/2 text-white/20 font-black">
                                                        {stakeCurrency === 'FRW' ? 'FRW' : stakeCurrency === 'USD' ? <DollarSign /> : <Euro />}
                                                    </div>
                                                </div>

                                                <div className="flex justify-between text-[10px] font-black text-white/20 uppercase tracking-widest">
                                                    <span>Min: {stakeCurrency === 'FRW' ? '1000' : '1'}</span>
                                                    <span>Max: {stakeCurrency === 'FRW' ? '10M' : '10K'}</span>
                                                </div>
                                            </div>
                                        )}

                                        {isReceiver && (
                                            <div className="p-8 bg-cyber-pink/5 border border-cyber-pink/20 rounded-[40px] space-y-3">
                                                <div className="flex justify-between text-[10px] font-black text-cyber-pink uppercase tracking-widest"><span>Staked Amount</span><span className="text-white">{stakeAmount} {stakeCurrency}</span></div>
                                                <div className="flex justify-between text-[10px] font-black text-cyber-pink uppercase tracking-widest"><span>Winner's Pot (80%)</span><span className="text-green-400">{(stakeAmount * 2 * 0.8).toLocaleString()} {stakeCurrency}</span></div>
                                            </div>
                                        )}
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
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Staking {stakeAmount} {stakeCurrency} locked in escrow</p>
                            </div>
                        </motion.div>
                    )}

                    {gameState === "countdown" && (
                        <motion.div key="countdown" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-40">
                            <motion.span
                                key={preStartTimer}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[200px] font-black italic text-cyber-pink drop-shadow-[0_0_50px_rgba(255,45,108,0.5)]"
                            >
                                {preStartTimer}
                            </motion.span>
                            <p className="text-xl font-black uppercase tracking-[0.5em] text-white/20">Get Ready</p>
                        </motion.div>
                    )}

                    {gameState === "playing" && (
                        <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl">
                                <Coins className="w-3 h-3 text-red-500" />
                                <span className="text-[9px] font-black uppercase text-red-500">{stakeAmount} {stakeCurrency} COMMITTED</span>
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
                                        {matchData.isWinner ? `PAYOUT ADDED TO YOUR CREDA CARD` : `${stakeAmount} ${stakeCurrency} LOST. NO PAYOUT.`}
                                    </p>
                                </div>
                                <div className="p-12 flex flex-col items-center">
                                    <button onClick={() => router.push('/wallet')} className="w-full max-w-sm py-6 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">Verify Balance</button>
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
                                    <p className="text-white/40 text-sm mt-2">You need {stakeAmount} {stakeCurrency} to enter this match.</p>
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
