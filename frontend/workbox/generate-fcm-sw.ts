import { writeFileSync, readFileSync, existsSync } from "fs";

// Manually parse .env file since we're running outside Next.js context
function loadEnvFile(): Record<string, string> {
  const envPath = ".env";
  const env: Record<string, string> = {};

  if (!existsSync(envPath)) {
    console.warn("⚠️ .env file not found. Using empty values.");
    return env;
  }

  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    if (key) {
      let value = valueParts.join("=");
      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  }

  return env;
}

const envVars = loadEnvFile();

const firebaseConfig = {
  apiKey: envVars.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: envVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: envVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: envVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: envVars.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

const swContent = `// Firebase messaging service worker for push notifications
// Auto-generated - do not edit manually

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

firebase.initializeApp(${JSON.stringify(firebaseConfig, null, 2)});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message", payload);

  // Support both notification payloads and data-only payloads (from cloud functions)
  const notificationTitle = payload.notification?.title || payload.data?.title || "GoalCraft";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "",
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
      })
  );
});
`;

writeFileSync("public/firebase-messaging-sw.js", swContent);
console.log("✅ Firebase messaging service worker generated.");
