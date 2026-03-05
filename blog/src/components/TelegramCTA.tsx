export function TelegramCTA() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-deep-slate/8 bg-white px-6 py-7 shadow-[0_1px_12px_rgba(44,53,57,0.04)]">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-burnt-amber/3" />
      <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-wealth-teal/3" />

      <div className="relative">
        <p className="text-lg font-bold text-deep-slate">
          Join our Telegram community.
        </p>
        <p className="mt-1 text-sm text-deep-slate/50">
          Get post alerts, trading discussions, and market updates.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href="https://t.me/tradingwsidhant"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-wealth-teal px-6 py-2.5 text-sm font-bold text-white no-underline shadow-[0_2px_8px_rgba(10,141,122,0.25)] transition-all hover:bg-wealth-teal/90 hover:text-white hover:no-underline hover:shadow-[0_4px_12px_rgba(10,141,122,0.3)]"
          >
            Join Telegram
          </a>
          <a
            href="https://wa.me/918062963333"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-deep-slate/45 no-underline transition-colors hover:text-deep-slate/70"
          >
            Have a query? WhatsApp us
          </a>
        </div>
      </div>
    </div>
  );
}
