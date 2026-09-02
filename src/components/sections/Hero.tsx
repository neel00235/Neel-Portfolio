'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Play, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HERO } from '@/data/content';
import { AmbientReel } from '@/components/video/AmbientReel';

gsap.registerPlugin(ScrollTrigger);
import { STATS, ALL_WORKS, type Work } from '@/data/portfolio.generated';
import { Magnetic } from '@/components/cursor/Magnetic';
import { Reveal } from '@/components/motion/Reveal';
import { SplitText } from '@/components/motion/SplitText';

function AutoplayReel({
  work,
  badge,
  size = 'flank',
}: {
  work: Work;
  badge?: string;
  size?: 'lead' | 'flank';
}) {
  const isLead = size === 'lead';

  const sizeClass = isLead
    ? 'w-full lg:w-[560px] max-w-[580px]'
    : 'w-full lg:w-[440px] max-w-[460px]';

  const badgeText = badge || `${work.discipline.toUpperCase()} · ${work.aspect}`;

  return (
    <div className={`flex flex-col gap-2.5 group ${sizeClass} mx-auto`}>
      <div className="relative w-full rounded-xl overflow-hidden border border-line-2 hover:border-terracotta transition-[transform,border-color,box-shadow] duration-400 shadow-xl bg-black hover:-translate-y-2">
        <AmbientReel
          id={work.id}
          title={work.title}
          slug={work.slug}
          aspect={work.aspect}
          duration={work.duration}
          tone={work.tone}
          quality="720p"
          priority={false}
          sizes={isLead ? '(max-width: 768px) 100vw, 580px' : '(max-width: 768px) 100vw, 460px'}
        />
      </div>

      {/* Scaled caption row with truncate and min-w-0 */}
      <div
        className={`flex justify-between items-center font-mono ${isLead ? 'text-[0.78rem] sm:text-[0.82rem]' : 'text-[0.72rem] sm:text-[0.75rem]'
          } text-muted px-1 min-w-0`}
      >
        <span className="text-cream font-medium truncate min-w-0 pr-2 group-hover:text-terracotta transition-colors">
          {work.title}
        </span>
        <span className="text-terracotta font-semibold whitespace-nowrap shrink-0">{badgeText}</span>
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

  const bySlug = (s: string) => ALL_WORKS.find((w) => w.slug === s);
  const masking = bySlug('lj-masked-edit');
  const motion1 = bySlug('lj-velocity-poster-boy');
  const motion2 = bySlug('stranger-things');

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

        const chars = wordmarkRef.current.querySelectorAll('.wordmark-char');
        if (chars.length > 0) {
          gsap.fromTo(
            chars,
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out', delay: 0.25 }
          );
        }

        const scriptLine = wordmarkRef.current.querySelector('.wordmark-line-2');
        if (scriptLine) {
          gsap.fromTo(
            scriptLine,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.45 }
          );
        }
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

      // R-11: Three-Plane Parallax ScrollTriggers
      const mm = gsap.matchMedia();
      mm.add('(min-width: 60rem)', () => {
        // Plane 1: Back plane - wordmark (factor 0.15)
        if (wordmarkRef.current) {
          gsap.to(wordmarkRef.current, {
            y: 80,
            ease: 'none',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
        }

        // Plane 2: Mid plane - portrait collage (factor 0.42)
        if (portraitRef.current) {
          gsap.to(portraitRef.current, {
            y: 50,
            ease: 'none',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
        }

        // Plane 3: Front plane - copy and role (factor 0.80)
        if (roleRef.current) {
          gsap.to(roleRef.current, {
            y: 25,
            ease: 'none',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
        }
      });

      // Showreel autoplay trio trigger
      if (showreelRef.current) {
        gsap.fromTo(
          showreelRef.current,
          { opacity: 0.85, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: showreelRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
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
          <div className="lg:col-span-7 z-20 flex flex-col order-2 lg:order-1 items-center lg:items-start text-center lg:text-left">
            {/* Display Mega Wordmark - Single Authoritative Title */}
            <h1
              ref={wordmarkRef}
              aria-label="Neel Patel"
              className="flex flex-wrap flex-row items-baseline justify-center text-center gap-x-2.5 sm:gap-x-3.5 lg:gap-x-0 lg:flex-col lg:items-start lg:justify-start lg:text-left text-[clamp(2.6rem,10.5vw,10.5rem)] lg:text-mega tracking-normal leading-[1.0] pb-2 mb-6 lg:pb-4 lg:mb-8 select-none overflow-visible"
            >
              {/* Line 1: NEEL in MBF Taurian — leading-[1.02], pb-[0.12em] and overflow-visible ensure glyph serifs/descenders are never clipped */}
              <span className="wordmark-line-1 relative inline-block font-taurian uppercase font-normal tracking-tight leading-[1.02] pb-[0.12em] overflow-visible drop-shadow-md">
                <span className="wordmark-char inline-block bg-gradient-to-r from-cream via-kraft to-cream bg-[length:220%_100%] bg-clip-text text-transparent [-webkit-text-fill-color:transparent] animate-gradientPan motion-reduce:animate-none leading-[1.02] pb-[0.12em] overflow-visible">N</span>
                <span className="wordmark-char inline-block bg-gradient-to-r from-cream via-kraft to-cream bg-[length:220%_100%] bg-clip-text text-transparent [-webkit-text-fill-color:transparent] animate-gradientPan motion-reduce:animate-none leading-[1.02] pb-[0.12em] overflow-visible">E</span>
                <span className="wordmark-char inline-block text-terracotta [-webkit-text-fill-color:#f67c29] leading-[1.02] pb-[0.12em] overflow-visible">E</span>
                <span className="wordmark-char inline-block bg-gradient-to-r from-cream via-kraft to-cream bg-[length:220%_100%] bg-clip-text text-transparent [-webkit-text-fill-color:transparent] animate-gradientPan motion-reduce:animate-none leading-[1.02] pb-[0.12em] overflow-visible">L</span>
              </span>

              {/* Line 2: Patel in font-script (same font as "deliver") with rich orange animated gradient */}
              <span className="wordmark-line-2 relative font-script font-normal normal-case select-none inline-block lg:block overflow-visible pb-[0.08em] text-[1.15em] sm:text-[1.25em] lg:text-[1.45em] leading-[0.8] mt-0 lg:-mt-[36px]">
                <span className="inline-block bg-gradient-to-r from-[#ffb03a] via-[#ff5500] to-[#ff9426] bg-[length:220%_100%] bg-clip-text text-transparent [-webkit-text-fill-color:transparent] animate-gradientPan motion-reduce:animate-none">
                  Patel
                </span>
              </span>
            </h1>

            {/* Role Header with In-Animation & >=32px Clear Space */}
            <Reveal variant="up" delay={0.1}>
              <div
                ref={roleRef}
                className="flex items-center justify-center lg:justify-start gap-3 font-mono text-terracotta text-label uppercase tracking-[0.24em] font-semibold mb-6"
              >
                <SplitText text={`${HERO.rolePrefix} ${HERO.roleDot} ${HERO.roleSuffix}`} by="word" />
              </div>
            </Reveal>

            {/* Cursive Accent Line per Item 2b (Ephesis font-script) - honest height & centered/flush alignment */}
            <Reveal variant="up" delay={0.12}>
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 min-h-[1.5rem]">
                <span className="h-[1px] w-6 sm:w-8 bg-terracotta/40" />
                <span className="inline-block font-script text-terracotta lowercase text-[1.45em] font-normal leading-[1.2] tracking-wide select-none">
                  crafting rhythm from pure motion
                </span>
                <span className="h-[1px] flex-1 max-w-[80px] sm:max-w-[120px] bg-terracotta/40" />
              </div>
            </Reveal>

            {/* Verbatim Lead Paragraph with In-Animation */}
            <Reveal variant="up" delay={0.15}>
              <p
                ref={leadRef}
                className="font-serif text-lead text-cream/90 leading-relaxed mb-8 max-w-xl text-center lg:text-left mx-auto lg:mx-0"
              >
                I&apos;m a video editor specialised in{' '}
                <span className="text-terracotta font-medium italic">colour grading</span> and{' '}
                <span className="text-kraft font-medium italic">story-driven edits</span> — turning raw
                footage into visuals that don&apos;t just get watched, they get{' '}
                <span className="inline-block font-script text-[1.4em] font-normal leading-[0.72] -my-[0.18em] text-cream">
                  felt
                </span>.
              </p>
            </Reveal>

            {/* CTAs with In-Animation */}
            <Reveal variant="up" delay={0.2}>
              <div ref={ctaRef} className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8">
                <Magnetic strength={0.15} cursor={HERO.ctaPrimary.cursor}>
                  <a
                    href={HERO.ctaPrimary.href}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-terracotta hover:bg-[#ff8838] text-ground font-mono text-label font-bold tracking-widest uppercase shadow-lg transition-[transform,background-color,box-shadow] duration-200"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{HERO.ctaPrimary.text}</span>
                  </a>
                </Magnetic>

                <Magnetic strength={0.15} cursor={HERO.ctaSecondary.cursor}>
                  <a
                    href={HERO.ctaSecondary.href}
                    className="flex items-center gap-2 px-6 py-3 rounded-full border border-line hover:border-cream text-cream font-mono text-label tracking-widest uppercase transition-[transform,border-color,color] duration-200"
                  >
                    <span>{HERO.ctaSecondary.text}</span>
                    <ArrowUpRight className="w-4 h-4 text-muted" />
                  </a>
                </Magnetic>
              </div>
            </Reveal>

            {/* Editorial Metric Strip per Item 2b */}
            <Reveal variant="up" delay={0.24}>
              <div className="grid grid-cols-3 gap-6 py-5 border-t border-line-2 mb-6">
                <div>
                  <span className="block font-display font-black text-2xl md:text-3xl text-cream tracking-tight font-variation-wonk">
                    52+
                  </span>
                  <span className="font-mono text-[0.66rem] uppercase tracking-wider text-muted">
                    Films &amp; Cuts
                  </span>
                </div>
                <div>
                  <span className="block font-display font-black text-2xl md:text-3xl text-cream tracking-tight font-variation-wonk">
                    16
                  </span>
                  <span className="font-mono text-[0.66rem] uppercase tracking-wider text-muted">
                    Disciplines
                  </span>
                </div>
                <div>
                  <span className="block font-display font-black text-2xl md:text-3xl text-terracotta tracking-tight font-variation-wonk">
                    4K
                  </span>
                  <span className="font-mono text-[0.66rem] uppercase tracking-wider text-muted">
                    Master Color
                  </span>
                </div>
              </div>
            </Reveal>

            {/* Tags (Tightened vertical spacing) */}
            <Reveal variant="up" delay={0.28}>
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
            </Reveal>
          </div>

          {/* Right Column: Editorial Portrait Collage & Specs */}
          <div className="lg:col-span-5 z-10 flex flex-col gap-6 order-1 lg:order-2 w-full">
            <Reveal variant="scale" delay={0.18} className="w-full">
              <figure
                ref={portraitRef}
                className="relative w-full max-w-full aspect-[4/5] rounded-lg overflow-hidden border border-line-2 bg-ground-2 shadow-2xl group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/portrait/neel-collage.webp"
                  srcSet="/portrait/neel-sm.webp 700w, /portrait/neel-collage.webp 1400w"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  alt={HERO.portraitAlt}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="absolute inset-0 object-cover w-full h-full filter saturate-90 contrast-105 group-hover:scale-102 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ground/90 via-transparent to-transparent" />
                {/* R-37 & B-8: Rotating Circular Badge driven by animate-spinSlow */}
                <div className="absolute top-4 right-4 z-20 w-24 h-24 pointer-events-none select-none">
                  <svg viewBox="0 0 100 100" className="w-full h-full animate-spinSlow text-cream/80 drop-shadow-md overflow-hidden">
                    <path
                      id="heroBadgePath"
                      d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                      fill="none"
                    />
                    <text className="font-mono text-[8px] uppercase tracking-[0.22em] fill-current">
                      <textPath href="#heroBadgePath" startOffset="0%">
                        ABSOLUTE CINEMA · ABSOLUTE CINEMA ·
                      </textPath>
                    </text>
                  </svg>
                  <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-terracotta shadow-[0_0_10px_rgba(246,124,41,0.7)]" />
                </div>
                <figcaption className="absolute bottom-4 inset-x-4 font-mono text-[0.64rem] tracking-[0.2em] text-cream/90 uppercase flex justify-between items-center">
                  <span>{HERO.collageFigcaption}</span>
                  <span className="text-terracotta">AHM // IND</span>
                </figcaption>
              </figure>
            </Reveal>

            {/* Verified Specs Grid */}
            <Reveal variant="up" delay={0.22}>
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
            </Reveal>

            {/* Derived Stats Bar */}
            <Reveal variant="up" delay={0.28}>
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
            </Reveal>
          </div>
        </div>

        {/* Hero Showreel Autoplay Trio: 2 Vertical 9:16 Reels + 1 Widescreen 16:9 Reel */}
        <Reveal variant="up" delay={0.3}>
          <div ref={showreelRef} className="mt-12 pt-8 border-t border-line-2 flex flex-col gap-6">
            <div className="flex items-center justify-between font-mono text-label text-muted tracking-widest uppercase">
              <span className="text-terracotta font-semibold">
                ✦ FEATURED AUTOPLAY SHOWREEL · 1 MASKING + 2 MOTION EDITS
              </span>
              <span className="hidden sm:inline text-xs">LIVE PREVIEW</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-center lg:items-end justify-center w-full">
              {/* Motion Edit 1: 16:9 Aspect Reel (Left Flank) */}
              {motion1 && (
                <Reveal variant="up" delay={0.1} className="w-full lg:w-auto flex justify-center">
                  <AutoplayReel
                    work={motion1}
                    badge="MOTION · 16:9"
                    size="flank"
                  />
                </Reveal>
              )}

              {/* 1 Masking Edit: 4:3 Aspect Reel (Middle & Largest Lead) */}
              {masking && (
                <Reveal variant="up" delay={0.18} className="w-full lg:w-auto flex justify-center">
                  <AutoplayReel
                    work={masking}
                    badge="MASKING · 4:3"
                    size="lead"
                  />
                </Reveal>
              )}

              {/* Motion Edit 2: 16:9 Aspect Reel (Right Flank) */}
              {motion2 && (
                <Reveal variant="up" delay={0.26} className="w-full lg:w-auto flex justify-center">
                  <AutoplayReel
                    work={motion2}
                    badge="MOTION · 16:9"
                    size="flank"
                  />
                </Reveal>
              )}
            </div>
          </div>
        </Reveal>

        {/* Editorial Body Prose (Verbatim B5, B6, B7 with tightened padding) */}
        <div id="about" className="mt-10 pt-6 border-t border-line-2 grid grid-cols-1 md:grid-cols-3 gap-8 font-sans text-body text-cream/70 leading-relaxed">
          <Reveal variant="up" delay={0.1}>
            <p>{HERO.body1}</p>
          </Reveal>
          <Reveal variant="up" delay={0.18}>
            <p>{HERO.body2}</p>
          </Reveal>
          <Reveal variant="up" delay={0.26}>
            <p>{HERO.body3}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
