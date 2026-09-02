'use client';

import React from 'react';
import Link from 'next/link';
import { type Work } from '@/data/portfolio.generated';
import { VideoFrame } from '@/components/video/VideoFrame';
import { useLightbox } from '@/components/video/LightboxProvider';
import { playSound } from '@/lib/sound';

export function RelatedWorkCard({ work }: { work: Work }) {
  const { open } = useLightbox();

  const handleOpen = () => {
    playSound('click');
    open(work);
  };

  return (
    <div className="flex flex-col gap-3 group">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Open ${work.title} video`}
        data-cursor="Play"
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpen();
          }
        }}
        className="cursor-pointer relative rounded-lg overflow-hidden border border-line-2 hover:border-terracotta/60 transition-[transform,border-color,box-shadow] duration-300 shadow-lg hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      >
        <VideoFrame
          id={work.id}
          title={work.title}
          slug={work.slug}
          aspect={work.aspect}
          duration={work.duration}
          tone={work.tone}
          clickToPlay={false}
        />
      </div>
      <div className="flex items-center justify-between font-mono text-label">
        <Link
          href={`/project/${work.slug}`}
          className="text-cream group-hover:text-terracotta transition-colors truncate pr-2 font-medium"
        >
          {work.title}
        </Link>
        <span className="text-muted text-[0.64rem]">{work.discipline}</span>
      </div>
    </div>
  );
}
