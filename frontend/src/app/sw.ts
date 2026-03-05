/// <reference lib="webworker" />
import "../types/sw.d.ts";

import { clientsClaim, skipWaiting } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js",
);

declare const self: ServiceWorkerGlobalScope;

skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.searchParams.has("_rsc"),
  new NetworkFirst({
    cacheName: "rsc-payloads",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
    networkTimeoutSeconds: 3,
  }),
);

registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "pages",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 3 * 24 * 60 * 60,
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) =>
    (request.destination === "script" || request.destination === "style") &&
    url.origin === self.location.origin,

  new StaleWhileRevalidate({
    cacheName: "static-resources",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
);

registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 150,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
);

registerRoute(
  ({ request }) => request.destination === "font",
  new CacheFirst({
    cacheName: "fonts",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60,
      }),
    ],
  }),
);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message",
    payload,
  );

  // Check if there are any visible clients (app is open)
  // Only show notification if app is not in focus
  self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clientList) => {
      // If any client is focused, don't show notification (app will handle it)
      const hasFocusedClient = clientList.some(
        (client) => client.visibilityState === "visible",
      );

      if (hasFocusedClient) {
        console.log(
          "[firebase-messaging-sw.js] App is visible, skipping notification",
        );
        return;
      }

      // Show notification only if app is not visible
      const notificationTitle = payload.data?.title || "GoalCraft";
      const notificationOptions = {
        body: payload.data?.body || "",
        icon: "/web-app-manifest-192x192.png",
        tag: payload.data?.id || "goalcraft-notification",
        renotify: false,
        data: {
          url: payload.data?.url || "/",
        },
      };

      self.registration.showNotification(
        notificationTitle,
        notificationOptions,
      );
    });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // First, try to find an existing PWA client (standalone mode)
        const standaloneClient = clientList.find(
          (client) =>
            client.url.includes(self.location.origin) &&
            matchMedia("(display-mode: standalone)").matches,
        );

        if (standaloneClient) {
          // Focus existing PWA and navigate to URL
          standaloneClient.focus();
          return standaloneClient.navigate(url);
        }

        // Second, try to find any existing client with the same origin
        const existingClient = clientList.find((client) =>
          client.url.includes(self.location.origin),
        );

        if (existingClient) {
          // Focus existing client and navigate
          existingClient.focus();
          return existingClient.navigate(url);
        }

        // If no existing client, open new window
        // If PWA is installed, this will open in standalone mode
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      }),
  );
});
