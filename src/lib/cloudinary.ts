// Cloudinary Configuration
export const cloudinaryConfig = {
    cloudName: 'dzvwfdpxw',
    apiKey: '413841767416773',
    apiSecret: '3yDMOJPDp0LT85l7i-j_qdT1sNw',
};

/**
 * Uploads a file to Cloudinary via server-side API
 */
export async function uploadToCloudinary(
    file: File,
    folder: string = 'creda'
): Promise<{ success: boolean; url?: string; resourceType?: string; error?: string }> {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch('/api/cloudinary/upload', {
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
            resourceType: data.resourceType,
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        };
    }
}

/**
 * Get optimized Cloudinary URL for images/videos
 */
export function getCloudinaryUrl(publicId: string, options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
    resourceType?: 'image' | 'video';
} = {}): string {
    const {
        width,
        height,
        crop = 'fill',
        quality = 'auto',
        format = 'auto',
        resourceType = 'image'
    } = options;

    const transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);

    const transformString = transformations.length > 0 ? transformations.join(',') + '/' : '';

    return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/${resourceType}/upload/${transformString}${publicId}`;
}
