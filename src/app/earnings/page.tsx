"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    TrendingUp,
    DollarSign,
    ArrowUpRight,
    Layers,
    Activity,
    ShieldCheck,
    ArrowLeft,
    Clock,
    Zap,
    Download
} from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore"
import Link from "next/link"

export default function EarningsDashboard() {
    const [earnings, setEarnings] = useState<any[]>([])
    const [stats, setStats] = useState({
        total: 0,
        withdrawFees: 0,
        transferFees: 0,
        gameFees: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const q = query(collection(db, "earnings"), orderBy("createdAt", "desc"), limit(100))
        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setEarnings(list)

            const newStats = list.reduce((acc, curr) => {
                const amt = typeof curr?.amount === 'number' ? curr.amount : Number(curr?.amount) || 0
                const type = curr?.type || ""

                acc.total += amt
                if (type === "withdrawal_fee") acc.withdrawFees += amt
                if (type === "transfer_fee") acc.transferFees += amt
                if (type === "game_payout") acc.gameFees += amt
                return acc
            }, { total: 0, withdrawFees: 0, transferFees: 0, gameFees: 0 })

            setStats(newStats)
            setLoading(false)
        })

        return () => unsub()
    }, [])

    return (
        <div className="min-h-screen bg-[#050505] text-white font-mono selection:bg-cyber-pink/30">
            {/* Header */}
            <header className="h-24 border-b border-white/5 px-8 flex items-center justify-between bg-black/50 backdrop-blur-2xl sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/manage" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black italic uppercase tracking-tighter">Protocol <span className="text-cyber-pink">Revenue</span></h1>
                        <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Global Earnings Nexus</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase text-white/40 mb-1">Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black text-white/60">LIVE TELEMETRY</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-8 space-y-12">
                {/* Hero Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 bg-gradient-to-br from-cyber-pink/10 to-transparent border border-cyber-pink/20 rounded-[50px] p-12 relative overflow-hidden group">
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-cyber-pink/5 blur-[120px] rounded-full group-hover:bg-cyber-pink/10 transition-all duration-700" />

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-cyber-pink" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyber-pink">Aggregated Net Profit</span>
                            </div>

                            <div>
                                <h2 className="text-8xl font-black italic tracking-tighter text-white">RWF {stats.total.toLocaleString()}</h2>
                                <p className="text-white/20 text-xs mt-4 uppercase font-bold tracking-widest leading-relaxed max-w-lg">
                                    Total revenue generated across all neural arcade protocols, including competitive dues, liquidation fees, and credit dispatch taxes.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button className="px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyber-pink hover:text-white transition-all shadow-xl">Export Ledger</button>
                                <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Audit Vault</button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 grid grid-cols-1 gap-4">
                        {[
                            { label: "Withdrawal Tax (25%)", value: stats.withdrawFees, color: "text-amber-500", bg: "bg-amber-500/10", borderColor: "border-amber-500/20" },
                            { label: "Transfer Tax (10%)", value: stats.transferFees, color: "text-cyber-cyan", bg: "bg-cyber-cyan/10", borderColor: "border-cyber-cyan/20" },
                            { label: "Arcade rake (20%)", value: stats.gameFees, color: "text-green-400", bg: "bg-green-400/10", borderColor: "border-green-400/20" }
                        ].map((item, i) => (
                            <div key={i} className={`p-8 ${item.bg} border ${item.borderColor} rounded-[40px] space-y-3`}>
                                <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">{item.label}</p>
                                <h4 className={`text-3xl font-black italic ${item.color}`}>RWF {item.value.toLocaleString()}</h4>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Log Table */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-2xl font-black uppercase italic italic tracking-tighter">Transaction <span className="text-white/20">Stream</span></h3>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-white/40 uppercase">
                            <Layers className="w-4 h-4" /> Real-time Audit
                        </div>
                    </div>

                    <div className="bg-[#0C0C0C] border border-white/5 rounded-[40px] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/[0.01] border-b border-white/5">
                                <tr className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                    <th className="px-8 py-6">Protocol Type</th>
                                    <th className="px-8 py-6">Identity Source</th>
                                    <th className="px-8 py-6">Revenue</th>
                                    <th className="px-8 py-6">Timestamp</th>
                                    <th className="px-8 py-6 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {earnings.map((e) => (
                                    <tr key={e.id} className="hover:bg-white/[0.01] transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${e.type === 'game_payout' ? 'bg-green-500/10 text-green-500' : e.type === 'withdrawal_fee' ? 'bg-amber-500/10 text-amber-500' : 'bg-cyber-cyan/10 text-cyber-cyan'}`}>
                                                    {e.type === 'game_payout' ? <Zap className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">{(e.type || "unknown_fee").replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-[10px] font-mono text-white/40 truncate max-w-[120px]">{e.userId || e.senderId || e.matchId || "SYSTEM"}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-black text-white italic">+RWF {e.amount?.toLocaleString()}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase">
                                                <Clock className="w-3 h-3" />
                                                {e.createdAt?.toDate ? e.createdAt.toDate().toLocaleTimeString() : 'RECENT'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-[9px] font-black uppercase text-green-500 tracking-[0.2em] flex items-center justify-end gap-2">
                                                <ShieldCheck className="w-3 h-3" /> VERIFIED
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {earnings.length === 0 && (
                            <div className="p-20 text-center space-y-4">
                                <Activity className="w-12 h-12 text-white/5 mx-auto animate-pulse" />
                                <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.4em]">Awaiting Financial Stream...</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
