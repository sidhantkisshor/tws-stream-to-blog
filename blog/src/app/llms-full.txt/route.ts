import { prisma } from "@/lib/prisma";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const revalidate = 60;

interface Section {
  heading: string;
  body: string;
}

export async function GET() {
  const baseUrl = SITE_URL;

  const posts = await prisma.post.findMany({
    orderBy: { publishedAt: "desc" },
    select: {
      title: true,
      slug: true,
      seoDesc: true,
      hook: true,
      intro: true,
      sections: true,
      conclusion: true,
      tags: true,
      keywords: true,
      publishedAt: true,
    },
  });

  const blocks = posts.map((post) => {
    const sections: Section[] = Array.isArray(post.sections)
      ? (post.sections as unknown[]).filter(
          (s): s is Section =>
            !!s &&
            typeof s === "object" &&
            typeof (s as Section).heading === "string" &&
            typeof (s as Section).body === "string"
        )
      : [];

    const parts = [
      `# ${post.title}`,
      "",
      `> ${post.hook}`,
      "",
      `URL: ${baseUrl}/posts/${post.slug}`,
      `Date: ${post.publishedAt.toISOString().split("T")[0]}`,
      `Tags: ${post.tags.join(", ")}`,
      "",
      post.intro,
      "",
      ...sections.flatMap((s) => [`## ${s.heading}`, "", s.body, ""]),
      post.conclusion,
    ];

    return parts.join("\n");
  });

  const output = [
    `# ${SITE_NAME}: Full Content`,
    "",
    "> Live stream trading analysis and market insights from Trading With Sidhant Team",
    "",
    `Source: ${baseUrl}`,
    "",
    "---",
    "",
    blocks.join("\n\n---\n\n"),
  ].join("\n");

  return new Response(output, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
