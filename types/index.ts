export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  capCategory: "Large cap" | "Mid cap" | "Stablecoin";
  volatility: "Low" | "Medium" | "High";
  sparkline: number[];
}

export type MarketFilter = "trending" | "largest" | "gainers" | "losers";

export interface MarketResult {
  assets: MarketAsset[];
  live: boolean;
}

export interface GlossaryTerm {
  term: string;
  category: "Basics" | "Wallets" | "Markets" | "DeFi" | "Infrastructure";
  short: string;
  detail: string;
  example: string;
  related: string[];
}

export interface RoadmapStep {
  id: string;
  title: string;
  summary: string;
  checklist: string[];
  mistakes: string[];
}

export interface StrategyScore {
  complexity: number;
  timeCommitment: number;
  volatility: number;
  technicalRisk: number;
  custodyBurden: number;
  potentialLoss: number;
  beginnerFit: number;
}

export interface Strategy {
  id: string;
  name: string;
  risk: "Medium to high" | "High" | "Very high";
  tagline: string;
  points: { label: string; text: string }[];
  scores: StrategyScore;
}

export interface Holding {
  assetId: string;
  units: number;
  costBasis: number;
}

export interface SimTransaction {
  id: string;
  time: number;
  side: "buy" | "sell";
  assetId: string;
  symbol: string;
  units: number;
  price: number;
  total: number;
}

export interface SimState {
  cash: number;
  holdings: Holding[];
  history: SimTransaction[];
  valueSeries: { t: number; v: number }[];
}

export interface PhishingScenario {
  id: string;
  channel: string;
  from: string;
  body: string;
  isScam: boolean;
  flags: string[];
  explanation: string;
}
