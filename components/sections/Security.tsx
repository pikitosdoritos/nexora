"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Fingerprint, MailWarning, ShieldCheck, X } from "lucide-react";
import { phishingScenarios } from "@/data/content";
import { Eyebrow, SectionShell, SectionTitle } from "@/components/ui/primitives";
import { Reveal } from "@/components/animations/Reveal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import { tokens } from "@/lib/tokens";

const CHECKLIST = [
  { id: "passwords", label: "Unique password for every crypto account", why: "One leaked reused password becomes the key to everything else." },
  { id: "manager", label: "Password manager in daily use", why: "Humans can't remember 40 strong passwords. Software can." },
  { id: "2fa", label: "App-based two-factor authentication", why: "SMS codes can be stolen through SIM swaps; authenticator apps can't." },
  { id: "hardware", label: "Hardware wallet for meaningful holdings", why: "Keys that never touch the internet can't be stolen over it." },
  { id: "seed", label: "Seed phrase on paper or metal, offline, never photographed", why: "A phrase in cloud storage is a phrase waiting to be found." },
  { id: "verify", label: "Full address verification before every send", why: "Malware swaps addresses in your clipboard. Check the whole string, not the first four characters." },
  { id: "test", label: "Small test transaction before any large transfer", why: "A $2 mistake teaches the same lesson as a $20,000 one." },
  { id: "approvals", label: "Wallet approvals reviewed and revoked regularly", why: "Old unlimited approvals let a compromised contract drain you months later." },
  { id: "phishing", label: "Can identify phishing patterns on sight", why: "Urgency + secrets + lookalike domain is the entire playbook. Learn it once." },
  { id: "support", label: "Never trust unsolicited 'support'", why: "Real support never messages you first and never asks for a phrase." },
  { id: "device", label: "Dedicated or clean device for crypto activity", why: "Every extension and download on a machine shares its fate." },
  { id: "updates", label: "OS, browser, and wallet software kept updated", why: "Most successful attacks exploit holes that were already patched." },
];

