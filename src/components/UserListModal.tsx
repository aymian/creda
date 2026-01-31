"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, ArrowRight } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, getDocs, doc, getDoc, limit } from "firebase/firestore"
import { useRouter } from "next/navigation"

interface UserListModalProps {
    isOpen: boolean
    onClose: () => void
    type: "followers" | "following"
    userId: string
}

interface ListedUser {
    id: string
    displayName: string
    username: string
    photoURL?: string
    email?: string
}

export function UserListModal({ isOpen, onClose, type, userId }: UserListModalProps) {
    const [users, setUsers] = useState<ListedUser[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchUsers = async () => {
            if (!isOpen || !userId) return
            setLoading(true)
            try {
                // 1. Get IDs from subcollection
                const subcollectionRef = collection(db, "users", userId, type)
                const q = query(subcollectionRef, limit(50)) // Limit for safety
                const snapshot = await getDocs(q)

                if (snapshot.empty) {
                    setUsers([])
                    return
                }

                const userIds = snapshot.docs.map(doc => doc.id)

                // 2. Fetch User Profiles
                // Note: Firestore 'in' query supports max 10 items. Map + Promise.all is better for >10 items if batch fetching isn't complex.
                // For now, let's just fetch individually or use batches if needed. 
                // Given the limit(50), parallel requests are decent or we can just fetch 
                // data if it's stored in the relationship document (denormalization).
                // Assuming standard normalization where we need to fetch profile:

                const userPromises = userIds.map(async (uid) => {
                    const userSnap = await getDoc(doc(db, "users", uid))
                    if (userSnap.exists()) {
                        const data = userSnap.data()
                        return {
                            id: userSnap.id,
                            displayName: data.displayName || data.username || data.email || "User",
                            username: data.username ? `@${data.username}` : (data.email || "User"),
                            photoURL: data.photoURL,
                            email: data.email
                        } as ListedUser
                    }
                    return null
                })

                const resolvedUsers = (await Promise.all(userPromises)).filter((u): u is ListedUser => u !== null)
                setUsers(resolvedUsers)

            } catch (error) {
                console.error(`Error fetching ${type}:`, error)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [isOpen, userId, type])

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-black uppercase tracking-wider text-white">
                                {type}
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-white/40" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {loading ? (
                                <div className="flex items-center justify-center h-40">
                                    <Loader2 className="w-8 h-8 text-cyber-pink animate-spin" />
                                </div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-10 text-white/20">
                                    <p className="text-sm font-bold">No {type} yet</p>
                                </div>
                            ) : (
                                users.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => {
                                            onClose()
                                            router.push(`/${user.username}`)
                                        }}
                                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 cursor-pointer group transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                                                {user.photoURL ? (
                                                    <img src={user.photoURL} alt={user.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/20 font-black text-xs">
                                                        {user.username[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white group-hover:text-cyber-pink transition-colors">
                                                    {user.displayName}
                                                </h4>
                                                <p className="text-xs text-white/40">{user.username}</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-white/20 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
