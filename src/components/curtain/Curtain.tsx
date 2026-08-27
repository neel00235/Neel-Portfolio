'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { playSound } from '@/lib/sound';

export function Curtain() {
  const [mounted, setMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showRgbSplit, setShowRgbSplit] = useState(false);
  const [showScanline, setShowScanline] = useState(false);
  const [counter, setCounter] = useState(0);
  const [preloaderDone, setPreloaderDone] = useState(false);

  const topLeafRef = useRef<HTMLDivElement>(null);
  const bottomLeafRef = useRef<HTMLDivElement>(null);
  const curtainContentRef = useRef<HTMLDivElement>(null);
  const isDismissingRef = useRef(false);

  // R-3: Real signals preloader (document.fonts.ready + hero poster + DOMContentLoaded)
  useEffect(() => {
    // Check reduced motion & repeat visit first
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasPlayed = sessionStorage.getItem('neel_curtain_played') === 'true';

    if (prefersReducedMotion || hasPlayed) {
      setIsDismissed(true);
      setMounted(true);
      return;
    }

    setMounted(true);

    let currentVal = 0;
    const startTime = performance.now();

    /*
      Weighted, order-independent progress signals.

      Each signal contributes its weight exactly once, whether it resolves or
      rejects, and targetVal is recomputed from the set of settled signals. That
      makes progress a pure function of WHICH signals have landed rather than the
      order they land in -- the previous mix of Math.max() for fonts and += for
      the others meant a fast-settling poster swallowed the font weight and the
      counter stalled at 65% until the hard cap rescued it.
    */
    const WEIGHTS = { fonts: 0.45, poster: 0.45, dom: 0.1 } as const;
    type Signal = keyof typeof WEIGHTS;
    const settled = new Set<Signal>();
    const BASELINE = 0.1; // so the counter starts moving immediately
    let targetVal = BASELINE;

    const settle = (name: Signal) => {
      if (settled.has(name)) return;
      settled.add(name);
      let earned = 0;
      settled.forEach((k) => {
        earned += WEIGHTS[k];
      });
      // earned tops out at 1.0, so a full sweep lands exactly on 1.
      targetVal = Math.min(1, BASELINE + earned * (1 - BASELINE));
    };

    // Signal 1: Fonts ready (45%)
    const onFonts = () => settle('fonts');
    if (document.fonts) {
      document.fonts.ready.then(onFonts).catch(onFonts);
    } else {
      onFonts();
    }

    // Signal 2: Hero portrait decode (45%).
    // Must be the same asset the hero actually renders (Hero.tsx portrait collage)
    // or the preloader is gating on a file the browser never paints.
    const poster = new Image();
    poster.src = '/portrait/neel-collage.webp';
    const onPoster = () => settle('poster');
    if (poster.decode) {
      poster.decode().then(onPoster).catch(onPoster);
    } else {
      poster.addEventListener('load', onPoster, { once: true });
      poster.addEventListener('error', onPoster, { once: true });
    }

    // Signal 3: DOMContentLoaded (10%)
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      settle('dom');
    } else {
      window.addEventListener('DOMContentLoaded', () => settle('dom'), { once: true });
    }

    // Ticker with 1,800ms hard cap
    let animId: number;
    const tick = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed >= 1800) {
        targetVal = 1;
      }

      // Smoothly ease toward target value
      currentVal += (targetVal - currentVal) * 0.12;
      const displayVal = Math.min(100, Math.floor(currentVal * 100));
      setCounter(displayVal);

      if (displayVal >= 100 || (targetVal >= 1 && currentVal >= 0.98)) {
        setCounter(100);
        setPreloaderDone(true);
      } else {
        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);

    // bfcache restore handler
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setIsDismissed(true);
      }
    };
    window.addEventListener('pageshow', onPageShow);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  // Dismiss function
  const dismissCurtain = () => {
    if (isDismissingRef.current || isDismissed) return;
    isDismissingRef.current = true;
    sessionStorage.setItem('neel_curtain_played', 'true');
    playSound('reveal');

    // R-5: 240ms RGB split glitch at the moment of break
    setShowRgbSplit(true);
    setTimeout(() => setShowRgbSplit(false), 240);

    // R-4: Scanline sweep across the curtain
    setShowScanline(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsDismissed(true);
      },
    });

    if (topLeafRef.current) {
      tl.to(
        topLeafRef.current,
        {
          yPercent: -100,
          duration: 0.85,
          ease: 'power3.inOut',
        },
        0
      );
    }

    if (bottomLeafRef.current) {
      tl.to(
        bottomLeafRef.current,
        {
          yPercent: 100,
          duration: 0.85,
          ease: 'power3.inOut',
        },
        0
      );
    }

    if (curtainContentRef.current) {
      tl.to(
        curtainContentRef.current,
        {
          opacity: 0,
          duration: 0.35,
          ease: 'power2.out',
        },
        0
      );
    }
  };

  // Listeners for dismissal: scroll, click, Escape
  useEffect(() => {
    if (!mounted || isDismissed) return;

    const onScroll = () => {
      if (window.scrollY > 15) {
        dismissCurtain();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (['Escape', ' ', 'Enter', 'ArrowDown'].includes(e.key)) {
        dismissCurtain();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mounted, isDismissed]);

  // If not mounted or already dismissed, render nothing (no flash on repeat visit)
  if (!mounted || isDismissed) return null;

  return (
    <div
      onClick={dismissCurtain}
      tabIndex={0}
      role="dialog"
      aria-label="Cinematic Curtain Preloader"
      className="fixed inset-0 select-none cursor-pointer overflow-hidden"
      style={{ zIndex: 'var(--z-curtain, 90)' }}
    >
      {/* R-4: One scanline sweep on curtain open */}
      {showScanline && (
        <div className="absolute inset-0 pointer-events-none z-50 animate-scanline bg-gradient-to-b from-transparent via-terracotta/20 to-transparent h-24 w-full" />
      )}

      {/* Top Leaf (Height 50svh, with SVG Mask Knockout) */}
      <div
        ref={topLeafRef}
        className={`absolute top-0 inset-x-0 h-[50svh] overflow-hidden will-change-transform ${
          showRgbSplit ? 'animate-rgbSplit' : ''
        }`}
      >
        <svg
          className="w-full h-full block"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMax slice"
        >
          <defs>
            <mask id="matte-knockout-top">
              {/* White makes the leaf visible */}
              <rect width="1200" height="600" fill="white" />
              {/* Black text cuts out letterforms through to background */}
              <text
                x="600"
                y="600"
                textAnchor="middle"
                dominantBaseline="central"
                fill="black"
                fontSize="112"
                fontWeight="900"
                letterSpacing="10"
                style={{
                  fontFamily: 'var(--font-fraunces), Fraunces, serif',
                  fontVariationSettings: "'WONK' 1",
                }}
              >
                NEEL PATEL
              </text>
            </mask>
          </defs>
          <rect
            width="1200"
            height="600"
            fill="#13100c"
            mask="url(#matte-knockout-top)"
          />
        </svg>

        {/* Top Leaf Metadata UI */}
        <div
          ref={curtainContentRef}
          className="absolute top-8 inset-x-0 px-6 md:px-12 flex justify-between items-center font-mono text-label text-muted tracking-widest uppercase pointer-events-none"
        >
          <span className="text-terracotta font-semibold">✦ PORTFOLIO 2026</span>
          <span className="text-xs">AHMEDABAD // INDIA</span>
        </div>
      </div>

      {/* Bottom Leaf (Height 50svh, with SVG Mask Knockout) */}
      <div
        ref={bottomLeafRef}
        className={`absolute bottom-0 inset-x-0 h-[50svh] overflow-hidden will-change-transform ${
          showRgbSplit ? 'animate-rgbSplit' : ''
        }`}
      >
        <svg
          className="w-full h-full block"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMin slice"
        >
          <defs>
            <mask id="matte-knockout-bottom">
              {/* White makes the leaf visible */}
              <rect width="1200" height="600" fill="white" />
              {/* Black text cuts out letterforms through to background */}
              <text
                x="600"
                y="0"
                textAnchor="middle"
                dominantBaseline="central"
                fill="black"
                fontSize="112"
                fontWeight="900"
                letterSpacing="10"
                style={{
                  fontFamily: 'var(--font-fraunces), Fraunces, serif',
                  fontVariationSettings: "'WONK' 1",
                }}
              >
                NEEL PATEL
              </text>
            </mask>
          </defs>
          <rect
            width="1200"
            height="600"
            fill="#13100c"
            mask="url(#matte-knockout-bottom)"
          />
        </svg>

        {/* Bottom Leaf UI & Real-Signal Preloader Counter */}
        <div className="absolute bottom-10 inset-x-0 px-6 flex flex-col items-center gap-4 text-center pointer-events-none">
          {/* R-3: 000 -> 100 Tabular Mono Numerals */}
          <div className="flex items-center gap-3 font-mono">
            <span className="text-2xl md:text-3xl font-bold tracking-widest tabular-nums text-cream">
              {String(counter).padStart(3, '0')}
            </span>
            <span className="text-terracotta text-sm">/ 100</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-terracotta text-label uppercase tracking-[0.3em] font-semibold">
              {preloaderDone ? 'READY · SCROLL OR CLICK TO ENTER' : 'LOADING REEL ASSETS'}
            </span>
            <span className="font-mono text-[0.62rem] text-muted tracking-widest uppercase">
              PRESS ESCAPE OR CLICK ANYWHERE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
