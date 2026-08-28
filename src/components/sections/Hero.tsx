'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Play, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HERO } from '@/data/content';

gsap.registerPlugin(ScrollTrigger);
import { STATS, ALL_WORKS, type Work } from '@/data/portfolio.generated';
import { Magnetic } from '@/components/cursor/Magnetic';
import { Reveal } from '@/components/motion/Reveal';
import { SplitText } from '@/components/motion/SplitText';

function AutoplayReel({
  work,
  badge,
}: {
  work: Work;
  badge?: string;
}) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const isVertical = work.aspect === '9:16';
  const aspectClass =
    work.aspect === '9:16'
      ? 'aspect-[9/16]'
      : work.aspect === '4:3'
      ? 'aspect-[4/3]'
      : work.aspect === '1:1'
      ? 'aspect-square'
      : 'aspect-video';

  const maxWClass =
    work.aspect === '9:16'
      ? 'max-w-[210px]'
      : work.aspect === '4:3'
      ? 'max-w-[300px]'
      : 'max-w-[380px]';

  const badgeText = badge || `${work.discipline.toUpperCase()} · ${work.aspect}`;

  return (
    <div className={`flex flex-col gap-2 group ${maxWClass} w-full mx-auto`}>
      <div
        className={`relative w-full ${aspectClass} rounded-xl overflow-hidden border border-line-2 hover:border-terracotta transition-all duration-400 shadow-xl bg-black hover:-translate-y-2`}
      >
        {/* Real poster frame sibling behind iframe (Defect 4) */}
        <Image
          src={`/posters/${work.id}.webp`}
          alt={work.title}
          fill
          sizes="(max-width: 768px) 100vw, 380px"
          className="object-cover pointer-events-none"
        />

        <iframe
          src={`https://player.vimeo.com/video/${work.id}?background=1&autoplay=1&loop=1&muted=1&playsinline=1&autopause=0&dnt=1&quality=720p`}
          title={work.title}
          onLoad={() => setIframeLoaded(true)}
          className={`absolute inset-0 w-full h-full border-0 pointer-events-none z-10 transition-opacity duration-500 ${
            iframeLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          allow="autoplay; fullscreen; picture-in-picture"
          loading="eager"
        />
        <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-t from-ground/70 via-transparent to-transparent" />
      </div>
      <div className="flex justify-between items-center font-mono text-[0.66rem] text-muted px-1">
        <span className="text-cream font-medium truncate pr-2 group-hover:text-terracotta transition-colors">
          {work.title}
        </span>
        <span className="text-terracotta font-semibold whitespace-nowrap">{badgeText}</span>
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
          <div className="lg:col-span-7 z-20 flex flex-col order-2 lg:order-1">
            {/* Display Mega Wordmark - Single Authoritative Title with In-Animation */}
            <h1
              ref={wordmarkRef}
              className="font-display font-black text-mega text-cream uppercase tracking-tight leading-[0.88] mb-6 drop-shadow-md"
            >
              <SplitText text="NEEL PATEL" by="char" />
            </h1>

            {/* Role Header with In-Animation */}
            <Reveal variant="up" delay={0.1}>
              <div
                ref={roleRef}
                className="flex items-center gap-3 font-mono text-terracotta text-label uppercase tracking-[0.24em] font-semibold mb-6"
              >
                <SplitText text={`${HERO.rolePrefix} ${HERO.roleDot} ${HERO.roleSuffix}`} by="word" />
              </div>
            </Reveal>

            {/* Verbatim Lead Paragraph with In-Animation */}
            <Reveal variant="up" delay={0.15}>
              <p
                ref={leadRef}
                className="font-serif text-lead text-cream/90 leading-relaxed mb-8 max-w-xl"
              >
                I&apos;m a video editor specialised in{' '}
                <span className="text-terracotta font-medium italic">colour grading</span> and{' '}
                <span className="text-kraft font-medium italic">story-driven edits</span> — turning raw
                footage into visuals that don&apos;t just get watched, they get{' '}
                <span className="font-script text-2xl text-cream">felt</span>.
              </p>
            </Reveal>

            {/* CTAs with In-Animation */}
            <Reveal variant="up" delay={0.2}>
              <div ref={ctaRef} className="flex flex-wrap items-center gap-4 mb-8">
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
            </Reveal>

            {/* Tags (Tightened vertical spacing) */}
            <Reveal variant="up" delay={0.25}>
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
          <div className="lg:col-span-5 z-10 flex flex-col gap-6 order-1 lg:order-2">
            <Reveal variant="scale" delay={0.18}>
              <figure
                ref={portraitRef}
                className="relative w-full aspect-[4/5] rounded-lg overflow-hidden border border-line-2 bg-ground-2 shadow-2xl group"
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
                {/* R-37 & B-8: Rotating Circular Badge driven by animate-spinSlow */}
                <div className="absolute top-4 right-4 z-20 w-24 h-24 pointer-events-none select-none">
                  <svg viewBox="0 0 100 100" className="w-full h-full animate-spinSlow text-cream/80 drop-shadow-md">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-end justify-center">
              {/* 1 Masking Edit: 4:3 Aspect Reel */}
              {masking && (
                <Reveal variant="up" delay={0.1}>
                  <AutoplayReel
                    work={masking}
                    badge="MASKING · 4:3"
                  />
                </Reveal>
              )}

              {/* Motion Edit 1: 16:9 Aspect Reel */}
              {motion1 && (
                <Reveal variant="up" delay={0.18}>
                  <AutoplayReel
                    work={motion1}
                    badge="MOTION · 16:9"
                  />
                </Reveal>
              )}

              {/* Motion Edit 2: 16:9 Aspect Reel */}
              {motion2 && (
                <Reveal variant="up" delay={0.26}>
                  <AutoplayReel
                    work={motion2}
                    badge="MOTION · 16:9"
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
