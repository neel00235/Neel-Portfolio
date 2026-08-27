'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SERVICES_COPY } from '@/data/content';
import { SERVICES } from '@/data/portfolio.generated';
import { Reveal } from '@/components/motion/Reveal';
import { SplitText } from '@/components/motion/SplitText';

gsap.registerPlugin(ScrollTrigger);

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

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

      // R-18 Set Piece 6: Services Sheet Stack on desktop
      const mm = gsap.matchMedia();
      mm.add('(min-width: 60rem)', () => {
        cardRefs.current.forEach((card, idx) => {
          if (!card) return;
          gsap.to(card, {
            scrollTrigger: {
              trigger: card,
              start: `top ${120 + idx * 24}px`,
              end: 'bottom 40%',
              pin: true,
              pinSpacing: false,
            },
          });
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="services" className="relative w-full py-24 px-6 md:px-12 border-b border-line overflow-hidden">
      <div className="max-w-shell mx-auto">
        {/* Section Header */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-line-2">
          <div>
            <Reveal variant="fade">
              <div className="flex items-center gap-3 font-mono text-label text-terracotta tracking-widest uppercase mb-3">
                <span>{SERVICES_COPY.labelNum}</span>
                <span>/</span>
                <span>{SERVICES_COPY.navLabel}</span>
              </div>
            </Reveal>
            <h2 className="font-display font-black text-huge text-cream uppercase tracking-tight font-variation-wonk">
              <SplitText text={SERVICES_COPY.title} by="char" />
            </h2>
          </div>
          <Reveal variant="up" delay={0.1}>
            <p className="font-sans text-body text-cream/70 max-w-md">
              {SERVICES_COPY.intro}
            </p>
          </Reveal>
        </div>

        {/* 6 Services Stacked Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => (
            <Reveal key={service.name} variant="up" delay={0.05 * index}>
              <div
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className="p-8 rounded-2xl bg-ground-2 border border-line-2 hover:border-terracotta/60 transition-all duration-300 flex flex-col justify-between gap-6 group hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(246,124,41,0.15)] shadow-lg h-full"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between font-mono text-label text-muted">
                    <span className="px-2.5 py-1 rounded bg-ground border border-line-2 text-terracotta font-semibold">
                      0{index + 1}
                    </span>
                    <span className="tracking-widest uppercase">{SERVICES_COPY.deliverableLabel}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-cream group-hover:text-terracotta transition-colors">
                    {service.name}
                  </h3>
                </div>

                <p className="font-sans text-body text-cream/70 leading-relaxed">
                  {service.desc}
                </p>

                <div className="pt-4 border-t border-line-2 font-mono text-[0.64rem] text-muted tracking-wider uppercase flex items-center justify-between">
                  <span>SCOPED PER PROJECT</span>
                  <span className="text-terracotta group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
