# TWSGurukulX Blog Website Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the skeleton blog into a polished, minimal, content-first website matching the design doc at `docs/plans/2026-02-27-website-design.md`.

**Architecture:** Next.js 16 App Router with React Server Components. All pages are server-rendered with ISR (60s revalidate). New Subscriber model in Prisma for WhatsApp phone collection. Chart lightbox is a client component. Mobile nav is a client component. Everything else stays server-rendered.

**Tech Stack:** Next.js 16, React 19, Prisma 7, Tailwind CSS 4, TypeScript 5

**Design doc:** `docs/plans/2026-02-27-website-design.md`

**Brand:**
- Name: TWSGurukulX
- Company: Trading With Sidhant LLP
- WhatsApp: +918062963333
- Colors: Deep Slate #2C3539, Burnt Amber #C87533, Brushed Gold #B8956A, Warm White #FAF8F5, Wealth Teal #0A8D7A
- Fonts: Satoshi (body), Instrument Serif (headings) — loaded from api.fontshare.com

---

### Task 1: Add Subscriber model to Prisma schema

**Files:**
- Modify: `blog/prisma/schema.prisma`

**Step 1: Add Subscriber model**

Add after the Post model in `blog/prisma/schema.prisma`:

```prisma
model Subscriber {
  id          String   @id @default(cuid())
  phone       String   @unique
  countryCode String   @default("+91")
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

**Step 2: Generate Prisma client**

Run: `cd blog && npx prisma generate`
Expected: "Generated Prisma Client"

**Step 3: Commit**

```bash
git add blog/prisma/schema.prisma blog/src/generated/
git commit -m "feat: add Subscriber model for WhatsApp phone collection"
```

---

### Task 2: Create subscribe API route

**Files:**
- Create: `blog/src/app/api/subscribe/route.ts`

**Step 1: Create the API route**

Create `blog/src/app/api/subscribe/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PHONE_PATTERNS: Record<string, RegExp> = {
  "+91": /^\d{10}$/,
};
const DEFAULT_PATTERN = /^\d{7,15}$/;

