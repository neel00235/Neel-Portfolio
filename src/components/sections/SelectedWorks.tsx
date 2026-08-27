'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Maximize2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WORKS_COPY } from '@/data/content';
import { SECTIONS, UNIQUE_WORKS } from '@/data/portfolio.generated';
import { VideoFrame } from '@/components/video/VideoFrame';
import { VideoModal, ModalWork } from '@/components/video/VideoModal';
import { playSound } from '@/lib/sound';

gsap.registerPlugin(ScrollTrigger);

export function SelectedWorks() {
  const [isDeckFanned, setIsDeckFanned] = useState(true);
  const [modalWork, setModalWork] = useState<ModalWork | null>(null);

  const conroyHeaderRef = useRef<HTMLDivElement>(null);

  // Conroy campaign works for the fanned deck: 1 hero film + 9 vertical reels
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

  const railWorks = [...cinemaWorks, ...motionWorks, ...gfxWorks, ...otherWorks];

  useEffect(() => {
    const el = conroyHeaderRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  const handleCardClick = (work: ModalWork) => {
    playSound('click');
    setModalWork(work);
  };

  return (
    <section id="works" className="relative w-full py-24 px-6 md:px-12 border-b border-line overflow-hidden">
      {/* Animated Square Grid Ambient Section Background */}
      <div className="absolute inset-0 pointer-events-none grid-overlay opacity-35 z-0" aria-hidden="true" />

      {/* Lightbox Zoom Video Player Modal */}
      <VideoModal work={modalWork} onClose={() => setModalWork(null)} />

      <div className="max-w-shell mx-auto relative z-10">
        {/* Section Header with Cursive Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-line-2">
          <div>
            <div className="flex items-center gap-3 font-mono text-label text-terracotta tracking-widest uppercase mb-2">
              <span>{WORKS_COPY.labelNum}</span>
              <span>/</span>
              <span>{WORKS_COPY.navLabel}</span>
            </div>
            {/* Cursive Signature Title as requested */}
            <h2 className="font-script text-cream text-[clamp(4.5rem,10vw,8.5rem)] leading-none select-none tracking-normal drop-shadow-md">
              Selected works
            </h2>
          </div>
          <p className="font-sans text-body text-cream/70 max-w-md">
            {WORKS_COPY.intro}
          </p>
        </div>

        {/* 1. The Lead Film (Absolute Cinema Flagship) */}
        <div className="mb-24">
          <div className="flex items-center justify-between font-mono text-label text-muted tracking-widest uppercase mb-4">
            <span className="text-terracotta font-semibold">✦ {WORKS_COPY.leadLabel} · ABSOLUTE CINEMA</span>
            <span>
              {leadFilm.title} · {leadFilm.aspect} · {leadFilm.duration}S
            </span>
          </div>

          <div className="w-full max-w-5xl mx-auto rounded-xl overflow-hidden border border-line shadow-2xl transition-all duration-500 hover:border-terracotta/60 hover:shadow-terracotta/10">
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
        </div>

        {/* 2. Timeline Selections Rail (Absolute Cinema Prioritized) */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="font-mono text-label text-terracotta tracking-widest uppercase block mb-1">
                ABSOLUTE CINEMA FIRST
              </span>
              <h3 className="font-display font-black text-big text-cream uppercase">
                {WORKS_COPY.railHeading}
              </h3>
            </div>
            <span className="font-mono text-label text-muted tracking-wider uppercase">
              PAN TO BROWSE →
            </span>
          </div>

          {/* Smooth Horizontal Rail */}
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory">
            {railWorks.map((work) => (
              <div
                key={work.id}
                className="flex-shrink-0 w-80 md:w-96 snap-start flex flex-col gap-3 group"
              >
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
                  {/* Subtle Zoom Affordance Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(work);
                    }}
                    className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full bg-ground/80 backdrop-blur-md border border-line text-cream opacity-0 group-hover:opacity-100 hover:text-terracotta transition-opacity duration-200"
                    aria-label="Zoom video"
                    title="Zoom in full player"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between font-mono text-label text-muted px-1">
                  <span className="text-cream font-medium group-hover:text-terracotta transition-colors truncate pr-2">
                    {work.title}
                  </span>
                  <span className="text-terracotta font-semibold">{work.discipline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Conroy Campaign Section with Animated Text & Zoom Lightbox */}
        <div className="pt-8 border-t border-line-2">
          <div
            ref={conroyHeaderRef}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 will-change-transform"
          >
            <div>
              <span className="font-mono text-label text-terracotta tracking-widest uppercase block mb-2 font-semibold">
                {WORKS_COPY.conroyHint}
              </span>
              <h3 className="font-display font-black text-big text-cream uppercase">
                {WORKS_COPY.conroyHeading}
              </h3>
            </div>
            <p className="font-sans text-body text-cream/70 max-w-md">
              {WORKS_COPY.conroyIntro} Click any card to zoom in and play in high-definition.
            </p>
          </div>

          {/* Cards Spread View: Clean spacing, no cards covered or obscured */}
          <div className="w-full py-6">
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory items-center justify-start sm:justify-center">
              {conroyReels.map((reel, idx) => (
                <div
                  key={reel.id}
                  onClick={() => handleCardClick(reel)}
                  className="flex-shrink-0 w-44 md:w-52 aspect-[9/16] rounded-xl overflow-hidden border border-line-2 hover:border-terracotta shadow-2xl cursor-pointer transition-all duration-300 ease-out hover:-translate-y-3 hover:scale-105 group relative"
                  data-cursor="Zoom"
                >
                  <VideoFrame
                    id={reel.id}
                    title={reel.title}
                    slug={reel.slug}
                    aspect={reel.aspect}
                    duration={reel.duration}
                    tone={reel.tone}
                  />

                  {/* Zoom Overlay Indicator */}
                  <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-ground/90 via-transparent to-transparent flex items-end p-3 opacity-90 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between w-full font-mono text-[0.62rem] text-cream">
                      <span className="truncate pr-1">REEL 0{idx + 1}</span>
                      <span className="text-terracotta font-bold flex items-center gap-1">
                        <Maximize2 className="w-2.5 h-2.5" /> ZOOM
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
