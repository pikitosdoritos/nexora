"use client";

import { useRef, type ReactNode, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function SectionShell({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("relative py-24 md:py-36 scroll-mt-20", className)}>
      <div className="mx-auto w-full max-w-wrap px-5 md:px-8">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-cyan/90">
      <span aria-hidden className="h-px w-8 bg-gradient-to-r from-cyan to-transparent" />
      {children}
    </p>
  );
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-12 max-w-2xl">
      <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
        {children}
      </h2>
      {sub ? <p className="mt-4 text-base leading-relaxed text-mute md:text-lg">{sub}</p> : null}
    </div>
  );
}

const riskTone: Record<string, string> = {
  "Medium to high": "text-amber-300 border-amber-300/30 bg-amber-300/10",
  High: "text-orange-300 border-orange-300/30 bg-orange-300/10",
  "Very high": "text-fall border-fall/30 bg-fall/10",
  Low: "text-rise border-rise/30 bg-rise/10",
  Medium: "text-amber-300 border-amber-300/30 bg-amber-300/10",
};

export function RiskBadge({ level, prefix }: { level: string; prefix?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider",
        riskTone[level] ?? "text-mute border-line bg-surface"
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {prefix ? `${prefix}: ` : null}
      {level}
    </span>
  );
}

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  children: ReactNode;
}

/** Button that leans toward the cursor; a plain button under reduced motion. */
export function MagneticButton({ variant = "primary", className, children, ...rest }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  const onMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 10;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };

  return (
    <button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "rounded-full px-6 py-3 text-sm font-medium transition-[transform,box-shadow,background-color] duration-300 will-change-transform",
        variant === "primary" &&
          "cta-glow bg-bg text-ink hover:shadow-[0_0_36px_-8px_var(--glow)]",
        variant === "ghost" &&
          "border border-line/70 bg-surface/40 text-ink hover:border-cyan/50 hover:bg-surface/70",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Chip({
  active,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors",
        active
          ? "border-cyan/60 bg-cyan/10 text-cyan"
          : "border-line/60 bg-surface/40 text-mute hover:border-line hover:text-ink"
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function DemoTag({ live }: { live: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider",
        live ? "border-rise/40 bg-rise/10 text-rise" : "border-amber-300/40 bg-amber-300/10 text-amber-300"
      )}
    >
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full bg-current", live && "pulse-dot")} />
      {live ? "Live data" : "Demo data"}
    </span>
  );
}
