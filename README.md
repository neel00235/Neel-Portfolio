# Neel Patel — Video Editor & Colourist (2026 Edition)

An Awwwards Site-of-the-Day-grade, cinematic portfolio built with **Next.js 15 App Router**, **TypeScript**, **Tailwind CSS**, **GSAP (ScrollTrigger + Flip)**, **Lenis**, **OGL**, and **Zustand**. 

Static export (`output: 'export'`) emitting **57 static HTML pages** (5 routes + 52 standalone, crawlable `/project/[slug]` pages with complete OpenGraph and `schema.org` VideoObject metadata).

---

## Directory Structure

```
neel-portfolio/
├── docs/
│   ├── ABSOLUTE-CINEMA-BLUEPRINT.md  master architectural specification
│   └── archive/v3-static/            archived v3 baseline static build
├── out/                              GENERATED static HTML/asset distribution (57+ HTML files)
├── public/
│   ├── audio/                        UI audio one-shots
│   ├── fonts/                        self-hosted Fraunces, Instrument Serif, Ephesis, Manrope, JetBrains Mono
│   ├── og/                           52 social OpenGraph preview images (1200x630)
│   ├── portrait/                     editorial portrait collage assets
│   ├── posters/                      52 multi-resolution WebP posters
│   └── previews/                     Tier-1 preview micro-assets
├── scripts/
│   ├── build-posters.mjs             Sharp-based multi-resolution poster & LQIP generator
│   └── verify-content.mjs            Prime Directive I content preservation gate
├── src/
│   ├── app/                          Next.js 15 App Router pages & metadata routes
│   │   ├── page.tsx                  Home narrative single scroll
│   │   ├── projects/page.tsx         Complete 52-video gallery catalogue
│   │   ├── project/[slug]/page.tsx   52 individual static project routes
│   │   ├── about/page.tsx            Dedicated about editorial route
│   │   ├── contact/page.tsx          Dedicated contact route
│   │   ├── layout.tsx                Root layout with font variables, smooth scroll, & textures
│   │   ├── sitemap.ts                Static XML sitemap generator
│   │   └── robots.ts                 Robots.txt generator
│   ├── components/
│   │   ├── canvas/ToneField.tsx      OGL WebGL ambient shader plane
│   │   ├── curtain/Curtain.tsx       Scroll-to-split aperture bisection preloader
│   │   ├── cursor/MagneticCursor.tsx 60fps write-only magnetic cursor with 9 states
│   │   ├── cursor/Magnetic.tsx       Magnetic interactive element wrapper
│   │   ├── layout/                   Header & Footer components
│   │   ├── scroller/                 Lenis + GSAP ScrollTrigger smooth scroller
│   │   ├── sections/                 Hero, SelectedWorks, Gallery, Toolkit, Services, Contact
│   │   └── video/                    VideoFrame, VimeoFacade, PlayerChrome
│   ├── data/
│   │   ├── content.ts                VERBATIM prose, specs, endpoints, and labels
│   │   ├── lqip.json                 52 base64 blurDataURLs
│   │   ├── portfolio.generated.ts    GENERATED typed catalogue
│   │   └── slugs.ts                  52 frozen slugs
│   └── store/
│       ├── useSound.ts               Global audio state and toggle
│       ├── useTone.ts                Ambient tone system with CSS @property synchronization
│       └── useVideoRegistry.ts       Bounded concurrency LRU for video players
├── tests/
│   └── content.lock.json             Immutable Content Fixture
└── tools/
    ├── build-assets.py               Pillow asset processor
    └── build-data.py                 Authoritative Python data generator
```

---

## Running Locally

### Development Server
```bash
npm run dev
```
Visit `http://localhost:3000`.

### Content Verification Gate (Prime Directive I)
```bash
npm run verify-content
```
Enforces 100% byte-identical content preservation against `tests/content.lock.json`, zero `DaVinci` occurrences, and exact 52-video integrity.

### Production Static Export
```bash
npm run build
```
Emits static distribution in `out/`.

### Previewing Production Build
```bash
npx serve out
```

---

## The Video Protocol

- **Two-Tier Video Architecture**:
  - **Tier 1 (Rest)**: Local multi-resolution WebP posters with blur-up LQIPs.
  - **Tier 2 (Intent)**: Custom lightweight `VimeoFacade` (~60 lines, no external iframe SDK) loaded only upon user tap/click. Headless `PlayerChrome` with custom play/pause, timecode, progress scrubbing, and fullscreen.
- **Bounded Concurrency LRU**: Enforces max 1 full video with sound at any time.
- **Ambient Tone Propagation**: Active video's dominant tone dynamically tints 5 surfaces (ambient glow, hairline rules, progress rail, chapter numerals, and WebGL shader) via CSS `@property`.

---

## License & Copyright

All video edits, motion graphics, and content © 2026 Neel Patel. All rights reserved.
"# Neel-Portfolio" 
