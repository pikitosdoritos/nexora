"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { ChevronDown, GitCompareArrows } from "lucide-react";
import { scoreLabels, strategies } from "@/data/content";
import type { Strategy, StrategyScore } from "@/types";
import { Eyebrow, RiskBadge, SectionShell, SectionTitle } from "@/components/ui/primitives";
import { Reveal } from "@/components/animations/Reveal";
import { cn, formatUsd } from "@/lib/utils";
import { tokens } from "@/lib/tokens";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* ---------- Strategy card with subtle tilt ---------- */

function StrategyCard({ s, index }: { s: Strategy; index: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const onMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current || open) return;
    const r = ref.current.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -3;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 3;
    ref.current.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
  };

  return (
    <Reveal delay={0.05 * index}>
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="glass h-full rounded-3xl p-6 transition-transform duration-200 will-change-transform"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold">{s.name}</h3>
          <RiskBadge level={s.risk} prefix="Risk" />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-mute">{s.tagline}</p>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-4 flex items-center gap-1.5 text-sm text-cyan transition-colors hover:text-ink"
        >
          {open ? "Hide details" : "What you should know"}
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: tokens.ease }}
              className="overflow-hidden"
            >
              <dl className="mt-4 space-y-3 border-t border-line/40 pt-4">
                {s.points.map((p) => (
                  <div key={p.label}>
                    <dt className="font-mono text-[11px] uppercase tracking-wider text-cyan">{p.label}</dt>
                    <dd className="mt-0.5 text-sm leading-relaxed text-mute">{p.text}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

/* ---------- DCA calculator ---------- */

const FREQ = { weekly: 52, biweekly: 26, monthly: 12 } as const;
type Freq = keyof typeof FREQ;

function simulateDca(amount: number, freq: Freq, years: number, annualReturn: number, annualVol: number) {
  const periods = Math.round(FREQ[freq] * years);
  const perReturn = annualReturn / 100 / FREQ[freq];
  const perVol = (annualVol / 100) / Math.sqrt(FREQ[freq]);
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  let value = 0;
  const series: { period: number; contributed: number; value: number }[] = [];
  for (let i = 1; i <= periods; i++) {
    // Box–Muller-ish noise for a hypothetical path
    const noise = (rand() + rand() + rand() - 1.5) * 2 * perVol;
    value = (value + amount) * (1 + perReturn + noise);
    value = Math.max(0, value);
    if (i % Math.max(1, Math.floor(periods / 60)) === 0 || i === periods) {
      series.push({ period: i, contributed: amount * i, value: Math.round(value) });
    }
  }
  return { contributed: amount * periods, final: value, series };
}

function DcaCalculator() {
  const [amount, setAmount] = useState(50);
  const [freq, setFreq] = useState<Freq>("weekly");
  const [years, setYears] = useState(3);
  const [ret, setRet] = useState(8);
  const [vol, setVol] = useState(60);

  const result = useMemo(() => simulateDca(amount, freq, years, ret, vol), [amount, freq, years, ret, vol]);
  const gain = result.final - result.contributed;

  const slider = (
    label: string, value: number, set: (v: number) => void, min: number, max: number, step: number, suffix: string
  ) => (
    <label className="block">
      <span className="mb-1.5 flex justify-between font-mono text-[11px] uppercase tracking-wider text-mute">
        {label}
        <span className="text-ink">{value}{suffix}</span>
      </span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => set(Number(e.target.value))}
        className="w-full accent-[rgb(var(--cyan))]"
      />
    </label>
  );

  return (
    <Reveal className="glass glow-line mt-10 rounded-3xl p-6 md:p-8">
      <h3 className="font-display text-lg font-semibold">Dollar-cost averaging, played forward</h3>
      <p className="mt-1 text-sm text-mute">
        A hypothetical simulation — one random path among infinitely many. Not a forecast, not advice.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-5">
          {slider("Recurring amount", amount, setAmount, 10, 500, 10, " USD")}
          <div>
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-mute">Frequency</span>
            <div className="flex gap-2" role="group" aria-label="Contribution frequency">
              {(Object.keys(FREQ) as Freq[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFreq(f)}
                  className={cn(
                    "flex-1 rounded-xl border px-3 py-2 text-sm capitalize transition-colors",
                    freq === f ? "border-cyan/60 bg-cyan/10 text-cyan" : "border-line/60 text-mute hover:text-ink"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          {slider("Duration", years, setYears, 1, 10, 1, " yr")}
          {slider("Hypothetical annual return", ret, setRet, -20, 30, 1, "%")}
          {slider("Hypothetical volatility", vol, setVol, 10, 120, 5, "%")}
        </div>

        <div>
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              ["Contributed", formatUsd(result.contributed), "text-ink"],
              ["Hypothetical value", formatUsd(Math.round(result.final)), "text-cyan"],
              [gain >= 0 ? "Hypothetical gain" : "Hypothetical loss", formatUsd(Math.round(Math.abs(gain))), gain >= 0 ? "text-rise" : "text-fall"],
            ].map(([label, value, tone]) => (
              <div key={label as string} className="rounded-2xl border border-line/50 bg-bg/40 p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-mute">{label}</p>
                <p className={cn("mt-1 font-mono text-sm tabular-nums md:text-base", tone as string)}>{value}</p>
              </div>
            ))}
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.series} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id="dcaValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tokens.colors.cyan} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={tokens.colors.cyan} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={tokens.colors.line} strokeOpacity={0.25} vertical={false} />
                <XAxis dataKey="period" tick={{ fill: tokens.colors.mute, fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: tokens.colors.mute, fontSize: 10 }} tickLine={false} axisLine={false} width={54}
                  tickFormatter={(v: number) => formatUsd(v, true)} />
                <Tooltip
                  contentStyle={{ background: "#0d101e", border: `1px solid ${tokens.colors.line}`, borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: tokens.colors.mute }}
                  formatter={(v: number, name: string) => [formatUsd(v), name === "value" ? "Simulated value" : "Contributed"]}
                />
                <Area type="monotone" dataKey="contributed" stroke={tokens.colors.violet} strokeDasharray="4 4" fill="none" strokeWidth={1.5} />
                <Area type="monotone" dataKey="value" stroke={tokens.colors.cyan} fill="url(#dcaValue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ---------- Comparison tool ---------- */

function CompareTool() {
  const [a, setA] = useState("dca");
  const [b, setB] = useState("trading");
  const sa = strategies.find((s) => s.id === a)!;
  const sb = strategies.find((s) => s.id === b)!;
  const keys = Object.keys(scoreLabels) as (keyof StrategyScore)[];

  const select = (value: string, onChange: (v: string) => void, label: string) => (
    <label className="flex-1">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-mute">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line/60 bg-surface px-3 py-2.5 text-sm text-ink focus:border-cyan/60"
      >
        {strategies.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </label>
  );

  return (
    <Reveal className="glass mt-10 rounded-3xl p-6 md:p-8">
      <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
        <GitCompareArrows className="h-5 w-5 text-cyan" aria-hidden />
        Compare two approaches
      </h3>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row">
        {select(a, setA, "Approach A")}
        {select(b, setB, "Approach B")}
      </div>

      <div className="mt-7 space-y-4">
        {keys.map((k) => {
          const va = sa.scores[k];
          const vb = sb.scores[k];
          const good = k === "beginnerFit";
          return (
            <div key={k}>
              <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-mute">
                <span className="text-cyan">{sa.name}</span>
                <span>{scoreLabels[k]}</span>
                <span className="text-violet">{sb.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-2 flex-1 justify-end overflow-hidden rounded-full bg-surface">
                  <motion.div
                    className={cn("h-full rounded-full", good ? "bg-rise" : "bg-cyan")}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${va * 20}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: tokens.ease }}
                  />
                </div>
                <span className="w-14 text-center font-mono text-[10px] text-mute">{va} · {vb}</span>
                <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-surface">
                  <motion.div
                    className={cn("h-full rounded-full", good ? "bg-rise" : "bg-violet")}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${vb * 20}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: tokens.ease }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-5 font-mono text-[11px] uppercase tracking-wider text-mute/70">
        Scores are educational judgments on a 1–5 scale, not measurements. Higher beginner suitability is better; for every other row, higher means more demanding or riskier.
      </p>
    </Reveal>
  );
}

export function Strategies() {
  return (
    <SectionShell id="strategies" className="bg-gradient-to-b from-transparent via-surface/20 to-transparent">
      <Reveal>
        <Eyebrow>05 · Ways people approach crypto</Eyebrow>
        <SectionTitle sub="Six common approaches, with the risks stated plainly. None of them is guaranteed, passive, safe, or easy income.">
          Strategies — and what they really cost
        </SectionTitle>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {strategies.map((s, i) => (
          <StrategyCard key={s.id} s={s} index={i} />
        ))}
      </div>

      <DcaCalculator />
      <CompareTool />
    </SectionShell>
  );
}
