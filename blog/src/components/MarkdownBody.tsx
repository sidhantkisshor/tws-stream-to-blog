"use client";

import Markdown from "react-markdown";
import type { Components } from "react-markdown";

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
  p: ({ children }) => <p className="my-3 first:mt-0 last:mb-0">{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-2 border-burnt-amber/40 pl-4 italic text-deep-slate/60">
      {children}
    </blockquote>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 text-lg font-bold text-deep-slate">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-4 mb-2 font-bold text-deep-slate">{children}</h4>
  ),
};

export function MarkdownBody({ children }: { children: string }) {
  return (
    <div className="leading-[1.75] text-deep-slate/75">
      <Markdown components={components}>{children}</Markdown>
    </div>
  );
}
