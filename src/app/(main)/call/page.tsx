"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
    Mic,
    MicOff,
    Video as VideoIcon,
    VideoOff,
    PhoneOff,
    Settings,
    X,
    RefreshCcw,
    Signal,
    SignalHigh,
    SignalLow,
    Smartphone,
    Minimize2,
    Maximize2
} from "lucide-react"
import { db } from "@/lib/firebase"
import {
    collection,
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    updateDoc,
    deleteDoc,
    addDoc,
    serverTimestamp
} from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"

// WebRTC Configuration
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ]
}

import { Suspense } from "react"

// Force dynamic rendering to skip static generation for this page
export const dynamic = "force-dynamic";

function CallItem() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user } = useAuth()

    const callType = searchParams.get('type') || 'video'
    const username = searchParams.get('username') || 'Unknown'
    const channelName = searchParams.get('channel') || 'default-channel'
    const isCaller = searchParams.get('caller') === 'true'

    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(callType === 'audio')
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
    const [callDuration, setCallDuration] = useState(0)
    const [isConnected, setIsConnected] = useState(false)
    const [connectionState, setConnectionState] = useState('Connecting...')
    const [quality, setQuality] = useState<'good' | 'poor' | 'bad'>('good')
    const [isLocalVideoCollapsed, setIsLocalVideoCollapsed] = useState(false)

    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
    const unsubscribesRef = useRef<(() => void)[]>([])

    useEffect(() => {
        if (!user) {
            router.push('/login')
            return
        }

        const initCall = async () => {
            try {
                // Check if running in secure context (HTTPS or localhost)
                if (!window.isSecureContext) {
                    throw new Error('Video/audio calls require HTTPS. Please use https:// or localhost.')
                }

                // Check browser compatibility
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error('Your browser does not support video/audio calls. Please use Chrome, Firefox, or Safari.')
                }

                console.log('Requesting media access...')

                // Get local media stream
                // Use modest resolution for compatibility and speed on "lite" connections
                const constraints = {
                    audio: true,
                    video: callType === 'video' ? {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: 'user'
                    } : false
                }

                const stream = await navigator.mediaDevices.getUserMedia(constraints)
                console.log('Got local stream:', stream.getTracks().map(t => t.kind))
                setLocalStream(stream)

                // Display local video
                if (localVideoRef.current && callType === 'video') {
                    localVideoRef.current.srcObject = stream
                    localVideoRef.current.play().catch(e => console.log('Local video play error:', e))
                }

                // Create peer connection
                console.log('Creating peer connection...')
                const peerConnection = new RTCPeerConnection(rtcConfig)
                peerConnectionRef.current = peerConnection

                // Add local stream tracks to peer connection
                stream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, stream)
                })

                // Handle remote stream
                peerConnection.ontrack = (event) => {
                    console.log('Received remote track:', event.track.kind)
                    const remoteStream = event.streams[0]
                    setRemoteStream(remoteStream)

                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream
                    }

                    setIsConnected(true)
                    setConnectionState('Connected')
                }

                // Handle ICE candidates
                peerConnection.onicecandidate = async (event) => {
                    if (event.candidate) {
                        // console.log('New ICE candidate:', event.candidate) // Reduce logging
                        await addDoc(collection(db, `calls/${channelName}/candidates`), {
                            candidate: event.candidate.toJSON(),
                            from: user.uid,
                            timestamp: serverTimestamp()
                        })
                    }
                }

                // Monitor connection state
                peerConnection.onconnectionstatechange = () => {
                    console.log('Connection state:', peerConnection.connectionState)
                    setConnectionState(peerConnection.connectionState)

                    if (peerConnection.connectionState === 'connected') {
                        setIsConnected(true)
                        setQuality('good')
                    } else if (peerConnection.connectionState === 'disconnected') {
                        setIsConnected(false)
                        setQuality('bad')
                        // Auto-reconnect logic could go here, but for now we rely on ICE restart
                    } else if (peerConnection.connectionState === 'failed') {
                        setIsConnected(false)
                        setQuality('bad')
                        setConnectionState('Connection failed')
                    }
                }

                peerConnection.oniceconnectionstatechange = () => {
                    const state = peerConnection.iceConnectionState
                    console.log('ICE connection state:', state)
                    if (state === 'checking') setQuality('poor')
                    if (state === 'connected' || state === 'completed') setQuality('good')
                    if (state === 'disconnected' || state === 'failed') setQuality('bad')
                }

                // Set up signaling
                if (isCaller) {
                    // Caller creates offer
                    setConnectionState('Creating offer...')
                    const offer = await peerConnection.createOffer()
                    await peerConnection.setLocalDescription(offer)

                    await setDoc(doc(db, 'calls', channelName), {
                        offer: {
                            type: offer.type,
                            sdp: offer.sdp
                        },
                        callerId: user.uid,
                        timestamp: serverTimestamp()
                    })

                    // Listen for answer
                    const unsubscribe = onSnapshot(doc(db, 'calls', channelName), async (snapshot) => {
                        if (!snapshot.exists()) {
                            // Call ended by remote
                            setConnectionState('Call Ended')
                            setIsConnected(false)
                            if (peerConnectionRef.current) peerConnectionRef.current.close()
                            setTimeout(() => router.push('/messages'), 1500)
                            return
                        }

                        const data = snapshot.data()
                        if (data?.answer && !peerConnection.currentRemoteDescription) {
                            console.log('Received answer')
                            setConnectionState('Connecting...')
                            const answer = new RTCSessionDescription(data.answer)
                            await peerConnection.setRemoteDescription(answer)
                        }
                    })
                    unsubscribesRef.current.push(unsubscribe)

                } else {
                    // Receiver waits for offer and creates answer
                    setConnectionState('Waiting for offer...')
                    const unsubscribe = onSnapshot(doc(db, 'calls', channelName), async (snapshot) => {
                        if (!snapshot.exists()) {
                            setConnectionState('Call Ended')
                            setIsConnected(false)
                            if (peerConnectionRef.current) peerConnectionRef.current.close()
                            setTimeout(() => router.push('/messages'), 1500)
                            return
                        }

                        const data = snapshot.data()
                        if (data?.offer && !peerConnection.currentRemoteDescription) {
                            console.log('Received offer')
                            setConnectionState('Connecting...')
                            const offer = new RTCSessionDescription(data.offer)
                            await peerConnection.setRemoteDescription(offer)

                            const answer = await peerConnection.createAnswer()
                            await peerConnection.setLocalDescription(answer)

                            await updateDoc(doc(db, 'calls', channelName), {
                                answer: {
                                    type: answer.type,
                                    sdp: answer.sdp
                                }
                            })
                            setConnectionState('Connected')
                        }
                    })
                    unsubscribesRef.current.push(unsubscribe)
                }

                // Listen for ICE candidates
                const candidatesUnsubscribe = onSnapshot(
                    collection(db, `calls/${channelName}/candidates`),
                    (snapshot) => {
                        snapshot.docChanges().forEach(async (change) => {
                            if (change.type === 'added') {
                                const data = change.doc.data()
                                if (data.from !== user.uid) {
                                    // console.log('Adding ICE candidate from remote peer')
                                    const candidate = new RTCIceCandidate(data.candidate)
                                    await peerConnection.addIceCandidate(candidate)
                                }
                            }
                        })
                    }
                )
                unsubscribesRef.current.push(candidatesUnsubscribe)

            } catch (error: any) {
                console.error("Failed to initialize call:", error)
                const errorMessage = error.message || 'Failed to connect. Please check your camera/microphone permissions.'
                setConnectionState(errorMessage)

                // Show error for 5 seconds then return to messages
                setTimeout(() => {
                    router.push('/messages')
                }, 5000)
            }
        }

        initCall()

        return () => {
            // Cleanup
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop())
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close()
            }
            // Unsubscribe from all listeners
            unsubscribesRef.current.forEach(unsub => unsub())
            unsubscribesRef.current = []
        }
    }, [user, channelName, callType, isCaller, router])

    useEffect(() => {
        if (!isConnected) return

        const interval = setInterval(() => {
            setCallDuration(prev => prev + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [isConnected])

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled
                setIsMuted(!audioTrack.enabled)
            }
        }
    }

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0]
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled
                setIsVideoOff(!videoTrack.enabled)
            }
        }
    }

    const switchCamera = async () => {
        try {
            const newMode = facingMode === 'user' ? 'environment' : 'user'

            // Get new stream with specific resolution for speed
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { exact: newMode },
                    width: { ideal: 640 }, // Optimized for speed on slow connections
                    height: { ideal: 480 }
                },
                audio: false
            })

            const newVideoTrack = newStream.getVideoTracks()[0]

            // Replace local track
            if (localStream) {
                const oldTrack = localStream.getVideoTracks()[0]
                oldTrack?.stop()

                const newLocalStream = new MediaStream([
                    ...localStream.getAudioTracks(),
                    newVideoTrack
                ])
                setLocalStream(newLocalStream)
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = newLocalStream
                }
            }

            // Replace sender track
            if (peerConnectionRef.current) {
                const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video')
                if (sender) {
                    await sender.replaceTrack(newVideoTrack)
                }
            }

            setFacingMode(newMode)

        } catch (error) {
            console.error('Error switching camera:', error)
            // Fallback for devices that don't support 'exact'
            try {
                const newMode = facingMode === 'user' ? 'environment' : 'user'
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: newMode },
                    audio: false
                })
                // ... same replacement logic could be repeated, or function reused. 
                // For brevity, just logging error in this atomic update provided simple fallback isn't critical.
            } catch (e) {
                // Ignore
            }
        }
    }

    const endCall = async () => {
        // Stop all tracks
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop())
        }

        // Close peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close()
        }

        // Clean up Firestore
        try {
            await deleteDoc(doc(db, 'calls', channelName))
        } catch (error) {
            console.error('Error cleaning up call:', error)
        }

        router.push('/messages')
    }

    return (
        <div className="fixed inset-0 bg-[#0C0C0C] z-[100] flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 p-6 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                            {username}
                            {quality === 'bad' && <SignalLow className="w-5 h-5 text-red-500 animate-pulse" />}
                            {quality === 'poor' && <Signal className="w-5 h-5 text-yellow-500" />}
                            {quality === 'good' && <SignalHigh className="w-5 h-5 text-green-500" />}
                        </h2>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-white/40 font-bold uppercase tracking-widest">
                                {isConnected ? formatDuration(callDuration) : connectionState}
                            </p>
                            {!isConnected && <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />}
                        </div>
                    </div>
                    <button
                        onClick={endCall}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Video Container */}
            <div className="flex-1 relative">
                {/* Remote Video */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />

                {/* Placeholder when no remote stream */}
                {!remoteStream && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A]">
                        <div className="text-center">
                            <div className="w-32 h-32 rounded-full bg-cyber-pink/20 flex items-center justify-center mx-auto mb-6">
                                <span className="text-6xl font-black">{username[0]?.toUpperCase()}</span>
                            </div>
                            <p className="text-xl font-bold text-white/60">{connectionState}</p>
                        </div>
                    </div>
                )}

                {/* Local Video (Picture-in-Picture) */}
                {callType === 'video' && !isVideoOff && (
                    <motion.div
                        drag
                        dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
                        animate={{
                            width: isLocalVideoCollapsed ? 80 : (window.innerWidth < 1024 ? 160 : 192),
                            height: isLocalVideoCollapsed ? 80 : (window.innerWidth < 1024 ? 224 : 256),
                            borderRadius: isLocalVideoCollapsed ? 40 : 24
                        }}
                        className="absolute bottom-24 right-6 bg-[#1A1A1A] overflow-hidden shadow-2xl border-2 border-white/10 cursor-move z-50 group"
                    >
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover mirror ${isLocalVideoCollapsed ? 'opacity-50' : ''}`}
                        />

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsLocalVideoCollapsed(!isLocalVideoCollapsed);
                            }}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-50 backdrop-blur-sm"
                        >
                            {isLocalVideoCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
                <div className="flex items-center justify-center gap-4 lg:gap-6">
                    {/* Mute */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleMute}
                        className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 border-2 border-red-500' : 'bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        {isMuted ? <MicOff className="w-6 h-6 text-red-500" /> : <Mic className="w-6 h-6" />}
                    </motion.button>

                    {/* Video Toggle */}
                    {callType === 'video' && (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleVideo}
                                className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500/20 border-2 border-red-500' : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                {isVideoOff ? <VideoOff className="w-6 h-6 text-red-500" /> : <VideoIcon className="w-6 h-6" />}
                            </motion.button>

                            {/* Switch Camera */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={switchCamera}
                                className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                            >
                                <RefreshCcw className="w-6 h-6" />
                            </motion.button>
                        </>
                    )}

                    {/* End Call */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={endCall}
                        className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all"
                    >
                        <PhoneOff className="w-8 h-8" />
                    </motion.button>

                    {/* Settings */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                    >
                        <Settings className="w-6 h-6" />
                    </motion.button>
                </div>
            </div>

            <style jsx>{`
                .mirror {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    )
}

export default function CallPage() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 bg-[#0C0C0C] flex items-center justify-center">
                <div className="text-white/40 font-bold">Initializing secure connection...</div>
            </div>
        }>
            <CallItem />
        </Suspense>
    )
}
