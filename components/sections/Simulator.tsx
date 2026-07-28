"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { RotateCcw, ShieldAlert, Zap } from "lucide-react";
import type { MarketAsset, SimState, SimTransaction } from "@/types";
import { demoAssets } from "@/data/market-demo";
import { fetchMarket } from "@/services/market";
import { Eyebrow, SectionShell, SectionTitle } from "@/components/ui/primitives";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Reveal } from "@/components/animations/Reveal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/components/ui/toast";
import { cn, formatPct, formatUsd, uid } from "@/lib/utils";
import { tokens } from "@/lib/tokens";

const START_CASH = 10_000;
const initialState: SimState = { cash: START_CASH, holdings: [], history: [], valueSeries: [] };

const SHOCKS = [
  { pct: 10, label: "−10%" },
  { pct: 25, label: "−25%" },
  { pct: 50, label: "−50%" },
];

export function Simulator() {
  const { value: sim, set: setSim, hydrated } = useLocalStorage<SimState>("nexora-sim", initialState);
  const [prices, setPrices] = useState<Record<string, number>>(() =>
    Object.fromEntries(demoAssets.map((a) => [a.id, a.price]))
  );
  const [assets, setAssets] = useState<MarketAsset[]>(demoAssets);
  const [selected, setSelected] = useState(demoAssets[0].id);
  const [amount, setAmount] = useState(500);
  const [shockNote, setShockNote] = useState<string | null>(null);
  const liveRef = useRef(false);
  const toast = useToast();

  // Seed prices from live data when available; otherwise simulate movement
  useEffect(() => {
    let cancelled = false;
    void fetchMarket().then((r) => {
      if (cancelled) return;
      setAssets(r.assets);
      liveRef.current = r.live;
      setPrices(Object.fromEntries(r.assets.map((a) => [a.id, a.price])));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPrices((prev) => {
        const next: Record<string, number> = {};
        for (const [k, v] of Object.entries(prev)) {
          const vol = k === "usd-coin" ? 0.00005 : 0.0035;
          next[k] = Math.max(0.0001, v * (1 + (Math.random() - 0.5) * 2 * vol));
        }
        return next;
      });
    }, 2500);
    return () => window.clearInterval(id);
  }, []);

  const portfolioValue = useMemo(
    () => sim.holdings.reduce((sum, h) => sum + h.units * (prices[h.assetId] ?? 0), 0),
    [sim.holdings, prices]
  );
  const totalValue = sim.cash + portfolioValue;
  const totalPnl = totalValue - START_CASH;

  // Record the equity curve (prices read through a ref so the interval survives ticks)
  const pricesRef = useRef(prices);
  pricesRef.current = prices;
  useEffect(() => {
    if (!hydrated) return;
    const id = window.setInterval(() => {
      setSim((s) => {
        const p = pricesRef.current;
        const value = s.cash + s.holdings.reduce((sum, h) => sum + h.units * (p[h.assetId] ?? 0), 0);
        const series = [...s.valueSeries, { t: Date.now(), v: Math.round(value * 100) / 100 }].slice(-80);
        return { ...s, valueSeries: series };
      });
    }, 4000);
    return () => window.clearInterval(id);
  }, [hydrated, setSim]);

  const trade = useCallback(
    (side: "buy" | "sell") => {
      const asset = assets.find((a) => a.id === selected);
      const price = prices[selected];
      if (!asset || !price || amount <= 0) return;

      setSim((s) => {
        const holding = s.holdings.find((h) => h.assetId === selected);
        if (side === "buy") {
          if (amount > s.cash) {
            toast("Not enough virtual cash for that order.", "warn");
            return s;
          }
          const units = amount / price;
          const holdings = holding
            ? s.holdings.map((h) =>
                h.assetId === selected
                  ? { ...h, units: h.units + units, costBasis: h.costBasis + amount }
                  : h
              )
            : [...s.holdings, { assetId: selected, units, costBasis: amount }];
          const tx: SimTransaction = { id: uid(), time: Date.now(), side, assetId: selected, symbol: asset.symbol, units, price, total: amount };
          toast(`Bought ${units.toFixed(5)} ${asset.symbol} (virtual)`, "success");
          return { ...s, cash: s.cash - amount, holdings, history: [tx, ...s.history].slice(0, 40) };
        }
        // sell
        if (!holding || holding.units * price < amount - 0.01) {
          toast("You don't hold enough of that asset to sell.", "warn");
          return s;
        }
        const units = Math.min(holding.units, amount / price);
        const shareOfPosition = units / holding.units;
        const holdings = s.holdings
          .map((h) =>
            h.assetId === selected
              ? { ...h, units: h.units - units, costBasis: h.costBasis * (1 - shareOfPosition) }
              : h
          )
          .filter((h) => h.units > 1e-9);
        const tx: SimTransaction = { id: uid(), time: Date.now(), side, assetId: selected, symbol: asset.symbol, units, price, total: units * price };
        toast(`Sold ${units.toFixed(5)} ${asset.symbol} (virtual)`, "success");
        return { ...s, cash: s.cash + units * price, holdings, history: [tx, ...s.history].slice(0, 40) };
      });
    },
    [assets, selected, prices, amount, setSim, toast]
  );

  const shock = (pct: number) => {
    const before = totalValue;
    setPrices((prev) => {
      const next: Record<string, number> = {};
      for (const [k, v] of Object.entries(prev)) next[k] = k === "usd-coin" ? v : v * (1 - pct / 100);
      return next;
    });
    const exposure = sim.holdings.reduce(
      (sum, h) => (h.assetId === "usd-coin" ? sum : sum + h.units * (prices[h.assetId] ?? 0)),
      0
    );
    const hit = exposure * (pct / 100);
    const concentration = before > 0 ? Math.round((exposure / before) * 100) : 0;
    setShockNote(
      `A ${pct}% market decline just cost your simulated portfolio about ${formatUsd(hit)}. ` +
        `${concentration}% of your value was exposed to volatile assets, so the crash hit that share in full — cash and stablecoins absorbed nothing. ` +
        `This is why concentration decides how badly a crash hurts: the same event, at the same portfolio size, wounds a diversified holder and ruins a concentrated one.`
    );
    toast(`Market shock applied: −${pct}% (simulation)`, "warn");
  };

  const reset = () => {
    setSim(initialState);
    setShockNote(null);
    toast("Simulation reset. Fresh $10,000 in virtual cash.", "info");
  };

  const chartData = sim.valueSeries.map((p, i) => ({ i, v: p.v }));

  return (
    <SectionShell id="simulator">
      <Reveal>
        <Eyebrow>06 · Paper portfolio</Eyebrow>
        <SectionTitle sub="Practice with virtual money until mistakes are free. Every lesson here would cost real money outside.">
          Trade without the consequences
        </SectionTitle>
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-amber-300">
          <ShieldAlert className="h-4 w-4" aria-hidden />
          Simulation only. No real funds, wallets, or transactions are involved.
        </div>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        {/* Left: value + chart + holdings */}
        <Reveal className="glass glow-line rounded-3xl p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-mute">Total virtual value</p>
              <p className="mt-1 font-display text-3xl font-semibold tabular-nums md:text-4xl">
                <AnimatedNumber value={totalValue} format={(n) => formatUsd(n)} />
              </p>
              <p className={cn("mt-1 font-mono text-sm tabular-nums", totalPnl >= 0 ? "text-rise" : "text-fall")}>
                {totalPnl >= 0 ? "+" : "−"}{formatUsd(Math.abs(totalPnl))} ({formatPct((totalPnl / START_CASH) * 100)}) since start
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[11px] uppercase tracking-wider text-mute">Virtual cash</p>
              <p className="mt-1 font-mono text-lg tabular-nums">{formatUsd(sim.cash)}</p>
            </div>
          </div>

          <div className="mt-5 h-44">
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="simValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={tokens.colors.violet} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={tokens.colors.violet} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="i" hide />
                  <YAxis hide domain={["dataMin", "dataMax"]} />
                  <Tooltip
                    contentStyle={{ background: "#0d101e", border: `1px solid ${tokens.colors.line}`, borderRadius: 12, fontSize: 12 }}
                    formatter={(v: number) => [formatUsd(v), "Portfolio"]}
                    labelFormatter={() => ""}
                  />
                  <Area type="monotone" dataKey="v" stroke={tokens.colors.violet} strokeWidth={2} fill="url(#simValue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-line/50 text-sm text-mute">
                Your portfolio curve appears here as time passes.
              </div>
            )}
          </div>

          {/* Holdings */}
          <h3 className="mt-6 mb-3 font-mono text-[11px] uppercase tracking-wider text-mute">Holdings</h3>
          {sim.holdings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line/50 p-6 text-center text-sm text-mute">
              No positions yet. Choose an asset on the right and make your first virtual purchase.
            </div>
          ) : (
            <div className="space-y-2">
              {sim.holdings.map((h) => {
                const asset = assets.find((a) => a.id === h.assetId);
                const price = prices[h.assetId] ?? 0;
                const value = h.units * price;
                const avg = h.costBasis / h.units;
                const pnl = value - h.costBasis;
                const alloc = portfolioValue > 0 ? (value / (portfolioValue + sim.cash)) * 100 : 0;
                return (
                  <div key={h.assetId} className="rounded-2xl border border-line/50 bg-bg/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">{asset?.name ?? h.assetId}</span>
                      <span className="font-mono text-sm tabular-nums">{formatUsd(value)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap justify-between gap-2 font-mono text-xs text-mute">
                      <span>{h.units.toFixed(5)} @ avg {formatUsd(avg)}</span>
                      <span className={pnl >= 0 ? "text-rise" : "text-fall"}>
                        {pnl >= 0 ? "+" : "−"}{formatUsd(Math.abs(pnl))} unrealized
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan to-violet"
                        animate={{ width: `${alloc}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-mute">{alloc.toFixed(1)}% of portfolio</p>
                  </div>
                );
              })}
            </div>
          )}
        </Reveal>

        {/* Right: trade panel + shocks + history */}
        <div className="flex flex-col gap-5">
          <Reveal className="glass rounded-3xl p-6">
            <h3 className="mb-4 font-display text-base font-semibold">Place a virtual order</h3>
            <label className="mb-3 block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-mute">Asset</span>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full rounded-xl border border-line/60 bg-surface px-3 py-2.5 text-sm"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {formatUsd(prices[a.id] ?? a.price)}
                  </option>
                ))}
              </select>
            </label>
            <label className="mb-4 block">
              <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-mute">Amount (virtual USD)</span>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-full rounded-xl border border-line/60 bg-surface px-3 py-2.5 font-mono text-sm tabular-nums"
              />
            </label>
            <div className="flex gap-3">
              <button onClick={() => trade("buy")} className="flex-1 rounded-xl bg-rise/90 px-4 py-2.5 text-sm font-medium text-bg transition-transform hover:scale-[1.02]">
                Buy
              </button>
              <button onClick={() => trade("sell")} className="flex-1 rounded-xl bg-fall/90 px-4 py-2.5 text-sm font-medium text-bg transition-transform hover:scale-[1.02]">
                Sell
              </button>
            </div>
          </Reveal>

          <Reveal className="glass rounded-3xl p-6">
            <h3 className="mb-1 flex items-center gap-2 font-display text-base font-semibold">
              <Zap className="h-4 w-4 text-amber-300" aria-hidden /> Market shock
            </h3>
            <p className="mb-4 text-sm text-mute">Crashes are a feature of this market, not a bug. See how one would hit you.</p>
            <div className="flex gap-2">
              {SHOCKS.map((s) => (
                <button
                  key={s.pct}
                  onClick={() => shock(s.pct)}
                  className="flex-1 rounded-xl border border-fall/40 bg-fall/10 px-3 py-2.5 font-mono text-sm text-fall transition-colors hover:bg-fall/20"
                >
                  {s.label}
                </button>
              ))}
            </div>
            <AnimatePresence>
              {shockNote && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden rounded-xl border border-amber-300/30 bg-amber-300/5 p-3 text-sm leading-relaxed text-mute"
                >
                  {shockNote}
                </motion.p>
              )}
            </AnimatePresence>
          </Reveal>

          <Reveal className="glass flex-1 rounded-3xl p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">History</h3>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 rounded-full border border-line/60 px-3 py-1.5 text-xs text-mute transition-colors hover:border-fall/50 hover:text-fall"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset simulation
              </button>
            </div>
            {sim.history.length === 0 ? (
              <p className="text-sm text-mute">Your virtual trades will be listed here.</p>
            ) : (
              <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {sim.history.map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between rounded-xl border border-line/40 bg-bg/40 px-3 py-2 font-mono text-xs">
                    <span className={tx.side === "buy" ? "text-rise" : "text-fall"}>
                      {tx.side.toUpperCase()} {tx.symbol}
                    </span>
                    <span className="text-mute">{tx.units.toFixed(4)} @ {formatUsd(tx.price)}</span>
                    <span className="tabular-nums">{formatUsd(tx.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}
