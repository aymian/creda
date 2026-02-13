"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Users, Shield, Lock, Search, Trash2, Edit3, AlertTriangle, RefreshCw,
    Database, Activity, ArrowRight, Power, DollarSign, CheckCircle2,
    XCircle, Cpu, X, Save, Calendar, Phone, Mail, User as UserIcon,
    Award, ArrowDownCircle, ArrowUpCircle, TrendingUp, Eye, SwatchBook, Terminal
} from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, writeBatch, increment, serverTimestamp, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"

export default function ManagePage() {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [activeTab, setActiveTab] = useState<"users" | "matches" | "deposits" | "withdrawals" | "earnings" | "system" | "posts">("users")

    const [users, setUsers] = useState<any[]>([])
    const [matches, setMatches] = useState<any[]>([])
    const [deposits, setDeposits] = useState<any[]>([])
    const [withdrawals, setWithdrawals] = useState<any[]>([])
    const [earnings, setEarnings] = useState<any[]>([])
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    const [editingUser, setEditingUser] = useState<any>(null)
    const [editFormData, setEditFormData] = useState<any>({})
    const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null)

    // 1. Session Management
    useEffect(() => {
        const session = localStorage.getItem("creda_manage_token")
        if (session === "authorized_access_granted") setIsAuthenticated(true)
    }, [])

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (username === "manage" && password === "azerty") {
            localStorage.setItem("creda_manage_token", "authorized_access_granted")
            setIsAuthenticated(true)
            setError("")
        } else setError("ACCESS DENIED")
    }

    const logout = () => {
        localStorage.removeItem("creda_manage_token")
        setIsAuthenticated(false)
    }

    // 2. Data Fetching
    useEffect(() => {
        if (!isAuthenticated) return

        const unsubUsers = onSnapshot(collection(db, "users"), (snap) => setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))))
        const unsubMatches = onSnapshot(query(collection(db, "matches"), orderBy("createdAt", "desc")), (snap) => setMatches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))))
        const unsubDeps = onSnapshot(query(collection(db, "deposits"), orderBy("createdAt", "desc")), (snap) => setDeposits(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))))
        const unsubWiths = onSnapshot(query(collection(db, "withdrawals"), orderBy("createdAt", "desc")), (snap) => setWithdrawals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))))
        const unsubEarn = onSnapshot(query(collection(db, "earnings"), orderBy("createdAt", "desc")), (snap) => setEarnings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))))
        const unsubPosts = onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), (snap) => setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))))

        return () => { unsubUsers(); unsubMatches(); unsubDeps(); unsubWiths(); unsubEarn(); unsubPosts(); }
    }, [isAuthenticated])

    // Approval Handlers
    const approveDeposit = async (dep: any) => {
        if (!dep?.id || !dep?.userId) return
        const batch = writeBatch(db)
        batch.update(doc(db, "users", dep.userId), { balance: increment(Number(dep.amount) || 0) })
        batch.update(doc(db, "deposits", dep.id), { status: "approved", approvedAt: serverTimestamp() })
        await batch.commit()
    }

    const approveWithdrawal = async (withd: any) => {
        if (!withd?.id || !withd?.userId) return

        // Fetch latest user data for balance verification
        try {
            const userRef = doc(db, "users", withd.userId)
            const userSnap = await getDoc(userRef)

            if (!userSnap.exists()) {
                alert("USER ACCOUNT NOT FOUND")
                return
            }

            const currentBalance = userSnap.data().balance || 0
            const requiredAmount = Number(withd.totalDeduction) || 0

            if (currentBalance < requiredAmount) {
                alert(`INSUFFICIENT FUNDS: User has RWF ${currentBalance.toLocaleString()} but needs RWF ${requiredAmount.toLocaleString()} for this liquidation.`)
                return
            }

            const batch = writeBatch(db)
            batch.update(userRef, { balance: increment(-requiredAmount) })
            batch.update(doc(db, "withdrawals", withd.id), { status: "approved", approvedAt: serverTimestamp() })

            const feeDoc = doc(collection(db, "earnings"))
            batch.set(feeDoc, {
                type: "withdrawal_fee",
                userId: withd.userId,
                amount: Number(withd.fee) || 0,
                createdAt: serverTimestamp()
            })

            await batch.commit()
            alert("WITHDRAWAL APPROVED & FUNDS DEDUCTED")
        } catch (err) {
            console.error("Approval error:", err)
            alert("PROTOCOL ERROR DURING APPROVAL")
        }
    }

    const approvePost = async (post: any) => {
        if (!post?.id) return
        try {
            await updateDoc(doc(db, "posts", post.id), { status: "approved", approvedAt: serverTimestamp() })
            alert("POST APPROVED BY BEAUTY PROTOCOL")
        } catch (err) {
            console.error(err)
            alert("FAILED TO APPROVE POST")
        }
    }

    const rejectPost = async (post: any) => {
        if (!post?.id) return
        try {
            await updateDoc(doc(db, "posts", post.id), { status: "rejected" })
            alert("POST REJECTED - BEAUTY STANDARDS NOT MET")
        } catch (err) {
            console.error(err)
            alert("FAILED TO REJECT POST")
        }
    }

    const handleEditClick = (user: any) => {
        if (!user) return
        setEditingUser(user);
        setEditFormData({ ...user });
    }

    const handleSaveEdit = async () => {
        if (!editingUser?.id) return
        try {
            const { id, ...dataToUpdate } = editFormData
            if (dataToUpdate.balance !== undefined) dataToUpdate.balance = Number(dataToUpdate.balance)
            await updateDoc(doc(db, "users", editingUser.id), { ...dataToUpdate, updatedAt: new Date() })
            setEditingUser(null)
        } catch (err) {
            console.error(err)
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 font-mono">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-[#0C0C0C] border border-white/5 p-12 rounded-[40px] shadow-2xl space-y-10">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-cyber-pink"><Shield className="w-8 h-8" /></div>
                        <h1 className="text-2xl font-black tracking-widest text-white uppercase italic">Command</h1>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none" placeholder="Operator ID" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none" placeholder="Security Key" />
                        <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] active:scale-95 transition-all">Authorize Access</button>
                    </form>
                </motion.div>
            </div>
        )
    }

    const totalEarningsFrw = earnings.reduce((acc, curr) => acc + (Number(curr?.amount) || 0), 0)

    return (
        <div className="min-h-screen bg-[#080808] text-white font-mono selection:bg-cyber-pink/30">
            {/* Nav */}
            <div className="w-full h-20 border-b border-white/5 px-8 flex items-center justify-between bg-black/50 backdrop-blur-xl fixed top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="text-cyber-pink"><Cpu className="w-6 h-6" /></div>
                    <h2 className="text-lg font-black tracking-tighter italic uppercase">Central Admin</h2>
                </div>
                <div className="flex gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto max-w-[50%]">
                    {["users", "matches", "deposits", "withdrawals", "earnings", "posts", "system"].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-black shadow-lg' : 'text-white/20 hover:text-white'}`}>{tab}</button>
                    ))}
                </div>
                <button onClick={logout} className="p-3 rounded-full border border-white/10 text-white/20 hover:text-red-500 transition-all"><Power className="w-4 h-4" /></button>
            </div>

            <main className="pt-32 p-8 max-w-7xl mx-auto space-y-12">

                {activeTab === "users" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-4xl font-black tracking-tighter uppercase italic">Registry</h3>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <input placeholder="Search ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-xs w-64 outline-none focus:border-cyber-pink" />
                            </div>
                        </div>
                        <div className="bg-[#0C0C0C] border border-white/5 rounded-[40px] overflow-hidden overflow-x-auto">
                            <table className="w-full text-left min-w-[1000px]">
                                <thead className="bg-white/[0.01] border-b border-white/5">
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-white/40"><th className="px-8 py-6">Identity</th><th className="px-8 py-6">Balance</th><th className="px-8 py-6">Protocol Status</th><th className="px-8 py-6 text-right">Admin</th></tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {(users || []).filter(u => u && (u.username || "").toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                                        <tr key={u?.id || Math.random()} className="hover:bg-white/[0.01] group">
                                            <td className="px-8 py-6 flex items-center gap-4">
                                                <img src={u?.photoURL} className="w-10 h-10 rounded-full bg-white/5 border border-white/10" alt="X" />
                                                <div><div className="text-sm font-black italic uppercase">@{u?.username}</div><div className="text-[8px] text-white/20 uppercase font-black">{u?.id}</div></div>
                                            </td>
                                            <td className="px-8 py-6 font-black text-cyber-pink italic">RWF {u?.balance?.toLocaleString()}</td>
                                            <td className="px-8 py-6"><span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase ${u?.status === 'suspended' ? 'text-red-500 border-red-500/20' : 'text-green-500 border-green-500/20'}`}>{u?.status || 'active'}</span></td>
                                            <td className="px-8 py-6 text-right"><button onClick={() => handleEditClick(u)} className="p-3 bg-white/5 rounded-xl hover:text-cyber-cyan transition-all"><Edit3 className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === "matches" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <h3 className="text-4xl font-black tracking-tighter uppercase italic">Neural Arena Logs</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {(matches || []).filter(m => m).map(m => (
                                <div key={m?.id} className="bg-[#0C0C0C] border border-white/5 rounded-[32px] p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-8">
                                        <div className="text-center"><p className="text-[8px] font-black uppercase text-white/20">Pool</p><p className="text-lg font-black italic">{m?.currency} {m?.pool?.toLocaleString()}</p></div>
                                        <div className="w-px h-10 bg-white/5" />
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end"><span className="text-[9px] font-black uppercase text-white/40">{m?.senderUsername}</span><span className="text-sm font-black italic">{m?.senderScore}</span></div>
                                            <span className="text-cyber-pink font-black italic">VS</span>
                                            <div className="flex flex-col items-start"><span className="text-[9px] font-black uppercase text-white/40">{m?.receiverUsername}</span><span className="text-sm font-black italic">{m?.receiverScore}</span></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${m?.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>{m?.status}</span>
                                        <p className="text-[8px] font-black uppercase text-white/20">{m?.createdAt?.toDate ? m.createdAt.toDate().toLocaleString() : 'RECENT'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === "deposits" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(deposits || []).filter(d => d).map(dep => (
                            <div key={dep?.id} className="bg-[#0C0C0C] border border-white/5 rounded-[40px] p-8 space-y-6">
                                <div className="flex justify-between items-start"><div className="p-3 bg-cyber-pink/10 rounded-2xl text-cyber-pink"><ArrowDownCircle className="w-6 h-6" /></div> <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${dep.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500 animate-pulse'}`}>{dep.status}</span></div>
                                <div className="space-y-1"><p className="text-[10px] uppercase text-white/20 font-black tracking-widest">Entry Deposit</p><h4 className="text-4xl font-black italic tracking-tighter">RWF {dep.amount?.toLocaleString()}</h4></div>
                                <div className="text-[11px] font-black text-white/40 space-y-1 uppercase italic leading-relaxed"><p>Operator: {dep.fullNames}</p><p className="text-[9px] text-white/10">{dep.userId}</p></div>
                                <div className="flex gap-2">
                                    <button onClick={() => setViewingScreenshot(dep.screenshot)} className="flex-1 py-4 bg-white/5 rounded-2xl text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-white/10 transition-all"><Eye className="w-4 h-4" /> Proof</button>
                                    {dep.status === "pending" && <button onClick={() => approveDeposit(dep)} className="flex-1 py-4 bg-cyber-pink text-white rounded-2xl text-[9px] font-black uppercase hover:scale-105 transition-all shadow-lg">Approve</button>}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === "withdrawals" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(withdrawals || []).filter(w => w).map(w => (
                            <div key={w?.id} className="bg-[#0C0C0C] border border-white/5 rounded-[40px] p-8 space-y-6">
                                <div className="flex justify-between items-start"><div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500"><ArrowUpCircle className="w-6 h-6" /></div> <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${w.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500 animate-pulse'}`}>{w.status}</span></div>
                                <div className="space-y-1"><p className="text-[10px] uppercase text-white/20 font-black tracking-widest">Withdrawal Protocol</p><h4 className="text-4xl font-black italic tracking-tighter">RWF {w.requestedAmount?.toLocaleString()}</h4><p className="text-[9px] text-red-500 font-bold uppercase italic tracking-widest">Fee Log: RWF {w.fee?.toLocaleString()}</p></div>
                                <div className="text-[11px] font-black text-white/40 space-y-1 uppercase italic leading-relaxed"><p>Dispatch To: {w.fullNames}</p><p>{w.phone}</p></div>
                                {w.status === "pending" && <button onClick={() => approveWithdrawal(w)} className="w-full py-5 bg-amber-500 text-black rounded-2xl text-[9px] font-black uppercase hover:scale-105 transition-all shadow-lg">Confirm Liquidation</button>}
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === "earnings" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 text-center py-20 bg-white/[0.02] border border-white/5 rounded-[60px]">
                        <TrendingUp className="w-16 h-16 text-cyber-pink mx-auto mb-6 animate-pulse" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-cyber-pink">Consolidated Network Revenue</h4>
                        <h2 className="text-8xl font-black italic tracking-tighter">RWF {totalEarningsFrw.toLocaleString()}</h2>
                        <button onClick={() => router.push('/earnings')} className="mt-8 px-10 py-5 bg-white text-black rounded-3xl text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-cyber-pink hover:text-white transition-all">Launch Dedicated Revenue Plexus</button>
                    </motion.div>
                )}

                {activeTab === "system" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: "Neural Load", value: "Normal", icon: <Cpu className="w-4 h-4" /> },
                            { label: "Sync Latency", value: "2ms", icon: <Activity className="w-4 h-4" /> },
                            { label: "Escrow Locked", value: "RWF 2.4M", icon: <Lock className="w-4 h-4" /> },
                            { label: "Node Health", value: "Optimal", icon: <Terminal className="w-4 h-4" /> }
                        ].map((stat, i) => (
                            <div key={i} className="bg-[#0C0C0C] border border-white/5 rounded-[32px] p-8 space-y-4">
                                <div className="text-white/20">{stat.icon}</div>
                                <div><p className="text-[10px] uppercase font-black text-white/40 tracking-widest">{stat.label}</p><p className="text-2xl font-black italic">{stat.value}</p></div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === "posts" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-4xl font-black tracking-tighter uppercase italic">Beauty Submissions</h3>
                            <div className="text-[10px] font-black uppercase tracking-widest text-cyber-pink bg-cyber-pink/10 px-4 py-2 rounded-full border border-cyber-pink/20">
                                {posts.filter(p => p.status === 'pending').length} Pending Review
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <div key={post.id} className="group bg-[#0C0C0C] border border-white/5 rounded-[40px] overflow-hidden flex flex-col relative">
                                    {/* Status Badge */}
                                    <div className="absolute top-6 left-6 z-10">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${post.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                post.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                    'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
                                            }`}>
                                            {post.status || 'Pending'}
                                        </span>
                                    </div>

                                    {/* Media Section */}
                                    <div className="aspect-square relative overflow-hidden bg-white/5">
                                        {post.mediaUrl ? (
                                            <img src={post.mediaUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Post" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/10 italic">No Media</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />

                                        <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3">
                                            <img src={post.authorPhoto} className="w-10 h-10 rounded-full border-2 border-white/10" alt="Avatar" />
                                            <div>
                                                <div className="text-sm font-black italic uppercase">@{post.authorUsername}</div>
                                                <div className="text-[8px] text-white/40 font-black uppercase tracking-widest">{post.authorName}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <p className="text-white/60 text-sm italic font-medium leading-relaxed">"{post.content}"</p>
                                        </div>

                                        <div className="flex gap-2 pt-4">
                                            {post.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => rejectPost(post)}
                                                        className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase text-white/40 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => approvePost(post)}
                                                        className="flex-2 py-4 bg-cyber-pink text-white rounded-2xl text-[9px] font-black uppercase shadow-lg shadow-cyber-pink/20 hover:scale-105 active:scale-95 transition-all"
                                                    >
                                                        Approve Beauty
                                                    </button>
                                                </>
                                            )}
                                            {(post.status === 'approved' || post.status === 'rejected') && (
                                                <button
                                                    onClick={() => updateDoc(doc(db, "posts", post.id), { status: 'pending' })}
                                                    className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase text-white/20 hover:text-white transition-all flex items-center justify-center gap-2"
                                                >
                                                    <RefreshCw className="w-3 h-3" /> Re-Evaluate
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* MODALS */}
                <AnimatePresence>
                    {viewingScreenshot && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-12 bg-black/95 backdrop-blur-3xl">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative max-w-4xl max-h-full">
                                <button onClick={() => setViewingScreenshot(null)} className="absolute -top-12 right-0 text-white hover:text-cyber-pink transition-colors uppercase font-black text-xs tracking-widest flex items-center gap-2"><X className="w-4 h-4" /> Close Viewer</button>
                                <img src={viewingScreenshot} className="w-full h-auto rounded-3xl border border-white/10 shadow-2xl" />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {editingUser && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0C0C0C] border border-white/10 rounded-[50px] w-full max-w-2xl p-12 space-y-10">
                                <div className="flex justify-between items-center"><h3 className="text-3xl font-black italic uppercase tracking-tighter">Edit Identity</h3><button onClick={() => setEditingUser(null)} className="p-3 text-white/20 hover:text-white"><X className="w-6 h-6" /></button></div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2"><label className="text-[9px] font-black uppercase text-white/20 px-2 tracking-widest">Neural Balance</label><input value={editFormData.balance} onChange={e => setEditFormData({ ...editFormData, balance: e.target.value })} type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-black italic outline-none focus:border-cyber-pink" /></div>
                                    <div className="space-y-2"><label className="text-[9px] font-black uppercase text-white/20 px-2 tracking-widest">Account Status</label><select value={editFormData.status} onChange={e => setEditFormData({ ...editFormData, status: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[10px] font-black uppercase outline-none focus:border-cyber-pink appearance-none"><option value="active" className="bg-black">Active Protocol</option><option value="suspended" className="bg-black">Suspended Mode</option></select></div>
                                    <div className="col-span-2 space-y-2"><label className="text-[9px] font-black uppercase text-white/20 px-2 tracking-widest">Identity Bio</label><textarea value={editFormData.bio || ""} onChange={e => setEditFormData({ ...editFormData, bio: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[10px] font-black uppercase outline-none focus:border-cyber-pink min-h-[100px]" /></div>
                                </div>
                                <div className="flex gap-4"><button onClick={() => setEditingUser(null)} className="flex-1 py-5 bg-white/5 border border-white/10 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button><button onClick={handleSaveEdit} className="flex-1 py-5 bg-white text-black rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-cyber-pink hover:text-white transition-all shadow-xl">Commit Identity Shift</button></div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
