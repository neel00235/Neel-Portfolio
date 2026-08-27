import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Contact · Neel Patel',
  description: 'Initiate a video editing or colour grading project with Neel Patel. Direct inquiries via email, phone, and Instagram.',
};

export default function ContactPage() {
  return (
    <div className="pt-28 min-h-screen flex flex-col justify-between">
      <div className="max-w-shell mx-auto px-6 md:px-12 w-full pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-label text-muted hover:text-terracotta tracking-widest uppercase transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO HOME</span>
        </Link>
      </div>

      <Contact />
      <Footer />
    </div>
  );
}
