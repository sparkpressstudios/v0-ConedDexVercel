"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export function usePushNotifications() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Check if push notifications are supported
  const checkPushSupport = useCallback(() => {
    return (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    )
  }, [])

  // Validate VAPID public key
  const validateVapidKey = useCallback((key: string | undefined): boolean => {
    if (!key) return false

    // VAPID keys should be base64 URL safe encoded strings
    const base64Regex = /^[A-Za-z0-9\-_]+=*$/
    return base64Regex.test(key) && key.length > 20
  }, [])

  // Convert base64 to Uint8Array (required for applicationServerKey)
  const urlBase64ToUint8Array = useCallback((base64String: string): Uint8Array => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }, [])

  // Check subscription status on mount
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const supported = checkPushSupport()
        setIsSupported(supported)

        if (!supported) {
          setIsLoading(false)
          return
        }

        // Wait for service worker registration
        const registration = await navigator.serviceWorker.ready.catch(() => null)

        if (!registration) {
          console.warn("Service worker not registered")
          setIsLoading(false)
          return
        }

        // Get existing subscription
        const existingSubscription = await registration.pushManager.getSubscription().catch(() => null)

        setSubscription(existingSubscription)
        setIsSubscribed(!!existingSubscription)
      } catch (error) {
        console.error("Error checking push subscription:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSubscription()
  }, [checkPushSupport])

  // Subscribe to push notifications
  const subscribe = async () => {
    if (isLoading) return false

    setIsLoading(true)

    try {
      // Check if push is supported
      if (!checkPushSupport()) {
        toast({
          title: "Push notifications not supported",
          description: "Your browser doesn't support push notifications.",
          variant: "destructive",
        })
        return false
      }

      // Request notification permission
      const permission = await Notification.requestPermission()

      if (permission !== "granted") {
        toast({
          title: "Permission denied",
          description: "You need to allow notifications to receive updates.",
          variant: "destructive",
        })
        return false
      }

      // Wait for service worker to be ready with timeout
      let registration: ServiceWorkerRegistration | null = null

      try {
        const registerPromise = navigator.serviceWorker.ready
        const timeoutPromise = new Promise<null>((_, reject) => {
          setTimeout(() => reject(new Error("Service worker registration timed out")), 3000)
        })

        registration = (await Promise.race([registerPromise, timeoutPromise])) as ServiceWorkerRegistration
      } catch (error) {
        console.error("Service worker registration error:", error)
        toast({
          title: "Service worker error",
          description: "Could not register service worker. Please reload the page and try again.",
          variant: "destructive",
        })
        return false
      }

      // Get VAPID public key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      // Validate VAPID key
      if (!validateVapidKey(vapidPublicKey)) {
        console.error("Invalid VAPID public key")
        toast({
          title: "Configuration error",
          description: "Push notification setup is incomplete.",
          variant: "destructive",
        })
        return false
      }

      // Convert VAPID key to Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey!)

      // Subscribe to push notifications
      const newSubscription = await registration.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        })
        .catch((error) => {
          console.error("Push subscription error:", error)
          throw new Error("Failed to subscribe to push notifications")
        })

      // Save subscription to server
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSubscription),
      })

      if (!response.ok) {
        throw new Error("Failed to save subscription on server")
      }

      setSubscription(newSubscription)
      setIsSubscribed(true)

      toast({
        title: "Notifications enabled",
        description: "You will now receive push notifications.",
      })

      return true
    } catch (error: any) {
      console.error("Error subscribing to push notifications:", error)
      toast({
        title: "Subscription failed",
        description: error.message || "Could not enable push notifications.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    if (isLoading) return false

    setIsLoading(true)

    try {
      if (!subscription) {
        setIsSubscribed(false)
        return true
      }

      // Unsubscribe from push manager
      const success = await subscription.unsubscribe().catch(() => false)

      if (!success) {
        throw new Error("Failed to unsubscribe from push notifications")
      }

      // Remove subscription from server
      const response = await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })

      if (!response.ok) {
        throw new Error("Failed to remove subscription from server")
      }

      setSubscription(null)
      setIsSubscribed(false)

      toast({
        title: "Notifications disabled",
        description: "You will no longer receive push notifications.",
      })

      return true
    } catch (error: any) {
      console.error("Error unsubscribing from push notifications:", error)
      toast({
        title: "Error",
        description: error.message || "Could not disable push notifications.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isSupported,
    isSubscribed,
    subscription,
    isLoading,
    subscribe,
    unsubscribe,
  }
}
