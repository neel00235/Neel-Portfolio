'use client';

import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { useSound } from '@/store/useSound';
import { playSound } from '@/lib/sound';

export interface PlayerChromeProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek?: (seconds: number) => void;
  onToggleFullscreen?: () => void;
  currentTime?: number;
  duration?: number;
  progress?: number; // 0 to 1
  className?: string;
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function PlayerChrome({
  isPlaying,
  onTogglePlay,
  onSeek,
  onToggleFullscreen,
  currentTime = 0,
  duration = 0,
  progress = 0,
  className = '',
}: PlayerChromeProps) {
  const { soundEnabled, toggleSound } = useSound();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);

  // During drag, reflect optimistic user position; otherwise follow real timeupdate
  const displayProgress = isDragging && dragProgress !== null ? dragProgress : progress;
  const clampedProgress = Math.min(1, Math.max(0, displayProgress));
  const displayTime =
    isDragging && dragProgress !== null && duration > 0 ? dragProgress * duration : currentTime;

  const getFractionFromPointer = (e: React.PointerEvent<HTMLDivElement>): number => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.button !== 0) return; // Only primary button
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    const fraction = getFractionFromPointer(e);
    setIsDragging(true);
    setDragProgress(fraction);
    if (duration > 0 && onSeek) {
      onSeek(fraction * duration);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    const fraction = getFractionFromPointer(e);
    setDragProgress(fraction);
    if (duration > 0 && onSeek) {
      onSeek(fraction * duration);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    const fraction = getFractionFromPointer(e);
    setIsDragging(false);
    setDragProgress(null);
    if (duration > 0 && onSeek) {
      onSeek(fraction * duration);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setIsDragging(false);
    setDragProgress(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (duration <= 0 || !onSeek) return;
    let targetTime: number | null = null;

    switch (e.key) {
      case 'ArrowLeft':
        targetTime = Math.max(0, currentTime - 5);
        break;
      case 'ArrowRight':
        targetTime = Math.min(duration, currentTime + 5);
        break;
      case 'ArrowDown':
        targetTime = Math.max(0, currentTime - 10);
        break;
      case 'ArrowUp':
        targetTime = Math.min(duration, currentTime + 10);
        break;
      case 'Home':
        targetTime = 0;
        break;
      case 'End':
        targetTime = duration;
        break;
      case 'PageDown':
        targetTime = Math.max(0, currentTime - 30);
        break;
      case 'PageUp':
        targetTime = Math.min(duration, currentTime + 30);
        break;
      default:
        return;
    }

    if (targetTime !== null) {
      e.preventDefault();
      e.stopPropagation();
      onSeek(targetTime);
    }
  };

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-t from-ground/90 via-ground/50 to-transparent transition-opacity duration-300 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            playSound('click');
            onTogglePlay();
          }}
          className="p-1.5 rounded-full text-cream/90 hover:text-terracotta hover:bg-cream/10 transition-colors"
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        <button
          type="button"
          onClick={() => {
            playSound('click');
            toggleSound();
          }}
          className="p-1.5 rounded-full text-cream/90 hover:text-terracotta hover:bg-cream/10 transition-colors"
          aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-muted" />}
        </button>

        {duration > 0 && (
          <span className="font-mono text-[0.68rem] tracking-wider text-muted select-none tabular-nums">
            {formatTime(displayTime)} / {formatTime(duration)}
          </span>
        )}
      </div>

      {/* Accessible Interactive Progress & Seek Slider with >=44px Hit Area */}
      <div
        ref={trackRef}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(displayTime)}
        aria-valuetext={`${formatTime(displayTime)} of ${formatTime(duration)}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="relative flex-1 h-11 mx-2 flex items-center cursor-pointer select-none touch-none group/slider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/80 rounded-md"
      >
        {/* Visible Track */}
        <div className="relative w-full h-1 bg-cream/15 rounded-full overflow-hidden group-hover/slider:h-1.5 transition-[height] duration-150">
          {/* Fill Bar - 100ms transition dropped while dragging for 1:1 responsive feel */}
          <div
            className={`h-full w-full bg-terracotta origin-left ${
              isDragging ? '' : 'transition-transform duration-100'
            }`}
            style={{ transform: `scaleX(${clampedProgress})` }}
          />
        </div>

        {/* Visible Scrubber Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cream border border-terracotta shadow-md pointer-events-none transition-transform ${
            isDragging
              ? 'opacity-100 scale-125'
              : 'opacity-0 group-hover/slider:opacity-100 group-focus-visible/slider:opacity-100 scale-100'
          }`}
          style={{ left: `${clampedProgress * 100}%` }}
        />
      </div>

      {onToggleFullscreen && (
        <button
          type="button"
          onClick={() => {
            playSound('click');
            onToggleFullscreen();
          }}
          className="p-1.5 rounded-full text-cream/90 hover:text-terracotta hover:bg-cream/10 transition-colors"
          aria-label="Toggle fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

