'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSound } from '@/store/useSound';

interface VimeoFacadeProps {
  videoId: string;
  title: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (percent: number, seconds: number) => void;
  className?: string;
}

export function VimeoFacade({
  videoId,
  title,
  autoPlay = true,
  onEnded,
  onTimeUpdate,
  className = '',
}: VimeoFacadeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const soundEnabled = useSound((s) => s.soundEnabled);
  const [isLoaded, setIsLoaded] = useState(false);

  // Send message to Vimeo iframe
  const post = (method: string, value?: unknown) => {
    if (!iframeRef.current?.contentWindow) return;
    const msg = JSON.stringify({ method, value });
    iframeRef.current.contentWindow.postMessage(msg, '*');
  };

  // Sync mute with global sound state
  useEffect(() => {
    if (isLoaded) {
      post('setVolume', soundEnabled ? 1 : 0);
    }
  }, [soundEnabled, isLoaded]);

  // Handle messages from Vimeo player
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data || data.player_id !== videoId && !data.event) return;

        if (data.event === 'ready') {
          setIsLoaded(true);
          post('addEventListener', 'play');
          post('addEventListener', 'pause');
          post('addEventListener', 'finish');
          post('addEventListener', 'timeupdate');
          post('setVolume', soundEnabled ? 1 : 0);
          if (autoPlay) {
            post('play');
          }
        } else if (data.event === 'finish') {
          onEnded?.();
        } else if (data.event === 'timeupdate') {
          if (data.data) {
            onTimeUpdate?.(data.data.percent, data.data.seconds);
          }
        }
      } catch {
        // non-JSON message
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [videoId, autoPlay, soundEnabled, onEnded, onTimeUpdate]);

  const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=${autoPlay ? 1 : 0}&muted=${soundEnabled ? 0 : 1}&loop=1&background=0&controls=0&dnt=1&quality=1080p&app_id=122963`;

  return (
    <div className={`relative w-full h-full overflow-hidden bg-ground-2 ${className}`}>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        className="absolute inset-0 w-full h-full border-0 pointer-events-auto"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
