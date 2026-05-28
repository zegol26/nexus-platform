import type { MetadataRoute } from "next";
import { getAcademySiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getAcademySiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/checkout",
        "/contact",
        "/terms",
        "/refund-policy",
        "/overview/",
        "/login",
        "/register",
      ],
      disallow: ["/admin/", "/platform/", "/apps/", "/api/", "/_next/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
