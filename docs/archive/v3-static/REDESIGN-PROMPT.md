# BUILD PROMPT — Neel Patel Portfolio v3 ("Collage Cinema")

> **How to use this document.** Paste it whole as the opening prompt of a fresh session with
> the project folder `D:\CLAUDE\neel-portfolio` attached. It is self-contained: it carries the
> repo's ground truth, the art direction, the interaction inventory, the mobile rules, the
> performance budget and a testable acceptance checklist. Build in the order given in §15.
> Do not ask for clarification on anything already decided here — every open question is
> listed in §18 with a stated default. Implement the default and flag it.

---

## 1 · MISSION

Rebuild `D:\CLAUDE\neel-portfolio` from a competent-but-plain scrolling page into an
**award-site-grade, heavily layered, scroll-driven experience** for a video editor and
colourist — while keeping it a **dependency-free static site** that stays fast on a mid-range
Android phone on 4G.

Three things must all be true when you are done:

1. **It looks extraordinary.** Big wonky display type, collage graphics, full-bleed colour
   sheets, layered reveals, videos surfacing through masks. Nothing on the page should read
   as a default.
2. **It is obvious to use.** A recruiter who has never seen the site scrolls once, top to
   bottom, and sees every piece of work without clicking anything. No modals. No hidden
   content. No "click to load".
3. **It is fast and it works on a phone.** Zero video requests at first paint, ≤ 4 requests
   before first scroll, LCP under 1.8s on 4G, CLS exactly 0, and every animation running on
   `transform`/`opacity` only.

If any two of those conflict, the priority order is **2 → 3 → 1**.

---

## 2 · REPO GROUND TRUTH (verify before you change anything)

Dependency-free static site. No build step, no npm, no framework. Must keep working when
`index.html` is opened directly off the filesystem (`file://`), which is why data is a plain
`window.DATA` global and not an ES module.

```
D:\CLAUDE\neel-portfolio\
├── index.html            408 lines   single page, 6 sections
├── css/main.css        1,695 lines   navy token system, all components
├── js/app.js             956 lines   11-section engine (see below)
├── js/data.js            673 lines   GENERATED — never hand-edit
├── build-assets.py       168 lines   Vimeo oEmbed → assets/thumbs/<id>.webp + manifest.json
├── build-data.py         284 lines   manifest.json → js/data.js
├── README.md             166 lines   partly stale
├── assets/
│   ├── neel.jpg          490 KB      1400×1867 portrait
│   ├── neel.webp         426 KB
│   ├── neel-sm.webp      144 KB
│   ├── manifest.json      10 KB
│   ├── fonts/                        self-hosted, subset: Manrope 300–800, JetBrains Mono
│   └── thumbs/           52 files    <vimeo-id>.webp posters
└── .claude/launch.json               npx serve -l 5173 .
```

### Current section order (already correct — keep it)

`01 About Me → 02 Selected Works → 03 Toolkit → 04 Services → 05 Contact → 06 Thank You`

Section numbering is derived at runtime from DOM order by `buildNav()`, which walks
`main > section[data-nav]` and stamps `.sect__label span`, builds `#menuList`, and wires a
scroll-spy into `#hdrNow`. **Reordering a `<section>` in the HTML renumbers everything
automatically.** Preserve that property — do not reintroduce hardcoded numbers.

### `js/app.js` module map (what exists today)

| Module / fn | Role |
|---|---|
| `splitAll` / `[data-split]` | per-character span wrapping for staggered title reveals |
| `animIO` + `reveal()` + `observeAnims()` | one IntersectionObserver drives all `[data-anim]` / `.pair` entrance reveals; clears `will-change` on `transitionend {once:true}` |
| `Video` | poster-first video host; injects Vimeo iframes on scroll-in; `MAX_LIVE = 2` LRU with real `iframe.src='about:blank'; iframe.remove()` teardown; `mount/unmount/evict/stopAll/refresh` |
| `Works` | builds `#reel` (lead film) + `#hlRows` (6 highlight tiles) + `#discList` (16 discipline rows); `Works.frame()` does the reel parallax |
| `Panel` | full-screen modal with the 52-video grid, opened by clicking a discipline row — **THIS IS BEING DELETED, see §6.3** |
| `buildSkills` / `buildServices` | list builders |
| `initForm` | validation, `:user-invalid` + `.is-bad`, injected `.field__err`, `fetch()` POST with `mailto:` fallback, `_gotcha` honeypot |
| `initCursor` / `Cursor.frame()` | custom cursor lerp, `pointer:fine` only |
| `initChrome` / `initMisc` | header, menu, counters, year |
| `boot()` | 2-image preload gate, 2500 ms hard cap, then reveals the hero |

One `requestAnimationFrame` loop for the whole page, currently calling `Cursor.frame()` +
`Works.frame()`. **Keep it to exactly one rAF loop** no matter how many effects you add.

### `js/data.js` shape (generated — read only)

```js
window.DATA = {
  SECTIONS: [ { slug, title, kicker, blurb, accent, works: [ { id, title, aspect, duration, w, h } ] } ],  // 16
  SKILLS:   [ { name, desc } ],     // 15
  SERVICES: [ { name, desc } ],     // 6
  STATS: { edits: 52, categories: 16 }
};
```

- 16 sections, 53 placements, **52 unique Vimeo uploads**.
- The 5 `kicker` values are the only grouping you need: `Client work`, `Craft`, `Rhythm`,
  `Long form`, `Study`.
- Lead film = `SECTIONS[0].works[0]` → id `1220556151`, "Conroy — Cinematic Reel", 16:9, 22s,
  1280×720.
- `SECTIONS[0]` ("Brand Films") holds **1 horizontal + 9 near-identical vertical Conroy
  reels**. That repetition is the specific thing the client complained about. See §6.3.

**To change data, edit `build-data.py` / `build-assets.py` and re-run. Never touch
`js/data.js` by hand.**

---

## 3 · REFERENCE ANALYSIS — `https://namy.design/`

The client supplied this site plus a screen recording as the target experience. The following
techniques were read off the actual screenshots and are the concrete brief. Replicate the
**techniques and the density**, not the layout or the content — this is a video-editor
portfolio, not a product-designer portfolio.

### 3.1 Reference palette (observed)

| Role | Observed value |
|---|---|
| Ground | warm near-black ≈ `#1C1C1A`, with a faint graph-paper grid overlay |
| Primary ink | soft cream with a green cast ≈ `#E9E6C4` |
| Hot accent | orange ≈ `#F58220` — logo, one highlighted phrase, full-bleed bands, circular badge, fixed ↗ button |
| Cool accent | electric blue ≈ `#1E2FE0` — exactly one full-bleed band (AWARDS) |
| Muted | grey ≈ `#8A8A88` for nav and small labels |

