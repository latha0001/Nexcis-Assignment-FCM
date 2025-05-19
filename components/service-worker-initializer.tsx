"use client"

import { useEffect } from "react"

export function ServiceWorkerInitializer() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerServiceWorker = async () => {
        try {
          // Fetch Firebase config for service worker
          const response = await fetch("/api/register-service-worker")
          if (!response.ok) {
            throw new Error(`Failed to fetch service worker config: ${response.status}`)
          }

          const firebaseConfig = await response.json()

          // Register the service worker
          const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js")
          console.log("Service Worker registered with scope:", registration.scope)

          // Wait for the service worker to be ready
          await navigator.serviceWorker.ready
          console.log("Service Worker is ready")

          // Pass Firebase config to service worker
          if (registration.active) {
            Object.entries(firebaseConfig).forEach(([key, value]) => {
              registration.active.postMessage({ type: "FIREBASE_CONFIG", key, value })
            })
            console.log("Firebase config sent to service worker")
          } else {
            console.warn("Service worker is not active yet")
          }
        } catch (error) {
          console.error("Service Worker registration failed:", error)
        }
      }

      registerServiceWorker()
    }
  }, [])

  return null
}
