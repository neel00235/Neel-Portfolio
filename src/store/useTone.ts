import { create } from 'zustand';

interface ToneState {
  activeTone: string;
  setTone: (tone: string) => void;
  resetTone: () => void;
}

const DEFAULT_TONE = '#f67c29'; // Terracotta target accent color

export function readableInk(hex: string): string {
  if (!hex || !hex.startsWith('#')) return '#faf4e8';
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#faf4e8';
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  // Relative luminance per ITU-R BT.709
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.45 ? '#13100c' : '#faf4e8';
}

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

export const useTone = create<ToneState>((set) => ({
  activeTone: DEFAULT_TONE,
  setTone: (tone: string) => {
    set({ activeTone: tone });
    if (typeof document !== 'undefined') {
      const [r, g, b] = hexToRgb(tone);
      document.documentElement.style.setProperty('--tone', tone);
      document.documentElement.style.setProperty('--tone-blend', `rgb(${r} ${g} ${b} / 0.16)`);
      document.documentElement.style.setProperty('--tone-ink', readableInk(tone));
    }
  },
  resetTone: () => {
    set({ activeTone: DEFAULT_TONE });
    if (typeof document !== 'undefined') {
      const [r, g, b] = hexToRgb(DEFAULT_TONE);
      document.documentElement.style.setProperty('--tone', DEFAULT_TONE);
      document.documentElement.style.setProperty('--tone-blend', `rgb(${r} ${g} ${b} / 0.16)`);
      document.documentElement.style.setProperty('--tone-ink', readableInk(DEFAULT_TONE));
    }
  },
}));