Structure to steal: **dark warm ground + cream ink + one hot accent + one cool accent used
exactly once.** We change the hues (§4.1) but keep this structure.

### 3.2 Reference typography (observed)

- **Display:** a quirky high-contrast art-nouveau serif — teardrop and ball terminals, a
  slashed/looped lowercase `o`, splayed `M`, spurred `G`, very high stroke contrast, condensed
  caps. Used enormous: `NAMRATA`, `MY PLAYGROUND`, `MEANINGFUL`, `BLUEPRINT / VISUAL /
  MOTION / EXPERIENCE`, `AWARDS / ACHIEVEMENTS`, `DIGITAL GOLD / GOLDSETU`.
- **Secondary display:** a softer mixed-case cut for sentence lines — `Let's create`,
  `Crafting Digital Experiences`, `From Textile Designer to Product Designer`, `Same eye for
  detail, bigger problems to solve`.
- **Labels:** small, wide-tracked, uppercase, muted, each followed by a **✦ four-pointed
  star** — `C O N N E C T`, `E X P L O R A T I O N S ✦`, `W H A T  I  D O ✦`,
  `A B O U T  M E ✦`, `S E L E C T  W O R K ✦`. This is a signature. Replicate it.
- **Body:** plain neutral sans, small, for the one-paragraph descriptions.

### 3.3 The fourteen reference interactions (this is the actual brief)

1. **Moving highlight band that inverts the text it crosses.** In `WHAT I DO`, a full-bleed
   orange band sits across one row of a list. The display word inside the band flips from
   cream to dark, and a description paragraph appears on the right edge of the band. As you
   scroll, the band travels down the list (BLUEPRINT → VISUAL → MOTION → EXPERIENCE →
   VALIDATE), inverting each word in turn. **This is the single most important effect to
   replicate.**
2. **Progressive-opacity list.** Rows below the active one fade toward transparent
   (`EXPERIENCE` half visible, `VALIDATE` ghosted), so the list reads as a depth stack.
3. **Scroll-driven horizontal rail.** `MY PLAYGROUND` is a row of mixed-aspect rounded cards
   that translate on X while the page scrolls on Y. Off-centre cards are dimmed.
4. **Per-chapter ambient tint that matches the artwork.** Each full-bleed project chapter has
   a huge soft background glow in the *artwork's own* colours — warm orange/brown for
   `GROUP ORDER`, gold for `DIGITAL GOLD`, cool metallic grey for `E-INVOICE`. The page
   changes colour to match what you are looking at. **This is exactly the client's "match the
   colour of the reel playing" request, and it is the most distinctive feature we can ship.**
5. **Huge display title layered with the artwork.** Two-line title bottom-left
   (`GROUP ORDER / PERSONAL`), artwork centre-right, and the type's z-index interleaves with
   the image so a letter passes behind it.
6. **Full-bleed colour "sheets" that slide over content.** The blue `AWARDS / ACHIEVEMENTS`
   band and the orange `NAMRATA` band enter as opaque sheets crossing the whole viewport,
   partially covering the section underneath. The client calls these "interactive sheets".
7. **Full-screen curtain overlay** with a giant name, a `×` close affordance top-centre, and
   a **circular `SCROLL · SCROLL · SCROLL` badge** with a down arrow.
8. **Rotating circular badges.** `OPEN TO WORK · CONTACT ME ·` set on a circle with an arrow
   glyph in the middle, rotating continuously.
9. **Mirrored/offset repeat of the same word** across a band edge (NAMRATA appearing twice,
   once inverted, split by the band).
10. **Persistent chrome on every screen:** fixed logo top-left, fixed muted nav top-right
    (ABOUT / WORK / CONTACT), fixed vertical social rail bottom-left, fixed hot-accent ↗
    button bottom-right.
11. **Collage / torn-paper portrait.** The About photo is not a rectangle. It is greyscale,
    wavy-cut-out masked, layered over paper texture with pink/green paper shapes, ferns,
    halftone dots and tape, rotated a few degrees, and stacked two cards deep with a smaller
    collage card behind it. **This is the answer to "the About Me photo looks normal".**
12. **Fanned card stack** for awards — three cards rotated behind each other, plus a floating
    3D bubble element.
13. **Photographic texture layers** — dark satin/fabric folds behind the About section; a
    faint graph grid over most dark sections.
14. **Word-by-word scroll-scrubbed text fill.** "I am a **Product Designer**, selectively
    skilled & intentionally thorough because pretty without purpose is just a wallpaper" —
    the leading words are bright cream, the trailing words are ghosted, and the bright/ghost
    boundary advances as you scroll. One phrase inside the cream headline is set in the hot
    accent.

---

## 4 · ART DIRECTION

### 4.1 Palette — warm, soft, editorial

The client's brief: *"soft colors… the current green looks a bit cyberpunk."* Kill every neon.
The new palette is derived from the supplied portrait — burgundy shirt, kraft/tan mural, warm
cream wall — and structured like the reference (§3.1).

```css
:root{
  /* ground */
  --ground:      #17140f;   /* warm espresso near-black — page */
  --ground-2:    #1e1a14;   /* raised surface */
  --ground-3:    #262019;   /* card fill */

  /* ink */
  --cream:       #efe7d2;   /* primary ink                     14.9:1 on --ground  ✓ */
  --cream-2:     #d8cdb4;   /* secondary ink                   ~11:1               ✓ */
  --muted:       #8e8577;   /* mono labels, nav rest state     ~4.6:1              ✓ */

  /* accents */
  --terracotta:  #c4633c;   /* HOT accent. bands, fills, badge.  4.54:1 — text OK only ≥18px or bold */
  --kraft:       #c9a06a;   /* accent TEXT, rules, chips.        7.6:1               ✓ */
  --wine:        #7e2e38;   /* FILL ONLY, never text.            2.04:1              ✗ */
  --indigo:      #2a3a8c;   /* FILL ONLY, used exactly once.     1.82:1              ✗ */

  /* ink that sits on top of a filled band */
  --on-terracotta: #17140f;
  --on-wine:       #efe7d2; /* 7.3:1 ✓ */
  --on-indigo:     #efe7d2; /* 8.2:1 ✓ */

  --line:   rgba(201,160,106,.18);
  --line-2: rgba(201,160,106,.09);
}
```

**Hard colour rules — these are contrast-verified, do not improvise:**

