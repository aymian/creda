# Ringtone Setup

To enable the ringing sound for incoming calls, you need to add a ringtone audio file:

1. Create a `public/sounds` directory in your project root
2. Add a ringtone file named `ringtone.mp3` to this directory
3. You can use any ringtone you prefer (MP3 format recommended)

## Free Ringtone Resources:
- https://www.zedge.net/ringtones
- https://www.freesound.org/
- https://pixabay.com/sound-effects/search/ringtone/

## Alternative:
If you don't want to use a custom ringtone, you can modify the IncomingCallModal component to use the browser's built-in notification sound or remove the audio element entirely.

## File Structure:
```
public/
  sounds/
    ringtone.mp3  <-- Add your ringtone here
```
