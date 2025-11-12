import { injectManifest } from "workbox-build";
import { build } from "esbuild";
import { readdirSync, unlinkSync } from "fs";
import { join } from "path";

// Auto-discover routes from app directory
function getAppRoutes(dir: string, baseRoute = ""): string[] {
  const routes: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip special Next.js directories
      if (
        entry.name.startsWith("_") ||
        (entry.name.startsWith("(") && entry.name.endsWith(")"))
      ) {
        // Route groups like (dashboard) don't affect URL
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
      // Found a page - add this route
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

  // Auto-discover routes
  const appDir = "src/app";
  const routes = getAppRoutes(appDir);
  console.log("📍 Discovered routes:", routes);

  // Create manifest entries for all routes
  const routeEntries = routes.map((route) => ({
    url: route,
    revision: Date.now().toString(), // Use timestamp for versioning
  }));

  await injectManifest({
    swSrc: tempSwPath,
    swDest: "public/sw.js",
    globDirectory: "next/static",
    globPatterns: ["**/*.{js,css,woff2}"],
    additionalManifestEntries: [...routeEntries],
  });

  unlinkSync(tempSwPath);

  console.log("✅ Service worker bundled, injected, and generated.");
  console.log(`📦 Precached ${routeEntries.length} routes`);
}

buildSW();
