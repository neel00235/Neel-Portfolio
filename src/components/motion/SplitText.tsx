'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DUR, STAGGER } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

interface SplitTextProps {
  text: string;
  by?: 'char' | 'word';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'p' | 'div';
  className?: string;
  delay?: number;
}

export function SplitText({
  text,
  by,
  as: Component = 'span',
  className = '',
  delay = 0,
}: SplitTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  
  // Decide granularity: display headings get per-character (22ms); over 3 words defaults to word (40ms) unless explicitly specified
  const words = text.split(' ');
  const mode = by || (words.length > 3 ? 'word' : 'char');
  const staggerDuration = mode === 'char' ? STAGGER.character : 0.04;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const targets = el.querySelectorAll('.split-unit');
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        {
          opacity: 0,
          y: '110%',
        },
        {
          opacity: 1,
          y: '0%',
          duration: DUR.base,
          ease: 'power3.out',
          stagger: staggerDuration,
          delay,
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
  }, [mode, delay, staggerDuration]);

  // SSR-Safe Span Emission: spans emitted during render, aria-label with raw string, white-space: pre for spaces
  return (
    <Component
      ref={containerRef as any}
      className={`inline-block ${className}`}
      aria-label={text}
    >
      <span aria-hidden="true" className="inline-block">
        {mode === 'char'
          ? words.map((word, wordIdx) => (
              <span key={wordIdx} className="inline-block whitespace-nowrap">
                {Array.from(word).map((char, charIdx) => (
                  <span
                    key={charIdx}
                    className="inline-block overflow-hidden align-top"
                  >
                    <span className="split-unit inline-block will-change-transform">
                      {char}
                    </span>
                  </span>
                ))}
                {wordIdx < words.length - 1 && (
                  <span className="inline-block" style={{ whiteSpace: 'pre' }}>
                    {' '}
                  </span>
                )}
              </span>
            ))
          : words.map((word, wordIdx) => (
              <span key={wordIdx} className="inline-block">
                <span className="inline-block overflow-hidden align-top">
                  <span className="split-unit inline-block will-change-transform">
                    {word}
                  </span>
                </span>
                {wordIdx < words.length - 1 && (
                  <span className="inline-block" style={{ whiteSpace: 'pre' }}>
                    {' '}
                  </span>
                )}
              </span>
            ))}
      </span>
    </Component>
  );
}
