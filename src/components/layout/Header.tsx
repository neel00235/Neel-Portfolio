'use client';

import React from 'react';
import Link from 'next/link';
import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '@/store/useSound';
import { Magnetic } from '@/components/cursor/Magnetic';
import { playSound } from '@/lib/sound';

export function Header() {
  const { soundEnabled, toggleSound } = useSound();

  const handleSoundClick = () => {
    playSound('click');
    toggleSound();
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-ground/70 border-b border-line-2 transition-all duration-300">
      {/* Brand & Live Availability Dot */}
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
      </div>

      {/* Nav items */}
      <nav className="hidden md:flex items-center gap-8 font-mono text-label tracking-widest uppercase text-muted">
        <Link href="/#about" className="hover:text-cream transition-colors">
          01 / About
        </Link>
        <Link href="/#works" className="hover:text-cream transition-colors">
          02 / Works
        </Link>
        <Link href="/projects" className="hover:text-cream transition-colors">
          03 / Gallery (52)
        </Link>
        <Link href="/#skills" className="hover:text-cream transition-colors">
          04 / Toolkit
        </Link>
        <Link href="/#services" className="hover:text-cream transition-colors">
          05 / Services
        </Link>
        <Link href="/#contact" className="hover:text-cream transition-colors">
          06 / Contact
        </Link>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Sound Toggle */}
        <button
          type="button"
          onClick={handleSoundClick}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-line hover:border-terracotta text-cream font-mono text-[0.64rem] tracking-wider transition-colors"
          aria-label={soundEnabled ? 'Disable audio' : 'Enable audio'}
          data-cursor="Sound"
        >
          {soundEnabled ? (
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
    </header>
  );
}
