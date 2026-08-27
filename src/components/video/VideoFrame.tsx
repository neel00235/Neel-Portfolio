'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { VimeoFacade } from './VimeoFacade';
import { PlayerChrome } from './PlayerChrome';
import { useTone } from '@/store/useTone';
import { useVideoRegistry } from '@/store/useVideoRegistry';
import { playSound } from '@/lib/sound';
import lqipData from '@/data/lqip.json';

interface VideoFrameProps {
  id: string;
  title: string;
  slug: string;
  aspect: string;
  duration?: number;
  tone?: string;
  priority?: boolean;
  autoPlayLead?: boolean;
  className?: string;
}

export function VideoFrame({
  id,
  title,
  slug,
  aspect,
  duration = 0,
  tone,
  priority = false,
  autoPlayLead = false,
  className = '',
}: VideoFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlayingFull, setIsPlayingFull] = useState(autoPlayLead);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);

  const { activeFullId, playFull, stopFull } = useVideoRegistry();
  const setTone = useTone((s) => s.setTone);

  const lqip = (lqipData as Record<string, string>)[id] || '';

  // Calculate aspect ratio class
  const getAspectClass = (asp: string) => {
    switch (asp) {
      case '9:16':
        return 'aspect-[9/16]';
      case '4:3':
        return 'aspect-[4/3]';
      case '1:1':
        return 'aspect-square';
      case '16:9':
      default:
        return 'aspect-video';
    }
  };

  // Sync with global video registry
  useEffect(() => {
    if (activeFullId && activeFullId !== id && isPlayingFull) {
      setIsPlayingFull(false);
    }
  }, [activeFullId, id, isPlayingFull]);

  // Set tone when playing full
  useEffect(() => {
    if (isPlayingFull && tone) {
      setTone(tone);
    }
  }, [isPlayingFull, tone, setTone]);

  const handlePlayClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    playSound('click');
    if (!isPlayingFull) {
      playFull(id);
      setIsPlayingFull(true);
      if (tone) setTone(tone);
    } else {
      stopFull(id);
      setIsPlayingFull(false);
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`group relative overflow-hidden rounded-md bg-ground-2 border border-line-2 hover:border-line select-none transition-all duration-300 ${getAspectClass(
        aspect
      )} ${className}`}
      data-cursor={isPlayingFull ? 'Sound' : 'Play'}
      onClick={() => {
        if (!isPlayingFull) handlePlayClick();
      }}
    >
      {/* Tier 1: Poster Image + Blur-up LQIP */}
      {!isPlayingFull && (
        <>
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src={`/posters/${id}.webp`}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              placeholder={lqip ? 'blur' : 'empty'}
              blurDataURL={lqip}
              className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </div>

          {/* Ambient Film Grain & Vignette Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-ground/80 via-transparent to-black/20" />

          {/* Play Intent Indicator */}
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-ground/80 border border-line backdrop-blur-md shadow-2xl text-cream group-hover:scale-110 group-hover:border-terracotta group-hover:text-terracotta transition-all duration-300">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>

          {/* Duration Badge */}
          {duration > 0 && (
            <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded bg-ground/80 backdrop-blur-sm border border-line-2 text-cream font-mono text-[0.64rem] tracking-wider">
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </div>
          )}
        </>
      )}

      {/* Tier 2: Full interactive player via clean VimeoFacade */}
      {isPlayingFull && (
        <>
          <VimeoFacade
            videoId={id}
            title={title}
            autoPlay={true}
            onEnded={() => setIsPlayingFull(false)}
            onTimeUpdate={(percent, seconds) => {
              setProgress(percent);
              setCurrentTime(seconds);
            }}
          />
          <PlayerChrome
            isPlaying={isPlayingFull}
            onTogglePlay={handlePlayClick}
            onToggleFullscreen={handleToggleFullscreen}
            currentTime={currentTime}
            duration={duration}
            progress={progress}
          />
        </>
      )}
    </div>
  );
}
