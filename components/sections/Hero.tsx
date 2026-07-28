"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { ArrowDown, Boxes, Radio } from "lucide-react";
import type { SceneDriver } from "@/components/three/HeroScene";
import { WordReveal } from "@/components/animations/Reveal";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { MagneticButton } from "@/components/ui/primitives";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { tokens } from "@/lib/tokens";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 aurora" aria-hidden />,
});

const STAGES = [
  { at: 0, label: "The network" },
  { at: 0.3, label: "Nodes become blocks" },
  { at: 0.55, label: "Blocks form the chain" },
  { at: 0.78, label: "The chain becomes a market" },
];

export function Hero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const driver = useRef<SceneDriver>({ progress: 0, pointerX: 0, pointerY: 0, active: true });
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);
  const [mobile, setMobile] = useState(false);
  const [stats, setStats] = useState({ blocks: 847_212, tx: 12_408_551, nodes: 9_412 });

  // Simulated live network counters (labelled as simulated in the UI)
  useEffect(() => {
    const id = window.setInterval(() => {
      setStats((s) => ({
        blocks: s.blocks + (Math.random() < 0.4 ? 1 : 0),
        tx: s.tx + Math.floor(Math.random() * 14),
        nodes: s.nodes + (Math.random() < 0.1 ? (Math.random() < 0.5 ? 1 : -1) : 0),
      }));
    }, 1500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 768px)").matches);
  }, []);

  // Scroll narrative: pin-free progress over a tall hero
  useEffect(() => {
    if (!wrapRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: wrapRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        driver.current.progress = reduced ? 0 : self.progress;
        const next = STAGES.reduce((acc, s, i) => (self.progress >= s.at ? i : acc), 0);
        setStage((prev) => (prev === next ? prev : next));
      },
    });
    return () => st.kill();
  }, [reduced]);

  // Pointer parallax + pause when off screen
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      driver.current.pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
      driver.current.pointerY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    const io = new IntersectionObserver(([entry]) => {
      driver.current.active = entry.isIntersecting;
    });
    if (wrapRef.current) io.observe(wrapRef.current);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, []);

  const quality = reduced ? "static" : mobile ? "lite" : "full";
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });

  return (
    <div ref={wrapRef} className="relative h-[280vh]" id="top">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="absolute inset-0 aurora" aria-hidden />
        <div className="absolute inset-0 grid-texture" aria-hidden />
        <HeroScene driver={driver} quality={quality} />

        {/* Overlay content */}
        <div className="relative z-10 mx-auto flex w-full max-w-wrap flex-1 flex-col justify-center px-5 pt-24 md:px-8">
          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-cyan"
          >
            <Radio className="h-3.5 w-3.5 pulse-dot" aria-hidden />
            Network status: educational · simulated
          </motion.p>

          <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            <WordReveal text="Crypto is not magic." />
            <br />
            <WordReveal text="It is a system you can" />{" "}
            <span className="text-gradient">
              <WordReveal text="understand." />
            </span>
          </h1>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7, ease: tokens.ease }}
            className="mt-6 max-w-xl text-base leading-relaxed text-mute md:text-lg"
          >
            Learn how digital assets, blockchains, markets, wallets, and crypto strategies work —
            before putting real money at risk.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.7, ease: tokens.ease }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <MagneticButton onClick={() => scrollTo("learn")}>Explore the system</MagneticButton>
            <MagneticButton variant="ghost" onClick={() => scrollTo("simulator")}>
              Try the simulator
            </MagneticButton>
          </motion.div>

          {/* Simulated network counters */}
          <motion.dl
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-line/40 pt-6"
          >
            {(
              [
                ["Blocks", stats.blocks],
                ["Transactions", stats.tx],
                ["Active nodes", stats.nodes],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">{label}</dt>
                <dd className="mt-1 font-mono text-lg text-ink md:text-xl">
                  <AnimatedNumber value={value} format={(n) => Math.round(n).toLocaleString("en-US")} />
                </dd>
              </div>
            ))}
            <dd className="col-span-3 font-mono text-[10px] uppercase tracking-[0.2em] text-mute/70">
              Simulated network activity — not connected to a live chain
            </dd>
          </motion.dl>
        </div>

        {/* Stage indicator + scroll cue, part of the 3D story */}
        <div className="relative z-10 mx-auto mb-8 flex w-full max-w-wrap items-end justify-between px-5 md:px-8">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-mute">
            <Boxes className="h-4 w-4 text-cyan" aria-hidden />
            <span key={stage} className="text-ink">
              {STAGES[stage].label}
            </span>
            <span aria-hidden className="hidden gap-1 sm:flex">
              {STAGES.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 w-6 rounded-full transition-colors duration-500 ${i <= stage ? "bg-cyan" : "bg-line/60"}`}
                />
              ))}
            </span>
          </div>
          <motion.button
            onClick={() => scrollTo("market")}
            aria-label="Scroll to the market overview"
            className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-mute transition-colors hover:text-cyan"
            animate={reduced ? undefined : { y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          >
            Scroll to enter
            <ArrowDown className="h-4 w-4" aria-hidden />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
