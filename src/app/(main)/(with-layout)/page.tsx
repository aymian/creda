"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, Loader2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot, limit, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import dynamic from 'next/dynamic'

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
            <div className="max-w-md mx-auto px-4 space-y-8">

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

                {/* Feed */}
                <AnimatePresence>
                    {posts.map((post) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#121212] rounded-[40px] overflow-hidden mb-10 shadow-2xl border border-white/5"
                        >
                            {/* Header */}
                            <div className="p-5 flex items-center justify-between">
                                <Link href={`/${post.authorUsername || 'user'}`} className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-cyber-pink to-purple-600">
                                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#121212] bg-white/10">
                                            {post.authorPhoto ? (
                                                <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-black text-white text-xs font-black">
                                                    {post.authorName?.[0] || 'U'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white text-[16px] leading-tight hover:text-cyber-pink transition-colors">
                                            {post.authorName || post.authorUsername || 'Anonymous'}
                                        </h3>
                                        <p className="text-white/40 text-xs font-bold tracking-tight">@{post.authorUsername?.toLowerCase() || 'user'}</p>
                                    </div>
                                </Link>
                                <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/20" />
                            </div>

                            {/* Media Section with Content Overlay */}
                            <div className="relative w-full aspect-[4/5] bg-black overflow-hidden group">
                                {post.mediaUrl ? (
                                    <>
                                        {post.mediaType === 'video' ? (
                                            <FeedVideoPlayer
                                                src={post.mediaUrl || ''}
                                                poster={post.mediaUrl?.replace(/\.[^/.]+$/, ".jpg")}
                                            />
                                        ) : (
                                            <img
                                                src={post.mediaUrl?.includes('res.cloudinary.com')
                                                    ? post.mediaUrl.replace('/upload/', '/upload/w_800,c_fill,q_auto,f_auto/')
                                                    : post.mediaUrl
                                                }
                                                alt="Post media"
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        )}
                                        {/* Content Overlay - matches reference style */}
                                        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                                            <p className="text-xl font-black text-white leading-tight drop-shadow-lg">
                                                {post.content}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full aspect-video flex items-center justify-center p-8 bg-gradient-to-br from-cyber-pink/20 to-purple-900/40">
                                        <p className="text-2xl font-black text-center text-white italic">
                                            "{post.content}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer / Actions */}
                            <div className="px-6 py-5">
                                <div className="flex items-center gap-6 mb-4">
                                    <button
                                        onClick={() => handleLike(post.id, post.likes || [])}
                                        className={`transition-all active:scale-75 ${user && post.likes?.includes(user.uid)
                                                ? 'text-cyber-pink drop-shadow-[0_0_8px_rgba(255,45,108,0.5)]'
                                                : 'text-white hover:text-white/80'
                                            }`}
                                    >
                                        <Heart
                                            className={`w-7 h-7 stroke-[2px] ${user && post.likes?.includes(user.uid) ? 'fill-cyber-pink' : 'fill-transparent'
                                                }`}
                                        />
                                    </button>
                                    <button className="text-white transition-transform active:scale-90">
                                        <MessageCircle className="w-7 h-7 stroke-[1.5px]" />
                                    </button>
                                    <button className="text-white transition-transform active:scale-90">
                                        <Share2 className="w-7 h-7 stroke-[1.5px]" />
                                    </button>
                                </div>

                                {/* Stats & Caption Style */}
                                <div className="space-y-1">
                                    <div className="font-extrabold text-[15px] text-white">
                                        {(post.likes?.length || 0).toLocaleString()} likes
                                    </div>
                                    <div className="text-[14px]">
                                        <span className="font-black text-white mr-2">@{post.authorUsername?.toLowerCase() || 'user'}</span>
                                        <span className="text-white/60 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                            {(post.content || "").length > 50 ? post.content.substring(0, 50) + "..." : post.content}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between">
                                    <div className="text-white/20 text-[10px] uppercase font-bold tracking-[0.2em]">
                                        {post.createdAt?.toDate ? timeAgo(post.createdAt.toDate()) : 'JUST NOW'}
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                                </div>
                            </div>
                        </motion.div>
                    ))
                    }
                </AnimatePresence >
            </div >
        </div >
    )
}
