// Bunny.net Storage Configuration
export const bunnyConfig = {
    storageZoneName: 'creda-assets',
    hostname: 'storage.bunnycdn.com',
    accessKey: 'de2f9a1a-227a-4ac3-83bd597e6357-f7ff-4044',
    // CDN URL for accessing files (you'll need to get this from your Bunny.net dashboard)
    cdnUrl: 'https://creda.b-cdn.net',
    apiUrl: 'https://storage.bunnycdn.com/creda-assets',
};

// Upload file to Bunny.net Storage via API route
export async function uploadToBunny(
    file: File,
    path: string = ''
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', path);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Upload failed');
        }

        return {
            success: true,
            url: data.url,
        };
    } catch (error) {
        console.error('Bunny.net upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        };
    }
}

// Delete file from Bunny.net Storage
export async function deleteFromBunny(
    filePath: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const deleteUrl = `${bunnyConfig.apiUrl}/${filePath}`;

        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'AccessKey': bunnyConfig.accessKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Delete failed: ${response.statusText}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Bunny.net delete error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Delete failed',
        };
    }
}

// Get optimized video URL with transformations
export function getBunnyVideoUrl(
    path: string,
    options?: {
        width?: number;
        height?: number;
        quality?: number;
    }
): string {
    let url = `${bunnyConfig.cdnUrl}/${path}`;

    // Bunny.net supports query parameters for video optimization
    const params = new URLSearchParams();

    if (options?.width) params.append('width', options.width.toString());
    if (options?.height) params.append('height', options.height.toString());
    if (options?.quality) params.append('quality', options.quality.toString());

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
}

// Get video thumbnail
export function getBunnyThumbnail(videoPath: string, time: number = 0): string {
    // Bunny.net can generate thumbnails from videos
    return `${bunnyConfig.cdnUrl}/${videoPath}?thumbnail&time=${time}`;
}
