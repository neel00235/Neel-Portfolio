'use client';

import React from 'react';
import { ArrowUp } from 'lucide-react';
import { THANKYOU_COPY } from '@/data/content';
import { playSound } from '@/lib/sound';
import { Magnetic } from '@/components/cursor/Magnetic';

export function Footer() {
  const scrollToTop = () => {
    playSound('click');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="thankyou" className="relative w-full bg-ground border-t border-line pt-24 pb-16 px-6 md:px-12 overflow-hidden">
      {/* Background tone radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-tone-glow opacity-30" />

      <div className="max-w-shell mx-auto flex flex-col items-center text-center">
        {/* Star header label */}
        <div className="font-mono text-label text-terracotta tracking-[0.3em] uppercase mb-8">
          ✦ {THANKYOU_COPY.labelStar} ✦
        </div>

        {/* Cursive Name Accent */}
        <div className="font-script text-cream/90 text-[clamp(3.5rem,8vw,7.5rem)] leading-none -mb-4 select-none">
          {THANKYOU_COPY.script}
        </div>

        {/* Display Thank You */}
        <h2 className="font-display font-black text-mega text-cream uppercase tracking-tight mb-8">
          {THANKYOU_COPY.display}
        </h2>

        {/* Verbatim B44 Lead */}
        <p className="max-w-2xl font-serif text-lead text-cream/80 leading-relaxed mb-12 italic">
          &ldquo;{THANKYOU_COPY.lead}&rdquo;
        </p>

        {/* Back to top magnetic button */}
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

        {/* Subfooter */}
        <div className="w-full pt-8 border-t border-line-2 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-label text-muted">
          <span>{THANKYOU_COPY.footer}</span>
          <span>© {THANKYOU_COPY.copyrightYear}</span>
        </div>
      </div>
    </footer>
  );
}
