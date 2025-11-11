import { injectManifest } from "workbox-build";
import { build } from "esbuild";
import { unlinkSync } from "fs";

async function buildSW() {
  const tempSwPath = "out/sw-temp.js";

  await build({
    entryPoints: ["src/app/sw.ts"],
    bundle: true,
    outfile: tempSwPath,
    format: "iife",
    target: "es2020",
    platform: "browser",
    minify: true,
  });

  await injectManifest({
    swSrc: tempSwPath,
    swDest: "out/sw.js",
    globDirectory: "out",
    globPatterns: ["**/*.{js,css,html,png,svg,ico,json,woff2}"],
  });

  unlinkSync(tempSwPath);

  console.log("✅ Service worker bundled, injected, and generated.");
}

buildSW();
