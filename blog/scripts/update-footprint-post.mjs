// One-off: re-key, re-slug, re-hero, and inject demoUrl + YouTube link into the footprint post.
// Run from blog/: node scripts/update-footprint-post.mjs

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const OLD_VIDEO_ID = "footprint-deep-dive-2026-05-09";
const NEW_VIDEO_ID = "RGdCgiqVdsA";
const NEW_SLUG = "master-footprint-trading-the-order-flow-edge";
const NEW_HERO = "https://pub-51d4279cb27a40238df5b851ddc02ffa.r2.dev/hero/master-footprint-trading-1747834000.jpg";
const YT_URL = "https://www.youtube.com/watch?v=RGdCgiqVdsA";

const NEW_TITLE = "Master Footprint Trading: The Order Flow Edge Behind Every Candle";
const NEW_HOOK = "Candles only show you price. Footprints show you who is actually winning the auction, and who is walking into a trap.";
const NEW_SEO_DESC = "Master footprint trading: limit vs market orders, absorption, delta, value area, and how to spot buyer and seller traps on Bank Nifty, Nifty, and crypto with a step-by-step framework.";

const NEW_INTRO = `Your breakouts fail. Your breakdowns fail. The reversal that looked obvious in hindsight, you could not pull the trigger on. There is a reason for all of it, and it has nothing to do with your strategy being wrong.

You are trading on incomplete data.

The market only exists because of two things: buyers and sellers. Everything else, supply and demand, support and resistance, trend and chop, is downstream of that one auction. And inside that auction, only two kinds of orders exist: limit orders and market orders. If you cannot read the difference between them in real time, you are reading half the chart.

Footprint charts show you the other half. Which side was aggressive at every single price. Where the trap was set. Where the smart money absorbed your order and quietly walked away with your stop loss. This is the layer of data that turns guessing into reading.

> **Watch the full breakdown:** This guide is the written companion to my YouTube video [Master Footprint Trading on YouTube](${YT_URL}). The simulator a few sections down lets you click through the same absorption and trend sequences I use on the stream.`;

const NEW_CONCLUSION = `Candles tell you what price did. Footprints tell you who did it, who got trapped doing it, and whether the move has the fuel to continue.

Master three things and the rest of the order flow toolkit unlocks fast: the difference between limit and market orders, what absorption looks like in real time, and how to read aggressive buyers against aggressive sellers at the same price level. Layer in delta, value area, and the DAT framework, and you will start seeing setups that pure candlestick traders simply cannot see.

Spin up the interactive console above. Run the trend bar demo, then run the absorption demo, and watch how delta behaves in each. Twenty minutes of clicking through it will teach you more than any other order flow article on the internet, including this one.

If you want the full video walkthrough with chart examples on Bank Nifty, Nifty, and crypto, [watch the full session here](${YT_URL}). And the Friday live stream is where this exact framework gets applied trade by trade. See you there.`;

