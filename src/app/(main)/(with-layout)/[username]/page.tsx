"use client"

import React, { useEffect, useState, use } from "react"
import { useParams, useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, getCountFromServer } from "firebase/firestore"
import { motion } from "framer-motion"
import {
    MapPin,
    Link as LinkIcon,
    Calendar,
    MessageCircle,
    MoreHorizontal,
    Share2,
    Users,
    Check,
    Briefcase,
    Loader2,
    Lock,
    Gem,
    Plus,
    Video,
    LayoutGrid,
    Star,
    Film,
    CreditCard,
    Gift,
    Camera,
    Pencil,
    ChevronRight,
    Image as ImageIcon
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { UserListModal } from "@/components/UserListModal"
import { doc, setDoc, deleteDoc, serverTimestamp, arrayUnion, arrayRemove, updateDoc, getDoc, addDoc } from "firebase/firestore"
import { cn } from "@/lib/utils"

interface UserProfile {
    uid: string
    displayName: string
    username: string
    photoURL?: string
    coverURL?: string
    bio?: string
    location?: string
    website?: string
    followers?: string[] | number
    following?: string[] | number
    followersCount?: number
    followingCount?: number
    createdAt?: any
    isPrivate?: boolean
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const { user: currentUser } = useAuth()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("all")
    const [listModal, setListModal] = useState<{ isOpen: boolean, type: "followers" | "following" }>({
        isOpen: false,
        type: "followers"
    })
    const [isFollowing, setIsFollowing] = useState(false)
    const [isFollowLoading, setIsFollowLoading] = useState(false)
    const [hasPendingRequest, setHasPendingRequest] = useState(false)

    const username = resolvedParams?.username as string

    const handleFollow = async () => {
        if (!currentUser || !profile) return
        setIsFollowLoading(true)

        try {
            if (isFollowing) {
                // Unfollow
                await deleteDoc(doc(db, "users", currentUser.uid, "following", profile.uid))
                await deleteDoc(doc(db, "users", profile.uid, "followers", currentUser.uid))
                setIsFollowing(false)
            } else {
                if (profile.isPrivate) {
                    // Send Follow Request
                    if (hasPendingRequest) return
                    await addDoc(collection(db, "notifications"), {
                        type: "follow_request",
                        fromUserId: currentUser.uid,
                        fromUsername: currentUser.displayName || "User",
                        toUserId: profile.uid,
                        status: "pending",
                        timestamp: serverTimestamp()
                    })
                    setHasPendingRequest(true)
                } else {
                    // Direct Follow
                    await setDoc(doc(db, "users", currentUser.uid, "following", profile.uid), {
                        userId: profile.uid,
                        timestamp: serverTimestamp()
                    })
                    await setDoc(doc(db, "users", profile.uid, "followers", currentUser.uid), {
                        userId: currentUser.uid,
                        timestamp: serverTimestamp()
                    })
                    setIsFollowing(true)
                }
            }
        } catch (e) {
            console.error("Follow error:", e)
        } finally {
            setIsFollowLoading(false)
        }
    }

    const handleMessage = async () => {
        if (!currentUser || !profile) return

        try {
            // query conversations where current user is a participant
            const q = query(
                collection(db, "conversations"),
                where("participants", "array-contains", currentUser.uid)
            )
            const snapshot = await getDocs(q)

            // Find if there's an existing conversation with the profile user
            let conversationId = ""
            const existingConv = snapshot.docs.find(doc => {
                const participants = doc.data().participants as string[]
                return participants.includes(profile.uid)
            })

            if (existingConv) {
                conversationId = existingConv.id
            } else {
                // Create new conversation
                // Note: We use addDoc so Firestore generates a random ID, 
                // or we can stick to a random ID. Random is safer for security rules.
                const newConvRef = await addDoc(collection(db, "conversations"), {
                    participants: [currentUser.uid, profile.uid],
                    lastMessageTime: serverTimestamp(),
                    createdAt: serverTimestamp(),
                    unreadCounts: {
                        [currentUser.uid]: 0,
                        [profile.uid]: 0
                    }
                })
                conversationId = newConvRef.id
            }

            router.push(`/messages?id=${conversationId}`)
        } catch (error) {
            console.error("Error starting conversation:", error)
        }
    }

    useEffect(() => {
        const fetchProfile = async () => {
            if (!username) return

            try {
                // Decode URL parameter to handle spaces (%20) and other chars
                const cleanUsername = decodeURIComponent(username).replace(/^@/, '')

                const q = query(collection(db, "users"), where("username", "==", cleanUsername))
                const snapshot = await getDocs(q)

                if (!snapshot.empty) {
                    const userDoc = snapshot.docs[0]
                    const userData = userDoc.data()

                    // Fetch real counts from subcollections
                    const followersRef = collection(db, "users", userDoc.id, "followers")
                    const followingRef = collection(db, "users", userDoc.id, "following")

                    const [followersSnap, followingSnap] = await Promise.all([
                        getCountFromServer(followersRef),
                        getCountFromServer(followingRef)
                    ])

                    setProfile({
                        uid: userDoc.id,
                        ...userData,
                        followersCount: followersSnap.data().count,
                        followingCount: followingSnap.data().count
                    } as UserProfile)

                    // Check if current user follows this profile
                    if (currentUser) {
                        const followRef = doc(db, "users", currentUser.uid, "following", userDoc.id)
                        const followSnap = await getDoc(followRef)
                        setIsFollowing(followSnap.exists())

                        // Check for pending request if profile is private
                        if (userData.isPrivate) {
                            const requestRef = query(
                                collection(db, "notifications"),
                                where("fromUserId", "==", currentUser.uid),
                                where("toUserId", "==", userDoc.id),
                                where("type", "==", "follow_request"),
                                where("status", "==", "pending")
                            )
                            const requestSnap = await getDocs(requestRef)
                            setHasPendingRequest(!requestSnap.empty)
                        }
                    }
                } else {
                    setProfile(null)
                }
            } catch (error) {
                console.error("Error fetching profile:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [username])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF2D6C]"></div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F0F] text-white space-y-4">
                <h1 className="text-4xl font-black text-white/20">404</h1>
                <p className="text-xl font-bold">User @{username} not found</p>
                <button
                    onClick={() => router.push("/")}
                    className="px-6 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-all font-bold"
                >
                    Go Home
                </button>
            </div>
        )
    }

    const displayedFollowers = profile.followersCount ?? (Array.isArray(profile.followers) ? profile.followers.length : (profile.followers || 0))
    const displayedFollowing = profile.followingCount ?? (Array.isArray(profile.following) ? profile.following.length : (profile.following || 0))

    return (
        <div className="min-h-screen bg-[#0F0F0F]">
            <div className="max-w-5xl mx-auto px-6 pt-16 pb-20">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-start gap-8 mb-16">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-36 h-36 rounded-full overflow-hidden bg-[#1A1A1A] relative">
                            {profile.photoURL ? (
                                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10 text-4xl font-bold text-white">
                                    {profile.displayName?.[0] || profile.username?.[0] || 'U'}
                                </div>
                            )}
                            {currentUser?.uid === profile.uid && (
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            )}
                        </div>
                        {currentUser?.uid === profile.uid && (
                            <div className="absolute bottom-1 right-1 w-9 h-9 bg-[#1A1A1A] rounded-full flex items-center justify-center border border-black shadow-lg cursor-pointer hover:bg-[#252525] transition-colors">
                                <Camera className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Info & Actions */}
                    <div className="flex-1 space-y-4 pt-2">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-white tracking-tight">
                                    {profile.displayName || profile.username}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <span className="text-[14px] text-white/90 flex items-center gap-1.5">
                                        <span role="img" aria-label="bio">💟</span>
                                        Me on Telegram: <span className="text-white font-medium">@exclusvvbot</span>
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="p-1 text-white/40 hover:text-white transition-colors">
                                    <Share2 className="w-5 h-5 stroke-[1.5]" />
                                </button>
                                <button className="p-1 text-white/40 hover:text-white transition-colors">
                                    <MoreHorizontal className="w-5 h-5 stroke-[1.5]" />
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-10">
                            <div className="space-y-0.5">
                                <div className="text-xl font-bold text-white leading-none">0</div>
                                <div className="flex items-center gap-1 text-[13px] font-medium text-white/40">
                                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white/40 mt-0.5" />
                                    Earned
                                </div>
                            </div>
                            <div
                                className="space-y-0.5 cursor-pointer group"
                                onClick={() => setListModal({ isOpen: true, type: "followers" })}
                            >
                                <div className="text-xl font-bold text-white leading-none group-hover:text-white transition-colors">{displayedFollowers}</div>
                                <div className="text-[13px] font-medium text-white/40">Followers</div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2.5 pt-2">
                            {currentUser?.uid === profile.uid ? (
                                <>
                                    <button className="h-11 px-6 bg-gradient-to-r from-[#FF2D6C] to-[#FF2D9E] rounded-full flex items-center gap-2 text-white font-bold text-sm hover:opacity-90 transition-all">
                                        <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center">
                                            <Plus className="w-3.5 h-3.5" />
                                        </div>
                                        Create Post
                                    </button>
                                    <button className="h-11 px-6 bg-transparent border border-white/20 rounded-full flex items-center gap-2 text-white font-bold text-sm hover:bg-white/5 transition-all">
                                        <Video className="w-4 h-4" />
                                        Start stream
                                    </button>
                                    <div className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/5 flex items-center justify-center relative cursor-pointer hover:bg-[#252525] transition-colors">
                                        <Gem className="w-4 h-4 text-white/80" />
                                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#FF2D6C] rounded-full border-2 border-[#0F0F0F]" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleMessage}
                                        className="h-10 px-8 bg-white/5 border border-white/5 rounded-full flex items-center gap-2.5 text-white font-bold text-[13px] hover:bg-white/10 transition-all"
                                    >
                                        <MessageCircle className="w-5 h-5 stroke-[1.5]" />
                                        Message
                                    </button>
                                    <button
                                        onClick={handleFollow}
                                        className="h-10 px-8 bg-white/5 border border-white/5 rounded-full flex items-center gap-2.5 text-white font-bold text-[13px] hover:bg-white/10 transition-all"
                                    >
                                        <Star className="w-5 h-5 stroke-[1.5]" />
                                        Become a Fan
                                    </button>
                                    <button
                                        className="h-10 px-8 bg-white/5 border border-white/5 rounded-full flex items-center gap-2.5 text-white font-bold text-[13px] hover:bg-white/10 transition-all"
                                    >
                                        <Gift className="w-5 h-5 stroke-[1.5]" />
                                        Send gift
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-white/10 mb-10 overflow-x-auto no-scrollbar">
                    <div className="flex gap-16 min-w-max">
                        {[
                            { id: 'all', label: 'All', icon: LayoutGrid },
                            { id: 'fans', label: 'For Fans', icon: Star },
                            { id: 'moments', label: 'Moments', icon: Film },
                            { id: 'tango', label: 'Tango Cards', icon: CreditCard },
                            { id: 'collections', label: 'Collections', icon: Gift }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "pb-4 flex flex-col items-center gap-2.5 text-[13px] font-medium transition-all relative min-w-[60px]",
                                    activeTab === tab.id ? "text-white" : "text-white/40 hover:text-white/70"
                                )}
                            >
                                <tab.icon className={cn("w-5 h-5 stroke-[1.5]", activeTab === tab.id ? "text-white" : "text-white/40")} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabProfile"
                                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {profile.isPrivate && !isFollowing && currentUser?.uid !== profile.uid ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-6">
                                <Lock className="w-8 h-8 text-white/20" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Private Profile</h3>
                            <p className="text-white/40 max-w-sm text-sm">Follow this user to see their posts and moments.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-24 h-24 relative mb-6">
                                <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white/10">
                                    <rect x="24" y="24" width="48" height="48" rx="12" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
                                    <circle cx="48" cy="44" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
                                    <path d="M36 60C36 55.5817 39.5817 52 44 52H52C56.4183 52 60 55.5817 60 60" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
                                    <path d="M70 30L74 26M74 30L70 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <circle cx="22" cy="74" r="2" fill="currentColor"/>
                                </svg>
                            </div>
                            <p className="text-white/20 font-bold text-sm">No Posts</p>
                        </div>
                    )}
                </div>
            </div>

            {profile && (
                <UserListModal
                    isOpen={listModal.isOpen}
                    onClose={() => setListModal(prev => ({ ...prev, isOpen: false }))}
                    type={listModal.type}
                    userId={profile.uid}
                />
            )}
        </div>
    )
}
