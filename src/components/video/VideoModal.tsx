'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { VideoFrame } from './VideoFrame';
import { playSound } from '@/lib/sound';
import { useLenis } from '@/lib/lenis';

export interface ModalWork {
  id: string;
  title: string;
  slug: string;
  aspect: string;
  duration?: number;
  tone?: string;
}

interface VideoModalProps {
  work: ModalWork | null;
  onClose: () => void;
}

export function VideoModal({ work, onClose }: VideoModalProps) {
  const [mounted, setMounted] = useState(false);
  const lenis = useLenis();
  const prevFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!work) return;

    // Save previous active focus element
    prevFocusRef.current = document.activeElement as HTMLElement;

    // Lock scroll via Lenis per B-5 / R-29 (never overflow:hidden on body)
    if (lenis) {
      lenis.stop();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playSound('click');
        handleClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (lenis) {
        lenis.start();
      }
    };
  }, [work, lenis]);

  const handleClose = () => {
    playSound('click');
    onClose();
    if (lenis) {
      lenis.start();
    }
    // Return focus to invoking element
    setTimeout(() => {
      prevFocusRef.current?.focus();
    }, 50);
  };

  if (!work || !mounted) return null;

  const isVertical = work.aspect === '9:16';

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 sm:p-8 bg-[#13100c]/95 md:bg-[#13100c]/90 md:backdrop-blur-2xl animate-fadeIn"
      style={{ zIndex: 'var(--z-modal, 70)' }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={work.title}
    >
      {/* Modal Dialog */}
      <div
        className={`relative w-full max-w-5xl ${
          isVertical ? 'max-w-md' : 'max-w-5xl'
        } bg-ground-2 border border-line rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 scale-100 flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line-2 bg-ground-3/60">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulseDot" />
            <h3 className="font-display font-bold text-base text-cream uppercase truncate">
              {work.title}
            </h3>
            <span className="hidden sm:inline font-mono text-[0.68rem] text-terracotta tracking-wider uppercase px-2 py-0.5 rounded bg-terracotta/10 border border-terracotta/30">
              {work.aspect} · {work.duration}S
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full text-muted hover:text-cream hover:bg-cream/10 transition-colors"
            aria-label="Close modal"
            data-cursor="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Zoomed Video Frame */}
        <div className="w-full bg-black flex items-center justify-center">
          <VideoFrame
            id={work.id}
            title={work.title}
            slug={work.slug}
            aspect={work.aspect}
            duration={work.duration}
            tone={work.tone}
            priority={true}
            autoPlayLead={true}
            className="w-full max-h-[75vh]"
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
