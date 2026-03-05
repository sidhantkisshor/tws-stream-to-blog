import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | TWSGurukulX",
  description: "About TWSGurukulX — live stream trading analysis from Trading With Sidhant Team",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-prose px-4 py-12">
      <div className="animate-reveal">
        <h1 className="text-3xl font-bold tracking-tight text-deep-slate sm:text-4xl">
          About <span className="font-instrument text-burnt-amber">TWSGurukulX</span>
        </h1>

        <div className="mt-6 space-y-4 leading-[1.75] text-deep-slate/70">
          <p>
            Trading With Sidhant Team breaks down Nifty, BankNifty, and options
            setups live — every trading day. This blog captures those sessions so
            you can revisit the analysis, study the setups, and learn at your own
            pace.
          </p>
        </div>
      </div>

      <div className="accent-line mt-10 animate-reveal delay-1" />

      <section className="mt-10 animate-reveal delay-2">
        <h2 className="text-2xl font-bold text-deep-slate">
          What You&apos;ll Find Here
        </h2>
        <ul className="mt-4 space-y-3 text-deep-slate/70">
          <li className="flex items-start gap-3">
            <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
            <span>Live stream recaps with key levels and setups</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
            <span>Chart analysis with annotated screenshots</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-wealth-teal/60" />
            <span>Market context and trading insights</span>
          </li>
        </ul>
      </section>

      <section className="mt-10 animate-reveal delay-3">
        <h2 className="text-2xl font-bold text-deep-slate">Contact</h2>
        <div className="mt-4 space-y-1.5 text-deep-slate/70">
          <p className="font-medium text-deep-slate/50">Trading With Sidhant LLP</p>
          <p>
            <a href="tel:+918062963333" className="text-wealth-teal no-underline hover:underline">
              +91-8062963333
            </a>
          </p>
          <p>
            <a
              href="https://twsgurukul.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-wealth-teal no-underline hover:underline"
            >
              twsgurukul.com
            </a>
          </p>
          <p>
            <a
              href="https://tradingwithsidhant.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-wealth-teal no-underline hover:underline"
            >
              tradingwithsidhant.com
            </a>
          </p>
        </div>
      </section>

      <section className="mt-10 animate-reveal delay-4">
        <h2 className="text-2xl font-bold text-deep-slate">Follow Us</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="https://youtube.com/@tradingwithsidhant"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-deep-slate/5 px-4 py-1.5 text-sm font-medium text-deep-slate/60 no-underline transition-colors hover:bg-deep-slate/10 hover:text-deep-slate/80"
          >
            YouTube
          </a>
          <a
            href="https://instagram.com/tradingwithsidhant"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-deep-slate/5 px-4 py-1.5 text-sm font-medium text-deep-slate/60 no-underline transition-colors hover:bg-deep-slate/10 hover:text-deep-slate/80"
          >
            Instagram
          </a>
          <a
            href="https://x.com/tradingwsidhant"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-deep-slate/5 px-4 py-1.5 text-sm font-medium text-deep-slate/60 no-underline transition-colors hover:bg-deep-slate/10 hover:text-deep-slate/80"
          >
            X (Twitter)
          </a>
          <a
            href="https://t.me/tradingwsidhant"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-deep-slate/5 px-4 py-1.5 text-sm font-medium text-deep-slate/60 no-underline transition-colors hover:bg-deep-slate/10 hover:text-deep-slate/80"
          >
            Telegram
          </a>
        </div>
      </section>
    </main>
  );
}
