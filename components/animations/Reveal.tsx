"use client";

import { motion, useReducedMotion as fmReduced } from "framer-motion";
import type { ReactNode } from "react";
import { tokens } from "@/lib/tokens";

/** Scroll-into-view reveal. Renders statically under prefers-reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduced = fmReduced();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: tokens.viewportMargin }}
      transition={{ duration: tokens.duration.base, delay, ease: tokens.ease }}
    >
      {children}
    </motion.div>
  );
}

/** Per-word masked headline reveal. */
export function WordReveal({ text, className }: { text: string; className?: string }) {
  const reduced = fmReduced();
  const words = text.split(" ");
  if (reduced) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-1 align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 + i * 0.055, ease: tokens.ease }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
