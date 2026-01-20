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
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
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
        maxAgeSeconds: 30 * 24 * 60 * 60,
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
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
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
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
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
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  }),
);

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const firebaseConfig = {
  apiKey: getRequiredEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getRequiredEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getRequiredEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getRequiredEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getRequiredEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getRequiredEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message",
    payload,
  );

  const notificationTitle = payload.notification?.title || "GoalCraft";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/web-app-manifest-192x192.png",
    badge: "/web-app-manifest-192x192.png",
    data: {
      url: payload.data?.url || "/",
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      }),
  );
});
