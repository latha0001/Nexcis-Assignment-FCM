import type React from "react"
import { ServiceWorkerInitializer } from "@/components/service-worker-initializer"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata = {
  title: "FCM Push Notifications Demo",
  description: "A demo of Firebase Cloud Messaging (FCM) push notifications",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <ServiceWorkerInitializer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
