'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CURTAIN } from '@/data/content';
import { playSound } from '@/lib/sound';

export function Curtain() {
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasGlitched, setHasGlitched] = useState(false);
  const touchStartRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    // Check session storage so curtain doesn't block returning users if already seen
    const seen = sessionStorage.getItem('neel_curtain_seen');
    if (seen === 'true') {
      setIsDismissed(true);
      setScrollProgress(1);
      return;
    }

    const onWheel = (e: WheelEvent) => {
      if (isDismissed) return;
      const delta = e.deltaY * 0.0018;
      setScrollProgress((prev) => {
        const next = Math.min(1, Math.max(0, prev + delta));
        if (next >= 0.98 && !isDismissed) {
          setIsDismissed(true);
          sessionStorage.setItem('neel_curtain_seen', 'true');
          playSound('reveal');
          setHasGlitched(true);
          setTimeout(() => setHasGlitched(false), 240);
        }
        return next;
      });
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDismissed) return;
      const currentY = e.touches[0].clientY;
      const diff = (touchStartRef.current - currentY) * 0.003;
      touchStartRef.current = currentY;
      setScrollProgress((prev) => {
        const next = Math.min(1, Math.max(0, prev + diff));
        if (next >= 0.98 && !isDismissed) {
          setIsDismissed(true);
          sessionStorage.setItem('neel_curtain_seen', 'true');
          playSound('reveal');
          setHasGlitched(true);
          setTimeout(() => setHasGlitched(false), 240);
        }
        return next;
      });
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [isDismissed]);

  if (!mounted || (isDismissed && scrollProgress >= 1)) return null;

  const topTranslate = -scrollProgress * 100;
  const bottomTranslate = scrollProgress * 100;
  const contentOpacity = Math.max(0, 1 - scrollProgress * 1.5);

  return (
    <div
      className={`fixed inset-0 z-50 pointer-events-none transition-colors duration-200 ${
        hasGlitched ? 'animate-rgbSplit' : ''
      }`}
      aria-hidden={isDismissed}
    >
      {/* Top Bisection Leaf */}
      <div
        className="absolute top-0 inset-x-0 h-1/2 bg-ground border-b border-line transition-transform ease-out will-change-transform flex flex-col justify-end items-center pb-6 overflow-hidden"
        style={{ transform: `translate3d(0, ${topTranslate}%, 0)` }}
      >
        <div className="absolute top-6 inset-x-8 flex justify-between text-muted font-mono text-label uppercase tracking-widest">
          <span>{CURTAIN.topLabelLeft}</span>
          <span>{CURTAIN.topLabelRight}</span>
        </div>

        <div
          className="text-center transition-opacity duration-150"
          style={{ opacity: contentOpacity }}
        >
          <span className="font-script text-cream text-[clamp(3.5rem,9vw,8.5rem)] leading-none select-none tracking-normal block drop-shadow-md">
            {CURTAIN.script}
          </span>
        </div>
      </div>

      {/* Bottom Bisection Leaf */}
      <div
        className="absolute bottom-0 inset-x-0 h-1/2 bg-ground border-t border-line transition-transform ease-out will-change-transform flex flex-col justify-start items-center pt-6 overflow-hidden"
        style={{ transform: `translate3d(0, ${bottomTranslate}%, 0)` }}
      >
        <div
          className="flex flex-col items-center text-center gap-4 transition-opacity duration-150"
          style={{ opacity: contentOpacity }}
        >
          <p className="font-mono text-terracotta text-label uppercase tracking-[0.28em] font-semibold">
            {CURTAIN.role}
          </p>
          <p className="font-sans text-muted text-sm tracking-wide">
            {CURTAIN.subTagline}
          </p>

          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="w-5 h-8 rounded-full border border-line flex justify-center p-1">
              <div className="w-1 h-2 rounded-full bg-terracotta animate-pulseDot" />
            </div>
            <span className="font-mono text-[0.62rem] text-muted tracking-widest uppercase">
              {CURTAIN.scrollBadgeStatic}
            </span>
          </div>
        </div>

        <div className="absolute bottom-6 font-mono text-label text-muted/60 tracking-widest uppercase">
          {CURTAIN.edition}
        </div>
      </div>
    </div>
  );
}
