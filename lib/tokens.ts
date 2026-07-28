/** Central design + animation tokens. Sections read from here, never hard-code. */
export const tokens = {
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  duration: { fast: 0.25, base: 0.6, slow: 1.1 },
  stagger: 0.08,
  viewportMargin: "-80px",
  colors: {
    cyan: "#52e2ff",
    violet: "#8a6cff",
    rise: "#4adea8",
    fall: "#ff6b7a",
    mute: "#8b93a8",
    line: "#2c3452",
  },
} as const;

export const sectionIds = [
  { id: "learn", label: "Learn" },
  { id: "roadmap", label: "Roadmap" },
  { id: "strategies", label: "Strategies" },
  { id: "simulator", label: "Simulator" },
  { id: "security", label: "Security" },
  { id: "glossary", label: "Glossary" },
] as const;
