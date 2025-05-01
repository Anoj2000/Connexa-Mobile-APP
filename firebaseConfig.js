// app/firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ✅ use getAuth instead of initializeAuth
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ Add Storage import
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID
} from "./config";

// ✅ Firebase configuration object
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
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

// ✅ Initialize Auth (no persistence needed manually)
let FIREBASE_AUTH;
try {
  FIREBASE_AUTH = getAuth(FIREBASE_APP); // ✅ Just getAuth
  console.log("✅ Firebase Auth initialized.");
} catch (error) {
  console.error("❌ Firebase Auth initialization failed:", error);
}

// ✅ Initialize Firestore
let FIREBASE_DB;
try {
  FIREBASE_DB = getFirestore(FIREBASE_APP);
  console.log("✅ Firestore initialized.");
} catch (error) {
  console.error("❌ Firestore initialization failed:", error);
}

// ✅ Initialize Storage
let FIREBASE_STORAGE;
try {
  FIREBASE_STORAGE = getStorage(FIREBASE_APP);
  console.log("✅ Firebase Storage initialized.");
} catch (error) {
  console.error("❌ Firebase Storage initialization failed:", error);
}

// ✅ Log Firebase connection status
console.log("🔎 Firebase Services Status:", {
  appInitialized: !!FIREBASE_APP,
  firestoreReady: !!FIREBASE_DB,
  authReady: !!FIREBASE_AUTH,
  storageReady: !!FIREBASE_STORAGE,
});

console.log("🚀 Firebase connected successfully");

// ✅ Export instances
export { FIREBASE_APP, FIREBASE_DB, FIREBASE_AUTH, FIREBASE_STORAGE };
export default FIREBASE_APP;