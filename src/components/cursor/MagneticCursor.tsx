'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Play, Volume2 } from 'lucide-react';

export type CursorState =
  | 'default'
  | 'interactive'
  | 'play'
  | 'sound'
  | 'drag'
  | 'text'
  | 'hidden';

export function MagneticCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [label, setLabel] = useState<string>('');
  const [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    // Capability gate: (hover: hover) and (pointer: fine), no reduced motion
    const isFineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFineHover || prefersReducedMotion) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Fast write-only setters via GSAP quickSetter
    const setDotX = gsap.quickSetter(dot, 'x', 'px');
    const setDotY = gsap.quickSetter(dot, 'y', 'px');
    const setRingX = gsap.quickSetter(ring, 'x', 'px');
    const setRingY = gsap.quickSetter(ring, 'y', 'px');

    let targetX = -100;
    let targetY = -100;
    let ringX = -100;
    let ringY = -100;
    let hasMoved = false;

    const resolveElementState = (target: HTMLElement | null): { state: CursorState; label: string } => {
      if (!target) return { state: 'default', label: '' };

      // 1. Hidden: over full player or iframes
      if (target.closest('[data-cursor="hidden"], iframe, .vimeo-player, [data-player]')) {
        return { state: 'hidden', label: '' };
      }

      // 2. Play state
      const playTarget = target.closest('[data-cursor="play"], [data-cursor="Play"], [data-playable], .video-card');
      if (playTarget) {
        return { state: 'play', label: 'PLAY' };
      }

      // 3. Sound state
      const soundTarget = target.closest('[data-cursor="sound"], [data-cursor="Sound"], [data-audio-toggle]');
      if (soundTarget) {
        return { state: 'sound', label: 'SOUND' };
      }

      // 4. Drag state
      const dragTarget = target.closest('[data-cursor="drag"], [data-cursor="↔"], [data-rail]');
      if (dragTarget) {
        return { state: 'drag', label: '↔' };
      }

      // 5. Explicit data-cursor
      const cursorAttrEl = target.closest('[data-cursor]') as HTMLElement | null;
      if (cursorAttrEl) {
        const val = (cursorAttrEl.getAttribute('data-cursor') || '').trim();
        const lower = val.toLowerCase();
        if (lower === 'play') return { state: 'play', label: 'PLAY' };
        if (lower === 'sound') return { state: 'sound', label: 'SOUND' };
        if (lower === 'drag' || lower === '↔') return { state: 'drag', label: '↔' };
        if (lower === 'text') return { state: 'text', label: '' };
        if (lower === 'hidden') return { state: 'hidden', label: '' };
        return { state: 'interactive', label: val };
      }

      // 6. Text elements (headings, paragraphs, prose)
      const textTarget = target.closest('p, h1, h2, h3, h4, h5, h6, blockquote, .prose');
      const isButtonOrLink = target.closest('a, button, input, textarea, select, [role="button"]');
      if (textTarget && !isButtonOrLink) {
        return { state: 'text', label: '' };
      }

      // 7. Interactive HTML elements
      if (isButtonOrLink || target.closest('label, [tabindex]')) {
        return { state: 'interactive', label: '' };
      }

      // Default
      return { state: 'default', label: '' };
    };

    const activateCursor = () => {
      if (!hasMoved) {
        hasMoved = true;
        ringX = targetX;
        ringY = targetY;
        document.documentElement.classList.add('cursor-active');
        document.documentElement.style.cursor = 'none';
        setActive(true);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      activateCursor();

      setDotX(targetX);
      setDotY(targetY);

      const res = resolveElementState(e.target as HTMLElement | null);
      setCursorState(res.state);
      setLabel(res.label);

      // Handle hidden cursor override
      if (res.state === 'hidden') {
        document.documentElement.style.cursor = 'auto';
      } else if (hasMoved) {
        document.documentElement.style.cursor = 'none';
      }
    };

    const onPointerDown = () => {
      if (ring) {
        gsap.to(ring, { scale: 0.88, duration: 0.15, ease: 'power2.out' });
      }
    };

    const onPointerUp = () => {
      if (ring) {
        gsap.to(ring, { scale: 1, duration: 0.22, ease: 'power2.out' });
      }
    };

    const onPointerLeave = () => {
      if (dot) dot.style.opacity = '0';
      if (ring) ring.style.opacity = '0';
    };

    const onPointerEnter = () => {
      if (hasMoved) {
        if (dot) dot.style.opacity = '1';
        if (ring) ring.style.opacity = '1';
      }
    };

    // Focus parity for keyboard users
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
      activateCursor();

      setDotX(targetX);
      setDotY(targetY);

      const res = resolveElementState(target);
      setCursorState(res.state);
      setLabel(res.label);
    };

    const onFocusOut = () => {
      setCursorState('default');
      setLabel('');
    };

    // Hook GSAP unified ticker (lerp: 0.18 per R-39)
    const updateRing = () => {
      if (!hasMoved) return;
      const lerpFactor = 0.18;
      ringX += (targetX - ringX) * lerpFactor;
      ringY += (targetY - ringY) * lerpFactor;
      setRingX(ringX);
      setRingY(ringY);
    };

    gsap.ticker.add(updateRing);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('pointerenter', onPointerEnter);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);

    // Provide programmatic testing bridge on window
    if (typeof window !== 'undefined') {
      (window as unknown as {
        __setCursorState?: (s: CursorState, l?: string) => void;
        __getCursorState?: () => { state: CursorState; label: string };
      }).__setCursorState = (s: CursorState, l: string = '') => {
        setCursorState(s);
        setLabel(l);
        if (s === 'hidden') {
          document.documentElement.style.cursor = 'auto';
        } else {
          document.documentElement.style.cursor = 'none';
        }
      };
      (window as unknown as {
        __getCursorState?: () => { state: CursorState; label: string };
      }).__getCursorState = () => ({ state: cursorState, label });
    }

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('pointerenter', onPointerEnter);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      gsap.ticker.remove(updateRing);
      document.documentElement.classList.remove('cursor-active');
      document.documentElement.style.cursor = '';
    };
  }, []);

  // Compute state-based styles
  const isHidden = cursorState === 'hidden' || !active;
  const isPlay = cursorState === 'play';
  const isSound = cursorState === 'sound';
  const isDrag = cursorState === 'drag';
  const isText = cursorState === 'text';
  const isInteractive = cursorState === 'interactive';

  // Ring geometry: the box is FIXED at the largest state (88px) and never changes.
  // Size differences are expressed as a scale on the inner circle, so no state change
  // ever transitions width/height/margin (transform + opacity law).
  const RING_BASE = 88;
  let ringPx = 32; // default ring diameter
  let ringBorderPx = 1;
  let ringSkin = 'border-terracotta/40 bg-transparent';
  let ringOpacity = 0.6;
  let labelClass = '';
  let dotClass = 'w-1.5 h-1.5 -ml-[3px] -mt-[3px] bg-cream rounded-full opacity-100';

  if (isPlay || isSound) {
    ringPx = 88;
    ringBorderPx = 0;
    ringSkin = 'border-transparent bg-terracotta shadow-2xl';
    ringOpacity = 1;
    labelClass = 'text-ground font-mono font-bold text-[0.68rem] tracking-wider uppercase';
    dotClass = 'opacity-0';
  } else if (isDrag) {
    ringPx = 72;
    ringBorderPx = 2;
    ringSkin = 'border-kraft bg-ground/85';
    ringOpacity = 1;
    labelClass = 'text-kraft font-mono text-base font-bold';
    dotClass = 'opacity-0';
  } else if (isInteractive) {
    ringPx = 64;
    ringBorderPx = 1;
    ringSkin = 'border-kraft bg-kraft/15 mix-blend-difference';
    ringOpacity = 1;
    labelClass =
      'text-kraft font-mono text-[0.62rem] tracking-widest uppercase font-bold text-center px-1';
    dotClass = 'w-1 h-1 -ml-0.5 -mt-0.5 bg-cream rounded-full opacity-80';
  } else if (isText) {
    ringPx = 22;
    ringBorderPx = 0;
    ringSkin = 'border-transparent bg-transparent';
    ringOpacity = 0;
    dotClass = 'w-0.5 h-0.5 -ml-[1px] -mt-[1px] bg-cream rounded-full opacity-50';
  }

  const ringScale = ringPx / RING_BASE;
  // Counter-scale the stroke so a 1px border still reads as 1px once the circle is scaled down.
  const compensatedBorder = ringBorderPx ? `${(ringBorderPx / ringScale).toFixed(2)}px` : '0px';

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden select-none"
      style={{ zIndex: 'var(--z-cursor)' }}
      aria-hidden="true"
    >
      {/* Precision inner dot */}
      <div
        ref={dotRef}
        data-cursor-dot
        className={`fixed top-0 left-0 transition-opacity duration-150 pointer-events-none ${
          isHidden ? 'opacity-0' : dotClass
        }`}
      />

      {/*
        Outer interactive context ring.
        GSAP owns this element's transform exclusively (x / y / press scale).
        The box is a fixed 88px so nothing here ever triggers layout.
      */}
      <div
        ref={ringRef}
        data-cursor-ring
        className="fixed top-0 left-0 w-[88px] h-[88px] -ml-[44px] -mt-[44px] pointer-events-none flex items-center justify-center"
      >
        {/* The visible circle: scaled, never resized. */}
        <div
          data-cursor-circle
          className={`absolute inset-0 rounded-full border transition-[transform,background-color,border-color,opacity] duration-200 ${ringSkin}`}
          style={{
            transform: `scale(${ringScale})`,
            borderWidth: compensatedBorder,
            opacity: isHidden ? 0 : ringOpacity,
          }}
        />

        {/* The label sits outside the scaled circle so its type stays at full size. */}
        <div
          className={`relative flex items-center justify-center gap-1 transition-opacity duration-200 ${labelClass} ${
            isHidden ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {isPlay && (
            <>
              <Play className="w-4 h-4 fill-current text-ground" />
              <span>PLAY</span>
            </>
          )}
          {isSound && (
            <>
              <Volume2 className="w-4 h-4 text-ground" />
              <span>SOUND</span>
            </>
          )}
          {isDrag && <span>↔</span>}
          {isInteractive && label && <span className="truncate max-w-[56px]">{label}</span>}
        </div>
      </div>
    </div>
  );
}
