"use server"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"

// Initialize Firebase Admin if not already initialized
const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    try {
      // Get the service account key
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

      if (!serviceAccountKey) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set")
      }

      // Parse the service account key
      let serviceAccount
      try {
        serviceAccount = JSON.parse(serviceAccountKey)
      } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON:", e)
        throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY format")
      }

      // Initialize the app with the service account
      initializeApp({
        credential: cert(serviceAccount),
      })

      console.log("Firebase Admin SDK initialized successfully")
    } catch (error) {
      console.error("Error initializing Firebase Admin SDK:", error)
      throw new Error(`Failed to initialize Firebase Admin: ${error.message}`)
    }
  }
}

type NotificationPayload = {
  token: string
  title: string
  body: string
  data?: Record<string, string>
}

export async function sendNotification({ token, title, body, data = {} }: NotificationPayload) {
  try {
    initializeFirebaseAdmin()
    const messaging = getMessaging()

    const message = {
      token,
      notification: {
        title,
        body,
      },
      data,
      webpush: {
        fcmOptions: {
          link: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
        },
        notification: {
          icon: "/icons/icon-192x192.png",
        },
      },
    }

    const response = await messaging.send(message)
    console.log("Successfully sent message:", response)
    return { success: true, messageId: response }
  } catch (error) {
    console.error("Error sending notification:", error)
    throw new Error("Failed to send notification")
  }
}

export async function saveUserFCMToken(userId: string, token: string) {
  // Here you would save the token to your database
  // This is just a placeholder implementation
  console.log(`Saving FCM token ${token} for user ${userId}`)
  return { success: true }
}
