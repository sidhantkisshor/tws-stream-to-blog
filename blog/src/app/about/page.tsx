import type { Metadata } from "next";
import { TelegramCTA } from "@/components/TelegramCTA";
import { Shout } from "@/components/Shout";
import { SITE_NAME, LEGAL_ENTITY, SOCIAL, MAIN_SITE_URL, OG_IMAGE, SITE_OPEN_GRAPH } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${SITE_NAME}: live stream trading analysis from Trading With Sidhant Team`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About ${SITE_NAME}`,
    description: `About ${SITE_NAME}: live stream trading analysis from Trading With Sidhant Team`,
    images: [OG_IMAGE],
    ...SITE_OPEN_GRAPH,
  },
};

const FOLLOW = [
  { label: "YouTube", href: SOCIAL.youtube },
  { label: "Instagram", href: SOCIAL.instagram },
  { label: "X (Twitter)", href: SOCIAL.x },
  { label: "Telegram", href: SOCIAL.telegram },
  { label: "WhatsApp (Support)", href: SOCIAL.whatsapp },
];

export default function AboutPage() {
  // The Organization node this page used to declare now lives in the root
  // layout's @graph, so it ships on every route rather than only on /about.
  return (
    <main>
      <header className="px-[var(--gutter)] pb-10 pt-6 md:pb-14 md:pt-10">
        <Shout as="h1" text={`About ${SITE_NAME}`} />
      </header>

      <div className="sheet">
        <div className="max-w-[68ch] space-y-14 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-14 lg:space-y-0">
          <p className="text-xl leading-[1.6] text-ink">
            Trading With Sidhant Team breaks down Nifty, BankNifty, and options setups live, every
            trading day. This blog captures those sessions so you can revisit the analysis, study the
            setups, and learn at your own pace.
          </p>

          <section className="border-t border-rule pt-8">
            <h2 className="section-heading">What You&apos;ll Find Here</h2>
            <ul className="mt-5 space-y-3 text-[1.125rem] leading-snug text-ink">
              <li>Live stream recaps with key levels and setups</li>
              <li>Chart analysis with annotated screenshots</li>
              <li>Market context and trading insights</li>
            </ul>
          </section>

          <section className="border-t border-rule pt-8">
            <h2 className="section-heading">Contact</h2>
            <div className="mt-5 space-y-2 text-[1.125rem]">
              <p className="text-mute">{LEGAL_ENTITY}</p>
              <p>
                <a href="tel:+918062963333" className="link-rule text-ink">
                  +91-8062963333
                </a>
              </p>
              <p>
                <a href={MAIN_SITE_URL} target="_blank" rel="noopener noreferrer" className="link-rule text-ink">
                  tradingwithsidhant.com
                </a>
              </p>
            </div>
          </section>

          <section className="border-t border-rule pt-8">
            <h2 className="section-heading">Follow Us</h2>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[1.125rem]">
              {FOLLOW.map((f) => (
                <a key={f.label} href={f.href} target="_blank" rel="noopener noreferrer" className="link-rule text-ink">
                  {f.label}
                </a>
              ))}
            </div>
          </section>

          <section className="border-t border-rule pt-8">
            <TelegramCTA />
          </section>
        </div>
      </div>
    </main>
  );
}
