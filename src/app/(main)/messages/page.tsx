"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
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
    ArrowDown,
    Loader2,
    CornerUpLeft,
    Edit2,
    Trash2,
    X,
    Clock,
    MessageCircle,
    ArrowLeft,
    Phone,
    Mic,
    SendHorizontal,
    Camera,
    Play,
    Pause,
    Square,
    StopCircle
} from "lucide-react"
import dynamic from 'next/dynamic'
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })
import IncomingCallModal from '@/components/IncomingCallModal'
import LiveStreamModal from '@/components/LiveStreamModal'
import { initiateCall, updateCallStatus, sendMissedCallMessage } from '@/lib/callNotifications'
import { db, auth, storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
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
    setDoc,
    deleteDoc
} from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

// Custom AI Icon to match screenshot
const AiIcon = () => (
    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
        <span className="text-[10px] font-black tracking-tighter">AI</span>
    </div>
)

const GiftIcon = () => (
    <Gift className="w-6 h-6 text-white/40 hover:text-white transition-all cursor-pointer" />
)

interface Message {
    id: string
    text: string
    senderId: string
    timestamp: any
    status: 'sent' | 'read'
    type?: 'text' | 'audio'
    audioUrl?: string
    duration?: number
    isEdited?: boolean
    editedAt?: any
    replyTo?: {
        id: string
        text: string
        senderName: string
    } | null
}

interface Conversation {
    id: string
    participants: string[]
    lastMessage?: string
    lastMessageTime?: any
    lastMessageSenderId?: string
    unreadCounts?: Record<string, number>
    typing?: Record<string, boolean>
    onlineStatus?: Record<string, boolean>
    hasEmoji?: boolean
}