- `--wine` and `--indigo` are **fills only**. No text, no icons, no borders that must be seen.
- `--terracotta` may carry text **only** at ≥18px or bold. Small text uses `--kraft`.
- Every accent *text* use at body size goes to `--kraft`.
- `--indigo` appears on the page **exactly once** (one band). Scarcity is what makes it read
  as deliberate.
- **No neon, no cyan, no `#66FFDE`, no saturated green anywhere.** The 16 per-discipline hexes
  in `data.js` (which include `#66FFDE`, `#FE3448`, `#E0407A`) are **retired from all
  chrome**. They survive only as `--tone` ambient glows (§7.4) at ≤ 12% opacity, where they
  read as light, not as UI colour.

### 4.2 Typography — Google Fonts, self-hosted, subset

Match the reference's *wonky high-contrast art-nouveau display* (§3.2). Closest available
Google Fonts:

| Role | Family | Notes |
|---|---|---|
| **Display** | **Fraunces** (variable) | Axes `opsz 9–144`, `wght 100–900`, `SOFT 0–100`, `WONK 0–1`. Set **`WONK 1`**, high `opsz`, `SOFT 60` — this produces exactly the teardrop terminals and quirky letterforms in the reference. One variable `woff2` covers every size and weight. |
| **Secondary display** | **Instrument Serif** + its italic | For mixed-case sentence lines. High contrast, elegant, ~20 KB each. |
| **Script accent** | **Ephesis** | One or two words maximum per page — `felt`, `story`, `colour`. Subset to only the glyphs actually used. |
| **Body / UI** | **Manrope** | Already self-hosted and subset in `assets/fonts/`. Zero new cost. Keep. |
| **Mono labels** | **JetBrains Mono** | Already self-hosted. Keep. |

Rules:
- Self-host all of them in `assets/fonts/` alongside the existing files. **No Google Fonts
  CDN `<link>`** — it costs a DNS lookup, a TLS handshake and a render-blocking round trip.
- `font-display: swap` on every face. **Preload only Fraunces** (it draws the LCP element).
- Subset to `latin` + only the punctuation used. Ephesis subset to its literal glyph set.
- Total new font payload budget: **≤ 135 KB**. If Fraunces variable exceeds it after
  subsetting, drop Ephesis first.

Type scale:

```css
--t-mega:  clamp(3.4rem, 17vw, 15rem);    /* NEEL PATEL, section name bands */
--t-huge:  clamp(2.6rem, 9vw,  7.5rem);   /* chapter titles, list rows */
--t-big:   clamp(2rem,  5.5vw, 4.25rem);  /* section titles */
--t-lead:  clamp(1.15rem, 2.2vw, 1.75rem);
--t-body:  clamp(.95rem, 1.1vw, 1.05rem);
--t-label: clamp(.66rem, .8vw, .78rem);   /* mono, letter-spacing:.42em, uppercase */
```

Mono label pattern, used above **every** section title:

```html
<p class="label">S E L E C T &nbsp; W O R K <svg class="label__star">…</svg></p>
```

`letter-spacing:.42em; text-transform:uppercase; color:var(--muted)`. The ✦ is an **inline
SVG**, not a font glyph — no font can be relied on for it.

### 4.3 Texture stack (cheap, all CSS/SVG, no `filter` in any transition)

Bottom to top, all `position:fixed; pointer-events:none;` with fixed `z-index`:

1. **Graph grid** — `repeating-linear-gradient` at `rgba(201,160,106,.045)`, 48px cells.
   Present on all dark sections, as in the reference.
2. **Satin folds** — one 1600×900 WebP of soft dark fabric at `opacity:.14`,
   `mix-blend-mode:soft-light`, on the About section only. ≤ 40 KB.
3. **Film grain** — existing `.grain`, opacity `.02`. Animate with `transform:translate3d`
   steps, never `background-position`.
4. **Vignette** — recolour the existing `.vignette` to a warm radial in `--ground`.

Collage decorations (torn paper edges, halftone dots, tape strips, fern silhouettes) ship as
**inline SVG**, not raster images — they scale free and cost no requests.

### 4.4 Motion language

| Token | Value | Use |
|---|---|---|
| `--e-out` | `cubic-bezier(.16,1,.3,1)` | entrances |
| `--e-io` | `cubic-bezier(.65,.05,.36,1)` | sheets, bands |
| `--e-soft` | `cubic-bezier(.4,0,.2,1)` | tint crossfades |
| duration — entrance | `.9s` desktop / `.6s` mobile | |
| duration — sheet | `1.1s` | |
| duration — tint | `1.2s` | |
| stagger | `70ms` desktop / `45ms` mobile | per-char, per-row |

**Absolute rule: only `transform` and `opacity` in any transition or animation.** Never
`top`, `left`, `width`, `height`, `margin`, `padding`, `filter`, `box-shadow`,
`background-position`, or `backdrop-filter`. `clip-path` and `mask-position` are permitted
**only** on scroll-scrubbed elements that are already on their own compositor layer, and only
where a `transform` cannot express the effect.

`will-change:transform,opacity` is set in CSS on `[data-anim]` and **cleared on
`transitionend {once:true}`** — the existing `reveal()` already does this. Never leave more
than ~12 promoted layers alive at once.

---

## 5 · PAGE ARCHITECTURE

```
00  Curtain / preloader        full-screen terracotta sheet, giant NEEL PATEL, circular SCROLL badge
01  About Me         #about    collage hero — name band, collage portrait, lead, spec sheet, counters
02  Selected Works   #works    lead reel + 5 layered scroll chapters + horizontal rail
03  Gallery          #gallery  ALL 52 edits, one grid, 5 group filters   ← replaces the 16 discipline pages
04  Toolkit          #skills   moving-highlight-band list (§3.3.1)
05  Services         #services sheet-stack
06  Contact          #contact  3-field form + big display headline
07  Thank You        #thankyou giant name band + footer
```

Persistent chrome, fixed on every screen (§3.3.10):

- top-left: wordmark `NEEL / PATEL`, two lines, Fraunces
- top-right: `ABOUT · WORK · GALLERY · CONTACT` in `--muted`, active item `--cream`
- bottom-left: vertical rail — Instagram, Email, Phone
- bottom-right: circular terracotta `↗` button → `#contact`
- right edge: thin scroll-progress rail with a tick per section
- centre-top on scroll-up: the existing `#hdrNow` scroll-spy readout

Nav numbering stays derived from DOM order by `buildNav()`. Adding `#gallery` between Works
and Toolkit must renumber 01–07 with no hardcoded edits.

---

## 6 · SECTION SPECS

### 6.0 Curtain / preloader

