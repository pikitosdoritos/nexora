"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Send } from "lucide-react";
import { Eyebrow, SectionShell, SectionTitle } from "@/components/ui/primitives";
import { Reveal } from "@/components/animations/Reveal";
import { cn } from "@/lib/utils";
import { tokens } from "@/lib/tokens";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Phase = "idle" | "created" | "validating" | "block" | "chained";

const PHASES: { id: Phase; title: string; body: string }[] = [
  { id: "created", title: "1 · Transaction created", body: "Your wallet signs the transaction with your private key — proof that you authorized it, without revealing the key itself." },
  { id: "validating", title: "2 · Network validates", body: "Independent validator nodes check the signature and your balance. No single company approves it; the network reaches agreement." },
  { id: "block", title: "3 · Enters a block", body: "Valid transactions are bundled together into a block — a page in the shared ledger, sealed with cryptography." },
  { id: "chained", title: "4 · Joins the chain", body: "The block links to the previous one by its fingerprint. Rewriting history would mean redoing every block after it, across the whole network." },
];

const CONCEPTS = [
  { term: "Blockchain", text: "A shared ledger copied across thousands of computers. Everyone holds the same history, so no one can quietly edit it." },
  { term: "Wallet", text: "Software that holds your keys — not your coins. The coins live on the chain; the wallet proves you control them." },
  { term: "Private key", text: "The secret that authorizes spending. Whoever holds it owns the funds. There is no reset button." },
  { term: "Public address", text: "Your account number, safe to share. People send funds to it; only your private key can move them out." },
  { term: "Gas / network fee", text: "What you pay the network to process a transaction. Fees rise when the network is busy." },
  { term: "Decentralization", text: "No single point of control or failure. Thousands of independent operators keep the system honest." },
  { term: "Consensus", text: "The rules by which strangers agree on one version of history — and by which cheaters lose money." },
];

const NODE_POS = [
  { x: 150, y: 40 },
  { x: 250, y: 90 },
  { x: 230, y: 180 },
  { x: 70, y: 180 },
  { x: 50, y: 90 },
];

