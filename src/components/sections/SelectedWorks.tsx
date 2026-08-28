'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Maximize2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WORKS_COPY } from '@/data/content';
import { SECTIONS, UNIQUE_WORKS } from '@/data/portfolio.generated';
import { VideoFrame } from '@/components/video/VideoFrame';
import { VideoModal, ModalWork } from '@/components/video/VideoModal';
import { playSound } from '@/lib/sound';
import { Reveal } from '@/components/motion/Reveal';
import { SplitText } from '@/components/motion/SplitText';

gsap.registerPlugin(ScrollTrigger);

export function SelectedWorks() {
  const [modalWork, setModalWork] = useState<ModalWork | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const worksRef = useRef<HTMLElement>(null);
  const worksHeaderRef = useRef<HTMLDivElement>(null);
  const leadFilmRef = useRef<HTMLDivElement>(null);
  const railContainerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
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

          <Reveal variant="scale" delay={0.12}>
            <div ref={leadFilmRef} className="w-full max-w-5xl mx-auto rounded-xl overflow-hidden border border-line shadow-2xl transition-all duration-500 hover:border-terracotta/60 hover:shadow-terracotta/10">
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

        {/* 2. Timeline Selections Rail — Absolute Cinema first, browsable by scroll alone */}
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
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 font-mono text-label text-terracotta hover:text-cream tracking-widest uppercase transition-colors"
                data-cursor="Open"
              >
                <span>VIEW ALL (52)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Reveal>

          {/* Smooth Horizontal Rail */}
          <div ref={railRef} className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory">
            {railWorks.map((work, idx) => (
              <Reveal key={work.id} variant="up" delay={0.04 * Math.min(idx, 6)}>
                <div className="flex-shrink-0 w-80 md:w-96 snap-start flex flex-col gap-3 group">
                  <div
                    onClick={() => handleCardClick(work)}
                    className="cursor-pointer relative rounded-lg overflow-hidden border border-line-2 hover:border-terracotta/60 transition-all duration-300 shadow-xl hover:-translate-y-1.5"
                    data-cursor="Zoom"
                  >
                    <VideoFrame
                      id={work.id}
                      title={work.title}
                      slug={work.slug}
                      aspect={work.aspect}
                      duration={work.duration}
                      tone={work.tone}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(work);
                      }}
                      className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full bg-ground/95 md:bg-ground/80 md:backdrop-blur-md border border-line text-cream opacity-0 group-hover:opacity-100 hover:text-terracotta transition-opacity duration-200"
                      aria-label="Zoom video"
                      title="Zoom in full player"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 px-1">
                    <div className="flex items-center justify-between font-mono text-label">
                      <span className="text-cream font-display font-bold truncate pr-2 group-hover:text-terracotta transition-colors">
                        {work.title}
                      </span>
                      <span className="text-terracotta text-xs font-semibold uppercase">
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
              </Reveal>
            ))}

            {/* View All End Card */}
            <Reveal variant="up" delay={0.24}>
              <div className="flex-shrink-0 w-80 md:w-96 snap-start flex flex-col justify-center items-center gap-4 p-8 rounded-lg border border-line-2 bg-ground-2 text-center h-[280px]">
                <span className="font-mono text-label text-terracotta tracking-widest uppercase">
                  52 TOTAL EDITS
                </span>
                <p className="font-sans text-body text-cream/70 max-w-xs text-xs leading-relaxed">
                  Browse the complete archive of commercial campaigns, trailers, and craft edits.
                </p>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-terracotta hover:bg-[#ff8838] text-ground font-mono text-label font-semibold tracking-widest uppercase transition-colors"
                  data-cursor="Open"
                >
                  <span>ALL EDITS (52)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>

        {/* 3. Conroy Campaign Section: Looping Background Hero + 9 Reel Cards (Defect 7) */}
        <div className="relative pt-12 pb-10 border-t border-line-2 rounded-3xl overflow-hidden px-4 sm:px-8 my-10">
          {/* Continuously looping muted background of cinematic hero (works[0]) */}
          <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden bg-black">
            <Image
              src={`/posters/${conroyHero.id}.webp`}
              alt={conroyHero.title}
              fill
              sizes="100vw"
              className="object-cover opacity-50"
            />
            {!prefersReducedMotion && (
              <iframe
                src={`https://player.vimeo.com/video/${conroyHero.id}?background=1&autoplay=1&loop=1&muted=1&playsinline=1&autopause=0&dnt=1&quality=720p`}
                title={conroyHero.title}
                className="absolute inset-0 w-full h-full border-0 pointer-events-none scale-105 opacity-35"
                allow="autoplay; fullscreen; picture-in-picture"
              />
            )}
            {/* Dark scrim so cards remain readable and prominent */}
            <div className="absolute inset-0 bg-gradient-to-b from-ground/92 via-ground/85 to-ground/96" />
          </div>

          <Reveal variant="up">
            <div
              ref={conroyHeaderRef}
              className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
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

          {/* 9 Vertical Reel Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
            {conroyReels.map((reel, idx) => (
              <Reveal key={reel.id} variant="up" delay={0.04 * (idx % 3)}>
                <div
                  className="flex flex-col gap-2 group"
                  style={{ contentVisibility: 'auto', containIntrinsicSize: '260px' }}
                >
                  <VideoFrame
                    id={reel.id}
                    title={reel.title}
                    slug={reel.slug}
                    aspect="9:16"
                    duration={reel.duration}
                    tone={reel.tone}
                  />
                  <div className="flex justify-between items-center font-mono text-[0.66rem] text-muted px-1">
                    <span className="text-cream font-medium truncate pr-2 group-hover:text-terracotta transition-colors">
                      {reel.title}
                    </span>
                    <span className="text-terracotta font-semibold whitespace-nowrap">{reel.duration}s</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