Full-viewport `--terracotta` sheet. Giant `NEEL PATEL` in Fraunces `WONK 1`, dark
(`--on-terracotta`). A **rotating circular badge** reading `SCROLL · SCROLL · SCROLL` with a
down arrow (SVG `textPath` + CSS `rotate`, 18s linear infinite). Mono counter `000 → 100`.

Gate on **two** images only: `assets/neel-sm.webp` and the lead reel poster
`assets/thumbs/1220556151.webp`. Hard cap **2000 ms** — if the gate has not resolved, drop the
curtain anyway.

Exit: the sheet splits into **three horizontal bands** that slide off in opposite directions
(`translate3d(±110%,0,0)`) at 110 ms stagger, revealing the hero **already mid-animation
underneath** — so it reads as one continuous move, not two sequential ones.

Never show the curtain twice in a session (`sessionStorage`). With
`prefers-reduced-motion`, skip it entirely.

### 6.1 `01 · About Me` — collage hero

The client: *"The 'About Me' section with 'Neel Patel' looks normal, so integrate it better
with the photo."* Fix it with the reference's collage treatment (§3.3.11).

Three depth layers, all `translate3d` parallax off one scroll value:

| Layer | Content | Parallax factor |
|---|---|---|
| back | `NEEL PATEL` at `--t-mega`, Fraunces `WONK 1`, `--cream-2` at 22% opacity, bleeding past both edges | `0.15` |
| mid | the **collage portrait card** | `0.42` |
| front | mono spec sheet, lead paragraph, counters, CTAs, a `--kraft` hairline rule | `0.8` |

Because the back layer is type and the mid layer is the photo, **the giant name passes behind
his head** — that is the integration the client is asking for.

**Collage portrait card** — build from `assets/neel.webp`:

- Wavy torn-paper edge via SVG `<clipPath>` (not `border-radius`).
- Rotated `-3.5deg`, and a **second, smaller collage card rotated `+6deg` behind it**, offset
  down-left, as in the reference.
- Behind the subject: kraft paper texture, three fern silhouettes (inline SVG), a halftone dot
  field, one soft `--wine` paper shape and one `--kraft` shape.
- Two tape strips across the corners (inline SVG, `--cream-2` at 30%).
- Desaturate the source to ~35% and warm-tint it so it sits in the palette; do this **at build
  time in `build-assets.py` with Pillow**, emitting `assets/neel-collage.webp`. Do **not** use
  a CSS `filter` — it costs a paint every frame during parallax.
- On hover (desktop only): the card lifts `translate3d(0,-8px,0)` and the back card
  counter-rotates 1deg. No shadow transition.

Right column: `--t-lead` intro with **one word in Ephesis script** and one phrase in
`--kraft`; the existing three paragraphs; the six tag chips; the mono spec `<dl>` (Role,
Based in, Availability, Reply within, Primary stack, Delivers); the odometer counters
(52 / 16 / 4+); two CTAs.

**Content fix:** `index.html:117` currently reads
`<dd>Premiere Pro · After Effects · DaVinci</dd>`. The client does not use DaVinci.
Change to **`Premiere Pro · After Effects · CapCut`**. Then grep the whole repo for
`DaVinci` / `Davinci` / `davinci` and remove every remaining mention, including
`build-data.py`, `js/data.js`'s regenerated `SKILLS` copy, and `README.md`.

### 6.2 `02 · Selected Works` — the reel and the chapters

The client's complaints, each with its fix:

| Complaint | Fix |
|---|---|
| "The Work section looks a bit odd" | Rebuild as full-bleed chapters, not a tile grid |
| "Brand Films requires clicking and many things are loading" | **Delete the `Panel` modal entirely.** Nothing is behind a click |
| "'View All Ten Edits' — a normal person won't see that, they'll only see the repeating items" | Remove that button. The 9 near-identical Conroy verticals become one designed **fanned deck** |
| "The main video loop should be high quality" | See the quality fix below — it is a real bug |

**6.2.1 Lead reel.** Full-bleed, edge to edge, `100svh` tall. Autoplays muted, loops forever,
mounted on scroll-in, torn down on scroll-out. Over it: `--t-huge` title bottom-left in two
lines with the type interleaving z-index with the video frame (§3.3.5), a mono spec strip
(`16:9 · 0:22 · 1280×720`), and a `LOOPING` flag. Click anywhere → upgrades in place to a
full player with sound (mode swap, §7.2). Make that affordance **visible** — a labelled
`◀))  TAP FOR SOUND` pill, not just a cursor label.

**Video quality — root-cause fix.** The current build does
`transform: translate3d(0,…,0) scale(1.045)` on `.reel__inner` (`Works.frame()`,
`js/app.js:~470`). Upscaling a 1280-wide iframe by 4.5% is why the client says the loop looks
soft. Fix:

- **Never CSS-scale the iframe.** Parallax the *container's* mask/overflow window instead:
  give `.reel` `overflow:hidden` and translate an oversized *inner wrapper* that contains a
  correctly-sized iframe, so the iframe itself always renders at `scale(1)`.
- Size the iframe to the **device pixel width** — set `width`/`height` attributes from
  `Math.round(rect.width * devicePixelRatio)`, capped at 1920.
- Request the high-quality stream: append `&quality=1080p` to the embed URL.
- Never let the poster `<img>` upscale past its intrinsic 1280 either — `object-fit:cover`
  with `max-width` guard.

**6.2.2 Five layered chapters.** After the lead reel, five full-bleed `100svh` chapters, one
per hero film, chosen one from each `kicker` group so the range is obvious:
`Client work · Craft · Rhythm · Long form · Study`.

