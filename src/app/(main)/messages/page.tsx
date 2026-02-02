"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    MoreHorizontal,
    Video,
    Image as ImageIcon,
    Smile,
    Check,
    Plus,
    Inbox,
    Gift,
    Star,
    MessageSquare,
    MoreVertical,
    ArrowDown,
    Loader2
} from "lucide-react"
import { db, auth } from "@/lib/firebase"
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    where,
    Timestamp,
    doc,
    updateDoc,
    addDoc,
    serverTimestamp,
    getDoc,
    limit,
    increment,
    setDoc
} from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"

// Custom AI Icon to match screenshot
const AiIcon = () => (
    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
        <span className="text-[10px] font-black tracking-tighter">AI</span>
    </div>
)

const GiftIcon = () => (
    <Gift className="w-6 h-6 text-white/40 hover:text-white transition-all cursor-pointer" />
)


export default function MessagesPage() {
    const { user } = useAuth()
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [message, setMessage] = useState("")
    const [conversations, setConversations] = useState<any[]>([])
    const [messages, setMessages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [userProfiles, setUserProfiles] = useState<Record<string, any>>({})
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Fetch conversations and participant profiles
    useEffect(() => {
        if (!user) return

        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", user.uid),
            orderBy("lastMessageTime", "desc")
        )

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const convs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            // Collect all unique participant IDs that aren't the current user
            const profileIds = new Set<string>()
            convs.forEach((c: any) => {
                c.participants.forEach((pId: string) => {
                    if (pId !== user.uid) profileIds.add(pId)
                })
            })

            // Fetch profiles for these IDs if we don't have them
            const newProfiles = { ...userProfiles }
            let profilesUpdated = false

            for (const pId of Array.from(profileIds)) {
                if (!newProfiles[pId]) {
                    const userDoc = await getDoc(doc(db, "users", pId))
                    if (userDoc.exists()) {
                        newProfiles[pId] = userDoc.data()
                        profilesUpdated = true
                    } else {
                        newProfiles[pId] = { displayName: "Unknown User", photoURL: null }
                        profilesUpdated = true
                    }
                }
            }

            if (profilesUpdated) {
                setUserProfiles(newProfiles)
            }

            setConversations(convs)

            if (!selectedId && convs.length > 0) {
                setSelectedId(convs[0].id)
            }
            setLoading(false)
        }, (error) => {
            console.error("Error fetching conversations:", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [user, selectedId])

    // Fetch messages for selected conversation
    useEffect(() => {
        if (!selectedId) return

        const q = query(
            collection(db, "conversations", selectedId, "messages"),
            orderBy("timestamp", "asc")
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setMessages(msgs)
        })

        // Reset unread count for current user
        const resetUnread = async () => {
            if (!user) return
            try {
                await updateDoc(doc(db, "conversations", selectedId), {
                    [`unreadCounts.${user.uid}`]: 0
                })
            } catch (e) {
                console.error("Error resetting unread count:", e)
            }
        }
        resetUnread()

        return () => unsubscribe()
    }, [selectedId, user])

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!message.trim() || !selectedId || !user) return

        const messageText = message
        setMessage("")

        try {
            const convDoc = doc(db, "conversations", selectedId)
            const chat = conversations.find(c => c.id === selectedId)
            const otherParticipantId = chat?.participants.find((p: string) => p !== user.uid)

            // Add message to subcollection
            await addDoc(collection(db, "conversations", selectedId, "messages"), {
                text: messageText,
                senderId: user.uid,
                timestamp: serverTimestamp(),
                status: 'sent'
            })

            // Update parent conversation
            const updateData: any = {
                lastMessage: messageText,
                lastMessageTime: serverTimestamp(),
                lastMessageSenderId: user.uid
            }

            // Increment unread count for other participant
            if (otherParticipantId) {
                updateData[`unreadCounts.${otherParticipantId}`] = increment(1)
            }

            await updateDoc(convDoc, updateData)
        } catch (error) {
            console.error("Error sending message:", error)
        }
    }

    const formatTime = (timestamp: any) => {
        if (!timestamp) return ""
        const date = timestamp.toDate()
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const formatDateShort = (timestamp: any) => {
        if (!timestamp) return ""
        const date = timestamp.toDate()
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        if (days === 1) return "Yesterday"
        if (days < 7) return date.toLocaleDateString([], { weekday: 'long' })
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }

    const getChatHeaderInfo = (chat: any) => {
        if (!chat || !user) return { name: "...", avatar: null, unread: 0 }
        const otherParticipantId = chat.participants.find((p: string) => p !== user.uid)
        const profile = userProfiles[otherParticipantId] || {}
        return {
            name: profile.displayName || profile.username || "User",
            avatar: profile.photoURL || profile.avatar || `https://ui-avatars.com/api/?name=${profile.displayName || "U"}&background=random`,
            unread: chat.unreadCounts?.[user.uid] || 0,
            verified: profile.isVerified || profile.verified
        }
    }

    if (loading) {
        return (
            <div className="h-full w-full bg-[#0C0C0C] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF2D6C]" />
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-64px)] bg-[#0C0C0C] text-white flex overflow-hidden font-sans">

            {/* Left Sidebar */}
            <div className="w-[380px] border-r border-white/5 flex flex-col bg-[#0C0C0C]">

                {/* Header: Message Requests */}
                <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-white/5 rounded-lg flex items-center justify-center">
                            <Inbox className="w-4 h-4 text-white/60" />
                        </div>
                        <h2 className="text-sm font-bold tracking-tight">Message Requests</h2>
                    </div>
                    <button className="px-5 py-2 bg-white/5 hover:bg-white/10 rounded-full text-[11px] font-black transition-all">
                        View
                    </button>
                </div>

                {/* Filters */}
                <div className="px-5 pb-6 flex items-center gap-2">
                    <button className="px-5 py-2 bg-white/10 rounded-full text-[11px] font-black">All</button>
                    <button className="px-5 py-2 bg-white/5 hover:bg-white/10 rounded-full text-[11px] font-black flex items-center gap-2">
                        <span className="text-pink-500">❤️</span> Favorites
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-all">
                        <Plus className="w-4 h-4 opacity-40" />
                    </button>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {conversations.length > 0 ? conversations.map((chat) => {
                        const info = getChatHeaderInfo(chat)
                        return (
                            <div
                                key={chat.id}
                                onClick={() => setSelectedId(chat.id)}
                                className={`px-4 py-1 cursor-pointer transition-all`}
                            >
                                <div className={`flex items-center gap-3 p-3 rounded-2xl relative transition-all ${selectedId === chat.id ? 'bg-[#FF2D6C]' : 'hover:bg-white/5'}`}>
                                    <div className="relative shrink-0">
                                        <img
                                            src={info.avatar}
                                            className="w-12 h-12 rounded-full border border-white/10 object-cover"
                                            alt=""
                                        />
                                        {chat.onlineStatus?.[chat.participants.find((p: string) => p !== user?.uid)] && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0C0C0C]" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-bold text-[13px] truncate flex items-center gap-1">
                                                {info.name}
                                                {chat.hasEmoji && <span>🔥</span>}
                                                {info.verified && (
                                                    <div className="w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                                                        <Check className="w-2.5 h-2.5 text-[#FF2D6C]" strokeWidth={5} />
                                                    </div>
                                                )}
                                            </h3>
                                            <span className={`text-[10px] ${selectedId === chat.id ? 'text-white/60' : 'text-white/20'}`}>
                                                {formatDateShort(chat.lastMessageTime)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-[12px] truncate ${selectedId === chat.id ? 'text-white/80' : 'text-white/40'}`}>
                                                {chat.lastMessage || "No messages yet"}
                                            </p>
                                            {info.unread > 0 && selectedId !== chat.id && (
                                                <div className="min-w-[18px] h-[18px] bg-white text-[#FF2D6C] rounded-full flex items-center justify-center text-[10px] font-black px-1">
                                                    {info.unread}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="p-10 text-center opacity-20">
                            <MessageSquare className="w-10 h-10 mx-auto mb-2" />
                            <p className="text-xs font-bold uppercase">No comms found</p>
                        </div>
                    )}

                    {/* Suggested Creators */}
                    <div className="p-6 mt-4 space-y-4 border-t border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Suggested Creators</p>
                        <div className="flex items-center gap-4">
                            <img src="https://i.pravatar.cc/150?u=quynh" className="w-11 h-11 rounded-full object-cover" alt="" />
                            <div className="flex-1">
                                <h4 className="text-[13px] font-bold">Quỳnh Nhi</h4>
                                <p className="text-[11px] opacity-40">Single</p>
                            </div>
                            <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[11px] font-black flex items-center gap-2 transition-all">
                                <MessageSquare className="w-3.5 h-3.5 opacity-60" /> Say Hi
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-[#0C0C0C] relative">

                {selectedId ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#0C0C0C]">
                            <div className="flex items-center gap-4">
                                <img
                                    src={getChatHeaderInfo(conversations.find(c => c.id === selectedId)).avatar}
                                    className="w-10 h-10 rounded-full border border-white/10 object-cover"
                                    alt=""
                                />
                                <h2 className="font-bold text-[15px] flex items-center gap-1.5">
                                    {getChatHeaderInfo(conversations.find(c => c.id === selectedId)).name}
                                    {conversations.find(c => c.id === selectedId)?.hasEmoji && <span>🔥</span>}
                                    {getChatHeaderInfo(conversations.find(c => c.id === selectedId)).verified && (
                                        <div className="w-4 h-4 bg-[#FF2D6C] rounded-full flex items-center justify-center">
                                            <Check className="w-2.5 h-2.5 text-white" strokeWidth={5} />
                                        </div>
                                    )}
                                </h2>
                            </div>
                            <div className="flex items-center gap-5">
                                <AiIcon />
                                <MoreHorizontal className="w-6 h-6 text-white/40 hover:text-white cursor-pointer transition-all" />
                            </div>
                        </div>

                        {/* Messages Container */}
                        <div className="flex-1 overflow-y-auto p-10 flex flex-col gap-6 custom-scrollbar">
                            {messages.length > 0 ? (
                                <>
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.senderId === user?.uid
                                        return (
                                            <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[70%] px-5 py-3 rounded-2xl text-[14px] ${isMe ? 'bg-[#FF2D6C] text-white' : 'bg-white/5 text-white/80'}`}>
                                                    {msg.text}
                                                </div>
                                                <div className="mt-1 flex items-center gap-2 px-1">
                                                    <span className="text-[10px] font-black text-white/20 uppercase">
                                                        {formatTime(msg.timestamp)}
                                                    </span>
                                                    {isMe && <Check className="w-3 h-3 text-white/20" />}
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div ref={messagesEndRef} />
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <motion.span
                                        animate={{ rotate: [0, 20, 0, 20, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="text-[100px] leading-none mb-6"
                                    >
                                        👋
                                    </motion.span>
                                    <p className="text-sm font-bold opacity-20 uppercase tracking-widest">Start a conversation</p>
                                </div>
                            )}

                            {/* Floating Scroll Down button */}
                            <div className="absolute bottom-40 right-10 z-10 w-11 h-11 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer">
                                <ArrowDown className="w-5 h-5 opacity-60" />
                            </div>
                        </div>

                        {/* Footer: Input and Sticker Toolbar */}
                        <div className="p-8 pb-10 flex flex-col items-center gap-4">

                            {/* Input Bar */}
                            <form onSubmit={handleSendMessage} className="w-full max-w-3xl flex items-center gap-4">
                                <button type="button" className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                                    <Plus className="w-6 h-6 opacity-40" />
                                </button>

                                <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl flex items-center h-12 px-6 focus-within:bg-white/[0.08] focus-within:border-white/10 transition-all">
                                    <input
                                        type="text"
                                        placeholder="Message..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold text-white placeholder:text-white/20"
                                    />
                                    <div className="flex items-center gap-6">
                                        <Smile className="w-5 h-5 text-white/40 hover:text-white cursor-pointer" />
                                        <ImageIcon className="w-5 h-5 text-white/40 hover:text-white cursor-pointer" />
                                        <GiftIcon />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-10">
                        <MessageSquare className="w-16 h-16" />
                        <h3 className="font-bold">Select a connection</h3>
                    </div>
                )}
            </div>

            {/* Right Side Control Bar */}
            <div className="w-[100px] border-l border-white/5 bg-[#0C0C0C] flex flex-col items-center py-10 gap-16">

                {/* Coins Shortcut */}
                <div className="flex flex-col items-center gap-3 group cursor-pointer">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 group-hover:border-yellow-500/50 transition-all">
                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF2D6C] rounded-full border-2 border-[#0C0C0C]" />
                    </div>
                    <span className="text-[9px] font-black text-center text-white/40 leading-relaxed uppercase tracking-[0.1em] group-hover:text-white transition-colors">
                        Get more <br />Coins now
                    </span>
                </div>

                <div className="flex-1" />

                {/* Floating Action Button */}
                <button className="w-14 h-14 bg-[#FF2D6C] rounded-full flex items-center justify-center shadow-[0_15px_30px_rgba(255,45,108,0.3)] hover:scale-110 active:scale-95 transition-all">
                    <Video className="w-7 h-7 text-white fill-white" />
                </button>
            </div>

            {/* Scrollbar Customization */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.15);
                }
            `}</style>
        </div>
    )
}
