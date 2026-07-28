import type { MarketAsset } from "@/types";
import { seededWalk } from "@/lib/utils";

/** Polished fallback data, clearly labelled "Demo data" in the UI. */
export const demoAssets: MarketAsset[] = [
  {
    id: "bitcoin", symbol: "BTC", name: "Bitcoin",
    price: 67412.55, change24h: 2.14, marketCap: 1.33e12,
    capCategory: "Large cap", volatility: "High",
    sparkline: seededWalk(11, 32, 0.0008, 0.014),
  },
  {
    id: "ethereum", symbol: "ETH", name: "Ethereum",
    price: 3518.02, change24h: -1.32, marketCap: 4.2e11,
    capCategory: "Large cap", volatility: "High",
    sparkline: seededWalk(23, 32, -0.0005, 0.017),
  },
  {
    id: "solana", symbol: "SOL", name: "Solana",
    price: 172.4, change24h: 5.61, marketCap: 8.1e10,
    capCategory: "Mid cap", volatility: "High",
    sparkline: seededWalk(37, 32, 0.0018, 0.024),
  },
  {
    id: "usd-coin", symbol: "USDC", name: "USD Coin",
    price: 1.0, change24h: 0.01, marketCap: 3.4e10,
    capCategory: "Stablecoin", volatility: "Low",
    sparkline: seededWalk(41, 32, 0, 0.0006),
  },
  {
    id: "chainlink", symbol: "LINK", name: "Chainlink",
    price: 18.36, change24h: -3.05, marketCap: 1.1e10,
    capCategory: "Mid cap", volatility: "High",
    sparkline: seededWalk(53, 32, -0.001, 0.022),
  },
  {
    id: "cardano", symbol: "ADA", name: "Cardano",
    price: 0.62, change24h: 1.18, marketCap: 2.2e10,
    capCategory: "Mid cap", volatility: "High",
    sparkline: seededWalk(61, 32, 0.0006, 0.02),
  },
];