Each chapter (this is the client's *"do layers aa rahi hai, teen layers se mere videos dikh
raha hai"* — two or three layers with the video showing through):

```
layer 3 (front)  mono label ✦ + chapter number + a --kraft hairline        parallax 0.9
layer 2 (mid)    the video, inside an SVG-masked window that WIDENS on scroll progress
                 (clip-path: inset(N% …) scrubbed 18% → 0%)                parallax 0.55
layer 1 (back)   --t-huge two-line title, --cream at 14% opacity, oversized
                 and bleeding, counter-translating against the video        parallax 0.2
layer 0          ambient --tone glow sampled from this film (§7.4)          static
```

The mask widening means the video **grows into view through a slot** rather than fading in.
Adjacent chapters alternate direction — chapter 1's slot opens left-to-right, chapter 2's
right-to-left — so consecutive chapters never feel like a repeat.

**6.2.3 Horizontal rail** (§3.3.3). Below the chapters, one sticky `100svh` viewport holding a
row of ~14 mixed-aspect tiles that translate on X across ~300vh of vertical scroll. Centre
tile at full opacity, flanks at `.45`. **Desktop only.** On mobile this becomes a native
`scroll-snap` carousel (§9).

**6.2.4 The Conroy fanned deck.** `SECTIONS[0]` is 1 horizontal + 9 near-identical verticals.
Present them as **one tile**: a stack of 9 cards, each rotated `(i - 4) * 2.2deg` and offset,
showing only posters. On scroll into view (or tap on mobile) the deck **fans out** into an arc
— `transform: rotate() translate3d()` per card, 60 ms stagger. Label it
`CONROY CAMPAIGN — 1 FILM + 9 CUTS`. One shoot, one grade, ten deliverables: the repetition
becomes the point instead of looking like a loading bug. Only the top card ever mounts video.

### 6.3 `03 · Gallery` — replaces every discipline page

The client: *"Remove the specific sections like 'Brand Films', 'Event Edits', 'Concert
Edits', and replace them with a gallery-style page."*

**Delete `Panel` completely** — the object, its markup (`#panel` and its whole subtree in
`index.html:387–403`), its CSS block, and every `data-open` handler. No modal, no
prev/next-discipline nav, no scroll lock, no `Video.stopAll()`/`Video.refresh()` dance around
it. That removes roughly 120 lines of JS and an entire class of bugs.

Replace with one gallery:

- **All 52 unique uploads in a single masonry grid**, mixed aspect ratios, `column-count` or
  CSS grid with `grid-auto-rows` spans. Nothing is unreachable and nothing needs a click.
- **The 16 discipline titles never appear as section headings.** They appear only as a small
  `--kraft` caption on each tile.
- **Five filter chips** built from the 5 `kicker` values + `All`:
  `All · Client work · Craft · Rhythm · Long form · Study`. Filtering animates in place —
  hidden tiles `opacity:0; transform:scale(.96)`, survivors translate to their new slots.
  **Transform and opacity only**; measure with `getBoundingClientRect()` once before and once
  after, then animate the delta. Never animate grid properties.
- Filters are real `<button>`s with `aria-pressed`, keyboard operable, and the active one is
  a filled `--terracotta` chip.
- Tiles: poster-first, mono caption (title · discipline · aspect · duration), lazy video mount
  on scroll-in (§7). Tap/click upgrades that one tile to sound.
- `content-visibility:auto` + `contain-intrinsic-size` on every tile.
- Section header uses the moving-band treatment lightly: the word `GALLERY` at `--t-mega`
  crossed by a `--wine` sheet.

### 6.4 `04 · Toolkit` — the moving highlight band

Straight replication of §3.3.1, which is the reference's best moment.

- The 15 `SKILLS` as a vertical list of `--t-huge` display words, `--cream`, tight leading.
- One `position:sticky` full-bleed **`--terracotta` band**, one row tall, that travels down
  the list as you scroll.
- The word inside the band inverts to `--on-terracotta`. Implement by rendering **each row
  twice** — once `--cream`, once `--on-terracotta` — and revealing the dark copy through a
  `clip-path: inset()` tied to the band's position. No `mix-blend-mode` (unreliable on
  Android WebView, and it forces an expensive stacking context).
- The active row's `desc` paragraph fades in at the band's right edge, `--on-terracotta`, one
  line of `--t-body`.
- Rows below the active one fade progressively (§3.3.2): `opacity: max(.12, 1 - dist * .28)`,
  written once per row per scroll frame from the single rAF loop.
- Keep the existing sticky `.skills__head` on the left with the label, title and the
  `Disciplines listed / Core` `<dl>`. **Remove `DaVinci` from the `Core` value.**

### 6.5 `05 · Services` — sheet stack

The six `SERVICES` as six stacked "sheets" (§3.3.6): each is `position:sticky; top:var(--hdr-h)`,
and as the next one slides up over it the one beneath scales to `.97` and its content fades to
`.5`. Alternating `--ground-2` / `--ground-3` fills, with **one** sheet in `--indigo` — the
page's single use of that colour. Sheet contents: index number, name at `--t-big`, `desc`,
and a `--kraft` arrow.

### 6.6 `06 · Contact` — simplified form

The client: *"remove the specific fields like 'Brief', 'Tell me about the project', 'Your
Name', 'Your Company', 'Select One', and 'Fees'. Simplify the form."*

**Final field list — exactly three:**

| Field | Type | Notes |
|---|---|---|
| Name | `text` | `required`, `maxlength=80`, floating label, **no placeholder** |
| Email | `email` | `required`, `maxlength=120`, floating label, no placeholder |
| Message | `textarea` | `required`, `maxlength=1200`, `rows=4`, floating label, no placeholder |

**Removed entirely:** the `Project type` select, the `Budget` select, both `Select one` /
`Select a range` options, the "Brief" card heading, the "Tell me about the project"
subheading, and every `Your name` / `you@company.com` placeholder string. Labels float; they
do not double as placeholder text.

**Kept:** the `_gotcha` honeypot, `novalidate` + per-field `.field__err` carrying
`el.validationMessage`, `.is-bad` styling, `aria-live="polite"` `#formStatus`, the
`fetch()` POST to `FORM_ENDPOINT` with the `mailto:` compose fallback when the endpoint is
blank.

**Layout rule carried forward from v2 — do not break it:** `.cta` is a two-column `.pair`
and the `<form>` is **one grid child**. No breakpoint may divide the form internally. Below
`62rem` the whole pair stacks and the card travels as a single block.

Above the form, the reference's closing headline (§3.3), rebuilt for Neel:

> `Let's cut` *(Ephesis script)* **`SOMETHING`** `worth` **`WATCHING`** *(Fraunces mega)*

Beside it, big quick-contact rows — `neelpatel00235@gmail.com`, `+91 91067 30866`,
`@neelvt` — each a large tappable row with a `↗`, plus the rotating
`OPEN TO WORK · CONTACT ME ·` circular badge (§3.3.8).

### 6.7 `07 · Thank You`

Full-bleed `--terracotta` sheet sliding up, carrying `NEEL PATEL` at `--t-mega` in
`--on-terracotta`, with the **mirrored second copy** split by a dark band (§3.3.9). Below:
the thank-you paragraph, `Back to the top`, and the existing footer with `#year`.

---

## 7 · VIDEO SYSTEM

Keep the v2 `Video` module's architecture — it is correct — and extend it.

### 7.1 Non-negotiables

1. **Zero `<iframe>` in the initial HTML. Zero `player.vimeo.com` requests at first paint.**
   Every iframe is JS-injected after its IntersectionObserver fires.
