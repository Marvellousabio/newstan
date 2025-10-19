import { initializeApp, FirebaseApp, getApps } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getDatabase, Database } from "firebase/database";
import { getFunctions, Functions } from "firebase/functions";
import { getMessaging, Messaging, getToken } from "firebase/messaging";


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only once
const app: FirebaseApp = getApps()[0] || initializeApp(firebaseConfig);

// Services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const realtimeDb: Database = getDatabase(app);
export const functions: Functions = getFunctions(app);

// Messaging only on client
export const messaging: Messaging | null =
  typeof window !== "undefined" ? getMessaging(app) : null;

// Request notification permission safely
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      return token;
    }
  } catch (error) {
    console.error("Firebase messaging error:", error);
  }
  return null;
};

// Helper for client components
export const getClientAuth = (): Auth | null => (typeof window !== "undefined" ? auth : null);

export default app;
