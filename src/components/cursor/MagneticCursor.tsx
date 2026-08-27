'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export function MagneticCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [cursorState, setCursorState] = useState<string>('default');
  const [isVisible, setIsVisible] = useState(false);
  const [label, setLabel] = useState<string>('');

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isPointerFine = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isPointerFine || prefersReducedMotion) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Use gsap.quickSetter for write-only high-performance positioning
    const setDotX = gsap.quickSetter(dot, 'x', 'px');
    const setDotY = gsap.quickSetter(dot, 'y', 'px');
    const setRingX = gsap.quickSetter(ring, 'x', 'px');
    const setRingY = gsap.quickSetter(ring, 'y', 'px');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      mouseX = e.clientX;
      mouseY = e.clientY;
      setDotX(mouseX);
      setDotY(mouseY);

      // Check nearest element with data-cursor
      const target = (e.target as HTMLElement)?.closest('[data-cursor]') as HTMLElement | null;
      if (target) {
        const val = target.getAttribute('data-cursor') || 'default';
        setCursorState(val.toLowerCase());
        setLabel(val);
      } else {
        const interactive = (e.target as HTMLElement)?.closest('a, button, input, textarea');
        if (interactive) {
          setCursorState('hover');
          setLabel('');
        } else {
          setCursorState('default');
          setLabel('');
        }
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Smooth interpolation for outer ring
    let reqId: number;
    const updateRing = () => {
      const dt = 0.22;
      ringX += (mouseX - ringX) * dt;
      ringY += (mouseY - ringY) * dt;
      setRingX(ringX);
      setRingY(ringY);
      reqId = requestAnimationFrame(updateRing);
    };
    reqId = requestAnimationFrame(updateRing);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(reqId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const isExpanded = cursorState !== 'default' && cursorState !== 'hover';

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {/* Inner precise dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full bg-terracotta transition-opacity duration-200 ${
          isExpanded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Outer context ring & badge */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 flex items-center justify-center -ml-5 -mt-5 rounded-full border border-terracotta/40 bg-terracotta/10 backdrop-blur-[1px] transition-all duration-300 ${
          isExpanded
            ? 'w-16 h-16 -ml-8 -mt-8 bg-terracotta text-ground font-mono text-[0.62rem] font-bold tracking-widest uppercase border-transparent shadow-xl'
            : cursorState === 'hover'
            ? 'w-12 h-12 -ml-6 -mt-6 border-terracotta/80 scale-110'
            : 'w-10 h-10 -ml-5 -mt-5'
        }`}
      >
        {isExpanded && <span className="select-none">{label}</span>}
      </div>
    </div>
  );
}
