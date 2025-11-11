/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache Next.js data files for client-side navigation
registerRoute(
  ({ request }) => request.url.includes("/_next/data/"),
  new NetworkFirst({
    cacheName: "next-data",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
    ],
    networkTimeoutSeconds: 2,
  })
);

// Cache page navigations
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "pages",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
    networkTimeoutSeconds: 3,
  })
);

// Cache JavaScript chunks aggressively for better offline performance
registerRoute(
  ({ request }) => request.destination === "script",
  new CacheFirst({
    cacheName: "js-chunks",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// Cache other static assets
registerRoute(
  ({ request }) =>
    request.destination === "style" ||
    request.destination === "image" ||
    request.destination === "font",
  new CacheFirst({
    cacheName: "static-assets",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

self.addEventListener("push", (event) => {
  if (!event.data) {
    console.log("This push event has no data.");
    return;
  }

  const data = event.data.json();
  const title = data.title || "GoalCraft";
  const options = {
    body: data.body,
    icon: "/web-app-manifest-192x192.png",
    badge: "/web-app-manifest-192x192.png",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientsArr) => {
        if (clientsArr.length > 0) {
          clientsArr[0].navigate(urlToOpen);
          clientsArr[0].focus();
        } else {
          self.clients.openWindow(urlToOpen);
        }
      })
  );
});

self.skipWaiting();
clientsClaim();
