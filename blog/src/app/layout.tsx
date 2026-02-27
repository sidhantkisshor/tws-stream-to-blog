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
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&f[]=instrument-serif@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain min-h-screen antialiased">
        <Nav />
        <div className="min-h-[calc(100vh-160px)]">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
