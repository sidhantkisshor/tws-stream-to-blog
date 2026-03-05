import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import "./globals.css";

const GTM_ID = "GTM-TMQ589CP";

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
  ],
  variable: "--font-instrument-var",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://blogs.twsgurukul.com"),
  title: {
    default: "TWSGurukulX — Trading Insights",
    template: "%s | TWSGurukulX",
  },
  description: "Live stream trading analysis and market insights from Trading With Sidhant Team",
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "TWSGurukulX — Trading Insights",
    description: "Live stream trading analysis and market insights from Trading With Sidhant Team",
    images: [{ url: "/og-banner.png", width: 1200, height: 630 }],
    siteName: "TWSGurukulX",
  },
  twitter: {
    card: "summary_large_image",
    site: "@tradingwsidhant",
    images: ["/og-banner.png"],
  },
  other: {
    "llms.txt": "/llms.txt",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${satoshi.variable} ${instrumentSerif.variable}`}>
      <head>
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
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Nav />
        <div className="min-h-[calc(100vh-160px)]">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
