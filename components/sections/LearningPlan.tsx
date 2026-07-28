"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Download, GraduationCap, RotateCcw } from "lucide-react";
import { Eyebrow, SectionShell, SectionTitle } from "@/components/ui/primitives";
import { Reveal } from "@/components/animations/Reveal";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { tokens } from "@/lib/tokens";

interface Question {
  id: string;
  text: string;
  options: { id: string; label: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "experience",
    text: "How much crypto experience do you have?",
    options: [
      { id: "none", label: "None — starting from zero" },
      { id: "some", label: "I've bought a little" },
      { id: "active", label: "I use wallets and exchanges regularly" },
    ],
  },
  {
    id: "goal",
    text: "What do you want to learn?",
    options: [
      { id: "fundamentals", label: "How the technology works" },
      { id: "investing", label: "How to invest carefully" },
      { id: "security", label: "How to not get robbed" },
    ],
  },
  {
    id: "time",
    text: "How much time can you study weekly?",
    options: [
      { id: "1h", label: "About 1 hour" },
      { id: "3h", label: "2–4 hours" },
      { id: "5h", label: "5+ hours" },
    ],
  },
  {
    id: "risk",
    text: "What level of risk do you understand today?",
    options: [
      { id: "low", label: "Prices go up and down — that's about it" },
      { id: "mid", label: "I know about volatility and exchange risk" },
      { id: "high", label: "I understand leverage, custody, and contract risk" },
    ],
  },
  {
    id: "interest",
    text: "Are you interested in investing, technology, or both?",
    options: [
      { id: "invest", label: "Investing" },
      { id: "tech", label: "Technology" },
      { id: "both", label: "Both" },
    ],
  },
];

type Answers = Record<string, string>;

function buildPlan(a: Answers): { week: number; title: string; items: string[] }[] {
  const plan: { week: number; title: string; items: string[] }[] = [];
  let week = 1;

  if (a.experience === "none" || a.goal === "fundamentals" || a.interest !== "invest") {
    plan.push({
      week: week++,
      title: "Blockchain fundamentals",
      items: [
        "Work through the “How crypto works” walkthrough on this page twice",
        "Learn 10 glossary terms: blockchain, wallet, private key, token, gas…",
        "Explain to someone else how a transaction becomes permanent",
      ],
    });
  }

  plan.push({
    week: week++,
    title: "Wallet & account security",
    items: [
      "Complete the full security checklist above",
      "Score 100% on the phishing challenge — twice",
      a.risk === "low" ? "Read about one real exchange collapse and one wallet-drain scam" : "Review and revoke old token approvals on any wallet you use",
    ],
  });

  if (a.goal === "investing" || a.interest !== "tech") {
    plan.push({
      week: week++,
      title: "Market structure & risk",
      items: [
        "Study volatility, liquidity, and market cap in the glossary",
        "Run the risk laboratory with three different configurations",
        a.risk === "high" ? "Write down your personal maximum-loss rule and position-size rule" : "Read the strategy cards, including every risk section",
      ],
    });
  }

  plan.push({
    week: week++,
    title: "Paper portfolio practice",
    items: [
      "Build a virtual portfolio in the simulator and journal every decision",
      "Trigger a −25% market shock and write down how it felt and what it cost",
      a.time === "5h" ? "Run the simulator for the full week; review your history log at the end" : "Check your simulated portfolio twice this week — no more",
    ],
  });

  if (a.interest === "tech" || a.interest === "both") {
    plan.push({
      week: week++,
      title: "Deeper technology",
      items: [
        "Study consensus, layer 2, bridges, and oracles in the glossary",
        "Read one blockchain's official documentation introduction",
        "Trace a real transaction on a public block explorer",
      ],
    });
  }

  if (a.risk === "high" && a.experience === "active") {
    plan.push({
      week: week++,
      title: "Advanced risk literacy",
      items: [
        "Study impermanent loss and liquidation mechanics until you can compute both",
        "Post-mortem one DeFi exploit: what failed, who paid",
        "Draft your personal custody plan: what lives where, and why",
      ],
    });
  }

  plan.push({
    week: week,
    title: "Review & decide",
    items: [
      "Re-run the questionnaire — has your risk understanding changed?",
      "Research tax and reporting rules in your jurisdiction",
      "Only now decide whether real money is appropriate — and how little to start with",
    ],
  });

  return plan;
}

