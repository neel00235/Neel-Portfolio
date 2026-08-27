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
