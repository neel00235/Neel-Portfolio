'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { VimeoFacade, VimeoFacadeHandle } from './VimeoFacade';
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
  bare?: boolean;
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
  bare = false,
  className = '',
}: VideoFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const facadeRef = useRef<VimeoFacadeHandle>(null);
  const hoverIframeRef = useRef<HTMLIFrameElement | null>(null);
  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlayingFull, setIsPlayingFull] = useState(autoPlayLead);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [playerDuration, setPlayerDuration] = useState(0);
  const [hoverMounted, setHoverMounted] = useState(false);
  const [hoverReady, setHoverReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const effectiveDuration = playerDuration > 0 ? playerDuration : duration;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const { activeFullId, activePreviewId, playFull, stopFull, playPreview, stopPreview } =
    useVideoRegistry();
  const setTone = useTone((s) => s.setTone);

  // The lead film auto-starts without a click, so register it or the single-player
  // invariant at :79 never sees it.
  const leadRegistered = useRef(false);
  useEffect(() => {
    if (!autoPlayLead || leadRegistered.current) return;
    leadRegistered.current = true;
    playFull(id);
    if (tone) setTone(tone);
  }, [autoPlayLead, id, playFull, tone, setTone]);

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
    const currentActive = useVideoRegistry.getState().activeFullId;
    if (currentActive && currentActive !== id && isPlayingFull) {
      setIsPlayingFull(false);
      setIsVideoPlaying(false);
      setCurrentTime(0);
      setProgress(0);
    }
  }, [activeFullId, id, isPlayingFull]);

  // Clean up active full player on unmount
  useEffect(() => {
    return () => {
      if (useVideoRegistry.getState().activeFullId === id) {
        useVideoRegistry.getState().stopFull(id);
      }
    };
  }, [id]);

  // PostMessage helper for hover iframe
  const postHover = (method: string, value?: unknown) => {
    if (!hoverIframeRef.current?.contentWindow) return;
    const msg = JSON.stringify({ method, value });
    hoverIframeRef.current.contentWindow.postMessage(msg, 'https://player.vimeo.com');
  };

  // Hover preview postMessage listener with 6000ms watchdog
  useEffect(() => {
    if (!hoverMounted) return;

    const watchdogTimer = setTimeout(() => {
      // Stay on poster if no play event arrives
    }, 6000);

    const handleHoverMessage = (e: MessageEvent) => {
      if (e.origin !== 'https://player.vimeo.com') return;

      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data) return;

        if (data.player_id && String(data.player_id) !== String(id)) return;

        if (data.event === 'ready') {
          postHover('addEventListener', 'play');
          postHover('addEventListener', 'playing');
        } else if (data.event === 'play' || data.event === 'playing') {
          clearTimeout(watchdogTimer);
          setHoverReady(true);
        }
      } catch {
        // Non-JSON message
      }
    };

    window.addEventListener('message', handleHoverMessage);
    return () => {
      clearTimeout(watchdogTimer);
      window.removeEventListener('message', handleHoverMessage);
    };
  }, [hoverMounted, id]);

  // Teardown hover preview helper
  const teardownHover = () => {
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
    if (hoverIframeRef.current) {
      hoverIframeRef.current.src = 'about:blank';
      hoverIframeRef.current.remove();
      hoverIframeRef.current = null;
    }
    setHoverMounted(false);
    setHoverReady(false);
  };

  // Rule 2: Exactly one hover preview alive site-wide. A second pointerenter tears down the first.
  useEffect(() => {
    if (activePreviewId !== id && hoverMounted) {
      teardownHover();
    }
  }, [activePreviewId, id, hoverMounted]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    };
  }, []);

  // Set tone when playing full
  useEffect(() => {
    if (isPlayingFull && tone) {
      setTone(tone);
    }
  }, [isPlayingFull, tone, setTone]);

  // Reset playback position and state when full player is unmounted
  useEffect(() => {
    if (!isPlayingFull) {
      setCurrentTime(0);
      setProgress(0);
      setIsVideoPlaying(false);
    }
  }, [isPlayingFull]);

  // Rule 5: Gate off hover where hover is meaningless or expensive
  const canHoverAutoplay = () => {
    if (typeof window === 'undefined') return false;
    const hoverFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!hoverFine) return false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return false;
    const nav = navigator as unknown as {
      connection?: { saveData?: boolean; effectiveType?: string };
    };
    if (nav.connection?.saveData) return false;
    if (['2g', '3g'].includes(nav.connection?.effectiveType || '')) return false;
    return true;
  };

  const handlePointerEnter = () => {
    if (isPlayingFull || !canHoverAutoplay()) return;

    // Rule 2: A second pointerenter tears down the first before arming
    playPreview(id);
    setHoverReady(false);

    // Rule 1: 140ms dwell timer before mounting
    if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    dwellTimerRef.current = setTimeout(() => {
      setHoverMounted(true);
    }, 140);
  };

  const handlePointerLeave = () => {
    // If pointer leaves before 140ms, timer is cancelled: ZERO bytes fetched!
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
    stopPreview(id);
    teardownHover();
  };

  const userPausedRef = useRef(false);

  const handlePosterPlayClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    playSound('click');
    teardownHover();
    userPausedRef.current = false;
    if (!isPlayingFull) {
      playFull(id);
      setIsPlayingFull(true);
      if (tone) setTone(tone);
    }
  };

  const handleTogglePlay = () => {
    playSound('click');
    if (isVideoPlaying) {
      userPausedRef.current = true;
      facadeRef.current?.pause();
      setIsVideoPlaying(false);
    } else {
      userPausedRef.current = false;
      facadeRef.current?.play();
      setIsVideoPlaying(true);
    }
  };

  const handleSeek = (seconds: number) => {
    facadeRef.current?.seekTo(seconds);
    setCurrentTime(seconds);
    if (effectiveDuration > 0) {
      setProgress(Math.min(1, Math.max(0, seconds / effectiveDuration)));
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

  const isBare = bare || isFullscreen;

  return (
    <div
      ref={containerRef}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      style={isFullscreen ? { backgroundColor: '#000' } : undefined}
      className={`group relative overflow-hidden ${
        isBare
          ? '!rounded-none !border-0 bg-black'
          : 'rounded-lg bg-ground-2 border border-line-2 hover:border-terracotta/60 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_-8px_rgba(246,124,41,0.18)]'
      } ${
        isFullscreen ? '!aspect-auto' : getAspectClass(aspect)
      } select-none transition-all duration-500 ease-out cursor-pointer ${className}`}
      data-cursor={isPlayingFull ? 'Sound' : 'Play'}
      onClick={() => {
        if (!isPlayingFull) handlePosterPlayClick();
      }}
    >
      {/* 1. LQIP blur fallback - always present beneath everything */}
      {lqip && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none filter blur-sm scale-105"
          style={{ backgroundImage: `url("${lqip}")` }}
        />
      )}

      {/* 2. Poster Image (never unmounted, fades only when hover is ready) */}
      <div
        className={`absolute inset-0 z-0 overflow-hidden transition-opacity duration-[260ms] ease-io ${
          hoverReady ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <Image
          src={`/posters/${id}.webp`}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          placeholder={lqip ? 'blur' : 'empty'}
          blurDataURL={lqip}
          className={`object-cover w-full h-full transition-transform duration-500 ease-out ${
            isBare ? '' : 'group-hover:scale-105'
          }`}
        />
      </div>

      {/* Tier 1 Non-Playing Overlays */}
      {!isPlayingFull && (
        <>
          {/* R-30: Autoplay on hover iframe (Mounted after 140ms dwell) */}
          {hoverMounted && (
            <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
              <iframe
                ref={hoverIframeRef}
                src={`https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&muted=1&playsinline=1&autopause=0&dnt=1&quality=720p&api=1&player_id=${id}`}
                title={title}
                className={`w-full h-full border-0 pointer-events-none bg-black transition-opacity duration-400 ${
                  hoverReady ? 'opacity-100' : 'opacity-0'
                }`}
                allow="autoplay; fullscreen; picture-in-picture"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          )}

          {/* Ambient Film Grain & Vignette Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-ground/80 via-transparent to-black/20" />

          {/* Play Intent Indicator */}
          {!hoverMounted && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-ground/95 md:bg-ground/80 border border-line md:backdrop-blur-md shadow-2xl text-cream group-hover:scale-110 group-hover:border-terracotta group-hover:text-terracotta transition-all duration-300">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
          )}

          {/* Duration Badge */}
          {duration > 0 && (
            <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded bg-ground/95 md:bg-ground/80 md:backdrop-blur-sm border border-line-2 text-cream font-mono text-[0.64rem] tracking-wider">
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </div>
          )}
        </>
      )}

      {/* Tier 2: Full interactive player via clean VimeoFacade */}
      {isPlayingFull && (
        <div className="absolute inset-0 z-20">
          <VimeoFacade
            ref={facadeRef}
            videoId={id}
            title={title}
            autoPlay={true}
            onReady={() => {
              if (autoPlayLead) {
                window.dispatchEvent(new Event('portfolio:leadfilm-ready'));
              }
            }}
            onPlay={() => {
              if (!userPausedRef.current) {
                setIsVideoPlaying(true);
              }
            }}
            onPause={() => {
              setIsVideoPlaying(false);
            }}
            onDuration={(d) => {
              if (d > 0) {
                setPlayerDuration(d);
              }
            }}
            onEnded={() => {
              setIsVideoPlaying(false);
              // The lead film is a loop — a stray finish event must not collapse it to the poster.
              if (!autoPlayLead) setIsPlayingFull(false);
            }}
            onTimeUpdate={(percent, seconds) => {
              setProgress(percent);
              setCurrentTime(seconds);
            }}
          />
          <PlayerChrome
            isPlaying={isVideoPlaying}
            onTogglePlay={handleTogglePlay}
            onSeek={handleSeek}
            onToggleFullscreen={handleToggleFullscreen}
            currentTime={currentTime}
            duration={effectiveDuration}
            progress={progress}
          />
        </div>
      )}
    </div>
  );
}
