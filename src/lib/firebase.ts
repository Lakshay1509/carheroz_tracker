
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import getAuth

const firebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (typeof window !== 'undefined' && !firebaseConfigValues.projectId) {
  console.warn(
    "Firebase Project ID is not set. This is a critical configuration for Firebase to work. " +
    "Please ensure your .env.local file is in the root of your project and correctly " +
    "configured with NEXT_PUBLIC_FIREBASE_PROJECT_ID and other Firebase credentials. " +
    "You may need to restart your Next.js development server after creating or modifying the .env.local file."
  );
}

// Initialize Firebase
// Check if Firebase has already been initialized to prevent errors
const app = !getApps().length ? initializeApp(firebaseConfigValues) : getApp();
const db = getFirestore(app);
const auth = getAuth(app); // Initialize Firebase Auth and get a reference to the service

export { app, db, auth }; // Export auth
