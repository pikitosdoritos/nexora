"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { tokens } from "@/lib/tokens";

/** Cinematic entry: the logo mark assembles, then the veil lifts. */
export function Loader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setDone(true), reduced ? 100 : 1700);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0, transition: { duration: 0.7, ease: tokens.ease } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg"
          aria-hidden
        >
          <svg width="72" height="72" viewBox="0 0 26 26" className="text-cyan">
            <motion.path
              d="M5 20 L13 5 L21 20 L5 9 L21 9 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.9"
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            {[
              [13, 5],
              [5, 20],
              [21, 20],
              [5, 9],
              [21, 9],
            ].map(([cx, cy], i) => (
              <motion.circle
                key={i}
                cx={cx}
                cy={cy}
                r="1.6"
                fill="currentColor"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.14, duration: 0.35 }}
              />
            ))}
          </svg>
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.6em" }}
            animate={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ delay: 0.5, duration: 0.9, ease: tokens.ease }}
            className="mt-6 font-display text-sm font-semibold uppercase text-ink"
          >
            Nexora
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-mute"
          >
            Initializing the network
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
