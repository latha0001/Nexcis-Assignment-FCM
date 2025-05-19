import { initializeApp, getApps, getApp } from "firebase/app"
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

// Get messaging instance (only on client)
const getMessagingInstance = async () => {
  try {
    const isMessagingSupported = await isSupported()
    if (!isMessagingSupported) {
      console.log("Firebase messaging is not supported in this browser")
      return null
    }

    // Check if all required config values are present
    const requiredConfigKeys = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]

    const missingKeys = requiredConfigKeys.filter((key) => {
      const envKey = `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`
      return !process.env[envKey]
    })

    if (missingKeys.length > 0) {
      console.error(`Missing required Firebase config: ${missingKeys.join(", ")}`)
      return null
    }

    return getMessaging(app)
  } catch (error) {
    console.error("Error initializing messaging:", error)
    return null
  }
}

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.log("This browser does not support notifications")
    return "denied"
  }

  if (Notification.permission === "granted") {
    return "granted"
  }

  return await Notification.requestPermission()
}

// Get FCM token
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const messaging = await getMessagingInstance()
    if (!messaging) {
      console.error("Messaging instance not available")
      return null
    }

    if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
      console.error("NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set")
      return null
    }

    // Get registration token
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    })

    if (currentToken) {
      console.log("FCM token:", currentToken)
      return currentToken
    } else {
      console.log("No registration token available")
      return null
    }
  } catch (error) {
    console.error("Error getting FCM token:", error)
    return null
  }
}

// Listen for messages
export const onMessageListener = (callback: (payload: any) => void) => {
  if (typeof window === "undefined") return () => {}

  const setupListener = async () => {
    const messaging = await getMessagingInstance()
    if (!messaging) return

    return onMessage(messaging, (payload) => {
      callback(payload)
    })
  }

  setupListener()

  // Return unsubscribe function
  return () => {}
}
