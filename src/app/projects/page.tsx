'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { UNIQUE_WORKS, type Work } from '@/data/portfolio.generated';
import { VideoFrame } from '@/components/video/VideoFrame';
import { Magnetic } from '@/components/cursor/Magnetic';
import { playSound } from '@/lib/sound';
import { Footer } from '@/components/layout/Footer';
import { Reveal } from '@/components/motion/Reveal';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Flip);
}

function ProjectCard({ work }: { work: Work }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      el.style.opacity = '1';
      return;
    }

    gsap.set(el, { opacity: 0, y: 24 });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'power2.out',
            });
            observer.unobserve(el);
          }
        }
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      data-flip-id={work.id}
      className="project-card flex flex-col gap-3 group"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '380px' }}
    >
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
  );
}

export default function ProjectsPage() {
  const [activeKicker, setActiveKicker] = useState<string>('all');
  const gridRef = useRef<HTMLDivElement>(null);

  const kickerCounts = {
    all: UNIQUE_WORKS.length,
    'Client work': UNIQUE_WORKS.filter((w) => w.kicker === 'Client work').length,
    Craft: UNIQUE_WORKS.filter((w) => w.kicker === 'Craft').length,
    Rhythm: UNIQUE_WORKS.filter((w) => w.kicker === 'Rhythm').length,
    'Long form': UNIQUE_WORKS.filter((w) => w.kicker === 'Long form').length,
    Study: UNIQUE_WORKS.filter((w) => w.kicker === 'Study').length,
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'Client work', label: 'Client work' },
    { id: 'Craft', label: 'Craft' },
    { id: 'Rhythm', label: 'Rhythm' },
    { id: 'Long form', label: 'Long form' },
    { id: 'Study', label: 'Study' },
  ];

  const getDisciplinePriority = (d: string) => {
    if (d === 'absolute-cinema') return 1;
    if (d === 'motion-graphics') return 2;
    return 3;
  };

  const filteredWorks = (
    activeKicker === 'all'
      ? UNIQUE_WORKS
      : UNIQUE_WORKS.filter((w) => w.kicker === activeKicker)
  ).slice().sort((a, b) => {
    const pA = getDisciplinePriority(a.discipline);
    const pB = getDisciplinePriority(b.discipline);
    if (pA !== pB) return pA - pB;
    return 0;
  });

  const handleFilterClick = (id: string) => {
    playSound('click');
    if (id === activeKicker) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !gridRef.current) {
      setActiveKicker(id);
      return;
    }

    const cards = gridRef.current.querySelectorAll('.project-card');
    const state = Flip.getState(cards);
    setActiveKicker(id);

    requestAnimationFrame(() => {
      if (!gridRef.current) return;
      const newCards = gridRef.current.querySelectorAll('.project-card');
      Flip.from(state, {
        targets: newCards,
        duration: 0.45,
        ease: 'power2.out',
        stagger: 0.02,
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
          ),
      });
    });
  };

  return (
    <div className="pt-28 min-h-screen flex flex-col justify-between">
      <div className="max-w-shell mx-auto px-6 md:px-12 w-full pb-24">
        {/* Back Link */}
        <Reveal variant="fade">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-label text-muted hover:text-terracotta tracking-widest uppercase transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO HOME</span>
          </Link>
        </Reveal>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-line">
          <div>
            <Reveal variant="fade">
              <div className="font-mono text-label text-terracotta tracking-widest uppercase mb-2">
                COMPLETE CATALOGUE · 52 UPLOADS
              </div>
            </Reveal>
            <Reveal variant="up" delay={0.05}>
              <h1 className="font-display font-black text-huge sm:text-mega text-cream uppercase tracking-tight leading-none">
                ALL EDITS
              </h1>
            </Reveal>
          </div>
          <Reveal variant="up" delay={0.1}>
            <p className="font-sans text-body text-cream/70 max-w-md">
              The complete 52-film archive spanning client campaigns, live stage lighting,
              frame-accurate montages, anime restyling, and long-form podcasts.
            </p>
          </Reveal>
        </div>

        {/* Filter Chips Bar */}
        <Reveal variant="up" delay={0.15}>
          <div className="flex flex-wrap gap-2 mb-12">
            {filters.map((filter) => {
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
        </Reveal>

        {/* 52-Film Responsive Grid with Per-Card Animation (Defect 9) */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWorks.map((work) => (
            <ProjectCard key={work.id} work={work} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
