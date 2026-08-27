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
  strength = 0.35,
  className = '',
  onClick,
  cursor,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const dx = (e.clientX - centerX) * strength;
    const dy = (e.clientY - centerY) * strength;

    gsap.to(ref.current, {
      x: dx,
      y: dy,
      duration: 0.35,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.65,
      ease: 'elastic.out(1, 0.4)',
    });
  };

  return (
    <div
      ref={ref}
      className={`inline-block will-change-transform ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      data-cursor={cursor}
    >
      {children}
    </div>
  );
}
