"use client";

interface InteractiveDemoProps {
  src: string;
  title: string;
}

export function InteractiveDemo({ src, title }: InteractiveDemoProps) {
  return (
    <figure className="my-10 -mx-2 sm:-mx-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-wealth-teal">
            ◆ Interactive Lab
          </span>
          <h3 className="mt-1 font-instrument text-2xl text-deep-slate">
            Drive the order book yourself
          </h3>
        </div>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden whitespace-nowrap rounded-full border border-wealth-teal/25 bg-wealth-teal/5 px-3.5 py-1.5 text-xs font-medium text-wealth-teal no-underline transition-all hover:border-wealth-teal/45 hover:bg-wealth-teal/10 sm:inline-flex"
        >
          Open in new tab ↗
        </a>
      </div>

      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-2xl bg-[linear-gradient(135deg,rgba(10,141,122,0.55),rgba(212,137,74,0.45))] opacity-70 blur-[1px]"
        />
        <div className="relative overflow-hidden rounded-2xl border border-deep-slate/10 bg-[#0B1221] shadow-[0_18px_60px_-15px_rgba(10,141,122,0.35),0_8px_24px_-10px_rgba(11,18,33,0.5)]">
          <iframe
            src={src}
            title={title}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            className="block h-[940px] w-full bg-[#0B1221] sm:h-[980px]"
          />
        </div>
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-deep-slate/45">
        <span>
          Click <span className="font-medium text-deep-slate/70">Trend bar</span>,{" "}
          <span className="font-medium text-deep-slate/70">Absorption</span>, or{" "}
          <span className="font-medium text-deep-slate/70">Chop bar</span> to run a scripted demo. Then watch
          the order book deplete and delta react.
        </span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-wealth-teal underline decoration-wealth-teal/30 underline-offset-2 hover:decoration-wealth-teal sm:hidden"
        >
          Open in new tab ↗
        </a>
      </figcaption>
    </figure>
  );
}
