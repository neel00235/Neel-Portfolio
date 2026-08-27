// src/lib/motion.ts — THE single source of truth for all timing
export const EASE = {
  out: 'cubic-bezier(0.16, 1, 0.30, 1)', // entrances — fast start, long glide
  io: 'cubic-bezier(0.65, 0.05, 0.36, 1)', // reversible state changes — ease in AND out
  soft: 'cubic-bezier(0.40, 0.00, 0.20, 1)', // micro-interactions
} as const;

export const DUR = {
  fast: 0.18, // hover, chips, icon swaps
  base: 0.42, // reveals, section entrances
  slow: 0.80, // tone transitions, curtain, pins
  epic: 1.40, // scrollTo, route transitions
} as const;

export const STAGGER = { sibling: 0.06, character: 0.022 } as const;
