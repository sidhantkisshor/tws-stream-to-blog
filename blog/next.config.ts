import type { NextConfig } from "next";

/**
 * Hostnames the blog used to live on. They stay attached to the Vercel project
 * so these rules can serve a permanent redirect; detaching them would 404 every
 * inbound link and lose the accumulated search equity.
 */
const LEGACY_HOSTS = ["blogs.twsgurukulx.com", "blogs.twsgurukul.com"];

const CANONICAL_ORIGIN = "https://blogs.tradingwithsidhant.com";

const nextConfig: NextConfig = {
  async redirects() {
    // Path-preserving 308 per legacy host. Matching on `host` means preview
    // deployments (*.vercel.app) and the canonical host are never caught.
    return LEGACY_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${CANONICAL_ORIGIN}/:path*`,
      permanent: true,
    }));
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "xfufagmuorpprmwxztut.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/demos/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/((?!demos/).*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
