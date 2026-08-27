import localFont from 'next/font/local';

export const fraunces = localFont({
  src: '../../public/fonts/fraunces-var-latin.woff2',
  variable: '--font-fraunces',
  display: 'swap',
  weight: '100 900',
  style: 'normal',
});

export const instrumentSerif = localFont({
  src: [
    {
      path: '../../public/fonts/instrument-serif-latin.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/instrument-serif-italic-latin.woff2',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-instrument',
  display: 'swap',
});

export const ephesis = localFont({
  src: '../../public/fonts/ephesis-subset.woff2',
  variable: '--font-ephesis',
  display: 'swap',
  weight: '400',
  style: 'normal',
});

export const manrope = localFont({
  src: '../../public/fonts/manrope-300-800-latin.woff2',
  variable: '--font-manrope',
  display: 'swap',
  weight: '300 800',
  style: 'normal',
});

export const jetbrainsMono = localFont({
  src: [
    {
      path: '../../public/fonts/jetbrains-mono-400-latin.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/jetbrains-mono-500-latin.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-jetbrains',
  display: 'swap',
});
