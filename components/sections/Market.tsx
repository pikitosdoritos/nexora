"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCcw } from "lucide-react";
import type { MarketAsset, MarketFilter } from "@/types";
import { fetchMarket } from "@/services/market";
import { Chip, DemoTag, Eyebrow, RiskBadge, SectionShell, SectionTitle } from "@/components/ui/primitives";
import { Reveal } from "@/components/animations/Reveal";
import { cn, formatPct, formatUsd } from "@/lib/utils";
import { tokens } from "@/lib/tokens";

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const path = useMemo(() => {
    if (data.length < 2) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    return data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 28 - ((v - min) / span) * 24 - 2;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data]);

  return (
    <svg viewBox="0 0 100 28" className="h-7 w-24" aria-hidden preserveAspectRatio="none">
      <motion.path
        d={path}
        fill="none"
        stroke={up ? tokens.colors.rise : tokens.colors.fall}
        strokeWidth="1.6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

function TickerRow({ assets }: { assets: MarketAsset[] }) {
  const doubled = [...assets, ...assets];
  return (
    <div className="relative mb-12 overflow-hidden border-y border-line/40 py-3" aria-hidden>
      <div className="marquee-track flex w-max gap-10">
        {doubled.map((a, i) => (
          <span key={`${a.id}-${i}`} className="flex items-center gap-3 font-mono text-sm">
            <span className="text-ink">{a.symbol}</span>
            <span className="text-mute">{formatUsd(a.price)}</span>
            <span className={a.change24h >= 0 ? "text-rise" : "text-fall"}>{formatPct(a.change24h)}</span>
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-bg to-transparent" />
    </div>
  );
}

const FILTERS: { id: MarketFilter; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "largest", label: "Largest" },
  { id: "gainers", label: "Gainers" },
  { id: "losers", label: "Losers" },
];

export function Market() {
  const [assets, setAssets] = useState<MarketAsset[] | null>(null);
  const [live, setLive] = useState(false);
  const [filter, setFilter] = useState<MarketFilter>("trending");
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    const result = await fetchMarket();
    setAssets(result.assets);
    setLive(result.live);
    setRefreshing(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const sorted = useMemo(() => {
    if (!assets) return [];
    const copy = [...assets];
    switch (filter) {
      case "largest":
        return copy.sort((a, b) => b.marketCap - a.marketCap);
      case "gainers":
        return copy.sort((a, b) => b.change24h - a.change24h);
      case "losers":
        return copy.sort((a, b) => a.change24h - b.change24h);
      default:
        return copy.sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));
    }
  }, [assets, filter]);

  return (
    <SectionShell id="market">
      <Reveal>
        <Eyebrow>02 · Market overview</Eyebrow>
        <SectionTitle sub="A snapshot of major assets. Recent performance tells you where the market has been — it says nothing about where it is going.">
          The market, at a glance
        </SectionTitle>
      </Reveal>

      {assets ? <TickerRow assets={assets} /> : <div className="skeleton mb-12 h-12 w-full" />}

      <Reveal className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Sort assets">
          {FILTERS.map((f) => (
            <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {assets && <DemoTag live={live} />}
          <button
            onClick={() => void load()}
            aria-label="Refresh market data"
            className="rounded-full border border-line/60 p-2 text-mute transition-colors hover:border-cyan/50 hover:text-cyan"
          >
            <RefreshCcw className={cn("h-4 w-4", refreshing && "animate-spin")} aria-hidden />
          </button>
        </div>
      </Reveal>

      <div className="overflow-hidden rounded-2xl border border-line/50">
        {!assets
          ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton m-3 h-14" />)
          : sorted.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: tokens.ease }}
                className={cn(
                  "grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-4 transition-colors hover:bg-surface/50 sm:grid-cols-[2fr_1.2fr_1fr_1fr_auto] md:px-6",
                  i > 0 && "border-t border-line/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line/60 bg-surface font-mono text-[11px] text-cyan">
                    {a.symbol.slice(0, 3)}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-mute">{a.capCategory}</p>
                  </div>
                </div>
                <div className="text-right sm:text-left">
                  <p className="font-mono text-sm tabular-nums">{formatUsd(a.price)}</p>
                  <p className={cn("font-mono text-xs tabular-nums", a.change24h >= 0 ? "text-rise" : "text-fall")}>
                    {formatPct(a.change24h)} · 24h
                  </p>
                </div>
                <p className="hidden font-mono text-sm tabular-nums text-mute sm:block">{formatUsd(a.marketCap, true)}</p>
                <div className="hidden sm:block">
                  <RiskBadge level={a.volatility} prefix="Vol" />
                </div>
                <div className="hidden justify-self-end sm:block">
                  <Sparkline data={a.sparkline} up={a.change24h >= 0} />
                </div>
              </motion.div>
            ))}
      </div>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-mute/70">
        Prices shown for education only. Past performance does not predict future returns.
      </p>
    </SectionShell>
  );
}
