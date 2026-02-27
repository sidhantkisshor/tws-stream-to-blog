import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("X-API-Key");
  if (apiKey !== process.env.PUBLISH_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const slug = slugify(body.title) + "-" + Date.now().toString(36);

  const post = await prisma.post.create({
    data: {
      videoId: body.videoId,
      title: body.title,
      slug,
      hook: body.hook,
      seoDesc: body.seoDesc,
      heroImage: body.heroImage,
      intro: body.intro,
      sections: body.sections,
      conclusion: body.conclusion,
      tags: body.tags,
      keywords: body.keywords,
      publishedAt: new Date(),
    },
  });

  return NextResponse.json(
    { id: post.id, slug: post.slug, url: `/posts/${post.slug}` },
    { status: 201 }
  );
}
