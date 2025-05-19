"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Bell, BellOff, Send } from "lucide-react"
import { requestNotificationPermission, getFCMToken, onMessageListener } from "@/lib/firebase/client"
import { sendNotification } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

export function NotificationDemo() {
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false)
  const [notificationTitle, setNotificationTitle] = useState("Test Notification")
  const [notificationBody, setNotificationBody] = useState("This is a test notification from FCM")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if notifications are already permitted
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionGranted(Notification.permission === "granted")
    }

    // Set up FCM message listener
    const unsubscribe = onMessageListener((payload) => {
      console.log("Received foreground message:", payload)
      toast({
        title: payload?.notification?.title || "New notification",
        description: payload?.notification?.body || "You received a new notification",
        duration: 5000,
      })
    })

    return () => {
      unsubscribe()
    }
  }, [toast])

  const handleRequestPermission = async () => {
    try {
      const permission = await requestNotificationPermission()
      setPermissionGranted(permission === "granted")

      if (permission === "granted") {
        const token = await getFCMToken()
        setFcmToken(token)
        toast({
          title: "Notification permission granted",
          description: "You will now receive push notifications",
        })
      } else {
        toast({
          title: "Permission denied",
          description: "You won't receive push notifications",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error requesting permission:", error)
      toast({
        title: "Error",
        description: "Failed to request notification permission",
        variant: "destructive",
      })
    }
  }

  const handleSendNotification = async () => {
    if (!fcmToken) return

    setLoading(true)
    try {
      await sendNotification({
        token: fcmToken,
        title: notificationTitle,
        body: notificationBody,
      })
      toast({
        title: "Notification sent",
        description: "The notification has been sent successfully",
      })
    } catch (error) {
      console.error("Error sending notification:", error)
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Notification Permissions</CardTitle>
          <CardDescription>Enable push notifications to receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                {permissionGranted ? "Notifications are enabled" : "Notifications are disabled"}
              </p>
            </div>
            <Switch id="notifications" checked={permissionGranted} onCheckedChange={handleRequestPermission} />
          </div>

          {permissionGranted && fcmToken && (
            <div className="pt-2">
              <Label htmlFor="fcm-token">FCM Token</Label>
              <div className="flex mt-1.5">
                <Input id="fcm-token" value={fcmToken} readOnly className="font-mono text-xs" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This token is used to send notifications to this device
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant={permissionGranted ? "outline" : "default"}
            onClick={handleRequestPermission}
            className="w-full"
          >
            {permissionGranted ? (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Notifications Enabled
              </>
            ) : (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                Enable Notifications
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Test Notification</CardTitle>
          <CardDescription>Send a test notification to this device</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              placeholder="Enter notification title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Notification Body</Label>
            <Textarea
              id="body"
              value={notificationBody}
              onChange={(e) => setNotificationBody(e.target.value)}
              placeholder="Enter notification message"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSendNotification} disabled={!fcmToken || loading} className="w-full">
            <Send className="mr-2 h-4 w-4" />
            {loading ? "Sending..." : "Send Notification"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
