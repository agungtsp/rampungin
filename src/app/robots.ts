import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth",
          "/id/auth",
          "/en/auth",
          "/me",
          "/id/me",
          "/en/me",
          "/saved",
          "/id/saved",
          "/en/saved",
          "/prompts/new",
          "/id/prompts/new",
          "/en/prompts/new",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
