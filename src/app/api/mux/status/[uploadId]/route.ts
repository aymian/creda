import { NextRequest, NextResponse } from 'next/server';

const MUX_TOKEN_ID = '2966b0b9-f4b9-4aff-b3ff-70cece4c72f3';
const MUX_TOKEN_SECRET = 'ibqKgbJMorl4VijAweAfuYq2Ig2qKRaxbCqmhVKpfVdAlFKQpjkv42W+iZ9cBLPonA77z9ObKnM';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ uploadId: string }> }
) {
    const { uploadId } = await params;

    try {
        const response = await fetch(`https://api.mux.com/video/v1/uploads/${uploadId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ success: false, error: 'Upload not found' }, { status: 404 });
        }

        const status = data.data.status;
        const assetId = data.data.asset_id;

        if (assetId) {
            // Immediately check the asset for a playback ID
            const assetResponse = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`,
                },
            });

            const assetData = await assetResponse.json();
            const playbackId = assetData.data.playback_ids?.[0]?.id;

            return NextResponse.json({
                success: true,
                status: assetData.data.status, // Use the ASSET status which is more accurate
                playbackId: playbackId,
                isReady: assetData.data.status === 'ready'
            });
        }

        return NextResponse.json({
            success: true,
            status: status,
            isReady: false
        });

    } catch (error) {
        console.error('Mux status error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
