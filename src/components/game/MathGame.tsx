"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Timer, Trophy, CheckCircle2, XCircle, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react"

interface MathGameProps {
    onComplete: (time: number, logs: any) => void
    difficulty?: string
}

export function MathGame({ onComplete }: MathGameProps) {
    const [gameState, setGameState] = useState<"idle" | "active" | "result">("idle")
    const [questions, setQuestions] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [userInput, setUserInput] = useState("")
    const [startTime, setStartTime] = useState<number>(0)
    const [penaltyCount, setPenaltyCount] = useState(0)
    const [logs, setLogs] = useState<any[]>([])

    const TOTAL_QUESTIONS = 20
    const PENALTY_SECONDS = 2
    const inputRef = useRef<HTMLInputElement>(null)

    const generateQuestions = useCallback(() => {
        const q: any[] = []
        for (let i = 0; i < TOTAL_QUESTIONS; i++) {
            const level = Math.floor(i / 5) // 0-3
            let a, b, op, ans

            if (level === 0) { // Addition 1-20
                a = Math.floor(Math.random() * 20) + 1
                b = Math.floor(Math.random() * 20) + 1
                op = "+"
                ans = a + b
            } else if (level === 1) { // Subtraction 20-100
                a = Math.floor(Math.random() * 50) + 20
                b = Math.floor(Math.random() * 20) + 1
                op = "-"
                ans = a - b
            } else if (level === 2) { // Multiplication 2-12
                a = Math.floor(Math.random() * 11) + 2
                b = Math.floor(Math.random() * 11) + 2
                op = "×"
                ans = a * b
            } else { // Division (clean result)
                b = Math.floor(Math.random() * 9) + 2
                ans = Math.floor(Math.random() * 10) + 2
                a = b * ans
                op = "÷"
            }
            q.push({ a, b, op, ans })
        }
        setQuestions(q)
    }, [])

    const startBattle = () => {
        generateQuestions()
        setStartTime(performance.now())
        setGameState("active")
        setTimeout(() => inputRef.current?.focus(), 100)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (gameState !== "active") return

        const currentQ = questions[currentIndex]
        const val = parseInt(userInput)
        const timeAtInput = performance.now()

        if (val === currentQ.ans) {
            setLogs(prev => [...prev, { index: currentIndex, result: "correct", time: timeAtInput - startTime }])
            if (currentIndex + 1 < TOTAL_QUESTIONS) {
                setCurrentIndex(prev => prev + 1)
                setUserInput("")
            } else {
                const totalTime = (performance.now() - startTime) / 1000 + (penaltyCount * PENALTY_SECONDS)
                setGameState("result")
                onComplete(totalTime, logs)
            }
        } else {
            setPenaltyCount(prev => prev + 1)
            setLogs(prev => [...prev, { index: currentIndex, result: "incorrect", time: timeAtInput - startTime }])
            setUserInput("")
            // Shake effect or feedback can be added
        }
    }

    const timeElapsed = () => {
        if (startTime === 0) return 0
        return ((performance.now() - startTime) / 1000).toFixed(1)
    }

    // Force focus
    useEffect(() => {
        if (gameState === "active") {
            const interval = setInterval(() => {
                if (document.activeElement !== inputRef.current) {
                    inputRef.current?.focus()
                }
            }, 500)
            return () => clearInterval(interval)
        }
    }, [gameState])

    return (
        <div className="w-full max-w-4xl mx-auto">
            {gameState === "result" ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 border border-white/10 rounded-[40px] p-12 text-center"
                >
                    <Trophy className="w-20 h-20 text-amber-400 mx-auto mb-6" />
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Battle Complete</h2>
                    <p className="text-white/40 mb-8 font-medium">Submission ready for server validation.</p>

                    <div className="grid grid-cols-2 gap-6 mb-12">
                        <div className="bg-black/40 p-8 rounded-3xl border border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Total Time</p>
                            <p className="text-5xl font-black italic tracking-tighter text-amber-400">
                                {((performance.now() - startTime) / 1000 + (penaltyCount * PENALTY_SECONDS)).toFixed(2)}s
                            </p>
                            <p className="text-[9px] font-bold text-red-500 mt-2">Incl. {penaltyCount * PENALTY_SECONDS}s Penalties</p>
                        </div>
                        <div className="bg-black/40 p-8 rounded-3xl border border-white/5 flex flex-col justify-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Accuracy</p>
                            <p className="text-5xl font-black italic tracking-tighter text-white">
                                {Math.round((TOTAL_QUESTIONS / (TOTAL_QUESTIONS + penaltyCount)) * 100)}%
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => onComplete(0, logs)} // Parent handles navigation
                        className="px-12 py-5 bg-white text-black rounded-full font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all flex items-center justify-center gap-4 mx-auto"
                    >
                        Sync Match Data
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            ) : (
                <div className="space-y-8">
                    {/* Header: Stats */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Progress</p>
                            <p className="text-2xl font-black italic">{currentIndex + 1} / {TOTAL_QUESTIONS}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center relative overflow-hidden">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Timer</p>
                            <p className="text-2xl font-black italic text-cyber-cyan font-mono tracking-wider">{startTime ? ((performance.now() - startTime) / 1000).toFixed(1) : "00.0"}s</p>
                        </div>
                        <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 text-center transition-colors ${penaltyCount > 0 ? 'border-red-500/30' : ''}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Penalties</p>
                            <p className={`text-2xl font-black italic ${penaltyCount > 0 ? 'text-red-500' : 'text-white/40'}`}>+{penaltyCount * PENALTY_SECONDS}s</p>
                        </div>
                    </div>

                    {/* Battle Area */}
                    <div className="relative min-h-[400px] bg-[#111] border border-white/5 rounded-[40px] flex items-center justify-center p-12 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                            <motion.div
                                className="h-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                                initial={{ width: "0%" }}
                                animate={{ width: `${(currentIndex / TOTAL_QUESTIONS) * 100}%` }}
                            />
                        </div>

                        {gameState === "idle" ? (
                            <div className="text-center space-y-8">
                                <div className="p-8 bg-amber-400/10 rounded-full border border-amber-400/20 inline-flex">
                                    <Brain className="w-16 h-16 text-amber-400" />
                                </div>
                                <h3 className="text-5xl font-black uppercase tracking-tighter italic">Math Battle</h3>
                                <p className="text-white/40 font-medium max-w-sm mx-auto lowercase leading-relaxed">Solve 20 problems as fast as possible. Any mistake adds <span className="text-red-500 font-bold">2 SECONDS</span> to your total time.</p>
                                <button
                                    onClick={startBattle}
                                    className="px-12 py-5 bg-amber-400 text-black rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-[0_15px_30px_rgba(251,191,36,0.3)] hover:scale-105 transition-all"
                                >
                                    Start Mental Race
                                </button>
                            </div>
                        ) : (
                            <div className="w-full max-w-lg">
                                <form onSubmit={handleSubmit} className="text-center">
                                    <div className="mb-12">
                                        <div className="flex items-center justify-center gap-8 text-7xl md:text-8xl font-black italic tracking-tighter mb-4">
                                            <span>{questions[currentIndex]?.a}</span>
                                            <span className="text-amber-400">{questions[currentIndex]?.op}</span>
                                            <span>{questions[currentIndex]?.b}</span>
                                            <span className="text-white/20">=</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-green-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Verified Equations</span>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <input
                                            ref={inputRef}
                                            type="number"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            autoFocus
                                            autoComplete="off"
                                            className="w-full bg-black/40 border-2 border-white/10 rounded-3xl px-8 py-6 text-5xl font-black text-center text-white focus:border-amber-400 focus:outline-none transition-all placeholder:text-white/5"
                                            placeholder="?"
                                        />
                                        <div className="mt-4 flex justify-between px-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">System ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Press ENTER to commit</span>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Bottom Info */}
                    <div className="flex justify-center gap-12 text-white/40">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Skill-ONLY</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Penalties Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Audit Tracking</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
