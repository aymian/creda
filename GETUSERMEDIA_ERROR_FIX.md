# getUserMedia Error Fix

## Error: "Cannot read properties of undefined (reading 'getUserMedia')"

### What This Means:
Your browser doesn't have access to `navigator.mediaDevices.getUserMedia`, which is required for video/audio calls.

### Common Causes & Solutions:

#### 1. **Not Using HTTPS or Localhost** ⚠️
**Problem**: `getUserMedia` only works in secure contexts (HTTPS or localhost)

**Solution**:
- If developing locally: Use `http://localhost:3000` (not `http://192.168.x.x`)
- If deployed: Ensure your site uses HTTPS

**Check**: Look at your browser's address bar - it should show:
- 🔒 `https://yoursite.com` ✅
- `http://localhost:3000` ✅
- ❌ `http://192.168.1.100:3000` (Won't work!)

#### 2. **Unsupported Browser**
**Problem**: Very old browsers don't support WebRTC

**Solution**: Use a modern browser:
- ✅ Chrome 53+
- ✅ Firefox 36+
- ✅ Safari 11+
- ✅ Edge 79+

#### 3. **Permissions Blocked**
**Problem**: Camera/microphone permissions denied

**Solution**:
1. Click the 🔒 or ⓘ icon in the address bar
2. Find "Camera" and "Microphone" settings
3. Change to "Allow"
4. Refresh the page

#### 4. **Camera/Mic in Use**
**Problem**: Another app is using your camera/microphone

**Solution**:
- Close other apps using camera (Zoom, Teams, etc.)
- Close other browser tabs with video calls
- Restart your browser

### How to Test:

Open browser console (F12) and run:
```javascript
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => console.log('✅ Works!', stream))
  .catch(err => console.error('❌ Error:', err))
```

**Expected Results**:
- ✅ "Works!" → Your browser supports it
- ❌ "Error: NotAllowedError" → Permissions denied
- ❌ "Error: NotFoundError" → No camera/mic found
- ❌ "TypeError" → Browser doesn't support it or not HTTPS

### Quick Fix for Development:

If you're using `npm run dev` and accessing via IP address:

**Change from:**
```
http://192.168.1.100:3000
```

**To:**
```
http://localhost:3000
```

Or set up HTTPS for local development:
```bash
# In package.json, update dev script:
"dev": "next dev --experimental-https"
```

### Production Deployment:

Make sure your hosting platform provides HTTPS:
- ✅ Vercel (automatic HTTPS)
- ✅ Netlify (automatic HTTPS)
- ✅ Firebase Hosting (automatic HTTPS)
- ⚠️ Custom server: Configure SSL certificate

### Still Not Working?

1. **Check browser console** for specific error message
2. **Try in incognito/private mode** (rules out extensions)
3. **Test in different browser** (Chrome is most reliable)
4. **Check if localhost**: Run `window.location.hostname` in console
   - Should return `"localhost"` or your domain

### Error Messages Explained:

| Error | Meaning | Fix |
|-------|---------|-----|
| `NotAllowedError` | Permissions denied | Allow camera/mic in browser settings |
| `NotFoundError` | No camera/mic detected | Check hardware connections |
| `NotReadableError` | Hardware in use | Close other apps |
| `TypeError: undefined` | Not HTTPS or old browser | Use HTTPS or localhost |
| `OverconstrainedError` | Requested settings not available | Lower video quality |

### The Fix I Applied:

I've updated the code to:
1. ✅ Check if running in secure context (HTTPS/localhost)
2. ✅ Check browser compatibility
3. ✅ Show user-friendly error messages
4. ✅ Auto-redirect to messages after 5 seconds on error
5. ✅ Add detailed console logging

Now when you get an error, you'll see exactly what's wrong! 🎉
