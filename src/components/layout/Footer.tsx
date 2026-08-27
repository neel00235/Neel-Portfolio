'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { THANKYOU_COPY } from '@/data/content';
import { playSound } from '@/lib/sound';
import { Magnetic } from '@/components/cursor/Magnetic';
import { useLenis } from '@/lib/lenis';
import { Reveal } from '@/components/motion/Reveal';
import { SplitText } from '@/components/motion/SplitText';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Footer() {
  const lenis = useLenis();
  const footerRef = useRef<HTMLElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const [timecode, setTimecode] = useState('00:00:00:00');

  useEffect(() => {
    // High-precision ~10 Hz timecode ticker (100ms interval, zero dropped frames)
    let frameIndex = 0;
    if (typeof window !== 'undefined') {
      (window as unknown as { __footerTicks: Array<{ frameIndex: number; tc: string; t: number }> }).__footerTicks = [];
    }
    const interval = setInterval(() => {
      frameIndex++;
      const frames = frameIndex % 10;
      const totalSeconds = Math.floor(frameIndex / 10);
      const seconds = totalSeconds % 60;
      const totalMinutes = Math.floor(totalSeconds / 60);
      const minutes = totalMinutes % 60;
      const hours = Math.floor(totalMinutes / 60) % 24;

      const tc = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
      setTimecode(tc);
      if (typeof window !== 'undefined') {
        const win = window as unknown as { __footerTicks?: Array<{ frameIndex: number; tc: string; t: number }> };
        if (win.__footerTicks) {
          win.__footerTicks.push({ frameIndex, tc, t: performance.now() });
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Star pulse / scale trigger
      if (starRef.current) {
        gsap.fromTo(
          starRef.current,
          { scale: 0.9, opacity: 0.7 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: starRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 2. Footer signature parallax scrub
      if (footerRef.current) {
        gsap.fromTo(
          footerRef.current.querySelector('.font-script'),
          { y: 20 },
          {
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: footerRef.current,
              start: 'top 85%',
              end: 'bottom bottom',
              scrub: true,
            },
          }
        );
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    playSound('click');
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer ref={footerRef} id="thankyou" className="relative w-full bg-ground border-t border-line pt-24 pb-16 px-6 md:px-12 overflow-hidden">
      {/* Background tone radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-tone-glow opacity-30" />

      <div className="max-w-shell mx-auto flex flex-col items-center text-center">
        {/* Star header label */}
        <Reveal variant="fade">
          <div ref={starRef} className="font-mono text-label text-terracotta tracking-[0.3em] uppercase mb-8">
            ✦ {THANKYOU_COPY.labelStar} ✦
          </div>
        </Reveal>

        {/* Cursive Name Accent */}
        <Reveal variant="fade" delay={0.06}>
          <div className="font-script text-cream/90 text-[clamp(3.5rem,8vw,7.5rem)] leading-none -mb-4 select-none">
            {THANKYOU_COPY.script}
          </div>
        </Reveal>

        {/* Display Thank You */}
        <h2 className="font-display font-black text-mega text-cream uppercase tracking-tight mb-8 font-variation-wonk">
          <SplitText text={THANKYOU_COPY.display} by="char" />
        </h2>

        {/* Verbatim B44 Lead */}
        <Reveal variant="up" delay={0.1}>
          <p className="max-w-2xl font-serif text-lead text-cream/80 leading-relaxed mb-12 italic">
            &ldquo;{THANKYOU_COPY.lead}&rdquo;
          </p>
        </Reveal>

        {/* Back to top magnetic button */}
        <Reveal variant="up" delay={0.15}>
          <Magnetic strength={0.4} cursor="Top">
            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-line hover:border-terracotta text-cream hover:text-terracotta font-mono text-label tracking-widest uppercase transition-all duration-300 mb-16"
            >
              <span>{THANKYOU_COPY.backToTop}</span>
              <ArrowUp className="w-4 h-4" />
            </button>
          </Magnetic>
        </Reveal>

        {/* Subfooter */}
        <Reveal variant="up" delay={0.2} className="w-full">
          <div className="w-full pt-8 border-t border-line-2 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-label text-muted">
            <span>{THANKYOU_COPY.footer}</span>
            <div className="footer-timecode flex items-center gap-2 font-mono text-[0.68rem] text-terracotta tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulseDot" />
              <span className="text-muted">TC</span>
              <span className="tabular-nums font-bold text-cream bg-ground-2 px-2 py-0.5 rounded border border-line-2">
                {timecode}
              </span>
              <span className="text-muted">24 FPS</span>
            </div>
            <span>© {THANKYOU_COPY.copyrightYear}</span>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