2. Every video host renders **poster-first** from `assets/thumbs/<id>.webp`, with explicit
   `width`/`height` so CLS stays at 0, and an aspect-ratio spacer
   (`::before { padding-top: calc(100% / var(--ar)) }`).
3. One observer for all videos: `threshold:[0,.35]`, `rootMargin:'200px 0px'` desktop /
   `'120px 0px'` mobile.
4. **The lead reel is the only `data-video-auto` element that may mount above the fold.**
5. Every unmount is real: `iframe.src='about:blank'; iframe.remove(); delete el.dataset.liveMode`.
6. `MAX_LIVE = 2` desktop, **`MAX_LIVE = 1` mobile** (`matchMedia('(max-width:52rem)')`), LRU
   eviction.
7. `prefers-reduced-motion: reduce` → **no autoplay at all.** Poster plus an explicit play
   button everywhere, including the lead reel.
8. `navigator.connection.saveData === true`, or `effectiveType` matching `/2g|3g/` → same as
   reduced motion: posters only, tap to play. Show a small `DATA SAVER` note so it does not
   look broken.

### 7.2 Embed parameter sets

```js
// silent background loop — chromeless
'background=1&autoplay=1&loop=1&muted=1&playsinline=1&autopause=0&dnt=1&quality=1080p'

// full player with sound — click/tap upgrade
'autoplay=1&loop=0&title=0&byline=0&portrait=0&badge=0&playsinline=1&autopause=1&dnt=1&quality=1080p'
```

Mode swap on click must tear down the loop iframe and mount the sound iframe in the same host,
and `stopAll()` every other live video first.

### 7.3 iOS / low-power reality

Low Power Mode blocks `autoplay` even when muted. Detect the failure — if the iframe has not
reported playback within 1200 ms of mount, restore the poster and reveal the play button.
Never leave a black rectangle.

### 7.4 Ambient tone — "match the colour of the reel playing"

This is the client's explicit request and the reference's best trick (§3.3.4).

1. In `build-assets.py` — **Pillow is already imported** — compute a dominant colour per
   poster. Resize to 64×64, quantize to 5 colours, discard any with saturation < 0.12 or
   luminance outside `[0.08, 0.85]`, take the most frequent survivor. Emit it into
   `assets/manifest.json` as `tone`.
2. `build-data.py` carries `tone` through to each work object in `js/data.js`.
3. Each video host sets `--tone` from its own value. A soft radial glow sits behind it at
   **≤ 12% opacity** — light, never UI colour.
4. The **page-level** `--tone` follows the currently most-visible video, crossfading over
   `1.2s` with `--e-soft`. Write it to `document.documentElement.style` from the single rAF
   loop, and **only when the value actually changes** — a redundant custom-property write
   invalidates style for the whole subtree.
5. Clamp every tone toward the palette: blend 65% tone + 35% `--ground` before use, so a
   neon source can never drag the page back to cyberpunk.

---

## 8 · MOBILE — treated as the primary target, not an afterthought

The client asked for mobile optimisation three separate times. Test every acceptance item at
**360×640, 375×812, 390×844, 414×896** and **768×1024**.

### 8.1 Breakpoints

```
≤ 34rem   small phone
≤ 48rem   phone
≤ 64rem   tablet / small laptop
> 64rem   desktop
```

### 8.2 Viewport and layout

- `100dvh` / `100svh` everywhere. **Never `100vh`** — it breaks with the mobile URL bar.
- `viewport-fit=cover` is already set; honour it with `env(safe-area-inset-*)` padding on the
  fixed chrome, the bottom-right button and the footer.
- No horizontal overflow at any width. `overflow-x:hidden` on `html, body` **plus** fixing the
  actual overflowing element — the guard is a backstop, not the fix.
- Big type must not overflow: `--t-mega` floor is `3.4rem`, plus `overflow-wrap:anywhere` and
  `text-wrap:balance` on headings.
- Tap targets ≥ 44×44 CSS px with ≥ 8px separation.
- No `position:fixed` element may overlap a form field when the soft keyboard opens. Give
  every field `scroll-margin-top: calc(var(--hdr-h) + 1rem)`.

### 8.3 Interaction translation (desktop effect → mobile equivalent)

| Desktop | Mobile |
|---|---|
| Custom cursor + magnetic buttons | **Off entirely** (`pointer:fine` gate) — plus `:active` press states on everything tappable |
| Horizontal scroll-driven rail (§6.2.3) | Native `scroll-snap-type:x mandatory` carousel, `overscroll-behavior-x:contain`, visible dot indicators. **No scroll hijacking, ever** |
| 3-layer parallax hero | 2 layers, factors compressed to `0.15 / 0.55` |
| `translate3d(±14vw,0,0)` slide-ins | `±7vw`, duration `.6s`, stagger `45ms` |
| Chapter mask-widening | Keep — it is `clip-path` on one composited element, cheap |
| Scroll-velocity skew | **Off** |
| Fanned Conroy deck on scroll | Fans on **tap**, with a visible `TAP TO FAN` hint |
| Sheet stack (§6.5) | Keep, but scale delta `.97 → .99` so it does not read as jitter |
| Moving highlight band (§6.4) | Keep — it is the signature effect. Band is one row tall; description moves *below* the word instead of beside it |
| Hover-reveal captions | Always visible |
| `MAX_LIVE = 2` | `MAX_LIVE = 1` |
| Grain + satin + grid | Grain `.012`, satin off, grid kept |

### 8.4 Mobile performance rules

- Ship one image per breakpoint: `srcset` for the portrait at 480 / 720 / 1080 with `sizes`.
- No effect may add a second rAF loop. Everything reads from the one loop.
- Cap concurrent promoted layers at **8** on mobile.
- Passive listeners on every scroll and touch handler (`{passive:true}`).
- No `backdrop-filter` anywhere — it is the single most reliable way to drop frames on
  mid-range Android.
- Read layout once per frame at the top of the rAF tick; never interleave reads and writes.

---

## 9 · PERFORMANCE BUDGET

| Metric | Target | How to verify |
|---|---|---|
| `player.vimeo.com` requests at first paint | **0** | `preview_network` on a cold load |
| `<iframe>` count at `scrollY 0` | **0** | `document.querySelectorAll('iframe').length` |
| Requests before first scroll | **≤ 4** | network panel |
| Initial transfer, excluding fonts | **≤ 300 KB** | network panel |
| New font payload | **≤ 135 KB** | file sizes |
| LCP, 4G, mid-range Android | **< 1.8 s** | Lighthouse mobile |
| CLS | **exactly 0** | Lighthouse |
| INP | **< 200 ms** | Lighthouse |
| Live iframes at any scroll position | **≤ `MAX_LIVE`** | scroll sweep in 400px steps, assert the max |
| Iframes after scrolling past all video | **0** | scroll sweep tail |
| Console errors at every breakpoint | **0** | `preview_console_logs level=error` |

