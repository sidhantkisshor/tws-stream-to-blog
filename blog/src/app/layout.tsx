import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { BackToTop } from "@/components/BackToTop";
import {
  SITE_URL,
  SITE_TITLE,
  SITE_NAME,
  SITE_DESCRIPTION,
  TWITTER_HANDLE,
  GTM_ID,
  LEGAL_ENTITY,
  SAME_AS,
  CONTACT_PHONE,
  SCHEMA_LOGO,
} from "@/lib/site";
import "./globals.css";

const satoshi = localFont({
  src: [
    { path: "./fonts/Satoshi-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Satoshi-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi-var",
  display: "swap",
});

const instrumentSerif = localFont({
  src: [
    { path: "./fonts/InstrumentSerif-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/InstrumentSerif-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument-var",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
  // PNGs, not an .ico: every browser still in support has read PNG favicons for
  // years, and both of the files named here before were retired GurukulX
  // artwork. Serving two sizes lets the browser pick without downscaling.
  //
  // The App Router also serves `src/app/favicon.ico` automatically and that
  // file convention outranks this metadata, so the icon here only takes effect
  // because that file was deleted. Do not restore it.
  icons: {
    icon: [
      { url: "/brand-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand-icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/brand-icon-180.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    // No static `images` here: setting openGraph.images at the root segment would
    // suppress the dynamic `opengraph-image.tsx` file convention (Next only applies
    // the file when the segment's metadata has no openGraph.images). Omitting it lets
    // the branded dynamic OG image render site-wide.
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    site: TWITTER_HANDLE,
    // twitter:image intentionally omitted so X falls back to the dynamic og:image,
    // consistent with the per-post pages.
  },
  other: {
    "llms.txt": "/llms.txt",
  },
};

/**
 * The one canonical description of the publisher and the site, emitted here
 * because the root layout wraps every route. Page-level schema (Blog, Article,
 * WebPage) points at these two stable @id values instead of restating name,
 * legalName and logo, so the entity cannot drift apart page by page the way it
 * did when five files each declared their own Organization.
 */
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      legalName: LEGAL_ENTITY,
      url: SITE_URL,
      // Deliberately not BRAND_AVATAR: the display mark is too small for
      // Google's 112x112 floor on an Organization logo, so schema gets the
      // 512x512 rendering of the same avatar. See SCHEMA_LOGO in lib/site.
      logo: `${SITE_URL}${SCHEMA_LOGO}`,
      sameAs: [...SAME_AS],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: CONTACT_PHONE,
        contactType: "customer service",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${satoshi.variable} ${instrumentSerif.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();` }} />
        <Script id="gtm-init" strategy="afterInteractive">{`
          window.dataLayer=window.dataLayer||[];
          window.loadGTM=function(){if(window.__gtmLoaded)return;window.__gtmLoaded=true;
          var f=document.getElementsByTagName('script')[0],
          j=document.createElement('script');j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id=${GTM_ID}';
          f.parentNode.insertBefore(j,f);window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});};
          try{if(localStorage.getItem('cookie_consent')==='accepted'){
          if('requestIdleCallback' in window){requestIdleCallback(window.loadGTM);}
          else{setTimeout(window.loadGTM,2000);}}}catch(e){}
        `}</Script>
      </head>
      <body className="grain min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd).replace(/</g, "\\u003c") }}
        />
        <a
          href="#main-content"
          className="fixed left-2 top-2 z-50 -translate-y-16 rounded-md bg-wealth-teal px-4 py-2 text-sm font-medium text-white transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Nav />
        <div id="main-content" className="min-h-[calc(100vh-160px)]">{children}</div>
        <Footer />
        <BackToTop />
        <CookieConsent />
      </body>
    </html>
  );
}
