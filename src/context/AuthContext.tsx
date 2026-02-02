"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { onIdTokenChanged, User } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, Lock, ShieldAlert } from "lucide-react"

interface AuthContextType {
    user: User | null
    userData: any | null
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [userData, setUserData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, (authUser) => {
            setUser(authUser)

            if (authUser) {
                // Listen to Firestore user doc for status
                const unsubDoc = onSnapshot(doc(db, "users", authUser.uid), (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data())
                    }
                    setLoading(false)
                })
                return () => unsubDoc()
            } else {
                setUserData(null)
                setLoading(false)
            }
        })

        return () => unsubscribe()
    }, [])

    return (
        <AuthContext.Provider value={{ user, userData, loading }}>
            {children}

            {/* Account Suspended Overlay */}
            <AnimatePresence>
                {userData?.status === "suspended" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full max-w-lg bg-[#0C0C0C] border border-red-500/20 rounded-[50px] p-12 text-center space-y-8 shadow-[0_0_100px_rgba(239,68,68,0.1)]"
                        >
                            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/10">
                                <ShieldAlert className="w-12 h-12" />
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Access Terminated</h1>
                                <p className="text-white/40 text-sm leading-relaxed px-4">
                                    Your personal neural identity has been <span className="text-red-500 font-bold uppercase">Suspended</span> by the Central Command.
                                    All arcade access and social interaction protocols are currently locked.
                                </p>
                            </div>

                            <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-6">
                                <p className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-1">Reason for Lock</p>
                                <p className="text-xs font-bold text-white/80 uppercase">Internal Policy Violation / High Entropy Activity detected.</p>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={() => auth.signOut()}
                                    className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all shadow-xl"
                                >
                                    Relinquish Session
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
