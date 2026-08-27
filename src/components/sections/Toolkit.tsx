'use client';

import React from 'react';
import { TOOLKIT_COPY } from '@/data/content';
import { SKILLS } from '@/data/portfolio.generated';

export function Toolkit() {
  return (
    <section id="skills" className="relative w-full py-24 border-b border-line overflow-hidden">
      <div className="max-w-shell mx-auto px-6 md:px-12 mb-16">
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

        {/* 15 Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-12">
          {SKILLS.map((skill, index) => (
            <div
              key={skill.name}
              className="p-6 rounded-xl bg-ground-2 border border-line-2 hover:border-line hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3 group"
            >
              <div className="flex items-center justify-between font-mono text-label text-muted">
                <span className="text-terracotta font-semibold">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <span className="text-[0.6rem] tracking-widest uppercase">DISCIPLINE</span>
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
      <div className="relative w-full py-6 bg-terracotta text-ground overflow-hidden font-display font-black text-2xl md:text-3xl tracking-wider uppercase select-none shadow-2xl">
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
