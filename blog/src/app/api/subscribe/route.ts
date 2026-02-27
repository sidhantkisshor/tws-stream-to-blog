import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PHONE_PATTERNS: Record<string, RegExp> = {
  "+91": /^\d{10}$/,
  "+1": /^\d{10}$/,
  "+44": /^\d{10,11}$/,
  "+971": /^\d{8,9}$/,
  "+65": /^\d{8}$/,
};
const DEFAULT_PATTERN = /^\d{7,15}$/;

// In-memory rate limiter with periodic cleanup to prevent unbounded growth
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per window
const CLEANUP_INTERVAL = 5 * 60_000; // clean stale entries every 5 minutes
const MAX_MAP_SIZE = 10_000; // hard cap on tracked IPs

let lastCleanup = Date.now();

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Periodic cleanup of stale entries
  if (now - lastCleanup > CLEANUP_INTERVAL || rateLimitMap.size > MAX_MAP_SIZE) {
    for (const [key, timestamps] of rateLimitMap) {
      const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
      if (recent.length === 0) rateLimitMap.delete(key);
      else rateLimitMap.set(key, recent);
    }
    lastCleanup = now;
  }

  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: { phone?: string; countryCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phone = body.phone?.trim();
  const countryCode = body.countryCode?.trim() || "+91";

  if (!phone) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  const pattern = PHONE_PATTERNS[countryCode] || DEFAULT_PATTERN;
  if (!pattern.test(phone)) {
    return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
  }

  const fullNumber = `${countryCode}${phone}`;

  try {
    const existing = await prisma.subscriber.findUnique({
      where: { phone: fullNumber },
    });

    if (existing) {
      if (!existing.active) {
        await prisma.subscriber.update({
          where: { phone: fullNumber },
          data: { active: true },
        });
      }
      return NextResponse.json({ ok: true });
    }

    await prisma.subscriber.create({
      data: { phone: fullNumber, countryCode },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
