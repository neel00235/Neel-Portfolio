'use client';

import React from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { useSound } from '@/store/useSound';
import { playSound } from '@/lib/sound';

interface PlayerChromeProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onToggleFullscreen?: () => void;
  currentTime?: number;
  duration?: number;
  progress?: number; // 0 to 1
  className?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function PlayerChrome({
  isPlaying,
  onTogglePlay,
  onToggleFullscreen,
  currentTime = 0,
  duration = 0,
  progress = 0,
  className = '',
}: PlayerChromeProps) {
  const { soundEnabled, toggleSound } = useSound();

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
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        )}
      </div>

      {/* Progress track */}
      <div className="relative flex-1 h-1 mx-2 bg-cream/15 rounded-full overflow-hidden">
        <div
          className="h-full w-full bg-terracotta origin-left transition-transform duration-100"
          style={{ transform: `scaleX(${Math.min(1, Math.max(0, progress))})` }}
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
