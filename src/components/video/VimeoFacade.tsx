'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSound } from '@/store/useSound';

interface VimeoFacadeProps {
  videoId: string;
  title: string;
  autoPlay?: boolean;
  onReady?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (percent: number, seconds: number) => void;
  className?: string;
}

export function VimeoFacade({
  videoId,
  title,
  autoPlay = true,
  onReady,
  onEnded,
  onTimeUpdate,
  className = '',
}: VimeoFacadeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const soundEnabled = useSound((s) => s.soundEnabled);
  const [isLoaded, setIsLoaded] = useState(false);
  const [facadeReady, setFacadeReady] = useState(false);

  // Send message to Vimeo iframe with exact targetOrigin per B-4
  const post = (method: string, value?: unknown) => {
    if (!iframeRef.current?.contentWindow) return;
    const msg = JSON.stringify({ method, value });
    iframeRef.current.contentWindow.postMessage(msg, 'https://player.vimeo.com');
  };

  // Sync mute with global sound state
  useEffect(() => {
    if (isLoaded) {
      post('setVolume', soundEnabled ? 1 : 0);
    }
  }, [soundEnabled, isLoaded]);

  // Handle messages from Vimeo player with origin validation per B-4
  useEffect(() => {
    // 6000ms watchdog: if no play event arrives within 6000 ms, stay on poster forever
    const watchdogTimer = setTimeout(() => {
      // Do not force reveal if playback didn't start
    }, 6000);

    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== 'https://player.vimeo.com') return;

      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data) return;

        // Filter by player_id so multiple players never cross-talk
        if (data.player_id && String(data.player_id) !== String(videoId)) return;

        if (data.event === 'ready') {
          setIsLoaded(true);
          post('addEventListener', 'play');
          post('addEventListener', 'playing');
          post('addEventListener', 'pause');
          post('addEventListener', 'finish');
          post('addEventListener', 'timeupdate');
          post('setVolume', soundEnabled ? 1 : 0);
          if (autoPlay) {
            post('play');
          }
          onReady?.();
        } else if (data.event === 'play' || data.event === 'playing') {
          clearTimeout(watchdogTimer);
          setFacadeReady(true);
        } else if (data.event === 'finish' || data.event === 'ended') {
          onEnded?.();
        } else if (data.event === 'timeupdate') {
          if (data.data) {
            onTimeUpdate?.(data.data.percent, data.data.seconds);
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
  }, [videoId, autoPlay, soundEnabled, onReady, onEnded, onTimeUpdate]);

  const handleIframeLoad = () => {
    post('addEventListener', 'play');
    post('addEventListener', 'playing');
    if (autoPlay) {
      post('play');
    }
  };

  const embedUrl = `https://player.vimeo.com/video/${videoId}?api=1&player_id=${videoId}&autoplay=${
    autoPlay ? 1 : 0
  }&muted=${autoPlay ? 1 : (soundEnabled ? 0 : 1)}&playsinline=1&autopause=0&loop=1&background=0&controls=0&dnt=1&quality=1080p&app_id=122963`;

  return (
    <div className={`relative w-full h-full overflow-hidden bg-transparent ${className}`}>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        onLoad={handleIframeLoad}
        className={`absolute inset-0 w-full h-full border-0 pointer-events-auto bg-black transition-opacity duration-400 ${
          facadeReady ? 'opacity-100' : 'opacity-0'
        }`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        style={{ colorScheme: 'dark' }}
      />
    </div>
  );
}
