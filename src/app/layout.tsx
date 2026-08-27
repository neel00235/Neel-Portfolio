import type { Metadata, Viewport } from 'next';
import './globals.css';
import {
  fraunces,
  instrumentSerif,
  ephesis,
  manrope,
  jetbrainsMono,
} from '@/lib/fonts';
import { Header } from '@/components/layout/Header';
import { MagneticCursor } from '@/components/cursor/MagneticCursor';
import { SmoothScroller } from '@/components/scroller/SmoothScroller';
import { ToneField } from '@/components/canvas/ToneField';
import { ToneBridge } from '@/components/system/ToneBridge';
import { META } from '@/data/content';

export const metadata: Metadata = {
  metadataBase: new URL(META.url),
  title: {
    default: META.title,
    template: '%s · Neel Patel',
  },
  description: META.description,
  authors: [{ name: META.author, url: META.url }],
  openGraph: {
    title: META.title,
    description: META.ogDescription,
    url: META.url,
    siteName: META.title,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/portrait/neel-collage.webp',
        width: 1200,
        height: 630,
        alt: 'Neel Patel — Video Editor & Colourist',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: META.title,
    description: META.ogDescription,
    creator: '@neelvt',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: META.themeColor,
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${instrumentSerif.variable} ${ephesis.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" />
      </head>
      <body
        suppressHydrationWarning
        className="relative bg-ground text-cream selection:bg-terracotta selection:text-ground font-sans antialiased overflow-x-clip"
      >
        <ToneBridge />
        {/* Background Tone Shader & Texture stack */}
        <ToneField />
        <div className="fixed inset-0 pointer-events-none grid-overlay z-0 opacity-40" aria-hidden="true" />
        <div className="fixed inset-0 pointer-events-none film-grain z-0 opacity-30" aria-hidden="true" />

        {/* Global Context Cursor */}
        <MagneticCursor />

        {/* Smooth Scroll Container with Header and Page Content */}
        <SmoothScroller>
          <Header />
          <main className="relative z-10">{children}</main>
        </SmoothScroller>
      </body>
    </html>
  );
}
