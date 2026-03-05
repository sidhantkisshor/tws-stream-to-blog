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

export async function getRelatedPosts(excludeId: string, tags: string[], limit = 3) {
  return prisma.post.findMany({
    where: { id: { not: excludeId }, tags: { hasSome: tags } },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      heroImage: true,
      tags: true,
      publishedAt: true,
    },
  });
}

export async function getAdjacentPosts(publishedAt: Date) {
  const [prevArr, nextArr] = await Promise.all([
    prisma.post.findMany({
      where: { publishedAt: { lt: publishedAt } },
      orderBy: { publishedAt: "desc" },
      take: 1,
      select: { title: true, slug: true, publishedAt: true },
    }),
    prisma.post.findMany({
      where: { publishedAt: { gt: publishedAt } },
      orderBy: { publishedAt: "asc" },
      take: 1,
      select: { title: true, slug: true, publishedAt: true },
    }),
  ]);
  return { previous: prevArr[0] ?? null, next: nextArr[0] ?? null };
}

export async function getAllTags(): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ tag: string }[]>`
    SELECT DISTINCT unnest(tags) AS tag FROM "Post" ORDER BY tag
  `;
  return rows.map((r) => r.tag);
}
