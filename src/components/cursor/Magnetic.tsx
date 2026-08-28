'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  onClick?: () => void;
  cursor?: string;
}

export function Magnetic({
  children,
  strength = 0.18,
  className = '',
  onClick,
  cursor,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<{ centerX: number; centerY: number } | null>(null);

  const handlePointerEnter = () => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    boundsRef.current = {
      centerX: left + width / 2,
      centerY: top + height / 2,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current || !boundsRef.current) return;
    const rawDx = (e.clientX - boundsRef.current.centerX) * strength;
    const rawDy = (e.clientY - boundsRef.current.centerY) * strength;

    // Cap magnetic displacement site-wide at 14 px (R-12)
    const dx = Math.max(-14, Math.min(14, rawDx));
    const dy = Math.max(-14, Math.min(14, rawDy));

    gsap.to(ref.current, {
      x: dx,
      y: dy,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handlePointerLeave = () => {
    boundsRef.current = null;
    if (!ref.current) return;
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  return (
    <div
      ref={ref}
      className={`inline-block ${className}`}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      data-cursor={cursor}
    >
      {children}
    </div>
  );
}
