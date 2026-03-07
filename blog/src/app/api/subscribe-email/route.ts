import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 5;
const CLEANUP_INTERVAL = 5 * 60_000;
const MAX_MAP_SIZE = 10_000;

let lastCleanup = Date.now();

function isRateLimited(ip: string): boolean {
  const now = Date.now();

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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: { email?: string; tag?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const tag = body.tag?.trim() || "blogs";

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  try {
    const existing = await prisma.emailSubscriber.findUnique({ where: { email } });

    if (existing) {
      if (!existing.active) {
        await prisma.emailSubscriber.update({ where: { email }, data: { active: true } });
      }
      return NextResponse.json({ ok: true });
    }

    await prisma.emailSubscriber.create({ data: { email, tag } });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
