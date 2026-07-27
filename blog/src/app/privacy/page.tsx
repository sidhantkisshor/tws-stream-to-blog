import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, SITE_HOST, LEGAL_ENTITY, SOCIAL, MAIN_SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE_NAME} (${SITE_HOST}) — how we collect, use, and protect your data.`,
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: `Privacy policy for ${SITE_NAME} — how we collect, use, and protect your data.`,
    images: [{ url: "/og-banner.png", width: 1200, height: 630 }],
  },
};

export default function PrivacyPage() {
  const baseUrl = SITE_URL;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy",
    url: `${baseUrl}/privacy`,
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
            Privacy{" "}
            <span className="font-instrument text-burnt-amber">Policy</span>
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
              {LEGAL_ENTITY} (&quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;) operates{" "}
              <a
                href={SITE_URL}
                className="text-wealth-teal no-underline hover:underline"
              >
                {SITE_HOST}
              </a>{" "}
              (the &quot;Site&quot;). This Privacy Policy explains what
              information we collect, how we use it, and the choices you have.
            </p>
            <p>
              We are committed to protecting your privacy in accordance with the
              Digital Personal Data Protection Act, 2023 (DPDP Act) and other
              applicable Indian laws.
            </p>
          </div>
        </section>

        {/* Data We Collect */}
        <section className="mt-10 animate-reveal delay-3">
          <h2 className="text-2xl font-bold text-deep-slate">
            Data We Collect
          </h2>
          <div className="mt-4 space-y-4 leading-[1.75] text-deep-slate/70">
            <p>We collect a minimal amount of data:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  <strong className="text-deep-slate/90">Phone number</strong>{" "}
                  — If you opt in to receive WhatsApp notifications about new
                  blog posts, we collect your phone number through our
                  subscription form. This is the only personal data we request.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  <strong className="text-deep-slate/90">
                    Analytics data (cookies)
                  </strong>{" "}
                  — We use Google Tag Manager (GTM) to understand how visitors
                  use the Site. GTM is loaded{" "}
                  <strong className="text-deep-slate/90">
                    only after you accept cookies
                  </strong>{" "}
                  via our consent banner. Analytics data may include pages
                  visited, time on site, browser type, and approximate location.
                </span>
              </li>
            </ul>
            <p>
              If you opt in to receive email alerts about new blog posts, we
              collect your email address through our newsletter subscription
              form. We do not offer user accounts and do not have a comments
              system.
            </p>
          </div>
        </section>

        {/* How We Use Your Data */}
        <section className="mt-10 animate-reveal delay-3">
          <h2 className="text-2xl font-bold text-deep-slate">
            How We Use Your Data
          </h2>
          <ul className="mt-4 space-y-3 leading-[1.75] text-deep-slate/70">
            <li className="flex items-start gap-3">
              <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
              <span>
                <strong className="text-deep-slate/90">
                  WhatsApp notifications
                </strong>{" "}
                — Your phone number is used solely to send you updates when a
                new blog post is published.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
              <span>
                <strong className="text-deep-slate/90">
                  Email alerts
                </strong>{" "}
                — Your email address is used solely to notify you when a new
                blog post is published.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
              <span>
                <strong className="text-deep-slate/90">
                  Analytics and site improvement
                </strong>{" "}
                — Aggregated analytics data helps us understand traffic patterns
                and improve content.
              </span>
            </li>
          </ul>
          <p className="mt-4 leading-[1.75] text-deep-slate/70">
            We do not use your data for marketing, share it with third parties,
            or sell it.
          </p>
        </section>

        {/* Lawful Basis (DPDP Act) */}
        <section className="mt-10 animate-reveal delay-3">
          <h2 className="text-2xl font-bold text-deep-slate">
            Lawful Basis for Processing
          </h2>
          <div className="mt-4 space-y-4 leading-[1.75] text-deep-slate/70">
            <p>
              Under the Digital Personal Data Protection Act, 2023 (DPDP Act),
              we process your personal data based on your{" "}
              <strong className="text-deep-slate/90">consent</strong>:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  You provide your phone number voluntarily when subscribing to
                  WhatsApp updates.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  Analytics cookies are loaded only after you accept the cookie
                  consent banner.
                </span>
              </li>
            </ul>
            <p>
              You may withdraw consent at any time by contacting us (see
              below), after which we will cease processing the relevant data.
            </p>
          </div>
        </section>

        {/* Data Retention & Deletion */}
        <section className="mt-10 animate-reveal delay-3">
          <h2 className="text-2xl font-bold text-deep-slate">
            Data Retention &amp; Deletion
          </h2>
          <div className="mt-4 space-y-4 leading-[1.75] text-deep-slate/70">
            <p>
              We retain your phone number for as long as you remain subscribed
              to WhatsApp updates. You can request deletion of your data at any
              time by sending a message to{" "}
              <a
                href={SOCIAL.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-wealth-teal no-underline hover:underline"
              >
                wa.me/918062963333
              </a>{" "}
              or calling{" "}
              <a
                href="tel:+918062963333"
                className="text-wealth-teal no-underline hover:underline"
              >
                +91-8062963333
              </a>
              .
            </p>
            <p>
              Upon receiving a deletion request, we will remove your phone
              number from our database within 7 business days and confirm the
              deletion via WhatsApp.
            </p>
          </div>
        </section>

        {/* Third-Party Services */}
        <section className="mt-10 animate-reveal delay-3">
          <h2 className="text-2xl font-bold text-deep-slate">
            Third-Party Services
          </h2>
          <div className="mt-4 space-y-4 leading-[1.75] text-deep-slate/70">
            <p>The Site relies on the following third-party services:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  <strong className="text-deep-slate/90">
                    Google Tag Manager
                  </strong>{" "}
                  — Analytics and tracking, loaded only after cookie consent.
                  Subject to{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-wealth-teal no-underline hover:underline"
                  >
                    Google&apos;s Privacy Policy
                  </a>
                  .
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  <strong className="text-deep-slate/90">Vercel</strong> — Site
                  hosting and edge delivery. Subject to{" "}
                  <a
                    href="https://vercel.com/legal/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-wealth-teal no-underline hover:underline"
                  >
                    Vercel&apos;s Privacy Policy
                  </a>
                  .
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  <strong className="text-deep-slate/90">Neon</strong> —
                  Managed PostgreSQL database where subscriber phone numbers are
                  stored. Subject to{" "}
                  <a
                    href="https://neon.tech/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-wealth-teal no-underline hover:underline"
                  >
                    Neon&apos;s Privacy Policy
                  </a>
                  .
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  <strong className="text-deep-slate/90">
                    Cloudflare R2
                  </strong>{" "}
                  — Object storage for blog images. Subject to{" "}
                  <a
                    href="https://www.cloudflare.com/privacypolicy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-wealth-teal no-underline hover:underline"
                  >
                    Cloudflare&apos;s Privacy Policy
                  </a>
                  .
                </span>
              </li>
            </ul>
            <p>
              We do not sell, rent, or trade your personal data to any third
              party.
            </p>
          </div>
        </section>

        {/* Cookie Policy */}
        <section className="mt-10 animate-reveal delay-3">
          <h2 className="text-2xl font-bold text-deep-slate">Cookie Policy</h2>
          <div className="mt-4 space-y-4 leading-[1.75] text-deep-slate/70">
            <p>
              The Site uses a cookie consent banner. Google Tag Manager and its
              associated cookies are loaded{" "}
              <strong className="text-deep-slate/90">
                only after you click &quot;Accept&quot;
              </strong>
              . If you decline or ignore the banner, no analytics cookies are
              set.
            </p>
            <p>
              A single{" "}
              <code className="rounded bg-deep-slate/5 px-1.5 py-0.5 text-sm">
                cookie_consent
              </code>{" "}
              key is stored in your browser&apos;s localStorage to remember your
              preference. This is not a cookie and contains no personal data.
            </p>
            <p>
              You can withdraw cookie consent at any time by clearing your
              browser&apos;s localStorage or site data for this domain.
            </p>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="mt-10 animate-reveal delay-3">
          <h2 className="text-2xl font-bold text-deep-slate">
            Children&apos;s Privacy
          </h2>
          <div className="mt-4 space-y-4 leading-[1.75] text-deep-slate/70">
            <p>
              The Site is not directed at individuals under the age of 18. We do
              not knowingly collect personal data from minors. If you believe a
              minor has provided us with personal data, please contact us and we
              will promptly delete it.
            </p>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mt-10 animate-reveal delay-3">
          <h2 className="text-2xl font-bold text-deep-slate">Your Rights</h2>
          <div className="mt-4 space-y-4 leading-[1.75] text-deep-slate/70">
            <p>
              Under the DPDP Act, 2023 and applicable Indian law, you have the
              right to:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  Access the personal data we hold about you
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>Request correction of inaccurate data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>Request erasure (deletion) of your data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>Withdraw consent for data processing</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
                <span>
                  Lodge a grievance with us or with the Data Protection Board of
                  India
                </span>
              </li>
            </ul>
            <p>
              To exercise any of these rights, contact us using the details
              below.
            </p>
          </div>
        </section>

        {/* Changes to This Policy */}
        <section className="mt-10 animate-reveal delay-3">
          <h2 className="text-2xl font-bold text-deep-slate">
            Changes to This Policy
          </h2>
          <div className="mt-4 space-y-4 leading-[1.75] text-deep-slate/70">
            <p>
              We may update this Privacy Policy from time to time. Changes will
              be posted on this page with a revised &quot;Last updated&quot;
              date. Continued use of the Site after changes constitutes
              acceptance of the updated policy.
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
