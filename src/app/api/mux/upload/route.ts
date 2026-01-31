import { NextResponse } from 'next/server';

// These should be in environment variables!
const MUX_TOKEN_ID = '2966b0b9-f4b9-4aff-b3ff-70cece4c72f3';
const MUX_TOKEN_SECRET = 'ibqKgbJMorl4VijAweAfuYq2Ig2qKRaxbCqmhVKpfVdAlFKQpjkv42W+iZ9cBLPonA77z9ObKnM';

export async function POST() {
    if (!MUX_TOKEN_SECRET) {
        return NextResponse.json(
            { success: false, error: 'Mux Token Secret is missing in environment variables' },
            { status: 500 }
        );
    }

    try {
        const response = await fetch('https://api.mux.com/video/v1/uploads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`,
            },
            body: JSON.stringify({
                new_asset_settings: {
                    playback_policy: ['public'],
                },
                cors_origin: '*', // Adjust this for production
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Mux API error:', data);
            return NextResponse.json(
                { success: false, error: data.error?.message || 'Failed to create Mux upload' },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            uploadUrl: data.data.url,
            id: data.data.id,
        });
    } catch (error) {
        console.error('Mux upload route error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
