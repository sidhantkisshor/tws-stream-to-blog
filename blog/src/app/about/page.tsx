import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | TWSGurukulX",
  description: "About TWSGurukulX — live stream trading analysis from Trading With Sidhant Team",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-prose px-4 py-12">
      <h1 className="font-instrument text-3xl text-deep-slate sm:text-4xl">
        About TWSGurukulX
      </h1>

      <div className="mt-6 space-y-4 leading-relaxed text-deep-slate/80">
        <p>
          Trading With Sidhant Team breaks down Nifty, BankNifty, and options
          setups live — every trading day. This blog captures those sessions so
          you can revisit the analysis, study the setups, and learn at your own
          pace.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="font-instrument text-2xl text-deep-slate">
          What You&apos;ll Find Here
        </h2>
        <ul className="mt-4 space-y-2 text-deep-slate/80">
          <li>Live stream recaps with key levels and setups</li>
          <li>Chart analysis with annotated screenshots</li>
          <li>Market context and trading insights</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-instrument text-2xl text-deep-slate">Contact</h2>
        <div className="mt-4 space-y-1 text-deep-slate/80">
          <p>Trading With Sidhant LLP</p>
          <p>
            <a href="tel:+918062963333" className="text-wealth-teal">
              +91-8062963333
            </a>
          </p>
          <p>
            <a
              href="https://twsgurukul.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-wealth-teal"
            >
              twsgurukul.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
