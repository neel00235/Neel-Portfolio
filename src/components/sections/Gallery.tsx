'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Maximize2 } from 'lucide-react';
import { GALLERY_COPY } from '@/data/content';
import { UNIQUE_WORKS } from '@/data/portfolio.generated';
import { VideoFrame } from '@/components/video/VideoFrame';
import { useLightbox } from '@/components/video/LightboxProvider';
import { Magnetic } from '@/components/cursor/Magnetic';
import { playSound } from '@/lib/sound';
import { Reveal } from '@/components/motion/Reveal';
import { SplitText } from '@/components/motion/SplitText';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/dist/Flip';

gsap.registerPlugin(ScrollTrigger, Flip);

export function Gallery() {
  const { open } = useLightbox();
  const [activeKicker, setActiveKicker] = useState('all');

  const galleryRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const archiveBandRef = useRef<HTMLDivElement>(null);

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

  // Prioritize Rhythm first, Long form second per Item 7c
  const getKickerPriority = (kicker?: string) => {
    if (kicker === 'Rhythm') return 1;
    if (kicker === 'Long form') return 2;
    if (kicker === 'Client work') return 3;
    if (kicker === 'Craft') return 4;
    if (kicker === 'Study') return 5;
    return 6;
  };

  const displayWorks = [...filteredWorks]
    .sort((a, b) => {
      const pA = getKickerPriority(a.kicker);
      const pB = getKickerPriority(b.kicker);
      if (pA !== pB) return pA - pB;
      return 0;
    })
    .slice(0, 12);

  const handleFilterClick = (id: string) => {
    playSound('click');
    if (gridRef.current) {
      const tiles = gridRef.current.querySelectorAll('.gallery-tile');
      const state = Flip.getState(tiles);
      setActiveKicker(id);
      requestAnimationFrame(() => {
        if (gridRef.current) {
          Flip.from(state, {
            duration: 0.6,
            ease: 'power2.inOut',
            stagger: 0.02,
            absolute: true,
          });
        }
      });
    } else {
      setActiveKicker(id);
    }
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Gallery header trigger
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 2. Filter bar trigger
      if (filterBarRef.current) {
        gsap.fromTo(
          filterBarRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: filterBarRef.current,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 3. Archive band trigger
      if (archiveBandRef.current) {
        gsap.fromTo(
          archiveBandRef.current,
          { opacity: 0, scale: 0.96 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: archiveBandRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, galleryRef);

    return () => ctx.revert();
  }, []);

  const handleOpenModal = (work: (typeof UNIQUE_WORKS)[0]) => {
    playSound('click');
    open(work);
  };

  return (
    <section ref={galleryRef} id="gallery" className="relative w-full py-24 px-6 md:px-12 border-b border-line overflow-hidden">
      <div className="max-w-shell mx-auto relative z-10">
        {/* Section Header */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-line-2">
          <div>
            <Reveal variant="fade">
              <div className="flex items-center gap-3 font-mono text-label text-terracotta tracking-widest uppercase mb-3 animate-text-breathe [animation-duration:8.2s] [animation-delay:-1.0s]">
                <span>{GALLERY_COPY.labelNum}</span>
                <span>/</span>
                <span>{GALLERY_COPY.navLabel}</span>
              </div>
            </Reveal>
            <div className="flex flex-col">
              <Reveal variant="fade" delay={0.06}>
                <span className="font-script text-cream/90 text-4xl sm:text-5xl -mb-3 select-none animate-text-breathe [animation-duration:6.4s] [animation-delay:-2.7s]">
                  {GALLERY_COPY.titleScript}
                </span>
              </Reveal>
              <h2 className="font-taurian text-huge text-cream uppercase tracking-wide">
                <SplitText text={GALLERY_COPY.titleDisplay} by="char" />
              </h2>
            </div>
          </div>
          <Reveal variant="up" delay={0.1}>
            <p className="font-sans text-body text-cream/70 max-w-md">
              {GALLERY_COPY.intro} Click any card to expand into the large player.
            </p>
          </Reveal>
        </div>

        {/* Filter Chips Bar */}
        <Reveal variant="up" delay={0.15}>
          <div ref={filterBarRef} className="flex flex-wrap gap-2 mb-10">
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
        </Reveal>

        {/* 12-Tile Showcase Grid (cheaper wrapper for skew per Defect 8) */}
        <div ref={gridRef} className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {displayWorks.map((work, idx) => (
            <Reveal key={work.id} variant="up" delay={0.04 * (idx % 6)}>
              <div className="gallery-tile flex flex-col gap-3 group">
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${work.title} video`}
                  onClick={() => handleOpenModal(work)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenModal(work);
                    }
                  }}
                  className="cursor-pointer relative rounded-lg overflow-hidden border border-line-2 hover:border-terracotta/60 transition-[transform,border-color,box-shadow] duration-300 shadow-lg hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
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
                    className="absolute top-2.5 right-2.5 z-20 p-2 md:p-1.5 rounded-full bg-ground/95 md:bg-ground/80 md:backdrop-blur-md border border-line text-cream opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:text-terracotta transition-opacity duration-200"
                    aria-label="Zoom video"
                    title="Zoom in full player"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-1 px-1">
                  <div className="flex items-center justify-between font-mono text-label">
                    <Link
                      href={`/project/${work.slug}`}
                      className="text-cream group-hover:text-terracotta transition-colors truncate pr-2 font-display font-bold"
                    >
                      {work.title}
                    </Link>
                    <span className="text-terracotta text-xs font-semibold uppercase">
                      {work.discipline.replace(/-/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[0.66rem] text-muted">
                    <span className="px-1.5 py-0.5 rounded bg-line/60 border border-line-2 text-terracotta font-semibold">{work.aspect}</span>
                    <span>·</span>
                    <span>{work.duration}s</span>
                  </div>
                </div>
              </div>
            </Reveal>
            ))}
          </div>
        </div>

        {/* View All 52 Edits Band */}
        <Reveal variant="up" delay={0.15}>
          <div ref={archiveBandRef} className="w-full p-8 md:p-12 rounded-2xl bg-ground-2 border border-line flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex flex-col text-center sm:text-left">
              <span className="font-mono text-label text-terracotta tracking-widest uppercase mb-1 animate-text-breathe [animation-duration:7.4s] [animation-delay:-0.6s]">
                FULL ARCHIVE
              </span>
              <h3 className="font-taurian text-big text-cream uppercase tracking-wide">
                <SplitText text="EXPLORE ALL 52 WORKS" by="char" />
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
        </Reveal>
      </div>
    </section>
  );
}
