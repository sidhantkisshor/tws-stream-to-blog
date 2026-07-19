import { prisma } from "./prisma";

const CARD_SELECT = {
  id: true,
  title: true,
  slug: true,
  hook: true,
  heroImage: true,
  tags: true,
  publishedAt: true,
  intro: true,
  sections: true,
  conclusion: true,
} as const;

type RawCardPost = {
  id: string;
  title: string;
  slug: string;
  hook: string;
  heroImage: string | null;
  tags: string[];
  publishedAt: Date;
  intro: string;
  sections: unknown;
  conclusion: string;
};

export type PostCard = {
  id: string;
  title: string;
  slug: string;
  hook: string;
  heroImage: string | null;
  tags: string[];
  publishedAt: Date;
  readingMinutes: number;
};

export function getReadingMinutes(
  intro: string,
  sections: unknown,
  conclusion: string,
): number {
  const sectionBodies = Array.isArray(sections)
    ? (sections as { body?: unknown }[])
        .map((s) => (typeof s?.body === "string" ? s.body : ""))
    : [];
  const wordCount = [intro, ...sectionBodies, conclusion]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / 200));
}

function toCard(p: RawCardPost): PostCard {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    hook: p.hook,
    heroImage: p.heroImage,
    tags: p.tags,
    publishedAt: p.publishedAt,
    readingMinutes: getReadingMinutes(p.intro, p.sections, p.conclusion),
  };
}

export async function getRecentPosts(limit: number = 12): Promise<PostCard[]> {
  const rows = await prisma.post.findMany({
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: CARD_SELECT,
  });
  return rows.map(toCard);
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}

export async function getPostsByTag(tag: string): Promise<PostCard[]> {
  const rows = await prisma.post.findMany({
    where: { tags: { has: tag } },
    orderBy: { publishedAt: "desc" },
    select: CARD_SELECT,
  });
  return rows.map(toCard);
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
      hook: true,
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
