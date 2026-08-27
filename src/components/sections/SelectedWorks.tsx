'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Maximize2, Play, X } from 'lucide-react';
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
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const worksRef = useRef<HTMLElement>(null);
  const worksHeaderRef = useRef<HTMLDivElement>(null);
  const leadFilmRef = useRef<HTMLDivElement>(null);
  const railContainerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const conroyHeaderRef = useRef<HTMLDivElement>(null);
  const timelineHeaderRef = useRef<HTMLDivElement>(null);
  const deckStageRef = useRef<HTMLDivElement>(null);

  // Conroy campaign works for the fanned deck: 4 representative vertical cuts in a symmetrical arc
  const conroySection = SECTIONS.find((s) => s.slug === 'brand-films');
  const conroyHero = conroySection?.works[0] || UNIQUE_WORKS[0];
  const conroyReels = conroySection?.works.slice(1, 5) || [];
  const [isFanned, setIsFanned] = useState(false);

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

  const railWorks = [...cinemaWorks, ...motionWorks, ...gfxWorks, ...otherWorks];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

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

      // 4. Lead film tone match scrub (Set piece 3)
      if (leadFilmRef.current) {
        gsap.to(leadFilmRef.current, {
          scale: 1.01,
          ease: 'none',
          scrollTrigger: {
            trigger: leadFilmRef.current,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
          },
        });
      }

      // 5. Conroy deck fan on scroll into view
      if (deckStageRef.current) {
        gsap.fromTo(
          deckStageRef.current,
          { opacity: 0.9, scale: 0.98 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: deckStageRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
              onEnter: () => setIsFanned(true),
              onLeaveBack: () => setIsFanned(false),
            },
          }
        );
      }

      // 6. Set piece 4: Pinned Horizontal Rail on desktop (min-width: 60rem per R-18)
      const mm = gsap.matchMedia();
      mm.add('(min-width: 60rem)', () => {
        if (railRef.current && railContainerRef.current) {
          gsap.to(railRef.current, {
            x: () => -(railRef.current!.scrollWidth - railContainerRef.current!.clientWidth),
            ease: 'none',
            scrollTrigger: {
              trigger: railContainerRef.current,
              start: 'top 15%',
              end: () => `+=${Math.max(800, railRef.current!.scrollWidth - window.innerWidth)}`,
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });
        }
      });
    }, worksRef);

    // Smooth horizontal scrolling on wheel inside rail (element-scoped, never window)
    const rail = railRef.current;
    if (rail) {
      const onWheel = (e: WheelEvent) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          const maxScroll = rail.scrollWidth - rail.clientWidth;
          if ((e.deltaY > 0 && rail.scrollLeft < maxScroll) || (e.deltaY < 0 && rail.scrollLeft > 0)) {
            e.preventDefault();
            rail.scrollBy({ left: e.deltaY * 1.5, behavior: 'smooth' });
          }
        }
      };
      rail.addEventListener('wheel', onWheel, { passive: false });
      return () => {
        rail.removeEventListener('wheel', onWheel);
        ctx.revert();
      };
    }

    return () => ctx.revert();
  }, []);

  const handleCardClick = (work: ModalWork) => {
    playSound('click');
    setModalWork(work);
  };

  const handleFannedCardTap = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    playSound('fan');
    if (activeCardId === id) {
      setActiveCardId(null);
    } else {
      setActiveCardId(id);
    }
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
            <div ref={timelineHeaderRef} className="flex items-center justify-between mb-8 will-change-transform">
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
          </div>
        </div>

        {/* 3. Conroy Campaign Playing Cards Fanned Deck */}
        <div className="pt-8 border-t border-line-2">
          <Reveal variant="up">
            <div
              ref={conroyHeaderRef}
              className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 will-change-transform"
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
                {WORKS_COPY.conroyIntro} Tap any card to elevate it forward and play directly in the deck.
              </p>
            </div>
          </Reveal>

          {/* Playing Cards Fanned Deck Stage */}
          <Reveal variant="scale" delay={0.15}>
            <div
              ref={deckStageRef}
              onClick={() => setActiveCardId(null)}
              className="relative w-full h-[480px] flex items-center justify-center overflow-visible select-none py-12"
            >
            <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
              {conroyReels.map((reel, idx) => {
                const centerIndex = 1.5;
                const offset = idx - centerIndex;
                const isActive = activeCardId === reel.id;

                // Symmetrical 4-card arc calculations
                const angle = isActive ? 0 : isFanned ? offset * 11 : offset * 2.2;
                const translateX = isActive ? 0 : isFanned ? offset * 135 : offset * 8;
                const translateY = isActive ? -60 : isFanned ? Math.abs(offset) * 16 : 0;
                const scale = isActive ? 1.25 : 1;
                const zIndex = isActive ? 50 : 10 + idx;

                return (
                  <div
                    key={reel.id}
                    onClick={(e) => handleFannedCardTap(e, reel.id)}
                    className={`conroy-card absolute w-44 md:w-52 aspect-[9/16] rounded-2xl overflow-hidden border transition-all duration-500 ease-out cursor-pointer will-change-transform ${
                      isActive
                        ? 'border-terracotta shadow-[0_28px_60px_-10px_rgba(246,124,41,0.4)] bg-ground'
                        : 'border-line-2 hover:border-terracotta/70 hover:scale-105 shadow-2xl bg-ground-2'
                    }`}
                    style={{
                      transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${angle}deg) scale(${scale})`,
                      zIndex,
                    }}
                    data-cursor={isActive ? 'Close' : 'Play'}
                  >
                    {/* If Active: Autoplay video in elevated card */}
                    {isActive ? (
                      <div className="relative w-full h-full bg-black">
                        <iframe
                          src={`https://player.vimeo.com/video/${reel.id}?autoplay=1&muted=0&loop=1&playsinline=1&controls=1&quality=720p`}
                          title={reel.title}
                          className="w-full h-full border-0"
                          allow="autoplay; fullscreen; picture-in-picture"
                        />
                        {/* Close affordance */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCardId(null);
                          }}
                          className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-ground/95 md:bg-ground/80 md:backdrop-blur-md text-cream hover:text-terracotta border border-line"
                          aria-label="Dock card"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <VideoFrame
                          id={reel.id}
                          title={reel.title}
                          slug={reel.slug}
                          aspect={reel.aspect}
                          duration={reel.duration}
                          tone={reel.tone}
                        />
                        {/* Fanned Card Label Overlay */}
                        <div className="absolute inset-x-0 bottom-0 z-10 p-3 bg-gradient-to-t from-ground/95 via-ground/70 to-transparent flex flex-col gap-1 font-mono text-[0.62rem] text-cream">
                          <div className="flex items-center justify-between">
                            <span className="truncate pr-1 font-bold">{reel.title}</span>
                            <span className="text-terracotta font-bold flex items-center gap-1">
                              <Play className="w-2.5 h-2.5 fill-current" /> TAP
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted">
                            <span>{reel.discipline}</span>
                            <span>·</span>
                            <span className="px-1 py-0.2 rounded bg-line/60 text-terracotta font-semibold">{reel.aspect}</span>
                            <span>·</span>
                            <span>{reel.duration}s</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
