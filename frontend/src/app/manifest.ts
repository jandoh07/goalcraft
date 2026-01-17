import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GoalCraft",
    short_name: "GoalCraft",
    description: "An app to help you achieve your goals",
    start_url: "/goals",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/mobile-screenshot.png",
        sizes: "828x1792",
        type: "image/png",
        label: "iPhone XR",
        form_factor: "narrow",
      },
      {
        src: "/desktop-screenshot.png",
        sizes: "2560x1440",
        type: "image/png",
        label: "Desktop",
        form_factor: "wide",
      },
    ],
  };
}
