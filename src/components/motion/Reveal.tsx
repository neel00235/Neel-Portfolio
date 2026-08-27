'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: React.ReactNode;
  variant?: 'up' | 'scale' | 'fade';
  delay?: number;
  className?: string;
}

export function Reveal({
  children,
  variant = 'up',
  delay = 0,
  className = '',
}: RevealProps) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let fromVars: gsap.TweenVars = { opacity: 0 };
    if (variant === 'up') {
      fromVars = { opacity: 0, y: 38 };
    } else if (variant === 'scale') {
      fromVars = { opacity: 0, scale: 0.95 };
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        fromVars,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
            once: true,
          },
        }
      );
    }, elRef);

    return () => ctx.revert();
  }, [variant, delay]);

  return (
    <div ref={elRef} className={`will-change-[transform,opacity] ${className}`}>
      {children}
    </div>
  );
}
