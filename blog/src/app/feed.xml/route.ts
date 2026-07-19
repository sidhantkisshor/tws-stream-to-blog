import { prisma } from "@/lib/prisma";

export const revalidate = 60;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function imageMime(url: string): string {
  const ext = url.split(/[?#]/)[0].split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "png":
    default:
      return "image/png";
  }
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blogs.twsgurukulx.com";

  const posts = await prisma.post.findMany({
    orderBy: { publishedAt: "desc" },
    take: 50,
    select: {
      title: true,
      slug: true,
      seoDesc: true,
      hook: true,
      heroImage: true,
      tags: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  const lastBuild = posts[0]?.updatedAt ?? new Date();

  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${baseUrl}/posts/${p.slug}</link>
      <guid isPermaLink="true">${baseUrl}/posts/${p.slug}</guid>
      <description>${escapeXml(p.seoDesc)}</description>
      <pubDate>${p.publishedAt.toUTCString()}</pubDate>
      ${p.tags.map((t) => `<category>${escapeXml(t)}</category>`).join("\n      ")}
      ${p.heroImage ? `<enclosure url="${escapeXml(p.heroImage)}" type="${imageMime(p.heroImage)}" length="0" />` : ""}
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TWSGurukulX — Trading Insights</title>
    <link>${baseUrl}</link>
    <description>Live stream trading analysis and market insights from Trading With Sidhant Team</description>
    <language>en</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
