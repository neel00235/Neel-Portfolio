'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { playSound } from '@/lib/sound';
import { CURTAIN } from '@/data/content';

gsap.registerPlugin(ScrollTrigger);

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
      const siteElement = document.querySelector('main') as HTMLElement | null;
      if (siteElement) {
        siteElement.style.opacity = '1';
      }
      return;
    }

    setMounted(true);

    let currentVal = 0;
    const startTime = performance.now();

    const WEIGHTS = { fonts: 0.45, poster: 0.45, dom: 0.1 } as const;
    type Signal = keyof typeof WEIGHTS;
    const settled = new Set<Signal>();
    const BASELINE = 0.1;
    let targetVal = BASELINE;

    const settle = (name: Signal) => {
      if (settled.has(name)) return;
      settled.add(name);
      let earned = 0;
      settled.forEach((k) => {
        earned += WEIGHTS[k];
      });
      targetVal = Math.min(1, BASELINE + earned * (1 - BASELINE));
    };

    // Signal 1: Fonts ready (45%)
    const onFonts = () => settle('fonts');
    if (document.fonts) {
      document.fonts.ready.then(onFonts).catch(onFonts);
    } else {
      onFonts();
    }

    // Signal 2: Hero portrait decode (45%)
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
        const siteElement = document.querySelector('main') as HTMLElement | null;
        if (siteElement) {
          siteElement.style.opacity = '1';
        }
      }
    };
    window.addEventListener('pageshow', onPageShow);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  // Dismiss function (for click, Enter, Escape)
  const dismissCurtain = () => {
    if (isDismissingRef.current || isDismissed) return;
    isDismissingRef.current = true;
    sessionStorage.setItem('neel_curtain_played', 'true');
    playSound('reveal');

    setShowRgbSplit(true);
    setTimeout(() => setShowRgbSplit(false), 240);
    setShowScanline(true);

    const siteElement = document.querySelector('main') as HTMLElement | null;

    const tl = gsap.timeline({
      onComplete: () => {
        setIsDismissed(true);
        if (siteElement) {
          gsap.set(siteElement, { opacity: 1 });
        }
      },
    });

    if (topLeafRef.current) {
      tl.to(topLeafRef.current, { yPercent: -100, duration: 0.85, ease: 'power3.inOut' }, 0);
    }
    if (bottomLeafRef.current) {
      tl.to(bottomLeafRef.current, { yPercent: 100, duration: 0.85, ease: 'power3.inOut' }, 0);
    }
    if (curtainContentRef.current) {
      tl.to(curtainContentRef.current, { opacity: 0, duration: 0.35, ease: 'power2.out' }, 0);
    }
    if (siteElement) {
      tl.to(siteElement, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.5);
    }
  };

  // 1c. ScrollTrigger progressive scroll-scrubbed reveal (Item 1c)
  useEffect(() => {
    if (!mounted || isDismissed) return;

    const siteElement = document.querySelector('main') as HTMLElement | null;
    if (siteElement) {
      gsap.set(siteElement, { opacity: 0 });
    }

    const ctx = gsap.context(() => {
      const scrubTl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: () => `+=${window.innerHeight}`,
          scrub: true,
          onLeave: () => {
            sessionStorage.setItem('neel_curtain_played', 'true');
            setIsDismissed(true);
            if (siteElement) {
              gsap.set(siteElement, { opacity: 1 });
            }
          },
        },
      });

      // Drive only yPercent on the two leaves (0 -> -100 and 0 -> 100)
      if (topLeafRef.current) {
        scrubTl.to(topLeafRef.current, { yPercent: -100, ease: 'none', duration: 1 }, 0);
      }
      if (bottomLeafRef.current) {
        scrubTl.to(bottomLeafRef.current, { yPercent: 100, ease: 'none', duration: 1 }, 0);
      }
      if (curtainContentRef.current) {
        scrubTl.to(curtainContentRef.current, { opacity: 0, ease: 'none', duration: 0.3 }, 0);
      }

      // Site behind only ramps opacity from 0 -> 1 over progress 0.8 -> 1.0
      if (siteElement) {
        scrubTl.fromTo(
          siteElement,
          { opacity: 0 },
          { opacity: 1, ease: 'none', duration: 0.2 },
          0.8
        );
      }
    });

    const onScroll = () => {
      // Passive listener maintained per specification
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (['Escape', ' ', 'Enter', 'ArrowDown'].includes(e.key)) {
        dismissCurtain();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      ctx.revert();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKeyDown);
      if (siteElement) {
        gsap.set(siteElement, { opacity: 1 });
      }
    };
  }, [mounted, isDismissed]);

  if (!mounted || isDismissed) return null;

  return createPortal(
    <div
      onClick={dismissCurtain}
      tabIndex={0}
      role="dialog"
      aria-label="Cinematic Curtain Preloader"
      className="fixed inset-0 select-none cursor-pointer overflow-hidden"
      style={{ zIndex: 'var(--z-curtain, 90)' }}
    >
      {/* 1b. Full-bleed panel in #f67c29 (terracotta) revealed as the leaves part */}
      <div className="absolute inset-0 bg-terracotta flex items-center justify-center pointer-events-none overflow-hidden">
        {/* One continuous dark wordmark, vertically centred so it lands on the split
            line and stays in exact register with the orange halves on the leaves —
            as the curtain tears, the letters read as inverting rather than shifting. */}
        <span
          className="font-display font-black text-ground text-[clamp(3.4rem,12vw,10.5rem)] tracking-tighter uppercase leading-[0.8] font-variation-wonk whitespace-nowrap select-none"
        >
          {CURTAIN.wordmark}
        </span>
      </div>

      {/* R-4: Scanline sweep across the curtain */}
      {showScanline && (
        <div className="absolute inset-0 pointer-events-none z-50 animate-scanline bg-gradient-to-b from-transparent via-terracotta/20 to-transparent h-24 w-full" />
      )}

      {/* Top Leaf (Height 50svh, Dark Band #13100c splitting up) */}
      <div
        ref={topLeafRef}
        className={`absolute top-0 inset-x-0 h-[50svh] overflow-hidden bg-ground ${
          showRgbSplit ? 'animate-rgbSplit' : ''
        }`}
      >
        {/* Top half of the wordmark. The wrapper is anchored to the seam and
            nudged down half its own height, so the glyphs are centred exactly on
            the split and this leaf's overflow-hidden keeps only their top half. */}
        <div className="absolute bottom-0 inset-x-0 translate-y-1/2 flex justify-center pointer-events-none">
          <span
            className="font-display font-black text-terracotta text-[clamp(3.4rem,12vw,10.5rem)] tracking-tighter uppercase leading-[0.8] font-variation-wonk whitespace-nowrap"
          >
            {CURTAIN.wordmark}
          </span>
        </div>

        {/* Top Leaf Metadata UI */}
        <div
          ref={curtainContentRef}
          className="absolute top-8 inset-x-0 px-6 md:px-12 flex justify-between items-center font-mono text-label text-muted tracking-widest uppercase pointer-events-none"
        >
          <span className="text-terracotta font-semibold">✦ {CURTAIN.edition}</span>
          <span className="text-xs">{CURTAIN.topLabelRight}</span>
        </div>
      </div>

      {/* Bottom Leaf (Height 50svh, Dark Band #13100c splitting down) */}
      <div
        ref={bottomLeafRef}
        className={`absolute bottom-0 inset-x-0 h-[50svh] overflow-hidden bg-ground ${
          showRgbSplit ? 'animate-rgbSplit' : ''
        }`}
      >
        {/* Bottom half of the same wordmark at the same seam-centred position — not
            a mirror. Pulled up half its height so this leaf's overflow-hidden keeps
            only the lower half; the two leaves compose one wordmark that tears apart. */}
        <div className="absolute top-0 inset-x-0 -translate-y-1/2 flex justify-center pointer-events-none">
          <span
            className="font-display font-black text-terracotta text-[clamp(3.4rem,12vw,10.5rem)] tracking-tighter uppercase leading-[0.8] font-variation-wonk whitespace-nowrap"
          >
            {CURTAIN.wordmark}
          </span>
        </div>

        {/* Bottom Leaf UI & Preloader Counter with Rotating Badge */}
        <div className="absolute bottom-10 inset-x-0 px-6 flex flex-col items-center gap-4 text-center pointer-events-none">
          {/* Rotating badge from CURTAIN.scrollBadgePath */}
          <div className="relative w-20 h-20 animate-spin-slow">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <path
                  id="curtain-badge-path"
                  d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                />
              </defs>
              <text className="font-mono text-[9px] fill-terracotta tracking-[0.2em] uppercase font-bold">
                <textPath href="#curtain-badge-path" startOffset="0%">
                  {CURTAIN.scrollBadgePath}
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-terracotta text-sm">↓</span>
            </div>
          </div>

          {/* R-3: 000 -> 100 Tabular Mono Numerals */}
          <div className="flex items-center gap-3 font-mono">
            <span className="text-2xl md:text-3xl font-bold tracking-widest tabular-nums text-cream">
              {String(counter).padStart(3, '0')}
            </span>
            <span className="text-terracotta text-sm">/ 100</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-terracotta text-label uppercase tracking-[0.3em] font-semibold">
              {preloaderDone ? CURTAIN.scrollBadgeStatic : 'LOADING REEL ASSETS'}
            </span>
            <span className="font-mono text-[0.62rem] text-muted tracking-widest uppercase">
              {CURTAIN.subTagline}
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
