/**
 * Motion tokens: the ONLY place durations, easings and spring configs are defined.
 * Source: docs/MOTION.md §2
 */
export const ease = {
  outExpo: [0.16, 1, 0.3, 1] as const, // entrances, reveals (default)
  inOutQuart: [0.76, 0, 0.24, 1] as const, // page curtain, menu, clip-path wipes
  outQuint: [0.22, 1, 0.36, 1] as const, // hovers
  linear: [0, 0, 1, 1] as const, // scroll-linked values
};

export const dur = {
  xs: 0.14,
  sm: 0.28,
  md: 0.45,
  lg: 0.7,
  xl: 1.0,
} as const;

export const spring = {
  soft: { type: "spring", stiffness: 120, damping: 20, mass: 0.8 }, // cursor followers
  snappy: { type: "spring", stiffness: 380, damping: 32 }, // buttons, toggles
  layout: { type: "spring", stiffness: 260, damping: 30 }, // shared-element
} as const;

export const stagger = {
  chars: 0.018,
  words: 0.06,
  items: 0.08,
  cards: 0.11,
} as const;

export const viewportConfig = {
  once: true,
  margin: "0px 0px -12% 0px",
  amount: 0.2,
} as const;
