# Bunny.net Integration Guide

## Configuration

Your Bunny.net storage is configured in `src/lib/bunny.ts`:

- **Storage Zone**: creda-assets
- **Hostname**: storage.bunnycdn.com
- **Access Key**: de2f9a1a-227a-4ac3-83bd-597e6357-f7ff-4044
- **CDN URL**: https://creda-assets.b-cdn.net (update this in bunny.ts)

## Important: Get Your Pull Zone URL

1. Log into your Bunny.net dashboard
2. Go to your Pull Zone settings
3. Copy your Pull Zone URL (e.g., `https://creda-assets.b-cdn.net`)
4. Update the `cdnUrl` in `src/lib/bunny.ts` line 6

## How It Works

### Upload Flow
1. User selects a video/image in the create page
2. File is uploaded directly to Bunny.net storage via API
3. The CDN URL is saved to Firestore
4. Videos are served from Bunny.net's global CDN

### File Organization
- Videos are stored in: `/videos/`
- Images are stored in: `/images/`
- Files are automatically named with timestamp to prevent conflicts

### Usage in Code

```typescript
import { uploadToBunny, getBunnyVideoUrl, getBunnyThumbnail } from '@/lib/bunny'

// Upload a file
const result = await uploadToBunny(file, 'videos')
if (result.success) {
  console.log('Video URL:', result.url)
}

// Get optimized video URL
const videoUrl = getBunnyVideoUrl('videos/1234567890-video.mp4', {
  width: 1920,
  height: 1080,
  quality: 80
})

// Get video thumbnail
const thumbnail = getBunnyThumbnail('videos/1234567890-video.mp4', 5)
```

## Benefits

✅ **Fast Global CDN** - Videos load quickly worldwide
✅ **Cost Effective** - Much cheaper than other CDN providers
✅ **Video Optimization** - Automatic transcoding and optimization
✅ **Reliable** - 99.9% uptime SLA
✅ **Simple API** - Easy to integrate and use

## Next Steps

1. Update the `cdnUrl` in `src/lib/bunny.ts` with your actual Pull Zone URL
2. Test uploading a video in the create page
3. Verify the video plays correctly in the feed
4. (Optional) Set up video thumbnails for better UX
5. (Optional) Configure video transcoding in Bunny.net dashboard

## Troubleshooting

**Upload fails with 401**: Check your access key is correct
**Videos don't play**: Verify your Pull Zone URL is correct
**CORS errors**: Enable CORS in your Bunny.net Pull Zone settings