function planToText(plan: ReturnType<typeof buildPlan>): string {
  const lines = [
    "NEXORA — Personal learning plan",
    "Educational content only. Not financial advice.",
    "",
    ...plan.flatMap((p) => [`Week ${p.week}: ${p.title}`, ...p.items.map((i) => `  - ${i}`), ""]),
  ];
  return lines.join("\n");
}

export function LearningPlan() {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const toast = useToast();

  const q = QUESTIONS[step];
  const plan = useMemo(() => (done ? buildPlan(answers) : []), [done, answers]);

  const answer = (optionId: string) => {
    const next = { ...answers, [q.id]: optionId };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else setDone(true);
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setDone(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(planToText(plan));
      toast("Plan copied to clipboard.", "success");
    } catch {
      toast("Couldn't access the clipboard — use Download instead.", "warn");
    }
  };

  const download = () => {
    const blob = new Blob([planToText(plan)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nexora-learning-plan.txt";
    link.click();
    URL.revokeObjectURL(url);
    toast("Plan downloaded.", "success");
  };

  return (
    <SectionShell>
      <Reveal>
        <Eyebrow>10 · Personal learning plan</Eyebrow>
        <SectionTitle sub="Five questions. In return: a study plan matched to your experience, time, and goals — built entirely on your device.">
          A curriculum with your name on it
        </SectionTitle>
      </Reveal>

      <Reveal className="glass glow-line mx-auto max-w-3xl rounded-3xl p-6 md:p-10">
        {!done ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-mute">
                Question {step + 1} of {QUESTIONS.length}
              </span>
              <div className="flex gap-1.5" aria-hidden>
                {QUESTIONS.map((_, i) => (
                  <span key={i} className={cn("h-1 w-8 rounded-full transition-colors", i <= step ? "bg-cyan" : "bg-line/60")} />
                ))}
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: tokens.ease }}
              >
                <h3 className="font-display text-xl font-semibold md:text-2xl">{q.text}</h3>
                <div className="mt-6 space-y-2.5">
                  {q.options.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => answer(o.id)}
                      className="w-full rounded-2xl border border-line/60 bg-surface/40 px-5 py-3.5 text-left text-sm transition-all hover:border-cyan/50 hover:bg-cyan/5"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {step > 0 && (
                  <button onClick={() => setStep(step - 1)} className="mt-5 text-sm text-mute transition-colors hover:text-ink">
                    ← Back
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: tokens.ease }}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                <GraduationCap className="h-5 w-5 text-cyan" aria-hidden />
                Your {plan.length}-week plan
              </h3>
              <div className="flex gap-2">
                <button onClick={copy} className="flex items-center gap-1.5 rounded-full border border-line/60 px-3.5 py-2 text-xs text-mute transition-colors hover:border-cyan/50 hover:text-cyan">
                  <Copy className="h-3.5 w-3.5" aria-hidden /> Copy
                </button>
                <button onClick={download} className="flex items-center gap-1.5 rounded-full bg-cyan px-3.5 py-2 text-xs font-medium text-bg">
                  <Download className="h-3.5 w-3.5" aria-hidden /> Download .txt
                </button>
              </div>
            </div>
            <ol className="space-y-4">
              {plan.map((p, i) => (
                <motion.li
                  key={p.week}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.45, ease: tokens.ease }}
                  className="rounded-2xl border border-line/50 bg-surface/30 p-5"
                >
                  <h4 className="font-display text-sm font-semibold">
                    <span className="mr-2 font-mono text-xs text-cyan">Week {p.week}</span>
                    {p.title}
                  </h4>
                  <ul className="mt-2 space-y-1.5">
                    {p.items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-mute">
                        <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.li>
              ))}
            </ol>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-wider text-mute/70">
              A study plan, not investment advice. No asset here is a recommendation.
            </p>
            <button onClick={restart} className="mt-4 flex items-center gap-1.5 text-sm text-mute transition-colors hover:text-ink">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Start over
            </button>
          </motion.div>
        )}
      </Reveal>
    </SectionShell>
  );
}
