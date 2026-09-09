import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { SITE_WORDMARK } from "@/lib/site";
import { formatPrice, layoutChart, normalizeHeroCard, type HeroCardInput } from "@/lib/hero-card";

/**
 * POST /api/hero-card
 * Renders the "biggest takeaway" hero image for a live-stream post as a 1280x720 PNG.
 * Body: { headline, kicker?, stats?: [{value,label}], chart?: {symbol,name,tf,candles:[{t,o,h,l,c}],levels:[{price,label}]}, footer? }
 * Auth: X-API-Key, same key as POST /api/posts. The n8n LLM pipeline calls this and uploads the PNG to R2.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WIDTH = 1280;
const HEIGHT = 720;

// Blog palette (globals.css tokens): warm-white, deep-slate, wealth-teal, burnt-amber
const BG = "#FAF7F0";
const DEEP = "#2C3539";
const TEAL = "#0A8D7A";
const AMBER = "#B8651A";
const CARD = "#FFFFFF";

let fontCache: Promise<{ name: string; data: Buffer; weight: 400 | 500 | 700; style: "normal" | "italic" }[]> | null = null;
function loadFonts() {
  if (!fontCache) {
    const dir = path.join(process.cwd(), "src", "app", "fonts", "og");
    fontCache = Promise.all([
      readFile(path.join(dir, "Satoshi-Bold.ttf")).then((data) => ({ name: "Satoshi", data, weight: 700 as const, style: "normal" as const })),
      readFile(path.join(dir, "Satoshi-Medium.ttf")).then((data) => ({ name: "Satoshi", data, weight: 500 as const, style: "normal" as const })),
      readFile(path.join(dir, "InstrumentSerif-Italic.ttf")).then((data) => ({ name: "Instrument Serif", data, weight: 400 as const, style: "italic" as const })),
      readFile(path.join(dir, "InstrumentSerif-Regular.ttf")).then((data) => ({ name: "Instrument Serif", data, weight: 400 as const, style: "normal" as const })),
    ]).catch((err) => {
      fontCache = null;
      throw err;
    });
  }
  return fontCache;
}

function Chart({ card }: { card: HeroCardInput }) {
  const chart = card.chart;
  if (!chart) return null;
  const W = 540;
  const H = 400;
  const g = layoutChart(chart, W, H);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: W + 32,
        background: CARD,
        borderRadius: 20,
        border: `1px solid ${DEEP}1F`,
        padding: 16,
        boxShadow: `0 12px 40px ${DEEP}14`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "0 4px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontFamily: "Satoshi", fontWeight: 700, fontSize: 22, color: DEEP }}>{chart.name}</span>
          <span style={{ fontFamily: "Satoshi", fontWeight: 500, fontSize: 15, color: `${DEEP}88`, letterSpacing: 1 }}>
            {[chart.symbol, chart.tf].filter(Boolean).join(" · ")}
          </span>
        </div>
        {g.lastClose ? (
          <span
            style={{
              fontFamily: "Satoshi",
              fontWeight: 700,
              fontSize: 16,
              color: g.lastClose.up ? TEAL : AMBER,
              background: g.lastClose.up ? `${TEAL}14` : `${AMBER}14`,
              padding: "3px 10px",
              borderRadius: 8,
            }}
          >
            {g.lastClose.label}
          </span>
        ) : null}
      </div>
      <div style={{ display: "flex", position: "relative", width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {g.ticks.map((t, i) => (
            <line key={`t${i}`} x1={0} x2={W - 80} y1={t.y} y2={t.y} stroke={`${DEEP}14`} strokeWidth={1} />
          ))}
          {g.levels.map((lv, i) => (
            <line key={`l${i}`} x1={0} x2={W - 80} y1={lv.y} y2={lv.y} stroke={AMBER} strokeWidth={1.5} strokeDasharray="6 5" />
          ))}
          {g.candles.map((c, i) => {
            const color = c.up ? TEAL : AMBER;
            const top = Math.min(c.yO, c.yC);
            const bodyH = Math.max(1.5, Math.abs(c.yO - c.yC));
            return (
              <g key={`c${i}`}>
                <line x1={c.x} x2={c.x} y1={c.yH} y2={c.yL} stroke={color} strokeWidth={1.2} />
                <rect x={c.x - c.w / 2} y={top} width={c.w} height={bodyH} fill={color} rx={1} />
              </g>
            );
          })}
        </svg>
        {g.ticks.map((t, i) => (
          <div
            key={`tl${i}`}
            style={{
              position: "absolute",
              right: 0,
              top: t.y - 9,
              width: 76,
              display: "flex",
              justifyContent: "flex-end",
              fontFamily: "Satoshi",
              fontWeight: 500,
              fontSize: 13,
              color: `${DEEP}77`,
            }}
          >
            {t.label}
          </div>
        ))}
        {g.levels.map((lv, i) => (
          <div
            key={`ll${i}`}
            style={{
              position: "absolute",
              left: 6,
              top: lv.labelY,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "Satoshi",
              fontWeight: 700,
              fontSize: 12,
              color: AMBER,
              background: `${CARD}E6`,
              padding: "2px 6px",
              borderRadius: 5,
            }}
          >
            <span>{formatPrice(lv.price)}</span>
            {lv.label ? <span style={{ fontWeight: 500, color: `${DEEP}99` }}>{lv.label}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ card }: { card: HeroCardInput }) {
  const hasChart = !!card.chart;
  const len = card.headline.length;
  const headlineSize = hasChart ? (len > 70 ? 46 : len > 48 ? 52 : 60) : len > 70 ? 66 : len > 48 ? 76 : 88;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg, ${BG} 0%, #F3EEE3 100%)`,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: hasChart ? "52px 56px 52px 64px" : "72px 96px",
        gap: 40,
        position: "relative",
        fontFamily: "Satoshi",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: WIDTH,
          height: HEIGHT,
          background: `linear-gradient(100deg, transparent 45%, ${TEAL}14 78%, ${TEAL}22 100%)`,
          display: "flex",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, height: "100%", minWidth: 0 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 18, color: AMBER, letterSpacing: 2.5, textTransform: "uppercase", fontWeight: 700 }}>
            <div style={{ width: 30, height: 2, background: AMBER, display: "flex" }} />
            <span>{card.kicker || "Live session takeaway"}</span>
          </div>
          <div
            style={{
              marginTop: 24,
              fontFamily: "Instrument Serif",
              fontStyle: "italic",
              fontSize: headlineSize,
              lineHeight: 1.08,
              color: DEEP,
              letterSpacing: -1,
              display: "flex",
              maxWidth: hasChart ? 600 : 1040,
            }}
          >
            {card.headline}
          </div>
          {card.stats.length ? (
            <div style={{ display: "flex", gap: 14, marginTop: 30, flexWrap: "wrap" }}>
              {card.stats.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    background: CARD,
                    border: `1px solid ${DEEP}1F`,
                    borderRadius: 14,
                    padding: hasChart ? "10px 14px" : "12px 18px",
                    minWidth: hasChart ? 120 : 150,
                  }}
                >
                  <span style={{ fontSize: hasChart ? 26 : 30, fontWeight: 700, color: i === 0 ? TEAL : DEEP, letterSpacing: -0.5, whiteSpace: "nowrap" }}>{s.value}</span>
                  <span style={{ fontSize: hasChart ? 12 : 13, fontWeight: 500, color: `${DEEP}88`, marginTop: 2, textTransform: "uppercase", letterSpacing: 1.1, whiteSpace: "nowrap" }}>{s.label}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 24, whiteSpace: "nowrap" }}>
          <span style={{ fontSize: hasChart ? 19 : 22, fontWeight: 700, letterSpacing: hasChart ? 2 : 3, color: TEAL, whiteSpace: "nowrap", flexShrink: 0 }}>{SITE_WORDMARK}</span>
          <div style={{ width: 2, height: 20, background: `${DEEP}33`, display: "flex", flexShrink: 0 }} />
          <span style={{ fontSize: hasChart ? 15 : 16, fontWeight: 500, color: `${DEEP}88`, whiteSpace: "nowrap" }}>{card.footer}</span>
        </div>
      </div>
      {hasChart ? <Chart card={card} /> : null}
    </div>
  );
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("X-API-Key");
  if (!process.env.PUBLISH_API_KEY || apiKey !== process.env.PUBLISH_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const card = normalizeHeroCard(body);
  if (!card) {
    return NextResponse.json({ error: "headline is required" }, { status: 400 });
  }
  const fonts = await loadFonts();
  const image = new ImageResponse(<Card card={card} />, {
    width: WIDTH,
    height: HEIGHT,
    fonts,
    headers: { "Cache-Control": "no-store" },
  });
  return image;
}
