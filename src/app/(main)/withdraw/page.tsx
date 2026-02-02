"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowUpCircle, Wallet, CheckCircle2, AlertTriangle, Smartphone, ShieldCheck } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import { Header } from "@/components/header"
import { useRouter } from "next/navigation"

export default function WithdrawPage() {
    const { user } = useAuth()
    const router = useRouter()

    const [balance, setBalance] = useState(0)
    const [formData, setFormData] = useState({
        fullNames: "",
        phone: "",
        amount: ""
    })
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!user) return
        const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists()) setBalance(snap.data().balance || 0)
        })
        return () => unsub()
    }, [user])

    const calculateTotal = (amt: string) => {
        const val = Number(amt) || 0
        const fee = val * 0.25
        return { fee, total: val + fee }
    }

    const { fee, total } = calculateTotal(formData.amount)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !formData.fullNames || !formData.phone || !formData.amount) return

        if (total > balance) {
            alert("Insufficient balance. Remember to include the 25% platform fee.")
            return
        }

        setSubmitting(true)
        try {
            await addDoc(collection(db, "withdrawals"), {
                userId: user.uid,
                userEmail: user.email,
                fullNames: formData.fullNames,
                phone: formData.phone,
                requestedAmount: Number(formData.amount),
                fee: fee,
                totalDeduction: total,
                status: "pending",
                createdAt: serverTimestamp()
            })
            setSuccess(true)
            setTimeout(() => router.push('/wallet'), 3000)
        } catch (err) {
            console.error(err)
            alert("Submission failed.")
        } finally {
            setSubmitting(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                        <CheckCircle2 className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic italic text-white">Withdrawal Requested</h2>
                    <p className="text-white/40 text-sm max-w-xs mx-auto">Your request is in queue. Once approved, funds will be sent to your Mobile Money and deducted from your card.</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-32 space-y-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <ArrowUpCircle className="w-6 h-6 text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Extraction Protocol</span>
                    </div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter italic">Liquidate <span className="text-amber-500">Assets</span></h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black uppercase text-white/40 tracking-widest">Available Balance</span>
                                <Wallet className="w-4 h-4 text-white/20" />
                            </div>
                            <h2 className="text-4xl font-black italic">RWF {balance.toLocaleString()}</h2>
                        </div>

                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-[40px] p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-amber-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest">Withdrawal Rules</h3>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-[10px] font-bold text-white/60">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    25% PLATFORM PROCESSING FEE APPLIES
                                </li>
                                <li className="flex items-center gap-3 text-[10px] font-bold text-white/60">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    MANUAL VERIFICATION REQUIRED
                                </li>
                                <li className="flex items-center gap-3 text-[10px] font-bold text-white/60">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    ESTIMATED PAYOUT: 1-12 HOURS
                                </li>
                            </ul>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-[#0C0C0C] border border-white/5 p-8 rounded-[40px]">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest px-2">Account Name</label>
                            <input
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-amber-500"
                                placeholder="Full names on MOMO"
                                value={formData.fullNames}
                                onChange={(e) => setFormData({ ...formData, fullNames: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest px-2">MOMO Phone Number</label>
                            <input
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-amber-500"
                                placeholder="07XXXXXXXX"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest px-2">Withdrawal Amount (FRW)</label>
                            <input
                                required
                                type="number"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-amber-500 text-amber-500"
                                placeholder="0"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>

                        {formData.amount && (
                            <div className="p-6 bg-black/40 rounded-2xl border border-white/5 space-y-4">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-white/20">Process Fee (25%)</span>
                                    <span className="text-red-500">RWF {fee.toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-white">Total Deduction</span>
                                    <span className="text-amber-500">RWF {total.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || !formData.amount}
                            className="w-full py-5 bg-amber-500 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_30px_rgba(245,158,11,0.2)] disabled:opacity-50 hover:scale-[1.02] transition-all"
                        >
                            {submitting ? "Initiating..." : "Request Liquidate"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}
