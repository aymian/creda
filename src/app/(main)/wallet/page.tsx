"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Wallet,
    CreditCard,
    Send,
    Download,
    ArrowUpCircle,
    ArrowDownCircle,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    XCircle,
    Sparkles,
    Smartphone,
    ArrowRight
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs } from "firebase/firestore"
import { Header } from "@/components/header"
import { CredaLogo } from "@/components/logo"

export default function WalletPage() {
    const { user } = useAuth()
    const [balance, setBalance] = useState(0)
    const [morraCardNumber, setMorraCardNumber] = useState("")
    const [cardExpiry, setCardExpiry] = useState<number | null>(null)
    const [timeLeft, setTimeLeft] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [inputNumber, setInputNumber] = useState("")
    const [convertInput, setConvertInput] = useState("")
    const [targetCurrency, setTargetCurrency] = useState<'USD' | 'EUR' | 'RWF'>('USD')
    const [currency, setCurrency] = useState('RWF')

    useEffect(() => {
        if (!user) return

        const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data()
                setBalance(data.balance || 0)
                setCurrency(data.currency || "RWF")
                setMorraCardNumber(data.morraCardNumber || "")
                setCardExpiry(data.morraCardExpiry || null)
            }
            setLoading(false)
        })

        return () => unsub()
    }, [user])

    // Countdown Logic
    useEffect(() => {
        if (!cardExpiry) return

        const updateTimer = () => {
            const now = Date.now()
            const diff = cardExpiry - now

            if (diff <= 0) {
                setTimeLeft("Expired")
                return
            }

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            setTimeLeft(`${hours}h ${minutes}m left`)
        }

        updateTimer()
        const interval = setInterval(updateTimer, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [cardExpiry])

    const handleRegisterCard = async () => {
        if (!user || inputNumber.length !== 10) {
            setError("Card number must be exactly 10 digits")
            return
        }

        setSaving(true)
        setError(null)

        try {
            const q = query(collection(db, "users"), where("morraCardNumber", "==", inputNumber))
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
                setError("This card number is already claimed")
                setSaving(false)
                return
            }

            const expiryDate = Date.now() + (30 * 24 * 60 * 60 * 1000)

            await updateDoc(doc(db, "users", user.uid), {
                morraCardNumber: inputNumber,
                morraCardExpiry: expiryDate
            })

            setInputNumber("")
        } catch (err) {
            console.error("Error saving card:", err)
            setError("Database error")
        } finally {
            setSaving(false)
        }
    }

    const handleConvert = async () => {
        if (!user || !convertInput || isNaN(Number(convertInput))) return;

        setSaving(true);
        try {
            const amount = Number(convertInput);

            // 1. First, convert from active currency back to RWF (the base rate)
            const rwfBase = currency === 'USD' ? amount * 1400 : currency === 'EUR' ? amount * 1700 : amount;

            // 2. Then, convert from RWF to the new target currency
            let result = 0;
            if (targetCurrency === 'USD') result = rwfBase / 1400;
            else if (targetCurrency === 'EUR') result = rwfBase / 1700;
            else result = rwfBase;

            await updateDoc(doc(db, "users", user.uid), {
                balance: result,
                currency: targetCurrency
            });

            setConvertInput("");
            setSaving(false);
        } catch (err) {
            console.error("Conversion error:", err);
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#C19A3B] border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[#C19A3B]/30">
            <Header />

            <main className="max-w-6xl mx-auto px-6 py-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Card Section */}
                    <div className="lg:col-span-12 mb-2">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h1 className="text-3xl font-serif text-white mb-1">Creda Card</h1>
                                <p className="text-sm text-gray-500">Your premium payment card</p>
                            </div>
                            <CreditCard className="w-6 h-6 text-[#C19A3B]" />
                        </div>
                    </div>

                    <div className="lg:col-span-7 space-y-12">
                        {/* THE CARD */}
                        <AnimatePresence mode="wait">
                            {!morraCardNumber || timeLeft === "Expired" ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full aspect-[1.6/1] rounded-[40px] bg-[#111] border border-white/5 flex flex-col items-center justify-center p-8 text-center"
                                >
                                    <div className="w-16 h-16 bg-[#C19A3B]/10 rounded-full flex items-center justify-center mb-6">
                                        <CreditCard className="w-8 h-8 text-[#C19A3B]" />
                                    </div>
                                    <h2 className="text-xl font-bold mb-4">Initialize Creda Card</h2>
                                    <div className="flex flex-col gap-4 w-full max-w-sm">
                                        <input
                                            type="text"
                                            maxLength={10}
                                            value={inputNumber}
                                            onChange={(e) => setInputNumber(e.target.value.replace(/\D/g, ''))}
                                            className="bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-center text-xl font-bold tracking-widest outline-none focus:border-[#C19A3B]/50 transition-all"
                                            placeholder="10 DIGITS"
                                        />
                                        {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
                                        <button
                                            onClick={handleRegisterCard}
                                            disabled={saving || inputNumber.length !== 10}
                                            className="bg-[#C19A3B] hover:bg-[#D4AC4D] text-black font-black uppercase text-xs py-4 rounded-2xl transition-all disabled:opacity-50"
                                        >
                                            {saving ? "Registering..." : "Activate Card"}
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="relative w-full aspect-[1.6/1] rounded-[48px] p-10 md:p-12 overflow-hidden shadow-2xl group"
                                    style={{
                                        background: "linear-gradient(135deg, #3D2F14 0%, #1A1509 45%, #000000 100%)",
                                        border: "1px solid rgba(193, 154, 59, 0.2)"
                                    }}
                                >
                                    {/* Card Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <CredaLogo size={32} />
                                            <span className="text-xl font-black tracking-tighter text-[#C19A3B]">CREDA</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Expires in</p>
                                            <p className="text-xs font-black text-white">{timeLeft}</p>
                                        </div>
                                    </div>

                                    {/* Card Number */}
                                    <div className="mt-16 sm:mt-24">
                                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] mb-3">Card Number</p>
                                        <p className="text-2xl sm:text-3xl font-black tracking-[0.2em] text-white">
                                            {morraCardNumber.replace(/(\d{4})(\d{4})(\d{2})/, '$1 $2 $3')}
                                        </p>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="mt-12 sm:mt-16 flex justify-between items-end">
                                        <div>
                                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] mb-1">Balance</p>
                                            <p className="text-2xl font-black text-white italic">{currency} {balance.toLocaleString()}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Network</span>
                                            <span className="text-xs font-black text-[#C19A3B] tracking-widest uppercase">Creda-Net v1</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* INTERACTIVE CONVERSION HUB */}
                        <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-[#C19A3B]">Live Exchange</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Convert your {currency} value</p>
                                </div>
                                <div className="flex bg-black rounded-xl p-1 border border-white/5">
                                    <button
                                        onClick={() => setTargetCurrency('USD')}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${targetCurrency === 'USD' ? 'bg-[#C19A3B] text-black' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        USD
                                    </button>
                                    <button
                                        onClick={() => setTargetCurrency('EUR')}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${targetCurrency === 'EUR' ? 'bg-[#C19A3B] text-black' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        EUR
                                    </button>
                                    <button
                                        onClick={() => setTargetCurrency('RWF')}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${targetCurrency === 'RWF' ? 'bg-[#C19A3B] text-black' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        RWF
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-gray-600 ml-2">Your Amount ({currency})</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={convertInput}
                                        onChange={(e) => setConvertInput(e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-xl font-bold outline-none focus:border-[#C19A3B]/50 transition-all font-mono"
                                    />
                                </div>
                                <div className="flex flex-col items-center justify-center pt-4 md:pt-6">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 mb-2">
                                        <ArrowRight className="w-4 h-4 text-[#C19A3B]" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-black uppercase text-gray-600 mb-1">Estimated {targetCurrency}</p>
                                        <p className="text-2xl font-black text-[#C19A3B] italic">
                                            {(() => {
                                                const amount = Number(convertInput) || 0;
                                                const rwfBase = currency === 'USD' ? amount * 1400 : currency === 'EUR' ? amount * 1700 : amount;
                                                const est = targetCurrency === 'USD' ? rwfBase / 1400 : targetCurrency === 'EUR' ? rwfBase / 1700 : rwfBase;
                                                return est.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                            })()}
                                            <span className="text-[10px] not-italic ml-1 text-gray-500">{targetCurrency}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleConvert}
                                disabled={saving || !convertInput}
                                className="w-full py-4 bg-[#C19A3B] text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-[#D4AC4D] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                Update Card Balance & Currency
                            </button>
                        </div>

                        {/* Bottom Deposit/Withdraw Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-3 py-5 bg-[#111] border border-white/5 rounded-3xl hover:bg-white/10 transition-all group">
                                <ArrowDownCircle className="w-5 h-5 text-[#C19A3B] group-hover:scale-110 transition-transform" />
                                <span className="font-black uppercase text-xs tracking-widest">Deposit</span>
                            </button>
                            <button className="flex items-center justify-center gap-3 py-5 bg-[#111] border border-white/5 rounded-3xl hover:bg-white/10 transition-all group">
                                <ArrowUpCircle className="w-5 h-5 text-[#C19A3B] group-hover:scale-110 transition-transform" />
                                <span className="font-black uppercase text-xs tracking-widest">Withdraw</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Balance Widget & Converter */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Balance Widget */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] p-10 md:p-12 space-y-12">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500 font-medium">Total Balance</p>
                                    <div className="flex items-center gap-3 pt-2">
                                        <h2 className="text-5xl font-serif text-white italic">{currency} {balance.toLocaleString()}</h2>
                                        <Lock className="w-5 h-5 text-gray-700 mt-2" />
                                    </div>
                                </div>
                                <div className="w-14 h-14 bg-[#111] rounded-2xl flex items-center justify-center border border-white/10">
                                    <Wallet className="w-7 h-7 text-[#C19A3B]/40" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex items-center justify-center gap-3 py-6 bg-[#111]/50 border border-white/5 rounded-3xl hover:bg-[#C19A3B] hover:text-black transition-all group overflow-hidden relative">
                                    <Send className="w-4 h-4 text-[#C19A3B] group-hover:text-black transition-colors" />
                                    <span className="font-black uppercase text-[11px] tracking-widest">Send</span>
                                </button>
                                <button className="flex items-center justify-center gap-3 py-6 bg-[#111]/50 border border-white/5 rounded-3xl hover:bg-[#C19A3B] hover:text-black transition-all group">
                                    <ArrowDownCircle className="w-4 h-4 text-[#C19A3B] rotate-180 group-hover:text-black transition-colors" />
                                    <span className="font-black uppercase text-[11px] tracking-widest">Receive</span>
                                </button>
                            </div>

                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-600">
                                <span>Instant transfers • Firestore-backed</span>
                                <span className="text-[#C19A3B]/40">Card linked</span>
                            </div>
                        </div>

                        {/* ATSET CONVERTER CARD */}
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[48px] p-10 md:p-12 space-y-8 relative overflow-hidden group">
                            {/* Decorative Blur */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#C19A3B]/10 blur-[80px] rounded-full group-hover:bg-[#C19A3B]/20 transition-colors" />

                            <div className="flex items-center gap-4 mb-2">
                                <Sparkles className="w-5 h-5 text-[#C19A3B]" />
                                <h3 className="text-lg font-serif italic text-white">Asset Converter</h3>
                            </div>

                            <div className="space-y-6">
                                {/* USD Converter */}
                                <div className="p-6 bg-[#111] rounded-3xl border border-white/5 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-black text-blue-500 border border-blue-500/20">$</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">USD Rate</span>
                                        </div>
                                        <span className="text-xs font-black text-[#C19A3B]">1,400 RWF</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-serif text-white italic">1 USD =</span>
                                        <span className="text-3xl font-black text-white px-3 py-1 bg-white/5 rounded-xl">1,400</span>
                                        <span className="text-xs font-bold text-gray-600">RWF</span>
                                    </div>
                                </div>

                                {/* EUR Converter */}
                                <div className="p-6 bg-[#111] rounded-3xl border border-white/5 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center text-[10px] font-black text-orange-500 border border-orange-500/20">€</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">EUR Rate</span>
                                        </div>
                                        <span className="text-xs font-black text-[#C19A3B]">1,700 RWF</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-serif text-white italic">1 EUR =</span>
                                        <span className="text-3xl font-black text-white px-3 py-1 bg-white/5 rounded-xl">1,700</span>
                                        <span className="text-xs font-bold text-gray-600">RWF</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[9px] font-black text-center text-gray-600 uppercase tracking-[0.2em] pt-2">
                                Global Focus Markets • Updated Live
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
