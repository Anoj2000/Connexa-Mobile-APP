// app/firebaseConfig.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


import {
  FIREBASE_API_KEY,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID
} from "./config";

// ✅ Firebase configuration object
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

// ✅ Initialize Firebase App (safe check for multi-inits)
let FIREBASE_APP;
try {
  FIREBASE_APP = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  console.log("✅ Firebase App initialized.");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
}

// ✅ Initialize Firestore and Auth
const FIREBASE_DB = getFirestore(FIREBASE_APP);
const FIREBASE_AUTH = getAuth(FIREBASE_APP);

// ✅ Log Firebase connection status
console.log("🔎 Firebase Services Status:", {
  appInitialized: !!FIREBASE_APP,
  firestoreReady: !!FIREBASE_DB,
  authReady: !!FIREBASE_AUTH,
});

console.log("🚀 Firebase connected successfully");

// ✅ Export instances
export { FIREBASE_APP, FIREBASE_DB, FIREBASE_AUTH };
export default FIREBASE_APP;
