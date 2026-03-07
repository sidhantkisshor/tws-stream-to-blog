"use client";

import Image from "next/image";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";

/** Convert raw HTML <img> tags to markdown ![alt](url) so they go through the component override. */
function preprocessMarkdown(md: string): string {
  return md
    // Replace em dashes (—) with comma or nothing, but not inside markdown links
    .replace(/(?<!\[[^\]]*)\s*—\s*(?![^\[]*\])/g, ", ")
    .replace(
      /<img\s+[^>]*?src=["']([^"']+)["'][^>]*?(?:alt=["']([^"']*)["'])?[^>]*?\/?>/gi,
      (_m, src: string, alt?: string) => `![${alt ?? ""}](${src})`
    )
    .replace(
      /<img\s+[^>]*?alt=["']([^"']*)["'][^>]*?src=["']([^"']+)["'][^>]*?\/?>/gi,
      (_m, alt: string, src: string) => `![${alt}](${src})`
    );
}

const OPTIMIZED_HOSTS = [".r2.dev", "storage.googleapis.com", "placehold.co"];

function ImgComponent({ src, alt }: { src?: string; alt?: string }) {
  const url = typeof src === "string" ? src : "";
  const isOptimizable =
    url.startsWith("/") || OPTIMIZED_HOSTS.some((h) => url.includes(h));

  return (
    <span className="my-5 block overflow-hidden rounded-lg border border-deep-slate/8 bg-deep-slate/3">
      <Image
        src={url}
        alt={alt || ""}
        width={800}
        height={450}
        className="w-full"
        sizes="(max-width: 768px) 100vw, 65ch"
        unoptimized={!isOptimizable}
      />
      {alt && (
        <span className="block px-3 py-2 text-xs text-deep-slate/40">
          {alt}
        </span>
      )}
    </span>
  );
}

const components: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-wealth-teal underline decoration-wealth-teal/30 underline-offset-2 hover:decoration-wealth-teal"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  img: ImgComponent as Components["img"],
  strong: ({ children }) => (
    <strong className="font-bold text-deep-slate">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="my-3 ml-5 list-disc space-y-1.5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 ml-5 list-decimal space-y-1.5">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  p: ({ children, node }) => {
    // If the paragraph contains only an image, unwrap it to avoid
    // a block-level <span> inside <p> (causes hydration mismatch).
    const kids = node?.children;
    if (kids?.length === 1 && kids[0].type === "element" && (kids[0] as { tagName?: string }).tagName === "img") {
      return <>{children}</>;
    }
    return <p className="my-4 first:mt-0 last:mb-0">{children}</p>;
  },
  blockquote: ({ children, node }) => {
    const extractText = (n: unknown): string => {
      if (!n || typeof n !== "object") return "";
      const nd = n as Record<string, unknown>;
      if (nd.type === "text") return String(nd.value || "");
      if (Array.isArray(nd.children)) return nd.children.map(extractText).join("");
      return "";
    };
    const text = node ? extractText(node).toLowerCase() : "";
    const calloutKeywords = ["key takeaway", "pro tip", "market insight", "important", "note", "did you know", "remember", "warning"];
    const isCallout = calloutKeywords.some((kw) => text.includes(kw));

    if (isCallout) {
      return (
        <blockquote className="my-5 rounded-lg border-l-4 border-wealth-teal bg-wealth-teal/5 px-5 py-4 not-italic text-deep-slate/80 [&>p]:my-1 [&_strong]:text-wealth-teal">
          {children}
        </blockquote>
      );
    }

    return (
      <blockquote className="my-4 border-l-2 border-burnt-amber/40 pl-4 italic text-deep-slate/60">
        {children}
      </blockquote>
    );
  },
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 text-lg font-bold text-deep-slate">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-4 mb-2 font-bold text-deep-slate">{children}</h4>
  ),
};

export function MarkdownBody({ children }: { children: string }) {
  return (
    <div className="text-lg leading-[1.75] text-deep-slate/75">
      <Markdown components={components}>{preprocessMarkdown(children)}</Markdown>
    </div>
  );
}
