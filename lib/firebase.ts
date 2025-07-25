import { initializeApp, getApps } from 'firebase/app';
import { getAuth, TwitterAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase App Hosting provides config through FIREBASE_WEBAPP_CONFIG
// Fallback to individual env vars for local development
function getFirebaseConfig() {
  // Try to use Firebase App Hosting config first
  if (process.env.FIREBASE_WEBAPP_CONFIG) {
    try {
      const config = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
      // Validate that required fields are present and not empty
      if (config.apiKey && config.projectId && config.appId) {
        console.log('Using FIREBASE_WEBAPP_CONFIG for Firebase initialization');
        return config;
      } else {
        console.warn('FIREBASE_WEBAPP_CONFIG missing required fields, falling back to env vars');
      }
    } catch (error) {
      console.warn('Failed to parse FIREBASE_WEBAPP_CONFIG:', error);
    }
  }
  
  // Fallback to individual environment variables for local development
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  
  console.log('Using environment variables for Firebase initialization');
  
  // Validate fallback config
  if (!config.apiKey || !config.projectId || !config.appId) {
    console.error('Firebase configuration is incomplete. Required fields: apiKey, projectId, appId');
    console.error('Available config:', {
      apiKey: config.apiKey ? '***' : 'missing',
      projectId: config.projectId || 'missing',
      appId: config.appId ? '***' : 'missing'
    });
    throw new Error('Firebase configuration is incomplete');
  }
  
  return config;
}

// Lazy initialization to avoid build-time errors
let app: any = null;
let auth: any = null;
let db: any = null;
let twitterProvider: any = null;

function initializeFirebase() {
  // Skip initialization during build time
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && !process.env.FIREBASE_WEBAPP_CONFIG) {
    throw new Error('Firebase not available during build time');
  }
  
  if (!app) {
    const firebaseConfig = getFirebaseConfig();
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    twitterProvider = new TwitterAuthProvider();
  }
  return { app, auth, db, twitterProvider };
}

// Export getters that initialize Firebase on first access
export const getFirebaseAuth = () => {
  const { auth } = initializeFirebase();
  return auth;
};

export const getFirebaseDb = () => {
  const { db } = initializeFirebase();
  return db;
};

export const getTwitterProvider = () => {
  const { twitterProvider } = initializeFirebase();
  return twitterProvider;
};

// For backward compatibility, export the lazy-initialized instances
export { auth, db, twitterProvider };