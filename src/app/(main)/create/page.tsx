"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    X,
    Image as ImageIcon,
    Smile,
    MapPin,
    AlignLeft,
    ChevronRight,
    MoreHorizontal
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { uploadToCloudinary } from "@/lib/cloudinary"

type CreateType = 'story' | 'post' | 'thread' | 'live' | 'lice' // 'lice' mapped to generic/clip if found

export default function CreatePage() {
    return (
        <React.Suspense fallback={
            <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-pink" />
            </div>
        }>
            <CreateContent />
        </React.Suspense>
    )
}

function CreateContent() {
    const router = useRouter()
    const { user } = useAuth()
    const [content, setContent] = useState("")
    const [isPosting, setIsPosting] = useState(false)
    const [media, setMedia] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setMedia(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const removeMedia = () => {
        setMedia(null)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handlePost = async () => {
        if (!content && !media) return
        setIsPosting(true)
        try {
            let mediaUrl = null
            let mediaType = null

            if (media) {
                const uploadResult = await uploadToCloudinary(media, "posts")
                if (uploadResult.success) {
                    mediaUrl = uploadResult.url
                    mediaType = uploadResult.resourceType === "video" ? "video" : "image"
                }
            }

            await addDoc(collection(db, "posts"), {
                content,
                mediaUrl,
                mediaType,
                authorId: user?.uid,
                authorName: user?.displayName || user?.email?.split('@')[0] || "User",
                authorPhoto: user?.photoURL,
                authorUsername: user?.email?.split('@')[0] || "user",
                likes: [],
                comments: 0,
                createdAt: serverTimestamp(),
                type: 'thread',
                status: 'pending'
            })

            router.push("/")
        } catch (error) {
            console.error("Error creating post:", error)
        } finally {
            setIsPosting(false)
        }
    }

    return (
        <div className="min-h-screen bg-black sm:bg-[#0C0C0C] text-white flex flex-col items-center sm:pt-10">
            {/* Modal Container */}
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[620px] bg-[#121212] sm:rounded-3xl border border-white/[0.05] flex flex-col min-h-screen sm:min-h-0 sm:max-h-[85vh] overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.03]">
                    <button 
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-[17px] font-bold tracking-tight">New thread</h2>
                    <div className="flex items-center gap-1">
                        <button className="p-2 hover:bg-white/5 rounded-full transition-colors opacity-80">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="5" />
                                <path d="M8 3v18" />
                            </svg>
                        </button>
                        <button className="p-2 hover:bg-white/5 rounded-full transition-colors opacity-80">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                    <div className="flex gap-4">
                        {/* Left column (Avatar + Thread line) */}
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden ring-1 ring-white/10">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-semibold text-sm">
                                        {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="w-[2px] flex-1 bg-white/[0.1] my-2 rounded-full" />
                            <div className="relative w-10 flex justify-center">
                                <div className="w-5 h-5 rounded-full bg-zinc-800 overflow-hidden opacity-30 blur-[0.3px]">
                                    {user?.photoURL ? (
                                        <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-700" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right column (Input + Controls) */}
                        <div className="flex-1 space-y-0.5">
                            <div className="flex items-center gap-1 mb-1">
                                <span className="font-bold text-[15px] cursor-pointer">
                                    {user?.email?.split('@')[0] || "user"}
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                                <button className="text-[14px] text-white/30 font-medium hover:text-white/40 transition-colors">Add a topic</button>
                            </div>
                            
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What's new?"
                                className="w-full bg-transparent text-[15px] text-[#F3F5F7] placeholder:text-[#777777] outline-none resize-none min-h-[40px] font-normal leading-relaxed mb-2"
                                autoFocus
                            />

                            {/* Image/Media Preview */}
                            <AnimatePresence>
                                {previewUrl && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="relative mt-2 rounded-xl overflow-hidden border border-white/10 group"
                                    >
                                        <button
                                            onClick={removeMedia}
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all z-10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <img src={previewUrl} alt="Preview" className="w-full max-h-[400px] object-cover" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Toolbar Buttons */}
                            <div className="flex items-center gap-0.5 py-1 -ml-2">
                                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-white/40 hover:text-white transition-colors" title="Media"><ImageIcon className="w-5 h-5" /></button>
                                <button className="p-2 text-white/40 hover:text-white transition-colors" title="GIF">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h10"/></svg>
                                </button>
                                <button className="p-2 text-white/40 hover:text-white transition-colors" title="Emoji"><Smile className="w-5 h-5" /></button>
                                <button className="p-2 text-white/40 hover:text-white transition-colors" title="Alignment"><AlignLeft className="w-5 h-5" /></button>
                                <button className="p-2 text-white/40 hover:text-white transition-colors" title="Poll">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                                </button>
                                <button className="p-2 text-white/40 hover:text-white transition-colors" title="Location"><MapPin className="w-5 h-5" /></button>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />

                            <div className="pt-1">
                                <button className="text-[14px] text-white/30 font-medium hover:text-white/40 transition-colors">
                                    Add to thread
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 sm:px-6 flex items-center justify-between bg-black sm:bg-transparent">
                    <button className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors group">
                        <div className="p-1.5 border border-white/10 rounded-lg group-hover:border-white/20">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        </div>
                        <span className="text-[14px] font-medium">Reply options</span>
                    </button>
                    <button
                        onClick={handlePost}
                        disabled={(!content && !media) || isPosting}
                        className={`px-6 py-2 rounded-full font-bold text-[15px] transition-all
                            ${(!content && !media) || isPosting
                                ? 'bg-[#121212] text-white/20 cursor-not-allowed border border-white/5'
                                : 'bg-white text-black hover:bg-zinc-200'
                            }
                        `}
                    >
                        {isPosting ? 'Posting...' : 'Post'}
                    </button>
                </div>

            </motion.div>
        </div>
    )
}
