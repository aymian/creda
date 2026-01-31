"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
    ArrowRight,
    ChevronLeft,
    ShieldCheck,
    Cpu
} from "lucide-react"
import { CredaLogo } from "@/components/logo"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState<"login" | "join">("login")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        setError("")
        try {
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, provider)
            const user = result.user

            // Check if user document exists in Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid))

            if (!userDoc.exists()) {
                // User is not registered, sign them out and show error
                await signOut(auth)
                setError("Account not found. Please register first via the Join tab.")
            } else {
                // User exists, redirect to dashboard
                router.push("/")
            }
        } catch (err: any) {
            console.error("Google login error:", err)
            setError("Failed to authorize with Google.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen bg-[#0C0C0C] flex items-center justify-center p-6 overflow-hidden font-sans">
            {/* 🚀 SIGNATURE CYAN/PINK MESH BACKGROUND */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyber-pink/20 rounded-full blur-[160px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyber-pink/10 rounded-full blur-[160px] -z-10 animate-pulse delay-700" />

            {/* Back to Home Action */}
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/40 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all group z-20">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[1000px] grid lg:grid-cols-2 gap-0 bg-[#111111]/80 border border-white/5 backdrop-blur-3xl rounded-[48px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,1)]"
            >
                {/* Left Column: Immersion & Credibility */}
                <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-white/[0.02] to-transparent border-r border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,45,108,0.1),transparent)]" />

                    <div className="relative z-10 text-left">
                        <CredaLogo size={60} />
                        <h2 className="mt-8 text-6xl font-black text-white leading-[0.85] tracking-tighter">
                            THE ELITE<br />
                            <span className="text-cyber-pink italic">WORKSPACE.</span>
                        </h2>
                        <p className="mt-6 text-white/40 font-medium leading-relaxed max-w-xs text-base">
                            Join Creda to access a space where the top-tier visionaries share, collaborate, and build the future.
                        </p>
                    </div>

                    {/* Social Proof Stats */}
                    <div className="relative z-10 flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-0.5 w-12 bg-cyber-pink/30 rounded-full" />
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Proprietary Focus Tech</span>
                        </div>
                        <div className="flex items-center gap-10">
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white">120k</span>
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Creators In</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white">0.2ms</span>
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Global Latency</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Authentication Gateway */}
                <div className="p-8 md:p-10 flex flex-col justify-center items-center">
                    <div className="w-full max-w-xs space-y-6">
                        {/* Brand Header (Mobile Only) */}
                        <div className="lg:hidden text-center mb-6"><CredaLogo size={50} /></div>

                        {/* Typography Header */}
                        <div className="text-center space-y-2">
                            <h1 className="text-4xl font-black text-white tracking-tight">Welcome Back</h1>
                            <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.2em]">Enter the premium ecosystem</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-cyber-pink/10 border border-cyber-pink/20 rounded-2xl text-[11px] text-cyber-pink font-bold uppercase tracking-wider text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Login / Join Toggle - SYNCED ROUTES */}
                        <div className="p-1 bg-[#0C0C0C] border border-white/5 rounded-full flex relative">
                            <button
                                disabled={isLoading}
                                className={cn(
                                    "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-full transition-all relative z-10",
                                    activeTab === "login" ? "text-white" : "text-white/40 hover:text-white",
                                    isLoading && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                Login
                            </button>
                            <Link
                                href="/signup"
                                className={cn(
                                    "flex-1 py-3 text-xs text-center font-black uppercase tracking-widest rounded-full transition-all relative z-10",
                                    activeTab === "join" ? "text-white" : "text-white/40 hover:text-white",
                                    isLoading && "opacity-50 pointer-events-none"
                                )}
                            >
                                Join
                            </Link>
                            <motion.div
                                layout
                                animate={{ x: activeTab === "login" ? "0%" : "100%" }}
                                className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-cyber-pink rounded-full z-0 shadow-[0_0_20px_rgba(255,45,108,0.4)]"
                            />
                        </div>

                        {/* REAL-WORLD SOCIAL STACK */}
                        <div className="space-y-4">
                            {/* Google - Official Visual Style */}
                            <motion.button
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center justify-between px-7 py-4 bg-white rounded-3xl group transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-4">
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-black" />
                                    ) : (
                                        <svg viewBox="0 0 24 24" className="w-5 h-5">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    )}
                                    <span className="text-[13px] font-black text-black">
                                        {isLoading ? "Authorizing..." : "Login with Google"}
                                    </span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-black/10 group-hover:text-black transition-colors" />
                            </motion.button>

                            {/* X (formerly Twitter) - Real World Aesthetic */}
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2, backgroundColor: "rgba(255,255,255,0.06)" }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center justify-between px-7 py-4 bg-black border border-white/10 rounded-3xl group transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                    <span className="text-[13px] font-black text-white">Login with X</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-white transition-colors" />
                            </motion.button>

                            {/* Spotify - Official Brand Color */}
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center justify-between px-7 py-4 bg-[#1DB954] rounded-3xl group transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.508 17.302c-.217.357-.682.47-1.039.252-2.887-1.764-6.521-2.162-10.796-1.185-.408.093-.816-.164-.909-.572-.093-.408.164-.816.572-.909 4.676-1.07 8.618-.616 11.854 1.36.357.218.47.683.251 1.039-.001.001-.001.001-.067.115zm1.468-3.258c-.273.444-.852.585-1.296.312-3.304-2.03-8.342-2.617-12.251-1.431-.502.152-1.031-.131-1.183-.633-.152-.502.131-1.031.633-1.183 4.469-1.356 10.038-.707 13.834 1.624.444.273.585.852.312 1.296l.001-.001-.05.07zm.127-3.371C14.697 8.01 7.245 7.762 2.91 9.078c-.628.191-1.296-.164-1.487-.792-.191-.628.164-1.296.792-1.487 4.966-1.507 13.181-1.218 18.28 1.81.564.335.751 1.066.416 1.63-.335.564-1.066.751-1.63.416l-.18.118z" />
                                    </svg>
                                    <span className="text-[13px] font-black text-white font-sans">Login with Spotify</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                            </motion.button>

                            {/* Email/Phone - Standard Aesthetic */}
                            <Link href="/email-login" className="w-full">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2, backgroundColor: "rgba(255,255,255,0.06)" }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-between px-7 py-4 bg-transparent border border-white/10 rounded-3xl group transition-all"
                                >
                                    <div className="flex items-center gap-4 text-white">
                                        <span className="text-[13px] font-black tracking-tight">Login with Email or Phone</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-white transition-colors" />
                                </motion.button>
                            </Link>
                        </div>

                        {/* End-to-end indicator */}
                        <div className="pt-6 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2 text-[9px] font-black text-cyber-pink/60 uppercase tracking-[0.3em]">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                End-to-end secure gateway activated
                            </div>
                        </div>

                        <p className="mt-10 text-center text-[10px] font-bold text-white/20 uppercase tracking-widest">
                            New here? <Link href="/signup" className="text-white hover:text-cyber-pink transition-colors underline underline-offset-4 decoration-cyber-pink/30">Signup</Link>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Trust Signifiers Footer Layer */}
            <div className="absolute bottom-10 flex items-center gap-10 opacity-15 pointer-events-none">
                <div className="flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-[0.4em]">
                    <ShieldCheck className="w-4 h-4 text-cyber-pink" />
                    Quantum Secure
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-[0.4em]">
                    <Cpu className="w-4 h-4" />
                    Neural Link ID
                </div>
            </div>
        </div>
    )
}
