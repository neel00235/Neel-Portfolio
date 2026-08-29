'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WORKS_COPY } from '@/data/content';
import { SECTIONS, UNIQUE_WORKS, type Work } from '@/data/portfolio.generated';
import { VideoFrame } from '@/components/video/VideoFrame';
import { VideoModal, ModalWork } from '@/components/video/VideoModal';
import { playSound } from '@/lib/sound';
import { Reveal } from '@/components/motion/Reveal';
import { SplitText } from '@/components/motion/SplitText';

gsap.registerPlugin(ScrollTrigger);

function MarqueeReelCard({ work }: { work: Work }) {
  const aspectClass =
    work.aspect === '9:16'
      ? 'aspect-[9/16]'
      : work.aspect === '4:3'
      ? 'aspect-[4/3]'
      : work.aspect === '1:1'
      ? 'aspect-square'
      : 'aspect-video';

  return (
    <div className="flex-shrink-0 w-80 md:w-96 flex flex-col gap-3 group select-none">
      <div className="relative rounded-lg overflow-hidden border border-line-2 group-hover:border-terracotta/70 transition-[transform,border-color,box-shadow] duration-300 shadow-xl group-hover:scale-[1.02] bg-black">
        <div className={`relative w-full ${aspectClass}`}>
          {/* Real poster frame sibling behind iframe (Defect 4) */}
          <Image
            src={`/posters/${work.id}.webp`}
            alt={work.title}
            fill
            sizes="(max-width: 768px) 320px, 384px"
            className="object-cover pointer-events-none"
          />
          {/* Dedicated always-on autoplay Vimeo iframe (Item 5) */}
          <iframe
            src={`https://player.vimeo.com/video/${work.id}?background=1&autoplay=1&loop=1&muted=1&playsinline=1&autopause=0&dnt=1&quality=720p`}
            title={work.title}
            className="absolute inset-0 w-full h-full border-0 pointer-events-none z-10 opacity-100"
            allow="autoplay; fullscreen; picture-in-picture"
            loading="lazy"
          />
          <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-t from-ground/70 via-transparent to-transparent" />
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
  const [modalWork, setModalWork] = useState<ModalWork | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const worksRef = useRef<HTMLElement>(null);
  const worksHeaderRef = useRef<HTMLDivElement>(null);
  const leadFilmRef = useRef<HTMLDivElement>(null);
  const railContainerRef = useRef<HTMLDivElement>(null);
  const conroyHeaderRef = useRef<HTMLDivElement>(null);
  const timelineHeaderRef = useRef<HTMLDivElement>(null);

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

    }, worksRef);

    return () => ctx.revert();
  }, []);

  const handleCardClick = (work: ModalWork) => {
    playSound('click');
    setModalWork(work);
  };

  return (
    <section ref={worksRef} id="works" className="relative w-full py-24 px-6 md:px-12 border-b border-line overflow-hidden">
      {/* Animated Square Grid Ambient Section Background */}
      <div className="absolute inset-0 pointer-events-none grid-overlay opacity-40 z-0" aria-hidden="true" />

      {/* Lightbox Zoom Video Player Modal */}
      <VideoModal work={modalWork} onClose={() => setModalWork(null)} />

      <div className="max-w-shell mx-auto relative z-10">
        {/* Section Header with Cursive Title & Bold Subtitle */}
        <div ref={worksHeaderRef} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-line-2">
          <div>
            <Reveal variant="fade">
              <div className="flex items-center gap-3 font-mono text-label text-terracotta tracking-widest uppercase mb-2">
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
            <div className="flex items-center justify-between font-mono text-label text-muted tracking-widest uppercase mb-4">
              <span className="text-terracotta font-semibold">✦ {WORKS_COPY.leadLabel} · ABSOLUTE CINEMA</span>
              <span>
                {leadFilm.title} · {leadFilm.aspect} · {leadFilm.duration}S
              </span>
            </div>
          </Reveal>

          <Reveal variant="scale" delay={0.12} className="w-full">
            <div ref={leadFilmRef} className="w-full rounded-xl overflow-hidden border border-line shadow-2xl transition-[border-color,box-shadow] duration-500 hover:border-terracotta/60 hover:shadow-terracotta/10">
              <VideoFrame
                id={leadFilm.id}
                title={leadFilm.title}
                slug={leadFilm.slug}
                aspect={leadFilm.aspect}
                duration={leadFilm.duration}
                tone={leadFilm.tone}
                priority={true}
                autoPlayLead={false}
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
                <span className="font-mono text-label text-terracotta tracking-widest uppercase block mb-1">
                  ABSOLUTE CINEMA FIRST
                </span>
                <h3 className="font-display font-black text-big text-cream uppercase">
                  <SplitText text={WORKS_COPY.railHeading} by="word" />
                </h3>
              </div>
            </div>
          </Reveal>

          {/* Continuous Right-to-Left Marquee */}
          <div className="relative w-full overflow-hidden py-4 -mx-6 md:-mx-12 px-6 md:px-12">
            <div
              className={`flex gap-6 w-max ${
                prefersReducedMotion ? '' : 'animate-marquee-slow hover:[animation-play-state:paused]'
              }`}
            >
              {/* Primary set of cards */}
              {railWorks.map((work) => (
                <MarqueeReelCard key={`primary-${work.id}`} work={work} />
              ))}
              {/* Duplicated set of cards for seamless infinite wrap */}
              {railWorks.map((work) => (
                <MarqueeReelCard key={`duplicate-${work.id}`} work={work} />
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
                <span className="font-mono text-label text-terracotta tracking-widest uppercase block mb-2 font-semibold">
                  {WORKS_COPY.conroyHint}
                </span>
                <h3 className="font-display font-black text-big text-cream uppercase">
                  <SplitText text={WORKS_COPY.conroyHeading} by="word" />
                </h3>
              </div>
              <p className="font-sans text-body text-cream/70 max-w-md">
                {WORKS_COPY.conroyIntro} 1 cinematic hero film with all 9 vertical reels delivered for the campaign.
              </p>
            </div>
          </Reveal>

          {/* 6b. Clean Foreground Hero Film Frame (matching lead film width) */}
          <Reveal variant="scale" delay={0.12} className="w-full mb-16">
            <div className="w-full rounded-xl overflow-hidden border border-line shadow-2xl transition-[border-color,box-shadow] duration-500 hover:border-terracotta/60 hover:shadow-terracotta/10 bg-black">
              <div className="relative w-full aspect-video">
                <Image
                  src={`/posters/${conroyHero.id}.webp`}
                  alt={conroyHero.title}
                  fill
                  sizes="100vw"
                  className="object-cover pointer-events-none"
                />
                <iframe
                  src={`https://player.vimeo.com/video/${conroyHero.id}?background=1&autoplay=1&loop=1&muted=1&playsinline=1&autopause=0&dnt=1&quality=720p`}
                  title={conroyHero.title}
                  className="absolute inset-0 w-full h-full border-0 pointer-events-none z-10 opacity-100"
                  allow="autoplay; fullscreen; picture-in-picture"
                  loading="lazy"
                />
                <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-t from-ground/70 via-transparent to-transparent" />
              </div>
            </div>
          </Reveal>

          {/* 6c. Desktop Playing-Card Fan (exactly 9 cuts) */}
          {!prefersReducedMotion && (
            <div className="relative w-full h-[400px] hidden sm:flex items-center justify-center overflow-visible my-8">
              <div className="relative w-[160px] h-[284px]">
                {conroyReels.map((reel, idx) => {
                  const step = idx - 4;
                  const angle = FAN_ANGLES[idx] ?? 0;
                  const yOffset = FAN_Y_OFFSETS[idx] ?? 0;
                  const xOffset = step * 68;

                  return (
                    <button
                      key={reel.id}
                      type="button"
                      onClick={() => handleCardClick(reel)}
                      className="playing-card-fan-item absolute inset-0 w-full h-full rounded-xl overflow-hidden border border-line-2 bg-ground-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-ground cursor-pointer select-none"
                      style={
                        {
                          '--card-x': `${xOffset}px`,
                          '--card-y': `${yOffset}px`,
                          '--card-angle': `${angle}deg`,
                          zIndex: 10 + idx,
                        } as React.CSSProperties
                      }
                      aria-label={`Open ${reel.title} reel`}
                    >
                      <div className="relative w-full h-full aspect-[9/16]">
                        <Image
                          src={`/posters/${reel.id}.webp`}
                          alt={reel.title}
                          fill
                          sizes="180px"
                          className="object-cover pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ground/90 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-2 inset-x-2 flex justify-between items-end font-mono text-[0.62rem] text-muted pointer-events-none">
                          <span className="text-cream font-medium truncate pr-1">{reel.title}</span>
                          <span className="text-terracotta shrink-0 font-semibold">{reel.duration}s</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mobile & Reduced Motion Fallback Grid (sm:hidden OR when prefersReducedMotion) */}
          <div
            className={`${
              prefersReducedMotion ? 'grid' : 'grid sm:hidden'
            } grid-cols-2 sm:grid-cols-3 gap-4 pt-4`}
          >
            {conroyReels.map((reel) => (
              <button
                key={reel.id}
                type="button"
                onClick={() => handleCardClick(reel)}
                className="flex flex-col gap-2 group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta rounded-lg"
              >
                <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden border border-line-2 group-hover:border-terracotta/70 transition-[transform,border-color,box-shadow] duration-300 shadow-lg group-hover:scale-[1.02] bg-black">
                  <Image
                    src={`/posters/${reel.id}.webp`}
                    alt={reel.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ground/80 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="flex justify-between items-center font-mono text-[0.66rem] text-muted px-1">
                  <span className="text-cream font-medium truncate pr-2 group-hover:text-terracotta transition-colors">
                    {reel.title}
                  </span>
                  <span className="text-terracotta font-semibold whitespace-nowrap">{reel.duration}s</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
