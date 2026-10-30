"use client";

import Image from "next/image";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Term } from "./Term";

/** Convert raw HTML <img> tags to markdown ![alt](url) so they go through the component override. */
function preprocessMarkdown(md: string): string {
  return md
    // Numeric ranges become "to" (11 PM to 8 AM). Written as unicode escapes.
    .replace(/(\d(?:\s?[AaPp][Mm])?)\s*[\u2013\u2014]\s*(\d)/g, "$1 to $2")
    // Replace em and en dashes with a comma, but not inside markdown links. The
    // class in this regex is intentional and load bearing: it is what strips
    // dashes out of generated copy. Do not remove it in a dash sweep.
    .replace(/(?<!\[[^\]]*)\s*[\u2013\u2014]\s*(?![^\[]*\])/g, ", ")
    .replace(
      /<img\s+[^>]*?src=["']([^"']+)["'][^>]*?(?:alt=["']([^"']*)["'])?[^>]*?\/?>/gi,
      (_m, src: string, alt?: string) => `![${alt ?? ""}](${src})`
    )
    .replace(
      /<img\s+[^>]*?alt=["']([^"']*)["'][^>]*?src=["']([^"']+)["'][^>]*?\/?>/gi,
      (_m, alt: string, src: string) => `![${alt}](${src})`
    )
    // Glossary term sentinel: [term:VWAP] -> [VWAP](#term:vwap)
    .replace(/\[term:([A-Za-z0-9_-]+)\]/g, (_m, word: string) => {
      return `[${word}](#term:${word.toLowerCase()})`;
    });
}

const TERM_HREF = /^#term:(.+)$/;

const OPTIMIZED_HOSTS = [".r2.dev", "storage.googleapis.com", "placehold.co"];

function ImgComponent({ src, alt }: { src?: string; alt?: string }) {
  const url = typeof src === "string" ? src : "";
  const isOptimizable =
    url.startsWith("/") || OPTIMIZED_HOSTS.some((h) => url.includes(h));

  return (
    <span className="my-8 block">
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
        <span className="label block pt-2 text-mute">
          {alt}
        </span>
      )}
    </span>
  );
}

const components: Components = {
  a: ({ href, children }) => {
    const m = typeof href === "string" ? href.match(TERM_HREF) : null;
    if (m) {
      const id = m[1];
      const label = typeof children === "string" ? children : undefined;
      return <Term id={id} label={label} />;
    }
    return (
      <a
        href={href}
        className="link-rule text-ink"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  },
  code: ({ children, className }) => {
    // Block code (has language- class from fenced ```lang block) vs inline code.
    const isBlock = typeof className === "string" && className.startsWith("language-");
    if (isBlock) {
      return <code className={className}>{children}</code>;
    }
    return (
      <code className="bg-rule px-1.5 py-0.5 font-mono text-[0.92em] text-ink">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto border-l-2 border-ink p-4 font-mono text-sm leading-relaxed text-ink">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-8 overflow-x-auto border-t-2 border-ink">
      <table className="w-full border-collapse text-[0.9375rem]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-rule py-3 pr-5 text-left font-bold text-ink">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-rule py-3 pr-5 text-body">
      {children}
    </td>
  ),
  img: ImgComponent as Components["img"],
  strong: ({ children }) => (
    <strong className="font-bold text-ink">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="my-5 ml-5 list-disc space-y-2 marker:text-mute">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-5 ml-5 list-decimal space-y-2 marker:text-mute">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  p: ({ children, node }) => {
    // If the paragraph contains only an image, unwrap it to avoid
    // a block-level <span> inside <p> (causes hydration mismatch).
    const kids = node?.children;
    if (kids?.length === 1 && kids[0].type === "element" && (kids[0] as { tagName?: string }).tagName === "img") {
      return <>{children}</>;
    }
    return <p className="my-5 first:mt-0 last:mb-0">{children}</p>;
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
        <blockquote className="my-8 border-l-2 border-hot pl-5 font-medium text-ink [&>p]:my-1">
          {children}
        </blockquote>
      );
    }

    return (
      <blockquote className="my-8 border-l-2 border-rule pl-5 text-body">
        {children}
      </blockquote>
    );
  },
  h3: ({ children }) => (
    <h3 className="mb-2 mt-8 text-[1.75rem] leading-tight">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-6 font-bold text-ink">{children}</h4>
  ),
};

export function MarkdownBody({ children, tone = "body" }: { children: string; tone?: "body" | "lead" }) {
  return (
    <div className={tone === "lead" ? "text-xl leading-[1.6] text-ink" : "text-[1.125rem] leading-[1.72] text-body"}>
      <Markdown remarkPlugins={[remarkGfm]} components={components}>{preprocessMarkdown(children)}</Markdown>
    </div>
  );
}
