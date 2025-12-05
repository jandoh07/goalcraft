import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/tasks", "/analytics", "/settings", "/api", "/_next"],
    },
    sitemap: "https://goalcraft.dev/sitemap.xml",
  };
}
