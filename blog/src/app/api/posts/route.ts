import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SITE_URL, SITE_HOST } from "@/lib/site";

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
  faq?: { question: string; answer: string }[];
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
    b.sections.every(
      (s: unknown) =>
        !!s &&
        typeof s === "object" &&
        typeof (s as Record<string, unknown>).heading === "string" &&
        typeof (s as Record<string, unknown>).body === "string"
    ) &&
    typeof b.conclusion === "string" &&
    Array.isArray(b.tags) &&
    b.tags.every((t: unknown) => typeof t === "string") &&
    Array.isArray(b.keywords) &&
    b.keywords.every((k: unknown) => typeof k === "string") &&
    (b.faq === undefined ||
      (Array.isArray(b.faq) &&
        b.faq.every(
          (f: unknown) =>
            !!f &&
            typeof f === "object" &&
            typeof (f as Record<string, unknown>).question === "string" &&
            typeof (f as Record<string, unknown>).answer === "string"
        )))
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

  try {
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
        faq: body.faq ?? undefined,
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
        faq: body.faq ?? undefined,
      },
    });

    revalidatePath("/");
    revalidatePath(`/posts/${post.slug}`);

    // Ping IndexNow for instant Bing/Yandex indexing (fire-and-forget)
    const indexNowKey = process.env.INDEXNOW_KEY;
    if (indexNowKey) {
      fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: SITE_HOST,
          key: indexNowKey,
          urlList: [
            `${SITE_URL}/posts/${post.slug}`,
            SITE_URL,
          ],
        }),
      }).catch(() => {});
    }

    return NextResponse.json(
      { id: post.id, slug: post.slug, url: `/posts/${post.slug}` },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to publish post:", err);
    return NextResponse.json(
      { error: "Failed to publish post" },
      { status: 500 }
    );
  }
}
