"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, Loader2, Crown, X, Check, Plus } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot, limit, doc, updateDoc, arrayUnion, arrayRemove, where } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import nextDynamic from 'next/dynamic'
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { ArrowRight, Star } from "lucide-react"

// Force dynamic rendering to skip static generation for this personalized feed page
export const dynamic = "force-dynamic";

// Dynamically import the player component to avoid SSR issues with ReactPlayer
const FeedVideoPlayer = nextDynamic(() => import('@/components/player/FeedVideoPlayer').then(mod => mod.FeedVideoPlayer), { ssr: false });

interface Post {
    id: string
    content: string
    mediaUrl?: string
    mediaType?: string
    authorId: string
    authorName: string
    authorUsername: string
    authorPhoto?: string
    likes: string[]
    comments: number
    createdAt: any
}


import { Suspense } from "react"

function PremiumWelcomeHandler({ setShowPremiumWelcome }: { setShowPremiumWelcome: (show: boolean) => void }) {
    const searchParams = useSearchParams()

    useEffect(() => {
        if (searchParams.get('premium') === 'success') {
            setShowPremiumWelcome(true)
            const timer = setTimeout(() => setShowPremiumWelcome(false), 8000)
            return () => clearTimeout(timer)
        }
    }, [searchParams, setShowPremiumWelcome])

    return null
}

