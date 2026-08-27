'use client';

import React from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-[fadeIn_0.4s_ease-out_forwards] w-full">
      {children}
    </div>
  );
}
