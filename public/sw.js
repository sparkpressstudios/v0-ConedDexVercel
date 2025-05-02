// ConeDex Service Worker

const CACHE_NAME = "conedex-cache-v1"
const OFFLINE_URL = "/offline.html"

// Assets to cache on install
const ASSETS_TO_CACHE = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
  "/icons/notification-badge.png",
]

// Install event - cache assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing Service Worker...")

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Caching app shell and content...")
        return cache.addAll(ASSETS_TO_CACHE)
      })
      .then(() => {
        console.log("[Service Worker] Skip waiting on install")
        return self.skipWaiting()
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating Service Worker...")

  event.waitUntil(
    caches
      .keys()
      .then((keyList) =>
        Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME) {
              console.log("[Service Worker] Removing old cache", key)
              return caches.delete(key)
            }
          }),
        ),
      )
      .then(() => {
        console.log("[Service Worker] Claiming clients")
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  // For HTML requests, try the network first, fall back to cache, finally the offline page
  if (event.request.headers.get("Accept") && event.request.headers.get("Accept").includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the response
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return response
        })
        .catch(() => caches.match(event.request).then((response) => response || caches.match(OFFLINE_URL))),
    )
    return
  }

  // For non-HTML requests, try the cache first, fall back to the network
  event.respondWith(
    caches.match(event.request).then(
      (response) =>
        response ||
        fetch(event.request).then((response) => {
          // Cache the response
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone)
            })
          }
          return response
        }),
    ),
  )
})

// Push event - handle push notifications
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push received:", event)

  let notificationData = {}

  if (event.data) {
    try {
      notificationData = event.data.json()
    } catch (e) {
      console.error("[Service Worker] Error parsing push data:", e)
      notificationData = {
        title: "ConeDex Notification",
        body: event.data.text(),
        icon: "/icons/icon-192x192.png",
        badge: "/icons/notification-badge.png",
      }
    }
  } else {
    notificationData = {
      title: "ConeDex Notification",
      body: "Something new happened in ConeDex!",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/notification-badge.png",
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon || "/icons/icon-192x192.png",
      badge: notificationData.badge || "/icons/notification-badge.png",
      image: notificationData.image,
      data: notificationData.data || {},
      actions: notificationData.actions || [],
      vibrate: [100, 50, 100],
      requireInteraction: notificationData.requireInteraction || false,
    }),
  )
})

// Notification click event - handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification click received:", event)

  event.notification.close()

  // Get the notification data
  const data = event.notification.data

  // Default URL to open
  let url = "/dashboard/notifications"

  // If the notification has a specific URL, use that instead
  if (data && data.url) {
    url = data.url
  }

  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === url && "focus" in client) {
          return client.focus()
        }
      }
      // If no window/tab is open with the URL, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    }),
  )
})
