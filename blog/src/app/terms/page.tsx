import type { Metadata } from "next";
import {
  SITE_URL,
  SITE_NAME,
  SITE_HOST,
  LEGAL_ENTITY,
  SOCIAL,
  MAIN_SITE_URL,
  PROGRAMS_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of service for ${SITE_NAME} (${SITE_HOST}) — usage terms, disclaimers, and legal information.`,
  alternates: { canonical: "/terms" },
  openGraph: {
    title: `Terms of Service | ${SITE_NAME}`,
    description: `Terms of service for ${SITE_NAME} — usage terms, disclaimers, and legal information.`,
    images: [{ url: "/og-banner.png", width: 1200, height: 630 }],
  },
};

export default function TermsPage() {
  const baseUrl = SITE_URL;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service",
    url: `${baseUrl}/terms`,
    publisher: {
      "@type": "Organization",
      name: LEGAL_ENTITY,
      url: baseUrl,
    },
    dateModified: "2026-03-06",
    inLanguage: "en",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main className="mx-auto max-w-prose px-4 py-12">
        <div className="animate-reveal">
          <h1 className="text-3xl font-bold tracking-tight text-deep-slate sm:text-4xl">
            Terms of{" "}
            <span className="font-instrument text-burnt-amber">Service</span>
          </h1>
          <p className="mt-3 text-sm text-deep-slate/40">
            Last updated: March 6, 2026
          </p>
        </div>

        <div className="accent-line mt-8 animate-reveal delay-1" />

        {/* Introduction */}
        <section className="mt-10 animate-reveal delay-2">
          <div className="space-y-4 leading-[1.75] text-deep-slate/70">
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your use of{" "}
              <a
                href={SITE_URL}
                className="text-wealth-teal no-underline hover:underline"
              >
                {SITE_HOST}
              </a>{" "}
              (the &quot;Site&quot;), operated by {LEGAL_ENTITY}, a
              limited liability partnership registered in India
              (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
            </p>
            <p>
              By accessing or using the Site, you agree to be bound by these
              Terms. If you do not agree, please do not use the Site.
            </p>
          </div>
        </section>

        {/* Not Financial Advice */}
        <section className="mt-10 animate-reveal delay-3">
          <h2 className="text-2xl font-bold text-deep-slate">
            Educational Content Only — Not Financial Advice
          </h2>
          <div className="mt-4 space-y-4 leading-[1.75] text-deep-slate/70">
            <div className="rounded-lg border border-burnt-amber/20 bg-burnt-amber/5 p-4">
              <p className="font-medium text-deep-slate/90">
                All content on this Site is provided for educational and
                informational purposes only. Nothing on this Site constitutes
                financial advice, investment advice, trading advice, or any
                other form of professional advice.
              </p>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  Blog posts are auto-generated summaries of live stream trading
                  sessions. They reflect real-time market commentary and
                  analysis that may no longer be relevant at the time you read
                  them.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  Trading in stocks, options, futures, and other financial
                  instruments involves substantial risk of loss. You should
                  consult a qualified financial advisor before making any
                  investment decisions.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  Past performance discussed in any blog post does not guarantee
                  future results. Market conditions change, and strategies that
                  worked previously may not work in the future.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  We are not registered with SEBI (Securities and Exchange Board
                  of India) as investment advisors or research analysts. Content
                  should not be treated as a recommendation to buy or sell any
                  security.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* No Guarantee of Accuracy */}
        <section className="mt-10 animate-reveal delay-3">
          <h2 className="text-2xl font-bold text-deep-slate">
            No Guarantee of Accuracy
          </h2>
          <div className="mt-4 space-y-4 leading-[1.75] text-deep-slate/70">
            <p>
              Blog posts are generated through an automated pipeline that
              transcribes live stream audio and processes it through multiple AI
              models. While we strive for accuracy, this process may introduce
              errors, omissions, or misinterpretations.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  Price levels, support/resistance zones, and other numerical
                  data may contain transcription errors.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  Market analysis reflects conditions at the time of the
                  original live stream, not at the time of publication or
                  reading.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  We do not guarantee the completeness, reliability, or
                  timeliness of any content.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mt-10 animate-reveal delay-3">
          <h2 className="text-2xl font-bold text-deep-slate">
            Intellectual Property
          </h2>
          <div className="mt-4 space-y-4 leading-[1.75] text-deep-slate/70">
            <p>
              All content on the Site — including blog posts, images, graphics,
              and design — is owned by {LEGAL_ENTITY} or used under
              license. Blog content is auto-generated from live stream sessions
              conducted by the Trading With Sidhant team.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  You may share links to blog posts freely. You may not
                  reproduce, distribute, or republish full blog content without
                  prior written permission.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  The {SITE_NAME} name, logo, and branding are trademarks of{" "}
                  {LEGAL_ENTITY}.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Subscription Terms */}
        <section className="mt-10 animate-reveal delay-3">
          <h2 className="text-2xl font-bold text-deep-slate">
            WhatsApp Subscription
          </h2>
          <div className="mt-4 space-y-4 leading-[1.75] text-deep-slate/70">
            <p>
              The Site offers an optional WhatsApp notification service for new
              blog posts. By subscribing:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  You consent to receiving WhatsApp messages about new blog
                  posts from us.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  You can unsubscribe at any time by messaging us on WhatsApp at{" "}
                  <a
                    href={SOCIAL.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-wealth-teal no-underline hover:underline"
                  >
                    wa.me/918062963333
                  </a>
                  .
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  The service is free of charge. We reserve the right to
                  discontinue it at any time.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mt-10 animate-reveal delay-3">
          <h2 className="text-2xl font-bold text-deep-slate">
            Limitation of Liability
          </h2>
          <div className="mt-4 space-y-4 leading-[1.75] text-deep-slate/70">
            <p>
              To the fullest extent permitted by Indian law:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  The Site and its content are provided &quot;as is&quot; and
                  &quot;as available&quot; without warranties of any kind,
                  whether express or implied.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  We shall not be liable for any direct, indirect, incidental,
                  consequential, or punitive damages arising from your use of
                  the Site or reliance on its content.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  We are not liable for any financial losses incurred from
                  trading decisions made based on content from this Site.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Third-Party Links */}
        <section className="mt-10 animate-reveal delay-3">
          <h2 className="text-2xl font-bold text-deep-slate">
            Third-Party Links
          </h2>
          <div className="mt-4 space-y-4 leading-[1.75] text-deep-slate/70">
            <p>
              The Site may contain links to third-party websites (including
              YouTube, social media platforms, and partner sites such as{" "}
              <a
                href={PROGRAMS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-wealth-teal no-underline hover:underline"
              >
                tradingwithsidhant.com/programs
              </a>{" "}
              and{" "}
              <a
                href={MAIN_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-wealth-teal no-underline hover:underline"
              >
                tradingwithsidhant.com
              </a>
              ). These links are provided for convenience. We do not control,
              endorse, or assume responsibility for the content or privacy
              practices of third-party sites.
            </p>
          </div>
        </section>

        {/* Governing Law */}
        <section className="mt-10 animate-reveal delay-3">
          <h2 className="text-2xl font-bold text-deep-slate">
            Governing Law &amp; Jurisdiction
          </h2>
          <div className="mt-4 space-y-4 leading-[1.75] text-deep-slate/70">
            <p>
              These Terms are governed by and construed in accordance with the
              laws of India. Any disputes arising from or relating to these
              Terms or your use of the Site shall be subject to the exclusive
              jurisdiction of the courts in India.
            </p>
          </div>
        </section>

        {/* Changes to Terms */}
        <section className="mt-10 animate-reveal delay-3">
          <h2 className="text-2xl font-bold text-deep-slate">
            Changes to These Terms
          </h2>
          <div className="mt-4 space-y-4 leading-[1.75] text-deep-slate/70">
            <p>
              We may update these Terms from time to time. Changes will be
              posted on this page with a revised &quot;Last updated&quot; date.
              Continued use of the Site after changes constitutes acceptance of
              the updated Terms.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mt-10 animate-reveal delay-4">
          <h2 className="text-2xl font-bold text-deep-slate">Contact Us</h2>
          <div className="mt-4 space-y-1.5 text-deep-slate/70">
            <p className="font-medium text-deep-slate/50">
              {LEGAL_ENTITY}
            </p>
            <p>
              <a
                href="tel:+918062963333"
                className="text-wealth-teal no-underline hover:underline"
              >
                +91-8062963333
              </a>
            </p>
            <p>
              WhatsApp:{" "}
              <a
                href={SOCIAL.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-wealth-teal no-underline hover:underline"
              >
                wa.me/918062963333
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
      </main>
    </>
  );
}
