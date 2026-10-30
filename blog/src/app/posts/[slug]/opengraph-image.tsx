import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/posts";
import { plainDashes, tagLabel } from "@/lib/display";
import { hardLine } from "@/lib/hard-line";
import { getTape } from "@/lib/tape";
import { OgCard, ogFonts, OG_SIZE } from "@/lib/og-card";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME}: Trading insights`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const line = post ? (hardLine(post.sections) ?? plainDashes(post.title)) : SITE_NAME;
  const tape = post ? await getTape(post.sections) : null;
  const tag = post?.tags?.[0] ? tagLabel(post.tags[0]) : undefined;

  return new ImageResponse(<OgCard line={line} tag={tag} tape={tape} />, {
    ...size,
    fonts: await ogFonts(),
  });
}
