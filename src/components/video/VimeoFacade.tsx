'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useSound } from '@/store/useSound';

export interface VimeoFacadeHandle {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
}

export interface VimeoFacadeProps {
  videoId: string;
  playerId?: string;
  title: string;
  autoPlay?: boolean;
  onReady?: () => void;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onDuration?: (duration: number) => void;
  onTimeUpdate?: (percent: number, seconds: number) => void;
  className?: string;
}

export const VimeoFacade = forwardRef<VimeoFacadeHandle, VimeoFacadeProps>(function VimeoFacade(
  {
    videoId,
    playerId,
    title,
    autoPlay = true,
    onReady,
    onEnded,
    onPlay,
    onPause,
    onDuration,
    onTimeUpdate,
    className = '',
  }: VimeoFacadeProps,
  ref
) {
  const effectivePlayerId = playerId || videoId;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const soundEnabled = useSound((s) => s.soundEnabled);
  const [facadeReady, setFacadeReady] = useState(false);
  const pendingSeekRef = useRef<number | null>(null);

  // Keep latest callbacks in ref to prevent message-listener thrashing
  const callbacksRef = useRef({
    onReady,
    onEnded,
    onPlay,
    onPause,
    onDuration,
    onTimeUpdate,
  });

  useEffect(() => {
    callbacksRef.current = {
      onReady,
      onEnded,
      onPlay,
      onPause,
      onDuration,
      onTimeUpdate,
    };
  });

  // Send message to Vimeo iframe with exact targetOrigin
  const post = (method: string, value?: unknown) => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      const msg = JSON.stringify(value !== undefined ? { method, value } : { method });
      iframeRef.current.contentWindow.postMessage(msg, 'https://player.vimeo.com');
    } catch {}
  };

  const listenersRegisteredRef = useRef(false);

  const setupListeners = () => {
    if (listenersRegisteredRef.current) {
      post('getDuration');
      post('setVolume', soundEnabled ? 1 : 0);
      return;
    }
    listenersRegisteredRef.current = true;
    const events = ['play', 'playing', 'pause', 'finish', 'ended', 'timeupdate', 'seek', 'seeked', 'progress'];
    for (const evt of events) {
      post('addEventListener', evt);
    }
    post('getDuration');
    post('setVolume', soundEnabled ? 1 : 0);
    if (autoPlay) {
      post('play');
    }
  };

  // Expose imperative handle for player control (seek, play, pause)
  useImperativeHandle(
    ref,
    () => ({
      play: () => {
        post('play');
      },
      pause: () => {
        post('pause');
      },
      seekTo: (seconds: number) => {
        const s = Math.max(0, seconds);
        post('seekTo', s);
        post('setCurrentTime', s);
        pendingSeekRef.current = s;
      },
    }),
    []
  );

  // Sync mute with global sound state
  useEffect(() => {
    post('setVolume', soundEnabled ? 1 : 0);
  }, [soundEnabled]);

  // Handle messages from Vimeo player with origin validation per B-4 / Ground Rule 11
  useEffect(() => {
    const watchdogTimer = setTimeout(() => {
      // Stay on poster if no play event arrives
    }, 6000);

    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== 'https://player.vimeo.com') return;

      try {
        let data = e.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            return;
          }
        }
        if (!data || typeof data !== 'object') return;

        // Filter by player_id so multiple players never cross-talk
        if (data.player_id && String(data.player_id) !== String(effectivePlayerId)) return;

        const eventName = String(data.event || data.method || '').toLowerCase();

        if (eventName === 'ready') {
          setupListeners();
          if (pendingSeekRef.current !== null) {
            post('seekTo', pendingSeekRef.current);
            post('setCurrentTime', pendingSeekRef.current);
          }
          callbacksRef.current.onReady?.();
        } else if (eventName === 'play' || eventName === 'playing' || eventName === 'onplay') {
          clearTimeout(watchdogTimer);
          setFacadeReady(true);
          callbacksRef.current.onPlay?.();
        } else if (eventName === 'pause' || eventName === 'onpause') {
          callbacksRef.current.onPause?.();
        } else if (eventName === 'finish' || eventName === 'ended' || eventName === 'onfinish') {
          callbacksRef.current.onEnded?.();
        } else if (
          eventName === 'timeupdate' ||
          eventName === 'ontimeupdate' ||
          eventName === 'playprogress'
        ) {
          let payload = data.data ?? data.value ?? data;
          if (typeof payload === 'string') {
            try {
              payload = JSON.parse(payload);
            } catch {}
          }

          const seconds =
            typeof payload?.seconds === 'number'
              ? payload.seconds
              : typeof payload?.currentTime === 'number'
              ? payload.currentTime
              : typeof payload === 'number'
              ? payload
              : 0;

          const percent =
            typeof payload?.percent === 'number'
              ? payload.percent
              : typeof payload?.progress === 'number'
              ? payload.progress
              : 0;

          const dur =
            typeof payload?.duration === 'number'
              ? payload.duration
              : typeof data?.duration === 'number'
              ? data.duration
              : 0;

          callbacksRef.current.onTimeUpdate?.(percent, seconds);
          if (dur > 0) {
            callbacksRef.current.onDuration?.(dur);
          }
        } else if (eventName === 'getduration') {
          const dur =
            typeof data.value === 'number'
              ? data.value
              : typeof data.data === 'number'
              ? data.data
              : 0;
          if (dur > 0) {
            callbacksRef.current.onDuration?.(dur);
          }
        }
      } catch {
        // Non-JSON message from external scripts
      }
    };

    window.addEventListener('message', handleMessage);

    // Initial listener registration attempt
    setupListeners();

    return () => {
      clearTimeout(watchdogTimer);
      window.removeEventListener('message', handleMessage);
    };
  }, [videoId, effectivePlayerId, autoPlay, soundEnabled]);

  const handleIframeLoad = () => {
    setupListeners();
  };

  const embedUrl = `https://player.vimeo.com/video/${videoId}?api=1&player_id=${encodeURIComponent(
    effectivePlayerId
  )}&autoplay=${
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
});

