# NEXORA

**Understand the system before you enter the market.**

An interactive cryptocurrency education website: a scroll-driven 3D blockchain narrative,
an animated transaction walkthrough, a ten-step beginner roadmap, honest strategy breakdowns
with a DCA calculator and comparison tool, a $10,000 paper-trading simulator with market-shock
drills, a risk laboratory with a collapsing network visualization, a security checklist with a
phishing-detection challenge, a 30-term glossary, and a generated personal learning plan.

Education and simulation only — never financial advice.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build && npm start
```

## Stack

Next.js 14 (App Router) · React 18 · TypeScript (strict) · Tailwind CSS ·
GSAP ScrollTrigger · Framer Motion · React Three Fiber / Three.js · Recharts · Lucide.

## Architecture

```
app/                  layout, page, global styles + theme variables
components/
  sections/           one component per site section
  three/HeroScene     the signature 3D network (lazy-loaded, ssr:false)
  animations/         Reveal, WordReveal, AnimatedNumber, NetworkField (2D canvas)
  ui/                 primitives (buttons, badges, section shells), toast system
services/market.ts    CoinGecko integration, isolated; resolves to labelled demo data on failure
hooks/                useLocalStorage (SSR-safe), useReducedMotion
data/                 glossary, roadmap, strategies, phishing scenarios, demo market data
lib/                  design/animation tokens, utilities
types/                shared interfaces
```

## Behaviour notes

- **Live vs demo data.** The market section tries the free CoinGecko API; on any failure it
  falls back to demo data and shows a "Demo data" label. Nothing breaks offline.
- **Persistence.** Roadmap progress, the security checklist, theme choice, and the full
  simulator state live in `localStorage`.
- **Motion.** `prefers-reduced-motion` disables the 3D morph, marquee, pulses, and reveals.
  The 3D scene drops to a lighter node count and DPR 1 on mobile, and pauses rendering
  when scrolled out of view.
- **Themes.** Toggle between *Deep Space* and *Midnight Blue* in the navbar; applied before
  paint via an inline script to avoid flashes.
- **Fonts** load at runtime from Google Fonts (`optimizeFonts` is off so the project builds
  with no network access).

## Disclaimer

NEXORA provides educational content and simulations only. It does not provide financial,
investment, legal, or tax advice. Cryptocurrency involves significant risk, including the
possible loss of all invested funds.
