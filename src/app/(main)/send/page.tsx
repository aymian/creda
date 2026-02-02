"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, CreditCard, CheckCircle2, AlertTriangle, ArrowRightLeft, Shield } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, onSnapshot, writeBatch, increment, serverTimestamp } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import { Header } from "@/components/header"
import { useRouter } from "next/navigation"

export default function SendPage() {
    const { user } = useAuth()
    const router = useRouter()

    const [balance, setBalance] = useState(0)
    const [formData, setFormData] = useState({
        recipientCard: "",
        amount: ""
    })
    const [recipientData, setRecipientData] = useState<any>(null)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!user) return
        const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists()) setBalance(snap.data().balance || 0)
        })
        return () => unsub()
    }, [user])

    const checkRecipient = async (cardNumber: string) => {
        if (cardNumber.length < 10) return
        const q = query(collection(db, "users"), where("morraCardNumber", "==", cardNumber))
        const snap = await getDocs(q)
        if (!snap.empty) {
            setRecipientData({ id: snap.docs[0].id, ...snap.docs[0].data() })
            setError("")
        } else {
            setRecipientData(null)
            setError("Recipient Card not found")
        }
    }

    const calculateTotal = (amt: string) => {
        const val = Number(amt) || 0
        const fee = val * 0.10
        return { fee, total: val + fee }
    }

    const { fee, total } = calculateTotal(formData.amount)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !recipientData || !formData.amount) return

        if (total > balance) {
            alert("Insufficient balance. 10% transfer fee applies.")
            return
        }

        setSubmitting(true)
        try {
            const batch = writeBatch(db)

            // Deduct from Sender
            batch.update(doc(db, "users", user.uid), {
                balance: increment(-total)
            })

            // Add to Recipient
            batch.update(doc(db, "users", recipientData.id), {
                balance: increment(Number(formData.amount))
            })

            // Log Earnings (the fee)
            const feeDoc = doc(collection(db, "earnings"))
            batch.set(feeDoc, {
                type: "transfer_fee",
                senderId: user.uid,
                recipientId: recipientData.id,
                amount: fee,
                originalAmount: Number(formData.amount),
                createdAt: serverTimestamp()
            })

            await batch.commit()
            setSuccess(true)
            setTimeout(() => router.push('/wallet'), 3000)
        } catch (err) {
            console.error(err)
            alert("Transfer failed.")
        } finally {
            setSubmitting(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6">
                    <div className="w-20 h-20 bg-cyber-cyan/10 rounded-full flex items-center justify-center mx-auto border border-cyber-cyan/20">
                        <CheckCircle2 className="w-10 h-10 text-cyber-cyan" />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic italic text-white">Transfer Success</h2>
                    <p className="text-white/40 text-sm max-w-xs mx-auto">Neural credits have been successfully dispatched to card {formData.recipientCard}.</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyber-cyan/30">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-32 space-y-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Send className="w-6 h-6 text-cyber-cyan" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyber-cyan">Card-to-Card Protocol</span>
                    </div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter italic">Dispatch <span className="text-cyber-cyan">Credits</span></h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black uppercase text-white/40 tracking-widest">Neural Balance</span>
                                <div className="p-2 bg-cyber-cyan/10 rounded-lg"><CreditCard className="w-4 h-4 text-cyber-cyan" /></div>
                            </div>
                            <h2 className="text-4xl font-black italic">RWF {balance.toLocaleString()}</h2>
                        </div>

                        {recipientData && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-green-500/5 border border-green-500/20 rounded-[40px] flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full border-2 border-green-500/50 p-1">
                                    <img src={recipientData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${recipientData.uid}`} className="w-full h-full rounded-full object-cover" alt="R" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-green-500 tracking-widest">Recipient Identified</p>
                                    <p className="text-lg font-black italic uppercase">@{recipientData.username}</p>
                                </div>
                            </motion.div>
                        )}

                        {error && (
                            <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-[32px] flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest">
                                <AlertTriangle className="w-4 h-4" /> {error}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-[#0C0C0C] border border-white/5 p-8 rounded-[40px]">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest px-2">Recipient Card Number</label>
                            <input
                                required
                                maxLength={10}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-cyber-cyan tracking-[0.2em]"
                                placeholder="10 DIGITS"
                                value={formData.recipientCard}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '')
                                    setFormData({ ...formData, recipientCard: val })
                                    if (val.length === 10) checkRecipient(val)
                                    else setRecipientData(null)
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-white/20 tracking-widest px-2">Amount to Dispatch (FRW)</label>
                            <input
                                required
                                type="number"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-cyber-cyan text-cyber-cyan"
                                placeholder="0"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>

                        {formData.amount && (
                            <div className="p-6 bg-black/40 rounded-2xl border border-white/5 space-y-4">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-white/20">Transfer Fee (10%)</span>
                                    <span className="text-red-500">RWF {fee.toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-white">Total Dispatched from Wallet</span>
                                    <span className="text-cyber-cyan">RWF {total.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || !recipientData || !formData.amount}
                            className="w-full py-5 bg-cyber-cyan text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_30px_rgba(0,242,255,0.2)] disabled:opacity-50 hover:scale-[1.02] transition-all"
                        >
                            {submitting ? "Dispatching..." : "Commit Transfer"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}
