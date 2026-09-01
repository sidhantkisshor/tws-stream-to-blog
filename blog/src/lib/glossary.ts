export interface TermDef {
  id: string;
  label: string;
  short: string;
  long?: string;
}

const RAW: TermDef[] = [
  {
    id: "vwap",
    label: "VWAP",
    short: "Volume-Weighted Average Price: the average price weighted by traded volume across the session.",
    long: "Used as a benchmark for execution quality; many institutions transact relative to VWAP.",
  },
  {
    id: "orderflow",
    label: "Orderflow",
    short: "The sequence of buy and sell orders hitting the market, a real-time read of who is in control.",
  },
  {
    id: "absorption",
    label: "Absorption",
    short: "When aggressive market orders are met by hidden passive size that prevents price from moving.",
    long: "Absorption is a sign that the side being absorbed is exhausted. Opposing momentum often follows.",
  },
  {
    id: "footprint",
    label: "Footprint",
    short: "A chart that shows executed bid-vs-ask volume at each price level inside a bar.",
  },
  {
    id: "delta",
    label: "Delta",
    short: "Buy volume minus sell volume: positive means aggressive buyers, negative means aggressive sellers.",
  },
  {
    id: "cvd",
    label: "Cumulative Delta (CVD)",
    short: "A running total of delta over time. Divergences from price often signal exhaustion.",
  },
  {
    id: "liquidity",
    label: "Liquidity",
    short: "Resting orders waiting to be filled: the visible (and hidden) supply on the book.",
  },
  {
    id: "imbalance",
    label: "Imbalance",
    short: "A lopsided buy/sell ratio at a price, often used to flag stacked aggression.",
  },
  {
    id: "spread",
    label: "Spread",
    short: "The price gap between the best bid and the best ask.",
  },
  {
    id: "bid-ask",
    label: "Bid/Ask",
    short: "Bid is the best price buyers are offering; ask is the best price sellers are asking.",
  },
  {
    id: "poc",
    label: "POC",
    short: "Point of Control: the price level where the most volume traded inside a profile.",
  },
  {
    id: "valuearea",
    label: "Value Area",
    short: "The price range containing roughly 70% of a session's traded volume.",
  },
];

export const TERMS: Record<string, TermDef> = Object.fromEntries(
  RAW.map((t) => [t.id, t]),
);

export function getTerm(id: string): TermDef | null {
  return TERMS[id.toLowerCase()] ?? null;
}
