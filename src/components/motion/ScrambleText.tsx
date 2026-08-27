'use client';

import React, { useState, useRef } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789✦_—';

interface ScrambleTextProps {
  text: string;
  className?: string;
}

export function ScrambleText({ text, className = '' }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const animatingRef = useRef(false);
  const frameRef = useRef(0);

  const handleMouseEnter = () => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    frameRef.current = 0;
    const maxFrames = 8;
    const intervalMs = Math.floor(420 / maxFrames); // ~50ms per frame, capped at 420ms per R-38

    const timer = setInterval(() => {
      frameRef.current += 1;
      if (frameRef.current >= maxFrames) {
        clearInterval(timer);
        setDisplayText(text);
        animatingRef.current = false;
        return;
      }

      // Progressively settle characters from left to right
      const progress = frameRef.current / maxFrames;
      const settledCount = Math.floor(progress * text.length);
      const scrambled = text
        .split('')
        .map((char, i) => {
          if (char === ' ' || char === '/' || char === '(' || char === ')' || i < settledCount) return char;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join('');

      setDisplayText(scrambled);
    }, intervalMs);
  };

  return (
    <span onMouseEnter={handleMouseEnter} className={className} aria-label={text}>
      {displayText}
    </span>
  );
}
