import { prisma } from "@/lib/prisma";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const revalidate = 60;

export async function GET() {
  const baseUrl = SITE_URL;

  const posts = await prisma.post.findMany({
    orderBy: { publishedAt: "desc" },
    select: { title: true, slug: true, seoDesc: true, publishedAt: true },
  });

  const lines = [
    `# ${SITE_NAME}`,
    "",
    "> Live stream trading analysis and market insights from Trading With Sidhant Team",
    "",
    "This site publishes automated blog recaps of live trading streams covering Nifty, BankNifty, and options setups.",
    "",
    `## Docs`,
    "",
    `- [About](${baseUrl}/about): About ${SITE_NAME} and the team behind it`,
    `- [Full content for LLMs](${baseUrl}/llms-full.txt): Complete text of all posts`,
    "",
    "## Blog Posts",
    "",
    ...posts.map(
      (p) => `- [${p.title}](${baseUrl}/posts/${p.slug}): ${p.seoDesc}`
    ),
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
