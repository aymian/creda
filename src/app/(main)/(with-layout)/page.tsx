"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, Loader2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot, limit, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import dynamic from 'next/dynamic'
import { cn } from "@/lib/utils"

// Dynamically import the player component to avoid SSR issues with ReactPlayer
const FeedVideoPlayer = dynamic(() => import('@/components/player/FeedVideoPlayer').then(mod => mod.FeedVideoPlayer), { ssr: false });

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

export default function Home() {
    const { user } = useAuth()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

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

    return (
        <div className="min-h-screen bg-[#0C0C0C] pb-20 pt-8">
            <div className="max-w-[1800px] mx-auto px-4 md:px-12 space-y-12">

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
