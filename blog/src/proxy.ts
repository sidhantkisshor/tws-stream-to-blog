import { NextResponse, type NextRequest } from "next/server";
import { tagSlug } from "@/lib/tags";

/**
 * Old tag URLs ("/tags/Bitcoin", "/tags/Order%20Flow") get a permanent 308 to
 * the lowercase-hyphen slug. This lives in the proxy, not the page: the page
 * cache matches paths case-insensitively, so a redirect thrown from the page
 * for "Bitcoin" is cached under the canonical "bitcoin" entry and redirects
 * the canonical URL to itself.
 */
export function proxy(request: NextRequest) {
  const segment = request.nextUrl.pathname.slice("/tags/".length).replace(/\/+$/, "");
  let decoded: string;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    return NextResponse.next();
  }
  const slug = tagSlug(decoded);
  if (slug && decoded !== slug) {
    const url = request.nextUrl.clone();
    url.pathname = `/tags/${slug}`;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = { matcher: "/tags/:tag" };
