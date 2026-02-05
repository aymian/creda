import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  // helper exports you may use elsewhere
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

/**
 * Initialize Firestore with persistentLocalCache to enable offline-first behavior.
 * This will let getDocsFromCache / getDocFromCache return local data immediately
 * while the network fetch happens in the background.
 */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

export default db;