// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js")

// Initialize the Firebase app in the service worker
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FIREBASE_CONFIG") {
    if (!self.firebaseConfig) {
      self.firebaseConfig = {}
    }
    self.firebaseConfig[event.data.key] = event.data.value

    // Try to initialize Firebase if we have all required config
    if (
      self.firebaseConfig.FIREBASE_API_KEY &&
      self.firebaseConfig.FIREBASE_AUTH_DOMAIN &&
      self.firebaseConfig.FIREBASE_PROJECT_ID &&
      self.firebaseConfig.FIREBASE_MESSAGING_SENDER_ID &&
      self.firebaseConfig.FIREBASE_APP_ID
    ) {
      try {
        if (!self.firebase.apps.length) {
          self.firebase.initializeApp({
            apiKey: self.firebaseConfig.FIREBASE_API_KEY,
            authDomain: self.firebaseConfig.FIREBASE_AUTH_DOMAIN,
            projectId: self.firebaseConfig.FIREBASE_PROJECT_ID,
            storageBucket: self.firebaseConfig.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: self.firebaseConfig.FIREBASE_MESSAGING_SENDER_ID,
            appId: self.firebaseConfig.FIREBASE_APP_ID,
          })

          console.log("[firebase-messaging-sw.js] Firebase initialized successfully")

          // Retrieve an instance of Firebase Messaging
          const messaging = self.firebase.messaging()

          // Handle background messages
          messaging.onBackgroundMessage((payload) => {
            console.log("[firebase-messaging-sw.js] Received background message ", payload)

            const notificationTitle = payload.notification.title || "New Notification"
            const notificationOptions = {
              body: payload.notification.body || "",
              icon: "/icons/icon-192x192.png",
              badge: "/icons/badge-128x128.png",
              data: payload.data || {},
            }

            self.registration.showNotification(notificationTitle, notificationOptions)
          })
        }
      } catch (error) {
        console.error("[firebase-messaging-sw.js] Firebase initialization error:", error)
      }
    }
  }
})

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click")
  event.notification.close()

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === "/" && "focus" in client) {
          return client.focus()
        }
      }

      if (clients.openWindow) {
        return clients.openWindow("/")
      }
    }),
  )
})
