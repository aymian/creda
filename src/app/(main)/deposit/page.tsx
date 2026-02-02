"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Smartphone, Shield, ArrowRight, Camera, CheckCircle2, AlertCircle } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import { Header } from "@/components/header"
import { useRouter } from "next/navigation"

export default function DepositPage() {
    const { user } = useAuth()
    const router = useRouter()

    const [formData, setFormData] = useState({
        fullNames: "",
        amount: "",
        screenshot: ""
    })
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, screenshot: reader.result as string }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !formData.fullNames || !formData.amount || !formData.screenshot) return

        setSubmitting(true)
        try {
            await addDoc(collection(db, "deposits"), {
                userId: user.uid,
                userEmail: user.email,
                fullNames: formData.fullNames,
                amount: Number(formData.amount),
                screenshot: formData.screenshot,
                status: "pending",
                createdAt: serverTimestamp()
            })
            setSuccess(true)
            setTimeout(() => router.push('/wallet'), 3000)
        } catch (err) {
            console.error(err)
            alert("Submission failed. Try again.")
        } finally {
            setSubmitting(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic italic text-white">Deposit Request Sent</h2>
                    <p className="text-white/40 text-sm max-w-xs mx-auto">Our Central Command is verifying your transaction. Funds will appear in your card shortly.</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyber-pink/30">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-32 space-y-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Smartphone className="w-6 h-6 text-cyber-pink" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyber-pink">Funding Protocol</span>
                    </div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter italic">Mobile <span className="text-cyber-pink">Deposit</span></h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Instructions */}
                    <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 space-y-8">
                        <div className="space-y-2">
                            <h3 className="text-sm font-black uppercase text-cyber-pink tracking-widest">Step 1: Send Money</h3>
                            <p className="text-xs text-white/40 leading-relaxed">Please use Mobile Money to send the amount you wish to deposit to our official receiver:</p>
                        </div>

                        <div className="p-8 bg-black/40 border-2 border-dashed border-white/10 rounded-3xl space-y-4 text-center">
                            <div>
                                <p className="text-[10px] font-black uppercase text-white/20 mb-1">MOMO Number</p>
                                <p className="text-2xl font-black tracking-widest text-white">078 000 0000</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-white/20 mb-1">Receiver Name</p>
                                <p className="text-sm font-bold text-white uppercase italic">CREDA NETWORKS</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 bg-cyber-pink/5 border border-cyber-pink/10 rounded-2xl">
                            <AlertCircle className="w-5 h-5 text-cyber-pink shrink-0" />
                            <p className="text-[10px] font-bold text-white/60 leading-relaxed uppercase">
                                Take a clear screenshot of the confirmation message after payment. You must upload it to proceed.
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-6 bg-[#0C0C0C] border border-white/5 p-8 rounded-[40px]">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-white/20 tracking-widest px-2">Sender's Full Name (MOMO)</label>
                                <input
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-cyber-pink"
                                    placeholder="Enter Names used for payment"
                                    value={formData.fullNames}
                                    onChange={(e) => setFormData({ ...formData, fullNames: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-white/20 tracking-widest px-2">Amount Sent (FRW)</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:border-cyber-pink"
                                    placeholder="0"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-white/20 tracking-widest px-2">Proof of Payment</label>
                                <label className="w-full bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/10 transition-all border-dashed">
                                    {formData.screenshot ? (
                                        <img src={formData.screenshot} className="w-20 h-20 object-cover rounded-xl border border-white/10" alt="Proof" />
                                    ) : (
                                        <Camera className="w-8 h-8 text-white/20" />
                                    )}
                                    <span className="text-[10px] font-black uppercase text-white/40">{formData.screenshot ? "Change Screenshot" : "Upload Screenshot"}</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !formData.screenshot}
                                className="w-full py-5 bg-cyber-pink text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_30px_rgba(255,45,108,0.2)] disabled:opacity-50 hover:scale-[1.02] transition-all"
                            >
                                {submitting ? "Processing..." : "Submit Proof"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
