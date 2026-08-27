'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CURTAIN } from '@/data/content';
import { playSound } from '@/lib/sound';

export function Curtain() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasGlitched, setHasGlitched] = useState(false);
  const touchStartRef = useRef(0);

  const dismissCurtain = () => {
    if (isDismissed) return;
    setIsDismissed(true);
    playSound('reveal');
    setHasGlitched(true);
    setTimeout(() => setHasGlitched(false), 240);
    // Smoothly animate scroll progress to 1
    const startTime = performance.now();
    const animateOpen = (now: number) => {
      const elapsed = (now - startTime) / 600; // 600ms ease out
      if (elapsed < 1) {
        setScrollProgress((prev) => Math.max(prev, Math.min(1, elapsed * (2 - elapsed))));
        requestAnimationFrame(animateOpen);
      } else {
        setScrollProgress(1);
      }
    };
    requestAnimationFrame(animateOpen);
  };

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (isDismissed) return;
      if (e.deltaY > 0) {
        const delta = e.deltaY * 0.003;
        setScrollProgress((prev) => {
          const next = Math.min(1, Math.max(0, prev + delta));
          if (next >= 0.85 && !isDismissed) {
            dismissCurtain();
          }
          return next;
        });
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDismissed) return;
      const currentY = e.touches[0].clientY;
      const diff = (touchStartRef.current - currentY) * 0.005;
      touchStartRef.current = currentY;
      if (diff > 0) {
        setScrollProgress((prev) => {
          const next = Math.min(1, Math.max(0, prev + diff));
          if (next >= 0.85 && !isDismissed) {
            dismissCurtain();
          }
          return next;
        });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'Space', 'Enter', 'Escape'].includes(e.key)) {
        dismissCurtain();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isDismissed]);

  if (isDismissed && scrollProgress >= 1) return null;

  const topTranslate = -scrollProgress * 100;
  const bottomTranslate = scrollProgress * 100;
  const contentOpacity = Math.max(0, 1 - scrollProgress * 1.8);

  return (
    <div
      onClick={dismissCurtain}
      className={`fixed inset-0 z-50 transition-colors duration-200 cursor-pointer select-none ${
        isDismissed ? 'pointer-events-none' : 'pointer-events-auto'
      } ${hasGlitched ? 'animate-rgbSplit' : ''}`}
      aria-hidden={isDismissed}
    >
      {/* Top Bisection Leaf */}
      <div
        className="absolute top-0 inset-x-0 h-1/2 bg-[#13100c]/98 backdrop-blur-md border-b border-line shadow-2xl transition-transform ease-out will-change-transform flex flex-col justify-end items-center pb-8 overflow-hidden"
        style={{ transform: `translate3d(0, ${topTranslate}%, 0)` }}
      >
        <div className="absolute top-6 inset-x-8 flex justify-between text-muted font-mono text-label uppercase tracking-widest pointer-events-none">
          <span>{CURTAIN.topLabelLeft}</span>
          <span>{CURTAIN.topLabelRight}</span>
        </div>

        <div
          className="text-center transition-opacity duration-200"
          style={{ opacity: contentOpacity }}
        >
          <span className="font-script text-cream text-[clamp(4.5rem,11vw,9.5rem)] leading-none select-none tracking-normal block drop-shadow-lg">
            {CURTAIN.script}
          </span>
        </div>
      </div>

      {/* Bottom Bisection Leaf */}
      <div
        className="absolute bottom-0 inset-x-0 h-1/2 bg-[#13100c]/98 backdrop-blur-md border-t border-line shadow-2xl transition-transform ease-out will-change-transform flex flex-col justify-start items-center pt-8 overflow-hidden"
        style={{ transform: `translate3d(0, ${bottomTranslate}%, 0)` }}
      >
        <div
          className="flex flex-col items-center text-center gap-4 transition-opacity duration-200"
          style={{ opacity: contentOpacity }}
        >
          <p className="font-mono text-terracotta text-label uppercase tracking-[0.28em] font-semibold">
            {CURTAIN.role}
          </p>
          <p className="font-sans text-muted text-sm tracking-wide">
            {CURTAIN.subTagline}
          </p>

          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="w-5 h-8 rounded-full border border-terracotta/60 flex justify-center p-1">
              <div className="w-1 h-2 rounded-full bg-terracotta animate-pulseDot" />
            </div>
            <span className="font-mono text-[0.68rem] text-terracotta tracking-[0.2em] uppercase font-bold">
              SCROLL OR CLICK TO ENTER
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