const NEW_SECTIONS = [
  {
    heading: "Why a Candle Is Not Enough",
    body: `A candlestick tells you exactly one thing: how much price moved in a given period. Open, high, low, close. That is it.

A 5-minute green candle says price opened lower and closed higher inside that 5 minutes. A 1-hour red candle says the same thing for 60 minutes. The body, the wick, the range, all of it is just price geometry.

Add volume below the candle and you get one extra clue: was the move backed by participation, or was it thin? High volume means strength, low volume means weakness. Most retail traders stop here, and that is exactly why they keep getting wrong-footed.

> **Key Takeaway:** A candle tells you what price did. It does not tell you who did it, or whether the side that moved it actually had the conviction to follow through. That is where most failed breakouts are born.

The missing data is order flow: who was hitting the bid, who was lifting the offer, who got trapped at the high, and who absorbed the move at the low. Footprint puts that data on the chart.`,
  },
  {
    heading: "Limit vs Market Orders: The Two Forces That Actually Move Price",
    body: `Every order you place on any platform, Indian stocks, crypto, forex, gold, falls into one of two buckets.

**Limit order:** A pre-decided price. You tell the exchange, I will buy at 98 or sell at 102, and you wait. Your price is guaranteed. Your fill is not. If price never gets there, your order never executes.

**Market order:** A pre-decided fill. You tell the exchange, fill me right now at whatever the best price is. Your fill is guaranteed. Your price is not. If you slam a big buy through a thin book, you eat slippage all the way up.

Notice the symmetry. Limit traders trade certainty of price for uncertainty of execution. Market traders trade certainty of execution for uncertainty of price. Two completely different kinds of participants.

Now here is the move that breaks most traders:

> **Pro Tip:** If everyone in the world placed only limit orders, the market would never move. Price moves only when someone hits the market with a market order and consumes the resting limit orders on the other side. Aggressive market orders are the only thing that changes the price.

Limit orders are the wall. Market orders are the wrecking ball. Footprint charts are how you watch the wrecking ball in real time.`,
  },
  {
    heading: "How a Market Buy Walks the Book",
    body: `Picture a clean order book at price 50,000.

- 50,002 ask: 15 lots resting (limit sells)
- 50,001 ask: 6 lots
- 50,000 last traded
- 49,999 bid: 13 lots (limit buys)
- 49,998 bid: 8 lots

Now a buyer hits the market with a 3-lot market buy. Where do those 3 lots come from? Not from another buyer. From the resting sellers. The 6 lots at 50,001 absorb the 3, leaving 3 left at that level. Last price is now 50,001. The market just ticked up by one.

Say an aggressive buyer now slams 8 lots through. The 3 remaining at 50,001 get cleared first, then 5 more come from the 15 lots resting at 50,002. Price prints 50,002. The aggressor walked the book up two levels by being willing to pay whatever the next ask was.

Flip it for sells. A 3-lot market sell takes from the bid side. If only 2 lots are sitting at 49,999 and the order is 3, it eats them, then walks down to 49,998 to fill the last lot. Price drops two ticks.

> **Key Takeaway:** Markets do not move because someone wants them to. Markets move because aggressive market orders consume the limit orders sitting on the other side. The bigger and more sustained the aggression, the bigger the move.

This is the core micro-mechanic. Once it clicks, every chart you have ever stared at suddenly has a soundtrack.`,
  },
  {
    heading: "Try It Yourself: Live Order Book and Footprint Simulator",
    body: `Below is a live order book, footprint, and delta meter. Click the buttons to fire market orders into the book, run the trend bar, the absorption sequence, and the chop bar. Watch the order book deplete, the footprint cells light up, and delta react in real time.

Run them in this order for the cleanest learning curve:

1. **Trend bar:** four escalating market buys. Notice how delta crushes positive and price ratchets up cleanly. This is what real strength looks like.
2. **Absorption:** 60 lots of aggressive buying into a 50-lot wall that keeps refilling. Notice how delta goes positive but price never moves. This is the highest-EV reversal pattern in the book.
3. **Chop bar:** alternating buys and sells of similar size. Notice how volume builds while delta hovers near zero. No conviction, no edge, stay flat.

> **Pro Tip:** Most traders look at the price label only. The whole point of footprint is to ignore the price label and read the cells inside the candle. Use the simulator to retrain that habit, then take it to your real chart.`,
    chartRef: "/demos/orderflow.html",
  },
  {
    heading: "Absorption: When Aggressive Buyers Lose",
    body: `You just saw absorption in the simulator. Here is why it matters in a live tape.

A serious player parks 50 lots resting at the best ask, 50,001. A retail buyer comes in aggressive: 15 lots market buy. They eat 15. Price ticks up briefly. Almost instantly, the seller refills back to 50 at 50,001. Price retraces. Buyer 2 comes in for another 15. Eaten and refilled. Buyer 3 piles on with 15 more. Same outcome.

Four aggressive buyers, 60 lots of pure market buying, and the price is still parked at the same level. That is absorption. The aggressive side took the swing, and the passive side simply caught it without flinching.

The story this tells you is brutal: somebody much bigger than retail is sitting on offers, willing to absorb every retail breakout attempt. When the aggressive buyers eventually run out of ammo, who is left? Trapped longs holding at the highs.

> **Market Insight:** Absorption is the single most important order flow signature you can learn. If you see heavy aggressive buying with no follow-through in price, that is not strength. That is a smart seller letting retail tire itself out before reversing the move.

The pattern repeats on every timeframe, on every market, every single day.`,
  },
  {
    heading: "Reading the Footprint: Aggressive Buyers vs Aggressive Sellers, Price by Price",
    body: `A footprint chart keeps the candle but adds a small grid inside it. Every price level the candle traded through gets two numbers:

- **Left number:** total volume of aggressive sellers at that price (market sells that hit the bid)
- **Right number:** total volume of aggressive buyers at that price (market buys that lifted the ask)

Some platforms colour them. TradingView calls this volume footprint. MMT (a free alternative) shows it the same way. Numbers and shading.

The golden rule: never compare left to left or right to right across the candle. Always compare left to right at the same price level. That is where the story is.

Example. At one price inside the candle you see 25 on the left and 30 on the right. That is 25 aggressive sellers and 30 aggressive buyers fighting at the same level. Buyers had a slight edge. Now look at where price went after that level. If price pushed up despite the heavy aggressive sellers, you just witnessed a seller trap forming.

> **Pro Tip:** Aggressive sellers showing up while price keeps grinding higher is one of the cleanest seller-trap signatures you can find. They committed market orders, ate the available liquidity, and still could not push price down. That trapped flow has to cover later, and that cover fuels the next leg up.

Flip the logic for buyer traps at tops. Aggressive buyers piling in while price refuses to break higher is your warning that the breakout is fake before it even completes.`,
  },
  {
    heading: "Delta: The Conviction Score for Every Candle",
    body: `Below each footprint candle you will see a number called delta. It is the simplest, most underrated metric in order flow.

**Delta = total aggressive buy volume - total aggressive sell volume** for that candle.

A delta of +2,000 means buyers were the aggressors by 2,000 lots over the candle. A delta of -8,800 means sellers crushed buyers by that margin. Cumulative delta (CVD) is the running sum across candles, the conviction score across the whole session.

The trick is to read delta against price, not on its own.

- Strong positive delta and price moving up: trend is real, buyers are paying up and getting rewarded
- Strong positive delta but price barely moves: classic absorption, aggressive buyers are getting eaten by passive sellers, reversal risk
- Strong negative delta but price refuses to break down: same idea, sellers trapped, look for a squeeze higher
- Delta near zero on heavy two-sided volume: chop bar, no conviction either way, stay out

> **Important:** A candle that closes green with deeply negative delta is one of the highest-quality reversal signals in order flow. Price moved up but the aggressors who pushed it could not finish the job, and the passive seller absorbed everything. Mark that candle and watch the next one closely.`,
  },
  {
    heading: "Value Area High and Value Area Low: Where the Real Battle Lives",
    body: `Inside every footprint candle, you will see two dotted lines, one near the top of the body and one near the bottom. These are the value area high (VAH) and value area low (VAL).

The value area is where roughly 70 percent of the candle's volume actually transacted. Everything outside that band was tested but not accepted. The closer those lines cluster, the more decisive the candle. The wider they spread, the more two-sided the action.

Why this matters: a value area that keeps shifting in one direction across consecutive candles is a clean trend signature. A value area that keeps overlapping the previous one is balance, the precursor to either chop or a powerful breakout.

> **Key Takeaway:** Stop drawing support and resistance only on highs and lows. The most reliable retests happen at the prior value area boundaries, because that is where real liquidity changed hands. The wicks above and below are noise. The value area is the actual battlefield.

Combine this with delta. A red candle with a value area shifted lower and strongly negative delta is a clean continuation signal. A green candle that closes above its own VAH but with weak or negative delta is a setup waiting to fail.`,
  },
  {
    heading: "Spotting a Top: Buyer Traps in Action",
    body: `Tops do not get made by sellers magically appearing. They get made when the last batch of aggressive buyers gets trapped paying the highest price, and then has nobody left to sell to.

The footprint signature is unmistakable once you know what to look for:

1. **Aggressive buyer volume clusters near the top of the candle.** Right side numbers stay loud all the way up.
2. **Aggressive seller volume also shows up at the top.** Left side numbers spike at or just below the high.
3. **Price closes below the highest right-side number.** The aggressive buyers paid up, and the close did not honour their entry. Trap printed.
4. **Delta of the candle is negative, or barely positive, despite the body looking green.** Conviction is missing.

Flip every signal for bottoms. Aggressive sellers piling in at the lows, aggressive buyers stepping up under them, price refusing to break, delta negative but the candle reverses up. That is a seller trap and it is the start of a continuation higher in a downtrend reversal or a fresh leg in an existing uptrend.

> **Pro Tip:** Always anchor footprint reads to a pre-marked supply or demand zone. Order flow on its own will fool you. Order flow inside a quality area, with the DAT framework (direction, area, trigger), is where the real edge lives.`,
  },
  {
    heading: "Setting Up Footprint on TradingView and Free Alternatives",
    body: `**TradingView (paid):** Add the chart type called Volume Footprint. Open settings and use these defaults:

- Row size: Auto (lets the chart size cells based on the asset)
- POC: enabled (point of control marker is useful)
- Show summary info: enabled
- Stacked levels: disabled (it adds clutter you do not need)
- Imbalance: 300 percent (a clean threshold)
- Unfinished auction: disabled (false positives on Indian markets)

That is it. Drop it on Bank Nifty, Nifty, gold, BTC, ETH, NASDAQ futures, anything with serious volume.

**Free alternative: MMT (Multi Market Trader).** Same kind of footprint, same numeric layout, no paywall. If this post hits 10,000 likes on the YouTube version, a full MMT setup tutorial is going up next.

**What to do once it is on the chart:**

1. Mark your supply and demand zones first using standard price action.
2. Wait for price to enter a zone.
3. Read the footprint candle inside the zone, not outside it.
4. Confirm with delta direction and value area shift.
5. Take the trade only when buyer or seller trap prints with a tight invalidation.

> **Remember:** Footprint is a confirmation tool. It does not replace your supply demand framework. It tells you which side is winning the auction inside zones you have already marked. That distinction separates traders who burn out from traders who scale up.`,
  },
];

