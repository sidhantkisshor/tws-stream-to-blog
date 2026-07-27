import { prisma } from "@/lib/prisma";
import { getAllTags } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tags] = await Promise.all([
    prisma.post.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
    getAllTags(),
  ]);

  const baseUrl = SITE_URL;

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    ...posts.map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...tags.map((tag) => ({
      url: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
