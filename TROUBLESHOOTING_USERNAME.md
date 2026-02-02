# Troubleshooting Guide: Username Display Issues

## Issue: Call page shows "User" instead of actual username

### Quick Fixes:

1. **Check your Firestore `users` collection structure**
   
   Make sure each user document has one of these fields:
   ```javascript
   {
     uid: "user123",
     displayName: "John Doe",  // Primary field
     name: "John Doe",         // Fallback 1
     username: "johndoe",      // Fallback 2
     email: "john@example.com" // Used for extraction if others missing
   }
   ```

2. **Verify the user profile is being fetched**
   
   Open browser console and check if you see user profiles being loaded. The messages page fetches profiles for all conversation participants.

3. **Check the URL when calling**
   
   When you click the call button, check the browser URL bar. It should show:
   ```
   /call?type=video&username=John%20Doe&channel=...
   ```
   
   If it shows `username=User` or `username=Unknown%20User`, the profile wasn't loaded properly.

### Common Causes:

- **Firestore rules blocking user profile reads** - Make sure the rules allow public read access to user profiles
- **User document doesn't exist** - The user might not have a profile document in Firestore
- **Field name mismatch** - Your user documents might use different field names (e.g., `fullName` instead of `displayName`)

### How to Fix:

1. **Update Firestore rules** (already done - allows public read on users collection)

2. **Ensure user profiles exist**:
   ```javascript
   // When a user signs up, create their profile:
   await setDoc(doc(db, 'users', user.uid), {
     uid: user.uid,
     displayName: user.displayName || user.email?.split('@')[0],
     email: user.email,
     photoURL: user.photoURL || '',
     createdAt: serverTimestamp()
   })
   ```

3. **Check browser console** for any errors related to fetching user profiles

### Testing:

1. Open `/messages` page
2. Open browser DevTools (F12)
3. Go to Console tab
4. Click a call button
5. You should see the actual username in the URL and on the call page

If you still see "User", check the Console for any errors and verify your Firestore user documents have the correct fields.
