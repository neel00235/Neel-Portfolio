import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { UNIQUE_WORKS, SECTIONS, WORKS_BY_SLUG } from '@/data/portfolio.generated';
import { VideoFrame } from '@/components/video/VideoFrame';
import { RelatedWorkCard } from '@/components/video/RelatedWorkCard';
import { Footer } from '@/components/layout/Footer';
import { META } from '@/data/content';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return UNIQUE_WORKS.map((work) => ({
    slug: work.slug,
  }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = WORKS_BY_SLUG[slug];
  if (!work) return { title: 'Project Not Found' };

  const section = SECTIONS.find((s) => s.slug === work.discipline);
  const firstSentence = section?.blurb.split('.')[0] || 'Cinematic video edit.';
  const description = `${work.title} — ${work.discipline} edit by Neel Patel. ${work.duration}s, ${work.aspect}. ${firstSentence}.`;

  return {
    title: work.title,
    description,
    openGraph: {
      title: `${work.title} · Neel Patel`,
      description,
      url: `${META.url}/project/${work.slug}/`,
      type: 'video.other',
      images: [
        {
          url: `/og/${work.id}.jpg`,
          width: 1200,
          height: 630,
          alt: work.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${work.title} · Neel Patel`,
      description,
      images: [`/og/${work.id}.jpg`],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const work = WORKS_BY_SLUG[slug];

  if (!work) {
    notFound();
  }

  const section = SECTIONS.find((s) => s.slug === work.discipline);

  // Prev / Next within all unique works
  const currentIndex = UNIQUE_WORKS.findIndex((w) => w.slug === slug);
  const prevWork = UNIQUE_WORKS[(currentIndex - 1 + UNIQUE_WORKS.length) % UNIQUE_WORKS.length];
  const nextWork = UNIQUE_WORKS[(currentIndex + 1) % UNIQUE_WORKS.length];

  // Related works in same discipline or adjacent
  const relatedWorks = UNIQUE_WORKS.filter((w) => w.slug !== slug && w.discipline === work.discipline).slice(0, 3);
  if (relatedWorks.length < 3) {
    const filler = UNIQUE_WORKS.filter((w) => w.slug !== slug && !relatedWorks.includes(w)).slice(0, 3 - relatedWorks.length);
    relatedWorks.push(...filler);
  }

  // Schema.org VideoObject JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: work.title,
    description: `${work.title} — ${work.discipline} edit by Neel Patel.`,
    thumbnailUrl: `${META.url}/posters/${work.id}.webp`,
    uploadDate: '2026-01-01',
    duration: `PT${work.duration}S`,
    embedUrl: `https://player.vimeo.com/video/${work.id}`,
    creator: {
      '@type': 'Person',
      name: 'Neel Patel',
      jobTitle: 'Video Editor & Colourist',
    },
  };

  return (
    <div className="pt-28 min-h-screen flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-shell mx-auto px-6 md:px-12 w-full pb-24">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 font-mono text-label text-muted hover:text-terracotta tracking-widest uppercase transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ALL EDITS</span>
          </Link>
          <span className="font-mono text-label text-muted tracking-wider uppercase">
            {currentIndex + 1} OF {UNIQUE_WORKS.length}
          </span>
        </div>

        {/* Hero Full-Bleed Player */}
        <div className="w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border border-line shadow-2xl mb-12">
          <VideoFrame
            id={work.id}
            title={work.title}
            slug={work.slug}
            aspect={work.aspect}
            duration={work.duration}
            tone={work.tone}
            priority={true}
            autoPlayLead={true}
            className="w-full"
          />
        </div>

        {/* Work Metadata & Editorial Context */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pb-16 border-b border-line-2">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-center gap-3 font-mono text-label text-terracotta tracking-widest uppercase">
              <span>{work.kicker}</span>
              <span>·</span>
              <span>{work.discipline}</span>
            </div>

            <h1 className="font-taurian text-huge text-cream uppercase tracking-wide">
              {work.title}
            </h1>

            {section && (
              <p className="font-serif text-lead text-cream/80 leading-relaxed italic max-w-2xl mt-2">
                &ldquo;{section.blurb}&rdquo;
              </p>
            )}
          </div>

          <div className="lg:col-span-4 p-6 rounded-xl bg-ground-2 border border-line-2 font-mono text-xs flex flex-col gap-3">
            <div className="flex justify-between py-1 border-b border-line-2">
              <span className="text-muted uppercase">DURATION</span>
              <span className="text-cream">{work.duration}s</span>
            </div>
            <div className="flex justify-between py-1 border-b border-line-2">
              <span className="text-muted uppercase">ASPECT RATIO</span>
              <span className="text-cream">{work.aspect}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-line-2">
              <span className="text-muted uppercase">RESOLUTION</span>
              <span className="text-cream">1080p (Full HD)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted uppercase">DOMINANT TONE</span>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full border border-line"
                  style={{ backgroundColor: work.tone }}
                />
                <span className="text-cream">{work.tone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prev / Next Pagination */}
        <div className="flex items-center justify-between py-12 border-b border-line-2 font-mono text-label uppercase">
          <Link
            href={`/project/${prevWork.slug}`}
            className="flex items-center gap-3 text-muted hover:text-terracotta transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <div className="flex flex-col text-left">
              <span className="text-[0.6rem] text-muted">PREVIOUS</span>
              <span className="text-cream group-hover:text-terracotta text-sm">{prevWork.title}</span>
            </div>
          </Link>

          <Link
            href={`/project/${nextWork.slug}`}
            className="flex items-center gap-3 text-muted hover:text-terracotta transition-colors group text-right"
          >
            <div className="flex flex-col">
              <span className="text-[0.6rem] text-muted">NEXT</span>
              <span className="text-cream group-hover:text-terracotta text-sm">{nextWork.title}</span>
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Related Works Grid */}
        <div className="pt-16">
          <h3 className="font-taurian text-big text-cream uppercase tracking-wide mb-8">
            RELATED EDITS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedWorks.map((rw) => (
              <RelatedWorkCard key={rw.id} work={rw} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
