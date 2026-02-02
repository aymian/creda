// Call notification types
export interface CallNotification {
    id: string
    callerId: string
    callerName: string
    callerAvatar?: string
    receiverId: string
    callType: 'video' | 'audio'
    channelName: string
    status: 'ringing' | 'accepted' | 'declined' | 'missed'
    timestamp: any
}

// Helper to create a call notification in Firestore
import { db } from './firebase'
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'

export const initiateCall = async (
    callerId: string,
    callerName: string,
    callerAvatar: string | undefined,
    receiverId: string,
    callType: 'video' | 'audio',
    channelName: string
): Promise<string> => {
    const callRef = await addDoc(collection(db, 'calls'), {
        callerId,
        callerName,
        callerAvatar: callerAvatar || '',
        receiverId,
        callType,
        channelName,
        status: 'ringing',
        timestamp: serverTimestamp()
    })
    return callRef.id
}

export const updateCallStatus = async (
    callId: string,
    status: 'accepted' | 'declined' | 'missed'
) => {
    await updateDoc(doc(db, 'calls', callId), {
        status,
        updatedAt: serverTimestamp()
    })
}

export const sendMissedCallMessage = async (
    conversationId: string,
    senderId: string,
    callType: 'video' | 'audio'
) => {
    await addDoc(collection(db, `conversations/${conversationId}/messages`), {
        senderId,
        text: `📞 Missed ${callType} call`,
        type: 'system',
        callType,
        timestamp: serverTimestamp(),
        read: false
    })
}
