import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { siteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${siteUrl}/`, lastModified: now, priority: 1 },
    { url: `${siteUrl}/projects`, lastModified: now, priority: 0.9 },
    { url: `${siteUrl}/resume`, lastModified: now, priority: 0.8 },
    ...projects.map((p) => ({ url: `${siteUrl}/projects/${p.slug}`, lastModified: now, priority: 0.7 })),
  ];
}
