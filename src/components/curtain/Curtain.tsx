'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CURTAIN } from '@/data/content';
import { useLenis } from '@/lib/lenis';
import type Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const LOADING_LABEL = 'LOADING REEL ASSETS';
const MAX_LOAD_MS = 2600;

export function Curtain() {
  const [mounted, setMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);

  const topLeafRef = useRef<HTMLDivElement>(null);
  const bottomLeafRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const lenisFromContext = useLenis();

  // Check reduced motion & mount
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      document.documentElement.dataset.curtain = 'off';
      const spacer = document.querySelector('[data-curtain-runway]') as HTMLElement | null;
      if (spacer) {
        spacer.dataset.curtain = 'off';
        spacer.style.height = '0px';
      }
      return;
    }

    setMounted(true);

    // Hide server-rendered backdrop once real leaves exist
    const backdrop = document.querySelector('[data-curtain-backdrop]') as HTMLElement | null;
    if (backdrop) backdrop.style.display = 'none';
  }, []);

  // 4a, 4b, 4c: Progress Model, Hard Timeout, and Scroll Lock
  useEffect(() => {
    if (!mounted) return;

    // Helper to get active Lenis instance per 4c
    const getLenis = (): Lenis | null => {
      if (lenisFromContext) return lenisFromContext;
      if (typeof window !== 'undefined') {
        return (window as unknown as { __lenis?: Lenis }).__lenis ?? null;
      }
      return null;
    };

    // 4c: Lock, in this order:
    // 1. scrollRestoration = 'manual'
    // 2. scrollTo(0, 0)
    // 3. lenis?.stop()
    // 4. documentElement.style.overflow = 'hidden'
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const initialLenis = getLenis();
    initialLenis?.stop();
    document.documentElement.style.overflow = 'hidden';

    let isUnlocked = false;
    const progressSignals = {
      fonts: false,
      doc: false,
      leadFilm: false,
    };

    const target = { val: 0 };
    const tweenObj = { val: 0 };

    const updateProgressTarget = () => {
      let nextTarget = 0;
      if (progressSignals.fonts) nextTarget += 0.35;
      if (progressSignals.doc) nextTarget += 0.35;
      if (progressSignals.leadFilm) nextTarget += 0.30;

      // If all three landed, go to 1
      if (progressSignals.fonts && progressSignals.doc && progressSignals.leadFilm) {
        nextTarget = 1;
      }

      // Monotonic: never decrease
      if (nextTarget > target.val) {
        target.val = nextTarget;
        gsap.to(tweenObj, {
          val: target.val,
          duration: 0.45,
          ease: 'power1.out',
          onUpdate: () => {
            const currentRatio = tweenObj.val;
            setDisplayProgress(Math.min(100, Math.round(currentRatio * 100)));
            if (progressBarRef.current) {
              progressBarRef.current.style.transform = `scaleX(${currentRatio})`;
            }
          },
          onComplete: () => {
            if (target.val >= 1 && !isUnlocked) {
              finishLoader();
            }
          },
        });
      }
    };

    const finishLoader = () => {
      if (isUnlocked) return;
      isUnlocked = true;

      setDisplayProgress(100);
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = 'scaleX(1)';
      }

      // Unlock per 4c:
      // 1. overflow = ''
      // 2. lenis?.start()
      // 3. setIsReady(true) to create ScrollTrigger scrub
      // 4. ScrollTrigger.refresh()
      document.documentElement.style.overflow = '';
      const activeLenis = getLenis();
      activeLenis?.start();

      setIsReady(true);
    };

    // 4b: 2600ms hard timeout cap
    const timeoutId = window.setTimeout(() => {
      if (!isUnlocked) {
        target.val = 1;
        finishLoader();
      }
    }, MAX_LOAD_MS);

    // Signal 1: document.fonts.ready (0.35)
    if (document.fonts) {
      document.fonts.ready.then(() => {
        progressSignals.fonts = true;
        updateProgressTarget();
      }).catch(() => {
        progressSignals.fonts = true;
        updateProgressTarget();
      });
    } else {
      progressSignals.fonts = true;
      updateProgressTarget();
    }

    // Signal 2: document.readyState === 'complete' or load event (0.35)
    if (document.readyState === 'complete') {
      progressSignals.doc = true;
      updateProgressTarget();
    } else {
      const handleLoad = () => {
        progressSignals.doc = true;
        updateProgressTarget();
      };
      window.addEventListener('load', handleLoad, { once: true });
    }

    // Signal 3: 'portfolio:leadfilm-ready' window event (0.30)
    const handleLeadFilmReady = () => {
      progressSignals.leadFilm = true;
      updateProgressTarget();
    };
    window.addEventListener('portfolio:leadfilm-ready', handleLeadFilmReady, { once: true });

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('portfolio:leadfilm-ready', handleLeadFilmReady);
      document.documentElement.style.overflow = '';
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
      const activeLenis = getLenis();
      activeLenis?.start();
    };
  }, [mounted, lenisFromContext]);

  // 4d: ScrollTrigger progressive scroll-scrubbed reveal (armed only after unlock)
  useEffect(() => {
    if (!mounted || !isReady) return;

    const ctx = gsap.context(() => {
      const scrubTl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: () => `+=${window.innerHeight}`,
          scrub: true,
        },
      });

      // Drive only yPercent on the two leaves (0 -> -100 and 0 -> 100)
      if (topLeafRef.current) {
        scrubTl.to(topLeafRef.current, { yPercent: -100, ease: 'none', duration: 1 }, 0);
      }
      if (bottomLeafRef.current) {
        scrubTl.to(bottomLeafRef.current, { yPercent: 100, ease: 'none', duration: 1 }, 0);
      }
    });

    // 4c: Refresh ScrollTrigger once after scrub creation
    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, [mounted, isReady]);

  if (!mounted) return null;

  return createPortal(
    <div
      data-curtain-portal
      className="fixed inset-0 select-none pointer-events-none overflow-hidden"
      style={{ zIndex: 'var(--z-curtain, 90)' }}
    >
      {/* Top Leaf (Height 50svh, Orange Band #f67c29 splitting up) */}
      <div
        ref={topLeafRef}
        className="absolute top-0 inset-x-0 h-[50svh] overflow-hidden bg-terracotta"
      >
        {/* Top half of the wordmark in MBF Taurian. The wrapper is anchored to the seam and
            nudged down half its own height, so the glyphs are centred exactly on
            the split and this leaf's overflow-hidden keeps only their top half. */}
        <div className="absolute bottom-0 inset-x-0 translate-y-1/2 flex justify-center pointer-events-none">
          <span
            className="font-taurian text-ground text-[clamp(3.4rem,12vw,10.5rem)] tracking-tight uppercase leading-[0.8] whitespace-nowrap"
          >
            {CURTAIN.wordmark}
          </span>
        </div>
      </div>

      {/* Bottom Leaf (Height 50svh, Orange Band #f67c29 splitting down) */}
      <div
        ref={bottomLeafRef}
        className="absolute bottom-0 inset-x-0 h-[50svh] overflow-hidden bg-terracotta"
      >
        {/* Bottom half of the same wordmark at the same seam-centred position — not
            a mirror. Pulled up half its height so this leaf's overflow-hidden keeps
            only the lower half; the two leaves compose one wordmark that tears apart. */}
        <div className="absolute top-0 inset-x-0 -translate-y-1/2 flex justify-center pointer-events-none">
          <span
            className="font-taurian text-ground text-[clamp(3.4rem,12vw,10.5rem)] tracking-tight uppercase leading-[0.8] whitespace-nowrap"
          >
            {CURTAIN.wordmark}
          </span>
        </div>

        {/* Bottom Leaf UI: Progress Readout while loading -> Rotating Badge when ready */}
        <div className="absolute bottom-10 inset-x-0 flex flex-col items-center justify-center pointer-events-none px-6">
          {!isReady ? (
            <div className="flex flex-col items-center gap-2">
              <span className="font-mono text-[0.68rem] tracking-[0.28em] text-ground/80 uppercase font-semibold">
                {LOADING_LABEL}
              </span>
              <div className="flex items-baseline gap-1 font-mono text-ground">
                <span className="text-3xl sm:text-4xl font-bold tracking-wider tabular-nums">
                  {String(displayProgress).padStart(3, '0')}
                </span>
                <span className="text-xs tracking-widest text-ground/60 uppercase">/ 100</span>
              </div>
              {/* Thin progress bar */}
              <div className="w-36 sm:w-48 h-0.5 bg-ground/25 rounded-full overflow-hidden mt-1">
                <div
                  ref={progressBarRef}
                  className="w-full h-full bg-ground origin-left transition-none"
                  style={{ transform: 'scaleX(0)' }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {/* Rotating badge from CURTAIN.scrollBadgePath */}
              <div className="relative w-20 h-20 animate-spinSlow">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <path
                      id="curtain-badge-path"
                      d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                    />
                  </defs>
                  <text
                    style={{ letterSpacing: '3.29px' }}
                    className="font-mono text-[9px] fill-ground uppercase font-bold"
                  >
                    <textPath
                      href="#curtain-badge-path"
                      startOffset="0%"
                      textLength={226.19}
                      lengthAdjust="spacing"
                    >
                      {CURTAIN.scrollBadgePath}
                    </textPath>
                  </text>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-ground text-sm">↓</span>
                </div>
              </div>
              <span className="font-mono text-[0.64rem] tracking-[0.24em] text-ground/75 uppercase font-medium">
                {CURTAIN.scrollBadgeStatic}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
