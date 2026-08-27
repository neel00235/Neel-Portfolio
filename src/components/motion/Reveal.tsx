'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DUR, STAGGER } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

export type RevealVariant =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'scale'
  | 'mask'
  | 'clip'
  | 'fade';

interface RevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  stagger?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'span' | 'li';
}

export function Reveal({
  children,
  variant = 'up',
  delay = 0,
  duration = DUR.base,
  stagger = STAGGER.sibling,
  className = '',
  as: Component = 'div',
}: RevealProps) {
  const elRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // Respect reduced motion: leave element visible at rest without creating ScrollTrigger
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let fromVars: gsap.TweenVars = { opacity: 0 };
    let toVars: gsap.TweenVars = { opacity: 1 };

    switch (variant) {
      case 'up':
        fromVars = { opacity: 0, y: 44 };
        toVars = { opacity: 1, y: 0 };
        break;
      case 'down':
        fromVars = { opacity: 0, y: -44 };
        toVars = { opacity: 1, y: 0 };
        break;
      case 'left':
        fromVars = { opacity: 0, x: 52 };
        toVars = { opacity: 1, x: 0 };
        break;
      case 'right':
        fromVars = { opacity: 0, x: -52 };
        toVars = { opacity: 1, x: 0 };
        break;
      case 'scale':
        fromVars = { opacity: 0, scale: 0.94 };
        toVars = { opacity: 1, scale: 1 };
        break;
      case 'mask':
        fromVars = { y: '110%' };
        toVars = { y: '0%' };
        break;
      case 'clip':
        fromVars = { clipPath: 'inset(0 100% 0 0)' };
        toVars = { clipPath: 'inset(0 0% 0 0)' };
        break;
      case 'fade':
      default:
        fromVars = { opacity: 0 };
        toVars = { opacity: 1 };
        break;
    }

    const ctx = gsap.context(() => {
      // Check if animating direct children (stagger) or the element itself
      const targets = el.children.length > 1 && stagger > 0 ? Array.from(el.children) : el;

      gsap.fromTo(
        targets,
        fromVars,
        {
          ...toVars,
          duration,
          delay,
          stagger: el.children.length > 1 ? stagger : 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [variant, delay, duration, stagger]);

  return (
    <Component
      ref={elRef as any}
      className={`will-change-[transform,opacity] ${
        variant === 'mask' ? 'overflow-hidden' : ''
      } ${className}`}
    >
      {children}
    </Component>
  );
}
