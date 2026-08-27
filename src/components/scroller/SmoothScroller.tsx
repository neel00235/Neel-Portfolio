'use client';

import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LenisContext, useLenis } from '@/lib/lenis';

export { useLenis };

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollerProps {
  children: React.ReactNode;
}

export function SmoothScroller({ children }: SmoothScrollerProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect reduced motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const instance = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
    });
    lenisRef.current = instance;
    setLenis(instance);
    if (typeof window !== 'undefined') {
      (window as unknown as { __lenis?: Lenis }).__lenis = instance;
    }

    // Connect Lenis with GSAP ScrollTrigger
    instance.on('scroll', ScrollTrigger.update);

    const updateTicker = (time: number) => {
      instance.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    // R-17: Scroll-velocity coupling
    const velTween = gsap.to({}, {
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const rawVel = self.getVelocity();
          const normalized = Math.min(1, Math.abs(rawVel) / 2500);
          document.documentElement.style.setProperty('--vel', normalized.toFixed(3));
          const skew = Math.max(-3, Math.min(3, rawVel / 750));
          document.documentElement.style.setProperty('--scroll-skew', `${skew.toFixed(2)}deg`);
        },
      },
    });

    // Precise programmatic anchor scrolling within +-2px
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href) return;

      if (href.startsWith('#') || (href.startsWith('/#') && window.location.pathname === '/')) {
        const hash = href.startsWith('/#') ? href.slice(2) : href.slice(1);
        const el = document.getElementById(hash);
        if (el) {
          e.preventDefault();
          instance.scrollTo(el, { offset: 0, duration: 1.2 });
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      velTween.scrollTrigger?.kill();
      gsap.ticker.remove(updateTicker);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>
      <div className="relative w-full">{children}</div>
    </LenisContext.Provider>
  );
}