function Checklist() {
  const { value: done, set: setDone, hydrated } = useLocalStorage<string[]>("nexora-security", []);
  const pct = hydrated ? Math.round((done.length / CHECKLIST.length) * 100) : 0;

  const toggle = (id: string) =>
    setDone((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <Reveal className="glass glow-line rounded-3xl p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
          <ShieldCheck className="h-5 w-5 text-cyan" aria-hidden />
          Your security posture
        </h3>
        <div className="flex items-center gap-3">
          <div className="h-2 w-36 overflow-hidden rounded-full bg-surface">
            <motion.div
              className={cn("h-full rounded-full", pct > 75 ? "bg-rise" : pct > 40 ? "bg-amber-300" : "bg-fall")}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: tokens.ease }}
            />
          </div>
          <span className="font-mono text-xs text-mute">{pct}%</span>
        </div>
      </div>
      <ul className="grid gap-2 md:grid-cols-2">
        {CHECKLIST.map((item) => {
          const checked = done.includes(item.id);
          return (
            <li key={item.id}>
              <button
                onClick={() => toggle(item.id)}
                aria-pressed={checked}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                  checked ? "border-rise/40 bg-rise/5" : "border-line/50 bg-surface/30 hover:border-line"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    checked ? "border-rise bg-rise text-bg" : "border-line"
                  )}
                >
                  {checked && <Check className="h-3.5 w-3.5" />}
                </span>
                <span>
                  <span className={cn("block text-sm font-medium", checked && "text-rise")}>{item.label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-mute">{item.why}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Reveal>
  );
}

function PhishingChallenge() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<null | boolean>(null);
  const [scoreCount, setScore] = useState({ right: 0, total: 0 });
  const scenario = phishingScenarios[index];
  const finished = scoreCount.total === phishingScenarios.length && answer === null;

  const respond = (saysScam: boolean) => {
    if (answer !== null) return;
    setAnswer(saysScam);
    setScore((s) => ({ right: s.right + (saysScam === scenario.isScam ? 1 : 0), total: s.total + 1 }));
  };

  const next = () => {
    setAnswer(null);
    setIndex((i) => Math.min(i + 1, phishingScenarios.length - 1));
  };

  const restart = () => {
    setIndex(0);
    setAnswer(null);
    setScore({ right: 0, total: 0 });
  };

  const correct = answer !== null && answer === scenario.isScam;

  return (
    <Reveal className="glass mt-6 rounded-3xl p-6 md:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
          <MailWarning className="h-5 w-5 text-amber-300" aria-hidden />
          Real or scam?
        </h3>
        <span className="font-mono text-xs text-mute">
          {index + 1}/{phishingScenarios.length} · {scoreCount.right} correct
        </span>
      </div>

      {finished ? (
        <div className="rounded-2xl border border-line/50 bg-bg/40 p-8 text-center">
          <p className="font-display text-2xl font-semibold">
            {scoreCount.right}/{phishingScenarios.length} identified correctly
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-mute">
            {scoreCount.right === phishingScenarios.length
              ? "Perfect. Keep that skepticism — scammers only need you to be tired once."
              : "Every miss here is free. Outside, each one costs everything in the wallet. Run it again."}
          </p>
          <button onClick={restart} className="mt-5 rounded-full bg-cyan px-5 py-2.5 text-sm font-medium text-bg">
            Try again
          </button>
        </div>
      ) : (
        <>
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: tokens.ease }}
            className="rounded-2xl border border-line/50 bg-bg/50 p-5"
          >
            <p className="font-mono text-[11px] uppercase tracking-wider text-mute">{scenario.channel}</p>
            <p className="mt-1 text-sm font-medium">{scenario.from}</p>
            <p className="mt-3 border-l-2 border-line pl-4 text-sm leading-relaxed text-ink/85">{scenario.body}</p>
          </motion.div>

          {answer === null ? (
            <div className="mt-5 flex gap-3">
              <button onClick={() => respond(false)} className="flex-1 rounded-xl border border-rise/50 bg-rise/10 px-4 py-3 text-sm font-medium text-rise transition-colors hover:bg-rise/20">
                Looks legitimate
              </button>
              <button onClick={() => respond(true)} className="flex-1 rounded-xl border border-fall/50 bg-fall/10 px-4 py-3 text-sm font-medium text-fall transition-colors hover:bg-fall/20">
                It&rsquo;s a scam
              </button>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mt-5 rounded-2xl border p-5",
                  correct ? "border-rise/40 bg-rise/5" : "border-fall/40 bg-fall/5"
                )}
              >
                <p className={cn("flex items-center gap-2 text-sm font-semibold", correct ? "text-rise" : "text-fall")}>
                  {correct ? <Check className="h-4 w-4" aria-hidden /> : <X className="h-4 w-4" aria-hidden />}
                  {correct ? "Correct." : "Not quite."} This message is {scenario.isScam ? "a scam" : "legitimate"}.
                </p>
                {scenario.flags.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {scenario.flags.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-mute">
                        <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-fall" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-sm leading-relaxed text-mute">{scenario.explanation}</p>
                {index < phishingScenarios.length - 1 ? (
                  <button onClick={next} className="mt-4 rounded-full bg-cyan px-5 py-2 text-sm font-medium text-bg">
                    Next message
                  </button>
                ) : (
                  <button onClick={() => setAnswer(null)} className="mt-4 rounded-full bg-cyan px-5 py-2 text-sm font-medium text-bg">
                    See your result
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </>
      )}

      <p className="mt-6 flex items-start gap-2 border-t border-line/40 pt-4 text-xs leading-relaxed text-mute">
        <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden />
        NEXORA will never ask for a real password, private key, seed phrase, wallet connection, or any personal
        financial information — here or anywhere else. Anyone who does is not helping you.
      </p>
    </Reveal>
  );
}

export function Security() {
  return (
    <SectionShell id="security">
      <Reveal>
        <Eyebrow>08 · Security</Eyebrow>
        <SectionTitle sub="In crypto, you are your own bank — which means you are also your own security department. This checklist is the job description.">
          Defense is a habit, not a product
        </SectionTitle>
      </Reveal>
      <Checklist />
      <PhishingChallenge />
    </SectionShell>
  );
}