export default function Home() {
    const { user } = useAuth()
    // searchParams removed from here
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [showPremiumWelcome, setShowPremiumWelcome] = useState(false)

    // Effect removed

    const handleLike = async (postId: string, currentLikes: string[]) => {
        if (!user) return;

        const postRef = doc(db, "posts", postId);
        const isLiked = currentLikes.includes(user.uid);

        try {
            if (isLiked) {
                await updateDoc(postRef, {
                    likes: arrayRemove(user.uid)
                });
            } else {
                await updateDoc(postRef, {
                    likes: arrayUnion(user.uid)
                });
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    // Helper for time formatting
    const timeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
        let interval = seconds / 31536000
        if (interval > 1) return Math.floor(interval) + "y ago"
        interval = seconds / 2592000
        if (interval > 1) return Math.floor(interval) + "mo ago"
        interval = seconds / 86400
        if (interval > 1) return Math.floor(interval) + "d ago"
        interval = seconds / 3600
        if (interval > 1) return Math.floor(interval) + "h ago"
        interval = seconds / 60
        if (interval > 1) return Math.floor(interval) + "m ago"
        return "Just now"
    }

    useEffect(() => {
        const q = query(
            collection(db, "posts"),
            where("status", "==", "approved"),
            orderBy("createdAt", "desc"),
            limit(50)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Post[]
            setPosts(fetchedPosts)
            setLoading(false)
        }, (error) => {
            console.error("Error fetching posts:", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const [activeIndex, setActiveIndex] = useState(0)

    const nextCard = () => {
        if (activeIndex < posts.length - 1) {
            setActiveIndex(prev => prev + 1)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyber-pink animate-spin opacity-20" />
            </div>
        )
    }

    // Handle empty state
    if (posts.length === 0 && !loading) {
        return (
            <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/5">
                    <Star className="w-10 h-10 text-white/10" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Universe is Quiet</h3>
                <p className="text-white/40 max-w-xs font-medium italic">No beautiful moments found yet. Be the first to spark the flame.</p>
                <Link href="/create">
                    <button className="mt-8 px-10 py-4 bg-cyber-pink text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_40px_rgba(255,45,108,0.2)]">
                        Create Submission
                    </button>
                </Link>
            </div>
        )
    }

    const currentPost = posts[activeIndex]

    return (
        <div className="fixed inset-0 bg-[#080808] flex flex-col items-center justify-center overflow-hidden">
            <Suspense fallback={null}>
                <PremiumWelcomeHandler setShowPremiumWelcome={setShowPremiumWelcome} />
            </Suspense>

            {/* Header Area (Minimal) */}
            <div className="absolute top-0 inset-x-0 h-20 px-6 flex items-center justify-between z-50">
                <div className="w-10" /> {/* Spacer */}
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyber-pink shadow-[0_0_8px_#FF2D6C]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Discover</span>
                </div>
                <Link href="/create">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
                        <Plus className="w-5 h-5 text-white/60" />
                    </div>
                </Link>
            </div>

            {/* Main UX Card Container */}
            <div className="relative w-full max-w-md h-[75vh] flex items-center justify-center px-4">
                <AnimatePresence mode="wait">
                    {currentPost && (
                        <motion.div
                            key={currentPost.id}
                            initial={{ scale: 0.9, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ x: -100, rotate: -10, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full h-full bg-[#111111] rounded-[28px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/5 group"
                        >
                            {/* Full-Bleed Media (Emotional Trigger) */}
                            <div className="absolute inset-0 z-0">
                                {currentPost.mediaUrl ? (
                                    <div className="w-full h-full bg-[#000]">
                                        {currentPost.mediaType === 'video' ? (
                                            <FeedVideoPlayer
                                                src={currentPost.mediaUrl}
                                                poster={currentPost.mediaUrl.replace(/\.[^/.]+$/, ".jpg")}
                                                autoPlayOnHover={false}
                                                minimal={true}
                                            />
                                        ) : (
                                            <img
                                                src={currentPost.mediaUrl}
                                                alt="Visual Identity"
                                                className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#121212] to-[#0A0A0A] flex items-center justify-center p-12">
                                        <p className="text-2xl font-black text-center text-white/20 italic italic leading-tight">
                                            "{currentPost.content}"
                                        </p>
                                    </div>
                                )}

                                {/* Gradient for Visibility */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 z-10" />
                            </div>

                            {/* Trust Indicator - Top Right */}
                            <div className="absolute top-6 right-6 z-30">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="px-3 py-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-1.5"
                                >
                                    <Crown className="w-3 h-3 text-yellow-400" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Elite</span>
                                </motion.div>
                            </div>

                            {/* Identity Strip (Bottom Overlay) */}
                            <div className="absolute bottom-0 inset-x-0 z-20 p-8 pb-10">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-1"
                                >
                                    <Link href={`/${currentPost.authorUsername}`} className="group/author inline-block">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic group-hover/author:text-cyber-pink transition-colors">
                                                {currentPost.authorName}
                                            </h2>
                                            <div className="w-5 h-5 bg-cyber-cyan rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,238,255,0.4)]">
                                                <Check className="w-3 h-3 text-black" strokeWidth={4} />
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Verified Agent</span>
                                        <span className="w-1 h-1 rounded-full bg-white/20" />
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">{currentPost.createdAt?.toDate ? timeAgo(currentPost.createdAt.toDate()) : 'Online Now'}</span>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Action Buttons (Thumb Zone) */}
            <div className="mt-8 flex items-center gap-6 z-50">
                {/* Skip / Pass */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextCard}
                    className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:border-white/20 transition-all shadow-xl backdrop-blur-md"
                >
                    <X className="w-8 h-8" />
                </motion.button>

                {/* HEART / LIKE (Primary Action) */}
                <motion.button
                    whileHover={{ scale: 1.15, boxShadow: "0 0 40px rgba(255, 45, 108, 0.4)" }}
                    whileTap={{ scale: 0.8, rotate: -15 }}
                    onClick={() => {
                        handleLike(currentPost.id, currentPost.likes || [])
                        // Soft pulse feedback is handled by framer animation
                        setTimeout(nextCard, 500)
                    }}
                    className={cn(
                        "w-22 h-22 rounded-full flex items-center justify-center transition-all bg-cyber-pink shadow-[0_20px_40px_rgba(255,45,108,0.3)] group relative overflow-hidden"
                    )}
                >
                    <Heart className="w-10 h-10 text-white fill-white" />
                    {/* Visual Pulse Effect */}
                    <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-150 transition-transform duration-500 rounded-full" />
                </motion.button>

                {/* MESSAGE / CHAT */}
                <Link href={`/${currentPost?.authorUsername}`}>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white hover:border-white/20 transition-all shadow-xl backdrop-blur-md"
                    >
                        <MessageCircle className="w-8 h-8" />
                    </motion.button>
                </Link>
            </div>

            {/* Minimal Scroll Indicator */}
            <div className="absolute bottom-8 flex flex-col items-center gap-2 opacity-20">
                <div className="w-px h-8 bg-gradient-to-b from-white to-transparent" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Next Submission</span>
            </div>
        </div>
    )
}
