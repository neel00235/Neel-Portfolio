'use client';

import { useEffect } from 'react';
import { useTone, hexToRgb, readableInk } from '@/store/useTone';

export function ToneBridge() {
  const tone = useTone((s) => s.activeTone);

  useEffect(() => {
    const [r, g, b] = hexToRgb(tone);
    const root = document.documentElement;
    root.style.setProperty('--tone', tone);
    root.style.setProperty('--tone-blend', `rgb(${r} ${g} ${b} / 0.16)`);
    root.style.setProperty('--tone-ink', readableInk(tone));
  }, [tone]);

  return null;
}
