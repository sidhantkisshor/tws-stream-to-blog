import { ImageResponse } from "next/og";
import { OgCard, ogFonts, OG_SIZE } from "@/lib/og-card";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME}: Live stream trading insights`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(<OgCard line="Your guru won't post this" tape={null} />, {
    ...size,
    fonts: await ogFonts(),
  });
}
