"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LogOut, X, AlertTriangle } from "lucide-react"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

export function LogoutModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only trigger if not in an input or textarea
            if (e.key.toLowerCase() === 'l' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                e.preventDefault()
                setIsOpen(true)
            }
            if (e.key === 'Escape') {
                setIsOpen(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await auth.signOut()
            setIsOpen(false)
            router.push('/login')
        } catch (error) {
            console.error("Logout error:", error)
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-[#121212] border border-white/10 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-pink/10 blur-[50px] -z-10" />

                        <div className="flex flex-col items-center text-center space-y-6">
                            {/* Icon */}
                            <div className="w-20 h-20 rounded-3xl bg-cyber-pink/10 flex items-center justify-center border border-cyber-pink/20 shadow-[0_0_30px_rgba(255,45,108,0.1)]">
                                <LogOut className="w-8 h-8 text-cyber-pink" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-black uppercase tracking-tight italic">Terminate Session?</h2>
                                <p className="text-sm font-bold text-white/40 leading-relaxed px-4">
                                    Are you sure you want to log out? You will need to re-authorize to access your comms.
                                </p>
                            </div>

                            <div className="w-full grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest border border-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="py-4 rounded-2xl bg-cyber-pink text-white text-xs font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(255,45,108,0.3)] hover:scale-105 transition-all disabled:opacity-50"
                                >
                                    {isLoggingOut ? "Processing..." : "Logout"}
                                </button>
                            </div>
                        </div>

                        {/* Secret Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-xl text-white/20 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
