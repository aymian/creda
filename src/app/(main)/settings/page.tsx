"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Settings,
    User,
    Shield,
    Bell,
    Smartphone,
    Globe,
    HelpCircle,
    ChevronRight,
    Camera,
    Check,
    Lock,
    Eye,
    EyeOff,
    SmartphoneNfc,
    Key,
    UserCheck,
    ArrowLeft,
    CreditCard,
    Languages,
    Moon,
    Fingerprint
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import Link from "next/link"

type SettingsSection = 'profile' | 'privacy' | 'notifications' | 'account';

export default function SettingsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [activeSection, setActiveSection] = useState<SettingsSection>('profile')

    const [formData, setFormData] = useState({
        displayName: "",
        bio: "",
        location: "",
        website: "",
        isPrivate: false,
        allowTagging: "everyone",
        showActivityStatus: true
    })

    useEffect(() => {
        async function fetchUserData() {
            if (!user) return
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid))
                if (userDoc.exists()) {
                    const data = userDoc.data()
                    setFormData({
                        displayName: data.displayName || "",
                        bio: data.bio || "",
                        location: data.location || "",
                        website: data.website || "",
                        isPrivate: data.isPrivate ?? false,
                        allowTagging: data.allowTagging ?? "everyone",
                        showActivityStatus: data.showActivityStatus ?? true
                    })
                }
            } catch (err) {
                console.error("Error fetching user data:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchUserData()
    }, [user])

    const handleUpdate = async (newData?: any) => {
        if (!user) return
        setSaving(true)
        try {
            const dataToUpdate = newData || formData;
            await updateDoc(doc(db, "users", user.uid), dataToUpdate)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            console.error("Error updating profile:", err)
        } finally {
            setSaving(false)
        }
    }

    const toggleSwitch = (key: string) => {
        const newValue = !((formData as any)[key]);
        const updatedData = { ...formData, [key]: newValue };
        setFormData(updatedData);
        handleUpdate(updatedData);
    }

    if (loading) return (
        <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-cyber-pink border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-[#0C0C0C] text-white">
            {/* Meta-Style Header */}
            <header className="sticky top-0 z-50 bg-[#0C0C0C]/80 backdrop-blur-3xl border-b border-white/5">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-all text-white/40 hover:text-white">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tight">Accounts Center</h1>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Manage your connected experiences</p>
                        </div>
                    </div>
                    {user && (
                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-cyber-pink flex items-center justify-center text-[12px] font-black">
                                {user.displayName?.[0] || user.email?.[0].toUpperCase()}
                            </div>
                            <span className="text-xs font-bold text-white/80">{user.displayName || "Visionary"}</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="max-w-5xl mx-auto flex flex-col md:flex-row min-h-[calc(100-80px)]">
                {/* Meta-Style Sidebar */}
                <aside className="w-full md:w-80 border-r border-white/5 p-6 space-y-2">
                    <h2 className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Settings</h2>

                    {[
                        { id: 'profile', icon: User, label: 'Personal details' },
                        { id: 'privacy', icon: Shield, label: 'Password and security' },
                        { id: 'notifications', icon: Bell, label: 'Ad preferences' },
                        { id: 'account', icon: Fingerprint, label: 'Verification' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id as SettingsSection)}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${activeSection === item.id
                                    ? 'bg-cyber-pink text-white shadow-[0_0_20px_rgba(255,45,108,0.2)]'
                                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-sm font-bold">{item.label}</span>
                            {activeSection === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                        </button>
                    ))}

                    <div className="pt-8 space-y-2">
                        <h2 className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Others</h2>
                        <button className="w-full flex items-center gap-4 px-4 py-4 text-white/40 hover:bg-white/5 hover:text-white rounded-2xl transition-all">
                            <CreditCard className="w-5 h-5" />
                            <span className="text-sm font-bold">Payments</span>
                        </button>
                        <button className="w-full flex items-center gap-4 px-4 py-4 text-white/40 hover:bg-white/5 hover:text-white rounded-2xl transition-all">
                            <Languages className="w-5 h-5" />
                            <span className="text-sm font-bold">Language</span>
                        </button>
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-1 p-8 md:p-12 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {activeSection === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-2xl space-y-8"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black uppercase tracking-tight">Personal details</h2>
                                    <p className="text-white/40 text-sm font-medium">Creda uses this information to verify your identity and to keep our community safe.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="group space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Display Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.displayName}
                                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:border-cyber-pink/50 focus:bg-white/[0.05] outline-none transition-all"
                                                placeholder="Your display name"
                                            />
                                            <User className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-cyber-pink transition-colors" />
                                        </div>
                                    </div>

                                    <div className="group space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Bio</label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/5 rounded-3xl px-6 py-5 text-sm font-bold focus:border-cyber-pink/50 focus:bg-white/[0.05] outline-none transition-all min-h-[150px] resize-none"
                                            placeholder="Tell the universe about yourself..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="group space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Location</label>
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:border-cyber-pink/50 outline-none transition-all"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                        <div className="group space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-2">Website</label>
                                            <input
                                                type="text"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:border-cyber-pink/50 outline-none transition-all"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleUpdate()}
                                    disabled={saving}
                                    className="w-full py-5 bg-cyber-pink text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_20px_40px_rgba(255,45,108,0.2)] disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : success ? (
                                        <Check className="w-5 h-5" />
                                    ) : null}
                                    {saving ? "Updating..." : success ? "Update Successful" : "Update Account"}
                                </motion.button>
                            </motion.div>
                        )}

                        {activeSection === 'privacy' && (
                            <motion.div
                                key="privacy"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-2xl space-y-8"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black uppercase tracking-tight">Security Center</h2>
                                    <p className="text-white/40 text-sm font-medium">Take control of your privacy and account security across all devices.</p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { key: 'isPrivate', icon: Lock, label: 'Private Account', desc: 'Only followers you approve can see your posts.' },
                                        { key: 'showActivityStatus', icon: Eye, label: 'Activity Status', desc: 'Allow accounts you follow to see when you were last active.' },
                                    ].map((item) => (
                                        <div
                                            key={item.key}
                                            onClick={() => toggleSwitch(item.key)}
                                            className="group flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="p-4 bg-white/5 rounded-2xl text-white/20 group-hover:text-cyber-pink group-hover:bg-cyber-pink/10 transition-all">
                                                    <item.icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-sm uppercase tracking-wide">{item.label}</h3>
                                                    <p className="text-xs text-white/20 font-bold mt-1">{item.desc}</p>
                                                </div>
                                            </div>
                                            <div className={`w-12 h-6 rounded-full relative transition-all duration-500 ${(formData as any)[item.key] ? 'bg-cyber-pink shadow-[0_0_15px_rgba(255,45,108,0.5)]' : 'bg-white/10'}`}>
                                                <motion.div
                                                    animate={{ x: (formData as any)[item.key] ? 24 : 4 }}
                                                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <div className="p-6 bg-gradient-to-br from-cyber-pink/20 to-purple-900/20 border border-cyber-pink/20 rounded-3xl mt-8">
                                        <div className="flex items-start gap-5">
                                            <Shield className="w-8 h-8 text-cyber-pink mt-1" />
                                            <div className="space-y-3">
                                                <h3 className="font-black uppercase tracking-widest text-sm">Security Checkup</h3>
                                                <p className="text-sm text-white/60 leading-relaxed font-medium">Your account is currently protected by standard encryption. Enable Two-Factor Authentication for maximum security.</p>
                                                <button className="text-cyber-pink text-[10px] font-black uppercase tracking-widest hover:underline">Start Checkup →</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'notifications' && (
                            <motion.div
                                key="notifications"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                            >
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                                    <Bell className="w-10 h-10 text-white/10" />
                                </div>
                                <h2 className="text-xl font-black uppercase">Notifications & Ads</h2>
                                <p className="text-white/40 text-sm max-w-xs font-medium">We're tailoring your ad experience. Check back soon for more options.</p>
                            </motion.div>
                        )}

                        {activeSection === 'account' && (
                            <motion.div
                                key="account"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                            >
                                <div className="w-20 h-20 bg-cyber-pink/10 rounded-full flex items-center justify-center">
                                    <Fingerprint className="w-10 h-10 text-cyber-pink" />
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-tighter italic">Meta Verification</h2>
                                <p className="text-white/40 text-sm max-w-sm font-medium">Unlock exclusive features and a verified badge by joining our elite focus programs.</p>
                                <button className="mt-4 px-8 py-3 bg-white/5 border border-white/10 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Applying Soon</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}
