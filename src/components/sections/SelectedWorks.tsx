'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { WORKS_COPY } from '@/data/content';
import { SECTIONS, UNIQUE_WORKS } from '@/data/portfolio.generated';
import { VideoFrame } from '@/components/video/VideoFrame';
import { playSound } from '@/lib/sound';

export function SelectedWorks() {
  const [isDeckFanned, setIsDeckFanned] = useState(false);

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
  const cinemaWorks = cinemaSection?.works.slice(1) || [];
  const motionWorks = motionSection?.works || [];
  const gfxWorks = eventGfxSection?.works || [];
  const otherWorks = UNIQUE_WORKS.filter(
    (w) =>
      w.id !== leadFilm.id &&
      !['absolute-cinema', 'motion-graphics', 'event-gfx'].includes(w.discipline)
  );

  const railWorks = [...cinemaWorks, ...motionWorks, ...gfxWorks, ...otherWorks];

  const toggleDeck = () => {
    playSound('fan');
    setIsDeckFanned(!isDeckFanned);
  };

  return (
    <section id="works" className="relative w-full py-24 px-6 md:px-12 border-b border-line overflow-hidden">
      <div className="max-w-shell mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-line-2">
          <div>
            <div className="flex items-center gap-3 font-mono text-label text-terracotta tracking-widest uppercase mb-3">
              <span>{WORKS_COPY.labelNum}</span>
              <span>/</span>
              <span>{WORKS_COPY.navLabel}</span>
            </div>
            <h2 className="font-display font-black text-huge text-cream uppercase tracking-tight">
              {WORKS_COPY.title}
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
            <span>{leadFilm.title} · {leadFilm.aspect} · {leadFilm.duration}S</span>
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

        {/* 2. Timeline Selections Rail */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display font-bold text-big text-cream uppercase">
              {WORKS_COPY.railHeading}
            </h3>
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
                <VideoFrame
                  id={work.id}
                  title={work.title}
                  slug={work.slug}
                  aspect={work.aspect}
                  duration={work.duration}
                  tone={work.tone}
                />
                <div className="flex items-center justify-between font-mono text-label text-muted">
                  <span className="text-cream group-hover:text-terracotta transition-colors truncate pr-2">
                    {work.title}
                  </span>
                  <span>{work.duration}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Conroy Campaign Fanned Deck (Set Piece 4) */}
        <div className="pt-8 border-t border-line-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="font-mono text-label text-terracotta tracking-widest uppercase block mb-2">
                {WORKS_COPY.conroyHint}
              </span>
              <h3 className="font-display font-bold text-big text-cream uppercase">
                {WORKS_COPY.conroyHeading}
              </h3>
            </div>
            <p className="font-sans text-body text-cream/70 max-w-md">
              {WORKS_COPY.conroyIntro}
            </p>
          </div>

          {/* Interactive Fanned Deck Container */}
          <div
            onClick={toggleDeck}
            className="cursor-pointer py-8 flex flex-col items-center"
            data-cursor="Drag"
          >
            <div className="relative w-full max-w-4xl h-96 flex items-center justify-center">
              {conroyReels.map((reel, idx) => {
                // Fan calculations
                const angle = isDeckFanned ? (idx - 4) * 8 : (idx - 4) * 2;
                const translateX = isDeckFanned ? (idx - 4) * 75 : (idx - 4) * 15;
                const translateY = isDeckFanned ? Math.abs(idx - 4) * 10 : 0;
                const zIndex = 10 + idx;

                return (
                  <div
                    key={reel.id}
                    className="absolute w-44 md:w-52 aspect-[9/16] rounded-lg overflow-hidden border border-line-2 shadow-2xl transition-all duration-500 ease-out hover:z-40 hover:scale-108 hover:-translate-y-4"
                    style={{
                      transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${angle}deg)`,
                      zIndex: zIndex,
                    }}
                  >
                    <VideoFrame
                      id={reel.id}
                      title={reel.title}
                      slug={reel.slug}
                      aspect="9:16"
                      duration={reel.duration}
                      tone={reel.tone}
                    />
                  </div>
                );
              })}
            </div>
            <p className="font-mono text-label text-muted tracking-widest uppercase mt-6">
              {isDeckFanned ? 'TAP TO COLLAPSE DECK' : 'TAP OR CLICK TO FAN REELS (10 DELIVERABLES)'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
