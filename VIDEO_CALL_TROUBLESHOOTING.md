# Video Call Troubleshooting Guide

## Issue: "Waiting for user to join" but both users are in the call

### What I Fixed:

1. **Track Publishing**: Now publishes audio and video tracks together instead of separately
2. **Video Rendering**: Added proper container clearing and re-rendering for remote video
3. **Debug Panel**: Added real-time debug information showing:
   - Connection status
   - Number of remote users
   - Local video/audio status
   - Remote user video/audio status

### How to Debug:

When you're in a call, look at the **top-left debug panel** (black box with colored text):

```
Connected: Yes/No
Remote Users: 0/1/2
Local Video: Active/None
Local Audio: Active/None
User 12345: Video=Yes/No, Audio=Yes/No
```

### Common Issues & Solutions:

#### 1. **Both users see "Waiting for X to join"**
**Cause**: Both users are in different channels
**Solution**: Make sure both users use the SAME channel name (the conversation ID)

#### 2. **Can hear audio but no video**
**Cause**: Video track not being published or rendered
**Check Debug Panel**: 
- Local Video should say "Active"
- Remote user should show "Video=Yes"
**Solution**: 
- Make sure you granted camera permissions
- Check browser console for errors

#### 3. **Remote user count is 0**
**Cause**: Users are not in the same channel OR Agora token issue
**Solution**:
- Check browser console logs for "Joining channel" messages
- Verify both users have the same channel name in the URL
- Check if Agora token is valid (temp tokens expire)

#### 4. **Can see yourself but not the other person**
**Cause**: Remote video track not being played
**Check**: Debug panel should show "User XXX: Video=Yes"
**Solution**: Already fixed in the latest code - video tracks are now properly rendered

### Testing Steps:

1. **User A** clicks call button from messages
2. **User B** receives incoming call modal
3. **User B** clicks Accept
4. **Both users** should see:
   - Debug panel showing "Connected: Yes"
   - "Remote Users: 1"
   - Each other's video (if video call)
   - Hear each other's audio

### Browser Console Logs:

Open DevTools (F12) → Console tab. You should see:
```
Joining channel: <channel-name> with UID: <number>
Published tracks: 2
User published: <uid> mediaType: audio
User published: <uid> mediaType: video
Remote audio track received from: <uid>
Remote video track received from: <uid>
```

### If Still Not Working:

1. **Check Agora Credentials**:
   - App ID: `03d4a11dd847459b964aad89c7673ca4`
   - Temp Token: May have expired (tokens are time-limited)
   - Generate a new token from Agora Console if needed

2. **Browser Permissions**:
   - Camera permission granted?
   - Microphone permission granted?
   - Try in Chrome/Edge (best Agora support)

3. **Network Issues**:
   - Firewall blocking WebRTC?
   - Corporate network restrictions?

### Quick Fix Checklist:

- [ ] Both users in same channel (check URL)
- [ ] Camera/mic permissions granted
- [ ] Debug panel shows "Connected: Yes"
- [ ] Debug panel shows "Remote Users: 1"
- [ ] Browser console shows no errors
- [ ] Using Chrome/Edge browser
- [ ] Agora token is valid

### Remove Debug Panel (Production):

Once everything works, you can remove the debug panel by deleting lines 210-220 in `/src/app/(main)/call/page.tsx`
