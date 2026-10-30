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

  // Most stored demos are the session's chart. Only the order book lab has the
  // scripted buttons the old caption described.
  const isChart = /-chart-[^/]*\.html$/.test(src);

  return (
    <figure className="-ml-5 -mr-[var(--gutter)] my-10 md:mx-0 md:my-12">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        style={{ height }}
        className="block w-full bg-market"
      />
      <figcaption className="label mt-3 flex flex-wrap justify-between gap-x-6 gap-y-1 px-5 text-mute md:px-0">
        {isChart ? (
          <span>The session&apos;s chart. Drag to move it, pinch to zoom.</span>
        ) : (
          <span>
            Tap <span className="text-ink">Trend bar</span>, <span className="text-ink">Absorption</span> or{" "}
            <span className="text-ink">Chop bar</span> to run a demo, then watch the order book and delta react.
          </span>
        )}
        <a href={src} target="_blank" rel="noopener noreferrer" className="link-rule whitespace-nowrap text-ink">
          Open in a new tab
        </a>
      </figcaption>
    </figure>
  );
}
