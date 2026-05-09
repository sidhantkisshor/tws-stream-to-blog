"use client";

interface InteractiveDemoProps {
  src: string;
  title: string;
}

export function InteractiveDemo({ src, title }: InteractiveDemoProps) {
  return (
    <figure className="my-6">
      <div className="overflow-hidden rounded-xl border border-deep-slate/10 bg-deep-slate/3 shadow-[0_4px_20px_rgba(44,53,57,0.08)]">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
          className="block h-[680px] w-full bg-[#0A0A0C] sm:h-[720px]"
        />
      </div>
      <figcaption className="mt-2 flex items-center justify-between text-xs text-deep-slate/45">
        <span>{title}</span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-wealth-teal underline decoration-wealth-teal/30 underline-offset-2 hover:decoration-wealth-teal"
        >
          Open in new tab
        </a>
      </figcaption>
    </figure>
  );
}
