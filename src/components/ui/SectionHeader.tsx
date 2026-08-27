'use client';

import React from 'react';
import { SplitText } from '@/components/motion/SplitText';
import { Reveal } from '@/components/motion/Reveal';

interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center';
}

export function SectionHeader({
  label,
  title,
  subtitle,
  className = '',
  align = 'left',
}: SectionHeaderProps) {
  const isCenter = align === 'center';

  return (
    <div
      className={`flex flex-col gap-3 mb-10 ${
        isCenter ? 'items-center text-center' : 'items-start text-left'
      } ${className}`}
    >
      {/* 1. Mono label, letter-spacing: .42em, uppercase, --muted, followed by inline SVG ✦ */}
      <Reveal variant="fade">
        <div className="flex items-center gap-2.5 font-mono text-label uppercase text-muted tracking-[0.42em]">
          <span>{label}</span>
          <svg
            className="w-2.5 h-2.5 text-terracotta inline-block"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>
      </Reveal>

      {/* 2. Display heading, Fraunces WONK 1, per-character reveal */}
      <h2 className="font-display font-black text-big md:text-huge text-cream tracking-tight font-variation-wonk">
        <SplitText text={title} by="char" />
      </h2>

      {/* 3. A one-line --cream-2 subtitle at --t-lead */}
      {subtitle && (
        <Reveal variant="up" delay={0.08}>
          <p className="font-sans text-lead text-cream-2/80 max-w-prose leading-relaxed">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
