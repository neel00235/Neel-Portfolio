# Neel Patel — Portfolio

A single-page, award-grade, layered, scroll-driven portfolio for a video editor and colourist.
Static HTML, CSS, and JS — no build step, no dependencies, no framework, works straight off `file://`.

```
neel-portfolio/
├── index.html          the whole page (7 sections + curtain + chrome)
├── css/main.css        design system (warm palette, Fraunces/Instrument/Ephesis type, layered motion)
├── js/data.js          GENERATED — video metadata & editorial copy
├── js/app.js           unified engine (Video, Works chapters, Gallery, Skills band, Services sheets, rAF loop)
├── assets/
│   ├── manifest.json   GENERATED — video metadata + dominant tones
│   ├── thumbs/         52 WebP stills, 1280px wide
│   ├── fonts/          self-hosted Fraunces variable, Instrument Serif, Ephesis, Manrope, JetBrains Mono
│   ├── neel-collage.webp  pre-processed warm desaturated portrait for parallax collage hero
│   └── neel.jpg/.webp  portrait source files
├── build-assets.py     fetches Vimeo metadata + extracts dominant tones + processes portrait → manifest.json
└── build-data.py       manifest.json + editorial copy → js/data.js
```

## Running it

Open `index.html` directly in your browser — it works directly from `file://`, which is why `data.js` exposes a plain `window.DATA` global rather than an ES module.

For a local server:

```bash
npx --yes serve -l 5173 .
```

## Section Order (DOM-authoritative)

1. `01 About Me` (`#about`) — 3-layer parallax hero with torn-paper collage portrait and spec sheet.
2. `02 Selected Works` (`#works`) — 100svh lead reel + 5 full-bleed layered chapters + horizontal rail + fanned Conroy deck.
3. `03 Gallery` (`#gallery`) — All 52 unique uploads in one responsive masonry grid with 5 kicker filter chips.
4. `04 Toolkit` (`#skills`) — 15 skills with sticky terracotta highlight band and clipped inverted text reveal.
5. `05 Services` (`#services`) — 6 stacking sheets (scaling to .97 on scroll) featuring single `--indigo` accent sheet.
6. `06 Contact` (`#contact`) — Display headline with Ephesis script, direct contact rows, rotating circular badge, and simplified 3-field form (Name, Email, Message).
7. `07 Thank You` (`#thankyou`) — Terracotta sheet with mirrored typography and footer.

`buildNav()` dynamically computes section numbering `01…07` from DOM order on load.

## Video System

- **Zero initial `<iframe>` elements.** Zero Vimeo requests on cold load.
- Poster-first placeholders with explicit aspect ratios (`--ar`) and dimensions for **0 CLS**.
- Single `IntersectionObserver` with LRU eviction enforcing `MAX_LIVE` concurrency (**2** on desktop, **1** on mobile).
- Real unmount teardown (`src='about:blank'`, `iframe.remove()`).
- Mode swap: silent looping previews (`mode: 'loop'`, `background=1`) vs full sound player (`mode: 'play'`) on tap/click.
- Ambient `--tone` glow dynamically follows the active reel, clamped to palette by blending 65% tone + 35% ground.

## Changing Content & Regenerating

1. Video list and dominant tones: `build-assets.py` (needs Pillow).
2. Editorial copy: `build-data.py`.
3. Run pipeline:
   ```bash
   python build-assets.py; python build-data.py
   ```
