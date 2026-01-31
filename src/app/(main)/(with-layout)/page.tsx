"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
    Play,
    Loader2
} from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore"
import Link from "next/link"
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { CustomVideoLayout } from '@/components/player/CustomVideoLayout';

import '@vidstack/react/player/styles/default/theme.css';

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
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

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
            <div className="max-w-xl mx-auto px-4 space-y-6">

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
                            className="bg-black border border-white/10 rounded-[32px] overflow-hidden mb-8"
                        >
                            {/* Header */}
                            <div className="p-4 flex items-center justify-between">
                                <Link href={`/${post.authorUsername}`} className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-cyber-pink to-purple-600">
                                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-black bg-white/10">
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
                                        <h3 className="font-black text-white text-[15px] leading-tight group-hover:text-cyber-pink transition-colors">
                                            {post.authorName}
                                        </h3>
                                        <p className="text-white/40 text-xs font-medium">@{post.authorUsername}</p>
                                    </div>
                                </Link>
                                <button className="p-2 text-white/20 hover:text-white transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Media */}
                            {post.mediaUrl && (
                                <div className="w-full bg-black/50 overflow-hidden">
                                    {post.mediaType === 'video' ? (
                                        <div className="relative aspect-square vidstack-player-wrapper">
                                            <MediaPlayer
                                                title={post.content || "Post Video"}
                                                src={post.mediaUrl}
                                                className="w-full h-full object-cover"
                                                aspectRatio="1/1"
                                                load="visible"
                                                poster={`${post.mediaUrl}?tr=w-800,h-800,so-0`}
                                            >
                                                <MediaProvider />
                                                <CustomVideoLayout />
                                            </MediaPlayer>
                                        </div>
                                    ) : (
                                        <img
                                            src={post.mediaUrl}
                                            alt="Post media"
                                            className="w-full object-cover"
                                            loading="lazy"
                                        />
                                    )}
                                </div>
                            )}

                            {/* Footer / Actions */}
                            <div className="p-4 pt-3">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-5">
                                        <button className="text-white hover:text-cyber-pink transition-colors">
                                            <Heart className="w-7 h-7 stroke-[1.5px]" />
                                        </button>
                                        <button className="text-white hover:text-cyber-cyan transition-colors">
                                            <MessageCircle className="w-7 h-7 stroke-[1.5px]" />
                                        </button>
                                        <button className="text-white hover:text-green-400 transition-colors">
                                            <Share2 className="w-7 h-7 stroke-[1.5px]" />
                                        </button>
                                    </div>
                                </div>

                                {/* Likes */}
                                <div className="font-black text-white text-sm mb-2">
                                    {(post.likes?.length || 0).toLocaleString()} likes
                                </div>

                                {/* Caption */}
                                <div className="space-y-1">
                                    <div className="text-[15px] leading-snug">
                                        <Link href={`/${post.authorUsername}`} className="font-black text-white mr-2 hover:underline">
                                            {post.authorUsername}
                                        </Link>
                                        <span className="text-white/90 font-medium">
                                            {post.content}
                                        </span>
                                    </div>
                                </div>

                                {/* Comments Count / View all */}
                                {post.comments > 0 && (
                                    <button className="text-white/40 text-sm mt-2 font-medium hover:text-white transition-colors">
                                        View all {post.comments} comments
                                    </button>
                                )}

                                {/* Timestamp */}
                                <div className="text-white/30 text-[10px] uppercase font-bold tracking-widest mt-2">
                                    {post.createdAt?.toDate ? timeAgo(post.createdAt.toDate()) : 'JUST NOW'}
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
