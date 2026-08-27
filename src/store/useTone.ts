import { create } from 'zustand';

const DEFAULT_TONE = '#f67c29'; // Terracotta target accent

interface ToneState {
  activeTone: string;
  setTone: (tone: string) => void;
  resetTone: () => void;
}

export const useTone = create<ToneState>((set) => ({
  activeTone: DEFAULT_TONE,
  setTone: (tone) => set({ activeTone: tone }),
  resetTone: () => set({ activeTone: DEFAULT_TONE }),
}));

export function hexToRgb(hex: string): [number, number, number] {
  if (!hex || !hex.startsWith('#')) return [246, 124, 41];
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return [246, 124, 41];
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

// Relative luminance per WCAG 2.1 specification
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Contrast ratio between two relative luminances
function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Fix D-12: Compare true WCAG contrast against cream and ground; pick the winner
export function readableInk(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const toneLum = getLuminance(r, g, b);

  // #faf4e8 cream luminance: rgb(250, 244, 232)
  const creamLum = getLuminance(250, 244, 232);
  // #13100c ground luminance: rgb(19, 16, 12)
  const groundLum = getLuminance(19, 16, 12);

  const contrastWithCream = getContrastRatio(toneLum, creamLum);
  const contrastWithGround = getContrastRatio(toneLum, groundLum);

  return contrastWithCream >= contrastWithGround ? '#faf4e8' : '#13100c';
}
