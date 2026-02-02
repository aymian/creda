"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, Loader2, Crown, X } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot, limit, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
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
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50))

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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyber-pink animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center p-6 sm:p-12 lg:p-24 overflow-hidden relative">
                {/* Background Glows */}
                <div className="absolute top-1/4 -left-20 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-cyber-pink/5 rounded-full blur-[100px] md:blur-[140px] pointer-events-none" />
                <div className="absolute bottom-1/4 -right-20 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-900/10 rounded-full blur-[100px] md:blur-[140px] pointer-events-none" />

                <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-left"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyber-pink/20 to-cyber-pink/10 border border-cyber-pink/20 mb-8"
                        >
                            <Star className="w-3.5 h-3.5 text-cyber-pink fill-cyber-pink" />
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-cyber-pink">
                                The future belongs to you
                            </span>
                        </motion.div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-7xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter mb-8">
                            READY TO <span className="text-cyber-pink italic">UNLEASH</span> <br />
                            YOUR FULL POTENTIAL?
                        </h1>

                        {/* Subtext */}
                        <p className="text-lg sm:text-xl text-white/40 font-medium max-w-xl mb-12 italic leading-relaxed">
                            Join <span className="text-white/80 font-bold">120,000+ top-tier creators</span> who have seen a <span className="text-white font-bold underline decoration-cyber-pink underline-offset-4">400% engagement increase</span> within their first month on Creda.
                        </p>

                        {/* CTA Section */}
                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            <Link href="/login">
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255, 45, 108, 0.4)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group relative flex items-center gap-3 px-10 py-5 bg-cyber-pink rounded-full text-white font-black text-lg transition-all shadow-[0_0_20px_rgba(255,45,108,0.2)]"
                                >
                                    Start Streaming Now
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </Link>

                            {/* Social Proof */}
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0C0C0C] bg-white/10 overflow-hidden shadow-lg">
                                            <img
                                                src={`https://i.pravatar.cc/100?u=creda${i}`}
                                                alt="User avatar"
                                                className="w-full h-full object-cover grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-sm font-bold text-white/30 lowercase tracking-tight">
                                    Trusted by the best
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sleek Image Cards on the Right - Refined to match image */}
                    <div className="relative h-[600px] hidden lg:flex items-center justify-center">
                        {/* Central Card (Top) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02, zIndex: 40 }}
                            transition={{ duration: 0.4 }}
                            className="absolute z-30 w-[300px] aspect-[9/16] rounded-[2.5rem] overflow-hidden border border-white/20 shadow-[0_30px_100px_rgba(0,0,0,0.8)] group bg-[#121212] cursor-pointer"
                        >
                            <img src="/images/1.png" className="w-full h-full object-cover" alt="Display 1" />
                            {/* Card Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute top-4 inset-x-6 h-1 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full w-2/3 bg-white rounded-full" />
                            </div>
                            <div className="absolute bottom-6 left-6 right-6 h-8 border-2 border-white/40 rounded-full" />
                            <Heart className="absolute bottom-6 right-8 w-6 h-6 text-white" />
                        </motion.div>

                        {/* Left Tilted Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 50, rotate: 0 }}
                            animate={{ opacity: 1, x: -140, rotate: -12 }}
                            whileHover={{
                                x: -160,
                                rotate: -5,
                                scale: 1.1,
                                zIndex: 50,
                                transition: { duration: 0.3 }
                            }}
                            className="absolute z-20 w-[260px] aspect-[9/16] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] group bg-[#121212] cursor-pointer"
                        >
                            <img src="/images/2.png" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300" alt="Display 2" />
                            <div className="absolute bottom-6 left-6 right-16 h-6 border-[1.5px] border-white/20 rounded-full" />
                        </motion.div>

                        {/* Right Tilted Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -50, rotate: 0 }}
                            animate={{ opacity: 1, x: 140, rotate: 12 }}
                            whileHover={{
                                x: 160,
                                rotate: 5,
                                scale: 1.1,
                                zIndex: 50,
                                transition: { duration: 0.3 }
                            }}
                            className="absolute z-10 w-[260px] aspect-[9/16] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] group bg-[#121212] cursor-pointer"
                        >
                            <img src="/images/3.png" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300" alt="Display 3" />
                            <div className="absolute bottom-6 left-6 right-16 h-6 border-[1.5px] border-white/20 rounded-full" />
                        </motion.div>

                        {/* Decorative Floating Elements */}
                        {/* Emoji Bubble */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-10 left-[10%] z-50 bg-white shadow-2xl rounded-2xl px-3 py-2 flex items-center gap-1 border border-white/20 scale-110"
                        >
                            <span className="text-xl">🔮</span>
                            <span className="text-xl">👀</span>
                            <span className="text-xl">👺</span>
                            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white rotate-45" />
                        </motion.div>

                        {/* Floating Heart */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute left-[-20%] bottom-[30%] z-40"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-cyber-pink to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(255,45,108,0.4)] rotate-[-15deg]">
                                <Heart className="w-8 h-8 text-white fill-white" />
                            </div>
                        </motion.div>

                        {/* Star Badge */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute right-[-10%] top-[20%] z-50 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center border-4 border-[#0C0C0C] shadow-lg"
                        >
                            <Star className="w-6 h-6 text-white fill-white" />
                        </motion.div>

                        {/* Profile Badge */}
                        <div className="absolute right-[5%] bottom-[20%] z-50 w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-cyber-pink to-purple-600 shadow-xl">
                            <div className="w-full h-full rounded-full border-2 border-[#0C0C0C] bg-white/20 overflow-hidden">
                                <img src="https://i.pravatar.cc/100?u=premium" className="w-full h-full object-cover" alt="Profile" />
                            </div>
                        </div>

                        {/* Background Pulsing Glow */}
                        <div className="absolute w-[120%] h-[120%] bg-cyber-pink/5 rounded-full blur-[100px] -z-10 animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0C0C0C] pb-20 pt-8 relative">
            <Suspense fallback={null}>
                <PremiumWelcomeHandler setShowPremiumWelcome={setShowPremiumWelcome} />
            </Suspense>
            <AnimatePresence>
                {showPremiumWelcome && (
                    <motion.div
                        initial={{ opacity: 0, y: -100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-xl px-4"
                    >
                        <div className="bg-gradient-to-r from-cyber-pink to-purple-600 p-[1px] rounded-3xl shadow-[0_0_50px_rgba(255,45,108,0.3)]">
                            <div className="bg-[#0C0C0C] rounded-[calc(1.5rem-1px)] p-6 flex items-center justify-between gap-6 overflow-hidden relative">
                                {/* Decor */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-pink/20 rounded-full blur-3xl -z-10" />

                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-cyber-pink/10 rounded-2xl flex items-center justify-center border border-cyber-pink/20">
                                        <Crown className="w-8 h-8 text-cyber-pink drop-shadow-[0_0_10px_rgba(255,45,108,0.5)]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">Welcome, VIP Agent!</h3>
                                        <p className="text-white/60 font-bold text-sm italic">You are now a premium member.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPremiumWelcome(false)}
                                    className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/20 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Feed Tabs */}
            <div className="lg:hidden sticky top-20 z-40 bg-[#0C0C0C]/80 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-center gap-8 h-14 mb-8">
                {['foryou', 'following'].map((tab) => (
                    <button
                        key={tab}
                        className={cn(
                            "text-[11px] font-black uppercase tracking-[0.2em] relative transition-colors",
                            tab === 'foryou' ? "text-white" : "text-white/40"
                        )}
                    >
                        {tab === 'foryou' ? 'For You' : 'Following'}
                        {tab === 'foryou' && (
                            <motion.div
                                layoutId="mobile-tab-underline"
                                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-cyber-pink rounded-full"
                            />
                        )}
                    </button>
                ))}
            </div>

            <div className="max-w-[1800px] mx-auto px-4 md:px-12 space-y-6 md:space-y-12">

                {/* Empty State */}
                {posts.length === 0 && !loading && (
                    <div className="text-center py-20 text-white/40">
                        <p className="text-xl font-bold mb-4">No posts yet</p>
                        <p className="text-sm">Be the first to share something in the universe!</p>
                        <Link href="/create">
                            <button className="mt-6 px-8 py-3 bg-white/10 rounded-full font-bold text-white hover:bg-white/20 transition-all">
                                Create Post
                            </button>
                        </Link>
                    </div>
                )}

                {/* Feed Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mx-auto">
                    <AnimatePresence>
                        {posts.map((post) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative aspect-[9/16] bg-[#121212] rounded-3xl overflow-hidden group border border-white/5 hover:border-white/20 transition-all shadow-2xl"
                            >
                                {/* Media Layer */}
                                <div className="absolute inset-0 z-0">
                                    {post.mediaUrl ? (
                                        <>
                                            {post.mediaType === 'video' ? (
                                                <FeedVideoPlayer
                                                    src={post.mediaUrl || ''}
                                                    poster={post.mediaUrl?.replace(/\.[^/.]+$/, ".jpg")}
                                                    autoPlayOnHover={true}
                                                    minimal={true}
                                                />
                                            ) : (
                                                <img
                                                    src={post.mediaUrl?.includes('res.cloudinary.com')
                                                        ? post.mediaUrl.replace('/upload/', '/upload/w_600,c_fill,q_auto,f_auto/')
                                                        : post.mediaUrl
                                                    }
                                                    alt="Post media"
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-cyber-pink/20 to-purple-900/40">
                                            <p className="text-lg font-black text-center text-white italic opacity-40">
                                                "{post.content}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Top Overlay: Views */}
                                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                                    <Play className="w-3 h-3 text-white fill-white" />
                                    <span className="text-[11px] font-black text-white">
                                        {Math.floor(Math.random() * 50) + 1}
                                    </span>
                                </div>

                                {/* Bottom Overlay: Points (Removed as per request) */}
                                <div className="absolute bottom-0 inset-x-0 z-20 p-3 pt-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
