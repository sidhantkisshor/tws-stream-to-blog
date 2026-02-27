import { prisma } from "./prisma";

export async function getRecentPosts(limit: number = 12) {
  return prisma.post.findMany({
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      hook: true,
      heroImage: true,
      tags: true,
      publishedAt: true,
    },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}

export async function getPostsByTag(tag: string) {
  return prisma.post.findMany({
    where: { tags: { has: tag } },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      hook: true,
      heroImage: true,
      tags: true,
      publishedAt: true,
    },
  });
}

export async function getAllTags(): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ tag: string }[]>`
    SELECT DISTINCT unnest(tags) AS tag FROM "Post" ORDER BY tag
  `;
  return rows.map((r) => r.tag);
}
