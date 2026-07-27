"use client";

import { useEffect, useState } from "react";

interface InteractiveDemoProps {
  src: string;
  title: string;
}

export function InteractiveDemo({ src, title }: InteractiveDemoProps) {
  const [height, setHeight] = useState(640);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data;
      if (
        data &&
        data.type === "tws-orderflow-height" &&
        typeof data.height === "number" &&
        Number.isFinite(data.height)
      ) {
        setHeight(Math.min(4000, Math.max(400, data.height)));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <figure className="my-8 -mx-1 sm:my-10 sm:-mx-6">
      <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-wealth-teal sm:text-[11px]">
            ◆ Interactive Lab
          </span>
          <h3 className="mt-1 font-instrument text-xl leading-tight text-deep-slate sm:text-2xl">
            Drive the order book yourself
          </h3>
        </div>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit whitespace-nowrap rounded-full border border-wealth-teal/25 bg-wealth-teal/5 px-3 py-1.5 text-xs font-medium text-wealth-teal no-underline transition-all hover:border-wealth-teal/45 hover:bg-wealth-teal/10 sm:px-3.5"
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
            style={{ height }}
            className="block w-full bg-[#0B1221]"
          />
        </div>
      </div>

      <figcaption className="mt-3 text-xs leading-relaxed text-deep-slate/45">
        Tap{" "}
        <span className="font-medium text-deep-slate/70">Trend bar</span>,{" "}
        <span className="font-medium text-deep-slate/70">Absorption</span>, or{" "}
        <span className="font-medium text-deep-slate/70">Chop bar</span> to run a scripted demo. Then watch
        the order book deplete and delta react.
      </figcaption>
    </figure>
  );
}
