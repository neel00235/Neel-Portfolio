'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TOOLKIT_COPY } from '@/data/content';
import { SKILLS } from '@/data/portfolio.generated';
import { Reveal } from '@/components/motion/Reveal';
import { SplitText } from '@/components/motion/SplitText';

gsap.registerPlugin(ScrollTrigger);

export function Toolkit() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const highlightBandRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const marqueeBandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const cards = el.querySelectorAll('.skill-card');
    let removeRefreshListener: (() => void) | null = null;
    const ctx = gsap.context(() => {
      // 1. Header trigger
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
              once: true,
            },
          }
        );
      }

      // 2. Skill cards stagger trigger
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
            once: true,
          },
        }
      );

      // Defect 10: Toolkit Highlight Band driven by row closest to viewport centre (no pin per rule 7)
      if (listContainerRef.current) {
        const container = listContainerRef.current;
        const total = SKILLS.length;

        // Cache container geometry on setup and refresh; never read clientHeight in onUpdate (rule 4)
        let containerPageTop = 0;
        let containerH = 960;
        let rowH = 64;
        let prevActiveIdx = -1;

        const updateMeasurements = () => {
          if (!container) return;
          const rect = container.getBoundingClientRect();
          containerPageTop = rect.top + (window.scrollY || document.documentElement.scrollTop);
          containerH = rect.height || 960;
          rowH = containerH / total;
        };

        const syncHighlight = (currentScrollY: number) => {
          const viewportCenter = currentScrollY + window.innerHeight / 2;
          const relativeY = viewportCenter - containerPageTop;
          const activeIdx = Math.max(0, Math.min(total - 1, Math.floor(relativeY / rowH)));

          // Snap orange band to the active row
          if (highlightBandRef.current) {
            const bandY = activeIdx * rowH;
            highlightBandRef.current.style.transform = `translate3d(0, ${bandY}px, 0)`;
          }

          // Bail early if activeIdx has not changed (rule 4 & defect 10)
          if (activeIdx === prevActiveIdx) return;
          prevActiveIdx = activeIdx;

          // Single text-ground class toggle on active row + softened dimming floor (0.45)
          rowRefs.current.forEach((row, i) => {
            if (!row) return;
            const isActive = i === activeIdx;
            const dist = Math.abs(i - activeIdx);

            // Opacity floor softened to ~0.45 so rows never read as blank
            row.style.opacity = String(Math.max(0.45, 1 - dist * 0.15));

            if (isActive) {
              row.classList.add('text-ground', 'font-bold');
              row.classList.remove('text-cream');
              const num = row.querySelector('.row-num');
              if (num) num.classList.add('text-ground');
              const desc = row.querySelector('.row-desc');
              if (desc) desc.classList.add('text-ground/90');
              const badge = row.querySelector('.row-badge');
              if (badge) badge.classList.add('text-ground', 'font-bold');
            } else {
              row.classList.remove('text-ground', 'font-bold');
              row.classList.add('text-cream');
              const num = row.querySelector('.row-num');
              if (num) num.classList.remove('text-ground');
              const desc = row.querySelector('.row-desc');
              if (desc) desc.classList.remove('text-ground/90');
              const badge = row.querySelector('.row-badge');
              if (badge) badge.classList.remove('text-ground', 'font-bold');
            }
          });
        };

        updateMeasurements();
        // ScrollTrigger's global listeners are not owned by gsap.context, so
        // hand the remover up to the effect cleanup rather than leaking it.
        ScrollTrigger.addEventListener('refresh', updateMeasurements);
        removeRefreshListener = () =>
          ScrollTrigger.removeEventListener('refresh', updateMeasurements);

        ScrollTrigger.create({
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => syncHighlight(self.scroll()),
          onRefresh: (self) => syncHighlight(self.scroll()),
        });

        // Initial sync
        syncHighlight(window.scrollY || 0);
      }

      // 3. Set Piece 5: Marquee Band Scale (desktop)
      if (marqueeBandRef.current) {
        const mm = gsap.matchMedia();
        mm.add('(min-width: 60rem)', () => {
          gsap.to(marqueeBandRef.current, {
            scale: 1.02,
            ease: 'none',
            scrollTrigger: {
              trigger: marqueeBandRef.current,
              start: 'top 85%',
              end: '+=60%',
              scrub: true,
            },
          });
        });

        // 4. Marquee scroll scrub velocity (scrub: true per rule 6 & defect 11)
        gsap.to(marqueeBandRef.current.querySelector('.animate-marquee'), {
          x: -120,
          ease: 'none',
          scrollTrigger: {
            trigger: marqueeBandRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => {
      removeRefreshListener?.();
      ctx.revert();
    };
  }, []);

  // Singled out cards for richer hover treatment: colour grading, after effects, video rescue
  const isSpecialCard = (name: string) => {
    const n = name.toLowerCase();
    return n.includes('colour grading') || n.includes('after effects') || n.includes('video rescue');
  };

  return (
    <section ref={sectionRef} id="skills" className="relative w-full py-24 border-b border-line overflow-hidden">
      {/* Animated square grid background */}
      <div className="absolute inset-0 pointer-events-none grid-overlay opacity-30 z-0" aria-hidden="true" />

      <div className="max-w-shell mx-auto px-6 md:px-12 mb-16 relative z-10">
        {/* Section Header */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-line-2">
          <div>
            <Reveal variant="fade">
              <div className="flex items-center gap-3 font-mono text-label text-terracotta tracking-widest uppercase mb-3">
                <span>{TOOLKIT_COPY.labelNum}</span>
                <span>/</span>
                <span>{TOOLKIT_COPY.navLabel}</span>
              </div>
            </Reveal>
            <h2 className="font-display font-black text-huge text-cream uppercase tracking-tight font-variation-wonk">
              <SplitText text={TOOLKIT_COPY.title} by="char" />
            </h2>
          </div>
          <Reveal variant="up" delay={0.1}>
            <div className="flex flex-col md:items-end gap-1">
              <p className="font-sans text-body text-cream/70 max-w-md">
                {TOOLKIT_COPY.intro}
              </p>
              <span className="font-mono text-[0.68rem] text-muted tracking-wider uppercase">
                {TOOLKIT_COPY.metaCore}
              </span>
            </div>
          </Reveal>
        </div>

        {/* Highlight Band List (No clip-path, single text-ground toggle, hover states) */}
        <Reveal variant="up">
          <div
            ref={listContainerRef}
            className="relative w-full my-8 border border-line-2 rounded-2xl overflow-hidden bg-ground-2 shadow-2xl"
          >
            {/* Moving Highlight Band: 1 Row Tall */}
            <div
              ref={highlightBandRef}
              className="absolute inset-x-0 top-0 h-[64px] bg-terracotta pointer-events-none z-10 shadow-lg"
            />

            {/* Single List Layer: Text color toggles to text-ground on active row */}
            <div className="relative z-20 divide-y divide-line-2">
              {SKILLS.map((skill, index) => (
                <div
                  key={skill.name}
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  className="skill-row h-[64px] px-6 sm:px-8 flex items-center justify-between gap-4 text-cream transition-[opacity,color] duration-200 cursor-pointer group select-none"
                >
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0 group-hover:translate-x-1.5 transition-transform duration-200">
                    <span className="row-num font-mono text-terracotta text-sm font-bold w-6 group-hover:text-terracotta transition-colors duration-200">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="row-title font-display font-bold text-base sm:text-lg truncate">
                      {skill.name}
                    </span>
                  </div>
                  <span className="row-desc font-sans text-xs sm:text-sm text-cream/70 truncate hidden md:inline max-w-md group-hover:text-cream transition-colors duration-200">
                    {skill.desc}
                  </span>
                  <span className="row-badge font-mono text-[0.66rem] tracking-wider text-muted uppercase shrink-0">
                    DISCIPLINE
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 15 Skills Grid with Static Shadow & Explicit Transitions */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          {SKILLS.map((skill, index) => {
            const featured = isSpecialCard(skill.name);
            return (
              <Reveal key={skill.name} variant="up" delay={0.03 * (index % 6)}>
                <div
                  className={`skill-card p-6 rounded-xl bg-ground-2 border border-line-2 hover:border-terracotta/60 hover:-translate-y-2 shadow-lg transition-[transform,border-color] duration-300 flex flex-col gap-3 group h-full ${
                    featured ? 'hover:border-terracotta' : ''
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-label text-muted">
                    <span
                      className={`font-bold text-sm text-terracotta inline-block transition-transform duration-200 ${
                        featured ? 'group-hover:scale-110 group-hover:rotate-6' : 'group-hover:scale-105'
                      }`}
                    >
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
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Set Piece 5: Skills Marquee Band Inversion */}
      <Reveal variant="up">
        <div ref={marqueeBandRef} className="relative w-full py-6 bg-terracotta text-ground overflow-hidden font-display font-black text-2xl md:text-3xl tracking-wider uppercase select-none shadow-2xl z-10">
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
      </Reveal>
    </section>
  );
}
