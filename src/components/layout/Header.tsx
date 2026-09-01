'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Volume2, VolumeX, Grid, Menu, X } from 'lucide-react';
import { useSound } from '@/store/useSound';
import { Magnetic } from '@/components/cursor/Magnetic';
import { playSound } from '@/lib/sound';
import { Reveal } from '@/components/motion/Reveal';
import { ScrambleText } from '@/components/motion/ScrambleText';
import { useLenis } from '@/lib/lenis';

export function Header() {
  const { soundEnabled, toggleSound, setSoundEnabled } = useSound();
  const lenis = useLenis();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [activeSection, setActiveSection] = useState('01');
  const [menuOpen, setMenuOpen] = useState(false);
  const hamburgerBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('neel_sound_enabled');
    if (saved === 'true') {
      setSoundEnabled(true);
    }

    // Cache section offsets to prevent layout thrash on scroll (ITEM 7)
    const sections = [
      { id: 'hero', num: '01' },
      { id: 'works', num: '02' },
      { id: 'gallery', num: '03' },
      { id: 'skills', num: '04' },
      { id: 'services', num: '05' },
      { id: 'contact', num: '06' },
      { id: 'thankyou', num: '07' },
    ];
    let cachedOffsets: { num: string; top: number }[] = [];

    const computeOffsets = () => {
      cachedOffsets = sections.map((s) => {
        const el = document.getElementById(s.id);
        return { num: s.num, top: el ? el.offsetTop : 0 };
      });
    };

    computeOffsets();

    // Scroll listener for running section counter (R-37)
    const handleScroll = () => {
      const scrollY = window.scrollY + 300;
      for (let i = cachedOffsets.length - 1; i >= 0; i--) {
        if (cachedOffsets[i].top <= scrollY) {
          setActiveSection(cachedOffsets[i].num);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', computeOffsets, { passive: true });
    window.addEventListener('portfolio:curtain-complete', computeOffsets);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', computeOffsets);
      window.removeEventListener('portfolio:curtain-complete', computeOffsets);
    };
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

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lenis scroll lock and focus management when menuOpen changes
  useEffect(() => {
    if (menuOpen) {
      if (lenis) lenis.stop();

      // Focus first focusable link in drawer
      const timer = setTimeout(() => {
        if (drawerRef.current) {
          const first = drawerRef.current.querySelector<HTMLElement>('a, button');
          first?.focus();
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          playSound('click');
          setMenuOpen(false);
          hamburgerBtnRef.current?.focus();
          return;
        }

        if (e.key === 'Tab' && drawerRef.current) {
          const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
        if (lenis) lenis.start();
      };
    } else {
      if (lenis) lenis.start();
    }
  }, [menuOpen, lenis]);

  const toggleMenu = () => {
    playSound('click');
    setMenuOpen((prev) => {
      const next = !prev;
      if (!next) {
        // Return focus to hamburger button
        setTimeout(() => hamburgerBtnRef.current?.focus(), 10);
      }
      return next;
    });
  };

  const closeMenu = () => {
    playSound('click');
    setMenuOpen(false);
    setTimeout(() => hamburgerBtnRef.current?.focus(), 10);
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
            className="inline-flex items-center opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-200"
            data-cursor="Open"
          >
            <Image
              src="/brand/neel-logo.webp"
              alt="Neel Patel"
              width={193}
              height={128}
              priority
              className="h-7 w-auto"
            />
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Grid Toggle (R-33 & Gate 10) - min 44x44 hit area */}
          <button
            type="button"
            onClick={handleGridToggle}
            className={`grid-toggle-btn min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors font-mono text-[0.64rem] tracking-wider ${
              gridEnabled
                ? 'border-line hover:border-terracotta text-cream'
                : 'border-terracotta/60 text-terracotta bg-terracotta/10'
            }`}
            aria-label={gridEnabled ? 'Disable grid' : 'Enable grid'}
            data-cursor="Click"
          >
            <Grid className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">{gridEnabled ? 'GRID ON' : 'GRID OFF'}</span>
          </button>

          {/* Sound Toggle - min 44x44 hit area */}
          <button
            type="button"
            onClick={handleSoundClick}
            className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full border border-line hover:border-terracotta text-cream font-mono text-[0.64rem] tracking-wider transition-colors"
            aria-label={mounted && soundEnabled ? 'Disable audio' : 'Enable audio'}
            data-cursor="Sound"
          >
            {mounted && soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-terracotta" />
                <span className="hidden sm:inline text-terracotta">AUDIO ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-muted" />
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

          {/* Mobile Hamburger Button (6a) */}
          <button
            ref={hamburgerBtnRef}
            type="button"
            onClick={toggleMenu}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-full border border-line hover:border-terracotta text-cream hover:text-terracotta transition-colors"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            data-cursor="Click"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </Reveal>

      {/* Mobile Drawer (6a) - Sits at var(--z-header) below Curtain */}
      {menuOpen && (
        <div
          id="mobile-nav-drawer"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="fixed inset-0 top-[65px] md:hidden bg-ground/95 backdrop-blur-xl border-b border-line flex flex-col justify-between overflow-y-auto p-8 animate-fadeIn"
          style={{ zIndex: 'var(--z-header)' }}
        >
          {/* Backdrop overlay listener */}
          <div
            className="absolute inset-0 bg-transparent -z-10"
            onClick={closeMenu}
            aria-hidden="true"
          />

          <nav className="flex flex-col gap-6 pt-4 font-mono text-base tracking-widest uppercase text-cream/90">
            <Link
              href="/#about"
              onClick={closeMenu}
              className="min-h-[44px] flex items-center hover:text-terracotta transition-colors border-b border-line-2 pb-2"
            >
              01 / About
            </Link>
            <Link
              href="/#works"
              onClick={closeMenu}
              className="min-h-[44px] flex items-center hover:text-terracotta transition-colors border-b border-line-2 pb-2"
            >
              02 / Works
            </Link>
            <Link
              href="/projects"
              onClick={closeMenu}
              className="min-h-[44px] flex items-center hover:text-terracotta transition-colors border-b border-line-2 pb-2"
            >
              03 / Gallery (52)
            </Link>
            <Link
              href="/#skills"
              onClick={closeMenu}
              className="min-h-[44px] flex items-center hover:text-terracotta transition-colors border-b border-line-2 pb-2"
            >
              04 / Toolkit
            </Link>
            <Link
              href="/#services"
              onClick={closeMenu}
              className="min-h-[44px] flex items-center hover:text-terracotta transition-colors border-b border-line-2 pb-2"
            >
              05 / Services
            </Link>
            <Link
              href="/#contact"
              onClick={closeMenu}
              className="min-h-[44px] flex items-center hover:text-terracotta transition-colors border-b border-line-2 pb-2"
            >
              06 / Contact
            </Link>
          </nav>

          <div className="pt-8 pb-4">
            <Link
              href="/#contact"
              onClick={closeMenu}
              className="w-full min-h-[48px] flex items-center justify-center rounded-full bg-terracotta hover:bg-[#ff8838] text-ground font-mono text-sm font-semibold tracking-widest uppercase transition-colors"
            >
              ENQUIRE
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
