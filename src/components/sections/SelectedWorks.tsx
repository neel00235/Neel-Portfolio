'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WORKS_COPY } from '@/data/content';
import { SECTIONS, UNIQUE_WORKS, type Work } from '@/data/portfolio.generated';
import { AmbientReel } from '@/components/video/AmbientReel';
import { useLightbox } from '@/components/video/LightboxProvider';
import type { ModalWork } from '@/components/video/VideoModal';
import { playSound } from '@/lib/sound';
import { Reveal } from '@/components/motion/Reveal';
import { SplitText } from '@/components/motion/SplitText';
import lqipData from '@/data/lqip.json';

gsap.registerPlugin(ScrollTrigger);

const RAIL_H = 288; // px — the 4:3 reference card's current height (384 × 3/4)

const RATIO: Record<string, number> = {
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
  '3:4': 3 / 4,
  '9:16': 9 / 16,
};

function MarqueeReelCard({ work }: { work: Work }) {
  const ratio = RATIO[work.aspect] ?? 16 / 9;

  return (
    <div
      className="flex-shrink-0 flex flex-col gap-3 group select-none"
      style={{ width: `calc(var(--rail-h, 288px) * ${ratio.toFixed(6)})` }}
    >
      <div className="relative rounded-lg overflow-hidden border border-line-2 group-hover:border-terracotta/70 transition-[transform,border-color,box-shadow] duration-300 shadow-xl group-hover:scale-[1.06] group-hover:z-20 bg-black">
        <div className="relative w-full" style={{ height: 'var(--rail-h, 288px)' }}>
          <AmbientReel
            id={work.id}
            title={work.title}
            slug={work.slug}
            aspect={work.aspect}
            duration={work.duration}
            tone={work.tone}
            quality="720p"
            sizes="(max-width: 768px) 320px, 384px"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-center justify-between font-mono text-label min-w-0">
          <span className="text-cream font-display font-bold truncate pr-2 group-hover:text-terracotta transition-colors min-w-0">
            {work.title}
          </span>
          <span className="text-terracotta text-xs font-semibold uppercase shrink-0">
            {work.discipline.replace(/-/g, ' ')}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[0.66rem] text-muted">
          <span className="px-1.5 py-0.5 rounded bg-line/60 border border-line-2 text-terracotta font-semibold">
            {work.aspect}
          </span>
          <span>·</span>
          <span>{work.duration}s</span>
        </div>
      </div>
    </div>
  );
}

const FAN_ANGLES = [-28, -21, -14, -7, 0, 7, 14, 21, 28];
const FAN_Y_OFFSETS = [24, 14, 6, 2, 0, 2, 6, 14, 24];

