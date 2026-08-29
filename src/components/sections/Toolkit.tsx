'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const listContainerRef = useRef<HTMLDivElement>(null);
  const highlightBandRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const marqueeBandRef = useRef<HTMLDivElement>(null);

  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const updateMeasurementsRef = useRef<() => void>(() => {});
  const syncHighlightRef = useRef<(sy: number) => void>(() => {});

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPrefersReducedMotion(isReduced);
    if (isReduced) return;

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

      // 2. Item 8: Toolkit Highlight Band locked to viewport center with cached per-row geometry
      if (listContainerRef.current) {
        const container = listContainerRef.current;

        interface CachedRow {
          offsetTop: number;
          offsetHeight: number;
          centerTop: number;
        }

        let containerPageTop = 0;
        let cachedRows: CachedRow[] = [];
        let prevActiveIdx = -1;

        const updateMeasurements = () => {
          if (!listContainerRef.current) return;
          const c = listContainerRef.current;
          const rect = c.getBoundingClientRect();
          containerPageTop = rect.top + (window.scrollY || document.documentElement.scrollTop);

          cachedRows = [];
          rowRefs.current.forEach((row) => {
            if (row) {
              cachedRows.push({
                offsetTop: row.offsetTop,
                offsetHeight: row.offsetHeight,
                centerTop: row.offsetTop + row.offsetHeight / 2,
              });
            }
          });
        };

        const syncHighlight = (currentScrollY: number) => {
          if (cachedRows.length === 0 || !highlightBandRef.current) return;
          const viewportCenter = currentScrollY + window.innerHeight / 2;
          const relativeY = viewportCenter - containerPageTop;

          // Find row closest to the viewport center line
          let activeIdx = 0;
          let minDiff = Infinity;
          for (let i = 0; i < cachedRows.length; i++) {
            const diff = Math.abs(cachedRows[i].centerTop - relativeY);
            if (diff < minDiff) {
              minDiff = diff;
              activeIdx = i;
            }
          }

          // Snap the band onto the active row's own box so the dark text always
          // sits fully on orange. Centring it on the viewport instead leaves the
          // band straddling two rows.
          const targetRow = cachedRows[activeIdx];
          const bandH = targetRow ? targetRow.offsetHeight : 64;
          const bandY = targetRow ? targetRow.offsetTop : 0;

          highlightBandRef.current.style.height = `${bandH}px`;
          highlightBandRef.current.style.transform = `translate3d(0, ${bandY}px, 0)`;

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
              // The number keeps `text-terracotta` (and a terracotta group-hover)
              // and the badge keeps `text-muted`, so adding `text-ground` loses the
              // cascade and leaves both illegible on the orange band. An inline
              // colour outranks every utility class, hover included.
              const num = row.querySelector<HTMLElement>('.row-num');
              if (num) num.style.color = '#13100c';
              const desc = row.querySelector('.row-desc');
              if (desc) desc.classList.add('text-ground/90');
              const fullDesc = row.querySelector('.row-desc-full');
              if (fullDesc) fullDesc.classList.add('text-ground/90');
              const badge = row.querySelector<HTMLElement>('.row-badge');
              if (badge) {
                badge.style.color = 'rgba(19, 16, 12, 0.78)';
                badge.classList.add('font-bold');
              }
            } else {
              row.classList.remove('text-ground', 'font-bold');
              row.classList.add('text-cream');
              const num = row.querySelector<HTMLElement>('.row-num');
              if (num) num.style.removeProperty('color');
              const desc = row.querySelector('.row-desc');
              if (desc) desc.classList.remove('text-ground/90');
              const fullDesc = row.querySelector('.row-desc-full');
              if (fullDesc) fullDesc.classList.remove('text-ground/90');
              const badge = row.querySelector<HTMLElement>('.row-badge');
              if (badge) {
                badge.style.removeProperty('color');
                badge.classList.remove('font-bold');
              }
            }
          });
        };

        updateMeasurementsRef.current = updateMeasurements;
        syncHighlightRef.current = syncHighlight;

        updateMeasurements();
        // ScrollTrigger's global listeners are not owned by gsap.context (rule 11)
        ScrollTrigger.addEventListener('refresh', updateMeasurements);
        removeRefreshListener = () =>
          ScrollTrigger.removeEventListener('refresh', updateMeasurements);

        ScrollTrigger.create({
          trigger: sectionRef.current || container,
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

        // 4. Marquee scroll scrub velocity (scrub: true per rule 6)
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

  // When a row expands or collapses, re-run measurements and resync highlight
  useEffect(() => {
    updateMeasurementsRef.current?.();
    syncHighlightRef.current?.(window.scrollY || 0);
  }, [expandedIdx]);

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

        {/* Highlight Band List (Consolidated Authoritative Skills Presentation) */}
        <div
          ref={listContainerRef}
          className="relative w-full my-8 border border-line-2 rounded-2xl overflow-hidden bg-ground-2 shadow-2xl"
        >
            {/* Moving Highlight Band: Heights match active row, center-locked to viewport */}
            <div
              ref={highlightBandRef}
              className="absolute inset-x-0 top-0 h-[64px] bg-terracotta pointer-events-none z-10 shadow-lg"
            />

            {/* Single List Layer: Text color toggles to text-ground on active row */}
            <div className="relative z-20 divide-y divide-line-2">
              {SKILLS.map((skill, index) => {
                const isExpanded = expandedIdx === index;
                return (
                  <div
                    key={skill.name}
                    ref={(el) => {
                      rowRefs.current[index] = el;
                    }}
                    onMouseEnter={() => {
                      if (!prefersReducedMotion) setExpandedIdx(index);
                    }}
                    onMouseLeave={() => {
                      if (!prefersReducedMotion) setExpandedIdx(null);
                    }}
                    onFocus={() => setExpandedIdx(index)}
                    onBlur={() => setExpandedIdx(null)}
                    tabIndex={0}
                    role="button"
                    aria-expanded={isExpanded}
                    className="skill-row px-6 sm:px-8 py-4 flex flex-col justify-center text-cream transition-[opacity,color] duration-200 cursor-pointer group select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta"
                  >
                    <div className="flex items-center justify-between gap-4 w-full">
                      <div className="flex items-center gap-4 sm:gap-6 min-w-0 group-hover:translate-x-1.5 transition-transform duration-200">
                        <span className="row-num font-mono text-terracotta text-sm font-bold w-6 group-hover:text-terracotta transition-colors duration-200">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="row-title font-display font-bold text-base sm:text-lg truncate">
                          {skill.name}
                        </span>
                      </div>
                      {!isExpanded && (
                        <span className="row-desc font-sans text-xs sm:text-sm text-cream/70 truncate hidden md:inline max-w-md group-hover:text-cream transition-colors duration-200">
                          {skill.desc}
                        </span>
                      )}
                      <span className="row-badge font-mono text-[0.66rem] tracking-wider text-muted uppercase shrink-0">
                        DISCIPLINE
                      </span>
                    </div>

                    {/* Inner detail panel: revealed inside an overflow: hidden wrapper */}
                    {isExpanded && (
                      <div className="overflow-hidden pt-3">
                        <div className="transition-[transform,opacity] duration-200 ease-out font-sans text-xs sm:text-sm text-cream/85 max-w-3xl leading-relaxed">
                          <p className="row-desc-full font-sans text-xs sm:text-sm leading-relaxed">
                            {skill.desc}
                          </p>
                        </div>
                      </div>
                    )}
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
