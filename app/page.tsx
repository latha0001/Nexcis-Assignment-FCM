import { NotificationDemo } from "@/components/notification-demo"

export default function Home() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Firebase Cloud Messaging Demo</h1>
      <NotificationDemo />
    </main>
  )
}