export function SelectedWorks() {
  const { open } = useLightbox();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [deckOpen, setDeckOpen] = useState(false);
  const [railRunning, setRailRunning] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const worksRef = useRef<HTMLElement>(null);
  const worksHeaderRef = useRef<HTMLDivElement>(null);
  const leadFilmRef = useRef<HTMLDivElement>(null);
  const railContainerRef = useRef<HTMLDivElement>(null);
  const conroyHeaderRef = useRef<HTMLDivElement>(null);
  const timelineHeaderRef = useRef<HTMLDivElement>(null);
  const fanContainerRef = useRef<HTMLDivElement>(null);

  // Conroy campaign works: 1 hero film + 9 vertical reels (Defect 7)
  const conroySection = SECTIONS.find((s) => s.slug === 'brand-films');
  const conroyHero = conroySection?.works[0] || UNIQUE_WORKS[0];
  const conroyReels = conroySection?.works.slice(1) || [];

  // Put Absolute Cinema and Motion edits up front
  const cinemaSection = SECTIONS.find((s) => s.slug === 'absolute-cinema');
  const motionSection = SECTIONS.find((s) => s.slug === 'motion-graphics');
  const eventGfxSection = SECTIONS.find((s) => s.slug === 'event-gfx');

  // Lead film: Mumbai (Flagship Absolute Cinema edit)
  const leadFilm = cinemaSection?.works[0] || conroyHero;

  // Rail works: Absolute Cinema & Motion edits first
  const cinemaWorks = cinemaSection?.works || [];
  const motionWorks = motionSection?.works || [];
  const gfxWorks = eventGfxSection?.works || [];
  const otherWorks = UNIQUE_WORKS.filter(
    (w) => !['absolute-cinema', 'motion-graphics', 'event-gfx'].includes(w.discipline)
  );

  // The home rail is a teaser, not the archive: capping it keeps the number of
  // VideoFrames (poster + hover iframe each) on the landing page bounded. The
  // full 52 are one click away via the rail's end card and the header link.
  const RAIL_LIMIT = 12;
  const railWorks = [...cinemaWorks, ...motionWorks, ...gfxWorks, ...otherWorks].slice(
    0,
    RAIL_LIMIT
  );
  const railRowA = railWorks.filter((_, i) => i % 2 === 0);
  const railRowB = railWorks.filter((_, i) => i % 2 === 1);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);

    if (mql.matches) return;

    const ctx = gsap.context(() => {
      // 1. Section Header trigger
      if (worksHeaderRef.current) {
        gsap.fromTo(
          worksHeaderRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: worksHeaderRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 2. Timeline Selections header trigger
      if (timelineHeaderRef.current) {
        gsap.fromTo(
          timelineHeaderRef.current,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: timelineHeaderRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 3. Conroy Campaign header trigger
      if (conroyHeaderRef.current) {
        gsap.fromTo(
          conroyHeaderRef.current,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: conroyHeaderRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 4. Timeline Selections rail marquee start trigger (Item 4b)
      if (railContainerRef.current) {
        ScrollTrigger.create({
          trigger: railContainerRef.current,
          start: 'top bottom',
          once: true,
          onEnter: () => setRailRunning(true),
        });
      }

      // 5. Conroy Playing-Card Deck opening trigger (Item 4b)
      if (fanContainerRef.current) {
        ScrollTrigger.create({
          trigger: fanContainerRef.current,
          start: 'top 75%',
          once: true,
          onEnter: () => setDeckOpen(true),
        });
      }
    }, worksRef);

    return () => ctx.revert();
  }, []);

  const handleCardClick = (work: ModalWork) => {
    playSound('click');
    open(work);
  };

  return (
    <section ref={worksRef} id="works" className="relative w-full py-24 px-6 md:px-12 border-b border-line overflow-hidden">
      <div className="max-w-shell mx-auto relative z-10">
        {/* Section Header with Cursive Title & Bold Subtitle */}
        <div ref={worksHeaderRef} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-line-2">
          <div>
            <Reveal variant="fade">
              <div className="flex items-center gap-3 font-mono text-label text-terracotta tracking-widest uppercase mb-2 animate-text-breathe [animation-duration:7.6s] [animation-delay:-0.5s]">
                <span>{WORKS_COPY.labelNum}</span>
                <span>/</span>
                <span>{WORKS_COPY.navLabel}</span>
              </div>
            </Reveal>
            {/* Cursive Signature Title */}
            <h2 className="font-script text-cream text-[clamp(4.5rem,10vw,8.5rem)] leading-none select-none tracking-normal drop-shadow-md">
              <SplitText text="Selected works" by="word" />
            </h2>
            {/* Bold Subtitle Requested by User */}
            <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-cream uppercase tracking-tight -mt-2">
              <SplitText text="CURATED EDITORIAL & CINEMATIC EDITS" by="char" />
            </h3>
          </div>
          <Reveal variant="up" delay={0.1}>
            <p className="font-sans text-body text-cream/70 max-w-md">
              {WORKS_COPY.intro}
            </p>
          </Reveal>
        </div>

        {/* 1. The Lead Film (Absolute Cinema Flagship) */}
        <div className="mb-20">
          <Reveal variant="up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-label text-muted tracking-widest uppercase mb-4">
              <span className="text-terracotta font-semibold">✦ {WORKS_COPY.leadLabel} · ABSOLUTE CINEMA</span>
              <span>
                {leadFilm.title} · {leadFilm.aspect} · {leadFilm.duration}S
              </span>
            </div>
          </Reveal>

          <Reveal variant="scale" delay={0.12} className="w-full">
            <div ref={leadFilmRef} className="w-full rounded-xl overflow-hidden border border-line shadow-2xl transition-[border-color,box-shadow] duration-500 hover:border-terracotta/60 hover:shadow-terracotta/10">
              <AmbientReel
                id={leadFilm.id}
                title={leadFilm.title}
                slug={leadFilm.slug}
                aspect={leadFilm.aspect}
                duration={leadFilm.duration}
                tone={leadFilm.tone}
                priority={true}
                signalsLeadReady={true}
                quality="1080p"
                className="w-full"
              />
            </div>
          </Reveal>
        </div>

        {/* 2. Timeline Selections Rail — Continuous Marquee (Item 5) */}
        <div ref={railContainerRef} className="mb-16">
          <Reveal variant="up">
            <div ref={timelineHeaderRef} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="font-mono text-label text-terracotta tracking-widest uppercase block mb-1 animate-text-breathe [animation-duration:8.0s] [animation-delay:-2.8s]">
                  ABSOLUTE CINEMA FIRST
                </span>
                <h3 className="font-taurian text-big text-cream uppercase tracking-wide">
                  <SplitText text={WORKS_COPY.railHeading} by="word" />
                </h3>
              </div>
            </div>
          </Reveal>

          {/* Continuous Right-to-Left Marquee — Two Offset Rows */}
          <div className="marquee-rail relative w-full overflow-hidden py-8 -mx-6 md:-mx-12 px-6 md:px-12">
            {/* Row A */}
            <div
              className={`flex gap-6 w-max ${
                prefersReducedMotion
                  ? ''
                  : `animate-marquee-slow [animation-duration:48s] ${
                      railRunning ? '[animation-play-state:running]' : '[animation-play-state:paused]'
                    }`
              }`}
            >
              {railRowA.map((work) => (
                <MarqueeReelCard key={`railA1-${work.id}`} work={work} />
              ))}
              {railRowA.map((work) => (
                <MarqueeReelCard key={`railA2-${work.id}`} work={work} />
              ))}
            </div>

            {/* Row B */}
            <div
              className={`flex gap-6 w-max mt-6 ${
                prefersReducedMotion
                  ? ''
                  : `animate-marquee-slow [animation-duration:56s] [animation-delay:-18s] ${
                      railRunning ? '[animation-play-state:running]' : '[animation-play-state:paused]'
                    }`
              }`}
            >
              {railRowB.map((work) => (
                <MarqueeReelCard key={`railB1-${work.id}`} work={work} />
              ))}
              {railRowB.map((work) => (
                <MarqueeReelCard key={`railB2-${work.id}`} work={work} />
              ))}
            </div>
          </div>
        </div>

        {/* 3. Conroy Campaign Section (Item 6 Redesign) */}
        <div className="relative pt-12 pb-16 border-t border-line-2 my-12">
          {/* Header */}
          <Reveal variant="up">
            <div
              ref={conroyHeaderRef}
              className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
            >
              <div>
                <span className="font-mono text-label text-terracotta tracking-widest uppercase block mb-2 font-semibold animate-text-breathe [animation-duration:7.1s] [animation-delay:-1.4s]">
                  {WORKS_COPY.conroyHint}
                </span>
                <span className="font-script text-terracotta text-3xl sm:text-4xl -mb-2 select-none block animate-text-breathe [animation-duration:5.6s] [animation-delay:-1.9s]">
                  {WORKS_COPY.conroyScript}
                </span>
                <h3 className="font-taurian text-big text-cream uppercase tracking-wide">
                  <SplitText text={WORKS_COPY.conroyHeading} by="word" />
                </h3>
              </div>
              <div className="flex flex-col gap-2 max-w-md">
                <p className="font-sans text-body text-cream/70">
                  {WORKS_COPY.conroyIntro} 1 cinematic hero film with all 9 vertical reels delivered for the campaign.
                </p>
                <div className="flex items-center gap-2 font-mono text-xs text-terracotta font-semibold uppercase tracking-wider">
                  <span>{WORKS_COPY.conroyStatA}</span>
                  <span className="text-muted">·</span>
                  <span>{WORKS_COPY.conroyStatB}</span>
                  <span className="text-muted">·</span>
                  <span>{WORKS_COPY.conroyStatC}</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 6b. Clean Foreground Hero Film Frame (matching lead film width) */}
          <Reveal variant="scale" delay={0.12} className="w-full mb-16">
            <div className="w-full rounded-xl overflow-hidden border border-line shadow-2xl transition-[border-color,box-shadow] duration-500 hover:border-terracotta/60 hover:shadow-terracotta/10 bg-black">
              <AmbientReel
                id={conroyHero.id}
                title={conroyHero.title}
                slug={conroyHero.slug}
                aspect={conroyHero.aspect}
                duration={conroyHero.duration}
                tone={conroyHero.tone}
                quality="720p"
                sizes="100vw"
                className="w-full"
              />
            </div>
            <p className="font-mono text-label text-muted tracking-widest uppercase mt-4 text-center sm:text-left">
              {WORKS_COPY.conroyReelsLead}
            </p>
          </Reveal>

          {/* 6c. Desktop Playing-Card Fan (exactly 9 cuts) */}
          {!prefersReducedMotion && (
            <div
              ref={fanContainerRef}
              className="relative w-full flex flex-col items-center justify-center overflow-visible my-8"
            >
              <div className="relative w-full h-[480px] hidden sm:flex items-center justify-center overflow-visible">
                <div className="relative w-[190px] h-[338px] scale-[0.82] xl:scale-100 origin-center">
                  {conroyReels.map((reel, idx) => {
                    const angle = deckOpen ? (FAN_ANGLES[idx] ?? 0) : (idx - 4) * 0.8;
                    const xOffset = deckOpen ? (idx - 4) * 78 : (idx - 4) * 1.5;
                    const yOffset = deckOpen ? (FAN_Y_OFFSETS[idx] ?? 0) : 0;
                    const isHovered = hoveredIdx === idx;

                    return (
                      <button
                        key={reel.id}
                        type="button"
                        onClick={() => handleCardClick(reel)}
                        onMouseEnter={() => {
                          setHoveredIdx(idx);
                        }}
                        onMouseLeave={() => {
                          setHoveredIdx(null);
                        }}
                        onFocus={() => {
                          setHoveredIdx(idx);
                        }}
                        onBlur={() => {
                          setHoveredIdx(null);
                        }}
                        data-cursor="Play"
                        className="playing-card-fan-item absolute inset-0 w-full h-full focus-visible:outline-none cursor-pointer select-none bg-transparent border-0 p-0"
                        style={
                          {
                            '--card-x': `${xOffset}px`,
                            '--card-y': `${yOffset}px`,
                            '--card-angle': `${angle}deg`,
                            transitionDelay: `${idx * 45}ms`,
                            zIndex: 10 + idx,
                          } as React.CSSProperties
                        }
                        aria-label={`Open ${reel.title} reel`}
                      >
                        <div className="playing-card-lift pointer-events-none relative w-full h-full rounded-xl overflow-hidden border border-line-2 bg-ground-2 focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-ground">
                          <div className="relative w-full h-full aspect-[9/16]">
                            {isHovered ? (
                              <AmbientReel
                                id={reel.id}
                                title={reel.title}
                                slug={reel.slug}
                                aspect="9:16"
                                quality="540p"
                                sizes="190px"
                                interactive={false}
                                className="w-full h-full"
                              />
                            ) : (
                              <>
                                {(lqipData as Record<string, string>)[reel.id] && (
                                  <div
                                    aria-hidden="true"
                                    className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none filter blur-sm scale-105"
                                    style={{
                                      backgroundImage: `url("${
                                        (lqipData as Record<string, string>)[reel.id]
                                      }")`,
                                    }}
                                  />
                                )}
                                <Image
                                  src={`/posters/${reel.id}.webp`}
                                  alt={reel.title}
                                  fill
                                  sizes="190px"
                                  placeholder={
                                    (lqipData as Record<string, string>)[reel.id] ? 'blur' : 'empty'
                                  }
                                  blurDataURL={(lqipData as Record<string, string>)[reel.id]}
                                  className="object-cover pointer-events-none z-[1]"
                                />
                              </>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-ground/90 via-transparent to-transparent pointer-events-none z-20" />
                            <div className="absolute bottom-2 inset-x-2 flex justify-between items-end font-mono text-[0.62rem] text-muted pointer-events-none z-20">
                              <span className="text-cream font-medium truncate pr-1">{reel.title}</span>
                              <span className="text-terracotta shrink-0 font-semibold">{reel.duration}s</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-8 mb-4 text-center hidden sm:flex flex-col items-center select-none">
                <span className="conroy-big-script font-script text-terracotta text-4xl sm:text-5xl -mb-2 select-none block animate-text-breathe [animation-duration:5.8s] [animation-delay:-1.2s]">
                  {WORKS_COPY.conroyBigScript}
                </span>
                <span className="conroy-big-display font-display font-black text-huge text-cream uppercase tracking-tight font-variation-wonk leading-none">
                  {WORKS_COPY.conroyBigDisplay}
                </span>
              </div>
              <div className="mt-2 text-center hidden sm:block">
                <span className="font-mono text-label text-muted tracking-widest uppercase">
                  {WORKS_COPY.conroyDeckHint}
                </span>
              </div>
            </div>
          )}

          {/* Mobile & Reduced Motion Fallback Grid (sm:hidden OR when prefersReducedMotion) */}
          <div
            className={`${
              prefersReducedMotion ? 'grid' : 'grid sm:hidden'
            } grid-cols-2 sm:grid-cols-3 gap-4 pt-4`}
          >
            {conroyReels.map((reel) => {
              const reelLqip = (lqipData as Record<string, string>)[reel.id] || '';
              return (
                <button
                  key={reel.id}
                  type="button"
                  onClick={() => handleCardClick(reel)}
                  aria-label={`Open ${reel.title} reel`}
                  data-cursor="Play"
                  className="flex flex-col gap-2 group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta rounded-lg"
                >
                  <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden border border-line-2 group-hover:border-terracotta/70 transition-[transform,border-color,box-shadow] duration-300 shadow-lg group-hover:scale-[1.02] bg-black">
                    {reelLqip && (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none filter blur-sm scale-105"
                        style={{ backgroundImage: `url("${reelLqip}")` }}
                      />
                    )}
                    <Image
                      src={`/posters/${reel.id}.webp`}
                      alt={reel.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      placeholder={reelLqip ? 'blur' : 'empty'}
                      blurDataURL={reelLqip}
                      className="object-cover pointer-events-none z-[1]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ground/80 via-transparent to-transparent pointer-events-none z-10" />
                  </div>
                  <div className="flex justify-between items-center font-mono text-[0.66rem] text-muted px-1">
                    <span className="text-cream font-medium truncate pr-2 group-hover:text-terracotta transition-colors">
                      {reel.title}
                    </span>
                    <span className="text-terracotta font-semibold whitespace-nowrap">{reel.duration}s</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
