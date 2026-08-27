'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, ArrowUpRight } from 'lucide-react';
import { HERO } from '@/data/content';
import { STATS } from '@/data/portfolio.generated';
import { Magnetic } from '@/components/cursor/Magnetic';

export function Hero() {
  return (
    <section
      id="about"
      className="relative w-full min-h-[100svh] pt-28 pb-20 px-6 md:px-12 flex flex-col justify-center overflow-hidden border-b border-line"
    >
      <div className="max-w-shell mx-auto w-full">
        {/* Top Kicker */}
        <div className="flex items-center gap-3 font-mono text-label text-muted tracking-widest uppercase mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulseDot" />
          <span>{HERO.kicker}</span>
        </div>

        {/* 3-Plane Parallax Hero Stack */}
        <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Typography & Lead Copy */}
          <div className="lg:col-span-7 z-20 flex flex-col">
            {/* Script Signature Accent */}
            <span className="font-script text-cream/90 text-[clamp(3.5rem,8vw,7.5rem)] leading-none select-none -mb-4 drop-shadow-sm">
              {HERO.signature}
            </span>

            {/* Display Mega Wordmark */}
            <h1 className="font-display font-black text-mega text-cream uppercase tracking-tight leading-[0.88] mb-6">
              NEEL PATEL
            </h1>

            {/* Role Header */}
            <div className="flex items-center gap-3 font-mono text-terracotta text-label uppercase tracking-[0.24em] font-semibold mb-6">
              <span>{HERO.rolePrefix}</span>
              <span className="text-muted">{HERO.roleDot}</span>
              <span>{HERO.roleSuffix}</span>
            </div>

            {/* Verbatim Lead Paragraph */}
            <p className="font-serif text-lead text-cream/90 leading-relaxed mb-8 max-w-xl">
              I&apos;m a video editor specialised in{' '}
              <span className="text-terracotta font-medium italic">colour grading</span> and{' '}
              <span className="text-kraft font-medium italic">story-driven edits</span> — turning raw
              footage into visuals that don&apos;t just get watched, they get{' '}
              <span className="font-script text-2xl text-cream">felt</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Magnetic strength={0.3} cursor={HERO.ctaPrimary.cursor}>
                <a
                  href={HERO.ctaPrimary.href}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-terracotta hover:bg-[#ff8838] text-ground font-mono text-label font-bold tracking-widest uppercase shadow-lg transition-all duration-200"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{HERO.ctaPrimary.text}</span>
                </a>
              </Magnetic>

              <Magnetic strength={0.3} cursor={HERO.ctaSecondary.cursor}>
                <a
                  href={HERO.ctaSecondary.href}
                  className="flex items-center gap-2 px-6 py-3 rounded-full border border-line hover:border-cream text-cream font-mono text-label tracking-widest uppercase transition-all duration-200"
                >
                  <span>{HERO.ctaSecondary.text}</span>
                  <ArrowUpRight className="w-4 h-4 text-muted" />
                </a>
              </Magnetic>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-6 border-t border-line-2">
              {HERO.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-ground-2 border border-line-2 font-mono text-[0.66rem] text-muted tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Editorial Portrait Collage & Specs */}
          <div className="lg:col-span-5 z-10 flex flex-col gap-6">
            <figure className="relative w-full aspect-[4/5] rounded-lg overflow-hidden border border-line-2 bg-ground-2 shadow-2xl group">
              <Image
                src="/portrait/neel-collage.webp"
                alt={HERO.portraitAlt}
                fill
                priority
                className="object-cover w-full h-full filter saturate-90 contrast-105 group-hover:scale-102 transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ground/90 via-transparent to-transparent" />
              <figcaption className="absolute bottom-4 inset-x-4 font-mono text-[0.64rem] tracking-[0.2em] text-cream/90 uppercase flex justify-between items-center">
                <span>{HERO.collageFigcaption}</span>
                <span className="text-terracotta">AHM // IND</span>
              </figcaption>
            </figure>

            {/* Verified Specs Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-ground-2/80 border border-line-2 font-mono text-[0.68rem]">
              {HERO.specs.map((spec) => (
                <div key={spec.label} className="flex flex-col gap-1">
                  <span className="text-muted tracking-widest uppercase">{spec.label}</span>
                  <span className="text-cream font-medium flex items-center gap-1.5">
                    {spec.hasDot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Derived Stats Bar */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-lg bg-ground-2/80 border border-line-2 font-mono text-center">
              <div className="flex flex-col">
                <span className="font-display text-2xl font-black text-cream">{STATS.edits}</span>
                <span className="text-[0.62rem] text-muted tracking-wider uppercase">EDITS IN REEL</span>
              </div>
              <div className="flex flex-col border-x border-line-2">
                <span className="font-display text-2xl font-black text-cream">{STATS.categories}</span>
                <span className="text-[0.62rem] text-muted tracking-wider uppercase">DISCIPLINES</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-black text-terracotta">4+</span>
                <span className="text-[0.62rem] text-muted tracking-wider uppercase">YEARS ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Editorial Body Prose (Verbatim B5, B6, B7) */}
        <div className="mt-16 pt-12 border-t border-line grid grid-cols-1 md:grid-cols-3 gap-8 font-sans text-body text-cream/70 leading-relaxed">
          <p>{HERO.body1}</p>
          <p>{HERO.body2}</p>
          <p>{HERO.body3}</p>
        </div>
      </div>
    </section>
  );
}
