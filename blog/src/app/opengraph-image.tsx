import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_WORDMARK, SITE_HOST } from "@/lib/site";

export const alt = `${SITE_NAME} — Live stream trading insights`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#FAF7F0";
const DEEP = "#2C3539";
const TEAL = "#0A8D7A";
const AMBER = "#B8651A";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `linear-gradient(135deg, ${BG} 0%, #F5F0E5 100%)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 360,
            height: 630,
            background: `linear-gradient(135deg, ${TEAL}22 0%, transparent 70%)`,
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            color: AMBER,
            letterSpacing: 2.5,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          <div style={{ width: 36, height: 2, background: AMBER, display: "flex" }} />
          <span>Trading insights</span>
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 88,
            lineHeight: 1.05,
            color: DEEP,
            fontWeight: 800,
            letterSpacing: -2,
            display: "flex",
          }}
        >
          Live stream insights, distilled.
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            lineHeight: 1.4,
            color: `${DEEP}99`,
            display: "flex",
            maxWidth: 900,
          }}
        >
          Daily trading analysis, market structure, and orderflow concepts from Trading With Sidhant.
        </div>
        <div
          style={{
            marginTop: 56,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: 3,
              color: TEAL,
              display: "flex",
            }}
          >
            {SITE_WORDMARK}
          </div>
          <div
            style={{ width: 2, height: 24, background: `${DEEP}33`, display: "flex" }}
          />
          <div
            style={{
              fontSize: 22,
              color: `${DEEP}88`,
              display: "flex",
            }}
          >
            {SITE_HOST}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
