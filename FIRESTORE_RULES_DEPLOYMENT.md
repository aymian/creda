# Firestore Rules Deployment Guide

## How to Deploy Firestore Rules

You need to deploy these rules to your Firebase project. Here are the steps:

### Option 1: Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab at the top
5. Copy the contents of `firestore.rules` file
6. Paste it into the rules editor
7. Click **Publish** button

### Option 2: Firebase CLI

If you have Firebase CLI installed:

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

## What's Changed

The new rules include:

✅ **Calls Collection**: Users can create, read, and update calls where they are the caller or receiver
✅ **Conversations**: Proper permissions for messaging
✅ **Messages**: Users can send/edit/delete messages in their conversations
✅ **Users**: Public read access for profiles (needed for displaying names/avatars)
✅ **Posts, Comments, Likes**: Social features support
✅ **Connections**: Friend request management
✅ **Notifications**: User-specific notifications

## Security Features

- All write operations require authentication
- Users can only modify their own data
- Call participants can manage their calls
- Conversation participants can send messages
- Public profile viewing (for displaying user info in calls/messages)

## After Deployment

Once deployed, your calling functionality will work without permission errors!
