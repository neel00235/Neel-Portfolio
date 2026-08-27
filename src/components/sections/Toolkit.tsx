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
  const invertedLayerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const marqueeBandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const cards = el.querySelectorAll('.skill-card');
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
          },
        }
      );

      // Set Piece 5: Toolkit Highlight Band Inversion (Tracks scroll and inverts rows via clip-path: inset() per R-32)
      if (listContainerRef.current) {
        ScrollTrigger.create({
          trigger: listContainerRef.current,
          start: 'top 65%',
          end: 'bottom 45%',
          scrub: true,
          onUpdate: (self) => {
            const container = listContainerRef.current;
            if (!container) return;
            const total = SKILLS.length;
            const containerH = container.clientHeight;
            const rowH = containerH / total;
            const bandY = self.progress * (containerH - rowH);

            if (highlightBandRef.current) {
              highlightBandRef.current.style.transform = `translate3d(0, ${bandY}px, 0)`;
            }

            if (invertedLayerRef.current && containerH > 0) {
              const topPct = (bandY / containerH) * 100;
              const bottomPct = Math.max(0, 100 - ((bandY + rowH) / containerH) * 100);
              const clipValue = `inset(${topPct.toFixed(2)}% 0px ${bottomPct.toFixed(2)}% 0px)`;
              invertedLayerRef.current.style.clipPath = clipValue;
              invertedLayerRef.current.style.setProperty('-webkit-clip-path', clipValue);
            }

            const activeIdx = Math.min(total - 1, Math.floor(self.progress * total));
            rowRefs.current.forEach((row, i) => {
              if (!row) return;
              const dist = i - activeIdx;
              if (dist > 0) {
                row.style.opacity = String(Math.max(0.12, 1 - dist * 0.28));
              } else {
                row.style.opacity = '1';
              }
            });
          },
        });
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

        // 4. Marquee scroll scrub velocity
        gsap.to(marqueeBandRef.current.querySelector('.animate-marquee'), {
          x: -120,
          ease: 'none',
          scrollTrigger: {
            trigger: marqueeBandRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

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

        {/* R-32 Moving Highlight Band Inversion List */}
        <Reveal variant="up">
          <div
            ref={listContainerRef}
            className="relative w-full my-8 border border-line-2 rounded-2xl overflow-hidden bg-ground-2 shadow-2xl"
          >
            {/* Moving Highlight Band: 1 Row Tall */}
            <div
              ref={highlightBandRef}
              className="absolute inset-x-0 top-0 h-[64px] bg-terracotta pointer-events-none z-10 will-change-transform shadow-lg"
            />

            {/* Base Layer: Cream text on Ground */}
            <div className="relative z-0 divide-y divide-line-2">
              {SKILLS.map((skill, index) => (
                <div
                  key={skill.name}
                  ref={(el) => {
                    rowRefs.current[index] = el;
                  }}
                  className="skill-row h-[64px] px-6 sm:px-8 flex items-center justify-between gap-4 transition-opacity duration-200"
                >
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    <span className="font-mono text-terracotta text-sm font-bold w-6">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="font-display font-bold text-base sm:text-lg text-cream truncate">
                      {skill.name}
                    </span>
                  </div>
                  <span className="font-sans text-xs sm:text-sm text-cream/70 truncate hidden md:inline max-w-md">
                    {skill.desc}
                  </span>
                  <span className="font-mono text-[0.66rem] tracking-wider text-muted uppercase shrink-0">
                    DISCIPLINE
                  </span>
                </div>
              ))}
            </div>

            {/* Inverted Layer: Dark text revealed through clip-path: inset() per R-32 */}
            <div
              ref={invertedLayerRef}
              aria-hidden="true"
              className="toolkit-inverted-layer absolute inset-0 z-20 pointer-events-none divide-y divide-ground/20 will-change-[clip-path]"
              style={{ clipPath: 'inset(0% 0 93.33% 0)' }}
            >
              {SKILLS.map((skill, index) => (
                <div
                  key={skill.name}
                  className="h-[64px] px-6 sm:px-8 flex items-center justify-between gap-4 text-ground font-semibold select-none"
                >
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    <span className="font-mono text-ground font-black text-sm w-6">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="font-display font-black text-base sm:text-lg text-ground truncate">
                      {skill.name}
                    </span>
                  </div>
                  <span className="font-sans text-xs sm:text-sm text-ground/95 truncate hidden md:inline max-w-md font-medium">
                    {skill.desc}
                  </span>
                  <span className="font-mono text-[0.66rem] tracking-wider text-ground uppercase shrink-0 font-bold">
                    DISCIPLINE
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 15 Skills Grid with Staggered In-Animations */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          {SKILLS.map((skill, index) => (
            <Reveal key={skill.name} variant="up" delay={0.03 * (index % 6)}>
              <div
                className="skill-card p-6 rounded-xl bg-ground-2 border border-line-2 hover:border-terracotta/60 hover:-translate-y-2 hover:shadow-[0_16px_36px_-6px_rgba(246,124,41,0.18)] transition-all duration-300 flex flex-col gap-3 group will-change-transform h-full"
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
            </Reveal>
          ))}
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
