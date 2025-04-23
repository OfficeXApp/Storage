// src/registerSW.ts
import { registerSW } from "virtual:pwa-register";
import { Workbox, messageSW } from "workbox-window";

// Types for better TypeScript support
interface RegisterSWOptions {
  immediate?: boolean;
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
  onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
  onRegisterError?: (error: any) => void;
}

// Function to register the service worker
export function registerServiceWorker(options: RegisterSWOptions = {}) {
  console.log("Registering service worker");

  const {
    onNeedRefresh = () => {},
    onOfflineReady = () => {},
    onRegistered = () => {},
    onRegisterError = (error) =>
      console.error("Service worker registration error: 😱", error),
  } = options;

  // [PRODUCTION]
  // Skip registration during development if needed
  //   if (import.meta.env.DEV && !import.meta.env.VITE_PWA_DEV_ENABLED) {
  //     console.log("Skipping service worker registration during development");
  //     return;
  //   }

  console.log("Prepare register service worker");

  // Register the service worker
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // Show UI to the user
      if (confirm("New version available. Update now?")) {
        // This is critical - it will unregister the old SW and activate the new one
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log("App ready to work offline");
    },
    onRegistered(registration) {
      // Initialize workbox for additional control
      console.log("Service worker registered:", registration);
      if (registration) {
        const wb = new Workbox("/sw.js");

        // You can add event listeners to workbox here
        wb.addEventListener("activated", (event) => {
          if (event.isUpdate) {
            console.log("Service worker has been updated");
          } else {
            console.log("Service worker is active for the first time");
          }
        });

        onRegistered(registration);
      }
    },
    onRegisterError,
  });

  return updateSW;
}

// Optional: Function to check if push notifications are supported and request permission
export async function setupPushNotifications() {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications are not supported in this browser");
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      return subscription;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission was not granted");
      return false;
    }

    // Create a new subscription (you would typically send this to your server)
    // This is a sample public key - you would need to generate your own
    const vapidPublicKey = "YOUR_PUBLIC_VAPID_KEY";
    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    });

    return newSubscription;
  } catch (error) {
    console.error("Error setting up push notifications:", error);
    return false;
  }
}

// Helper function to convert base64 to Uint8Array for push subscription
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
