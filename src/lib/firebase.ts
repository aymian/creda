import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableMultiTabIndexedDbPersistence, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpZ5YXe-_PKvSPsdoU5ffjRal8fnV6_VA",
  authDomain: "mora-4b89d.firebaseapp.com",
  databaseURL: "https://mora-4b89d-default-rtdb.firebaseio.com",
  projectId: "mora-4b89d",
  storageBucket: "mora-4b89d.firebasestorage.app",
  messagingSenderId: "758534233604",
  appId: "1:758534233604:web:b66a44293cdfc844525f51",
  measurementId: "G-8YLCRE5T9X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with settings and enable persistence
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

if (typeof window !== "undefined") {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code == 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence');
    }
  });
}
const storage = getStorage(app);

export { app, auth, db, storage };