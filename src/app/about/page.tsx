import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Hero } from '@/components/sections/Hero';
import { Toolkit } from '@/components/sections/Toolkit';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'About · Neel Patel',
  description: 'Specialised video editor and colourist based in Ahmedabad, India. Story-driven editing, precision colour grading, and social retention.',
};

export default function AboutPage() {
  return (
    <div className="pt-28 min-h-screen flex flex-col justify-between">
      <div className="max-w-shell mx-auto px-6 md:px-12 w-full pb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-label text-muted hover:text-terracotta tracking-widest uppercase transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO HOME</span>
        </Link>
      </div>

      <Hero />
      <Toolkit />
      <Footer />
    </div>
  );
}