Techniques: `content-visibility:auto` + `contain-intrinsic-size` on gallery tiles and long
lists; explicit `width`/`height` on every image; `loading="lazy"` below the fold;
`fetchpriority="high"` on the collage portrait; `preconnect` to `player.vimeo.com` and
`i.vimeocdn.com` (already present — keep); one rAF loop; one IntersectionObserver per concern,
never one per element.

---

## 10 · ACCESSIBILITY

- Every text/background pair ≥ **4.5:1**. The §4.1 table is pre-verified — respect the
  fills-only markings.
- `prefers-reduced-motion: reduce`: no autoplay, no curtain, no parallax, no marquee, no
  rotating badges, no skew; all `[data-anim]` elements visible at rest; reveals become instant.
- Visible `:focus-visible` ring in `--kraft`, 2px, offset 3px, on every interactive element.
- Gallery filters: real `<button>`s, `aria-pressed`, arrow-key navigable.
- The video "tap for sound" affordance is a real `<button>` with an accessible name, not a
  bare `div` with a cursor label.
- Form: `<label for>` on all three fields, `aria-live="polite"` status, errors programmatically
  associated via `aria-describedby`.
- Decorative layers (grain, vignette, grid, satin, collage SVG) all `aria-hidden="true"` and
  `pointer-events:none`.
- The page must remain fully readable and navigable with JavaScript disabled: correct static
  numbering in the HTML, posters visible, form degrading to a normal `POST`.

---

## 11 · CONTENT EDITS

1. **DaVinci — remove every mention.** `index.html:117` `Primary stack` →
   `Premiere Pro · After Effects · CapCut`. Then grep `-i davinci` across the repo and fix
   `build-data.py`, the regenerated `js/data.js`, the Toolkit `Core` value, and `README.md`.
   Zero occurrences must remain.
2. The 16 discipline titles — `Brand Films`, `Event Edits`, `Concert Edits`, and the other 13 —
   **must not appear as section headings anywhere.** They survive only as small `--kraft`
   captions on gallery tiles.
3. Delete the string `View all N edits` and its button.
4. Delete `Brief`, `Tell me about the project`, `Your name`, `you@company.com`, `Select one`,
   `Select a range`, and every budget/fees string.
5. Rewrite the stale `README.md` sections: "How the works section works" (still describes a
   16 × 100svh sticky stage with a rAF-mapped slide index — long gone) and "Only one Vimeo
   iframe exists at a time" (it is now `MAX_LIVE`, page-wide). Document the new architecture:
   curtain, collage hero, chapters, gallery, moving band, `Video`, `--tone`.
6. `build-assets.py`: add a comment that the per-section hex is now a `--tone` ambient value
   only, never the page accent, and document the new `tone` field.

---

## 12 · KNOWN BUGS TO FIX

Each of these is real in the current build. Fix all of them.

1. `index.html:117` names DaVinci, which the client does not use.
2. `.reel__inner` is CSS-upscaled `scale(1.045)` in `Works.frame()`, visibly softening the
   lead film. See §6.2.1 for the correct approach.
3. `html { scroll-behavior: smooth }` fights every programmatic scroll — a `scrollTo` reads
   back mid-flight. Set `scroll-behavior:auto` globally and opt into smooth only on the
   specific anchor handlers.
4. The `Panel` modal can leave `body.is-locked` set if two opens race, freezing scroll. Moot
   once the modal is deleted (§6.3) — verify the class and the lock helper are gone.
5. `100vh` used where `100dvh`/`100svh` is required.
6. Custom cursor and hover-only affordances are reachable on touch devices without a
   `pointer:fine` gate, producing dead UI.
7. `content-visibility:auto` without a matching `contain-intrinsic-size` causes scroll-anchor
   jumps as tiles enter.
8. `background=1` embeds expose no way to get sound; the intent is implied only by a cursor
   label, which is invisible on touch. Needs a real button (§6.2.1).
9. iOS Low Power Mode silently blocks muted autoplay, leaving a black box (§7.3).
10. Any `position:sticky` element inside an `overflow:hidden` ancestor silently stops sticking
    — audit after adding the sheet stack and the moving band.
11. `will-change` left permanently on many elements creates dozens of GPU layers. The
    `transitionend` cleanup in `reveal()` must cover every new animated element too.
12. `readableInk()` used a naive luminance threshold that picked the *lower*-contrast ink for
    midtones like `#FE3448`. It now compares both real WCAG ratios — keep that behaviour if
    any chip colour survives.

---

## 13 · DATA PIPELINE

`build-assets.py` → `assets/thumbs/*.webp` + `assets/manifest.json` → `build-data.py` →
`js/data.js`.

- **`js/data.js` is generated. Never hand-edit it.** Change the Python and re-run.
- New in `build-assets.py`: the `tone` dominant-colour extraction (§7.4) and the
  `neel-collage.webp` desaturate/warm-tint pass (§6.1). Pillow is already a dependency.
- Curation lists (which film leads which chapter, which 14 tiles are on the rail) live as
  `const` arrays at the top of `js/app.js`, resolved by slug against `D.SECTIONS`, with a
  fallback to the first N so a data change can never blank a section.

Run order:

```bash
python build-assets.py && python build-data.py
```

---

## 14 · EXPLICIT DO-NOTS

- No framework, no bundler, no npm dependency, no CDN script, no Google Fonts `<link>`.
- No GSAP, Lenis, Locomotive, Barba, Three.js. Everything with `IntersectionObserver`,
  one rAF loop, and CSS transitions.
- **No scroll hijacking.** Never intercept `wheel` or `touchmove` to drive scrolling. Sticky
  sections plus scroll-progress reads only.
- No smooth-scroll library. Native scrolling stays native — it is what makes the page feel
  fast on a phone.
- No modal, no lightbox, no "click to reveal" for portfolio content.
- No `filter`, `backdrop-filter`, `box-shadow` or `background-position` in any transition.
- No second rAF loop, no `setInterval` animation, no scroll listener that writes layout.
- No neon. No `#66FFDE`, no cyan, no saturated green in any chrome.
- Do not hardcode section numbers — they derive from DOM order.
- Do not hand-edit `js/data.js`.
- Do not let any single section exceed **400vh** of scroll. The old build spent 1600vh on
  Works alone; the whole page should land around 12–16 screens.

---

## 15 · BUILD ORDER

