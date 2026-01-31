import { NextRequest, NextResponse } from 'next/server';

const bunnyConfig = {
    storageZoneName: 'creda-assets',
    hostname: 'storage.bunnycdn.com',
    accessKey: 'de2f9a1a-227a-4ac3-83bd-597e-6357-f7ff-4044',
    cdnUrl: 'https://creda.b-cdn.net',
    apiUrl: 'https://storage.bunnycdn.com/creda-assets',
};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || '';

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // Create unique filename
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const uploadPath = folder ? `${folder}/${fileName}` : fileName;
        const uploadUrl = `${bunnyConfig.apiUrl}/${uploadPath}`;

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Bunny.net
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'AccessKey': bunnyConfig.accessKey,
                'Content-Type': file.type,
            },
            body: buffer,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Bunny.net upload error:', response.status, errorText);
            return NextResponse.json(
                { success: false, error: `Upload failed: ${response.statusText}` },
                { status: response.status }
            );
        }

        // Return the CDN URL
        const cdnUrl = `${bunnyConfig.cdnUrl}/${uploadPath}`;

        return NextResponse.json({
            success: true,
            url: cdnUrl,
            fileName: fileName,
            path: uploadPath,
        });

    } catch (error) {
        console.error('Upload API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed'
            },
            { status: 500 }
        );
    }
}
