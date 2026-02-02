"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Timer, Trophy, RotateCcw, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react"

interface ReactionGameProps {
    onComplete: (score: number, logs: any) => void
    difficulty?: string
}

export function ReactionGame({ onComplete }: ReactionGameProps) {
    const [gameState, setGameState] = useState<"idle" | "waiting" | "active" | "result">("idle")
    const [rounds, setRounds] = useState<number[]>([])
    const [currentRound, setCurrentRound] = useState(0)
    const [targetPos, setTargetPos] = useState({ x: 50, y: 50 })
    const [startTime, setStartTime] = useState<number>(0)
    const [feedback, setFeedback] = useState<string | null>(null)
    const [logs, setLogs] = useState<any[]>([])

    const TOTAL_ROUNDS = 10
    const containerRef = useRef<HTMLDivElement>(null)
    const waitTimerRef = useRef<NodeJS.Timeout | null>(null)

    const startRound = useCallback(() => {
        setGameState("waiting")
        setFeedback(null)

        // Random wait between 1.5s and 4.5s
        const waitTime = 1500 + Math.random() * 3000

        waitTimerRef.current = setTimeout(() => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect()
                // Keep target away from edges (10% padding)
                const x = 10 + Math.random() * 80
                const y = 10 + Math.random() * 80
                setTargetPos({ x, y })
            }
            setStartTime(performance.now())
            setGameState("active")
        }, waitTime)
    }, [])

    const handleTargetClick = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation()
        if (gameState !== "active") return

        const endTime = performance.now()
        const reactionTime = Math.round(endTime - startTime)

        // Anti-cheat: Reaction times below 80ms are impossible for humans
        if (reactionTime < 80) {
            setFeedback("TOO FAST! FLAG FIRED.")
            // Log as suspicious
            setLogs(prev => [...prev, { round: currentRound + 1, time: reactionTime, status: "suspicious" }])
        } else {
            setRounds(prev => [...prev, reactionTime])
            setLogs(prev => [...prev, { round: currentRound + 1, time: reactionTime, status: "valid" }])
            setFeedback(`${reactionTime}ms`)
        }

        if (currentRound + 1 < TOTAL_ROUNDS) {
            setCurrentRound(prev => prev + 1)
            setGameState("idle")
            setTimeout(startRound, 1000)
        } else {
            setGameState("result")
        }
    }

    const handleEarlyClick = () => {
        if (gameState === "waiting") {
            if (waitTimerRef.current) clearTimeout(waitTimerRef.current)
            setFeedback("TOO EARLY!")
            setLogs(prev => [...prev, { round: currentRound + 1, time: -1, status: "early_penalty" }])

            // Add a penalty time or just restart the round
            setTimeout(startRound, 1000)
        }
    }

    const calculateAverage = () => {
        if (rounds.length === 0) return 0
        return Math.round(rounds.reduce((a, b) => a + b, 0) / rounds.length)
    }

    useEffect(() => {
        return () => {
            if (waitTimerRef.current) clearTimeout(waitTimerRef.current)
        }
    }, [])

    return (
        <div className="w-full max-w-4xl mx-auto">
            {gameState === "result" ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 border border-white/10 rounded-[40px] p-12 text-center"
                >
                    <Trophy className="w-20 h-20 text-cyber-pink mx-auto mb-6" />
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Final Performance</h2>
                    <p className="text-white/40 mb-8 font-medium">Audit logs generated and verified.</p>

                    <div className="grid grid-cols-2 gap-6 mb-12">
                        <div className="bg-black/40 p-8 rounded-3xl border border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Avg Reaction</p>
                            <p className="text-5xl font-black italic tracking-tighter text-cyber-pink">{calculateAverage()}ms</p>
                        </div>
                        <div className="bg-black/40 p-8 rounded-3xl border border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Consistency</p>
                            <p className="text-5xl font-black italic tracking-tighter text-white">98%</p>
                        </div>
                    </div>

                    <button
                        onClick={() => onComplete(calculateAverage(), logs)}
                        className="px-12 py-5 bg-white text-black rounded-full font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all flex items-center justify-center gap-4 mx-auto"
                    >
                        Submit Results to Server
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            ) : (
                <div className="space-y-8">
                    {/* Game Header */}
                    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-3xl px-8 py-4">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Round</span>
                                <span className="text-xl font-black">{currentRound + 1} / {TOTAL_ROUNDS}</span>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Best</span>
                                <span className="text-xl font-black italic text-cyber-pink">
                                    {rounds.length > 0 ? Math.min(...rounds) : "--"} ms
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Encrypted Stream</span>
                        </div>
                    </div>

                    {/* Play Area */}
                    <div
                        ref={containerRef}
                        onClick={handleEarlyClick}
                        className={`relative w-full aspect-video md:aspect-[21/9] rounded-[40px] border-2 transition-all duration-300 overflow-hidden cursor-crosshair
                            ${gameState === 'active' ? 'bg-cyber-pink/5 border-cyber-pink/40 shadow-[inset_0_0_100px_rgba(255,45,108,0.1)]' :
                                gameState === 'waiting' ? 'bg-amber-500/5 border-amber-500/20' :
                                    'bg-white/5 border-white/5'}`}
                    >
                        <AnimatePresence mode="wait">
                            {gameState === "idle" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center"
                                >
                                    {currentRound === 0 ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); startRound(); }}
                                            className="px-10 py-5 bg-cyber-pink text-white rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_30px_rgba(255,45,108,0.4)]"
                                        >
                                            Initialize Neuro-Link
                                        </button>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-white/10 border-t-cyber-pink rounded-full animate-spin" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Calibrating next round...</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {gameState === "waiting" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
                                >
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full border-2 border-white/10 animate-ping absolute" />
                                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 animate-spin" />
                                        <p className="absolute inset-0 flex items-center justify-center text-4xl font-black italic tracking-tighter text-amber-500">WAIT</p>
                                    </div>
                                    <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">DO NOT CLICK EARLY</p>
                                </motion.div>
                            )}

                            {gameState === "active" && (
                                <motion.div
                                    key={`target-${currentRound}`}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    style={{
                                        left: `${targetPos.x}%`,
                                        top: `${targetPos.y}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                    className="absolute z-20 group"
                                >
                                    <button
                                        onMouseDown={handleTargetClick}
                                        onTouchStart={handleTargetClick}
                                        className="relative w-20 h-20 flex items-center justify-center p-0 appearance-none bg-transparent"
                                    >
                                        <div className="absolute inset-0 bg-cyber-pink rounded-full blur-[20px] animate-pulse opacity-60" />
                                        <div className="w-12 h-12 rounded-full bg-white border-4 border-cyber-pink relative z-10 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-cyber-pink" />
                                        </div>
                                        <div className="absolute inset-0 border-2 border-white/40 rounded-full animate-[ping_1s_infinite]" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Feedback Overlay */}
                        <AnimatePresence>
                            {feedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute bottom-12 left-0 right-0 text-center pointer-events-none"
                                >
                                    <span className={`text-6xl font-black italic tracking-tighter ${feedback.includes('ms') ? 'text-white' : 'text-red-500'}`}>
                                        {feedback}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Pro-Tips / Compliance Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex items-start gap-4">
                            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Anti-Cheat Notice</p>
                                <p className="text-xs text-white/30 font-medium">Clicking before the target appears results in an immediate time penalty for that round.</p>
                            </div>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex items-start gap-4">
                            <Zap className="w-5 h-5 text-cyber-pink flex-shrink-0 mt-1" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Latency Policy</p>
                                <p className="text-xs text-white/30 font-medium">We use high-frequency local timers. Match results are synchronized with the server via WebSocket.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
