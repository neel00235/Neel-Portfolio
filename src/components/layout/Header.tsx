'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, Grid } from 'lucide-react';
import { useSound } from '@/store/useSound';
import { Magnetic } from '@/components/cursor/Magnetic';
import { playSound } from '@/lib/sound';
import { Reveal } from '@/components/motion/Reveal';
import { ScrambleText } from '@/components/motion/ScrambleText';

export function Header() {
  const { soundEnabled, toggleSound, setSoundEnabled } = useSound();
  const [mounted, setMounted] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [activeSection, setActiveSection] = useState('01');

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('neel_sound_enabled');
    if (saved === 'true') {
      setSoundEnabled(true);
    }

    // Scroll listener for running section counter (R-37)
    const handleScroll = () => {
      const sections = [
        { id: 'hero', num: '01' },
        { id: 'works', num: '02' },
        { id: 'gallery', num: '03' },
        { id: 'skills', num: '04' },
        { id: 'services', num: '05' },
        { id: 'contact', num: '06' },
        { id: 'thankyou', num: '07' },
      ];
      const scrollY = window.scrollY + 300;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(sections[i].num);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setSoundEnabled]);

  const handleSoundClick = () => {
    playSound('click');
    toggleSound();
  };

  const handleGridToggle = () => {
    playSound('click');
    const next = !gridEnabled;
    setGridEnabled(next);
    document.documentElement.classList.toggle('grid-off', !next);
  };

  return (
    <header
      className="fixed top-0 inset-x-0 flex items-center justify-between px-6 py-4 md:px-12 bg-ground/95 md:bg-ground/70 md:backdrop-blur-md border-b border-line-2 transition-all duration-300"
      style={{ zIndex: 'var(--z-header)' }}
    >
      {/* Brand & Live Availability Dot */}
      <Reveal variant="down">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-display font-black text-sm tracking-widest text-cream uppercase hover:text-terracotta transition-colors"
            data-cursor="Open"
          >
            NEEL PATEL
          </Link>
          <span className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-ground-2 border border-line-2 font-mono text-[0.62rem] text-muted tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulseDot" />
            AVAILABLE
          </span>

          {/* Running Section Counter per R-37 */}
          <span className="hidden lg:flex items-center gap-1 font-mono text-[0.68rem] text-terracotta font-semibold pl-2 border-l border-line-2">
            <span>{activeSection}</span>
            <span className="text-muted">/</span>
            <span className="text-muted">07</span>
          </span>
        </div>
      </Reveal>

      {/* Nav items with ScrambleText (R-38) */}
      <Reveal variant="down" delay={0.06}>
        <nav className="hidden md:flex items-center gap-8 font-mono text-label tracking-widest uppercase text-muted">
          <Link href="/#about" className="hover:text-cream transition-colors">
            <ScrambleText text="01 / About" />
          </Link>
          <Link href="/#works" className="hover:text-cream transition-colors">
            <ScrambleText text="02 / Works" />
          </Link>
          <Link href="/projects" className="hover:text-cream transition-colors">
            <ScrambleText text="03 / Gallery (52)" />
          </Link>
          <Link href="/#skills" className="hover:text-cream transition-colors">
            <ScrambleText text="04 / Toolkit" />
          </Link>
          <Link href="/#services" className="hover:text-cream transition-colors">
            <ScrambleText text="05 / Services" />
          </Link>
          <Link href="/#contact" className="hover:text-cream transition-colors">
            <ScrambleText text="06 / Contact" />
          </Link>
        </nav>
      </Reveal>

      {/* Actions */}
      <Reveal variant="down" delay={0.12}>
        <div className="flex items-center gap-3">
          {/* Grid Toggle (R-33 & Gate 10) */}
          <button
            type="button"
            onClick={handleGridToggle}
            className={`grid-toggle-btn flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors font-mono text-[0.64rem] tracking-wider ${
              gridEnabled
                ? 'border-line hover:border-terracotta text-cream'
                : 'border-terracotta/60 text-terracotta bg-terracotta/10'
            }`}
            aria-label={gridEnabled ? 'Disable grid' : 'Enable grid'}
            data-cursor="Click"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{gridEnabled ? 'GRID ON' : 'GRID OFF'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleSoundClick}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-line hover:border-terracotta text-cream font-mono text-[0.64rem] tracking-wider transition-colors"
            aria-label={mounted && soundEnabled ? 'Disable audio' : 'Enable audio'}
            data-cursor="Sound"
          >
            {mounted && soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-terracotta" />
                <span className="hidden sm:inline text-terracotta">AUDIO ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-muted" />
                <span className="hidden sm:inline text-muted">AUDIO OFF</span>
              </>
            )}
          </button>

          {/* Start a project CTA */}
          <Magnetic strength={0.25} cursor="Enquire">
            <Link
              href="/#contact"
              className="hidden sm:inline-block px-4 py-1.5 rounded-full bg-terracotta hover:bg-[#ff8838] text-ground font-mono text-label font-semibold tracking-widest uppercase transition-all duration-200"
            >
              ENQUIRE
            </Link>
          </Magnetic>
        </div>
      </Reveal>
    </header>
  );
}
