"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { NetworkField } from "@/components/animations/NetworkField";
import { Eyebrow, SectionShell, SectionTitle } from "@/components/ui/primitives";
import { Reveal } from "@/components/animations/Reveal";
import { clamp, cn } from "@/lib/utils";
import { tokens } from "@/lib/tokens";

interface Inputs {
  concentration: number; // 0..100 (% in a single asset)
  leverage: number; // 1..10
  volatility: number; // 10..120 (% annual)
  years: number; // 0.25..10
  security: number; // 0..100 (quality)
}

const SCENARIOS: { id: string; label: string; weight: (i: Inputs) => number; note: string }[] = [
  { id: "crash", label: "Market crash", weight: (i) => i.volatility / 120, note: "Broad declines of 50%+ have happened repeatedly. Everyone in the market shares this risk." },
  { id: "liquidation", label: "Leveraged liquidation", weight: (i) => (i.leverage - 1) / 9, note: "At higher leverage, ordinary volatility becomes fatal: a routine dip forces the position closed at a total loss." },
  { id: "exchange", label: "Exchange failure", weight: (i) => (100 - i.security) / 130, note: "Platforms holding customer funds have collapsed with those funds inside. Withdrawal to self-custody removes it." },
  { id: "wallet", label: "Wallet compromise", weight: (i) => (100 - i.security) / 110, note: "Malware and leaked keys drain wallets silently. Hardware wallets and clean devices are the defense." },
  { id: "phishing", label: "Phishing", weight: (i) => (100 - i.security) / 100, note: "The most common way beginners lose everything — one convincing message, one signed approval." },
  { id: "contract", label: "Smart-contract exploit", weight: (i) => (i.concentration / 100) * 0.6 + (i.leverage - 1) / 18, note: "DeFi positions inherit their protocol's code risk. Audits reduce it; nothing removes it." },
  { id: "depeg", label: "Stablecoin depeg", weight: (i) => 0.25 + (100 - i.security) / 400, note: "\"Stable\" assets have broken before. Anything promising stability plus yield deserves double scrutiny." },
  { id: "seed", label: "Lost seed phrase", weight: (i) => (100 - i.security) / 120, note: "No backup means one broken phone away from permanent loss. This risk is entirely self-inflicted — and entirely preventable." },
];

function riskScore(i: Inputs): number {
  const concentrationRisk = i.concentration / 100;
  const leverageRisk = (i.leverage - 1) / 9;
  const volRisk = (i.volatility - 10) / 110;
  const timeRisk = clamp(1 - i.years / 10, 0, 1) * 0.4; // very short horizons amplify volatility risk
  const securityRisk = (100 - i.security) / 100;
  const raw =
    concentrationRisk * 0.22 +
    leverageRisk * 0.3 +
    volRisk * 0.18 +
    timeRisk * 0.1 +
    securityRisk * 0.2;
  // Leverage multiplies everything else
  return clamp(Math.round(raw * 100 * (1 + leverageRisk * 0.5)), 0, 100);
}

export function RiskLab() {
  const [inputs, setInputs] = useState<Inputs>({ concentration: 60, leverage: 1, volatility: 60, years: 3, security: 60 });
  const score = useMemo(() => riskScore(inputs), [inputs]);
  const integrity = 1 - score / 100;

  const topScenarios = useMemo(
    () => [...SCENARIOS].sort((a, b) => b.weight(inputs) - a.weight(inputs)),
    [inputs]
  );

  const set = (key: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs((prev) => ({ ...prev, [key]: Number(e.target.value) }));

  const slider = (label: string, key: keyof Inputs, min: number, max: number, step: number, display: string) => (
    <label className="block">
      <span className="mb-1.5 flex justify-between font-mono text-[11px] uppercase tracking-wider text-mute">
        {label}
        <span className="text-ink">{display}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={inputs[key]} onChange={set(key)} className="w-full accent-[rgb(var(--cyan))]" />
    </label>
  );

  const tone = score < 35 ? "text-rise" : score < 65 ? "text-amber-300" : "text-fall";
  const verdict =
    score < 35
      ? "A disciplined setup. Losses remain possible — but survivable."
      : score < 65
        ? "Meaningful fragility. One bad event would leave a mark."
        : "This configuration doesn't survive contact with a bad month.";

  return (
    <SectionShell className="bg-gradient-to-b from-transparent via-surface/20 to-transparent">
      <Reveal>
        <Eyebrow>07 · Risk laboratory</Eyebrow>
        <SectionTitle sub="Move the sliders and watch the network respond. Every unstable decision you make weakens it — exactly like a real portfolio.">
          What could go wrong?
        </SectionTitle>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        {/* Controls */}
        <Reveal className="glass rounded-3xl p-6 md:p-7">
          <div className="space-y-6">
            {slider("Portfolio concentration", "concentration", 0, 100, 5, `${inputs.concentration}% in one asset`)}
            {slider("Leverage", "leverage", 1, 10, 1, `${inputs.leverage}x`)}
            {slider("Asset volatility", "volatility", 10, 120, 5, `${inputs.volatility}% / yr`)}
            {slider("Investment period", "years", 0.5, 10, 0.5, `${inputs.years} yr`)}
            {slider("Security quality", "security", 0, 100, 5, `${inputs.security}/100`)}
          </div>
          <p className="mt-6 border-t border-line/40 pt-4 text-sm leading-relaxed text-mute">
            The score is an educational heuristic, not a measurement. Its point is the shape of the curve:
            leverage multiplies every other risk, and poor security turns unlikely events into probable ones.
          </p>
        </Reveal>

        {/* Network + score */}
        <Reveal className="glass glow-line relative overflow-hidden rounded-3xl">
          <NetworkField integrity={integrity} illumination={0.45 + integrity * 0.3} density={54} className="absolute inset-0 h-full w-full" />
          <div className="relative flex h-full min-h-[380px] flex-col justify-between p-6 md:p-7">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-mute">
              <Activity className="h-4 w-4 text-cyan" aria-hidden />
              Portfolio network integrity
            </div>
            <div>
              <p className={cn("font-display text-6xl font-semibold tabular-nums md:text-7xl", tone)} aria-live="polite">
                {score}
                <span className="text-2xl text-mute">/100</span>
              </p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-mute">Educational risk score</p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink/90">{verdict}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-bg/60">
              <motion.div
                className={cn("h-full rounded-full", score < 35 ? "bg-rise" : score < 65 ? "bg-amber-300" : "bg-fall")}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.5, ease: tokens.ease }}
              />
            </div>
          </div>
        </Reveal>
      </div>

      {/* Scenario ranking */}
      <Reveal className="mt-8">
        <h3 className="mb-4 font-display text-lg font-semibold">Failure modes, ranked for your settings</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {topScenarios.map((s, i) => {
            const w = clamp(s.weight(inputs), 0, 1);
            return (
              <motion.div
                key={s.id}
                layout
                transition={{ duration: 0.4, ease: tokens.ease }}
                className="rounded-2xl border border-line/50 bg-surface/30 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    <span className="mr-2 font-mono text-xs text-mute">{String(i + 1).padStart(2, "0")}</span>
                    {s.label}
                  </span>
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-bg/60">
                    <motion.div
                      className={cn("h-full rounded-full", w > 0.6 ? "bg-fall" : w > 0.3 ? "bg-amber-300" : "bg-rise")}
                      animate={{ width: `${Math.max(8, w * 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-mute">{s.note}</p>
              </motion.div>
            );
          })}
        </div>
      </Reveal>
    </SectionShell>
  );
}
