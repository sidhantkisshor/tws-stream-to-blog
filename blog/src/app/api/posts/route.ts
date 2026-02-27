import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface PublishBody {
  videoId: string;
  title: string;
  hook: string;
  seoDesc: string;
  heroImage: string;
  intro: string;
  sections: { heading: string; body: string; chartRef?: string }[];
  conclusion: string;
  tags: string[];
  keywords: string[];
}

function validateBody(body: unknown): body is PublishBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.videoId === "string" &&
    typeof b.title === "string" &&
    typeof b.hook === "string" &&
    typeof b.seoDesc === "string" &&
    typeof b.heroImage === "string" &&
    typeof b.intro === "string" &&
    Array.isArray(b.sections) &&
    typeof b.conclusion === "string" &&
    Array.isArray(b.tags) &&
    Array.isArray(b.keywords)
  );
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("X-API-Key");
  if (!process.env.PUBLISH_API_KEY || apiKey !== process.env.PUBLISH_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!validateBody(body)) {
    return NextResponse.json(
      { error: "Missing or invalid required fields: videoId, title, hook, seoDesc, heroImage, intro, sections, conclusion, tags, keywords" },
      { status: 400 }
    );
  }

  const slug = slugify(body.title) + "-" + Date.now().toString(36);

  const post = await prisma.post.upsert({
    where: { videoId: body.videoId },
    create: {
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
    update: {
      title: body.title,
      hook: body.hook,
      seoDesc: body.seoDesc,
      heroImage: body.heroImage,
      intro: body.intro,
      sections: body.sections,
      conclusion: body.conclusion,
      tags: body.tags,
      keywords: body.keywords,
    },
  });

  revalidatePath("/");
  revalidatePath(`/posts/${post.slug}`);

  return NextResponse.json(
    { id: post.id, slug: post.slug, url: `/posts/${post.slug}` },
    { status: 201 }
  );
}
