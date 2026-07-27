import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/posts";
import { SITE_NAME, SITE_WORDMARK } from "@/lib/site";

export const alt = `${SITE_NAME} — Trading insights`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#FAF7F0";
const DEEP = "#2C3539";
const TEAL = "#0A8D7A";
const AMBER = "#B8651A";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const title = post?.title ?? SITE_NAME;
  const tag = post?.tags?.[0] ?? "Trading insights";
  const hero = post?.heroImage ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: BG,
          display: "flex",
          flexDirection: "row",
        }}
      >
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero}
            alt=""
            width={520}
            height={630}
            style={{
              width: 520,
              height: 630,
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: 520,
              height: 630,
              background: `linear-gradient(135deg, ${TEAL} 0%, ${DEEP} 100%)`,
              display: "flex",
            }}
          />
        )}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 18,
                color: AMBER,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 2,
                  background: AMBER,
                  display: "flex",
                }}
              />
              <span>{tag}</span>
            </div>
            <div
              style={{
                marginTop: 28,
                fontSize: title.length > 60 ? 48 : 56,
                lineHeight: 1.15,
                color: DEEP,
                fontWeight: 700,
                letterSpacing: -1,
                display: "flex",
              }}
            >
              {title}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontSize: 22,
              color: DEEP,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: 4,
                color: TEAL,
                display: "flex",
              }}
            >
              {SITE_WORDMARK}
            </div>
            <div
              style={{
                fontSize: 18,
                color: `${DEEP}99`,
                letterSpacing: 1,
                display: "flex",
              }}
            >
              Live stream insights, distilled
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
