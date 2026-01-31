"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Zap,
    ShieldCheck,
    Target,
    Gem,
    ChevronRight,
    ArrowRight,
    Smartphone,
    Calendar,
    User,
    Plus,
    Users,
    Bell,
    Copy,
    Share2,
    Check,
    Upload,
    Camera,
    Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { updateProfile } from "firebase/auth"
import { doc, updateDoc, collection, query, where, getDocs, limit } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { ImageKitProvider, IKUpload } from "imagekitio-next"
import { authenticator } from "@/lib/imagekit"

export default function OnboardingPage() {
    const { user, loading } = useAuth()
    const [step, setStep] = useState(1)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const router = useRouter()

    // Form Stats
    const [formData, setFormData] = useState({
        birthday: "",
        phone: "",
        otp: "",
        username: "",
        gender: "",
        bio: "",
        photoURL: "",
        followed: [] as string[]
    })

    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [suggestedUsers, setSuggestedUsers] = useState<any[]>([])

    // Fetch Suggested Users
    useEffect(() => {
        if (step === 10) {
            const fetchUsers = async () => {
                try {
                    const q = query(collection(db, "users"), limit(20))
                    const snapshot = await getDocs(q)
                    const users = snapshot.docs
                        .map(d => ({ id: d.id, ...d.data() }))
                        .filter((u: any) => u.id !== user?.uid && u.username)

                    const formattedUsers = users.map((u: any) => {
                        let followerCount = 0
                        if (Array.isArray(u.followers)) {
                            followerCount = u.followers.length
                        } else if (typeof u.followers === 'number') {
                            followerCount = u.followers
                        }

                        return {
                            id: u.id,
                            name: u.username || "User",
                            count: `${followerCount} followers`,
                            img: u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                        }
                    })
                    setSuggestedUsers(formattedUsers)
                } catch (error) {
                    console.error("Error fetching users:", error)
                }
            }
            fetchUsers()
        }
    }, [step, user])

    // Debounced Username Check
    useEffect(() => {
        if (!formData.username || formData.username.length < 3) {
            setIsUsernameAvailable(null)
            if (user?.displayName || user?.email) {
                const base = user.displayName?.toLowerCase().replace(/\s+/g, '') || user.email?.split('@')[0]
                setSuggestions([`${base} _official`, `${base}.eth`, `${base} _creator`, `${base}.creda`].slice(0, 4))
            }
            return
        }

        const checkUsername = async () => {
            setIsCheckingUsername(true)
            try {
                const q = query(collection(db, "users"), where("username", "==", formData.username))
                const querySnapshot = await getDocs(q)

                // If the snapshot has docs, and it's not the current user (if they already have the username - unlikely in onboarding but safe)
                const exists = querySnapshot.docs.some(d => d.id !== user?.uid)
                setIsUsernameAvailable(!exists)

                if (exists) {
                    // Generate suggestions if taken
                    const base = formData.username.toLowerCase()
                    setSuggestions([
                        `${base}${Math.floor(Math.random() * 99)} `,
                        `${base}.official`,
                        `${base} _nexus`,
                        `the_${base} `
                    ])
                } else {
                    setSuggestions([])
                }
            } catch (err) {
                console.error("Error checking username:", err)
            } finally {
                setIsCheckingUsername(false)
            }
        }

        const timeoutId = setTimeout(checkUsername, 500)
        return () => clearTimeout(timeoutId)
    }, [formData.username, user])

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login")
        }
    }, [user, loading, router])

    const saveProgress = async () => {
        if (!user) return
        try {
            await updateDoc(doc(db, "users", user.uid), {
                ...formData,
                lastOnboardingStep: step,
                updatedAt: new Date()
            })
        } catch (error) {
            console.error("Error saving progress:", error)
        }
    }

    const nextStep = () => {
        // Validation Logic
        if (step === 3 && !formData.birthday) return
        if (step === 4 && formData.phone.length < 5) return
        if (step === 6 && !isUsernameAvailable) return // Username check
        if (step === 7 && !formData.gender) return
        if (step === 8 && !formData.bio) return
        if (step === 9 && !formData.photoURL) return

        saveProgress()
        setStep(prev => prev + 1)
    }

    const prevStep = () => setStep(prev => prev - 1)

    const handleFinish = async () => {
        if (!user) return
        setIsSaving(true)
        try {
            await updateDoc(doc(db, "users", user.uid), {
                ...formData,
                onboardingCompleted: true,
                updatedAt: new Date()
            })
            router.push("/")
        } catch (error) {
            console.error("Error saving onboarding:", error)
        } finally {
            setIsSaving(false)
        }
    }

    if (loading) return null

    const containerVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    }

    return (
        <div className="min-h-screen bg-[#0C0C0C] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyber-pink/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyber-cyan/5 rounded-full blur-[120px] -z-10" />

            {/* Stepper Content */}
            <div className="w-full max-w-2xl relative z-10">
                <ImageKitProvider
                    publicKey="public_/8WGY0IR1jwvVV052it5ZuPBDV0="
                    urlEndpoint="https://ik.imagekit.io/em8clldrz"
                    authenticator={authenticator}
                >
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="text-center space-y-8">
                                <div className="w-20 h-20 bg-cyber-pink shadow-[0_0_40px_rgba(255,45,108,0.3)] rounded-[32px] flex items-center justify-center mx-auto mb-10">
                                    <Zap className="w-10 h-10 text-white fill-white" />
                                </div>
                                <h1 className="text-6xl font-black tracking-tighter leading-[0.9]">
                                    CREATE.<br />
                                    CONNECT.<br />
                                    <span className="text-cyber-pink">EARN.</span>
                                </h1>
                                <p className="text-white/40 text-lg font-medium max-w-md mx-auto">
                                    The first social ecosystem built for visionaries, professional creators, and the leaders of tomorrow.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mt-12">
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-cyber-pink">Pure Quality</h3>
                                        <p className="text-[10px] text-white/40">No noise, just high-value connection.</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-cyber-cyan">Total Safety</h3>
                                        <p className="text-[10px] text-white/40">AI-powered spam protection.</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-amber-400">Monetization</h3>
                                        <p className="text-[10px] text-white/40">Earn from as few as 350 followers.</p>
                                    </div>
                                </div>
                                <button onClick={nextStep} className="w-full bg-white text-black py-6 rounded-full font-black text-xl flex items-center justify-center gap-3 mt-12 hover:scale-[1.02] transition-transform">
                                    Initialize Flow <ArrowRight className="w-6 h-6" />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="space-y-10">
                                <div className="space-y-4">
                                    <span className="text-cyber-pink text-xs font-black tracking-[0.4em] uppercase">Step 02/12</span>
                                    <h2 className="text-5xl font-black tracking-tight leading-[0.9]">LET'S SET UP YOUR <br /><span className="text-cyber-pink italic">CREDA IDENTITY.</span></h2>
                                    <p className="text-white/40 font-medium">We need a few details to build your world.</p>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { icon: User, title: "Your profile", desc: "Helps people trust and follow you" },
                                        { icon: Smartphone, title: "Your phone", desc: "Keeps your account ultra-secure" },
                                        { icon: Calendar, title: "Your birthday", desc: "Ensures a fair experience for all" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-6 p-6 rounded-[32px] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-cyber-pink transition-colors">
                                                <item.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white uppercase tracking-wider text-sm">{item.title}</h4>
                                                <p className="text-xs text-white/30">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={nextStep} className="w-full bg-cyber-pink text-white py-6 rounded-full font-black text-xl uppercase tracking-widest shadow-[0_20px_40px_rgba(255,45,108,0.2)]">
                                    Continue
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="text-center space-y-10">
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-cyber-pink">
                                        <Calendar className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-4xl font-black uppercase tracking-tight">When is your birthday?</h2>
                                    <p className="text-white/40 text-sm max-w-sm mx-auto font-medium leading-relaxed">We use this to keep Creda safe and age-appropriate.</p>
                                </div>
                                <div className="max-w-xs mx-auto">
                                    <input
                                        type="date"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-center text-2xl font-black text-white outline-none focus:ring-2 focus:ring-cyber-pink/50 transition-all"
                                        onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                                    />
                                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                        <ShieldCheck className="w-4 h-4" /> 🔒 Private. Never shown publicly.
                                    </div>
                                </div>
                                <button
                                    onClick={nextStep}
                                    disabled={!formData.birthday}
                                    className="w-full bg-white text-black py-6 rounded-full font-black text-xl uppercase tracking-widest shadow-[0_20px_40px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Proceed
                                </button>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="space-y-10">
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black uppercase tracking-tight">Trust starts here</h2>
                                    <p className="text-white/40 font-medium">Enter your phone to protect Creda from spam & bots.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-24 bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex items-center justify-center text-white/40 font-black">+</div>
                                        <input
                                            type="tel"
                                            placeholder="Mobile Number"
                                            className="flex-1 bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-xl font-black text-white outline-none focus:ring-2 focus:ring-cyber-pink/50 transition-all placeholder:text-white/10"
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-[10px] text-white/20 font-medium leading-relaxed italic">Note: Your number is used for verification and protection. We never share or sell your personal data.</p>
                                </div>
                                <button
                                    onClick={nextStep}
                                    disabled={!formData.phone}
                                    className="w-full bg-cyber-pink text-white py-6 rounded-full font-black text-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Verify Phone
                                </button>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div key="step5" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="text-center space-y-10">
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black uppercase tracking-tight">Check your messages</h2>
                                    <p className="text-white/40 font-medium">We sent a verification code to {formData.phone || "+2..."}</p>
                                </div>
                                <div className="flex justify-center gap-4">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <input
                                            key={i}
                                            type="text"
                                            maxLength={1}
                                            className="w-12 h-16 bg-white/[0.03] border border-white/10 rounded-2xl text-center text-2xl font-black focus:border-cyber-pink outline-none transition-all"
                                        />
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <button onClick={nextStep} className="w-full bg-white text-black py-6 rounded-full font-black text-xl uppercase tracking-widest shadow-xl">
                                        Verify
                                    </button>
                                    <button onClick={nextStep} className="text-white/20 font-black text-xs uppercase tracking-[0.2em] hover:text-white transition-colors">
                                        Skip verification
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 6 && (
                            <motion.div key="step6" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="space-y-10">
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black uppercase tracking-tight">Claim your identity</h2>
                                    <p className="text-white/40 font-medium">This is how the Creda community finds you.</p>
                                </div>
                                <div className="space-y-8">
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-cyber-pink font-black text-2xl">@</span>
                                        <input
                                            type="text"
                                            placeholder="username"
                                            value={formData.username}
                                            className={cn(
                                                "w-full bg-white/[0.03] border rounded-3xl p-6 pl-14 text-2xl font-black text-white outline-none transition-all placeholder:text-white/5",
                                                isUsernameAvailable === true ? "border-green-500/50 focus:ring-green-500/20" :
                                                    isUsernameAvailable === false ? "border-cyber-pink focus:ring-cyber-pink/20" :
                                                        "border-white/10 focus:ring-cyber-pink/50"
                                            )}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                            {isCheckingUsername ? (
                                                <Loader2 className="w-6 h-6 animate-spin text-white/20" />
                                            ) : isUsernameAvailable === true ? (
                                                <Check className="w-6 h-6 text-green-500" />
                                            ) : isUsernameAvailable === false ? (
                                                <div className="text-cyber-pink font-black text-[10px] uppercase tracking-widest">Taken</div>
                                            ) : null}
                                        </div>
                                    </div>

                                    {suggestions.length > 0 && (
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">Suggestions</p>
                                            <div className="flex flex-wrap gap-2">
                                                {suggestions.map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setFormData({ ...formData, username: s })}
                                                        className="px-4 py-2 bg-white/5 border border-white/5 rounded-full text-xs font-bold text-white/40 hover:text-white hover:bg-cyber-pink hover:border-cyber-pink transition-all"
                                                    >
                                                        @{s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3 p-6 bg-white/[0.02] border border-white/5 rounded-[32px]">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Identity Rules:</p>
                                        <p className="text-xs text-white/40 flex items-center gap-2"><div className="w-1 h-1 bg-cyber-pink rounded-full" /> Only letters, numbers, and underscores</p>
                                        <p className="text-xs text-white/40 flex items-center gap-2"><div className="w-1 h-1 bg-cyber-pink rounded-full" /> Unique across the ecosystem</p>
                                        <p className="text-xs text-white/40 flex items-center gap-2"><div className="w-1 h-1 bg-cyber-pink rounded-full" /> Represent your personal or brand vision</p>
                                    </div>
                                </div>
                                <button
                                    onClick={nextStep}
                                    disabled={!isUsernameAvailable}
                                    className="w-full bg-cyber-pink text-white py-6 rounded-full font-black text-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isUsernameAvailable === false ? "Username Taken" : "Continue"}
                                </button>
                            </motion.div>
                        )}

                        {step === 7 && (
                            <motion.div key="step7" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="space-y-10 text-center">
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black uppercase tracking-tight">Personalize your feed</h2>
                                    <p className="text-white/40 font-medium">This helps us tailor your experience.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {['Male', 'Female', 'Prefer not to say'].map(option => (
                                        <button
                                            key={option}
                                            onClick={() => setFormData({ ...formData, gender: option })}
                                            className={cn(
                                                "w-full py-6 rounded-3xl font-black uppercase tracking-widest transition-all border",
                                                formData.gender === option
                                                    ? "bg-cyber-pink border-cyber-pink text-white shadow-[0_10px_30px_rgba(255,45,108,0.3)]"
                                                    : "bg-white/[0.03] border-white/5 text-white/40 hover:border-white/20 hover:text-white"
                                            )}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={nextStep}
                                    disabled={!formData.gender}
                                    className="w-full bg-white text-black py-6 rounded-full font-black text-xl uppercase tracking-widest mt-12 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue
                                </button>
                            </motion.div>
                        )}

                        {step === 8 && (
                            <motion.div key="step8" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="space-y-10">
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black uppercase tracking-tight">Express yourself</h2>
                                    <p className="text-white/40 font-medium italic">A good bio increases follows by up to 40%.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[40px] relative">
                                        <textarea
                                            className="w-full bg-transparent text-xl font-medium outline-none resize-none h-40 placeholder:text-white/10"
                                            placeholder="Who are you? (e.g., Visionary | Creator | Hustling daily)"
                                            maxLength={150}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        />
                                        <div className="absolute bottom-6 right-8 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                                            {formData.bio.length}/150
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 px-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-cyber-pink underline underline-offset-4">Identity Moment:</span>
                                        <span className="text-[10px] text-white/30 font-bold italic">Sharing life, one post at a time.</span>
                                    </div>
                                </div>
                                <button
                                    onClick={nextStep}
                                    disabled={!formData.bio}
                                    className="w-full bg-cyber-pink text-white py-6 rounded-full font-black text-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Finish Bio
                                </button>
                            </motion.div>
                        )}

                        {step === 9 && (
                            <motion.div key="step9" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="text-center space-y-10">
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black uppercase tracking-tight">Visual trust</h2>
                                    <p className="text-white/40 font-medium">Profiles with photos get more trust and followers.</p>
                                </div>

                                {/* Hidden ImageKit Upload */}
                                <IKUpload
                                    id="onboarding-upload"
                                    fileName={`profile - ${user?.uid || 'temp'} `}
                                    folder="/creda/profiles"
                                    useUniqueFileName={true}
                                    style={{ display: 'none' }}
                                    onUploadStart={() => setIsUploading(true)}
                                    onSuccess={async (res) => {
                                        setIsUploading(false)
                                        setFormData({ ...formData, photoURL: res.url })
                                        if (user) {
                                            await updateProfile(user, { photoURL: res.url })
                                            await user.reload()
                                            await user.getIdToken(true)
                                        }
                                    }}
                                    onError={(err) => {
                                        setIsUploading(false)
                                        console.error("Upload error:", err)
                                    }}
                                />

                                <div className="relative mx-auto w-48 h-48">
                                    <label
                                        htmlFor="onboarding-upload"
                                        className={cn(
                                            "block w-full h-full rounded-full bg-gradient-to-br from-white/10 to-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center group cursor-pointer hover:border-cyber-pink/50 transition-all overflow-hidden relative",
                                            isUploading && "pointer-events-none opacity-50"
                                        )}
                                    >
                                        {isUploading ? (
                                            <Loader2 className="w-10 h-10 text-cyber-pink animate-spin" />
                                        ) : formData.photoURL ? (
                                            <img src={formData.photoURL} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <Camera className="w-10 h-10 text-white/20 group-hover:text-cyber-pink transition-colors mb-2" />
                                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Add Photo</span>
                                            </>
                                        )}
                                    </label>
                                    <label
                                        htmlFor="onboarding-upload"
                                        className={cn(
                                            "absolute -bottom-2 -right-2 w-12 h-12 bg-cyber-pink rounded-2xl flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform",
                                            isUploading && "pointer-events-none opacity-50"
                                        )}
                                    >
                                        <Plus className="w-6 h-6" />
                                    </label>
                                </div>
                                <div className="space-y-4 pt-8">
                                    <label
                                        htmlFor="onboarding-upload"
                                        className={cn(
                                            "w-full bg-white text-black py-6 rounded-full font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer hover:bg-white/90 transition-colors",
                                            isUploading && "pointer-events-none opacity-50"
                                        )}
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        {isUploading ? "Processing..." : "Upload from device"}
                                    </label>
                                    <button
                                        onClick={nextStep}
                                        disabled={!formData.photoURL}
                                        className="text-white/20 font-black text-xs uppercase tracking-[0.2em] hover:text-white transition-colors disabled:opacity-0"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 10 && (
                            <motion.div key="step10" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="space-y-10">
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black uppercase tracking-tight">Find your circle</h2>
                                    <p className="text-white/40 font-medium">Following people gets you started instantly.</p>
                                </div>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {suggestedUsers.length === 0 ? (
                                        <div className="text-center text-white/20 py-10">Searching for visionaries...</div>
                                    ) : (
                                        suggestedUsers.map((person, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-white/[0.02] border border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 ring-2 ring-white/5">
                                                        <img src={person.img} alt={person.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-white">{person.name}</h4>
                                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{person.count}</p>
                                                    </div>
                                                </div>
                                                <button className="px-6 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-cyber-pink hover:text-white hover:border-cyber-pink transition-all">
                                                    Follow
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="space-y-4 pt-4">
                                    <button onClick={nextStep} className="w-full bg-cyber-pink text-white py-6 rounded-full font-black text-xl uppercase tracking-widest">
                                        Follow All & Continue
                                    </button>
                                    <button onClick={nextStep} className="w-full text-white/20 font-black text-xs uppercase tracking-[0.2em] hover:text-white transition-colors">
                                        Skip
                                    </button>
                                </div>
                                <div className="text-center">
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Creda // Verified Identity Flow</span>
                                </div>
                            </motion.div>
                        )}

                        {step === 11 && (
                            <motion.div key="step11" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="space-y-10 text-center">
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black uppercase tracking-tight leading-tight">Grow faster <br />together</h2>
                                    <p className="text-white/40 font-medium">Creators who invite friends grow 2x faster. Earn boosts and priority visibility.</p>
                                </div>
                                <div className="p-8 rounded-[48px] bg-gradient-to-br from-cyber-pink/20 to-transparent border border-white/10 space-y-8">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyber-pink">Your Unique Invite Link</p>
                                        <div className="p-6 bg-black/40 rounded-3xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-cyber-pink/50 transition-all">
                                            <span className="font-bold text-white/60 tracking-tight">creda.io/invite/official</span>
                                            <Copy className="w-4 h-4 text-white/20 group-hover:text-cyber-pink transition-colors" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <button onClick={nextStep} className="w-full bg-white text-black py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2">
                                            <Share2 className="w-4 h-4" /> Invite Friends
                                        </button>
                                        <button onClick={nextStep} className="text-white/20 font-black text-xs uppercase tracking-[0.2em] hover:text-white transition-colors py-2">
                                            Maybe Later
                                        </button>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Creda // Verified Identity Flow</span>
                                </div>
                            </motion.div>
                        )}

                        {step === 12 && (
                            <motion.div key="step12" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="text-center space-y-10">
                                <div className="space-y-4">
                                    <div className="w-20 h-20 bg-cyber-cyan shadow-[0_0_40px_rgba(0,242,255,0.2)] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Bell className="w-10 h-10 text-white animate-bounce" />
                                    </div>
                                    <h2 className="text-4xl font-black uppercase tracking-tight leading-tight pt-4">Stay Connected</h2>
                                    <p className="text-white/40 font-medium max-w-sm mx-auto">Receive real-time updates when people follow, engage, or reward your content.</p>
                                </div>
                                <div className="space-y-4">
                                    <button onClick={nextStep} className="w-full bg-cyber-cyan text-black py-6 rounded-full font-black text-xl uppercase tracking-widest shadow-[0_20px_40px_rgba(0,242,255,0.2)]">
                                        Allow Notifications
                                    </button>
                                    <button onClick={nextStep} className="text-white/20 font-black text-xs uppercase tracking-[0.2em] hover:text-white transition-colors">
                                        Not Now
                                    </button>
                                </div>
                                <div className="text-center">
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Creda // Verified Identity Flow</span>
                                </div>
                            </motion.div>
                        )}

                        {step === 13 && (
                            <motion.div key="step13" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="text-center space-y-12">
                                <div className="relative">
                                    <div className="w-32 h-32 bg-cyber-pink rounded-full flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(255,45,108,0.4)] animate-pulse">
                                        <Check className="w-16 h-16 text-white" strokeWidth={4} />
                                    </div>
                                    <div className="absolute inset-0 rounded-full border border-cyber-pink animate-ping opacity-20" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-5xl font-black tracking-tighter">
                                        WELCOME, <br />
                                        <span className="text-cyber-pink uppercase">@{formData.username || 'VISIONARY'}</span>
                                    </h2>
                                    <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs">Your journey starts now.</p>
                                </div>
                                <button
                                    onClick={handleFinish}
                                    disabled={isSaving}
                                    className="w-full bg-white text-black py-6 rounded-full font-black text-xl uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50"
                                >
                                    {isSaving ? "Finalizing System..." : "Enter Workspace"}
                                    <ArrowRight className="w-6 h-6" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </ImageKitProvider>
            </div>

            {/* Progress Bar (Optional) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / 13) * 100}% ` }}
                    className="h-full bg-cyber-pink"
                />
            </div>
        </div>
    )
}
