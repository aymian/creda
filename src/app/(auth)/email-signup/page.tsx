"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    Mail,
    Lock,
    ArrowRight,
    ChevronLeft,
    ShieldCheck,
    Cpu,
    User as UserIcon,
    Loader2
} from "lucide-react"
import { CredaLogo } from "@/components/logo"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"

export default function EmailSignupPage() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()

    useEffect(() => {
        if (!authLoading && user) {
            router.push("/")
        }
    }, [user, authLoading, router])

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyber-pink" />
            </div>
        )
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            // 1. Create User in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // 2. Update Auth Profile
            await updateProfile(user, {
                displayName: username
            })

            // 3. Create User Document in Firestore (The "users table")
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                username: username,
                email: email,
                createdAt: serverTimestamp(),
                focusScore: 100,
                tier: "pioneer",
                onboardingCompleted: false
            })

            router.push("/onboarding")
        } catch (err: any) {
            console.error("Signup error:", err)
            let message = "Failed to create account. Please try again."
            if (err.code === "auth/email-already-in-use") {
                message = "This email is already registered."
            } else if (err.code === "auth/weak-password") {
                message = "Password should be at least 6 characters."
            }
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen bg-[#0C0C0C] flex items-center justify-center p-6 overflow-hidden font-sans">
            {/* 🚀 SIGNATURE CYAN/PINK MESH BACKGROUND */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyber-pink/20 rounded-full blur-[160px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyber-pink/10 rounded-full blur-[160px] -z-10 animate-pulse delay-700" />

            {/* Back Action */}
            <Link href="/signup" className="absolute top-8 left-8 flex items-center gap-2 text-white/40 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all group z-20">
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
                            START YOUR<br />
                            <span className="text-cyber-pink italic">LEGACY.</span>
                        </h2>
                        <p className="mt-6 text-white/40 font-medium leading-relaxed max-w-xs text-base">
                            The future is build-focused. Join the elite network of visionaries scaling their digital presence.
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
                                <span className="text-2xl font-black text-white">400%</span>
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Growth rate</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white">2.4M</span>
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Total Streams</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Authentication Gateway */}
                <div className="p-8 md:p-10 flex flex-col justify-center items-center">
                    <div className="w-full max-w-xs space-y-6">
                        {/* Brand Header */}
                        <div className="flex flex-col items-center mb-6 text-center">
                            <div className="lg:hidden"><CredaLogo size={50} /></div>
                            <h1 className="mt-6 text-3xl font-black text-white tracking-tight">Signup</h1>
                            <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.2em] mt-2">Create your account</p>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-4">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-cyber-pink/10 border border-cyber-pink/20 rounded-2xl text-[11px] text-cyber-pink font-bold uppercase tracking-wider text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-4 group-focus-within:text-cyber-pink transition-colors">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <UserIcon className="h-5 w-5 text-white/20 group-focus-within:text-cyber-pink transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="How should we call you?"
                                        required
                                        className="block w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-3xl text-white placeholder:text-white/10 outline-none focus:ring-2 focus:ring-cyber-pink/20 focus:border-cyber-pink/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-4 group-focus-within:text-cyber-pink transition-colors">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-white/20 group-focus-within:text-cyber-pink transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@vision.com"
                                        required
                                        className="block w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-3xl text-white placeholder:text-white/10 outline-none focus:ring-2 focus:ring-cyber-pink/20 focus:border-cyber-pink/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-4 group-focus-within:text-cyber-pink transition-colors">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-white/20 group-focus-within:text-cyber-pink transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Create a strong key"
                                        required
                                        className="block w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/5 rounded-3xl text-white placeholder:text-white/10 outline-none focus:ring-2 focus:ring-cyber-pink/20 focus:border-cyber-pink/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(255,45,108,0.4)" }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-cyber-pink text-white py-4 rounded-3xl font-black text-xs tracking-[0.3em] uppercase flex items-center justify-center gap-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Signup"}
                                {!isLoading && <ArrowRight className="w-5 h-5" />}
                            </motion.button>
                        </form>

                        <div className="mt-6 flex flex-col items-center gap-4">
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest text-center">
                                Already have an account? <Link href="/email-login" className="text-white hover:text-cyber-pink transition-colors underline underline-offset-4 decoration-cyber-pink/30">Login</Link>
                            </p>

                            <div className="flex items-center gap-2 text-[9px] font-black text-cyber-pink/60 uppercase tracking-[0.3em]">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Quantum-safe encryption active
                            </div>
                        </div>
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
                    Decentralized ID
                </div>
            </div>
        </div>
    )
}