1. Palette tokens + font loading + texture stack. Verify contrast before writing components.
2. `index.html` skeleton: 7 sections, new `#gallery`, delete the `#panel` subtree, retarget
   anchors.
3. `buildNav()` renumbering — confirm 01–07 with `#gallery` inserted.
4. Motion primitives: `[data-anim]`, `.pair`, `[data-split]`, the scroll-progress source.
5. `Video` module extensions: mobile `MAX_LIVE`, quality params, sound upgrade button,
   iOS fallback, save-data path.
6. Python: `tone` extraction, collage image pass. Re-run both scripts.
7. Section 01 collage hero.
8. Section 02 lead reel + chapters + rail + Conroy deck.
9. Section 03 gallery + filters. Delete `Panel` and every trace of it.
10. Section 04 moving highlight band.
11. Sections 05, 06, 07.
12. Chrome: fixed nav, social rail, ↗ button, progress rail, rotating badges.
13. Curtain.
14. Mobile pass at all five viewports.
15. Reduced-motion pass, save-data pass, no-JS pass.
16. Performance pass against §9, then run the §16 checklist.

---

## 16 · ACCEPTANCE CHECKLIST

Drive the running page (`npx --yes serve -l 5173 .`) and verify each item. Report each as
pass/fail with the evidence — a measured value, not an assertion.

**Structure and content**
1. Menu reads `01 About Me → 07 Thank You` and matches DOM order; every `.sect__label` number
   agrees with its menu entry.
2. `grep -ri davinci .` returns **zero** matches.
3. No discipline title (`Brand Films`, `Event Edits`, `Concert Edits`, …) appears as a section
   heading. `document.querySelectorAll('h2,h3')` text contains none of them.
4. `#panel` does not exist. `window.Panel` is undefined. No `data-open` attribute remains.
5. All **52** unique uploads are present in `#gallery` and reachable by scrolling alone, with
   **zero clicks**.
6. The contact form contains exactly **3** visible fields plus the honeypot. No select
   elements. The strings `Brief`, `Select one`, `Budget`, `Your name` appear nowhere.
7. `.cta__card` is one grid child at 375, 768 and 1280 — never divided internally.

**Video**
8. Cold load at `scrollY 0`: `0` iframes, `0` `player.vimeo.com` requests, `≤ 4` total
   requests.
9. Lead reel `iframe.src` contains `background=1`, `loop=1`, `muted=1`, `playsinline=1`,
   `quality=1080p`.
10. The lead reel's iframe has **no** CSS scale applied — computed `transform` on the iframe
    and its direct wrapper contains no `scale()` above 1.
11. Scroll sweep 0 → document height in 400px steps: iframe count never exceeds `MAX_LIVE`
    (2 desktop / 1 mobile), and returns to `0` past the last video.
12. Tapping the lead reel swaps to a sound player and stops every other video.
13. Emulate `prefers-reduced-motion`: `0` iframes auto-mount anywhere, and every `[data-anim]`
    element is visible at rest.

**Motion**
14. A `.pair`'s two children, sampled pre-reveal, show **mirrored** transforms and **equal**
    `transition-delay`.
15. `getComputedStyle` on every animated element: no transition property list includes
    anything other than `transform` and `opacity`.
16. After all reveals complete, `will-change` is `auto` on every previously-animated element.
17. The toolkit band inverts the word it crosses, and the inverted copy is a clipped second
    render — not `mix-blend-mode`.
18. Page-level `--tone` changes as you scroll between chapters, and every tone is blended
    toward `--ground` (no fully-saturated value ever reaches the DOM).

**Colour and type**
19. Computed `--terracotta` `#c4633c`, `--kraft` `#c9a06a`, body background `rgb(23,20,15)`.
20. `#66FFDE`, `#FE3448`, and every raw discipline hex appear **nowhere** as a text colour,
    border colour, or opaque background. Grep computed styles across the page.
21. Fraunces is loaded with `WONK 1` on the display elements; verify via
    `getComputedStyle(el).fontVariationSettings`.
22. `--indigo` appears on exactly **one** element.

**Mobile**
23. At 360, 375, 390, 414 and 768: `document.documentElement.scrollWidth <=
    window.innerWidth` — no horizontal overflow.
24. No fixed element overlaps a focused form field at 375×812.
25. The horizontal rail is a native `scroll-snap` carousel at ≤ 48rem, and no `wheel` or
    `touchmove` listener calls `preventDefault`.
26. Every tappable element's bounding box is ≥ 44×44.
27. `MAX_LIVE` resolves to `1` at ≤ 52rem.

**Health**
28. `preview_console_logs level=error` is empty at 375, 768 and 1280.
29. Lighthouse mobile: LCP < 1.8s, CLS = 0, no failed a11y audit.
30. With JavaScript disabled, all seven sections are readable, numbered, and the form submits.

---

## 17 · ASSUMPTIONS (implement the default, then flag it)

1. **Colour code.** The client said a colour code would be attached; only the photograph
   arrived. The §4.1 palette is derived from that photograph (burgundy shirt → `--wine`, kraft
   mural → `--kraft`, warm cream wall → `--cream`) and structured like the reference. **If a
   hex is supplied later, substitute it for `--terracotta` and re-verify every contrast pair
   in §4.1 before shipping.**
2. **Section order** stays `About → Works → Gallery → Toolkit → Services → Contact → Thank
   You`, per the previously approved brief, with `#gallery` newly inserted at position 03.
3. **"Elements that move when you log in"** is read as *on page load / on first scroll* —
   there is no authentication anywhere in this project and none is being added.
4. **Fraunces** is the display face. It is the closest Google Fonts match to the reference's
   wonky high-contrast art-nouveau serif, and its `WONK` axis reproduces the teardrop
   terminals specifically. If it is rejected, the fallbacks in priority order are
   **Yeseva One**, then **Bodoni Moda**, then **Playfair Display**.
5. **Ephesis** carries the cursive/script requirement, limited to one or two words per
   section so it stays legible.
6. **`Name` is kept** in the contact form. The client listed "Your Name" among the strings to
   remove; that is read as removing the *placeholder text* and the verbose framing, not the
   field — a contact form without a name field is not usable. The field remains, with a
   floating label and no placeholder.
7. **The 16 discipline groupings are not deleted from the data**, only from the UI. They
   remain in `data.js` as tile captions and are collapsed into the 5 `kicker` filters. Nothing
   in the portfolio becomes unreachable.
8. The reference site could not be scraped (it is client-rendered; a fetch returns only the
   document title). §3 is derived from the supplied screenshots, which show the palette,
   typography, chrome and eight distinct interaction states directly.
