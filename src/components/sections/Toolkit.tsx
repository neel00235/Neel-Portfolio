'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TOOLKIT_COPY } from '@/data/content';
import { SKILLS } from '@/data/portfolio.generated';
import { Reveal } from '@/components/motion/Reveal';
import { SplitText } from '@/components/motion/SplitText';
import { EASE, DUR } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

export function Toolkit() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const marqueeBandRef = useRef<HTMLDivElement>(null);

  const descRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPrefersReducedMotion(isReduced);
    if (isReduced) return;

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

      // 2. Set Piece 5: Marquee Band Scale (desktop)
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

        // 3. Marquee scroll scrub velocity (scrub: true per rule 6)
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
      ctx.revert();
    };
  }, []);

  const handleRowEnter = (index: number) => {
    if (!prefersReducedMotion) {
      setExpandedIdx(index);
      const desc = descRefs.current[index];
      const inner = innerRefs.current[index];
      if (desc && inner) {
        const targetH = inner.offsetHeight;
        gsap.to(desc, { height: targetH, duration: DUR.fast, ease: EASE.io, overwrite: 'auto' });
        gsap.to(inner, { opacity: 1, y: 0, duration: DUR.fast, ease: EASE.io, overwrite: 'auto' });
      }
    }
  };

  const handleRowLeave = (index: number) => {
    if (!prefersReducedMotion) {
      setExpandedIdx(null);
      const desc = descRefs.current[index];
      const inner = innerRefs.current[index];
      if (desc && inner) {
        gsap.to(desc, { height: 0, duration: DUR.fast, ease: EASE.io, overwrite: 'auto' });
        gsap.to(inner, { opacity: 0, y: -4, duration: 0.14, ease: EASE.io, overwrite: 'auto' });
      }
    }
  };

  const handleRowFocus = (index: number) => {
    setExpandedIdx(index);
    const desc = descRefs.current[index];
    const inner = innerRefs.current[index];
    if (desc && inner) {
      const targetH = inner.offsetHeight;
      gsap.to(desc, { height: targetH, duration: DUR.fast, ease: EASE.io, overwrite: 'auto' });
      gsap.to(inner, { opacity: 1, y: 0, duration: DUR.fast, ease: EASE.io, overwrite: 'auto' });
    }
  };

  const handleRowBlur = (index: number) => {
    setExpandedIdx(null);
    const desc = descRefs.current[index];
    const inner = innerRefs.current[index];
    if (desc && inner) {
      gsap.to(desc, { height: 0, duration: DUR.fast, ease: EASE.io, overwrite: 'auto' });
      gsap.to(inner, { opacity: 0, y: -4, duration: 0.14, ease: EASE.io, overwrite: 'auto' });
    }
  };

  return (
    <section ref={sectionRef} id="skills" className="relative w-full py-24 border-b border-line overflow-hidden">
      <div className="max-w-shell mx-auto px-6 md:px-12 mb-16 relative z-10">
        {/* Section Header */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-line-2">
          <div>
            <Reveal variant="fade">
              <div className="flex items-center gap-3 font-mono text-label text-terracotta tracking-widest uppercase mb-3 animate-text-breathe [animation-duration:7.9s] [animation-delay:-3.1s]">
                <span>{TOOLKIT_COPY.labelNum}</span>
                <span>/</span>
                <span>{TOOLKIT_COPY.navLabel}</span>
              </div>
            </Reveal>
            <h2 className="font-taurian text-huge text-cream uppercase tracking-wide">
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

        {/* Highlight Band List (Consolidated Authoritative Skills Presentation) */}
        <div
          ref={listContainerRef}
          className="relative w-full my-8 border border-line-2 rounded-2xl overflow-hidden bg-ground-2 shadow-2xl"
        >
            {/* Single List Layer: Text color and highlight managed declaratively via group-hover */}
            <div className="relative z-20 divide-y divide-line-2">
              {SKILLS.map((skill, index) => {
                const isExpanded = expandedIdx === index;
                return (
                  <div
                    key={skill.name}
                    onMouseEnter={() => handleRowEnter(index)}
                    onMouseLeave={() => handleRowLeave(index)}
                    onFocus={() => handleRowFocus(index)}
                    onBlur={() => handleRowBlur(index)}
                    tabIndex={0}
                    role="button"
                    aria-expanded={isExpanded}
                    className="skill-row relative px-6 sm:px-8 py-4 flex flex-col justify-center text-cream hover:text-ground hover:font-bold transition-[color] duration-150 cursor-pointer group select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta group-hover:text-ground group-hover:font-bold"
                  >
                    {/* Row-local highlight. Sized by the row itself, so it always covers the
                        full box including the expanded description — nothing to measure. */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-transparent group-hover:bg-terracotta group-focus-visible:bg-terracotta transition-colors duration-150 ease-io pointer-events-none"
                    />

                    <div className="relative z-10 flex flex-col justify-center w-full">
                      <div className="flex items-center justify-between gap-4 w-full">
                        <div className="flex items-center gap-4 sm:gap-6 min-w-0 group-hover:translate-x-1.5 transition-transform duration-200">
                          <span className="row-num font-mono text-terracotta text-sm font-bold w-6 group-hover:text-ground transition-colors duration-150">
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                          <span className="row-title font-display font-bold text-base sm:text-lg truncate group-hover:text-ground transition-colors duration-150">
                            {skill.name}
                          </span>
                        </div>
                        {!isExpanded && (
                          <span className="row-desc font-sans text-xs sm:text-sm text-cream/70 truncate hidden md:inline max-w-md group-hover:text-ground/90 transition-colors duration-150">
                            {skill.desc}
                          </span>
                        )}
                        <span className="row-badge font-mono text-[0.66rem] tracking-wider text-muted uppercase shrink-0 group-hover:text-ground/75 group-hover:font-bold transition-colors duration-150">
                          DISCIPLINE
                        </span>
                      </div>

                      {/* Inner detail panel: animated with GSAP on hover */}
                      <div
                        ref={(el) => {
                          descRefs.current[index] = el;
                        }}
                        className="overflow-hidden"
                        style={{ height: 0 }}
                      >
                        <div
                          ref={(el) => {
                            innerRefs.current[index] = el;
                          }}
                          className="pt-3"
                          style={{ opacity: 0, transform: 'translate3d(0, -4px, 0)' }}
                        >
                          <p className="row-desc-full font-sans text-xs sm:text-sm leading-relaxed group-hover:text-ground/90 transition-colors duration-150">
                            {skill.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
