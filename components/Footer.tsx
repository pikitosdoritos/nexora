"use client";

import { Github, Mail, MessageCircle } from "lucide-react";
import { NetworkField } from "@/components/animations/NetworkField";
import { Reveal } from "@/components/animations/Reveal";
import { MagneticButton } from "@/components/ui/primitives";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** The story closes where it opened: the network, now fully illuminated. */
export function Footer() {
  const reduced = useReducedMotion();
  const scrollTop = () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });

  return (
    <footer className="relative overflow-hidden border-t border-line/40">
      <NetworkField integrity={1} illumination={1} density={60} className="absolute inset-0 h-full w-full opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg/60 to-bg" aria-hidden />

      <div className="relative mx-auto max-w-wrap px-5 py-24 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan">The network, illuminated</p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight md:text-5xl">
            You started outside the system.
            <br />
            <span className="text-gradient">Now you can see how it works.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-mute md:text-base">
            Understand the system before you enter the market. Whether you ever put in a single dollar is
            your decision — the point is that it will now be an informed one.
          </p>
          <div className="mt-8 flex justify-center">
            <MagneticButton onClick={scrollTop}>Revisit the system</MagneticButton>
          </div>
        </Reveal>

        <div className="mt-20 grid gap-10 border-t border-line/40 pt-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-lg font-semibold tracking-[0.18em]">NEXORA</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-mute">
              NEXORA provides educational content and simulations only. It does not provide financial,
              investment, legal, or tax advice. Cryptocurrency involves significant risk, including the
              possible loss of all invested funds.
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-mute">Site</p>
            <ul className="space-y-2 text-sm">
              {["Privacy", "Terms", "Data sources", "Contact"].map((l) => (
                <li key={l}>
                  <a href="#top" className="text-mute transition-colors hover:text-cyan">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-mute">Elsewhere</p>
            <div className="flex gap-3">
              {[
                { icon: Github, label: "GitHub (placeholder)" },
                { icon: MessageCircle, label: "Community (placeholder)" },
                { icon: Mail, label: "Email (placeholder)" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#top"
                  aria-label={label}
                  className="rounded-full border border-line/60 p-2.5 text-mute transition-colors hover:border-cyan/50 hover:text-cyan"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
            <p className="mt-4 font-mono text-[10px] text-mute/70">
              Market data: CoinGecko public API when reachable; labelled demo data otherwise.
            </p>
          </div>
        </div>

        <p className="mt-10 border-t border-line/40 pt-6 text-center font-mono text-[11px] text-mute/60">
          © {new Date().getFullYear()} NEXORA — Understand the system before you enter the market.
        </p>
      </div>
    </footer>
  );
}
