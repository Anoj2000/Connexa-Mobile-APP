// app/firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  IS_DEVELOPMENT
} from "./config";

// Firebase configuration object
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

// Initialize Firebase App (safe check for multi-inits)
const FIREBASE_APP = (() => {
  try {
    return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    throw new Error("Failed to initialize Firebase app");
  }
})();

// Initialize Auth
const FIREBASE_AUTH = (() => {
  try {
    const auth = getAuth(FIREBASE_APP);
    
    // Connect to Auth emulator if in development
    if (IS_DEVELOPMENT) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      console.log("🔧 Using Auth emulator on localhost:9099");
    }
    
    return auth;
  } catch (error) {
    console.error("❌ Firebase Auth initialization failed:", error);
    throw new Error("Failed to initialize Firebase Auth");
  }
})();

// Initialize Firestore
const FIREBASE_DB = (() => {
  try {
    const db = getFirestore(FIREBASE_APP);
    
    // Connect to Firestore emulator if in development
    if (IS_DEVELOPMENT) {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log("🔧 Using Firestore emulator on localhost:8080");
    }
    
    return db;
  } catch (error) {
    console.error("❌ Firestore initialization failed:", error);
    throw new Error("Failed to initialize Firestore");
  }
})();

// Initialize Storage
const FIREBASE_STORAGE = (() => {
  try {
    const storage = getStorage(FIREBASE_APP);
    
    // Connect to Storage emulator if in development
    if (IS_DEVELOPMENT) {
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log("🔧 Using Storage emulator on localhost:9199");
    }
    
    return storage;
  } catch (error) {
    console.error("❌ Firebase Storage initialization failed:", error);
    throw new Error("Failed to initialize Firebase Storage");
  }
})();

// Log Firebase connection status in development
if (IS_DEVELOPMENT) {
  console.log("🔎 Firebase Services Status:", {
    appInitialized: !!FIREBASE_APP,
    firestoreReady: !!FIREBASE_DB,
    authReady: !!FIREBASE_AUTH,
    storageReady: !!FIREBASE_STORAGE,
  });
  console.log("🚀 Firebase connected successfully");
}

// Export instances
export { FIREBASE_APP, FIREBASE_DB, FIREBASE_AUTH, FIREBASE_STORAGE };
export default FIREBASE_APP;