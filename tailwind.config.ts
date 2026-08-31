import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ground:   { DEFAULT: '#13100c', 2: '#1b1611', 3: '#241d16' },
        cream:    { DEFAULT: '#faf4e8', 2: '#e2d7c0' },
        muted:    '#948a7b',
        terracotta: '#f67c29',
        kraft:      '#d6a76c',
        wine:       '#852b36',   // FILLS ONLY — never as text colour
        indigo:     '#2c3ea0',   // FILLS ONLY — never as text colour
        on: {
          terracotta: '#13100c',
          wine:       '#faf4e8',
          indigo:     '#faf4e8',
        },
        line:  { DEFAULT: 'rgb(214 167 108 / 0.22)', 2: 'rgb(214 167 108 / 0.11)', 3: 'rgb(214 167 108 / 0.45)' },
        tone:  'var(--tone)',            // live per-video ambient hue
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        displayAlt: ['var(--font-display-alt)', 'Georgia', 'serif'],
        taurian: ['var(--font-taurian)', 'Georgia', 'serif'],
        serif:   ['var(--font-instrument)', 'Georgia', 'serif'],
        script:  ['var(--font-ephesis)', 'cursive'],
        sans:    ['var(--font-manrope)', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        mega:  ['clamp(3.2rem, 13vw, 11.5rem)',  { lineHeight: '0.86', letterSpacing: '-0.03em' }],
        huge:  ['clamp(2.2rem, 6.5vw, 5.5rem)',  { lineHeight: '0.94', letterSpacing: '-0.02em' }],
        big:   ['clamp(1.65rem, 4.2vw, 3.2rem)', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        lead:  ['clamp(1.02rem, 1.6vw, 1.4rem)', { lineHeight: '1.55' }],
        body:  ['clamp(0.92rem, 1.05vw, 1.05rem)', { lineHeight: '1.68' }],
        label: ['clamp(0.64rem, 0.75vw, 0.76rem)', { lineHeight: '1.2', letterSpacing: '0.22em' }],
      },
      spacing: {
        pad:   'clamp(1.25rem, 4vw, 3.5rem)',
        block: 'clamp(6rem, 14vh, 12rem)',   // casadisolare borrow — II.1
        hdr:   'clamp(3.75rem, 6.5vh, 5rem)',
      },
      maxWidth: { shell: '92rem', prose: '46rem' },
      transitionTimingFunction: {
        out:  'cubic-bezier(.16,1,.3,1)',
        io:   'cubic-bezier(.65,.05,.36,1)',
        soft: 'cubic-bezier(.4,0,.2,1)',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        marquee:   { '0%': { transform: 'translate3d(0,0,0)' }, '100%': { transform: 'translate3d(-50%,0,0)' } },
        spinSlow:  { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        grain:     { '0%,100%': { transform: 'translate3d(0,0,0)' }, '25%': { transform: 'translate3d(-2%,1%,0)' }, '50%': { transform: 'translate3d(1%,-2%,0)' }, '75%': { transform: 'translate3d(-1%,-1%,0)' } },
        scanline:  { '0%': { transform: 'translate3d(0,-100%,0)' }, '100%': { transform: 'translate3d(0,100%,0)' } },
        rgbSplit:  { '0%,100%': { transform: 'translate3d(0,0,0)' }, '20%': { transform: 'translate3d(-3px,1px,0)' }, '40%': { transform: 'translate3d(2px,-2px,0)' }, '60%': { transform: 'translate3d(-1px,2px,0)' }, '80%': { transform: 'translate3d(3px,0,0)' } },
        pulseDot:  { '0%,100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '.45', transform: 'scale(.82)' } },
        textFloat:   { '0%,100%': { transform: 'translate3d(0,0,0)' },
                       '50%':     { transform: 'translate3d(0,-2px,0)' } },
        textBreathe: { '0%,100%': { opacity: '1' },
                       '50%':     { opacity: '.90' } },
        gradientPan: { '0%': { backgroundPosition: '0% 50%' },
                       '50%': { backgroundPosition: '100% 50%' },
                       '100%': { backgroundPosition: '0% 50%' } },
      },
      animation: {
        fadeIn:   'fadeIn 420ms cubic-bezier(.16,1,.3,1)',
        marquee:  'marquee 34s linear infinite',
        'marquee-slow': 'marquee 75s linear infinite',
        spinSlow: 'spinSlow 18s linear infinite',
        grain:    'grain 8s steps(6) infinite',
        scanline: 'scanline 240ms linear 1',
        rgbSplit: 'rgbSplit 240ms steps(5) 1',
        pulseDot: 'pulseDot 2.4s ease-in-out infinite',
        'text-float':   'textFloat 6.5s cubic-bezier(.4,0,.2,1) infinite',
        'text-breathe': 'textBreathe 5.2s cubic-bezier(.4,0,.2,1) infinite',
        gradientPan:    'gradientPan 8s ease-in-out infinite',
      },
      backgroundImage: {
        'scrim-b': 'linear-gradient(to top, rgb(19 16 12 / .82) 0%, rgb(19 16 12 / .45) 34%, transparent 62%)',
        'scrim-t': 'linear-gradient(to bottom, rgb(19 16 12 / .70) 0%, transparent 46%)',
        'tone-glow': 'radial-gradient(ellipse at 50% 35%, var(--tone-blend) 0%, transparent 68%)',
      },
    },
  },
  plugins: [],
} satisfies Config