const NEW_TAGS = ["Footprint", "Order Flow", "Price Action", "Bank Nifty", "Nifty", "Crypto Trading"];
const NEW_KEYWORDS = [
  "footprint chart",
  "order flow trading",
  "limit order vs market order",
  "absorption trading",
  "delta trading",
  "value area high",
  "value area low",
  "buyer trap",
  "seller trap",
  "TradingView footprint",
  "MMT footprint",
  "Bank Nifty footprint",
  "Nifty order flow",
  "DAT framework",
  "master footprint trading",
];

const NEW_FAQ = [
  {
    question: "What is the difference between a footprint chart and a candlestick chart?",
    answer:
      "A candlestick chart shows you only price action: open, high, low, close. A footprint chart keeps the candle but adds the volume of aggressive buyers and aggressive sellers at every single price level inside it, plus delta and value area. You see who actually drove the move, not just where it ended.",
  },
  {
    question: "What is absorption in order flow trading?",
    answer:
      "Absorption is when aggressive market orders on one side get eaten by large resting limit orders on the other side without moving price. For example, 60 lots of aggressive buying that hit a 50-lot wall and price stays flat. It signals that the passive side is much stronger than the aggressive side, and a reversal usually follows.",
  },
  {
    question: "How do I read delta on a footprint chart?",
    answer:
      "Delta is total aggressive buy volume minus total aggressive sell volume for the candle. Positive delta with price moving up confirms a real trend. Positive delta with no price progress signals absorption and a likely reversal. Negative delta with a green candle close is one of the strongest reversal signatures.",
  },
  {
    question: "Can I use footprint charts on Indian markets like Bank Nifty and Nifty?",
    answer:
      "Yes. Footprint works on any liquid market that has tick-by-tick order flow data, including Bank Nifty, Nifty, gold, silver, crypto pairs, and US indices like NASDAQ. TradingView volume footprint and MMT both support Indian markets.",
  },
  {
    question: "Do I need a paid TradingView plan for footprint charts?",
    answer:
      "TradingView volume footprint is a paid feature on higher tiers. The free alternative is MMT (Multi Market Trader), which offers a similar volume footprint view at no cost. The mechanics, delta, value area, and aggressive volume per price are identical across both platforms.",
  },
  {
    question: "What is a buyer trap and how does footprint identify it?",
    answer:
      "A buyer trap is when aggressive buyers commit at the top of a move, but the candle closes below the level where they entered, with delta turning negative. Footprint shows it as heavy right-side numbers near the high, then a close that betrays them. Their losing positions become fuel for the next leg down.",
  },
];

async function main() {
  const existing = await prisma.post.findUnique({ where: { videoId: OLD_VIDEO_ID } });
  if (!existing) {
    console.error("Old post not found by videoId:", OLD_VIDEO_ID);
    process.exit(1);
  }
  console.log("Found old post:", existing.id, existing.slug);

  const updated = await prisma.post.update({
    where: { id: existing.id },
    data: {
      videoId: NEW_VIDEO_ID,
      slug: NEW_SLUG,
      title: NEW_TITLE,
      hook: NEW_HOOK,
      seoDesc: NEW_SEO_DESC,
      heroImage: NEW_HERO,
      intro: NEW_INTRO,
      sections: NEW_SECTIONS,
      conclusion: NEW_CONCLUSION,
      tags: NEW_TAGS,
      keywords: NEW_KEYWORDS,
      faq: NEW_FAQ,
    },
  });
  console.log("Updated:", updated.id, updated.slug, updated.heroImage);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
