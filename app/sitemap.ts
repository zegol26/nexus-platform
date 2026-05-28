import type { MetadataRoute } from "next";
import { academyPublicRoutes, getAcademySiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getAcademySiteUrl();
  const lastModified = new Date();

  return academyPublicRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: {
        "id-ID": `${siteUrl}${route.path}`,
        "en-US": `${siteUrl}${route.path}`,
      },
    },
  }));
}
