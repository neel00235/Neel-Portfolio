# PROMPT — FIX THE HYDRATION CRASH, THEN BUILD THE MOTION LAYER THAT WAS NEVER BUILT

> **Paste this whole file to the coding agent.** It supersedes nothing in `ABSOLUTE-CINEMA-BLUEPRINT.md` — it is the corrective pass. The blueprint's Parts III–VII and IX were implemented. **Parts X, XI and XII were almost entirely skipped.** That is why the site feels dead. This document proves it with line numbers, then specifies the fix.
>
> **Working directory:** `D:\CLAUDE\neel-portfolio`
> **Stack already installed and working:** Next 15.1.6 · React 19 · GSAP 3.12.5 · Lenis 1.1.18 · ogl 1.0.11 · zustand 5 · Tailwind 3.4.17 · lucide-react · sharp
> **Do not re-scaffold. Do not re-install. Do not rewrite the data layer.** Everything below is additive or surgical.

---

## SECTION 0 — WHAT IS ACTUALLY WRONG (measured, not guessed)

I audited every file in `src/`. Here is the evidence. Read this before writing a line of code, because the diagnosis changes what you build.

### 0.1 The headline number

**`grep -rn "scrollTrigger:\|ScrollTrigger.create" src` returns ZERO results.**

`ScrollTrigger` is imported and registered at [SmoothScroller.tsx:6-8](src/components/scroller/SmoothScroller.tsx#L6) and bridged to Lenis at line 33. Then **it is never used to create a single animation.** Not one.

There are also **zero** GSAP timelines, **zero** `.from()`, **zero** `.fromTo()` calls in the entire `src/` tree. GSAP appears in exactly three files, and in two of them it only moves the cursor.

**This is the whole problem.** The site has a smooth-scroll engine wired to an animation engine that was never given anything to animate. Everything scrolls prettily and nothing happens.

### 0.2 Total animation inventory of the shipped site

| What animates | Where | Count |
|---|---|---|
| `animate-pulseDot` (a dot blinking) | Hero, Header, Curtain | 3 |
| `animate-marquee` (skills band) | Toolkit | 1 |
| `animate-rgbSplit` (curtain glitch) | Curtain | 1 |
| CSS `hover:scale-105` on posters | VideoFrame | 1 pattern |
| Cursor follow + magnetic pull | MagneticCursor, Magnetic | 2 |
| **Scroll-triggered animations** | — | **0** |
| **Text reveals** | — | **0** |
| **Parallax** | — | **0** |
| **Pinned sections** | — | **0** |
| **Filter transitions (FLIP)** | — | **0** |
| **Page/route transitions** | — | **0 (broken, see 0.4)** |
| **Playing video anywhere** | — | **0 (see 0.5)** |

Three keyframes are declared in `tailwind.config.ts` and **never used at all**: `spinSlow`, `grain`, `scanline`.

### 0.3 Components the blueprint specified that do not exist

`find src/components` returns 15 files. These were specified and are **absent**:

`Reveal` · `SplitText` · `Preloader` · `ChapterStack` · `TimelineRail` · `ConroyDeck` · `HoverPreview` · `OverlayMenu` · `HighlightBand` · `ServiceSheets` (pinned) · `EndCard` · `About` (deep-dive section) · `LeadReel`

`Hero.tsx:24` carries the comment `{/* 3-Plane Parallax Hero Stack */}` above a **static two-column grid with no parallax code of any kind.** There is no giant background wordmark, no WebGL behind it, no scroll link. The comment describes a thing that was never written.

### 0.4 Concrete defects found

| # | Defect | Evidence |
|---|---|---|
| **D-1** | **Hydration crash** (the error you pasted) | `layout.tsx:67` — see Section 1 |
| **D-2** | Route transition animation references an **undefined keyframe**. `animate-[fadeIn_...]` — but `fadeIn` is not in the Tailwind `keyframes` block. Silently does nothing. | [template.tsx:7](src/app/template.tsx#L7) vs [tailwind.config.ts:50-57](tailwind.config.ts#L50) |
| **D-3** | Curtain is driven by **React `setState` on every wheel event** — a full React re-render per wheel tick, with inline `style={{transform}}`. The blueprint specified a one-shot GSAP timeline precisely to avoid this. | [Curtain.tsx:25-35, 73-75, 87](src/components/curtain/Curtain.tsx#L25) |
| **D-4** | Curtain is `pointer-events: none` on its root, so it **cannot be dismissed by click or keyboard** — wheel/touch only. Keyboard users are trapped. | [Curtain.tsx:79](src/components/curtain/Curtain.tsx#L79) |
| **D-5** | `playSound()` is called in three places but **`public/audio/` is empty (0 files)**. Every call silently fails. | `Curtain.tsx:30,52`, `Contact.tsx:35` |
| **D-6** | **`public/previews/` is empty (0 files).** The hover-preview pipeline was never run. | `ls public/previews` |
| **D-7** | **No video file exists anywhere in `public/`.** No hero loop. The hero is a still image. | `find public -name "*.mp4" -o -name "*.webm"` → nothing |
| **D-8** | `VideoFrame` contains **no `<video>` element**. All 52 works are static posters with a CSS hover scale. | [VideoFrame.tsx](src/components/video/VideoFrame.tsx) — no `<video` token in file |
| **D-9** | `body { min-height: 100vh }` — a `100vh` violation. Blueprint Law 4 forbade `100vh` outright. | [globals.css:46](src/app/globals.css#L46) |
| **D-10** | `.film-grain` is a **static dot-grid gradient**, not grain, and not animated. The `grain` keyframe exists and is unused. | [globals.css:84-87](src/app/globals.css#L84) |
| **D-11** | **No `prefers-reduced-motion` block in `globals.css` at all.** No `sr-only`. No `:focus-visible` styles. | `globals.css` (96 lines total) |
| **D-12** | `readableInk()` uses a **luminance threshold at 0.45**. The blueprint mandated comparing both real contrast ratios, because with 52 tones spanning `#010501`→`#dfd3d1` a threshold picks wrong in the middle of the range. | [useTone.ts:19-20](src/store/useTone.ts#L19) |
| **D-13** | Lenis instance is **not exposed** — no context, no ref out. So nothing can call `lenis.stop()` (scroll lock) or `lenis.scrollTo()` (back-to-top, anchor nav). | [SmoothScroller.tsx:12-50](src/components/scroller/SmoothScroller.tsx#L12) |
| **D-14** | Hero `<section id="about">` — the hero is not the About section. Anchor nav and scroll-spy will both target the wrong element. | [Hero.tsx:13](src/components/sections/Hero.tsx#L13) |
| **D-15** | `--tone-ink` is consumed but **not `@property`-registered**, so it cannot interpolate. Only `--tone` and `--tone-blend` are registered. | [globals.css:5-15](src/app/globals.css#L5) |

**Total source size: 3,082 lines excluding generated data.** For reference, the motion layer alone (Parts X + XI + XII) should be roughly that size again.

---

## SECTION 1 — FIX THE HYDRATION ERROR FIRST

Nothing else can be verified while React is bailing out of hydration. Fix this before touching animation.

### 1.1 Reading the error correctly

```
<body className="relative bg-ground text-cream ...">
-  style={{}}
```

React is reporting that **`<body>` carries a `style` attribute in one tree and not the other.** Now look at the source:

```tsx
// src/app/layout.tsx:67
<body className="relative bg-ground text-cream selection:bg-terracotta ... min-h-screen">
```

**There is no `style` prop on `<body>` anywhere in this codebase.** So React's own tree cannot be producing it. Something outside React is writing to `<body>` before hydration completes. There are exactly three candidates, and you should fix all three rather than guess which one fired:

**Candidate A — a browser extension.** This is named in React's own error text and it is the most common cause of this precise signature (a top-level `<html>`/`<body>` attribute diff with no matching client value). Grammarly, Dark Reader, LastPass, 1Password, Google Translate and Loom all inject attributes into `<body>` before React loads. **You cannot fix this in code — but you can stop it breaking hydration.**

**Candidate B — render-phase DOM mutation in the tone store.** [`useTone.ts:34-53`](src/store/useTone.ts#L34) writes `document.documentElement.style.setProperty(...)` **inside the zustand action body**. A zustand action invoked during a render pass (or a `setTone` call that lands in the same commit as hydration) mutates the DOM while React is reconciling it. Wrong node in this instance, right class of bug, and it will bite later.

**Candidate C — a stale `.next` cache.** After the amount of restructuring this project has had, a stale dev build serving old HTML against a new client bundle produces exactly this.

### 1.2 The 30-second test that identifies which one

```bash
rm -rf .next && npm run dev
```

Then open the site in a **fresh incognito window with all extensions disabled**. If the error is gone → it was Candidate A. If it persists → Candidate B/C. **Run this test and report the result** before applying fixes, so we know what we actually fixed.

### 1.3 Apply all three fixes regardless

**Fix 1 — `suppressHydrationWarning` on `<html>` and `<body>`.**

```tsx
// src/app/layout.tsx
<html
  lang="en"
  suppressHydrationWarning
  className={`${fraunces.variable} ${instrumentSerif.variable} ${ephesis.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
>
  <body
    suppressHydrationWarning
    className="relative bg-ground text-cream selection:bg-terracotta selection:text-ground font-sans antialiased overflow-x-clip"
  >
```

This is **not** silencing a real bug. `suppressHydrationWarning` applies to **that element's own attributes only** — it does not propagate to children, so every genuine mismatch inside your app still reports normally. This is exactly what `next-themes` and Next's own templates do, for exactly this reason: `<html>` and `<body>` are the two nodes third parties and theme scripts touch, and no app can control them.

Also note: drop `min-h-screen` from the body className while you are in there — `globals.css:42-47` already sets `min-height` on `body`, and two owners of the same property is a Law 1 violation. Change the CSS to `min-height: 100svh` (D-9).

**Fix 2 — get every DOM write out of the store body.**

Rewrite `useTone.ts` so the store holds *state only* and a subscriber applies it in an effect:

```ts
// src/store/useTone.ts — state only, ZERO DOM access
import { create } from 'zustand';

const DEFAULT_TONE = '#f67c29';

interface ToneState {
  activeTone: string;
  setTone: (tone: string) => void;
  resetTone: () => void;
}

export const useTone = create<ToneState>((set) => ({
  activeTone: DEFAULT_TONE,
  setTone: (tone) => set({ activeTone: tone }),
  resetTone: () => set({ activeTone: DEFAULT_TONE }),
}));
```

```tsx
// src/components/system/ToneBridge.tsx — the ONLY place --tone is written
'use client';
import { useEffect } from 'react';
import { useTone, hexToRgb, readableInk } from '@/store/useTone';

export function ToneBridge() {
  const tone = useTone((s) => s.activeTone);
  useEffect(() => {
    const [r, g, b] = hexToRgb(tone);
    const root = document.documentElement;
    root.style.setProperty('--tone', tone);
    root.style.setProperty('--tone-blend', `rgb(${r} ${g} ${b} / 0.16)`);
    root.style.setProperty('--tone-ink', readableInk(tone));
  }, [tone]);
  return null;
}
```

Mount `<ToneBridge />` in `layout.tsx`. Because it writes in an effect (post-commit), it can never race hydration. Delete the `typeof document !== 'undefined'` guards — they are no longer needed, and their presence was the smell.

**Fix 3 — the sound store must have a server snapshot.**

[`useSound.ts:13-21`](src/store/useSound.ts#L13) writes `localStorage` but nothing *reads* it on boot. The moment you add that read (and you must, for IX.6 persistence), you create a fresh hydration mismatch: server renders `SOUND OFF`, client reads `true` and renders `SOUND ON`. Handle it correctly:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
  const saved = localStorage.getItem('neel_sound_enabled');
  if (saved === 'true') useSound.getState().setEnabled(true);
}, []);
// render the server-safe label until mounted
<span>{mounted && enabled ? 'SOUND ON' : 'SOUND OFF'}</span>
```

**The general law, and the reason this class of bug keeps recurring here:**

> **First client render must produce byte-identical output to the server render.** `matchMedia`, `localStorage`, `sessionStorage`, `window.innerWidth`, `navigator.*`, `Date`, `Math.random` may be read in `useEffect` and **never during render**. Every capability gate (`pointer: fine`, `prefers-reduced-motion`, `saveData`, `hardwareConcurrency`, WebGL probe) resolves in an effect and flips state afterward.

Audit these against that law and fix any render-phase reads: `ToneField.tsx:73-75`, `MagneticCursor.tsx:15-16`, `SmoothScroller.tsx:19`.

`Curtain.tsx:15` reads `sessionStorage` inside an effect, which is correct — but it produces the *adjacent* bug: the server renders the curtain, then the effect dismisses it, so a returning visitor sees a **flash of curtain** before it vanishes. Fix it in the rebuild (Section 7, #2) by rendering nothing until mounted, and by gating on `sessionStorage` before the timeline is ever built.

**Fix 4 — while you are here, fix D-2.** Add the missing keyframe so the route transition actually runs:

```ts
// tailwind.config.ts → keyframes
fadeIn:    { '0%': { opacity: '0', transform: 'translate3d(0,12px,0)' }, '100%': { opacity: '1', transform: 'none' } },
// → animation
fadeIn: 'fadeIn 420ms cubic-bezier(.16,1,.3,1) forwards',
```

Then replace the arbitrary-value class in `template.tsx` with `animate-fadeIn`.

**Gate:** `npm run dev`, open in a clean profile, and the console must be **completely clean**. Zero warnings, zero errors. Do not proceed until it is.

---

## SECTION 2 — NON-NEGOTIABLES (unchanged, restated because they still bind)

1. **CONTENT IS IMMUTABLE.** 52 works, 53 placements, 16 sections, 15 skills, 6 services, every prose block verbatim. `src/data/portfolio.generated.ts` is **generated — never hand-edit it**. No new copy, no prices, no DaVinci Resolve, no restored form fields.
2. **NO HORIZONTAL SCROLL.** `document.documentElement.scrollWidth === clientWidth` at 320/375/414/768/1024/1280/1440/1920 plus 844×390 and 1280×600. Every new layer you add gets re-checked at all ten.
3. **NO LAYOUT SHIFT.** CLS ≤ 0.02. Every media box keeps its `aspect-ratio` reservation through every state.
4. **`transform` and `opacity` only.** No animating `width`, `height`, `top`, `left`, `margin`, `padding`, `box-shadow`, `filter`, `background-position`, or `clip-path`. If you think you need one, use the substitution table in the blueprint's Law 10.
5. **Zero layout reads inside any rAF or scroll callback.** No `getBoundingClientRect()` per frame. Read once on setup, cache, invalidate on `resize` / `ScrollTrigger.refresh()`.
6. **Reduced motion is total, not partial.** One hook, one gate, applied everywhere.
7. **JS-disabled still shows every string and all 52 posters.**

---

## SECTION 3 — TASK 1: THE MOTION ENGINE (build this first, everything depends on it)

### 3.1 The easing contract — this is what "smooth" means

You asked for everything to ease in and out. That is a system-level decision, so it gets encoded once and used everywhere. **Three curves. Four durations. Nothing else on the site.**

```ts
// src/lib/motion.ts — THE single source of truth for all timing
export const EASE = {
  out:  'cubic-bezier(0.16, 1, 0.30, 1)',    // entrances — fast start, long glide (the "expo out" feel)
  io:   'cubic-bezier(0.65, 0.05, 0.36, 1)', // reversible state changes — ease in AND out
  soft: 'cubic-bezier(0.40, 0.00, 0.20, 1)', // micro-interactions
} as const;

export const DUR = {
  fast:  0.18,  // hover, chips, icon swaps
  base:  0.42,  // reveals, section entrances
  slow:  0.80,  // tone transitions, curtain, pins
  epic:  1.40,  // scrollTo, route transitions
} as const;

export const STAGGER = { sibling: 0.06, character: 0.022 } as const;

// GSAP equivalents — register once so gsap.to({ ease: 'cine.out' }) works everywhere
import { CustomEase } from 'gsap/CustomEase'; // if licensed; otherwise use the cubic strings directly
```

**Rules:**
- Entrances use `EASE.out`. Something arriving should decelerate into place, never bounce.
- Anything that can reverse (hover on/off, menu open/close, filter in/out) uses `EASE.io` — genuine ease-in-out, so the return trip feels like the trip out.
- **Nothing on the site uses `linear`** except the marquee and the rotating badge, where linear is correct because they are continuous.
- Lenis config: `lerp: 0.085`, `wheelMultiplier: 1`, `smoothWheel: true`, **`syncTouch: false`**. Do not raise `duration`; use `lerp`. `lerp: 0.085` is the "everything glides" feel you asked for. Below 0.06 it becomes seasick.

> **Why `syncTouch: false` stays false:** native touch scrolling on a phone is better than any JS approximation, and forcing smooth touch scroll is the single most reliable way to make a site feel broken on mobile. The desktop glide is where the smoothness lives.

### 3.2 `<Reveal>` — the primitive that does not exist yet

**Every entrance on the site goes through this.** Build it once, use it ~120 times.

```tsx
// src/components/motion/Reveal.tsx
'use client';
// props: variant 'up'|'down'|'left'|'right'|'scale'|'mask'|'clip'
//        delay, stagger (default STAGGER.sibling), once (default true), as
//
// Implementation requirements:
// 1. CSS-FIRST RESTING STATE. The final visible state is the default in CSS.
//    The offset state is applied ONLY under html.js-ready (set in an effect).
//    → JS failure means no animation, NEVER invisible content.
// 2. ONE shared ScrollTrigger config:
//      start: 'top 88%', toggleActions: 'play none none none',
//      once: true (default)
// 3. gsap.context() scoped to the component, reverted in cleanup.
//    Without this, route changes leave dead triggers and the site degrades as you browse.
// 4. Children stagger via STAGGER.sibling.
// 5. useReducedMotion() → render final state, no trigger created at all.
```

| Variant | From | Used on |
|---|---|---|
| `up` | `translate3d(0,44px,0)`, `opacity 0` | body copy, list items, section intros |
| `left` / `right` | `translate3d(±52px,0,0)`, `opacity 0` | the two halves of every paired layout |
| `scale` | `scale(0.94)`, `opacity 0` | media frames, cards |
| `mask` | parent `overflow:hidden`, child `translate3d(0,110%,0)` | headings, single lines |
| `clip` | `clipPath: inset(0 100% 0 0)` → `inset(0)` | hairline rules, image wipes, progress fills |

> `clip` is the **one** sanctioned `clip-path` animation, and only on non-text decorative elements. Everything else uses `transform: scaleX()` with `transform-origin: left`.

**Then apply it.** Every section. Specifically: all three Hero prose columns, the Hero spec/stat cards, every `SelectedWorks` item, every `Gallery` tile, every `Toolkit` skill row, all 6 `Services` rows, the `Contact` heading and card, the `Footer` rows. **If a block of content appears on screen without having animated in, you are not finished.**

### 3.3 `<SplitText>` — per-character and per-word reveals

```tsx
// src/components/motion/SplitText.tsx
// THREE HARD REQUIREMENTS — get any of these wrong and it is a regression:
// 1. SSR-SAFE: spans are emitted during render and present in the static HTML.
//    No post-hydration DOM rewrite, no flash of unsplit text, no hydration mismatch.
// 2. aria-label carries the UNSPLIT string; the span wrapper is aria-hidden.
//    Otherwise a screen reader reads "G, A, L, L, E, R, Y".
// 3. Space characters get `white-space: pre` or multi-word headings collapse into one word.
```

- **Per character** (22 ms stagger) — display type only: the Hero `NEEL PATEL`, the curtain wordmark, `GALLERY`, `LET'S TALK`, `THANK YOU`, `WATCHING`, and every section `<h2>`.
- **Per word** (40 ms stagger) — anything longer than three words.
- **Never per character on body prose.** It breaks text selection and animates 300 glyphs nobody is reading yet.

Mechanic: each unit sits in an `overflow: hidden` mask and travels `translate3d(0, 110%, 0) → 0` on `EASE.out`.

### 3.4 The parallax ledger — wire all of it

Every entry below is a `gsap.to(el, { y: distance, ease: 'none', scrollTrigger: { scrub: true } })`. **`scrub: true`, never a number** — a numeric scrub adds a second smoothing pass on top of Lenis and the result feels laggy, not smooth.

| Layer | Factor | Section |
|---|---|---|
| Giant background wordmark (new — see 5.1) | 0.15 | Hero |
| Portrait collage card | 0.42 | Hero |
| Editorial copy column | 0.80 | Hero |
| WebGL `uScroll` uniform | 1.00 | Hero |
| Section media | 0.88 | SelectedWorks, chapters |
| Section captions | 1.00 | all |
| Gallery banner sheet | 0.55 | Gallery |
| Grain / vignette | 0 (fixed) | global |

**Plus scroll-velocity coupling — this is the effect that makes a site feel expensive.** One `ScrollTrigger` reads `self.getVelocity()`, normalises it, and drives:
- a CSS var `--vel` (0→1) that skews gallery tiles up to `skewY(2.5deg)` and shrinks them `scaleY(0.985)` while flinging;
- the WebGL distortion amplitude;
- the cursor ring's stretch.

All three settle back to rest on `EASE.out` when velocity decays. Clamp hard: **skew never exceeds 3°**, or it reads as a rendering bug rather than momentum.

### 3.5 Pinned set pieces

Six, no more (adding a seventh is how these sites become exhausting):

1. **Curtain bisection** + the single 240 ms glitch — rebuild as a GSAP timeline (fixes D-3/D-4).
2. **Hero three-plane parallax** with the wordmark passing behind the head.
3. **Lead reel** with live ambient colour match.
4. **Horizontal gallery scroll** — `x: -(scrollWidth - innerWidth)` pinned over the track's own width. Desktop only.
5. **Toolkit marquee band inversion** — ground/ink swap as it crosses viewport centre.
6. **Services sheet stack** — six sheets pinned over `6 × 55vh`, each rising and being overlapped.

> **Pinning is disabled below `60rem` for #4 and #6.** A pinned horizontal set piece on a phone traps the user, and no amount of polish redeems it. Use `ScrollTrigger.matchMedia` / `gsap.matchMedia` so the triggers are never created on mobile rather than created-then-hidden.

### 3.6 FLIP for gallery filtering

Currently filtering toggles visibility and the grid snaps. Use `gsap` **Flip**:

```
1. const state = Flip.getState(tiles)   // read all rects once
2. mutate the DOM (apply the filter)
3. Flip.from(state, { duration: 0.6, ease: 'power2.inOut', stagger: 0.02,
                      absolute: true, onEnter: fade+scale in, onLeave: fade+scale out })
```

`absolute: true` is required or surviving tiles jump before they animate.

---

## SECTION 4 — TASK 2: MAKE THE VIDEOS AUTOPLAY ON HOVER

You asked for this explicitly, and right now **no video plays anywhere on the site** (D-6, D-7, D-8). Here is the path that works today with the assets that exist.

### 4.1 Path A — ship this now: hover-mounts a muted Vimeo background embed

No new assets required. Works immediately for all 52 works.

```
IDLE ──pointerenter (hover:hover + pointer:fine only)──▶ ARMED
ARMED ──140 ms dwell timer elapses──▶ MOUNT
ARMED ──pointerleave──▶ IDLE            (timer cleared, ZERO bytes fetched)
MOUNT  ─ inject iframe with background params ─▶ PLAYING
         cross-fade poster → iframe over 260 ms on EASE.io
PLAYING ──pointerleave──▶ TEARDOWN
TEARDOWN: iframe.src = 'about:blank'  →  iframe.remove()  →  poster back to opacity 1  →  IDLE
```

Iframe URL — the chromeless background parameter set, already proven in this project:

```
https://player.vimeo.com/video/{id}?background=1&autoplay=1&loop=1&muted=1&playsinline=1&autopause=0&dnt=1&quality=720p
```

`background=1` strips all Vimeo chrome and forces muted+looping — exactly right for a silent hover preview. Use `quality=720p` for previews (not 1080p) so it starts fast; full playback keeps `1080p`.

**Five rules, all mandatory:**

1. **The 140 ms dwell timer is not optional.** Without it, dragging the pointer across a 4-column grid fires 12 embeds in 300 ms. That is the bandwidth catastrophe, not a feature.
2. **Exactly one hover preview alive at a time, site-wide.** Enforce through `useVideoRegistry` — a second `pointerenter` tears down the first before arming the second.
3. **Teardown is removal, not pause.** `src = 'about:blank'` *then* `.remove()`. Setting src blank first is what stops some engines keeping the media session alive.
4. **The poster never unmounts.** It stays underneath at `opacity: 0`, so teardown is instant and never flashes black. *The UI must never show a blank box.*
5. **Gate it off** where hover is meaningless or expensive: `!matchMedia('(hover: hover) and (pointer: fine)')`, `saveData`, `effectiveType` 2g/3g, `prefers-reduced-motion`. On touch, tap = play with sound. Resolve every one of these in an effect (Section 1's law).

**Also add `<link rel="preconnect" href="https://player.vimeo.com">` and `href="https://i.vimeocdn.com"`** to `layout.tsx`. Costs a TLS handshake, no payload, removes ~200 ms from first play.

### 4.2 Path B — the upgrade, when masters are available

Local ffmpeg micro-clips in a **real `<video>`** element: 2.6 s, silent, seamless, ≤150 KB, VP9/WebM + H.264/MP4, `preload="none"`. Strictly better than Path A — no third-party connection, faster start, real `<source>` fallbacks. `scripts/build-previews.mjs` already exists as a stub; the exact ffmpeg commands are in the blueprint's IX.3. **Same state machine, same 140 ms dwell, same registry.** Build `HoverPreview` so the media element is swappable and Path B is a one-line change.

### 4.3 The hero must actually move

The hero is currently a still photograph. Give it motion, in priority order:

1. **Best:** a local silent 12–20 s looping cut at 1280×720, VP9 ≤1.6 MB + H.264 ≤2.2 MB, `-an` (audio stripped at the encode, not just muted), `autoPlay muted loop playsInline preload="auto"`. **This is the only `preload="auto"` on the site.** Mandatory `bg-scrim-b` over it. Pause on IntersectionObserver exit and on `visibilitychange`.
2. **If no master exists:** mount the Vimeo background embed for `1220554546` (Mumbai) after `document.fonts.ready` + hero poster `decode()`, cross-faded in over 600 ms so the LCP element is still the poster.
3. **Either way:** a `SOUND ON` control that swaps to the full player with real audio, from the same user gesture that unlocks the `AudioContext`.

---

## SECTION 5 — TASK 3: THE GRAPHICS AND ASSET LAYER

This is the "no more asset elements" complaint. The site currently has: a dot-grid overlay, a 0.04-alpha dot texture called grain, and a WebGL component. That is the entire visual apparatus. Build the following.

### 5.1 The typographic scaffold (highest impact, zero bytes)

- **Giant background wordmark.** `NEEL PATEL` at `clamp(4rem, 17vw, 15rem)`, `--kraft` at 12–14% opacity, `position: absolute`, `z-index: 1`, `aria-hidden`, parallax `0.15`. The portrait card sits at `z-index: 2`, so **the name passes behind the head as you scroll.** That single relationship is what makes the hero read as three-dimensional. It is also the site's most likely overflow source, so it needs all three of: `position: absolute` (out of flow), a local `overflow: clip` on `.hero-stage`, and verification at 320 px.
- **Vertical rotated rail labels** — `— SCROLL`, `EST. 2022`, `AHM // IND` — `writing-mode: vertical-rl`, mono, wide-tracked, fixed to section edges.
- **Oversized ghost numerals** `01`–`07` per section, `--kraft` at 8%, behind content, counting up on entry.
- **A running section counter** in the header: `02 / 07`.
- **Marquee dividers** between sections — one `translate3d(-50%)` track, duplicated, `aria-hidden` on the copy. Zero JS per frame.
- **Rotating circular badge** — `ABSOLUTE CINEMA · ABSOLUTE CINEMA ·` on a `<textPath>` around an SVG circle, `animate-spinSlow` (already declared, currently unused).

### 5.2 Real film grain — replace D-10

The current `.film-grain` is a dot grid. Real grain is procedural and costs **zero network bytes**:

```html
<svg class="fixed inset-0 w-full h-full pointer-events-none opacity-[0.06] mix-blend-overlay z-[90]"
     aria-hidden="true">
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#grain)"/>
</svg>
```

Animate it with `animate-grain` (already declared, unused — this is what it was for): a `steps(6)` transform jitter, 8 s. **Transform only**, never re-render the filter. Layer over it:

- **Vignette** — `radial-gradient` at 88% opacity edges, `z-index: 88`.
- **Chromatic edge aberration** — two 1 px `--wine`/`--indigo` inset shadows on media frames at 30% opacity. Static, not animated.
- **Halation** — a `--terracotta` radial at 6% behind bright poster areas, `mix-blend-mode: screen`.
- **Scanline sweep** — `animate-scanline` (declared, unused), fires once on the curtain only.
- **Gate/weave** — a ±0.4 px `translate3d` on the hero frame at 12 s, `steps(8)`. Subliminal; that is the point.

Every layer: `pointer-events: none`, `aria-hidden="true"`, and a place in the z-index contract. **Verify with `document.elementFromPoint` across a 24-point grid — none of them may ever be the hit target.**

### 5.3 WebGL warp effects — you asked for warp, here it is

`ToneField.tsx` exists (164 lines) and uses `ogl`. Extend it into the real thing. **Three shader effects, one plane, one draw call:**

1. **Ambient noise field** — 3D simplex noise, domain-warped, tinted by `uTone` from the active work. Slow-drifting nebula behind the hero. `uTime` at 0.15 speed.
2. **Scroll-velocity displacement (the warp)** — `uVelocity` from the ScrollTrigger of 3.4 drives a radial UV pinch/barrel distortion. Fling the page and the background **bows**; it eases back on `EASE.out`. This is the effect that reads as "expensive".
3. **RGB shift under velocity** — sample R, G, B at slightly offset UVs, offset scaled by `uVelocity`, max 3 px. Subtle chromatic smear while scrolling fast.

Optional fourth, hover-scoped: a **barrel-distortion + ripple pass on gallery posters** — a small ogl plane per hovered tile, or (cheaper and preferred) an SVG `feDisplacementMap` with an animated `scale`. Try the SVG route first; if it costs more than 2 ms/frame, drop it.

**Non-negotiable gates** — all six must pass before a single WebGL byte loads:

```
desktop  &&  pointer: fine  &&  !prefers-reduced-motion
      &&  hardwareConcurrency >= 4  &&  !saveData  &&  webgl2 probe succeeds
```

Dynamic `import()`, `{ ssr: false }`, `dpr` capped at 1.5, **14 KB gzip ceiling** on the chunk, pause on IntersectionObserver exit and `visibilitychange`. Fallback is a CSS `radial-gradient` using `--tone-blend` — which already exists and looks fine.

**Shader noise source:** use `webgl-noise` by Ian McEwan / Ashima Arts (`snoise3`) — **MIT licensed**, the standard implementation, safe to vendor into your `.glsl`. Keep its copyright header. **Do not copy Shadertoy code** — the site's default license is CC-BY-NC-SA, which is not compatible with a commercial portfolio.

### 5.4 Where to source assets — specific, and license-checked

| Need | Source | License | Verdict |
|---|---|---|---|
| Noise / grain | SVG `feTurbulence`, generated | n/a | **Use this.** Zero bytes, infinite resolution |
| Shader noise | `webgl-noise` (Ashima Arts) | **MIT** | **Use.** Keep the header |
| Icons | `lucide-react` (installed) | ISC | **Use.** Keep to ~17 icons; `optimizePackageImports` is already configured |
| Fonts | already self-hosted in `public/fonts` (10 files) | OFL | **Keep.** Preload exactly two |
| UI sound | generate with `AudioContext` oscillators | n/a | **Use.** Fixes D-5 with zero files. A 40 ms sine at 880 Hz through a gain ramp is a better UI tick than any sample |
| UI sound (alt) | `freesound.org` filtered to **CC0** | CC0 | Acceptable. ≤6 KB each, 32 kbps mono Opus, ≤4 files |
| Paper / concrete texture | `transparenttextures.com` | free commercial | OK, but prefer generated |
| Lottie | — | — | **Reject.** `lottie-web` is ~250 KB for effects GSAP+SVG already do at 0 KB |
| `three` / R3F | — | — | **Reject.** `ogl` is already installed and 15× smaller |
| Shadertoy shaders | — | CC-BY-NC-SA | **Reject.** Non-commercial clause |
| Stock video | — | — | **Reject.** This is a portfolio of his own work. Filler footage is a lie |

**The principle: generate, don't download.** Every effect above is procedural. The site's total new asset weight should be under 40 KB (four Opus one-shots), and every visual layer costs zero network bytes. That is how you get "more graphics" and Lighthouse 90 in the same build.

---

## SECTION 6 — TASK 4: THE CURSOR (finish what was started)

`MagneticCursor.tsx` is 115 lines and correctly uses `gsap.quickSetter` — good foundation, keep the approach. Extend it to the full state machine.

| State | Trigger | Appearance |
|---|---|---|
| Default | anywhere | 6 px `--cream` dot |
| Interactive | `a`, `button`, `[data-cursor]`, `input`, `label` | 64 px `--kraft` ring, `mix-blend-mode: difference`, mono label from `data-cursor` |
| **PLAY** | any playable frame or the hero | **88 px filled `--terracotta` disc** + `Play` glyph in `--on-terracotta` |
| Sound | the lead reel | 88 px filled + `Volume2` |
| Drag | horizontal gallery track | 72 px ring + `↔` |
| Text | over `<p>`, `<h*>` | 2 px dot at 50% opacity |
| Hidden | over a mounted full player | `opacity: 0`, native cursor returns so real controls are reachable |

**Requirements:**
- `lerp: 0.18` on the follow — that ~90 ms trailing lag is what reads as weight. Above 0.3 it is glued to the pointer (pointless); below 0.1 it feels broken.
- **The handler records; the ticker writes.** No `getBoundingClientRect()`, no computed-style read, ever, in the loop. `{ passive: true }` on `pointermove`.
- `mix-blend-mode: difference` on the ring so it stays visible over both near-black ground and the near-white posters (`Conroy — Reel 03` is `#dfd3d1`).
- **`cursor: none` is applied by JS only after the custom cursor confirms its first paint**, and removed in cleanup and in an error boundary. If it is in a stylesheet and the cursor throws, the user has no pointer and no way to use the site.
- `pointer-events: none`, `z-index: 100`, always.
- **Magnetic bounds are read once on `pointerenter` and cached** — not per `pointermove`. That is the difference between a magnetic effect and 60 forced layouts a second. Invalidate on `resize` and `ScrollTrigger.refresh()`. Clamp displacement to 14 px.
- **Focus parity (this is where cursor sites fail):** every `[data-cursor]` element is focusable, has a `:focus-visible` ring in `--terracotta` at `outline-offset: 3px`, and shows its label as a small tooltip on focus. The cursor may never convey information that exists nowhere else.

---

## SECTION 7 — TASK 5: THE MISSING COMPONENTS

Build these, in this order. All content comes verbatim from `src/data/` — **nothing new is written.**

| # | Component | Spec |
|---|---|---|
| 1 | `Preloader` | Countdown leader. `000`→`100` on **real** signals: `0.45 × document.fonts.ready + 0.45 × heroPoster.decode() + 0.10 × DOMContentLoaded`. Eased toward the true value, never jumps backward. Tabular numerals. **Hard cap 1,800 ms.** Skipped on `sessionStorage` repeat and on bfcache restore (`pageshow.persisted`). Hands the ground plane straight to the curtain — no flash between them. |
| 2 | `Curtain` (rebuild) | Fixes D-3 and D-4. **One-shot GSAP timeline on load, not scroll-driven.** Wordmark per-character in → 320 ms hold → the single 240 ms glitch → halves translate apart over 900 ms `EASE.io` → `pointer-events: none` → unmount after 1 s. Dismissable by click, `Escape`, and any scroll. Not rendered at all under reduced motion. |
| 3 | `OverlayMenu` | `100dvh`, focus trap, `Escape` closes, focus returns to the trigger, `aria-modal`, `role="dialog"`, giant per-item type with 60 ms stagger, closes on route change. **Scroll lock via `lenis.stop()`** — never `overflow: hidden` on `<body>`, which on iOS scrolls to top and loses the reading position. Requires D-13 fixed first. |
| 4 | `ChapterStack` | Five chapters = **the five real kickers**: Client work 16, Craft 10, Rhythm 15, Long form 2, Study 9. Sums to 52. **Derive every count from the data** — a hardcoded count is a defect even when it is right today. Alternating `.pair` layout via `order`, **never `direction: rtl`** (which flips punctuation and inherits into text). Mobile reset must be explicit or chapter 2's media lands on the wrong side of its own caption. |
| 5 | `TimelineRail` | All 52 works as a horizontal snap-scroller. The **one** sanctioned horizontal scroller: it is a `<div overflow-x:auto>`, not the document, with `scroll-snap`, `role="region"`, `aria-label`, and `←`/`→`/`Home`/`End` keys. Every flex child gets `min-width: 0`. Pointer-drag with a 6 px threshold before it counts as a drag — below that it must navigate. **Set `scroll-snap-type: none` on `pointerdown` and restore on `pointerup`**, or snap fights the drag handler and the rail stutters. |
| 6 | `HighlightBand` | Full-bleed `VIEW ALL 52 EDITS ↗` between the home grid and Toolkit. Per-character `GALLERY` type, `--terracotta` fill wipe from `transform-origin: bottom`, `Magnetic strength={0.34}`. This is the fix for "a normal person won't see that" — not a link at the bottom of a list, a full-width event. |
| 7 | `ServiceSheets` | The 6 services as sheets pinned over `6 × 55vh`, each rising and being overlapped. `grid-template-areas: "sheet"`, offset by transform only. Pinning off below `60rem`. **No prices, no packages, no "starting from"** — those were removed deliberately. |
| 8 | `EndCard` | `THANK YOU` / `WATCHING` per-character, social rail, year, `BACK TO TOP` via `lenis.scrollTo(0, { duration: 1.4 })` — **not** `scroll-behavior: smooth`, which fights Lenis. |

Also fix **D-14**: the hero's `id="about"` must become `id="hero"`, with a real About section owning `id="about"`.

---

## SECTION 8 — GUARDRAILS

Every one of these is a build-blocking gate, not advice.

**Performance**
- Lighthouse **mobile**, median of 3 runs: Performance ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO 100.
- CLS ≤ 0.02. LCP ≤ 2.2 s. TBT ≤ 200 ms.
- **Zero long tasks during scroll.** The entire per-frame budget is: Lenis's loop, GSAP's ticker, and the cursor's two `quickSetter` writes. Nothing reads layout.
- Per-route JS gzip: `/` 62 KB · `/projects` 34 KB · `/project/[slug]` 30 KB · `/about` 26 KB · `/contact` 22 KB. `ogl` chunk ≤ 14 KB, dynamic.
- **`will-change` ≤ 6 simultaneous**, applied on interaction start and removed on `transitionend { once: true }`. A permanent `will-change` holds a compositor layer for the page's whole life — which is how a site with no visible animation still drops frames.
- `content-visibility: auto` + **`contain-intrinsic-size`** on off-screen gallery tiles. The intrinsic size is mandatory or the scrollbar jumps as tiles render.
- Every `gsap.context()` reverted on unmount. Check `ScrollTrigger.getAll().length` is stable after five route changes — if it climbs, you are leaking triggers.

**Accessibility** (fixes D-11)
- Add to `globals.css`: a real `.sr-only`, `:focus-visible` rules, and a **complete** `@media (prefers-reduced-motion: reduce)` block.
- Under reduced motion: Lenis off, no scrubs, no curtain, no cursor, no marquee movement, no autoplay, **all content visible at rest**.
- One `<h1>` per route. Every decorative layer `aria-hidden`. Every split heading exposes its unsplit string. Wide-tracked labels get letter-spacing from CSS, never literal spaces in the string.
- Touch targets ≥ 44 px; player controls 56 px.
- `--wine` and `--indigo` are **fills only** — they fail AA as text on `--ground`.
- Fix **D-12**: rewrite `readableInk()` to compute the real WCAG contrast ratio of `--cream` and `--ground` against the tone and return the winner. Delete the 0.45 luminance threshold.
- Fix **D-15**: register `--tone-ink` with `@property` alongside the other two.

**Layout**
- No `1fr` without `minmax(0, …)`. No `minmax(<abs>, …)` without a `min(…, 100%)` floor — `minmax(20rem, 1fr)` overflows every viewport under 320 px and is the single most common cause of horizontal scroll in modern CSS.
- `min-width: 0` on every flex child that can hold text.
- `overflow-x: clip` **once**, at the root. Not `hidden` (which creates a scroll container and breaks `position: sticky` on descendants).
- **Zero `100vh` in the source** — `svh` for full-height sections, `dvh` for the overlay menu, `lvh` where a maximum is wanted. Fix D-9.
- The contact form card stays **one atomic grid child** at every width. It never splits internally.

---

## SECTION 9 — BUILD ORDER

Do it in this sequence. Each phase is independently verifiable, and each one earns the right to the next.

| Phase | Work | Gate |
|---|---|---|
| **1** | Section 1 in full: hydration fixes, `ToneBridge`, the `fadeIn` keyframe, `100vh` → `100svh` | Clean profile, `npm run dev`, **console completely silent** |
| **2** | `src/lib/motion.ts`, `useReducedMotion()`, expose Lenis via context (D-13), `globals.css` a11y block | Timing constants imported by at least one component; `lenis.scrollTo` callable |
| **3** | `<Reveal>` + `<SplitText>`, then apply to **every** section | Nothing appears on screen without animating in. Reduced motion shows everything at rest |
| **4** | Parallax ledger + scroll-velocity coupling + FLIP filtering | 60 fps scrolling `/` end to end; zero forced synchronous layout in a performance recording |
| **5** | Hover autoplay (Path A) + hero motion | Hover >140 ms plays; hover <140 ms fires zero requests; sweeping 12 tiles in 1 s mounts at most one |
| **6** | Graphics layer: wordmark, grain, vignette, badges, marquees, ghost numerals | `elementFromPoint` 24-point sweep hits zero decorative layers |
| **7** | WebGL warp: noise + velocity displacement + RGB shift, all six gates | Chunk ≤ 14 KB; CSS fallback verified by failing a gate deliberately |
| **8** | Cursor state machine + focus parity | All 7 states reachable; every state reachable by keyboard too |
| **9** | The 8 missing components (Section 7 order) | Each works while the previous one is mid-animation |
| **10** | Six pinned set pieces; pinning off below `60rem` | Ten-viewport overflow check passes again |
| **11** | Section 8 gates | Lighthouse mobile ≥ 90 / 100 / ≥ 95 / 100, median of 3 |

**Two ordering rules that matter more than the rest:**
- **Phase 1 before anything.** You cannot trust what you see while hydration is failing.
- **Phase 3 before phase 6.** Build the motion system before the decoration. Decoration bolted onto a site with no reveal primitive is how you end up here again — with 15 components and one blinking dot.

---

## SECTION 10 — DEFINITION OF DONE

- [ ] Console clean in a fresh incognito profile with extensions disabled. **And report which of Candidates A/B/C it actually was.**
- [ ] `grep -rn "scrollTrigger:" src` returns **more than 25** results.
- [ ] Every content block on every route animates in on first approach.
- [ ] Hovering any of the 52 tiles plays video, muted, after a 140 ms dwell — and tears down on leave.
- [ ] The hero moves.
- [ ] Scroll velocity visibly warps the background and skews the tiles, and both settle on ease-out.
- [ ] All three unused keyframes (`spinSlow`, `grain`, `scanline`) are now used.
- [ ] All 8 missing components exist and work.
- [ ] Cursor has 7 states; PLAY fires on every playable frame; it blocks no clicks.
- [ ] `prefers-reduced-motion` disables all of it and every string stays readable.
- [ ] `scrollWidth === clientWidth` at all ten viewports.
- [ ] Lighthouse mobile ≥ 90 / 100 / ≥ 95 / 100.
- [ ] Content diff against `src/data/`: **zero changes.** 52 works, 16 sections, 15 skills, 6 services, every string verbatim, no DaVinci, no prices.

> **The site is a colourist's portfolio. It should look like it was graded, and behave like it was cut.**
> Right now it looks graded and behaves like a document. Phase 3 is where that changes.
