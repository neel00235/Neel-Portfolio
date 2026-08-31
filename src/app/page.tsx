import React from 'react';
import { Hero } from '@/components/sections/Hero';
import { SelectedWorks } from '@/components/sections/SelectedWorks';
import { Gallery } from '@/components/sections/Gallery';
import { Toolkit } from '@/components/sections/Toolkit';
import { Services } from '@/components/sections/Services';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/layout/Footer';
import { Curtain } from '@/components/curtain/Curtain';

export default function HomePage() {
  return (
    <>
      {/* Cinematic Curtain Preloader */}
      <Curtain />

      {/* Server-rendered backdrop to prevent dark first frame */}
      <div
        aria-hidden="true"
        data-curtain-backdrop
        className="fixed inset-0 bg-terracotta motion-reduce:hidden"
        style={{ zIndex: 'var(--z-curtain-base, 79)' }}
      />

      {/* Curtain reveal runway: the one viewport of scroll the leaves consume.
          Collapses to zero when the curtain is off (reduced motion), so the page
          never opens on a screen of nothing. */}
      <div
        aria-hidden="true"
        data-curtain-runway
        className="w-full h-[100svh] motion-reduce:h-0 data-[curtain=off]:h-0"
      />

      {/* Narrative Single Scroll Sections with Smooth Reveal Motion */}
      <Hero />
      <SelectedWorks />
      <Gallery />
      <Toolkit />
      <Services />
      <Contact />
      <Footer />
    </>
  );
}
