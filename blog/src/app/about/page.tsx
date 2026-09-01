import type { Metadata } from "next";
import { TelegramCTA } from "@/components/TelegramCTA";
import {
  SITE_URL,
  SITE_NAME,
  LEGAL_ENTITY,
  SOCIAL,
  CONTACT_PHONE,
  MAIN_SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${SITE_NAME}: live stream trading analysis from Trading With Sidhant Team`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About ${SITE_NAME}`,
    description: `About ${SITE_NAME}: live stream trading analysis from Trading With Sidhant Team`,
    images: [{ url: "/og-banner.png", width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  const baseUrl = SITE_URL;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: LEGAL_ENTITY,
    url: baseUrl,
    logo: `${baseUrl}/logo-icon.png`,
    sameAs: [
      SOCIAL.youtube,
      SOCIAL.instagram,
      SOCIAL.x,
      SOCIAL.telegram,
      SOCIAL.whatsapp,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: CONTACT_PHONE,
      contactType: "customer service",
    },
    inLanguage: "en",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    <main className="mx-auto max-w-prose px-4 py-12">
      <div className="animate-reveal">
        <h1 className="text-3xl font-bold tracking-tight text-deep-slate sm:text-4xl">
          About <span className="font-instrument text-burnt-amber">{SITE_NAME}</span>
        </h1>

        <div className="mt-6 space-y-4 leading-[1.75] text-deep-slate/70">
          <p>
            Trading With Sidhant Team breaks down Nifty, BankNifty, and options
            setups live, every trading day. This blog captures those sessions so
            you can revisit the analysis, study the setups, and learn at your own
            pace.
          </p>
        </div>
      </div>

      <div className="accent-line mt-10 animate-reveal delay-1" />

      <section className="mt-10 animate-reveal delay-2">
        <h2 className="text-2xl font-bold text-deep-slate">
          What You&apos;ll Find Here
        </h2>
        <ul className="mt-4 space-y-3 text-deep-slate/70">
          <li className="flex items-start gap-3">
            <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
            <span>Live stream recaps with key levels and setups</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
            <span>Chart analysis with annotated screenshots</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
            <span>Market context and trading insights</span>
          </li>
        </ul>
      </section>

      <section className="mt-10 animate-reveal delay-3">
        <h2 className="text-2xl font-bold text-deep-slate">Contact</h2>
        <div className="mt-4 space-y-1.5 text-deep-slate/70">
          <p className="font-medium text-deep-slate/50">{LEGAL_ENTITY}</p>
          <p>
            <a href="tel:+918062963333" className="text-wealth-teal no-underline hover:underline">
              +91-8062963333
            </a>
          </p>
          <p>
            <a
              href={MAIN_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-wealth-teal no-underline hover:underline"
            >
              tradingwithsidhant.com
            </a>
          </p>
        </div>
      </section>

      <section className="mt-10 animate-reveal delay-4">
        <h2 className="text-2xl font-bold text-deep-slate">Follow Us</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={SOCIAL.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-deep-slate/5 px-4 py-1.5 text-sm font-medium text-deep-slate/60 no-underline transition-colors hover:bg-deep-slate/10 hover:text-deep-slate/80"
          >
            YouTube
          </a>
          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-deep-slate/5 px-4 py-1.5 text-sm font-medium text-deep-slate/60 no-underline transition-colors hover:bg-deep-slate/10 hover:text-deep-slate/80"
          >
            Instagram
          </a>
          <a
            href={SOCIAL.x}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-deep-slate/5 px-4 py-1.5 text-sm font-medium text-deep-slate/60 no-underline transition-colors hover:bg-deep-slate/10 hover:text-deep-slate/80"
          >
            X (Twitter)
          </a>
          <a
            href={SOCIAL.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-deep-slate/5 px-4 py-1.5 text-sm font-medium text-deep-slate/60 no-underline transition-colors hover:bg-deep-slate/10 hover:text-deep-slate/80"
          >
            Telegram
          </a>
          <a
            href={SOCIAL.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-deep-slate/5 px-4 py-1.5 text-sm font-medium text-deep-slate/60 no-underline transition-colors hover:bg-deep-slate/10 hover:text-deep-slate/80"
          >
            WhatsApp (Support)
          </a>
        </div>
      </section>

      <section className="mt-14 animate-reveal delay-5">
        <TelegramCTA />
      </section>
    </main>
    </>
  );
}
