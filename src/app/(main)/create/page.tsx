"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    X,
    ArrowLeft,
    Image as ImageIcon,
    Smile,
    MapPin,
    Hash,
    AlignLeft,
    Video,
    Film,
    Radio,
    Sparkles,
    Send,
    Plus,
    Camera,
    Mic,
    MoreHorizontal
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Header } from "@/components/header"
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
    const searchParams = useSearchParams()
    const { user } = useAuth()

    // Default to 'post' if type param is missing or invalid
    const typeParam = searchParams.get('type')
    const [activeType, setActiveType] = useState<CreateType>(
        (typeParam as CreateType) || 'post'
    )

    const [content, setContent] = useState("")
    const [media, setMedia] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isPosting, setIsPosting] = useState(false)
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

    // Sync URL with state
    const handleTypeChange = (newType: CreateType) => {
        setActiveType(newType)
        router.push(`/create?type=${newType}`)
    }

    const handleShare = async () => {
        if ((!content && !media) || isPosting || !user) return

        setIsPosting(true)
        try {
            let mediaUrl = null
            let mediaType = null

            // Upload media
            if (media) {
                const uploadResult = await uploadToCloudinary(media, "posts")

                if (!uploadResult.success) {
                    throw new Error(uploadResult.error || "Upload failed")
                }

                mediaUrl = uploadResult.url
                mediaType = uploadResult.resourceType === "video" ? "video" : "image"
            }

            // Save to Firestore
            await addDoc(collection(db, "posts"), {
                content,
                mediaUrl,
                mediaType,
                authorId: user.uid,
                authorName: user.displayName || user.email?.split('@')[0] || "User",
                authorPhoto: user.photoURL,
                authorUsername: user.email?.split('@')[0] || "user", // minimal fallback
                likes: [],
                comments: 0,
                createdAt: serverTimestamp(),
                type: activeType
            })

            router.push("/")

        } catch (error: any) {
            console.error("Error creating post:", error)
            // Show more detailed error if available
            alert(`Failed to post: ${error.message || "Unknown error"}`)
        } finally {
            setIsPosting(false)
        }
    }

    const creationTypes = [
        { id: 'story', label: 'Story', icon: Sparkles, color: 'text-yellow-400' },
        { id: 'post', label: 'Post', icon: ImageIcon, color: 'text-cyber-cyan' },
        { id: 'thread', label: 'Thread', icon: AlignLeft, color: 'text-white' },
        { id: 'live', label: 'Live', icon: Radio, color: 'text-red-500' },
        { id: 'lice', label: 'Lice', icon: Film, color: 'text-purple-500' } // Keeping 'Lice' as requested, likely means 'Slice' or just Clips
    ]

    return (
        <div className="min-h-screen bg-[#0C0C0C] text-white flex flex-col items-center">
            <Header />

            {/* Creation Toolbar */}
            <div className="w-full max-w-2xl flex items-center justify-between p-4 pt-20 border-b border-white/10 bg-[#0C0C0C] sticky top-0 z-40">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-black uppercase tracking-widest hidden sm:block">
                    New {creationTypes.find(t => t.id === activeType)?.label}
                </h1>
                <button
                    onClick={handleShare}
                    disabled={(!content && !media && activeType !== 'live') || isPosting}
                    className={`px-6 py-2 rounded-full font-black text-sm uppercase tracking-wider transition-all flex items-center gap-2
                        ${(!content && !media && activeType !== 'live') || isPosting
                            ? 'bg-white/5 text-white/20 cursor-not-allowed'
                            : 'bg-cyber-pink text-white hover:scale-105 shadow-[0_0_20px_rgba(255,45,108,0.3)]'
                        }
                    `}
                >
                    {isPosting ? 'Posting...' : (activeType === 'live' ? 'Go Live' : 'Share')}
                </button>
            </div>

            {/* Type Selector (Bottom on mobile, top on desktop usually, but let's stick to centralized or bottom for creation) */}
            {/* Let's put it below header for easy access */}
            <div className="w-full max-w-2xl overflow-x-auto no-scrollbar py-4 border-b border-white/5 bg-[#0C0C0C]">
                <div className="flex items-center justify-start sm:justify-center gap-2 px-4 min-w-max">
                    {creationTypes.map((type) => {
                        const Icon = type.icon
                        const isActive = activeType === type.id
                        return (
                            <button
                                key={type.id}
                                onClick={() => handleTypeChange(type.id as CreateType)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 relative overflow-hidden group
                                    ${isActive ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}
                                `}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? type.color : ''} transition-colors`} />
                                <span className="font-bold text-sm tracking-wide">{type.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 border-2 border-white/10 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 w-full max-w-2xl p-4 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeType}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-full flex flex-col"
                    >
                        {/* POST EDITOR */}
                        {activeType === 'post' && (
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                                        {user?.photoURL ? (
                                            <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyber-pink to-purple-600 text-white font-black">
                                                {user?.displayName?.[0] || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="What's happening in your universe?"
                                        className="flex-1 bg-transparent text-xl text-white placeholder:text-white/20 outline-none resize-none min-h-[150px]"
                                        autoFocus
                                    />
                                </div>

                                {/* Media Preview */}
                                <AnimatePresence>
                                    {previewUrl && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40"
                                        >
                                            <button
                                                onClick={removeMedia}
                                                className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors z-10"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                            {media?.type.startsWith('video') ? (
                                                <video src={previewUrl} controls className="w-full max-h-[500px] object-contain" />
                                            ) : (
                                                <img src={previewUrl} alt="Preview" className="w-full max-h-[500px] object-contain" />
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*,video/*"
                                            onChange={handleFileSelect}
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-3 bg-white/5 rounded-full text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors tooltip-trigger"
                                            title="Add Photo/Video"
                                        >
                                            <ImageIcon className="w-5 h-5" />
                                        </button>
                                        <button className="p-3 bg-white/5 rounded-full text-yellow-400 hover:bg-yellow-400/10 transition-colors">
                                            <Smile className="w-5 h-5" />
                                        </button>
                                        <button className="p-3 bg-white/5 rounded-full text-green-400 hover:bg-green-400/10 transition-colors">
                                            <MapPin className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <span className="text-white/20 text-xs font-bold uppercase">{content.length}/500</span>
                                </div>
                            </div>
                        )}

                        {/* STORY EDITOR */}
                        {activeType === 'story' && (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.02] p-8 text-center cursor-pointer hover:border-cyber-pink/50 hover:bg-cyber-pink/[0.02] transition-all group">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform mb-6">
                                    <Camera className="w-10 h-10 text-white/40 group-hover:text-cyber-pink transition-colors" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Create a Story</h3>
                                <p className="text-white/40 max-w-xs mx-auto mb-8">
                                    Share a moment that disappears after 24 hours. Photos or videos up to 60s.
                                </p>
                                <button className="px-8 py-3 bg-white/10 rounded-full font-bold text-white hover:bg-white/20 transition-all">
                                    Select Media
                                </button>
                            </div>
                        )}

                        {/* THREAD EDITOR */}
                        {activeType === 'thread' && (
                            <div className="space-y-6">
                                <div className="relative pl-8 border-l-2 border-white/10 ml-4 space-y-8">
                                    {/* Thread Item 1 */}
                                    <div className="relative">
                                        <div className="absolute -left-[41px] top-0 w-10 h-10 rounded-full bg-white/10 overflow-hidden ring-4 ring-[#0C0C0C]">
                                            {user?.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : null}
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold text-white mb-1">Start thread...</h4>
                                            <textarea
                                                placeholder="Thread 1..."
                                                className="w-full bg-white/5 rounded-xl p-4 text-white placeholder:text-white/20 outline-none resize-none min-h-[100px]"
                                            />
                                        </div>
                                    </div>

                                    {/* Add Thread Button */}
                                    <div className="relative">
                                        <div className="absolute -left-[37px] top-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center ring-4 ring-[#0C0C0C]">
                                            <Plus className="w-4 h-4 text-white/40" />
                                        </div>
                                        <button className="text-cyber-pink font-bold text-sm hover:underline ml-2">
                                            Add to thread
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* LIVE EDITOR */}
                        {activeType === 'live' && (
                            <div className="flex-1 bg-black rounded-3xl overflow-hidden relative flex flex-col items-center justify-center">
                                {/* Mock Camera View */}
                                <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                                    <p className="text-white/20 font-black text-xl uppercase tracking-widest">Camera Preview</p>
                                </div>

                                <div className="relative z-10 w-full p-8 flex flex-col justify-end h-full bg-gradient-to-t from-black/80 to-transparent">
                                    <input
                                        type="text"
                                        placeholder="Add a title to your live..."
                                        className="w-full bg-transparent text-center text-2xl font-black text-white placeholder:text-white/40 outline-none mb-8"
                                    />

                                    <div className="flex items-center justify-center gap-6 mb-8">
                                        <button className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition-all backdrop-blur-md">
                                            <Video className="w-6 h-6 text-white" />
                                        </button>
                                        <button className="w-20 h-20 bg-red-500 rounded-full shadow-[0_0_40px_rgba(239,68,68,0.5)] border-4 border-white/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
                                            <div className="w-8 h-8 rounded-sm bg-white" />
                                        </button>
                                        <button className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition-all backdrop-blur-md">
                                            <Mic className="w-6 h-6 text-white" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* LICE (Mapped to Clips/Shorts) EDITOR */}
                        {activeType === 'lice' && (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.02] p-8 text-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/[0.02] transition-all group">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform mb-6">
                                    <Film className="w-10 h-10 text-white/40 group-hover:text-purple-500 transition-colors" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Create a Lice</h3>
                                <p className="text-white/40 max-w-xs mx-auto mb-8">
                                    Upload short, looping videos. Add music, effects, and more.
                                </p>
                                <button className="px-8 py-3 bg-white/10 rounded-full font-bold text-white hover:bg-white/20 transition-all">
                                    Select Video
                                </button>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
