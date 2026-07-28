import type { MarketAsset, MarketResult } from "@/types";
import { demoAssets } from "@/data/market-demo";

const IDS = ["bitcoin", "ethereum", "solana", "usd-coin", "chainlink", "cardano"];
const API =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd" +
  `&ids=${IDS.join("%2C")}&sparkline=true&price_change_percentage=24h`;

interface GeckoRow {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap: number;
  sparkline_in_7d?: { price: number[] };
}

function capCategory(cap: number, id: string): MarketAsset["capCategory"] {
  if (id === "usd-coin") return "Stablecoin";
  return cap > 2e11 ? "Large cap" : "Mid cap";
}

function volatility(spark: number[]): MarketAsset["volatility"] {
  if (spark.length < 3) return "Medium";
  let sum = 0;
  for (let i = 1; i < spark.length; i++) sum += Math.abs(spark[i] / spark[i - 1] - 1);
  const avg = sum / (spark.length - 1);
  if (avg < 0.002) return "Low";
  if (avg < 0.008) return "Medium";
  return "High";
}

/**
 * Fetches live market data from the CoinGecko public API.
 * On any failure (offline, rate limit, CORS) it resolves with demo data and
 * `live: false` so the UI can show a "Demo data" label without breaking.
 */
export async function fetchMarket(): Promise<MarketResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(API, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = (await res.json()) as GeckoRow[];
    if (!Array.isArray(rows) || rows.length === 0) throw new Error("Empty payload");

    const assets: MarketAsset[] = rows.map((r) => {
      const spark = (r.sparkline_in_7d?.price ?? []).filter((n) => Number.isFinite(n));
      const sampled = spark.filter((_, i) => i % Math.max(1, Math.floor(spark.length / 32)) === 0);
      return {
        id: r.id,
        symbol: r.symbol.toUpperCase(),
        name: r.name,
        price: r.current_price,
        change24h: r.price_change_percentage_24h ?? 0,
        marketCap: r.market_cap,
        capCategory: capCategory(r.market_cap, r.id),
        volatility: r.id === "usd-coin" ? "Low" : volatility(sampled),
        sparkline: sampled.length > 4 ? sampled : [1, 1, 1, 1, 1],
      };
    });
    return { assets, live: true };
  } catch {
    return { assets: demoAssets, live: false };
  }
}
