"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sparkles, X } from "lucide-react";
import { sectionIds, tokens } from "@/lib/tokens";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function Logo() {
  return (
    <a href="#top" className="group flex items-center gap-2.5" aria-label="NEXORA — back to top">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden className="text-cyan">
        {/* Node-and-link mark, drawn in on load */}
        <g fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M5 20 L13 5 L21 20 L5 9 L21 9 Z" className="[stroke-dasharray:90] [stroke-dashoffset:0] motion-safe:animate-[logo-draw_1.6s_ease-out]" />
        </g>
        <circle cx="13" cy="5" r="2" fill="currentColor" />
        <circle cx="5" cy="20" r="2" fill="currentColor" />
        <circle cx="21" cy="20" r="2" fill="currentColor" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-[0.18em]">NEXORA</span>
      <style jsx>{`
        @keyframes logo-draw {
          from { stroke-dashoffset: 90; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </a>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<"space" | "midnight">("space");

  useEffect(() => {
    const saved = window.localStorage.getItem("nexora-theme");
    if (saved === "midnight") {
      setTheme("midnight");
      document.documentElement.dataset.theme = "midnight";
    }
  }, []);

  const toggle = () => {
    const next = theme === "space" ? "midnight" : "space";
    setTheme(next);
    if (next === "midnight") document.documentElement.dataset.theme = "midnight";
    else delete document.documentElement.dataset.theme;
    window.localStorage.setItem("nexora-theme", next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "space" ? "Midnight Blue" : "Deep Space"} theme`}
      title={theme === "space" ? "Theme: Deep Space" : "Theme: Midnight Blue"}
      className="rounded-full border border-line/60 p-2 text-mute transition-colors hover:border-cyan/50 hover:text-cyan"
    >
      {theme === "space" ? <Sparkles className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
    </button>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    sectionIds.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "mx-auto mt-3 flex max-w-wrap items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500 md:px-5",
          scrolled ? "glass glow-line mx-3 md:mx-auto" : "bg-transparent"
        )}
      >
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {sectionIds.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => go(id)}
              aria-current={active === id ? "true" : undefined}
              className={cn(
                "relative rounded-full px-3.5 py-1.5 text-sm transition-colors",
                active === id ? "text-cyan" : "text-mute hover:text-ink"
              )}
            >
              {label}
              {active === id && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-cyan/10 ring-1 ring-cyan/30"
                  transition={{ duration: 0.35, ease: tokens.ease }}
                />
              )}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <button
            onClick={() => go("roadmap")}
            className="hidden rounded-full bg-cyan px-4 py-2 text-sm font-medium text-bg transition-transform hover:scale-[1.03] sm:block"
          >
            Start learning
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="rounded-full border border-line/60 p-2 text-ink lg:hidden"
          >
            {open ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Mobile"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: tokens.ease }}
            className="glass glow-line mx-3 mt-2 rounded-2xl p-3 lg:hidden"
          >
            {sectionIds.map(({ id, label }, i) => (
              <motion.button
                key={id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
                onClick={() => go(id)}
                className={cn(
                  "block w-full rounded-xl px-4 py-3 text-left text-sm",
                  active === id ? "bg-cyan/10 text-cyan" : "text-ink hover:bg-surface/70"
                )}
              >
                {label}
              </motion.button>
            ))}
            <button
              onClick={() => go("roadmap")}
              className="mt-2 w-full rounded-xl bg-cyan px-4 py-3 text-sm font-medium text-bg"
            >
              Start learning
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
