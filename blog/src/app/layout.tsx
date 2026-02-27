import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TWS Trading Insights",
  description: "Live stream trading analysis and market insights from TWS Wealth OS",
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
        {children}
      </body>
    </html>
  );
}