export async function POST(request: NextRequest) {
  let body: { phone?: string; countryCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phone = body.phone?.trim();
  const countryCode = body.countryCode?.trim() || "+91";

  if (!phone) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  const pattern = PHONE_PATTERNS[countryCode] || DEFAULT_PATTERN;
  if (!pattern.test(phone)) {
    return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
  }

  const fullNumber = `${countryCode}${phone}`;

  const existing = await prisma.subscriber.findUnique({
    where: { phone: fullNumber },
  });

  if (existing) {
    if (!existing.active) {
      await prisma.subscriber.update({
        where: { phone: fullNumber },
        data: { active: true },
      });
    }
    return NextResponse.json({ ok: true });
  }

  await prisma.subscriber.create({
    data: { phone: fullNumber, countryCode },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
```

**Step 2: Verify it compiles**

Run: `cd blog && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds (or only warns about DB connection, which is fine locally)

**Step 3: Commit**

```bash
git add blog/src/app/api/subscribe/route.ts
git commit -m "feat: add subscribe API route for WhatsApp phone collection"
```

---

### Task 3: Create shared layout components — Nav and Footer

**Files:**
- Create: `blog/src/components/Nav.tsx` (client component for mobile menu)
- Create: `blog/src/components/Footer.tsx` (server component)
- Modify: `blog/src/app/layout.tsx`

**Step 1: Create Nav component**

Create `blog/src/components/Nav.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-deep-slate/10 bg-warm-white/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="font-instrument text-2xl text-burnt-amber no-underline hover:no-underline"
        >
          TWSGurukulX
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 sm:flex">
          <Link href="/about" className="text-sm text-deep-slate/70 hover:text-deep-slate no-underline">
            About
          </Link>
          <a
            href="https://wa.me/918062963333"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-wealth-teal/10 px-4 py-1.5 text-sm font-medium text-wealth-teal no-underline hover:bg-wealth-teal/20"
          >
            Join WhatsApp
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="flex flex-col gap-1.5 sm:hidden"
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-deep-slate transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-deep-slate transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-deep-slate transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-deep-slate/10 bg-warm-white px-4 py-4 sm:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="text-sm text-deep-slate/70 no-underline"
            >
              About
            </Link>
            <a
              href="https://wa.me/918062963333"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-wealth-teal no-underline"
            >
              Join WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
```

**Step 2: Create Footer component**

Create `blog/src/components/Footer.tsx`:

```tsx
import Link from "next/link";
import { getAllTags } from "@/lib/posts";

export async function Footer() {
  const tags = await getAllTags();

  return (
    <footer className="mt-16 border-t border-deep-slate/10 bg-warm-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="rounded-full bg-deep-slate/5 px-3 py-1 text-xs text-deep-slate/60 no-underline hover:bg-deep-slate/10 hover:text-deep-slate"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
        <p className="text-sm text-deep-slate/40">
          &copy; 2026 Trading With Sidhant LLP
        </p>
      </div>
    </footer>
  );
}
```

**Step 3: Update layout.tsx**

Replace `blog/src/app/layout.tsx` entirely:

```tsx
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "TWSGurukulX — Trading Insights",
  description: "Live stream trading analysis and market insights from Trading With Sidhant Team",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&f[]=instrument-serif@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <Nav />
        <div className="min-h-[calc(100vh-160px)]">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
```

**Step 4: Commit**

```bash
git add blog/src/components/Nav.tsx blog/src/components/Footer.tsx blog/src/app/layout.tsx
git commit -m "feat: add Nav with mobile hamburger and Footer with tag cloud"
```

---

### Task 4: Create WhatsApp signup form component

**Files:**
- Create: `blog/src/components/WhatsAppCTA.tsx` (client component)

**Step 1: Create the component**

Create `blog/src/components/WhatsAppCTA.tsx`:

```tsx
"use client";

import { useState } from "react";

export function WhatsAppCTA() {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, countryCode }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
      setPhone("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-wealth-teal/20 bg-wealth-teal/5 px-6 py-5 text-center">
        <p className="font-medium text-wealth-teal">
          You&apos;re in! We&apos;ll WhatsApp you when new analysis drops.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-deep-slate/10 bg-white px-6 py-6">
      <p className="mb-1 text-lg font-medium text-deep-slate">
        Get notified when new analysis drops.
      </p>
      <p className="mb-4 text-sm text-deep-slate/60">
        Join via WhatsApp — no spam, just post alerts.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="rounded-lg border border-deep-slate/20 bg-warm-white px-3 py-2 text-sm text-deep-slate"
        >
          <option value="+91">+91</option>
          <option value="+1">+1</option>
          <option value="+44">+44</option>
          <option value="+971">+971</option>
          <option value="+65">+65</option>
        </select>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          required
          className="flex-1 rounded-lg border border-deep-slate/20 bg-warm-white px-4 py-2 text-sm text-deep-slate placeholder:text-deep-slate/40 focus:border-wealth-teal focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-wealth-teal px-5 py-2 text-sm font-medium text-white hover:bg-wealth-teal/90 disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Join"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add blog/src/components/WhatsAppCTA.tsx
git commit -m "feat: add WhatsApp phone signup form component"
```

---

### Task 5: Create chart lightbox component

**Files:**
- Create: `blog/src/components/ChartImage.tsx` (client component)

**Step 1: Create the component**

Create `blog/src/components/ChartImage.tsx`:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface ChartImageProps {
  src: string;
  alt: string;
}

export function ChartImage({ src, alt }: ChartImageProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <figure className="my-4 cursor-pointer" onClick={() => setOpen(true)}>
        <Image
          src={src}
          alt={alt}
          width={300}
          height={169}
          className="rounded-lg border border-deep-slate/10 transition-opacity hover:opacity-80"
        />
        <figcaption className="mt-1.5 text-xs text-deep-slate/50">
          {alt} — click to expand
        </figcaption>
      </figure>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute right-4 top-4 text-2xl text-white/70 hover:text-white"
            aria-label="Close"
          >
            &times;
          </button>
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={675}
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
```

**Step 2: Commit**

```bash
git add blog/src/components/ChartImage.tsx
git commit -m "feat: add chart image with lightbox expansion"
```

---

### Task 6: Redesign home page

**Files:**
- Modify: `blog/src/app/page.tsx`

**Step 1: Replace home page**

Replace `blog/src/app/page.tsx` entirely:

```tsx
import Link from "next/link";
import Image from "next/image";
import { getRecentPosts } from "@/lib/posts";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";

export const revalidate = 60;

export default async function HomePage() {
  const posts = await getRecentPosts(20);
  const [featured, ...rest] = posts;

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      {!featured ? (
        <p className="text-deep-slate/50">No posts yet. Check back after the next live stream.</p>
      ) : (
        <>
          {/* Featured latest post */}
          <Link href={`/posts/${featured.slug}`} className="group block no-underline">
            <article className="mb-12">
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={featured.heroImage}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-[1.02]"
                  priority
                  sizes="(max-width: 896px) 100vw, 896px"
                />
              </div>
              <div className="mt-4">
                <div className="mb-2 flex flex-wrap gap-2">
                  {featured.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-wealth-teal/10 px-2.5 py-0.5 text-xs font-medium text-wealth-teal"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="font-instrument text-3xl text-deep-slate group-hover:text-burnt-amber transition-colors sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-2 text-deep-slate/70">{featured.hook}</p>
                <time
                  className="mt-2 block text-sm text-deep-slate/40"
                  dateTime={featured.publishedAt.toISOString()}
                >
                  {featured.publishedAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            </article>
          </Link>

          {/* Recent posts list */}
          {rest.length > 0 && (
            <section>
              <h2 className="mb-6 font-instrument text-xl text-deep-slate/60">Recent Posts</h2>
              <div className="divide-y divide-deep-slate/10">
                {rest.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="group block py-5 no-underline first:pt-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-instrument text-lg text-deep-slate group-hover:text-burnt-amber transition-colors">
                          {post.title}
                        </h3>
                        <p className="mt-1 text-sm text-deep-slate/60 line-clamp-1">
                          {post.hook}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-deep-slate/5 px-2 py-0.5 text-xs text-deep-slate/50"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <time
                        className="shrink-0 text-sm text-deep-slate/40"
                        dateTime={post.publishedAt.toISOString()}
                      >
                        {post.publishedAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* WhatsApp CTA */}
          <section className="mt-12">
            <WhatsAppCTA />
          </section>
        </>
      )}
    </main>
  );
}
```

**Step 2: Commit**

```bash
git add blog/src/app/page.tsx
git commit -m "feat: redesign home page with featured post and text list"
```

---

### Task 7: Redesign post page with chart lightbox

**Files:**
- Modify: `blog/src/app/posts/[slug]/page.tsx`

**Step 1: Replace post page**

Replace `blog/src/app/posts/[slug]/page.tsx` entirely:

```tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { ChartImage } from "@/components/ChartImage";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import type { Metadata } from "next";

export const revalidate = 60;

interface Section {
  heading: string;
  body: string;
  chartRef?: string;
}

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({ select: { slug: true } });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | TWSGurukulX`,
    description: post.seoDesc,
    openGraph: {
      title: post.title,
      description: post.seoDesc,
      images: [post.heroImage],
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.seoDesc,
      images: [post.heroImage],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const sections = post.sections as unknown as Section[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDesc,
    image: post.heroImage,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "TWSGurukulX" },
    keywords: post.keywords.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-prose px-4 py-12">
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="rounded-full bg-wealth-teal/10 px-3 py-1 text-xs font-medium text-wealth-teal no-underline hover:bg-wealth-teal/20"
              >
                {tag}
              </Link>
            ))}
          </div>
          <h1 className="font-instrument text-3xl leading-tight text-deep-slate sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-lg text-burnt-amber">{post.hook}</p>
          <time
            className="mt-2 block text-sm text-deep-slate/40"
            dateTime={post.publishedAt.toISOString()}
          >
            {post.publishedAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </header>

        <div className="relative mb-8 aspect-video overflow-hidden rounded-lg">
          <Image
            src={post.heroImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="space-y-8">
          <p className="text-lg leading-relaxed text-deep-slate/80">{post.intro}</p>

          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="font-instrument text-2xl text-deep-slate">{section.heading}</h2>
              <div className="mt-3 leading-relaxed text-deep-slate/80 whitespace-pre-line">
                {section.body}
              </div>
              {section.chartRef && (
                <ChartImage
                  src={section.chartRef}
                  alt={`Chart: ${section.heading}`}
                />
              )}
            </section>
          ))}

          <section className="border-t border-deep-slate/10 pt-8">
            <p className="leading-relaxed text-deep-slate/80">{post.conclusion}</p>
          </section>
        </div>

        <div className="mt-12">
          <WhatsAppCTA />
        </div>
      </article>
    </>
  );
}
```

**Step 2: Commit**

```bash
git add blog/src/app/posts/[slug]/page.tsx
git commit -m "feat: redesign post page with lightbox charts and WhatsApp CTA"
```

---

### Task 8: Redesign tag page to match text-list style

**Files:**
- Modify: `blog/src/app/tags/[tag]/page.tsx`

**Step 1: Replace tag page**

Replace `blog/src/app/tags/[tag]/page.tsx` entirely:

```tsx
import Link from "next/link";
import { getPostsByTag, getAllTags } from "@/lib/posts";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `#${tag} | TWSGurukulX`,
    description: `Trading insights and analysis tagged with ${tag}`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = await getPostsByTag(tag);

  if (posts.length === 0) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <header className="mb-8">
        <Link href="/" className="text-sm text-wealth-teal no-underline hover:underline">
          &larr; All posts
        </Link>
        <h1 className="mt-4 font-instrument text-3xl text-deep-slate">
          Posts tagged <span className="text-burnt-amber">#{tag}</span>
        </h1>
      </header>

      <div className="divide-y divide-deep-slate/10">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group block py-5 no-underline first:pt-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-instrument text-lg text-deep-slate group-hover:text-burnt-amber transition-colors">
                  {post.title}
                </h3>
                <p className="mt-1 text-sm text-deep-slate/60 line-clamp-1">
                  {post.hook}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-deep-slate/5 px-2 py-0.5 text-xs text-deep-slate/50"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <time
                className="shrink-0 text-sm text-deep-slate/40"
                dateTime={post.publishedAt.toISOString()}
              >
                {post.publishedAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

**Step 2: Commit**

```bash
git add blog/src/app/tags/[tag]/page.tsx
git commit -m "feat: redesign tag page with text-list layout"
```

---

### Task 9: Create About page

**Files:**
- Create: `blog/src/app/about/page.tsx`

**Step 1: Create the page**

Create `blog/src/app/about/page.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | TWSGurukulX",
  description: "About TWSGurukulX — live stream trading analysis from Trading With Sidhant Team",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-prose px-4 py-12">
      <h1 className="font-instrument text-3xl text-deep-slate sm:text-4xl">
        About TWSGurukulX
      </h1>

      <div className="mt-6 space-y-4 leading-relaxed text-deep-slate/80">
        <p>
          Trading With Sidhant Team breaks down Nifty, BankNifty, and options
          setups live — every trading day. This blog captures those sessions so
          you can revisit the analysis, study the setups, and learn at your own
          pace.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="font-instrument text-2xl text-deep-slate">
          What You&apos;ll Find Here
        </h2>
        <ul className="mt-4 space-y-2 text-deep-slate/80">
          <li>Live stream recaps with key levels and setups</li>
          <li>Chart analysis with annotated screenshots</li>
          <li>Market context and trading insights</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-instrument text-2xl text-deep-slate">Contact</h2>
        <div className="mt-4 space-y-1 text-deep-slate/80">
          <p>Trading With Sidhant LLP</p>
          <p>
            <a href="tel:+918062963333" className="text-wealth-teal">
              +91-8062963333
            </a>
          </p>
          <p>
            <a
              href="https://twsgurukul.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-wealth-teal"
            >
              twsgurukul.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
```

**Step 2: Commit**

```bash
git add blog/src/app/about/page.tsx
git commit -m "feat: add About page"
```

---

### Task 10: Update globals.css and branding references

**Files:**
- Modify: `blog/src/app/globals.css`
- Modify: `blog/src/app/sitemap.ts`
- Delete: `blog/src/components/PostCard.tsx` (replaced by inline list items)

**Step 1: Update globals.css with font-family utilities**

Replace `blog/src/app/globals.css` entirely:

```css
@import "tailwindcss";

@theme inline {
  --color-deep-slate: #2C3539;
  --color-burnt-amber: #C87533;
  --color-brushed-gold: #B8956A;
  --color-warm-white: #FAF8F5;
  --color-wealth-teal: #0A8D7A;
  --font-satoshi: "Satoshi", sans-serif;
  --font-instrument: "Instrument Serif", serif;
}

body {
  background-color: var(--color-warm-white);
  color: var(--color-deep-slate);
  font-family: var(--font-satoshi);
}

h1, h2, h3 {
  font-family: var(--font-instrument);
}

a {
  color: var(--color-wealth-teal);
}

a:hover {
  text-decoration: underline;
}

/* Utility for Instrument Serif on non-heading elements */
.font-instrument {
  font-family: var(--font-instrument);
}
```

**Step 2: Update sitemap brand reference**

In `blog/src/app/sitemap.ts`, change the fallback URL:

```typescript
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://twsgurukul.com/insights";
```

Also add the about page to the sitemap entries (after the baseUrl entry):

```typescript
{ url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
```

**Step 3: Delete PostCard.tsx**

The PostCard component is no longer used — home and tag pages now use inline text-list rendering.

Run: `rm blog/src/components/PostCard.tsx`

**Step 4: Commit**

```bash
git add blog/src/app/globals.css blog/src/app/sitemap.ts
git rm blog/src/components/PostCard.tsx
git commit -m "refactor: update branding, sitemap, and remove unused PostCard"
```

---

### Task 11: Verify build

**Step 1: Run build**

Run: `cd blog && npx next build 2>&1 | tail -20`

This will likely fail due to no database connection locally. That's expected. Check that the errors are ONLY database-related (Prisma connection), not TypeScript or import errors.

If there are TypeScript errors, fix them before proceeding.

**Step 2: Verify all imports resolve**

Run: `cd blog && npx tsc --noEmit 2>&1 | head -30`

Expected: No errors, or only errors related to Prisma generated types needing a DB connection.

**Step 3: Commit any fixes**

If fixes were needed:
```bash
git add -A
git commit -m "fix: resolve build errors from website redesign"
```

---

## Summary of Changes

| Task | What | Files |
|------|------|-------|
| 1 | Subscriber Prisma model | schema.prisma |
| 2 | Subscribe API route | api/subscribe/route.ts |
| 3 | Nav + Footer + Layout | Nav.tsx, Footer.tsx, layout.tsx |
| 4 | WhatsApp signup form | WhatsAppCTA.tsx |
| 5 | Chart lightbox | ChartImage.tsx |
| 6 | Home page redesign | page.tsx |
| 7 | Post page redesign | posts/[slug]/page.tsx |
| 8 | Tag page redesign | tags/[tag]/page.tsx |
| 9 | About page | about/page.tsx |
| 10 | CSS + sitemap + cleanup | globals.css, sitemap.ts, remove PostCard |
| 11 | Build verification | — |
