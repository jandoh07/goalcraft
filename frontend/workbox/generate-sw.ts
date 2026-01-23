import { injectManifest } from "workbox-build";
import { build } from "esbuild";
import { readdirSync, unlinkSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";
import { execSync } from "child_process";

// Load environment variables from .env.local
try {
  const envFile = readFileSync(".env.local", "utf-8");
  envFile.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length) {
      const value = valueParts.join("=").trim();
      process.env[key.trim()] = value;
    }
  });
} catch (e) {
  console.warn(
    "No .env.local file found, using existing environment variables",
  );
}

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

  // Validate required environment variables
  const requiredEnvVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ];

  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }

  await build({
    entryPoints: ["src/app/sw.ts"],
    bundle: true,
    outfile: tempSwPath,
    format: "iife",
    target: "es2020",
    platform: "browser",
    minify: true,
    define: {
      "process.env.NEXT_PUBLIC_FIREBASE_API_KEY": JSON.stringify(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      ),
      "process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": JSON.stringify(
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      ),
      "process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID": JSON.stringify(
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      ),
      "process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET": JSON.stringify(
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      ),
      "process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      ),
      "process.env.NEXT_PUBLIC_FIREBASE_APP_ID": JSON.stringify(
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      ),
    },
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

buildSW();
