import { PROGRAMS_URL, SITE_NAME } from "@/lib/site";

interface ProgramCTAProps {
  variant: "inline" | "banner";
}

export function ProgramCTA({ variant }: ProgramCTAProps) {
  if (variant === "inline") {
    return (
      <aside className="border-y border-rule py-4 text-[1.0625rem] text-body">
        Explore structured trading programs at{" "}
        <a href={PROGRAMS_URL} target="_blank" rel="noopener noreferrer" className="link-rule font-medium text-ink">
          tradingwithsidhant.com/programs
        </a>
      </aside>
    );
  }

  return (
    <div>
      <p className="font-instrument text-[2rem] leading-[1.1] text-ink">Level up your trading</p>
      <p className="mt-3 text-[1.0625rem] text-body">Explore structured programs at {SITE_NAME}</p>
      <a href={PROGRAMS_URL} target="_blank" rel="noopener noreferrer" className="btn mt-5">
        Explore Programs
      </a>
    </div>
  );
}
