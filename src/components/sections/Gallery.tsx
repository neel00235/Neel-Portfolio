'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { GALLERY_COPY } from '@/data/content';
import { UNIQUE_WORKS } from '@/data/portfolio.generated';
import { VideoFrame } from '@/components/video/VideoFrame';
import { Magnetic } from '@/components/cursor/Magnetic';
import { playSound } from '@/lib/sound';

export function Gallery() {
  const [activeKicker, setActiveKicker] = useState<string>('all');

  // Compute exact first-occurrence kicker counts per XVII.7
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

  return (
    <section id="gallery" className="relative w-full py-24 px-6 md:px-12 border-b border-line overflow-hidden">
      <div className="max-w-shell mx-auto">
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
            {GALLERY_COPY.intro}
          </p>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap gap-2 mb-12">
          {GALLERY_COPY.kickerFilters.map((filter) => {
            const count = kickerCounts[filter.id as keyof typeof kickerCounts];
            const isActive = activeKicker === filter.id;

            return (
              <Magnetic key={filter.id} strength={0.2}>
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

        {/* 12-Tile Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {displayWorks.map((work) => (
            <div key={work.id} className="flex flex-col gap-3 group">
              <VideoFrame
                id={work.id}
                title={work.title}
                slug={work.slug}
                aspect={work.aspect}
                duration={work.duration}
                tone={work.tone}
              />
              <div className="flex items-center justify-between font-mono text-label">
                <Link
                  href={`/project/${work.slug}`}
                  className="text-cream group-hover:text-terracotta transition-colors truncate pr-2 font-medium"
                >
                  {work.title}
                </Link>
                <span className="text-muted text-[0.64rem]">{work.discipline}</span>
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

          <Magnetic strength={0.3} cursor="Open">
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
