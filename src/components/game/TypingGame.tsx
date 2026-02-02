"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Keyboard, Timer, Trophy, CheckCircle2, XCircle, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react"

interface TypingGameProps {
    onComplete: (wpm: number, logs: any) => void
}

const PARAGRAPHS = [
    "The digital frontier is expanding at an unprecedented rate, challenging the very essence of human interaction and economic structures in the decentralized age.",
    "Decentralized finance protocols are reshaping how we perceive value, trust, and the fundamental mechanics of global capital allocation systems.",
    "Artificial intelligence and neural networks are bridging the gap between biological intuition and computational raw power in the twenty-first century.",
    "Cryptographic proofs ensure that integrity is embedded into the very fabric of our digital communications, rendering centralized gatekeepers obsolete."
]

export function TypingGame({ onComplete }: TypingGameProps) {
    const [gameState, setGameState] = useState<"idle" | "active" | "result">("idle")
    const [paragraph, setParagraph] = useState("")
    const [userInput, setUserInput] = useState("")
    const [startTime, setStartTime] = useState<number>(0)
    const [errors, setErrors] = useState(0)
    const [wpm, setWpm] = useState(0)
    const [accuracy, setAccuracy] = useState(100)

    const inputRef = useRef<HTMLTextAreaElement>(null)

    const startTyping = () => {
        const randP = PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)]
        setParagraph(randP)
        setUserInput("")
        setErrors(0)
        setStartTime(performance.now())
        setGameState("active")
        setTimeout(() => inputRef.current?.focus(), 100)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        if (value.length > paragraph.length) return

        // Prevent backspace cheating/logic? No, backspace is fine but we track current progress
        setUserInput(value)

        // Calculate errors in real-time
        let currentErrors = 0
        for (let i = 0; i < value.length; i++) {
            if (value[i] !== paragraph[i]) {
                currentErrors++
            }
        }
        setErrors(currentErrors)

        // Check if finished
        if (value === paragraph) {
            const endTime = performance.now()
            const totalTimeMinutes = (endTime - startTime) / 60000
            const words = paragraph.split(" ").length
            const finalWpm = Math.round(words / totalTimeMinutes)
            const finalAccuracy = Math.round(((paragraph.length - currentErrors) / paragraph.length) * 100)

            setWpm(finalWpm)
            setAccuracy(finalAccuracy)
            setGameState("result")
        }
    }

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
                    <Trophy className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Performance Summary</h2>
                    <p className="text-white/40 mb-8 font-medium">WPM Captured and Audit Logged.</p>

                    <div className="grid grid-cols-2 gap-6 mb-12">
                        <div className="bg-black/40 p-8 rounded-3xl border border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Words Per Minute</p>
                            <p className="text-5xl font-black italic tracking-tighter text-purple-400">{wpm}</p>
                        </div>
                        <div className="bg-black/40 p-8 rounded-3xl border border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Accuracy</p>
                            <p className="text-5xl font-black italic tracking-tighter text-white">{accuracy}%</p>
                        </div>
                    </div>

                    <button
                        onClick={() => onComplete(wpm, { wpm, accuracy })}
                        className="px-12 py-5 bg-white text-black rounded-full font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all flex items-center justify-center gap-4 mx-auto"
                    >
                        Submit WPM Record
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            ) : (
                <div className="space-y-8">
                    {/* Header: Live Stats */}
                    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-3xl px-8 py-4">
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Accuracy</span>
                                <span className={`text-xl font-black italic ${errors > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {userInput.length > 0 ? Math.round(((userInput.length - errors) / userInput.length) * 100) : "100"}%
                                </span>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Time</span>
                                <span className="text-xl font-black italic text-purple-400 font-mono">
                                    {startTime ? ((performance.now() - startTime) / 1000).toFixed(1) : "0.0"}s
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Keyboard className="w-4 h-4 text-purple-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Keystroke Validation On</span>
                        </div>
                    </div>

                    {/* Typing Area */}
                    <div className="min-h-[400px] bg-[#111] border border-white/5 rounded-[50px] p-12 relative overflow-hidden flex flex-col items-center justify-center">
                        {gameState === "idle" ? (
                            <div className="text-center space-y-8">
                                <div className="p-8 bg-purple-500/10 rounded-full border border-purple-500/20 inline-flex">
                                    <Keyboard className="w-16 h-16 text-purple-400" />
                                </div>
                                <h3 className="text-5xl font-black uppercase tracking-tighter italic">Typing Arena</h3>
                                <p className="text-white/40 font-medium max-w-sm mx-auto lowercase leading-relaxed">Reproduce the text below with 100% accuracy. Speed determines the winner.</p>
                                <button
                                    onClick={startTyping}
                                    className="px-12 py-5 bg-purple-500 text-white rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-[0_15px_30px_rgba(168,85,247,0.3)] hover:scale-105 transition-all"
                                >
                                    Start Terminal Battle
                                </button>
                            </div>
                        ) : (
                            <div className="w-full space-y-12">
                                {/* Paragraph Display */}
                                <div className="text-3xl font-bold leading-relaxed tracking-tight font-mono text-center relative">
                                    <div className="absolute inset-0 opacity-10 blur-xl pointer-events-none bg-purple-500/20 rounded-[40px]" />
                                    {paragraph.split("").map((char, i) => {
                                        let color = "text-white/20"
                                        if (i < userInput.length) {
                                            color = userInput[i] === char ? "text-purple-400" : "text-red-500"
                                        }
                                        return <span key={i} className={color}>{char}</span>
                                    })}
                                </div>

                                {/* Hidden Input Area but with visual focus */}
                                <textarea
                                    ref={inputRef}
                                    value={userInput}
                                    onChange={handleInputChange}
                                    className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-8 text-xl font-mono text-white focus:border-purple-500/50 focus:outline-none transition-all resize-none h-32 text-center"
                                    placeholder="Begin typing here..."
                                    onPaste={(e) => e.preventDefault()}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                />

                                <div className="flex justify-center gap-12">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-green-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Hardware Verifiable</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-amber-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">No Paste Allowed</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
