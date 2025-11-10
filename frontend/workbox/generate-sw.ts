import { generateSW } from "workbox-build";

async function buildSW() {
  await generateSW({
    globDirectory: "out",
    globPatterns: ["**/*.{js,css,html,png,svg,ico,json,woff2}"],
    swDest: "out/sw.js",
    clientsClaim: true,
    skipWaiting: true,

    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          networkTimeoutSeconds: 3,
        },
      },
      {
        urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|gif|woff2)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
        },
      },
    ],
  });

  console.log("✅ Service worker generated (static only)");
}

buildSW();
