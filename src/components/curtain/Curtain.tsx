'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CURTAIN } from '@/data/content';
import { playSound } from '@/lib/sound';

export function Curtain() {
  const [progress, setProgress] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const openCurtain = () => {
    if (isDismissed) return;
    setIsDismissed(true);
    playSound('reveal');

    const startTime = performance.now();
    const startProgress = progressRef.current;
    const duration = 750; // 750ms silky smooth ease out

    const step = (now: number) => {
      const elapsed = (now - startTime) / duration;
      if (elapsed < 1) {
        // Smooth hardware cubic ease-out: 1 - (1 - t)^3
        const ease = 1 - Math.pow(1 - elapsed, 3);
        const nextP = startProgress + (1 - startProgress) * ease;
        progressRef.current = nextP;
        setProgress(nextP);
        rafRef.current = requestAnimationFrame(step);
      } else {
        progressRef.current = 1;
        setProgress(1);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsDismissed(true);
      setProgress(1);
      return;
    }

    const onWheel = (e: WheelEvent) => {
      if (isDismissed) return;
      if (e.deltaY > 0) {
        const next = Math.min(1, progressRef.current + e.deltaY * 0.0025);
        progressRef.current = next;
        setProgress(next);
        if (next >= 0.8) {
          openCurtain();
        }
      }
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDismissed) return;
      const currentY = e.touches[0].clientY;
      const delta = touchStartY - currentY;
      touchStartY = currentY;
      if (delta > 0) {
        const next = Math.min(1, progressRef.current + delta * 0.004);
        progressRef.current = next;
        setProgress(next);
        if (next >= 0.8) {
          openCurtain();
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'Space', 'Enter', 'Escape'].includes(e.key)) {
        openCurtain();
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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isDismissed]);

  if (isDismissed && progress >= 1) return null;

  const topTranslate = -progress * 102;
  const bottomTranslate = progress * 102;
  const contentOpacity = Math.max(0, 1 - progress * 1.5);
  const badgeScale = 1 - progress * 0.2;

  return (
    <div
      onClick={openCurtain}
      className={`fixed inset-0 z-50 overflow-hidden select-none cursor-pointer ${
        isDismissed ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      aria-hidden={isDismissed}
    >
      {/* Top Rectangle (Translates Upwards on Scroll) */}
      <div
        className="absolute top-0 inset-x-0 h-1/2 bg-[#13100c] border-b border-terracotta/40 shadow-2xl flex flex-col justify-between pt-8 px-6 md:px-12 will-change-transform"
        style={{
          transform: `translate3d(0, ${topTranslate}%, 0)`,
          transition: isDismissed ? 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
        }}
      >
        <div
          className="w-full max-w-shell mx-auto flex justify-between items-center text-muted font-mono text-label uppercase tracking-widest transition-opacity duration-200"
          style={{ opacity: contentOpacity }}
        >
          <span className="text-terracotta font-semibold">PORTFOLIO 2026</span>
          <span className="hidden sm:inline text-xs">AHMEDABAD // INDIA</span>
        </div>

        {/* Center cutout upper frame */}
        <div className="w-full flex justify-center pb-3">
          <span
            className="font-script text-cream text-[clamp(4.5rem,10vw,8.5rem)] leading-none select-none tracking-normal drop-shadow-md transition-opacity duration-200"
            style={{ opacity: contentOpacity }}
          >
            Neel Patel
          </span>
        </div>
      </div>

      {/* Center Cutout Name Badge (Sits exactly in the middle) */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center z-30 transition-all duration-300"
        style={{
          opacity: contentOpacity,
          transform: `scale(${badgeScale})`,
        }}
      >
        <div className="px-8 py-3 rounded-full bg-ground/90 backdrop-blur-md border border-terracotta/60 shadow-2xl flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulseDot" />
          <span className="font-display font-black text-cream tracking-widest text-lg sm:text-xl uppercase">
            NEEL PATEL
          </span>
          <span className="font-mono text-terracotta text-xs tracking-wider uppercase">· 2026 REEL</span>
        </div>
      </div>

      {/* Bottom Rectangle (Translates Downwards on Scroll) */}
      <div
        className="absolute bottom-0 inset-x-0 h-1/2 bg-[#13100c] border-t border-terracotta/40 shadow-2xl flex flex-col justify-between pb-8 px-6 md:px-12 will-change-transform"
        style={{
          transform: `translate3d(0, ${bottomTranslate}%, 0)`,
          transition: isDismissed ? 'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
        }}
      >
        <div
          className="w-full flex flex-col items-center justify-center pt-8 gap-2 transition-opacity duration-200"
          style={{ opacity: contentOpacity }}
        >
          <span className="font-mono text-terracotta text-label uppercase tracking-[0.28em] font-semibold">
            VIDEO EDITOR & COLOURIST
          </span>
          <p className="font-sans text-muted text-xs tracking-wide">
            Story-driven edits · Precision color · Social rhythm
          </p>
        </div>

        {/* Scroll Callout Button */}
        <div
          className="w-full flex flex-col items-center gap-2 transition-opacity duration-200"
          style={{ opacity: contentOpacity }}
        >
          <div className="w-5 h-8 rounded-full border border-terracotta/70 flex justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-terracotta animate-pulseDot" />
          </div>
          <span className="font-mono text-[0.66rem] text-terracotta tracking-[0.22em] uppercase font-bold">
            SCROLL OR CLICK TO ENTER
          </span>
        </div>
      </div>
    </div>
  );
}
