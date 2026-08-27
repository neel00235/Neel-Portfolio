'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export function MagneticCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [cursorState, setCursorState] = useState<string>('default');
  const [label, setLabel] = useState<string>('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isPointerFine = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isPointerFine || prefersReducedMotion) return;

    setEnabled(true);

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Use gsap.quickSetter for write-only high-performance positioning
    const setDotX = gsap.quickSetter(dot, 'x', 'px');
    const setDotY = gsap.quickSetter(dot, 'y', 'px');
    const setRingX = gsap.quickSetter(ring, 'x', 'px');
    const setRingY = gsap.quickSetter(ring, 'y', 'px');

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let hasMoved = false;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        ringX = mouseX;
        ringY = mouseY;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
      setDotX(mouseX);
      setDotY(mouseY);

      // Check nearest element with data-cursor
      const target = (e.target as HTMLElement)?.closest('[data-cursor]') as HTMLElement | null;
      if (target) {
        const val = target.getAttribute('data-cursor') || 'default';
        setCursorState(val.toLowerCase());
        setLabel(val);
      } else {
        const interactive = (e.target as HTMLElement)?.closest('a, button, input, textarea, [role="button"]');
        if (interactive) {
          setCursorState('hover');
          setLabel('');
        } else {
          setCursorState('default');
          setLabel('');
        }
      }
    };

    const onMouseLeave = () => {
      if (dot) dot.style.opacity = '0';
      if (ring) ring.style.opacity = '0';
    };

    const onMouseEnter = () => {
      if (dot) dot.style.opacity = '1';
      if (ring) ring.style.opacity = '1';
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Smooth interpolation for outer ring
    let reqId: number;
    const updateRing = () => {
      const dt = 0.18;
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
  }, []);

  if (!enabled) return null;

  const isExpanded = cursorState !== 'default' && cursorState !== 'hover';

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {/* Inner precise dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full bg-terracotta opacity-0 transition-opacity duration-200 ${
          isExpanded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Outer context ring & badge */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 flex items-center justify-center -ml-5 -mt-5 rounded-full border border-terracotta/50 bg-terracotta/10 backdrop-blur-[1px] opacity-0 transition-all duration-300 ${
          isExpanded
            ? 'w-16 h-16 -ml-8 -mt-8 bg-terracotta text-ground font-mono text-[0.62rem] font-bold tracking-widest uppercase border-transparent shadow-xl scale-100'
            : cursorState === 'hover'
            ? 'w-12 h-12 -ml-6 -mt-6 border-terracotta/90 scale-110 bg-terracotta/20'
            : 'w-10 h-10 -ml-5 -mt-5'
        }`}
      >
        {isExpanded && <span className="select-none">{label}</span>}
      </div>
    </div>
  );
}