export function HowItWorks() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [confirmations, setConfirmations] = useState(0);
  const [blocks, setBlocks] = useState(3);
  const [openConcept, setOpenConcept] = useState<string | null>(null);
  const running = useRef(false);
  const reduced = useReducedMotion();

  const send = useCallback(() => {
    if (running.current) return;
    running.current = true;
    setConfirmations(0);
    const speed = reduced ? 0.3 : 1;
    const steps: Array<[number, () => void]> = [
      [0, () => setPhase("created")],
      [1200 * speed, () => setPhase("validating")],
      [1800 * speed, () => setConfirmations(1)],
      [2400 * speed, () => setConfirmations(2)],
      [3000 * speed, () => setConfirmations(3)],
      [3600 * speed, () => setPhase("block")],
      [5000 * speed, () => { setPhase("chained"); setBlocks((b) => Math.min(b + 1, 6)); }],
      [6800 * speed, () => { running.current = false; }],
    ];
    steps.forEach(([delay, fn]) => window.setTimeout(fn, delay));
  }, [reduced]);

  const activeIdx = PHASES.findIndex((p) => p.id === phase);

  return (
    <SectionShell id="learn" className="bg-gradient-to-b from-transparent via-surface/20 to-transparent">
      <Reveal>
        <Eyebrow>03 · How crypto works</Eyebrow>
        <SectionTitle sub="Press the button and watch one transaction travel through the system — from your wallet to permanent history.">
          Anatomy of a transaction
        </SectionTitle>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        {/* Visualization */}
        <Reveal className="glass glow-line relative overflow-hidden rounded-3xl p-6">
          <svg viewBox="0 0 300 230" className="w-full" role="img" aria-label="Animated diagram of a transaction moving through validator nodes into a block on the chain">
            {/* validator ring */}
            {NODE_POS.map((n, i) => (
              <g key={i}>
                <line
                  x1="150" y1="115" x2={n.x} y2={n.y}
                  stroke={tokens.colors.line} strokeWidth="0.8" opacity="0.6"
                />
                <circle
                  cx={n.x} cy={n.y} r="9"
                  fill="rgb(13,16,30)"
                  stroke={phase === "validating" && i < confirmations + 2 ? tokens.colors.cyan : tokens.colors.line}
                  strokeWidth="1.4"
                  className="transition-all duration-500"
                />
                {phase === "validating" && i < confirmations + 2 && (
                  <circle cx={n.x} cy={n.y} r="3" fill={tokens.colors.rise} />
                )}
              </g>
            ))}

            {/* transaction packet */}
            <AnimatePresence>
              {(phase === "created" || phase === "validating") && (
                <motion.circle
                  r="5"
                  fill={tokens.colors.cyan}
                  initial={{ cx: 150, cy: 115, opacity: 0, scale: 0 }}
                  animate={
                    phase === "created"
                      ? { cx: 150, cy: 115, opacity: 1, scale: 1 }
                      : { cx: NODE_POS.map((n) => n.x), cy: NODE_POS.map((n) => n.y), opacity: 1, scale: 1 }
                  }
                  exit={{ opacity: 0, scale: 2 }}
                  transition={phase === "validating" ? { duration: reduced ? 0.2 : 2.6, ease: "easeInOut" } : { duration: 0.4 }}
                  style={{ filter: "drop-shadow(0 0 6px rgba(82,226,255,0.9))" }}
                />
              )}
            </AnimatePresence>

            {/* center wallet */}
            <circle cx="150" cy="115" r="14" fill="rgb(13,16,30)" stroke={tokens.colors.violet} strokeWidth="1.6" />
            <text x="150" y="119" textAnchor="middle" fontSize="9" fill={tokens.colors.cyan} fontFamily="monospace">
              TX
            </text>
          </svg>

          {/* the chain */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1" aria-label="The blockchain, newest block on the right">
            {Array.from({ length: blocks }).map((_, i) => {
              const isNew = i === blocks - 1 && phase === "chained";
              return (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden className="h-px w-4 shrink-0 bg-gradient-to-r from-line to-cyan/60" />}
                  <motion.div
                    initial={isNew ? { scale: 0, rotate: -8 } : false}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 16 }}
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border font-mono text-[10px]",
                      isNew ? "border-cyan/70 bg-cyan/10 text-cyan shadow-[0_0_18px_-4px_var(--glow)]" : "border-line/60 bg-surface/60 text-mute"
                    )}
                  >
                    #{841 + i}
                  </motion.div>
                </div>
              );
            })}
            <AnimatePresence>
              {phase === "block" && (
                <motion.div
                  initial={{ opacity: 0, y: -18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="ml-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-cyan/60 font-mono text-[10px] text-cyan"
                >
                  new
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* status panel */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line/50 bg-bg/50 px-4 py-3">
            <div className="font-mono text-xs">
              <span className="text-mute">Status: </span>
              <span className={phase === "chained" ? "text-rise" : "text-cyan"}>
                {phase === "idle" && "Ready to send"}
                {phase === "created" && "Signed by wallet"}
                {phase === "validating" && `Validating · ${confirmations}/3 confirmations`}
                {phase === "block" && "Packing into block"}
                {phase === "chained" && "Finalized on chain ✓"}
              </span>
            </div>
            <button
              onClick={send}
              className="flex items-center gap-2 rounded-full bg-cyan px-4 py-2 text-sm font-medium text-bg transition-transform hover:scale-[1.03]"
            >
              <Send className="h-4 w-4" aria-hidden />
              Send transaction
            </button>
          </div>
        </Reveal>

        {/* Phase explanations */}
        <div className="flex flex-col gap-3">
          {PHASES.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <div
                className={cn(
                  "rounded-2xl border p-5 transition-all duration-500",
                  i === activeIdx
                    ? "border-cyan/50 bg-cyan/5 shadow-[0_0_24px_-10px_var(--glow)]"
                    : i < activeIdx || phase === "chained"
                      ? "border-rise/30 bg-surface/30"
                      : "border-line/50 bg-surface/30"
                )}
              >
                <h3 className="font-display text-sm font-semibold tracking-wide">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mute">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Key concepts */}
      <Reveal className="mt-14">
        <h3 className="mb-4 font-display text-lg font-semibold">Seven words that unlock the rest</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CONCEPTS.map((c) => {
            const open = openConcept === c.term;
            return (
              <div key={c.term} className="rounded-xl border border-line/50 bg-surface/30">
                <button
                  onClick={() => setOpenConcept(open ? null : c.term)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
                >
                  {c.term}
                  <ChevronDown className={cn("h-4 w-4 text-mute transition-transform", open && "rotate-180")} aria-hidden />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: tokens.ease }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm leading-relaxed text-mute">{c.text}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Reveal>
    </SectionShell>
  );
}
