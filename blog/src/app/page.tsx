import Link from "next/link";
import { getRecentPosts } from "@/lib/posts";
import { PostsDisplay } from "@/components/PostsDisplay";
import { TelegramCTA } from "@/components/TelegramCTA";
import { ProgramCTA } from "@/components/ProgramCTA";
import { NewsletterCTA } from "@/components/NewsletterCTA";
import { Shout } from "@/components/Shout";
import { TapePlate } from "@/components/TapePlate";
import { HardLineBand } from "@/components/HardLineBand";
import { plainDashes, formatDate, tagLabel } from "@/lib/display";
import { hardLine } from "@/lib/hard-line";
import { getTape } from "@/lib/tape";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import { TWS_ORGANIZATION } from "@/lib/family";

export const revalidate = 60;

/** The list breaks twice, with this many rows between breaks. */
const BAND_SPACING = 7;
const BAND_COUNT = 2;
const TOPICS = ["bitcoin", "risk-management", "order-flow", "price-action", "trading-psychology"];

export default async function HomePage() {
  const posts = await getRecentPosts(50);

  const baseUrl = SITE_URL;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": `${baseUrl}/#blog`,
      name: `${SITE_NAME} Blog`,
      description: SITE_DESCRIPTION,
      url: baseUrl,
      inLanguage: "en",
      // The @id ties this back to the parent Organization the root layout declares.
      // @type and name are restated because most consumers parse each
      // ld+json block on its own and would otherwise see a nameless stub.
      publisher: { "@id": TWS_ORGANIZATION.id, "@type": "Organization", name: TWS_ORGANIZATION.name },
    },
  ];

  const serializedPosts = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    hook: p.hook,
    tags: p.tags,
    publishedAt: p.publishedAt.toISOString(),
    readingMinutes: p.readingMinutes,
  }));

  const [featured] = posts;
  const featuredTape = featured ? await getTape(featured.sections) : null;

  // Only the posts that can become a band are fetched, and each file is cached
  // for 30 days, so this does not grow with the archive.
  const bandSlots = posts.slice(BAND_SPACING - 1, BAND_SPACING * (BAND_COUNT + 1));
  const bandTapes = await Promise.all(bandSlots.map((p) => getTape(p.sections)));
  const bands: Record<string, React.ReactNode> = {};
  let nextBandAt = BAND_SPACING - 1;
  let bandsMade = 0;
  bandSlots.forEach((p, i) => {
    const index = i + BAND_SPACING - 1;
    const line = hardLine(p.sections);
    const tape = bandTapes[i];
    if (bandsMade < BAND_COUNT && index >= nextBandAt && line && tape) {
      bands[p.id] = (
        <HardLineBand slug={p.slug} title={p.title} tag={p.tags[0]} line={line} tape={tape} />
      );
      bandsMade += 1;
      nextBandAt = index + BAND_SPACING;
    }
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <main>
        <header className="px-[var(--gutter)] pb-8 pt-6 md:pb-12 md:pt-10">
          <Shout as="h1" text="Your guru won't post this" hot="last" wideMin={0.13} />
          <p className="mt-5 max-w-[34ch] text-xl leading-snug text-ink md:mt-7 md:max-w-none md:text-2xl">
            Real trades from our live sessions. The stops, the skips and the reasons.
          </p>
          <nav aria-label="Topics" className="mt-6 flex flex-wrap gap-x-6 gap-y-2 md:mt-8">
            {TOPICS.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="link-rule text-[0.9375rem] font-medium text-ink"
              >
                {tagLabel(tag)}
              </Link>
            ))}
            <Link href="/posts" className="link-rule text-[0.9375rem] font-medium text-ink">
              All posts
            </Link>
          </nav>
        </header>

        {posts.length === 0 ? (
          <div className="px-[var(--gutter)] py-20">
            <p className="text-2xl text-ink">No posts yet.</p>
            <p className="mt-2 text-mute">Check back after the next live stream.</p>
          </div>
        ) : (
          <>
            <Link href={`/posts/${featured.slug}`} className="plate block no-underline">
              {featuredTape && <TapePlate tape={featuredTape} />}
              <div className="px-[var(--gutter)] pb-[80px] pt-[200px] md:pb-[136px] md:pt-[300px] md:pl-[calc(var(--sheet-offset)+56px)]">
                {featured.tags[0] && (
                  <p className="label mb-3 text-[#ff8259]">{tagLabel(featured.tags[0])}</p>
                )}
                <h2 className="plate-title max-w-[20ch]">{plainDashes(featured.title)}</h2>
                <p className="mt-4 max-w-[52ch] text-[1.0625rem] leading-relaxed text-white/80">
                  {plainDashes(featured.hook)}
                </p>
                <p className="label mt-4 text-white/60">
                  {formatDate(featured.publishedAt)}, {featured.readingMinutes} min read
                </p>
              </div>
            </Link>

            <div className="sheet sheet-over">
              <PostsDisplay posts={serializedPosts} bands={bands} />

              <section className="mt-16 grid gap-12 border-t border-rule pt-12 md:grid-cols-2 md:gap-16">
                <TelegramCTA />
                <NewsletterCTA />
              </section>
              <section className="mt-12 border-t border-rule pt-12">
                <ProgramCTA variant="banner" />
              </section>
            </div>
          </>
        )}
      </main>
    </>
  );
}
