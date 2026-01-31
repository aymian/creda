"use client"

import React, { useEffect, useState } from "react"
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
    Briefcase
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { UserListModal } from "@/components/UserListModal"

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
}

export default function ProfilePage() {
    const params = useParams()
    const router = useRouter()
    const { user: currentUser } = useAuth()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("posts")
    const [listModal, setListModal] = useState<{ isOpen: boolean, type: "followers" | "following" }>({
        isOpen: false,
        type: "followers"
    })

    const username = params?.username as string

    useEffect(() => {
        const fetchProfile = async () => {
            if (!username) return

            try {
                // Decode URL parameter to handle spaces (%20) and other chars
                const cleanUsername = decodeURIComponent(username).replace(/^@/, '')

                const q = query(collection(db, "users"), where("username", "==", cleanUsername))
                const snapshot = await getDocs(q)

                if (!snapshot.empty) {
                    const doc = snapshot.docs[0]
                    const userData = doc.data()

                    // Fetch real counts from subcollections
                    const followersRef = collection(db, "users", doc.id, "followers")
                    const followingRef = collection(db, "users", doc.id, "following")

                    const [followersSnap, followingSnap] = await Promise.all([
                        getCountFromServer(followersRef),
                        getCountFromServer(followingRef)
                    ])

                    setProfile({
                        uid: doc.id,
                        ...userData,
                        followersCount: followersSnap.data().count,
                        followingCount: followingSnap.data().count
                    } as UserProfile)
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
            <div className="min-h-screen flex items-center justify-center bg-[#0C0C0C]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-pink"></div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0C0C0C] text-white space-y-4">
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
        <div className="min-h-screen bg-[#0C0C0C] pb-20">
            {/* Hero / Cover */}
            <div className="relative h-[250px] md:h-[350px] w-full bg-gradient-to-r from-purple-900 to-cyber-pink/20 overflow-hidden">
                {profile.coverURL ? (
                    <img src={profile.coverURL} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                )}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0C0C0C] to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-start gap-6 -mt-16 md:-mt-24 mb-8">
                    {/* Avatar */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                    >
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-[#0C0C0C] ring-4 ring-white/10">
                            <div className="w-full h-full rounded-full overflow-hidden bg-white/10">
                                {profile.photoURL ? (
                                    <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyber-pink to-purple-600 text-4xl font-black text-white">
                                        {profile.displayName?.[0] || profile.username?.[0] || 'U'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Info & Actions */}
                    <div className="flex-1 w-full pt-16 md:pt-24 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-white flex items-center gap-2">
                                    {profile.displayName}
                                    <Check className="w-5 h-5 text-cyber-cyan bg-cyber-cyan/10 rounded-full p-0.5" strokeWidth={4} />
                                </h1>
                                <p className="text-white/40 font-bold">@{profile.username}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                {currentUser?.uid === profile.uid ? (
                                    <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-full font-bold text-white hover:bg-white/10 transition-all">
                                        Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        <button className="px-8 py-2 bg-cyber-pink text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,45,108,0.3)]">
                                            Follow
                                        </button>
                                        <button className="p-2.5 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 transition-all">
                                            <MessageCircle className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                                <button className="p-2.5 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 transition-all">
                                    <Share2 className="w-5 h-5" />
                                </button>
                                <button className="p-2.5 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 transition-all">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {profile.bio && (
                            <p className="text-white/80 max-w-2xl leading-relaxed">
                                {profile.bio}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-6 text-sm text-white/40 font-medium">
                            {profile.location && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    {profile.location}
                                </div>
                            )}
                            {profile.website && (
                                <div className="flex items-center gap-1.5">
                                    <LinkIcon className="w-4 h-4" />
                                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-cyber-cyan hover:underline">
                                        {profile.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                Joined {new Date().getFullYear()} {/* TODO: Use actual createdAt */}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pt-2">
                            <div
                                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setListModal({ isOpen: true, type: "followers" })}
                            >
                                <span className="text-white font-black text-lg">{displayedFollowers.toLocaleString()}</span>
                                <span className="text-white/40 text-sm font-bold uppercase tracking-wide">Followers</span>
                            </div>
                            <div
                                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setListModal({ isOpen: true, type: "following" })}
                            >
                                <span className="text-white font-black text-lg">{displayedFollowing.toLocaleString()}</span>
                                <span className="text-white/40 text-sm font-bold uppercase tracking-wide">Following</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-white/10 mb-8">
                    <div className="flex gap-8">
                        {['posts', 'media', 'about'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-white' : 'text-white/20 hover:text-white/60'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-pink"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[300px]">
                    {activeTab === 'posts' && (
                        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-white/20">
                                <Briefcase className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
                            <p className="text-white/40 max-w-sm mx-auto">
                                This user hasn't published any content to their feed yet.
                            </p>
                        </div>
                    )}
                    {activeTab === 'media' && (
                        <div className="grid grid-cols-3 gap-1 md:gap-4">
                            {/* Placeholder for media grid */}
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />
                            ))}
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
