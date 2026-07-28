"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Search } from "lucide-react";
import { glossary } from "@/data/glossary";
import type { GlossaryTerm } from "@/types";
import { Chip, Eyebrow, SectionShell, SectionTitle } from "@/components/ui/primitives";
import { Reveal } from "@/components/animations/Reveal";
import { cn } from "@/lib/utils";
import { tokens } from "@/lib/tokens";

const CATEGORIES = ["All", "Basics", "Wallets", "Markets", "DeFi", "Infrastructure"] as const;

function TermCard({ t, onRelated }: { t: GlossaryTerm; onRelated: (term: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div layout className="rounded-2xl border border-line/50 bg-surface/30">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full p-5 text-left"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-base font-semibold">{t.term}</h3>
          <span className="rounded-full border border-line/50 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mute">
            {t.category}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-mute">{t.short}</p>
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
            <div className="border-t border-line/40 p-5">
              <p className="text-sm leading-relaxed text-ink/85">{t.detail}</p>
              <p className="mt-3 rounded-xl border border-cyan/25 bg-cyan/5 p-3 text-sm leading-relaxed text-mute">
                <span className="font-mono text-[10px] uppercase tracking-wider text-cyan">Example · </span>
                {t.example}
              </p>
              {t.related.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-mute">Related:</span>
                  {t.related.map((r) => (
                    <button
                      key={r}
                      onClick={() => onRelated(r)}
                      className="rounded-full border border-line/60 px-2.5 py-1 text-xs text-cyan transition-colors hover:border-cyan/50"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Glossary() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return glossary.filter((t) => {
      const catOk = category === "All" || t.category === category;
      const qOk =
        q === "" ||
        t.term.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q) ||
        t.detail.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [query, category]);

  const jumpTo = (term: string) => {
    setQuery(term);
    setCategory("All");
    inputRef.current?.focus();
  };

  return (
    <SectionShell id="glossary" className="bg-gradient-to-b from-transparent via-surface/20 to-transparent">
      <Reveal>
        <Eyebrow>09 · Glossary</Eyebrow>
        <SectionTitle sub="The vocabulary of the system — each term with a one-line version and the full story.">
          Speak the language
        </SectionTitle>
      </Reveal>

      <Reveal className="mb-6 space-y-4">
        <div className="glass glow-line flex items-center gap-3 rounded-2xl px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-cyan" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms — try “seed phrase” or “leverage”"
            aria-label="Search glossary terms"
            className="w-full bg-transparent text-sm outline-none placeholder:text-mute/70"
          />
          <span className="hidden font-mono text-[10px] text-mute md:block" aria-hidden>
            {filtered.length} {filtered.length === 1 ? "term" : "terms"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Chip>
          ))}
        </div>
      </Reveal>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line/50 p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-mute" aria-hidden />
          <p className="mt-3 text-sm text-mute">
            No terms match “{query}”. Try a shorter word, or clear the category filter.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
            className="mt-4 rounded-full border border-cyan/40 px-4 py-2 text-sm text-cyan"
          >
            Clear search
          </button>
        </div>
      ) : (
        <motion.div layout className="grid gap-3 md:grid-cols-2">
          {filtered.map((t) => (
            <TermCard key={t.term} t={t} onRelated={jumpTo} />
          ))}
        </motion.div>
      )}
    </SectionShell>
  );
}
