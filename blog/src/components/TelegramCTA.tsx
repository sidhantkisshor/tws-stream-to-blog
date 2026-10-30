export function TelegramCTA() {
  return (
    <div>
      <p className="font-instrument text-[2rem] leading-[1.1] text-ink">Join our Telegram community.</p>
      <p className="mt-3 text-[1.0625rem] text-body">Get post alerts, trading discussions, and market updates.</p>
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <a href="https://t.me/tradingwsidhant" target="_blank" rel="noopener noreferrer" className="btn">
          Join Telegram
        </a>
        <a
          href="https://wa.me/918062963333"
          target="_blank"
          rel="noopener noreferrer"
          className="link-rule text-[0.9375rem] text-body"
        >
          Have a query? WhatsApp us
        </a>
      </div>
    </div>
  );
}
