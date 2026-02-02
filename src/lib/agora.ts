// Agora Configuration
export const AGORA_CONFIG = {
    appId: '03d4a11dd847459b964aad89c7673ca4',
    tempToken: '007eJxTYPhXKJHnstXxRkDTTvH0ollC3Y8dJCNNLCa8m7fGu29732sFBgPjFJNEQ8OUFAsTcxNTyyRLM5PExBQLy2RzM3Pj5EST0pSGzIZARoaPv94yMTJAIIjPxuBclJqSmMjAAACL+CDv',
    primaryCertificate: '054ac766b34048378540c6e7eb732eb3',
    chatService: {
        appKey: '4110019678#1655200',
        orgName: '4110019678',
        appName: '1655200',
        apiRequestUrl: 'msync-api-41.chat.agora.io',
        webSocketAddress: 'msync-api-41.chat.agora.io',
        restApi: 'a41.chat.agora.io'
    }
}

// Generate a channel name based on user IDs
export const generateChannelName = (userId1: string, userId2: string): string => {
    const sorted = [userId1, userId2].sort()
    return `${sorted[0]}_${sorted[1]}`
}

// Generate a unique UID for the user
export const generateUID = (): number => {
    return Math.floor(Math.random() * 1000000)
}
