// Mux Configuration
export const muxConfig = {
    // These should ideally be in environment variables
    tokenId: '2966b0b9-f4b9-4aff-b3ff-70cece4c72f3',
    tokenSecret: 'ibqKgbJMorl4VijAweAfuYq2Ig2qKRaxbCqmhVKpfVdAlFKQpjkv42W+iZ9cBLPonA77z9ObKnM',
    environmentId: 'k72ga0',
};

export interface MuxAsset {
    id: string;
    playbackId: string;
    status: string;
    duration?: number;
}

export interface UploadResult {
    success: boolean;
    uploadUrl?: string;
    id?: string;
    playbackId?: string;
    error?: string;
}

// Get Mux playback URL
export function getMuxPlaybackUrl(playbackId: string): string {
    // Mux usually uses HLS (.m3u8) for playback
    return `https://stream.mux.com/${playbackId}.m3u8`;
}

// Get Mux thumbnail URL
export function getMuxThumbnail(playbackId: string, options?: {
    width?: number;
    height?: number;
    time?: number;
}): string {
    if (!playbackId) return '';
    const params = new URLSearchParams();
    if (options?.width) params.append('width', options.width.toString());
    if (options?.height) params.append('height', options.height.toString());
    if (options?.time) params.append('time', options.time.toString());

    const queryString = params.toString();
    return `https://image.mux.com/${playbackId}/thumbnail.jpg${queryString ? `?${queryString}` : ''}`;
}

/**
 * Creates a Mux Direct Upload
 * This must be called from the server-side usually, 
 * so we'll route it through our API.
 */
export async function createMuxUpload(): Promise<UploadResult> {
    try {
        const response = await fetch('/api/mux/upload', {
            method: 'POST',
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating Mux upload:', error);
        return { success: false, error: 'Failed to create upload URL' };
    }
}

/**
 * Uploads a file to a Mux signed URL
 */
export async function uploadFileToMux(file: File, uploadUrl: string): Promise<boolean> {
    try {
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });
        return response.ok;
    } catch (error) {
        console.error('Error uploading to Mux URL:', error);
        return false;
    }
}
