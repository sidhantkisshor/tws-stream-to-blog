import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PHONE_PATTERNS: Record<string, RegExp> = {
  "+91": /^\d{10}$/,
};
const DEFAULT_PATTERN = /^\d{7,15}$/;

export async function POST(request: NextRequest) {
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
}
