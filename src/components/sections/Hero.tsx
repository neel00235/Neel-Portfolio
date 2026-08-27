'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Play, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { HERO } from '@/data/content';
import { STATS } from '@/data/portfolio.generated';
import { Magnetic } from '@/components/cursor/Magnetic';

function AutoplayReel({
  id,
  title,
  aspect,
  badge,
}: {
  id: string;
  title: string;
  aspect: '9:16' | '16:9';
  badge: string;
}) {
  const isVertical = aspect === '9:16';
  return (
    <div
      className={`flex flex-col gap-2 group ${
        isVertical ? 'max-w-[210px]' : 'max-w-[380px]'
      } w-full mx-auto`}
    >
      <div
        className={`relative w-full ${
          isVertical ? 'aspect-[9/16]' : 'aspect-video'
        } rounded-xl overflow-hidden border border-line-2 hover:border-terracotta transition-all duration-400 shadow-xl bg-ground-2 hover:-translate-y-2`}
      >
        <iframe
          src={`https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&muted=1&playsinline=1&autopause=0&quality=720p`}
          title={title}
          className="absolute inset-0 w-full h-full border-0 pointer-events-none"
          allow="autoplay; fullscreen; picture-in-picture"
          loading="eager"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-ground/70 via-transparent to-transparent" />
      </div>
      <div className="flex justify-between items-center font-mono text-[0.66rem] text-muted px-1">
        <span className="text-cream font-medium truncate pr-2 group-hover:text-terracotta transition-colors">
          {title}
        </span>
        <span className="text-terracotta font-semibold whitespace-nowrap">{badge}</span>
      </div>
    </div>
  );
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLElement>(null);
  const showreelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // In-animation for NEEL PATEL wordmark
      if (wordmarkRef.current) {
        gsap.fromTo(
          wordmarkRef.current,
          { opacity: 0, y: 50, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out', delay: 0.2 }
        );
      }

      // Role header in-animation
      if (roleRef.current) {
        gsap.fromTo(
          roleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.35 }
        );
      }

      // Lead bio text in-animation
      if (leadRef.current) {
        gsap.fromTo(
          leadRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.45 }
        );
      }

      // CTAs in-animation
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.55 }
        );
      }

      // Pop / slide-in spring animation for portrait collage
      if (portraitRef.current) {
        gsap.fromTo(
          portraitRef.current,
          { opacity: 0, scale: 0.9, x: 45 },
          { opacity: 1, scale: 1, x: 0, duration: 1.2, ease: 'back.out(1.4)', delay: 0.3 }
        );
      }

      // Showreel in-animation
      if (showreelRef.current) {
        gsap.fromTo(
          showreelRef.current,
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.65 }
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      id="about"
      className="relative w-full min-h-[100svh] pt-28 pb-14 px-6 md:px-12 flex flex-col justify-center overflow-hidden border-b border-line"
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
            {/* Display Mega Wordmark - Single Authoritative Title with In-Animation */}
            <h1
              ref={wordmarkRef}
              className="font-display font-black text-mega text-cream uppercase tracking-tight leading-[0.88] mb-6 drop-shadow-md will-change-transform"
            >
              NEEL PATEL
            </h1>

            {/* Role Header with In-Animation */}
            <div
              ref={roleRef}
              className="flex items-center gap-3 font-mono text-terracotta text-label uppercase tracking-[0.24em] font-semibold mb-6 will-change-transform"
            >
              <span>{HERO.rolePrefix}</span>
              <span className="text-muted">{HERO.roleDot}</span>
              <span>{HERO.roleSuffix}</span>
            </div>

            {/* Verbatim Lead Paragraph with In-Animation */}
            <p
              ref={leadRef}
              className="font-serif text-lead text-cream/90 leading-relaxed mb-8 max-w-xl will-change-transform"
            >
              I&apos;m a video editor specialised in{' '}
              <span className="text-terracotta font-medium italic">colour grading</span> and{' '}
              <span className="text-kraft font-medium italic">story-driven edits</span> — turning raw
              footage into visuals that don&apos;t just get watched, they get{' '}
              <span className="font-script text-2xl text-cream">felt</span>.
            </p>

            {/* CTAs with In-Animation */}
            <div ref={ctaRef} className="flex flex-wrap items-center gap-4 mb-8 will-change-transform">
              <Magnetic strength={0.15} cursor={HERO.ctaPrimary.cursor}>
                <a
                  href={HERO.ctaPrimary.href}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-terracotta hover:bg-[#ff8838] text-ground font-mono text-label font-bold tracking-widest uppercase shadow-lg transition-all duration-200"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{HERO.ctaPrimary.text}</span>
                </a>
              </Magnetic>

              <Magnetic strength={0.15} cursor={HERO.ctaSecondary.cursor}>
                <a
                  href={HERO.ctaSecondary.href}
                  className="flex items-center gap-2 px-6 py-3 rounded-full border border-line hover:border-cream text-cream font-mono text-label tracking-widest uppercase transition-all duration-200"
                >
                  <span>{HERO.ctaSecondary.text}</span>
                  <ArrowUpRight className="w-4 h-4 text-muted" />
                </a>
              </Magnetic>
            </div>

            {/* Tags (Tightened vertical spacing) */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-line-2">
              {HERO.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-ground-2 border border-line-2 font-mono text-[0.66rem] text-muted tracking-wider hover:border-terracotta/50 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Editorial Portrait Collage & Specs */}
          <div className="lg:col-span-5 z-10 flex flex-col gap-6">
            <figure
              ref={portraitRef}
              className="relative w-full aspect-[4/5] rounded-lg overflow-hidden border border-line-2 bg-ground-2 shadow-2xl group will-change-transform"
            >
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

        {/* Hero Showreel Autoplay Trio: 2 Vertical 9:16 Reels + 1 Widescreen 16:9 Reel */}
        <div ref={showreelRef} className="mt-12 pt-8 border-t border-line-2 flex flex-col gap-6">
          <div className="flex items-center justify-between font-mono text-label text-muted tracking-widest uppercase">
            <span className="text-terracotta font-semibold">
              ✦ FEATURED AUTOPLAY SHOWREEL · 1 MASKING + 2 MOTION EDITS
            </span>
            <span className="hidden sm:inline text-xs">LIVE PREVIEW</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-end justify-center">
            {/* 1 Masking Edit: 9:16 Vertical Reel */}
            <AutoplayReel
              id="1219762955"
              title="LJ — Masked Edit"
              aspect="9:16"
              badge="MASKING · 9:16"
            />

            {/* Motion Edit 1: 9:16 Vertical Reel */}
            <AutoplayReel
              id="1219763230"
              title="LJ — Velocity / Poster Boy"
              aspect="9:16"
              badge="MOTION · 9:16"
            />

            {/* Motion Edit 2: 16:9 Widescreen Reel */}
            <AutoplayReel
              id="1219763331"
              title="Stranger Things"
              aspect="16:9"
              badge="MOTION · 16:9"
            />
          </div>
        </div>

        {/* Editorial Body Prose (Verbatim B5, B6, B7 with tightened padding) */}
        <div className="mt-10 pt-6 border-t border-line-2 grid grid-cols-1 md:grid-cols-3 gap-8 font-sans text-body text-cream/70 leading-relaxed">
          <p>{HERO.body1}</p>
          <p>{HERO.body2}</p>
          <p>{HERO.body3}</p>
        </div>
      </div>
    </section>
  );
}
