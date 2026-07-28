"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Check, ChevronDown, ListChecks, TriangleAlert } from "lucide-react";
import { roadmapSteps } from "@/data/content";
import { Eyebrow, SectionShell, SectionTitle } from "@/components/ui/primitives";
import { Reveal } from "@/components/animations/Reveal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { tokens } from "@/lib/tokens";

export function Roadmap() {
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: railRef, offset: ["start 0.7", "end 0.7"] });
  const railScale = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });
  const { value: done, set: setDone, hydrated } = useLocalStorage<string[]>("nexora-roadmap", []);
  const [open, setOpen] = useState<string | null>(null);
  const toast = useToast();

  const toggleDone = (id: string, title: string) => {
    setDone((prev) => {
      const has = prev.includes(id);
      if (!has) toast(`Marked as understood: ${title}`, "success");
      return has ? prev.filter((x) => x !== id) : [...prev, id];
    });
  };

  const completed = done.length;

  return (
    <SectionShell id="roadmap">
      <Reveal>
        <Eyebrow>04 · Beginner roadmap</Eyebrow>
        <SectionTitle sub="Ten steps, in order. Each one exists because skipping it has cost real people real money.">
          Your first steps into crypto
        </SectionTitle>
      </Reveal>

      <Reveal className="mb-10 flex items-center gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan to-violet"
            animate={{ width: hydrated ? `${(completed / roadmapSteps.length) * 100}%` : "0%" }}
            transition={{ duration: 0.6, ease: tokens.ease }}
          />
        </div>
        <span className="font-mono text-xs text-mute" aria-live="polite">
          {completed}/{roadmapSteps.length} understood
        </span>
      </Reveal>

      <div ref={railRef} className="relative">
        {/* progress rail */}
        <div aria-hidden className="absolute bottom-4 left-[15px] top-4 w-px bg-line/40 md:left-[19px]" />
        <motion.div
          aria-hidden
          style={{ scaleY: railScale }}
          className="absolute bottom-4 left-[15px] top-4 w-px origin-top bg-gradient-to-b from-cyan to-violet md:left-[19px]"
        />

        <ol className="space-y-4">
          {roadmapSteps.map((step, i) => {
            const isDone = done.includes(step.id);
            const isOpen = open === step.id;
            return (
              <Reveal key={step.id} delay={0.03 * i}>
                <li className="relative pl-12 md:pl-16">
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-0 top-3 flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs transition-all duration-500 md:h-10 md:w-10",
                      isDone
                        ? "border-rise/60 bg-rise/10 text-rise shadow-[0_0_16px_-4px_rgba(74,222,168,0.5)]"
                        : "border-line/70 bg-bg text-mute"
                    )}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : String(i + 1).padStart(2, "0")}
                  </span>

                  <div
                    className={cn(
                      "rounded-2xl border transition-colors duration-500",
                      isDone ? "border-rise/25 bg-surface/25" : "border-line/50 bg-surface/35"
                    )}
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : step.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left"
                    >
                      <div>
                        <h3 className="font-display text-base font-semibold md:text-lg">{step.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-mute">{step.summary}</p>
                      </div>
                      <ChevronDown className={cn("h-5 w-5 shrink-0 text-mute transition-transform", isOpen && "rotate-180")} aria-hidden />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: tokens.ease }}
                          className="overflow-hidden"
                        >
                          <div className="grid gap-5 border-t border-line/40 p-5 md:grid-cols-2">
                            <div>
                              <h4 className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-cyan">
                                <ListChecks className="h-3.5 w-3.5" aria-hidden /> Practical checklist
                              </h4>
                              <ul className="space-y-2">
                                {step.checklist.map((item) => (
                                  <li key={item} className="flex gap-2 text-sm text-mute">
                                    <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-amber-300">
                                <TriangleAlert className="h-3.5 w-3.5" aria-hidden /> Common mistakes
                              </h4>
                              <ul className="space-y-2">
                                {step.mistakes.map((item) => (
                                  <li key={item} className="flex gap-2 text-sm text-mute">
                                    <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-300" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <button
                              onClick={() => toggleDone(step.id, step.title)}
                              className={cn(
                                "md:col-span-2 flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                                isDone
                                  ? "border-rise/50 bg-rise/10 text-rise"
                                  : "border-cyan/40 bg-cyan/5 text-cyan hover:bg-cyan/10"
                              )}
                            >
                              <Check className="h-4 w-4" aria-hidden />
                              {isDone ? "Understood — tap to reset" : "Mark as understood"}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </SectionShell>
  );
}
