/// <reference lib="webworker" />

// src/sw.ts

import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import {
  NetworkFirst,
  StaleWhileRevalidate,
  CacheFirst,
} from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

// Use TypeScript interface for type safety
declare const self: ServiceWorkerGlobalScope;

// This will be replaced by the generated manifest
const manifest = self.__WB_MANIFEST;

// Enable cleanup of older caches
cleanupOutdatedCaches();

// Precache static resources from the manifest
precacheAndRoute(manifest);

// Setup navigation routes to use index.html for client-side routing
const handler = createHandlerBoundToURL("/index.html");
const navigationRoute = new NavigationRoute(handler, {
  // Exclude paths that should not use the index.html shell
  denylist: [
    /\/api\//,
    /\/store\//,
    /\/store$/,
    /\.(jpg|png|gif|svg|webp|json|css|js)$/,
  ],
});
registerRoute(navigationRoute);

// API requests - Network First strategy
registerRoute(
  ({ url }) => url.pathname.startsWith("/v1/"),
  new NetworkFirst({
    cacheName: "rest-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 1 day
      }),
    ],
    networkTimeoutSeconds: 3, // Timeout after 3 seconds
  })
);

// Style/Script assets - Cache First with update strategy
registerRoute(
  ({ request }) =>
    request.destination === "style" || request.destination === "script",
  new StaleWhileRevalidate({
    cacheName: "assets-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// Images - Cache First (they rarely change)
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// // Optional: Handle push events for notifications
// self.addEventListener("push", (event) => {
//   const data = event.data?.json() ?? {};
//   const options = {
//     body: data.body || "New notification",
//     icon: "/icons/icon-192x192.png",
//     badge: "/icons/badge-72x72.png",
//     data,
//   };

//   event.waitUntil(
//     self.registration.showNotification(data.title || "Notification", options)
//   );
// });

// // Optional: Handle notification clicks
// self.addEventListener("notificationclick", (event) => {
//   event.notification.close();

//   if (event.notification.data && event.notification.data.url) {
//     event.waitUntil(self.clients.openWindow(event.notification.data.url));
//   }
// });
