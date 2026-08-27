'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TOOLKIT_COPY } from '@/data/content';
import { SKILLS } from '@/data/portfolio.generated';

gsap.registerPlugin(ScrollTrigger);

export function Toolkit() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const cards = el.querySelectorAll('.skill-card');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 36, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.04,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="skills" className="relative w-full py-24 border-b border-line overflow-hidden">
      {/* Animated square grid background */}
      <div className="absolute inset-0 pointer-events-none grid-overlay opacity-30 z-0" aria-hidden="true" />

      <div className="max-w-shell mx-auto px-6 md:px-12 mb-16 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-line-2">
          <div>
            <div className="flex items-center gap-3 font-mono text-label text-terracotta tracking-widest uppercase mb-3">
              <span>{TOOLKIT_COPY.labelNum}</span>
              <span>/</span>
              <span>{TOOLKIT_COPY.navLabel}</span>
            </div>
            <h2 className="font-display font-black text-huge text-cream uppercase tracking-tight">
              {TOOLKIT_COPY.title}
            </h2>
          </div>
          <div className="flex flex-col md:items-end gap-1">
            <p className="font-sans text-body text-cream/70 max-w-md">
              {TOOLKIT_COPY.intro}
            </p>
            <span className="font-mono text-[0.68rem] text-muted tracking-wider uppercase">
              {TOOLKIT_COPY.metaCore}
            </span>
          </div>
        </div>

        {/* 15 Skills Grid with Staggered In-Animations */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-12">
          {SKILLS.map((skill, index) => (
            <div
              key={skill.name}
              className="skill-card p-6 rounded-xl bg-ground-2 border border-line-2 hover:border-terracotta/60 hover:-translate-y-2 hover:shadow-[0_16px_36px_-6px_rgba(246,124,41,0.18)] transition-all duration-300 flex flex-col gap-3 group will-change-transform"
            >
              <div className="flex items-center justify-between font-mono text-label text-muted">
                <span className="text-terracotta font-bold text-sm">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <span className="text-[0.6rem] tracking-widest uppercase text-muted/80">DISCIPLINE</span>
              </div>
              <h3 className="font-display font-bold text-lg text-cream group-hover:text-terracotta transition-colors">
                {skill.name}
              </h3>
              <p className="font-sans text-sm text-cream/70 leading-relaxed">
                {skill.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Set Piece 5: Skills Marquee Band Inversion */}
      <div className="relative w-full py-6 bg-terracotta text-ground overflow-hidden font-display font-black text-2xl md:text-3xl tracking-wider uppercase select-none shadow-2xl z-10">
        <div className="flex w-max animate-marquee">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-8 px-4 whitespace-nowrap">
              <span>COLOUR GRADING</span>
              <span>✦</span>
              <span>AFTER EFFECTS</span>
              <span>✦</span>
              <span>PREMIERE PRO</span>
              <span>✦</span>
              <span>KINETIC TYPE</span>
              <span>✦</span>
              <span>VFX & COMPOSITING</span>
              <span>✦</span>
              <span>SOUND ENGINEERING</span>
              <span>✦</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
