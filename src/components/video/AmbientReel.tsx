'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import Image from 'next/image';
import lqipData from '@/data/lqip.json';
import { useLightbox } from './LightboxProvider';
import { playSound } from '@/lib/sound';
import { useVideoRegistry } from '@/store/useVideoRegistry';

export interface AmbientReelProps {
  id: string;
  title: string;
  slug: string;
  aspect: string;
  duration?: number;
  tone?: string;
  /** 720p default; 540p for the small fan cards, 1080p for the lead film. */
  quality?: '540p' | '720p' | '1080p';
  /** next/image sizes hint. */
  sizes?: string;
  /** Only the lead film passes true — it is the LCP element. */
  priority?: boolean;
  /** Fires portfolio:leadfilm-ready on first play. Lead film only. */
  signalsLeadReady?: boolean;
  /** Tap/Enter/Space opens the lightbox. Default true. */
  interactive?: boolean;
  className?: string;
}

export function AmbientReel({
  id,
  title,
  slug,
  aspect,
  duration,
  tone,
  quality = '720p',
  sizes,
  priority = false,
  signalsLeadReady = false,
  interactive = true,
  className = '',
}: AmbientReelProps) {
  const { open } = useLightbox();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inViewport, setInViewport] = useState(priority || signalsLeadReady);
  const [hasSlot, setHasSlot] = useState(priority || signalsLeadReady);
  const leadSignaledRef = useRef(false);

  // Generate unique instance ID for slot tracking
  const reactId = useId();
  const instanceKey = `${id}-${reactId}`;

  const claimAmbientSlot = useVideoRegistry((state) => state.claimAmbientSlot);
  const releaseAmbientSlot = useVideoRegistry((state) => state.releaseAmbientSlot);
  const activeAmbientIds = useVideoRegistry((state) => state.activeAmbientIds);

  const lqip = (lqipData as Record<string, string>)[id] || '';

  const getAspectClass = (asp: string) => {
    switch (asp) {
      case '9:16':
        return 'aspect-[9/16]';
      case '4:3':
        return 'aspect-[4/3]';
      case '1:1':
        return 'aspect-square';
      case '3:4':
        return 'aspect-[3/4]';
      case '16:9':
      default:
        return 'aspect-video';
    }
  };

  const defaultSizes =
    sizes ||
    (aspect === '9:16'
      ? '(max-width: 768px) 50vw, 320px'
      : '(max-width: 768px) 100vw, 1080px');

  // Viewport-gated mounting and eviction (ITEM 7)
  // Lead film is exempt — it is the LCP element and mounts immediately.
  useEffect(() => {
    if (priority || signalsLeadReady) return;

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInViewport(true);
      return;
    }

    // 1. Enter observer: triggers when within 200px of viewport
    const enterObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInViewport(true);
        }
      },
      { rootMargin: '200px' }
    );

    // 2. Evict observer: triggers when card exits 600px of viewport
    const exitObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          // Card is more than 600px away -> unmount iframe and free slot
          setInViewport(false);
          setIsPlaying(false);
          setHasSlot(false);
          releaseAmbientSlot(instanceKey);

          // Pattern from VideoFrame.teardownHover: set about:blank before removal
          if (iframeRef.current) {
            iframeRef.current.src = 'about:blank';
          }
        }
      },
      { rootMargin: '600px' }
    );

    enterObserver.observe(el);
    exitObserver.observe(el);

    return () => {
      enterObserver.disconnect();
      exitObserver.disconnect();
      releaseAmbientSlot(instanceKey);
      if (iframeRef.current) {
        iframeRef.current.src = 'about:blank';
      }
    };
  }, [priority, signalsLeadReady, instanceKey, releaseAmbientSlot]);

  // Slot acquisition for ambient players
  useEffect(() => {
    if (priority || signalsLeadReady) {
      setHasSlot(true);
      return;
    }

    if (inViewport && !hasSlot) {
      const granted = claimAmbientSlot(instanceKey);
      if (granted) {
        setHasSlot(true);
      }
    } else if (!inViewport && hasSlot) {
      releaseAmbientSlot(instanceKey);
      setHasSlot(false);
      setIsPlaying(false);
      if (iframeRef.current) {
        iframeRef.current.src = 'about:blank';
      }
    }
  }, [inViewport, hasSlot, instanceKey, priority, signalsLeadReady, claimAmbientSlot, releaseAmbientSlot, activeAmbientIds]);

  const shouldMountIframe = (priority || signalsLeadReady) || (inViewport && hasSlot);

  // Send message to Vimeo iframe with exact targetOrigin per B-4
  const post = (method: string, value?: unknown) => {
    if (!iframeRef.current?.contentWindow) return;
    const msg = JSON.stringify({ method, value });
    iframeRef.current.contentWindow.postMessage(msg, 'https://player.vimeo.com');
  };

  useEffect(() => {
    if (!shouldMountIframe) {
      setIsPlaying(false);
      return;
    }

    // 6000ms watchdog: if no play event arrives, stay on poster
    const watchdogTimer = setTimeout(() => {
      // Do not force reveal if playback didn't start
    }, 6000);

    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== 'https://player.vimeo.com') return;

      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data) return;

        // Filter by player_id so multiple players never cross-talk
        if (data.player_id && String(data.player_id) !== String(id)) return;

        if (data.event === 'ready') {
          post('addEventListener', 'play');
          post('addEventListener', 'playing');
        } else if (data.event === 'play' || data.event === 'playing') {
          setIsPlaying(true);
          clearTimeout(watchdogTimer);

          if (signalsLeadReady && !leadSignaledRef.current) {
            leadSignaledRef.current = true;
            window.dispatchEvent(new Event('portfolio:leadfilm-ready'));
          }
        }
      } catch {
        // Non-JSON message from external scripts
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      clearTimeout(watchdogTimer);
      window.removeEventListener('message', handleMessage);
    };
  }, [id, signalsLeadReady, shouldMountIframe]);

  // Fallback trigger if postMessage play is missed or delayed, but document loaded
  const handleIframeLoad = () => {
    post('addEventListener', 'play');
    post('addEventListener', 'playing');
    post('play');
  };

  const embedUrl = `https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&muted=1&playsinline=1&autopause=0&dnt=1&quality=${quality}&api=1&player_id=${id}`;

  const handleOpen = () => {
    if (!interactive) return;
    playSound('click');
    open({
      id,
      title,
      slug,
      aspect,
      duration,
      tone,
    });
  };

  return (
    <div
      ref={containerRef}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Open ${title} showreel` : title}
      data-cursor={interactive ? 'Play' : undefined}
      onClick={interactive ? handleOpen : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpen();
              }
            }
          : undefined
      }
      className={`relative w-full overflow-hidden ${getAspectClass(aspect)} ${className} ${
        interactive ? 'cursor-pointer' : ''
      }`}
    >
      {/* 1. LQIP blur fallback */}
      {lqip && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none filter blur-sm scale-105"
          style={{ backgroundImage: `url("${lqip}")` }}
        />
      )}

      {/* 2. Poster frame (never unmounted) */}
      <Image
        src={`/posters/${id}.webp`}
        alt={title}
        fill
        priority={priority}
        sizes={defaultSizes}
        placeholder={lqip ? 'blur' : 'empty'}
        blurDataURL={lqip}
        className="object-cover pointer-events-none z-[1]"
      />

      {/* 3. Vimeo ambient looping iframe (opacity transition on play, mounted only when gated) */}
      {shouldMountIframe && (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title}
          onLoad={handleIframeLoad}
          className={`absolute inset-0 w-full h-full border-0 pointer-events-none z-10 bg-black transition-opacity duration-400 ${
            isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
          allow="autoplay; fullscreen; picture-in-picture"
          loading={priority ? 'eager' : 'lazy'}
          style={{ colorScheme: 'dark' }}
        />
      )}

      {/* 4. Bottom scrim gradient */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-t from-ground/70 via-transparent to-transparent" />
    </div>
  );
}
