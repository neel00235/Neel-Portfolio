'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Maximize2 } from 'lucide-react';
import { GALLERY_COPY } from '@/data/content';
import { UNIQUE_WORKS } from '@/data/portfolio.generated';
import { VideoFrame } from '@/components/video/VideoFrame';
import { VideoModal, ModalWork } from '@/components/video/VideoModal';
import { Magnetic } from '@/components/cursor/Magnetic';
import { playSound } from '@/lib/sound';

export function Gallery() {
  const [activeKicker, setActiveKicker] = useState('all');
  const [modalWork, setModalWork] = useState<ModalWork | null>(null);

  // Derive counts per kicker
  const kickerCounts = {
    all: UNIQUE_WORKS.length,
    'Client work': UNIQUE_WORKS.filter((w) => w.kicker === 'Client work').length,
    Craft: UNIQUE_WORKS.filter((w) => w.kicker === 'Craft').length,
    Rhythm: UNIQUE_WORKS.filter((w) => w.kicker === 'Rhythm').length,
    'Long form': UNIQUE_WORKS.filter((w) => w.kicker === 'Long form').length,
    Study: UNIQUE_WORKS.filter((w) => w.kicker === 'Study').length,
  };

  // Filter works
  const filteredWorks =
    activeKicker === 'all'
      ? UNIQUE_WORKS
      : UNIQUE_WORKS.filter((w) => w.kicker === activeKicker);

  // Prioritize Absolute Cinema and Motion Graphics upfront in the showcase
  const displayWorks = [...filteredWorks]
    .sort((a, b) => {
      const isPriorityA = ['absolute-cinema', 'motion-graphics'].includes(a.discipline);
      const isPriorityB = ['absolute-cinema', 'motion-graphics'].includes(b.discipline);
      if (isPriorityA && !isPriorityB) return -1;
      if (!isPriorityA && isPriorityB) return 1;
      return 0;
    })
    .slice(0, 12);

  const handleFilterClick = (id: string) => {
    playSound('click');
    setActiveKicker(id);
  };

  const handleOpenModal = (work: ModalWork) => {
    playSound('click');
    setModalWork(work);
  };

  return (
    <section id="gallery" className="relative w-full py-24 px-6 md:px-12 border-b border-line overflow-hidden">
      {/* Animated square grid background */}
      <div className="absolute inset-0 pointer-events-none grid-overlay opacity-30 z-0" aria-hidden="true" />

      {/* Lightbox Zoom Modal */}
      <VideoModal work={modalWork} onClose={() => setModalWork(null)} />

      <div className="max-w-shell mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-line-2">
          <div>
            <div className="flex items-center gap-3 font-mono text-label text-terracotta tracking-widest uppercase mb-3">
              <span>{GALLERY_COPY.labelNum}</span>
              <span>/</span>
              <span>{GALLERY_COPY.navLabel}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-script text-cream/90 text-4xl sm:text-5xl -mb-3 select-none">
                {GALLERY_COPY.titleScript}
              </span>
              <h2 className="font-display font-black text-huge text-cream uppercase tracking-tight">
                {GALLERY_COPY.titleDisplay}
              </h2>
            </div>
          </div>
          <p className="font-sans text-body text-cream/70 max-w-md">
            {GALLERY_COPY.intro} Click any card to expand into the large player.
          </p>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap gap-2 mb-10">
          {GALLERY_COPY.kickerFilters.map((filter) => {
            const count = kickerCounts[filter.id as keyof typeof kickerCounts];
            const isActive = activeKicker === filter.id;

            return (
              <Magnetic key={filter.id} strength={0.16}>
                <button
                  type="button"
                  onClick={() => handleFilterClick(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-label uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-terracotta text-ground font-bold shadow-lg'
                      : 'bg-ground-2 border border-line-2 text-muted hover:text-cream hover:border-line'
                  }`}
                >
                  <span>{filter.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[0.6rem] ${
                      isActive ? 'bg-ground/20 text-ground' : 'bg-ground-3 text-muted'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              </Magnetic>
            );
          })}
        </div>

        {/* 12-Tile Showcase Grid (Tightened spacing & click to zoom) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayWorks.map((work) => (
            <div key={work.id} className="flex flex-col gap-3 group">
              <div
                onClick={() => handleOpenModal(work)}
                className="cursor-pointer relative rounded-lg overflow-hidden border border-line-2 hover:border-terracotta/60 transition-all duration-300 shadow-lg hover:-translate-y-1.5"
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
                    handleOpenModal(work);
                  }}
                  className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full bg-ground/80 backdrop-blur-md border border-line text-cream opacity-0 group-hover:opacity-100 hover:text-terracotta transition-opacity duration-200"
                  aria-label="Zoom video"
                  title="Zoom in full player"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between font-mono text-label px-1">
                <Link
                  href={`/project/${work.slug}`}
                  className="text-cream group-hover:text-terracotta transition-colors truncate pr-2 font-medium"
                >
                  {work.title}
                </Link>
                <span className="text-terracotta text-[0.68rem] font-semibold">{work.discipline}</span>
              </div>
            </div>
          ))}
        </div>

        {/* View All 52 Edits Band */}
        <div className="w-full p-8 md:p-12 rounded-2xl bg-ground-2 border border-line flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex flex-col text-center sm:text-left">
            <span className="font-mono text-label text-terracotta tracking-widest uppercase mb-1">
              FULL ARCHIVE
            </span>
            <h3 className="font-display font-black text-big text-cream uppercase">
              EXPLORE ALL 52 WORKS
            </h3>
            <p className="font-sans text-sm text-cream/70 mt-1">
              Browse the complete repository categorized across all 16 disciplines.
            </p>
          </div>

          <Magnetic strength={0.16} cursor="Open">
            <Link
              href="/projects"
              className="flex items-center gap-3 px-8 py-4 rounded-full bg-terracotta hover:bg-[#ff8838] text-ground font-mono text-label font-bold tracking-widest uppercase shadow-xl transition-all duration-200"
            >
              <span>VIEW ALL 52 EDITS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
