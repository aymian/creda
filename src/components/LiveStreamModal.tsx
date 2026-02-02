"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Video, Radio, Copy, Check } from "lucide-react"
import dynamic from "next/dynamic"
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"

interface LiveStreamModalProps {
    isOpen: boolean
    onClose: () => void
    mode: 'broadcast' | 'watch'
    watchUrl?: string
    broadcasterName?: string
}

export default function LiveStreamModal({ isOpen, onClose, mode, watchUrl, broadcasterName }: LiveStreamModalProps) {
    const { user } = useAuth()
    const [isLive, setIsLive] = useState(false)
    const [copied, setCopied] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const [streamKeys] = useState({
        rtmp: "rtmp://live.cloudinary.com/streams",
        key: "n16Jp6s1N8swEL0R3LLJ0IK1FpQ0YV",
        hls: "https://res.cloudinary.com/dzvwfdpxw/video/live/live_stream_2605152ed997494f9a89330a3ebdc2c6_hls.m3u8"
    })

    // Local Camera Preview for Broadcaster
    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            if (isOpen && mode === 'broadcast' && !isLive) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream
                    }
                } catch (e) {
                    console.error("Camera error:", e)
                }
            }
        }

        startCamera()

        return () => {
            if (stream) {
                stream.getTracks().forEach(t => t.stop())
            }
        }
    }, [isOpen, mode, isLive])

    const handleGoLive = async () => {
        if (!user) return

        try {
            setIsLive(true)
            await updateDoc(doc(db, "users", user.uid), {
                isLive: true,
                liveStreamUrl: streamKeys.hls,
                lastLiveAt: new Date()
            })
        } catch (e) {
            console.error("Error going live:", e)
        }
    }

    const handleEndStream = async () => {
        if (!user) return

        try {
            setIsLive(false)
            await updateDoc(doc(db, "users", user.uid), {
                isLive: false,
                liveStreamUrl: null
            })
            onClose()
        } catch (e) {
            console.error("Error ending stream:", e)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="relative w-full max-w-4xl bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/10 rounded-full transition-all"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>

                    {/* Main Content Area */}
                    <div className="flex-1 relative bg-black aspect-video md:aspect-auto min-h-[300px] flex items-center justify-center">
                        {mode === 'broadcast' ? (
                            isLive ? (
                                <div className="text-center p-8">
                                    <div className="w-20 h-20 bg-cyber-pink/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                        <Radio className="w-10 h-10 text-cyber-pink" />
                                    </div>
                                    <h2 className="text-3xl font-black text-white mb-2">You remain Live!</h2>
                                    <p className="text-white/40 mb-8 max-w-md mx-auto">
                                        Your stream is active manually. Use your streaming software (OBS) to push content using the keys on the right.
                                    </p>
                                    <button
                                        onClick={handleEndStream}
                                        className="px-8 py-3 bg-red-500 hover:bg-red-600 rounded-full font-bold text-white transition-all"
                                    >
                                        End Stream
                                    </button>
                                </div>
                            ) : (
                                <div className="relative w-full h-full">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover opacity-50"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <button
                                            onClick={handleGoLive}
                                            className="px-8 py-4 bg-cyber-pink hover:scale-105 active:scale-95 rounded-full font-black text-lg text-white shadow-[0_0_30px_rgba(255,45,108,0.4)] transition-all flex items-center gap-3"
                                        >
                                            <Radio className="w-6 h-6" /> GO LIVE
                                        </button>
                                    </div>
                                </div>
                            )
                        ) : (
                            // Watch Mode
                            <div className="w-full h-full bg-black">
                                <ReactPlayer
                                    url={watchUrl ?? ""}
                                    playing={true}
                                    controls={true}
                                    width="100%"
                                    height="100%"
                                    config={{
                                        file: {
                                            forceHLS: true
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Sidebar Info (Only for Broadcaster) */}
                    {mode === 'broadcast' && (
                        <div className="w-full md:w-80 border-l border-white/5 bg-[#161616] p-6 flex flex-col gap-6 overflow-y-auto">
                            <div>
                                <h3 className="text-xl font-black mb-1">Stream Settings</h3>
                                <p className="text-xs text-white/40">Configure your encoder (OBS, etc)</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">RTMP URL</label>
                                    <div className="relative group">
                                        <input
                                            readOnly
                                            value={streamKeys.rtmp}
                                            className="w-full bg-[#0C0C0C] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white/60 focus:outline-none focus:border-cyber-pink/50 transition-all"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(streamKeys.rtmp)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg transition-all"
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-white/40" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Stream Key</label>
                                    <div className="relative group">
                                        <input
                                            readOnly
                                            type="password"
                                            value={streamKeys.key}
                                            className="w-full bg-[#0C0C0C] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white/60 focus:outline-none focus:border-cyber-pink/50 transition-all"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(streamKeys.key)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg transition-all"
                                        >
                                            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-white/40" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1" />

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-cyber-pink animate-pulse" />
                                    Live Status
                                </h4>
                                <p className="text-xs text-white/40">
                                    {isLive ? "You are currently live. Friends can watch your stream." : "Offline. Click Go Live to start."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Watch Mode Info */}
                    {mode === 'watch' && broadcasterName && (
                        <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
                            <div className="px-3 py-1 bg-red-600 rounded-md font-black text-[10px] uppercase tracking-widest text-white shadow-lg animate-pulse">
                                END DIRECT
                            </div>
                            <span className="font-bold text-white shadow-black drop-shadow-md">{broadcasterName}</span>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
