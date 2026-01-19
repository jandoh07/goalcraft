import { injectManifest } from "workbox-build";
import { build } from "esbuild";
import { readdirSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";
import { execSync } from "child_process";

let BUILD_ID: string;
try {
  BUILD_ID = execSync("git rev-parse --short HEAD").toString().trim();
} catch (e) {
  console.warn("Git commit hash not found, using timestamp as build ID.", e);
  BUILD_ID = Date.now().toString();
}

const BUILD_HASH = createHash("md5").update(BUILD_ID).digest("hex").slice(0, 8);

writeFileSync(
  "src/components/providers/sw-version.ts",
  `export const SW_VERSION = '${BUILD_HASH}';`,
);

function getAppRoutes(dir: string, baseRoute = ""): string[] {
  const routes: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name.startsWith("_") ||
        entry.name.startsWith(".") ||
        entry.name.includes("[") // Skip dynamic folders like [id]
      ) {
        continue;
      }

      // Handle Route Groups (marketing) -> /
      if (entry.name.startsWith("(") && entry.name.endsWith(")")) {
        const subRoutes = getAppRoutes(fullPath, baseRoute);
        routes.push(...subRoutes);
      } else {
        // Regular route segment
        const routePath = baseRoute + "/" + entry.name;
        const subRoutes = getAppRoutes(fullPath, routePath);
        routes.push(...subRoutes);
      }
    } else if (
      entry.name === "page.tsx" ||
      entry.name === "page.jsx" ||
      entry.name === "page.js"
    ) {
      routes.push(baseRoute || "/");
    }
  }

  return routes;
}

async function buildSW() {
  const tempSwPath = "public/sw-temp.js";

  await build({
    entryPoints: ["src/app/sw.ts"],
    bundle: true,
    outfile: tempSwPath,
    format: "iife",
    target: "es2020",
    platform: "browser",
    minify: true,
  });

  const appDir = "src/app";
  const routes = getAppRoutes(appDir);
  console.log("📍 Discovered Static Routes:", routes);

  const routeEntries = routes.map((route) => ({
    url: route,
    revision: BUILD_HASH,
  }));

  await injectManifest({
    swSrc: tempSwPath,
    swDest: "public/sw.js",
    globDirectory: ".next/static",
    globPatterns: ["**/*.{js,css,woff2}"],
    modifyURLPrefix: {
      "": "_next/static/",
    },
    additionalManifestEntries: [...routeEntries],
  });

  unlinkSync(tempSwPath);
  console.log(
    `✅ Service worker generated with ${routeEntries.length} static routes.`,
  );
}

function generateFirebaseMessagingSW() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
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
      })
  );
});
`;

  writeFileSync("public/firebase-messaging-sw.js", swContent);
  console.log("✅ Firebase messaging service worker generated.");
}

buildSW();
generateFirebaseMessagingSW();
