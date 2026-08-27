'use client';

import dynamic from 'next/dynamic';

export const ToneFieldLazy = dynamic(
  () => import('./ToneField').then((m) => m.ToneField),
  { ssr: false }
);
