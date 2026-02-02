"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, PhoneOff, Video, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface IncomingCallModalProps {
    isOpen: boolean
    callerName: string
    callerAvatar?: string
    callType: 'video' | 'audio'
    channelName: string
    onAccept: () => void
    onDecline: () => void
}

export default function IncomingCallModal({
    isOpen,
    callerName,
    callerAvatar,
    callType,
    channelName,
    onAccept,
    onDecline
}: IncomingCallModalProps) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [timeLeft, setTimeLeft] = useState(30)

    useEffect(() => {
        if (isOpen) {
            // Play ringing sound
            if (audioRef.current) {
                audioRef.current.loop = true
                audioRef.current.play().catch(err => console.log("Audio play failed:", err))
            }

            // Start countdown
            const interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        onDecline() // Auto decline after 30 seconds
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            return () => {
                clearInterval(interval)
                if (audioRef.current) {
                    audioRef.current.pause()
                    audioRef.current.currentTime = 0
                }
                setTimeLeft(30)
            }
        }
    }, [isOpen, onDecline])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl"
                >
                    {/* Ringing Audio */}
                    <audio ref={audioRef} src="/sounds/ringtone.mp3" />

                    <motion.div
                        initial={{ scale: 0.8, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, y: 50 }}
                        className="w-full max-w-md mx-6"
                    >
                        {/* Pulsing Background */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.1, 0.3]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="w-96 h-96 rounded-full bg-cyber-pink blur-3xl"
                            />
                        </div>

                        {/* Call Card */}
                        <div className="relative bg-[#1A1A1A] border border-white/10 rounded-[3rem] p-12 text-center shadow-2xl">
                            {/* Top Gradient Line */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyber-pink to-transparent" />

                            {/* Call Type Badge */}
                            <div className="absolute top-6 right-6 px-4 py-2 bg-cyber-pink/20 border border-cyber-pink/30 rounded-full">
                                <p className="text-xs font-black uppercase tracking-widest text-cyber-pink">
                                    {callType === 'video' ? '📹 Video' : '📞 Audio'} Call
                                </p>
                            </div>

                            {/* Caller Avatar */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative mx-auto mb-8"
                            >
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyber-pink to-cyber-cyan p-1">
                                    <div className="w-full h-full rounded-full bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
                                        {callerAvatar ? (
                                            <img src={callerAvatar} alt={callerName} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-16 h-16 text-white/40" />
                                        )}
                                    </div>
                                </div>
                                {/* Pulsing Ring */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        opacity: [0.5, 0, 0.5]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeOut"
                                    }}
                                    className="absolute inset-0 rounded-full border-4 border-cyber-pink"
                                />
                            </motion.div>

                            {/* Caller Name */}
                            <h2 className="text-3xl font-black mb-2 tracking-tight">{callerName}</h2>
                            <p className="text-white/40 font-bold uppercase tracking-widest text-sm mb-8">
                                Incoming Call...
                            </p>

                            {/* Timer */}
                            <div className="mb-10">
                                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 rounded-full border border-white/10">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-sm font-black text-white/60">
                                        Auto decline in {timeLeft}s
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-center gap-8">
                                {/* Decline */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onDecline}
                                    className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all"
                                >
                                    <PhoneOff className="w-8 h-8 text-white" />
                                </motion.button>

                                {/* Accept */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onAccept}
                                    className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all"
                                >
                                    {callType === 'video' ? (
                                        <Video className="w-8 h-8 text-white" />
                                    ) : (
                                        <Phone className="w-8 h-8 text-white" />
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