export default function MessagesPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [message, setMessage] = useState("")
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [userProfiles, setUserProfiles] = useState<Record<string, any>>({})
    const [replyingTo, setReplyingTo] = useState<any | null>(null)
    const [editingMessage, setEditingMessage] = useState<any | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [showContextMenu, setShowContextMenu] = useState<{ id: string, x: number, y: number } | null>(null)
    const [otherUserTyping, setOtherUserTyping] = useState(false)
    const [isSidebarVisible, setIsSidebarVisible] = useState(true)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const [isHeaderHidden, setIsHeaderHidden] = useState(false)
    const [pickerWidth, setPickerWidth] = useState(350)
    const [showScrollDown, setShowScrollDown] = useState(false)
    const [viewportHeight, setViewportHeight] = useState('calc(100vh - 64px)')
    const [messageToManage, setMessageToManage] = useState<any | null>(null)
    const [incomingCall, setIncomingCall] = useState<any | null>(null)
    const [currentCallId, setCurrentCallId] = useState<string | null>(null)

    // Audio Recording State
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)

    // Live Stream State
    const [showLiveModal, setShowLiveModal] = useState(false)
    const [liveMode, setLiveMode] = useState<'broadcast' | 'watch'>('broadcast')
    const [liveStreamUrl, setLiveStreamUrl] = useState('')
    const [currentBroadcasterName, setCurrentBroadcasterName] = useState('')
    const [liveUsers, setLiveUsers] = useState<Record<string, any>>({})

    // Handle Visual Viewport (Mobile Keyboard)
    useEffect(() => {
        if (!window.visualViewport) return

        const handleViewport = () => {
            const height = window.visualViewport?.height || window.innerHeight
            const headerHeight = 64
            setViewportHeight(`${height - (isHeaderHidden ? 0 : headerHeight)}px`)
        }

        window.visualViewport.addEventListener('resize', handleViewport)
        handleViewport()
        return () => window.visualViewport?.removeEventListener('resize', handleViewport)
    }, [isHeaderHidden])

    // Handle Scroll Listener for Scroll-Down Button
    const handleScroll = () => {
        if (!messagesContainerRef.current) return
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200
        setShowScrollDown(!isNearBottom)
    }

    useEffect(() => {
        const updateWidth = () => {
            setPickerWidth(window.innerWidth < 640 ? 300 : 350)
        }
        updateWidth()
        window.addEventListener('resize', updateWidth)
        return () => window.removeEventListener('resize', updateWidth)
    }, [])

    const onEmojiClick = (emojiData: any) => {
        setMessage(prev => prev + emojiData.emoji)
    }

    // Handle global header visibility on mobile
    useEffect(() => {
        const handleHeader = () => {
            const header = document.getElementById('global-header')
            const isMobile = window.innerWidth < 1024
            if (isMobile && !isSidebarVisible && selectedId) {
                if (header) header.style.transform = 'translateY(-100%)'
                setIsHeaderHidden(true)
            } else {
                if (header) header.style.transform = 'translateY(0)'
                setIsHeaderHidden(false)
            }
        }

        handleHeader()
        window.addEventListener('resize', handleHeader)
        return () => {
            const header = document.getElementById('global-header')
            if (header) header.style.transform = 'translateY(0)'
            window.removeEventListener('resize', handleHeader)
        }
    }, [isSidebarVisible, selectedId])

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
            const convs = snapshot.docs.map(cvDoc => ({
                id: cvDoc.id,
                ...cvDoc.data()
            } as Conversation))

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

    // Listen for incoming calls
    useEffect(() => {
        if (!user) return

        // Simplified query without orderBy to avoid index requirement
        const callsQuery = query(
            collection(db, 'calls'),
            where('receiverId', '==', user.uid),
            where('status', '==', 'ringing')
        )

        const unsubscribe = onSnapshot(callsQuery, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const callData = { id: change.doc.id, ...change.doc.data() }
                    setIncomingCall(callData)
                    setCurrentCallId(change.doc.id)
                }
            })
        })

        // Listen for live users
        const liveQuery = query(collection(db, "users"), where("isLive", "==", true))
        const liveUnsubscribe = onSnapshot(liveQuery, (snapshot) => {
            const live: Record<string, any> = {}
            snapshot.docs.forEach(doc => {
                live[doc.id] = doc.data()
            })
            setLiveUsers(live)
        })

        return () => {
            unsubscribe()
            liveUnsubscribe()
        }
    }, [user])

    const handleAcceptCall = async () => {
        if (!currentCallId || !incomingCall) return

        await updateCallStatus(currentCallId, 'accepted')
        router.push(`/call?type=${incomingCall.callType}&username=${incomingCall.callerName}&channel=${incomingCall.channelName}&caller=false`)
        setIncomingCall(null)
        setCurrentCallId(null)
    }

    const handleDeclineCall = async () => {
        if (!currentCallId || !incomingCall) return

        await updateCallStatus(currentCallId, 'declined')

        // Send missed call message
        const conversationId = conversations.find(c =>
            c.participants.includes(incomingCall.callerId)
        )?.id

        if (conversationId) {
            await sendMissedCallMessage(conversationId, incomingCall.callerId, incomingCall.callType)
        }

        setIncomingCall(null)
        setCurrentCallId(null)
    }

    // Fetch messages for selected conversation
    useEffect(() => {
        if (!selectedId) return

        const q = query(
            collection(db, "conversations", selectedId, "messages"),
            orderBy("timestamp", "desc"),
            limit(50)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(mDoc => ({
                id: mDoc.id,
                ...mDoc.data()
            } as Message)).reverse()
            setMessages(msgs)

            // Mark messages as read efficiently
            const unreadMsgs = msgs.filter(m => m.senderId !== user?.uid && m.status !== 'read')
            if (unreadMsgs.length > 0 && selectedId) {
                unreadMsgs.forEach((msg) => {
                    updateDoc(doc(db, "conversations", selectedId, "messages", msg.id), {
                        status: 'read'
                    }).catch(e => console.error("Error marking message read:", e))
                })
            }
        })

        // Listen for typing status
        const convUnsubscribe = onSnapshot(doc(db, "conversations", selectedId), (snapshot) => {
            const data = snapshot.data()
            const otherId = data?.participants.find((p: string) => p !== user?.uid)
            if (otherId && data?.typing?.[otherId]) {
                setOtherUserTyping(true)
            } else {
                setOtherUserTyping(false)
            }
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

        return () => {
            unsubscribe()
            convUnsubscribe()
        }
    }, [selectedId, user])

    // Typing Status Logic
    const handleInput = (val: string) => {
        setMessage(val)
        if (!user || !selectedId) return

        // Set typing true
        updateDoc(doc(db, "conversations", selectedId), {
            [`typing.${user.uid}`]: true
        })

        // Clear previous timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

        // Set timeout to clear typing status
        typingTimeoutRef.current = setTimeout(() => {
            updateDoc(doc(db, "conversations", selectedId), {
                [`typing.${user.uid}`]: false
            })
        }, 3000)
    }

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if ((!message.trim() && !isRecording) || !selectedId || !user) return

        const messageText = message
        const currentReplyingTo = replyingTo
        const currentEditingMsg = editingMessage

        setMessage("")
        setReplyingTo(null)
        setEditingMessage(null)

        try {
            const convDoc = doc(db, "conversations", selectedId)
            const chat = conversations.find(c => c.id === selectedId)
            const otherParticipantId = chat?.participants.find((p: string) => p !== user.uid)

            if (currentEditingMsg) {
                // UPDATE Existing
                await updateDoc(doc(db, "conversations", selectedId, "messages", currentEditingMsg.id), {
                    text: messageText,
                    isEdited: true,
                    editedAt: serverTimestamp()
                })

                // Update last message if it was the last one
                if (chat?.lastMessage === currentEditingMsg.text) {
                    await updateDoc(convDoc, { lastMessage: messageText })
                }
                return
            }

            // ADD New
            await addDoc(collection(db, "conversations", selectedId, "messages"), {
                text: messageText,
                senderId: user.uid,
                timestamp: serverTimestamp(),
                status: 'sent',
                type: 'text',
                replyTo: currentReplyingTo ? {
                    id: currentReplyingTo.id,
                    text: currentReplyingTo.text,
                    senderName: userProfiles[currentReplyingTo.senderId]?.displayName || "User"
                } : null
            })

            // Update parent conversation
            const updateData: any = {
                lastMessage: messageText,
                lastMessageTime: serverTimestamp(),
                lastMessageSenderId: user.uid,
                [`typing.${user.uid}`]: false
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

    // Audio Functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data)
            }

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' })
                await sendAudioMessage(audioBlob, recordingTime)

                // Cleanup stream
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)
            setRecordingTime(0)

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)

        } catch (error) {
            console.error("Error starting recording:", error)
            alert("Could not access microphone")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
        }
    }

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            // Override onstop to do nothing
            mediaRecorderRef.current.onstop = null
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
            // Cleanup stream tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }
    }

    const sendAudioMessage = async (audioBlob: Blob, duration: number) => {
        if (!selectedId || !user) return

        try {
            // Upload to Storage
            const storageRef = ref(storage, `audio/${selectedId}/${Date.now()}.mp3`)
            await uploadBytes(storageRef, audioBlob)
            const downloadUrl = await getDownloadURL(storageRef)

            // Save to Firestore
            await addDoc(collection(db, "conversations", selectedId, "messages"), {
                type: 'audio',
                audioUrl: downloadUrl,
                duration: duration,
                text: '🎤 Audio Message', // Fallback text
                senderId: user.uid,
                timestamp: serverTimestamp(),
                status: 'sent'
            })

            // Update conversation
            const convDoc = doc(db, "conversations", selectedId)
            const chat = conversations.find(c => c.id === selectedId)
            const otherParticipantId = chat?.participants.find((p: string) => p !== user.uid)

            const updateData: any = {
                lastMessage: '🎤 Audio Message',
                lastMessageTime: serverTimestamp(),
                lastMessageSenderId: user.uid,
                [`typing.${user.uid}`]: false
            }

            if (otherParticipantId) {
                updateData[`unreadCounts.${otherParticipantId}`] = increment(1)
            }

            await updateDoc(convDoc, updateData)

        } catch (error) {
            console.error("Error uploading audio:", error)
        }
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Audio Player Component (Inline)
    const AudioPlayer = ({ src, duration }: { src: string, duration: number }) => {
        const audioRef = useRef<HTMLAudioElement>(null)
        const [isPlaying, setIsPlaying] = useState(false)
        const [progress, setProgress] = useState(0)

        const togglePlay = () => {
            if (audioRef.current) {
                if (isPlaying) {
                    audioRef.current.pause()
                } else {
                    // Pause others if needed (global state not implemented for simplicity, but acceptable)
                    audioRef.current.play()
                }
                setIsPlaying(!isPlaying)
            }
        }

        useEffect(() => {
            const audio = audioRef.current
            if (!audio) return

            const updateProgress = () => {
                if (audio.duration) {
                    setProgress((audio.currentTime / audio.duration) * 100)
                }
            }

            const handleEnded = () => {
                setIsPlaying(false)
                setProgress(0)
            }

            audio.addEventListener('timeupdate', updateProgress)
            audio.addEventListener('ended', handleEnded)

            return () => {
                audio.removeEventListener('timeupdate', updateProgress)
                audio.removeEventListener('ended', handleEnded)
            }
        }, [])

        return (
            <div className="flex items-center gap-3 w-[200px]">
                <audio ref={audioRef} src={src} preload="metadata" />
                <button
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-all shrink-0"
                >
                    {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4" fill="currentColor ml-0.5" />}
                </button>
                <div className="flex-1 flex flex-col gap-1">
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all duration-100" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[9px] font-bold opacity-60 tabular-nums">
                        {formatDuration(duration || 0)}
                    </span>
                </div>
            </div>
        )
    }

    const handleDeleteMessage = async (msgId: string) => {
        if (!selectedId) return
        try {
            await deleteDoc(doc(db, "conversations", selectedId, "messages", msgId))
            setShowContextMenu(null)
        } catch (e) {
            console.error("Error deleting message:", e)
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
        <div
            className={cn(
                "bg-[#0C0C0C] text-white flex overflow-hidden font-sans relative transition-all duration-300",
                isHeaderHidden ? "fixed inset-0 z-[55]" : "relative"
            )}
            style={{ height: viewportHeight }}
        >

            {/* Left Sidebar */}
            <div className={cn(
                "w-full lg:w-[380px] border-r border-white/5 flex flex-col bg-[#0C0C0C] transition-all duration-300 absolute lg:relative z-50 lg:z-30 h-full",
                isSidebarVisible ? "left-0" : "-left-full lg:left-0"
            )}>

                {/* Sidebar Search */}
                <div className="px-5 py-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyber-pink transition-colors" />
                        <input
                            type="text"
                            placeholder="Search interactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-cyber-pink/50 transition-all placeholder:text-white/10"
                        />
                    </div>
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
                <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 lg:pb-0">
                    {conversations
                        .filter(chat => {
                            const info = getChatHeaderInfo(chat)
                            return info.name.toLowerCase().includes(searchTerm.toLowerCase())
                        })
                        .length > 0 ? conversations
                            .filter(chat => {
                                const info = getChatHeaderInfo(chat)
                                return info.name.toLowerCase().includes(searchTerm.toLowerCase())
                            })
                            .map((chat) => {
                                const info = getChatHeaderInfo(chat)
                                return (
                                    <div
                                        key={chat.id}
                                        onClick={() => {
                                            setSelectedId(chat.id)
                                            setIsSidebarVisible(false)
                                        }}
                                        className={`px-4 py-1 cursor-pointer transition-all`}
                                    >
                                        <div className={`flex items-center gap-3 p-3 rounded-2xl relative transition-all ${selectedId === chat.id ? 'bg-[#FF2D6C]' : 'hover:bg-white/5'}`}>
                                            <div
                                                className="relative shrink-0 cursor-pointer"
                                                onClick={(e) => {
                                                    const otherId = chat.participants.find((p: string) => p !== user?.uid)
                                                    if (otherId && liveUsers[otherId]) {
                                                        e.stopPropagation() // Prevent selecting chat
                                                        setLiveMode('watch')
                                                        setLiveStreamUrl(liveUsers[otherId].liveStreamUrl || "https://res.cloudinary.com/dzvwfdpxw/video/live/live_stream_2605152ed997494f9a89330a3ebdc2c6_hls.m3u8")
                                                        setCurrentBroadcasterName(info.name)
                                                        setShowLiveModal(true)
                                                    }
                                                }}
                                            >
                                                {(() => {
                                                    const otherId = chat.participants.find((p: string) => p !== user?.uid)
                                                    const isUserLive = otherId && liveUsers[otherId]

                                                    return (
                                                        <div className={`rounded-full p-[2px] ${isUserLive ? 'bg-gradient-to-tr from-cyber-pink to-purple-600 animate-pulse' : 'border border-white/10'}`}>
                                                            <img
                                                                src={info.avatar || `https://ui-avatars.com/api/?name=${info.name}&background=random`}
                                                                loading="lazy"
                                                                decoding="async"
                                                                className="w-11 h-11 rounded-full object-cover border-2 border-black"
                                                                alt=""
                                                            />
                                                        </div>
                                                    )
                                                })()}
                                                {(() => {
                                                    const otherId = chat.participants.find((p: string) => p !== user?.uid)
                                                    return otherId && chat.onlineStatus?.[otherId] ? (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0C0C0C]" />
                                                    ) : null
                                                })()}
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
                        <div className="h-16 lg:h-20 px-4 lg:px-8 flex items-center justify-between border-b border-white/5 bg-[#0C0C0C]/80 backdrop-blur-xl sticky top-0 z-40">
                            <div className="flex items-center gap-2 lg:gap-4 overflow-hidden">
                                <button
                                    onClick={() => setIsSidebarVisible(true)}
                                    className="lg:hidden p-2 -ml-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </button>
                                <div className="relative shrink-0">
                                    <img
                                        src={getChatHeaderInfo(conversations.find(c => c.id === selectedId)).avatar}
                                        className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/10 object-cover"
                                        alt=""
                                    />
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0C0C0C]" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h2 className="font-bold text-[14px] lg:text-[15px] flex items-center gap-1.5 truncate">
                                        {getChatHeaderInfo(conversations.find(c => c.id === selectedId)).name}
                                        {getChatHeaderInfo(conversations.find(c => c.id === selectedId)).verified && (
                                            <div className="w-3.5 h-3.5 bg-[#FF2D6C] rounded-full flex items-center justify-center shrink-0">
                                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={5} />
                                            </div>
                                        )}
                                    </h2>
                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Active Now</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 lg:gap-4">
                                <button
                                    onClick={async () => {
                                        const otherUserId = conversations.find(c => c.id === selectedId)?.participants.find(p => p !== user?.uid)
                                        const otherUserProfile = otherUserId ? userProfiles[otherUserId] : null
                                        const channelName = selectedId || 'default'

                                        // Get the actual display name with multiple fallbacks
                                        const displayName = otherUserProfile?.displayName ||
                                            otherUserProfile?.name ||
                                            otherUserProfile?.username ||
                                            'Unknown User'

                                        if (user && otherUserId) {
                                            await initiateCall(
                                                user.uid,
                                                user.displayName || user.email?.split('@')[0] || 'Unknown',
                                                user.photoURL || undefined,
                                                otherUserId,
                                                'audio',
                                                channelName
                                            )
                                            router.push(`/call?type=audio&username=${encodeURIComponent(displayName)}&channel=${channelName}&caller=true`)
                                        }
                                    }}
                                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/40 hover:text-white"
                                >
                                    <Phone className="w-4 h-4 lg:w-5 lg:h-5" />
                                </button>
                                <button
                                    onClick={async () => {
                                        const otherUserId = conversations.find(c => c.id === selectedId)?.participants.find(p => p !== user?.uid)
                                        const otherUserProfile = otherUserId ? userProfiles[otherUserId] : null
                                        const channelName = selectedId || 'default'

                                        // Get the actual display name with multiple fallbacks
                                        const displayName = otherUserProfile?.displayName ||
                                            otherUserProfile?.name ||
                                            otherUserProfile?.username ||
                                            'Unknown User'

                                        if (user && otherUserId) {
                                            await initiateCall(
                                                user.uid,
                                                user.displayName || user.email?.split('@')[0] || 'Unknown',
                                                user.photoURL || undefined,
                                                otherUserId,
                                                'video',
                                                channelName
                                            )
                                            router.push(`/call?type=video&username=${encodeURIComponent(displayName)}&channel=${channelName}&caller=true`)
                                        }
                                    }}
                                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/40 hover:text-white"
                                >
                                    <Video className="w-4 h-4 lg:w-5 lg:h-5" />
                                </button>
                                <div className="hidden lg:block w-px h-6 bg-white/10 mx-1" />
                                <button className="p-2 text-white/40 hover:text-white transition-all">
                                    <MoreHorizontal className="w-5 h-5 lg:w-6 lg:h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Container */}
                        <div
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-4 lg:p-10 flex flex-col gap-4 lg:gap-6 custom-scrollbar relative"
                        >
                            {messages.length > 0 ? (
                                <>
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.senderId === user?.uid
                                        return (
                                            <div
                                                key={msg.id || idx}
                                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}
                                                onContextMenu={(e) => {
                                                    e.preventDefault()
                                                    setShowContextMenu({ id: msg.id, x: e.clientX, y: e.clientY })
                                                }}
                                            >
                                                {msg.replyTo && (
                                                    <div className="mb-1 flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border-l-2 border-cyber-pink max-w-[50%] opacity-60">
                                                        <CornerUpLeft className="w-3 h-3 text-cyber-pink" />
                                                        <p className="text-[10px] truncate">{msg.replyTo.text}</p>
                                                    </div>
                                                )}
                                                <motion.div
                                                    key={msg.id || idx}
                                                    drag="x"
                                                    dragConstraints={{ left: 0, right: 100 }}
                                                    dragElastic={0.2}
                                                    onDragEnd={(_, info) => {
                                                        if (info.offset.x > 50) setReplyingTo(msg)
                                                    }}
                                                    className={`max-w-[75%] px-5 py-3 rounded-2xl text-[14px] relative transition-all cursor-pointer ${isMe ? 'bg-[#FF2D6C] text-white' : 'bg-white/5 text-white/80'} group-hover:scale-[1.02]`}
                                                    onDoubleClick={() => {
                                                        if (isMe) setMessageToManage(msg)
                                                    }}
                                                >
                                                    {msg.type === 'audio' && msg.audioUrl ? (
                                                        <AudioPlayer src={msg.audioUrl} duration={msg.duration || 0} />
                                                    ) : (
                                                        msg.text
                                                    )}
                                                    {msg.isEdited && (
                                                        <span className="text-[9px] opacity-40 italic block mt-1">Edited</span>
                                                    )}

                                                    {/* Swipe to reply indicator */}
                                                    <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-drag:opacity-100 transition-opacity">
                                                        <CornerUpLeft className="w-5 h-5 text-cyber-pink" />
                                                    </div>
                                                </motion.div>
                                                <div className="mt-1 flex items-center gap-2 px-1">
                                                    <span className="text-[10px] font-black text-white/20 uppercase">
                                                        {formatTime(msg.timestamp)}
                                                    </span>
                                                    {isMe && (
                                                        <div className="flex items-center">
                                                            <Check className={`w-3 h-3 ${msg.status === 'read' ? 'text-[#00F3FF]' : 'text-white/20'}`} />
                                                            {msg.status === 'read' && <Check className="w-3 h-3 text-[#00F3FF] -ml-1.5" />}
                                                        </div>
                                                    )}
                                                </div>

                                                <AnimatePresence>
                                                    {showContextMenu && showContextMenu.id === msg.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            className="fixed z-50 bg-[#1A1A1A] border border-white/10 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 min-w-[140px]"
                                                            style={{
                                                                left: Math.min(showContextMenu.x, (typeof window !== 'undefined' ? window.innerWidth : 1000) - 160),
                                                                top: Math.min(showContextMenu.y, (typeof window !== 'undefined' ? window.innerHeight : 1000) - 200)
                                                            }}
                                                            onMouseLeave={() => setShowContextMenu(null)}
                                                        >
                                                            <button
                                                                onClick={() => { setReplyingTo(msg); setShowContextMenu(null); }}
                                                                className="flex items-center gap-3 w-full px-3 py-2 hover:bg-white/5 rounded-xl text-[12px] font-bold transition-all text-white/60 hover:text-white"
                                                            >
                                                                <CornerUpLeft className="w-4 h-4" /> Reply
                                                            </button>
                                                            {isMe && (
                                                                <>
                                                                    <button
                                                                        onClick={() => { setEditingMessage(msg); setMessage(msg.text); setShowContextMenu(null); }}
                                                                        className="flex items-center gap-3 w-full px-3 py-2 hover:bg-white/5 rounded-xl text-[12px] font-bold transition-all text-white/60 hover:text-white"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" /> Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                                        className="flex items-center gap-3 w-full px-3 py-2 hover:bg-red-500/10 rounded-xl text-[12px] font-bold transition-all text-red-500 hover:text-red-400"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" /> Unsend
                                                                    </button>
                                                                </>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )
                                    })}
                                    {otherUserTyping && (
                                        <div className="flex items-center gap-3 px-1 mb-2">
                                            <img
                                                src={getChatHeaderInfo(conversations.find(c => c.id === selectedId)).avatar}
                                                className="w-8 h-8 rounded-full border border-white/10 object-cover"
                                                alt=""
                                            />
                                            <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    )}
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
                            <AnimatePresence>
                                {showScrollDown && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                        onClick={scrollToBottom}
                                        className="fixed bottom-32 lg:bottom-40 right-6 lg:right-1/4 z-40 w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all shadow-2xl"
                                    >
                                        <ArrowDown className="w-6 h-6 text-white" />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-pink rounded-full border-2 border-[#0C0C0C]" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer: Input and Sticker Toolbar */}
                        <div className="p-4 lg:p-8 pb-32 lg:pb-10 flex flex-col items-center gap-2 lg:gap-4 relative">

                            {/* Reply/Edit Previews */}
                            <AnimatePresence>
                                {replyingTo && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="w-full max-w-3xl bg-[#1A1A1A]/90 border border-white/5 p-3 lg:p-4 rounded-2xl flex items-center justify-between mb-1 backdrop-blur-xl"
                                    >
                                        <div className="flex flex-col gap-1 overflow-hidden">
                                            <div className="flex items-center gap-2">
                                                <CornerUpLeft className="w-3 h-3 text-[#FF2D6C]" />
                                                <span className="text-[10px] font-black uppercase text-[#FF2D6C]">Replying to {userProfiles[replyingTo.senderId]?.displayName || "User"}</span>
                                            </div>
                                            <p className="text-[11px] lg:text-[12px] opacity-40 truncate">{replyingTo.text}</p>
                                        </div>
                                        <button onClick={() => setReplyingTo(null)} className="p-1.5 hover:bg-white/10 rounded-full transition-all">
                                            <X className="w-4 h-4 opacity-40" />
                                        </button>
                                    </motion.div>
                                )}
                                {editingMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="w-full max-w-3xl bg-[#1A1A1A]/90 border border-white/5 p-3 lg:p-4 rounded-2xl flex items-center justify-between mb-1 backdrop-blur-xl"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <Edit2 className="w-3 h-3 text-[#00F3FF]" />
                                                <span className="text-[10px] font-black uppercase text-[#00F3FF]">Editing Message</span>
                                            </div>
                                            <p className="text-[11px] lg:text-[12px] opacity-40 truncate">{editingMessage.text}</p>
                                        </div>
                                        <button onClick={() => { setEditingMessage(null); setMessage(""); }} className="p-1.5 hover:bg-white/10 rounded-full transition-all">
                                            <X className="w-4 h-4 opacity-40" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Emoji Picker Popover */}
                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full right-4 lg:right-auto lg:left-1/2 lg:-translate-x-1/2 mb-4 z-[60]"
                                    >
                                        <div className="relative group">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-cyber-pink to-cyber-cyan rounded-[2rem] opacity-20 blur group-hover:opacity-40 transition duration-1000"></div>
                                            <div className="relative">
                                                <EmojiPicker
                                                    onEmojiClick={(emojiData) => {
                                                        onEmojiClick(emojiData)
                                                        setShowEmojiPicker(false)
                                                    }}
                                                    theme={'dark' as any}
                                                    autoFocusSearch={false}
                                                    width={pickerWidth}
                                                    height={400}
                                                    skinTonesDisabled
                                                    lazyLoadEmojis={true}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Input Bar */}
                            <form onSubmit={handleSendMessage} className="w-full max-w-3xl flex items-center gap-2 lg:gap-4 relative">
                                <button type="button" className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl lg:rounded-2xl transition-all border border-white/5 shrink-0">
                                    <Plus className="w-5 h-5 lg:w-6 lg:h-6 opacity-40" />
                                </button>

                                <div className="flex-1 bg-white/5 border border-white/5 rounded-xl lg:rounded-2xl flex items-center h-10 lg:h-12 px-4 lg:px-6 focus-within:bg-white/[0.08] focus-within:border-white/10 transition-all">
                                    <input
                                        type="text"
                                        placeholder={isRecording ? "Listening..." : (editingMessage ? "Update message..." : "Message...")}
                                        value={message}
                                        onChange={(e) => handleInput(e.target.value)}
                                        onFocus={() => setShowEmojiPicker(false)}
                                        disabled={isRecording}
                                        className="flex-1 bg-transparent border-none outline-none text-[12px] lg:text-[13px] font-bold text-white placeholder:text-white/20 disabled:text-white/40"
                                    />

                                    {/* Recording Indicator */}
                                    {isRecording && (
                                        <div className="absolute left-16 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                            <span className="text-xs font-bold text-red-500">{formatDuration(recordingTime)}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 lg:gap-4 ml-2">
                                        <AnimatePresence mode="wait">
                                            {isRecording ? (
                                                <motion.div
                                                    key="recording-actions"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="flex items-center gap-4"
                                                >
                                                    <button type="button" onClick={cancelRecording} className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-wider">Cancel</button>
                                                    <button
                                                        type="button"
                                                        onClick={stopRecording}
                                                        className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse"
                                                    >
                                                        <SendHorizontal className="w-4 h-4 text-white" />
                                                    </button>
                                                </motion.div>
                                            ) : !message.trim() ? (
                                                <motion.div
                                                    key="empty-actions"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="flex items-center gap-3 lg:gap-4"
                                                >
                                                    <Smile
                                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                        className={cn(
                                                            "w-5 h-5 transition-colors cursor-pointer",
                                                            showEmojiPicker ? "text-cyber-pink" : "text-white/40 hover:text-white"
                                                        )}
                                                    />
                                                    <Mic onClick={startRecording} className="w-5 h-5 text-white/40 hover:text-cyber-pink cursor-pointer transition-colors" />
                                                    <ImageIcon className="hidden sm:block w-5 h-5 text-white/40 hover:text-white cursor-pointer transition-colors" />
                                                    <div className="hidden lg:block"><GiftIcon /></div>
                                                </motion.div>
                                            ) : (
                                                <motion.button
                                                    key="send-action"
                                                    type="submit"
                                                    initial={{ opacity: 0, x: 10, scale: 0.8 }}
                                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                                    exit={{ opacity: 0, x: 10, scale: 0.8 }}
                                                    className="w-8 h-8 bg-cyber-pink rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,45,108,0.4)] transition-all hover:scale-110 active:scale-95"
                                                >
                                                    <SendHorizontal className="w-4 h-4 text-white" />
                                                </motion.button>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="hidden lg:flex flex-1 flex flex-col items-center justify-center space-y-4 opacity-10">
                        <MessageSquare className="w-16 h-16" />
                        <h3 className="font-bold">Select a connection</h3>
                    </div>
                )}
            </div>

            {/* Right Side Control Bar - Hidden on Mobile */}
            <div className="hidden lg:flex w-[100px] border-l border-white/5 bg-[#0C0C0C] flex flex-col items-center py-10 gap-16">

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
                <button
                    onClick={() => {
                        setLiveMode('broadcast')
                        setShowLiveModal(true)
                    }}
                    className="w-14 h-14 bg-[#FF2D6C] rounded-full flex items-center justify-center shadow-[0_15px_30px_rgba(255,45,108,0.3)] hover:scale-110 active:scale-95 transition-all"
                >
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

            {/* Simple Modal for Edit/Unsend */}
            <AnimatePresence>
                {messageToManage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-pink to-transparent opacity-50" />

                            <h3 className="text-xl font-black mb-6 text-center tracking-tight">Manage Message</h3>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setEditingMessage(messageToManage)
                                        setMessage(messageToManage.text)
                                        setMessageToManage(null)
                                    }}
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all border border-white/5"
                                >
                                    <Edit2 className="w-5 h-5 text-cyber-cyan" /> Edit Message
                                </button>

                                <button
                                    onClick={() => {
                                        handleDeleteMessage(messageToManage.id)
                                        setMessageToManage(null)
                                    }}
                                    className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all border border-red-500/20 text-red-500"
                                >
                                    <Trash2 className="w-5 h-5" /> Unsend
                                </button>

                                <button
                                    onClick={() => setMessageToManage(null)}
                                    className="w-full py-4 mt-2 text-white/40 hover:text-white font-bold transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Incoming Call Modal */}
            <IncomingCallModal
                isOpen={!!incomingCall}
                callerName={incomingCall?.callerName || 'Unknown'}
                callerAvatar={incomingCall?.callerAvatar}
                callType={incomingCall?.callType || 'audio'}
                channelName={incomingCall?.channelName || ''}
                onAccept={handleAcceptCall}
                onDecline={handleDeclineCall}
            />

            {/* Live Stream Modal */}
            <LiveStreamModal
                isOpen={showLiveModal}
                onClose={() => setShowLiveModal(false)}
                mode={liveMode}
                watchUrl={liveStreamUrl}
                broadcasterName={currentBroadcasterName}
            />
        </div>
    )
}
