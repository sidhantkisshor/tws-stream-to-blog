interface ProgramCTAProps {
  variant: "inline" | "banner";
}

export function ProgramCTA({ variant }: ProgramCTAProps) {
  if (variant === "inline") {
    return (
      <aside className="border-l-2 border-brushed-gold pl-4 py-2">
        <p className="text-sm text-deep-slate/60">
          Explore structured trading programs at{" "}
          <a
            href="https://twsgurukul.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brushed-gold no-underline hover:underline"
          >
            twsgurukul.com
          </a>
        </p>
      </aside>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-deep-slate/8 bg-white px-6 py-7 shadow-[0_1px_12px_rgba(44,53,57,0.04)]">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brushed-gold/3" />
      <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-brushed-gold/3" />

      <div className="relative">
        <p className="text-lg font-bold text-deep-slate">
          Level up your trading
        </p>
        <p className="mt-1 text-sm text-deep-slate/50">
          Explore structured programs at TWSGurukulX
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href="https://twsgurukul.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-brushed-gold px-6 py-2.5 text-sm font-bold text-white no-underline shadow-[0_2px_8px_rgba(184,149,106,0.25)] transition-all hover:bg-brushed-gold/90 hover:shadow-[0_4px_12px_rgba(184,149,106,0.3)]"
          >
            Explore Programs
          </a>
          <a
            href="https://twsgurukul.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-deep-slate/45 no-underline transition-colors hover:text-deep-slate/70"
          >
            Learn more
          </a>
        </div>
      </div>
    </div>
  );
}
