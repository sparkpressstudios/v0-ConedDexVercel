"use client"

/**
 * Service Worker Registration Helper
 *
 * This module provides functions to register, update, and manage the service worker
 * for the ConeDex platform, ensuring reliable push notifications and offline functionality.
 */

// Store the registration for reuse
let swRegistration: ServiceWorkerRegistration | null = null

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported in this browser")
    return null
  }

  try {
    // Check if we already have a registration
    if (swRegistration) {
      return swRegistration
    }

    // Register the service worker
    swRegistration = await navigator.serviceWorker.register("/sw.js")

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready

    console.log("Service worker registered successfully", swRegistration)
    return swRegistration
  } catch (error) {
    console.error("Service worker registration failed:", error)
    return null
  }
}

/**
 * Check if the service worker is ready
 */
export async function isServiceWorkerReady(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    return !!registration
  } catch (error) {
    return false
  }
}

/**
 * Update the service worker
 */
export async function updateServiceWorker(): Promise<boolean> {
  if (!swRegistration) {
    await registerServiceWorker()
    return !!swRegistration
  }

  try {
    await swRegistration.update()
    return true
  } catch (error) {
    console.error("Service worker update failed:", error)
    return false
  }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!swRegistration) {
    return true // Nothing to unregister
  }

  try {
    const result = await swRegistration.unregister()
    swRegistration = null
    return result
  } catch (error) {
    console.error("Service worker unregistration failed:", error)
    return false
  }
}

/**
 * Listen for service worker updates
 */
export function listenForServiceWorkerUpdates(callback: (event: Event) => void): () => void {
  if (!("serviceWorker" in navigator)) {
    return () => {}
  }

  navigator.serviceWorker.addEventListener("controllerchange", callback)

  return () => {
    navigator.serviceWorker.removeEventListener("controllerchange", callback)
  }
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
}
