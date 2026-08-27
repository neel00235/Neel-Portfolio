'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CURTAIN } from '@/data/content';
import { playSound } from '@/lib/sound';

export function Curtain() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const progressRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const dismissCurtain = () => {
    if (isDismissed) return;
    setIsDismissed(true);
    playSound('reveal');
    const start = performance.now();
    const initial = progressRef.current;
    const animate = (time: number) => {
      const elapsed = (time - start) / 600;
      if (elapsed < 1) {
        const ease = 1 - Math.pow(1 - elapsed, 3);
        const p = initial + (1 - initial) * ease;
        progressRef.current = p;
        setScrollProgress(p);
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        progressRef.current = 1;
        setScrollProgress(1);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsDismissed(true);
      setScrollProgress(1);
      return;
    }

    const onScroll = () => {
      if (isDismissed) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const threshold = window.innerHeight * 0.75;
      const p = Math.min(1, Math.max(0, scrollY / threshold));
      progressRef.current = p;
      setScrollProgress(p);
      if (p >= 0.95 && !isDismissed) {
        setIsDismissed(true);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (isDismissed) return;
      if (e.deltaY > 0) {
        const p = Math.min(1, progressRef.current + e.deltaY * 0.002);
        progressRef.current = p;
        setScrollProgress(p);
        if (p >= 0.95 && !isDismissed) {
          dismissCurtain();
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
      const diff = touchStartY - currentY;
      touchStartY = currentY;
      if (diff > 0) {
        const p = Math.min(1, progressRef.current + diff * 0.0035);
        progressRef.current = p;
        setScrollProgress(p);
        if (p >= 0.95 && !isDismissed) {
          dismissCurtain();
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'Space', 'Enter', 'Escape'].includes(e.key)) {
        dismissCurtain();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isDismissed]);

  if (isDismissed && scrollProgress >= 1) return null;

  const topTranslate = (-scrollProgress * 105).toFixed(2);
  const bottomTranslate = (scrollProgress * 105).toFixed(2);
  const contentOpacity = Math.max(0, 1 - scrollProgress * 1.6);

  return (
    <div
      onClick={dismissCurtain}
      className={`fixed inset-0 z-50 overflow-hidden select-none transition-colors duration-200 ${
        isDismissed ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      aria-hidden={isDismissed}
    >
      {/* Top Bisection Leaf */}
      <div
        className="absolute top-0 inset-x-0 h-[calc(50%+1px)] bg-[#13100c]/98 backdrop-blur-md border-b border-terracotta/40 shadow-2xl flex flex-col justify-between pt-8 overflow-hidden will-change-transform"
        style={{
          transform: `translate3d(0, ${topTranslate}%, 0)`,
          transition: isDismissed ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
        }}
      >
        <div
          className="w-full max-w-shell mx-auto px-6 md:px-12 flex justify-between items-center text-muted font-mono text-label uppercase tracking-widest pointer-events-none transition-opacity duration-200"
          style={{ opacity: contentOpacity }}
        >
          <span>{CURTAIN.topLabelLeft}</span>
          <span className="font-script text-cream text-3xl sm:text-4xl select-none tracking-normal">
            {CURTAIN.script}
          </span>
          <span>{CURTAIN.topLabelRight}</span>
        </div>

        {/* Bisected Giant Wordmark (Top Half) */}
        <div className="relative w-full overflow-hidden h-[clamp(2.5rem,8.5vw,6.5rem)] flex justify-center items-end text-center select-none">
          <span className="font-display font-black text-[clamp(4.5rem,15vw,13.5rem)] text-cream uppercase leading-[0.82] tracking-tight translate-y-[50%] select-none drop-shadow-md">
            NEEL PATEL
          </span>
        </div>
      </div>

      {/* Bottom Bisection Leaf */}
      <div
        className="absolute bottom-0 inset-x-0 h-[calc(50%+1px)] bg-[#13100c]/98 backdrop-blur-md border-t border-terracotta/40 shadow-2xl flex flex-col justify-between pb-8 overflow-hidden will-change-transform"
        style={{
          transform: `translate3d(0, ${bottomTranslate}%, 0)`,
          transition: isDismissed ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
        }}
      >
        {/* Bisected Giant Wordmark (Bottom Half) */}
        <div className="relative w-full overflow-hidden h-[clamp(2.5rem,8.5vw,6.5rem)] flex justify-center items-start text-center select-none">
          <span className="font-display font-black text-[clamp(4.5rem,15vw,13.5rem)] text-cream uppercase leading-[0.82] tracking-tight -translate-y-[50%] select-none drop-shadow-md">
            NEEL PATEL
          </span>
        </div>

        <div
          className="w-full max-w-shell mx-auto px-6 md:px-12 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left transition-opacity duration-200"
          style={{ opacity: contentOpacity }}
        >
          <div className="flex flex-col gap-1">
            <span className="font-mono text-terracotta text-label uppercase tracking-[0.24em] font-semibold">
              {CURTAIN.role}
            </span>
            <span className="font-sans text-muted text-xs tracking-wide">
              {CURTAIN.subTagline}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-5 h-8 rounded-full border border-terracotta/60 flex justify-center p-1">
              <div className="w-1 h-2 rounded-full bg-terracotta animate-pulseDot" />
            </div>
            <span className="font-mono text-[0.66rem] text-terracotta tracking-[0.2em] uppercase font-bold">
              {CURTAIN.scrollBadgeStatic}
            </span>
          </div>

          <span className="hidden sm:inline font-mono text-label text-muted/60 tracking-widest uppercase">
            {CURTAIN.edition}
          </span>
        </div>
      </div>
    </div>
  );
}
