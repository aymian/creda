import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CLOUDINARY_CLOUD_NAME = 'dzvwfdpxw';
const CLOUDINARY_API_KEY = '413841767416773';
const CLOUDINARY_API_SECRET = '3yDMOJPDp0LT85l7i-j_qdT1sNw';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'creda';

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        // Determine resource type
        const resourceType = file.type.startsWith('video') ? 'video' : 'image';

        // Prepare signature parameters
        const timestamp = Math.round(new Date().getTime() / 1000);
        const params: Record<string, any> = {
            folder: folder,
            timestamp: timestamp,
        };

        // Sort parameters alphabetically for signature
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');

        const signature = crypto
            .createHash('sha1')
            .update(sortedParams + CLOUDINARY_API_SECRET)
            .digest('hex');

        // Build Cloudinary upload form
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', file);
        cloudinaryFormData.append('api_key', CLOUDINARY_API_KEY);
        cloudinaryFormData.append('timestamp', timestamp.toString());
        cloudinaryFormData.append('folder', folder);
        cloudinaryFormData.append('signature', signature);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: cloudinaryFormData,
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Cloudinary API error:', data);
            return NextResponse.json({
                success: false,
                error: data.error?.message || 'Cloudinary upload failed'
            }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            url: data.secure_url,
            publicId: data.public_id,
            resourceType: data.resource_type,
        });

    } catch (error) {
        console.error('Cloudinary route error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
