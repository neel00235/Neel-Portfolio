# Fix 14 measured defects in the Neel Patel portfolio

You are working in an existing Next.js portfolio at the repository root. Every defect below was
reproduced in a real Chromium browser and the measurements are quoted. **Trust the measurements over
your own reading of the code** — several obvious-looking hypotheses were tested and disproved, and
those are called out explicitly so you do not waste time on them.

Fix all 14. Do not redesign anything. Do not change copy, colours, fonts, video IDs, or section
order except where a fix explicitly requires it.

---

## Ground rules (violating any of these re-introduces the bugs)

1. **Never run `npm install` / `npm add`.** Everything is already installed: Next.js 15.1.6 (App
   Router, `output: 'export'`), React 19.0.0, Tailwind 3.4.17, GSAP 3.12.5 (ScrollTrigger + Flip),
   Lenis 1.1.18, ogl 1.0.11, zustand 5.0.2, lucide-react, sharp. Adding a dependency is a failure.

2. **Never hardcode `will-change` in `className` or CSS.** This is the single largest cause of the
   lag (defect 2). `will-change` must be applied immediately before an animation and removed the
   instant it finishes. GSAP does this automatically **only if you do not hardcode it**. A permanent
   `will-change` promotes the element to its own compositor layer forever, and also makes it a
   stacking context *and* a containing block for `position: fixed` descendants.

3. **Animate only `transform` and `opacity`.** Never animate `width`, `height`, `top`, `left`,
   `margin`, `padding`, `box-shadow`, `filter`, `backdrop-filter`, or `background-position`. Use
   `clip-path` only on already-composited **non-text** decorative elements — never on a text layer.

4. **Never read layout inside a per-frame callback.** No `clientHeight`, `offsetTop`,
   `getBoundingClientRect()`, or `getComputedStyle()` inside `onUpdate` / `requestAnimationFrame` /
   a scroll handler. Measure once on setup and on `ScrollTrigger.refresh()`, cache the numbers, then
   only write during the frame.

5. **Never write CSS custom properties on `:root` per frame.** It invalidates style for every
   element that references them. Use a plain JS module variable instead.

6. **Use `scrub: true`, never a numeric scrub.** Lenis already smooths the scroll; a numeric scrub
   adds a second smoothing pass and is what makes scrubbed sections feel like they are lagging
   behind the wheel.

7. **Never apply GSAP `pin` to a CSS Grid/Flex child, and never to an element that is itself a
   scroll container.** Both are actual causes below (defects 12 and 6).

8. **Replace `transition-all` with an explicit property list** (`transition-[transform,border-color]`
   etc.). `transition-all` makes the browser watch every animatable property.

9. Keep every `prefers-reduced-motion` guard that already exists, and add one to any new animation.

10. Use `svh`/`dvh`, never `100vh`. Keep the anti-overflow trio where grids are involved:
    `minmax(0,1fr)`, `min(<size>,100%)`, `min-width: 0`. Root stays `overflow-x: clip` (not
    `hidden`, which breaks descendant `position: sticky`).

11. After each fix, run `npm run build` and confirm it still exports cleanly.

---

## Defect 1 — First load paints a black band across the top half of the screen

**Symptom:** on first load the top of the page goes black/blank. The preloader counter is never
visible.

**Root cause — measured, and it is not in `Curtain.tsx`:**

`tailwind.config.ts:51` defines:

```js
fadeIn: { '0%': { opacity: '0', transform: 'translate3d(0,12px,0)' }, '100%': { opacity: '1', transform: 'none' } },
```

and `tailwind.config.ts:60` runs it with `forwards`:

```js
fadeIn: 'fadeIn 420ms cubic-bezier(.16,1,.3,1) forwards',
```

`src/app/template.tsx:7` applies that class to the wrapper around every page:
`<div className="animate-fadeIn w-full">`.

Because the animation interpolates *to* `transform: none` and is filled `forwards`, the computed
transform stays a matrix forever rather than reverting to `none`. Measured on the live page:

```
<div class="animate-fadeIn w-full">  →  transform: matrix(1, 0, 0, 1, 0, 0)
```

An **identity** matrix — but per spec *any* non-`none` transform makes the element the containing
block for `position: fixed` descendants. `src/components/curtain/Curtain.tsx:220` is
`fixed inset-0`, and it is inside that wrapper, so it resolved to the document box, not the viewport:

```
viewport height:        451px
curtain root computed:  position: fixed, top: 0, bottom: 0, height: 35651.4px   ← whole document
top leaf    (top-0):    rect { top: 0,     bottom: 226 }   ← covers only the top half of the screen
bottom leaf (bottom-0): rect { top: 35426, bottom: 35651 } ← 35,426px down the page, never seen
```

The top leaf is `h-[50svh]` = 226px, so it blacks out the top half of the screen and nothing else.
The bottom leaf — which contains the `000/100` counter, "LOADING REEL ASSETS" and "PRESS ESCAPE OR
CLICK ANYWHERE" — is parked at the bottom of the *document*.

**Fix:**

- In `tailwind.config.ts:51`, end the `fadeIn` keyframes on `transform: 'translate3d(0,0,0)'` and
  **remove `forwards`** from line 60, or better: make `fadeIn` animate **opacity only** and drop the
  transform from the keyframes entirely. An opacity-only fade cannot create a containing block.
- Additionally, render `Curtain` through `createPortal(document.body)` so it can never again be
  affected by an ancestor transform. Do the same audit for any other `position: fixed` element that
  lives inside `<main>`.
- Verify: with the curtain mounted, `document.querySelector('[aria-label="Cinematic Curtain
  Preloader"]').getBoundingClientRect().height` must equal `window.innerHeight`, and both leaves must
  be on screen with the counter visible.

**Note:** this same identity-transform trap is why `animate-fadeIn` on
`src/components/video/VideoModal.tsx:78` is risky — it is currently portalled to `body` so it works,
but it creates a containing block for its own fixed descendants. Fix the keyframes and both are safe.

---

## Defect 2 — Scroll is laggy; does not feel like 60fps

**Measured on the live page (dev build — production will be better, but every cause below is
build-independent and structural):**

| Scroll range | Median frame | p95 frame | Frames > 20ms | Worst frame | Long tasks > 50ms |
|---|---|---|---|---|---|
| hero → works | 13.9ms | 48.7ms | **43.7%** | 76.4ms | 6 |
| gallery | 13.9ms | 48.7ms | **43.5%** | 62.5ms | 6 |
| toolkit | 13.9ms | 55.6ms | **41.3%** | 69.5ms | **14** |
| services | 13.9ms | 55.5ms | **45.7%** | 69.4ms | 4 |

The median is fine; **41–46% of frames blow the 16.7ms budget** and the p95 is 3× over. That
profile — good median, terrible tail — is compositor-layer thrash plus forced synchronous layout,
not raw JS cost.

Also measured: **304 elements carry a permanent `will-change`** out of 2,954 total elements
(`will-change: transform` on 303, `transform, opacity` on 135, `clip-path` on 1), and **11 infinite
CSS animations never idle**, so the compositor never goes quiet even when the user is not scrolling.

**Fix each of these:**

**2a. `src/components/motion/Reveal.tsx`** — every wrapper is rendered with a hardcoded
`will-change-[transform,opacity]` that is never removed (134 live instances). Delete it from the
`className`. Let GSAP manage `will-change` via its own auto-`will-change` handling, or add/remove it
manually in the tween's `onStart`/`onComplete`.

**2b. `src/components/motion/SplitText.tsx:85` and `:100`** — `will-change-transform` is hardcoded on
**every single character span** (166 live instances measured). Delete it from both lines. If you want
the promotion during the animation only, set it in `onStart` and clear it in `onComplete` on the
*parent*, not per character.

**2c. `src/components/sections/Toolkit.tsx:77-107`** — the worst per-frame offender (14 long tasks).
Its `onUpdate` currently, every frame:
  - reads `container.clientHeight` (line 81) → **forced synchronous layout every frame**
  - writes `clipPath` on `invertedLayerRef`, which is a **15-row text layer** (line 220 also
    hardcodes `will-change-[clip-path]`)
  - writes `row.style.opacity` for all 15 rows
  - writes the band transform

  Rewrite per rule 4 and rule 3: cache `containerH` and `rowH` on setup + on `ScrollTrigger.refresh`,
  drop the `clip-path`-on-text technique entirely (see defect 10 for what to replace it with), and
  stop writing 15 opacities per frame.

**2d. `src/components/sections/Gallery.tsx:127-144`** — `scrub: 0.2` (numeric) plus an `onUpdate`
that calls `self.getVelocity()` and `gsap.set(gridRef.current, { skewY, scaleY })` every frame, while
the **enclosing `gsap.to()` writes the same two properties**. Two writers fighting over one container
that holds 12 video-poster tiles. See defect 8.

**2e. `src/components/scroller/SmoothScroller.tsx:49-62`** — writes two `:root` custom properties
every scroll frame:

```js
document.documentElement.style.setProperty('--vel', normalized.toFixed(3));
document.documentElement.style.setProperty('--scroll-skew', `${skew.toFixed(2)}deg`);
```

  - `--scroll-skew` is **never read anywhere in the codebase**. Delete it outright.
  - `--vel` is read in exactly one place, `src/components/tone/ToneField.tsx:259`, via
    `getComputedStyle(document.documentElement).getPropertyValue('--vel')` — which is itself a forced
    style read. Replace the whole round-trip with an exported module variable
    (`export const scrollState = { vel: 0 }`) that SmoothScroller writes and ToneField reads.

  Leave the Lenis config itself alone — `lerp: 0.085`, `syncTouch: false` is correct.

**2f. `src/app/globals.css`** — remove `will-change: transform` from `.grid-overlay` (line 188) and
`will-change: transform, opacity` from `.gradient-orb-1` (line 236) and `.gradient-orb-2` (line 242).
These run `infinite` animations, so they hold full-viewport layers alive permanently. `.grid-overlay`
is instantiated `fixed inset-0` on the page **and** `absolute inset-0` inside Works, Gallery, Toolkit
and Services — several full-size re-rasterising layers at once. Consider pausing the
`gridTravel`/`gradientFloat` animations when their section is off-screen.

**2g.** Extend the `@media (prefers-reduced-motion: reduce)` block in `globals.css:254-263` to also
reset `will-change: auto !important` and `animation-play-state: paused` for the decorative layers. It
currently only overrides durations.

**2h.** `--line` is used at `globals.css:88` (`border: 1px solid var(--line)`) but **never defined**
in `:root` (lines 23-48 define `--ground`, `--cream`, `--terracotta`, … but no `--line`). Every
text input therefore falls back to the initial border colour. Define `--line` and `--line-2` in
`:root` to match the Tailwind theme.

**2i.** Remove the remaining hardcoded `will-change` occurrences: `Hero.tsx:228, 237, 247, 259, 302`,
`Toolkit.tsx:185, 220, 253`, `PlayerChrome.tsx:75`, `Curtain.tsx:231, 284`.

---

## Defect 3 — On mobile the name comes before the photo

**Wanted:** photo first, then the name and everything else.

**Measured at 375×812:** `h1 NEEL PATEL` at document Y **199px**; portrait `<figure>` at **704px**.
Name first, photo 505px below it.

**Cause:** in `src/components/sections/Hero.tsx` the typography column (`lg:col-span-7`, line 224)
precedes the portrait column (`lg:col-span-5`, line 298) in DOM order, inside a
`grid-cols-1 lg:grid-cols-12` grid — so single-column mobile stacks text first.

**Fix:** add `order-2 lg:order-1` to the typography column (line 224) and `order-1 lg:order-2` to the
portrait column (line 298). Desktop layout must be unchanged: text left, portrait right. Do not
reorder the DOM itself (the h1 must stay first in source for document outline / SEO).

---

## Defect 4 — Featured autoplay showreel shows a white background with lines behind it

**Measured on all three hero showreel iframes:**

```
posterBehind: false     ← nothing paints behind the iframe
hasDnt:       false     ← privacy param missing
iframeBg:     rgba(0,0,0,0)
wrapperBg:    rgb(27,22,17)
```

`src/components/sections/Hero.tsx:47-53` renders a bare Vimeo iframe with no poster underneath. The
wrapper is dark, but the iframe paints **its own document on top of it**, and Vimeo's player document
is light until the video decodes — that is the white flash and the loading-skeleton lines.

**Fix in `Hero.tsx`'s `AutoplayReel`:**

- Add `<Image src={`/posters/${work.id}.webp`} fill className="object-cover" />` (or a plain `<img>`)
  as a sibling **behind** the iframe at a lower z-index, so a real frame of the video is always what
  shows through. The posters already exist in `public/posters/` — `VideoFrame.tsx:214` uses the same
  `/posters/${id}.webp` convention.
- Give the iframe wrapper an explicit `bg-black` (not `bg-ground-2`) so any letterboxing inside the
  player matches.
- Add `&dnt=1` to the iframe `src` (line 48) — every other embed in the codebase has it; this one is
  the only one missing it (`VideoFrame.tsx:230` and `VimeoFacade.tsx:83` both include it).
- Fade the iframe in over the poster once it is ready rather than showing it immediately.

---

## Defect 5 — Fullscreened video has a white background; it must be black

**Cause:** `src/components/video/VideoFrame.tsx:181-188` fullscreens the card container:

```js
containerRef.current.requestFullscreen()
```

and there is **no `:fullscreen` or `::backdrop` rule anywhere in `src/app/globals.css`** (confirmed —
the file has no occurrence of either). The card keeps its aspect-ratio class while the UA forces
`width/height: 100%`, and whatever the UA paints in the letterbox area is unstyled.

*Honesty note: the Fullscreen API is blocked inside the embedded preview pane, so unlike every other
defect here this one could not be reproduced live. The fix below is therefore written to be
unconditional — it forces black on every surface that could be showing white. Verify it in a real
browser window.*

**Fix — add to `globals.css`:**

```css
:fullscreen,
:fullscreen > *,
::backdrop,
:fullscreen::backdrop {
  background-color: #000 !important;
}

/* the fullscreen target must not keep its card chrome */
:fullscreen {
  border-radius: 0 !important;
  border: 0 !important;
  aspect-ratio: auto !important;
}
```

Also set `background:#000` on the `VideoFrame` container while `document.fullscreenElement` is it,
and on the `VimeoFacade` wrapper (`VimeoFacade.tsx:86` is currently `bg-ground-2` — make it
`bg-black`). Add a `fullscreenchange` listener so the card restores its normal styling on exit.

---

## Defect 6 — The timeline section is completely blank; you scroll and scroll through nothing

**This is the worst defect on the site. Measured:**

```
#works section height:        22,827px          (viewport is 451px → ~50 screens)
pin-spacer padding-bottom:    20,231px
pinned child transform:       translateY(20231px)
```

Mid-pin (scrollY 14,380) the rail itself:

```
overflow-x:   auto            ← it IS a native scroll container
transform:    matrix(1, 0, 0, 1, -10714.1, 0)
rect:         { left: -10666, right: -9807 }
OFFSCREEN:    true            ← the entire visible box is off the left edge
scrollLeft:   0               ← native scroll never moves; only the transform does
scrollWidth:  21192   clientWidth: 859   children: 52
```

A viewport hit-test at 56 sample points mid-pin returns only `HEADER.fixed` and `DIV.pin-spacer` —
**the content area is genuinely empty.**

**Cause:** `src/components/sections/SelectedWorks.tsx:288` makes the rail
`flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory` — a scroll container — and
then the pin tween at lines 154-169 translates **that same element**:

```js
x: () => -(railRef.current!.scrollWidth - railContainerRef.current!.clientWidth)
```

Translating a scroll container moves the whole visible box off-screen instead of scrolling its
contents. On top of that, `railWorks` is all **52** works at `w-80`/`w-96`, so `scrollWidth` is
21,192px, and `end: () => "+=" + Math.max(800, scrollWidth - innerWidth)` turns that into ~21,000px
of pinned blank scrolling. The wheel handler at lines 175-184 (`rail.scrollBy`) is a third,
competing mechanism, and the scrub is numeric (`0.8`).

**Fix — pick one mechanism and delete the others:**

- **Recommended:** drop the pin entirely. Make it a plain CSS scroll-snap rail the user swipes/wheels
  natively (`overflow-x: auto` + `snap-x` already there), delete the GSAP `x` tween and the wheel
  handler, and cap the rail at ~12 works with a "View all" link to `/projects`. Zero pinned scroll,
  no blank, works on touch for free.
- **If you keep the pinned horizontal scroll:** the translated element must **not** be the scroll
  container. Use an inner `w-max` track that is translated, inside a parent with `overflow: hidden`
  (no `overflow-x: auto` anywhere), delete the wheel handler, set `scrub: true`, and cap the pin
  length to at most ~3 viewport heights — never 21,000px.

Either way the section must never exceed ~3,000px of scroll for its content.

---

## Defect 7 — Conroy campaign shows only 4 reels; it must show all 10

**Wanted:** the 1 cinematic reel plays **continuously in the background**, with all **9** vertical
reels as cards above/below it.

**The data is already complete** — `src/data/portfolio.generated.ts` has all ten
(`conroy-cinematic-reel` plus `conroy-reel-01` … `conroy-reel-09`, lines 289-398), and the campaign
blurb at line 284 literally says *"one cinematic hero film … then nine vertical reels … ten
deliverables."*

**The bug is a slice:** `src/components/sections/SelectedWorks.tsx:34`

```js
const conroyReels = conroySection?.works.slice(1, 5);   // ← yields 4
```

**Fix:**

- Change to `.slice(1)` so all 9 reels render.
- Lay them out as a card grid — `grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6` with
  `minmax(0,1fr)` columns, each card `aspect-[9/16]` using the existing `VideoFrame` component so
  posters + hover-preview + duration badge come for free.
- Put `conroyHero` (`works[0]`, the cinematic reel) behind them as a continuously looping muted
  background: `absolute inset-0 -z-10` iframe with
  `?background=1&autoplay=1&loop=1&muted=1&playsinline=1&autopause=0&dnt=1&quality=720p`, a poster
  behind it (per defect 4), and a dark scrim over it so the cards stay readable. Give the background
  `pointer-events-none`.
- Respect `prefers-reduced-motion`: show the poster instead of the looping iframe.

---

## Defect 8 — The selected-works gallery wiggle is great but laggy

**Cause:** `src/components/sections/Gallery.tsx:127-144` has three problems at once:

1. `scrub: 0.2` — numeric scrub on top of Lenis smoothing (rule 6).
2. An `onUpdate` calling `self.getVelocity()` then `gsap.set(gridRef.current, { skewY, scaleY })`
   **every frame**.
3. The **enclosing** `gsap.to(..., { skewY: 0, scaleY: 1 })` writes the *same two properties* — two
   writers fighting over one container that holds 12 video-poster tiles.

**Fix:** keep the wiggle, make it single-writer.

- Set `scrub: true`.
- Delete the enclosing `gsap.to()` that writes `skewY`/`scaleY`, or delete the `onUpdate` — not both
  mechanisms.
- Drive the skew with `gsap.quickTo(gridRef.current, 'skewY', { duration: 0.4, ease: 'power3' })`
  created **once** outside the callback, and feed it the velocity. `quickTo` is built for exactly
  this and avoids re-creating a tween per frame.
- Clamp the velocity (`gsap.utils.clamp(-12, 12, ...)`) so a fast flick cannot spike the skew.
- Do not skew a container of 12 tiles if you can skew a cheaper wrapper — and never skew text.

---

## Defect 9 — "View all 52 edits" page has no animation when the edits load

**Cause:** `src/app/projects/page.tsx` has **zero** animation — no `gsap`, no `ScrollTrigger`, no
`Reveal` import anywhere in the file. The 52-card grid (line 115) and the filter chips just appear.

**Two things need animating:**

1. **Initial load / scroll-in:** stagger the cards in. **Important constraint:** each card carries
   `style={{ contentVisibility: 'auto', containIntrinsicSize: '380px' }}` (line 120), so off-screen
   cards are not rendered at all — a single global timeline will fire for cards that do not exist
   yet. Use a per-card `ScrollTrigger` with `start: 'top 90%'`, `once: true`, or an
   `IntersectionObserver`, animating `opacity` + `y` only. Keep `contentVisibility: auto` — it is
   good for performance.

2. **Filter change:** clicking a chip (line 93, `handleFilterClick`) swaps `filteredWorks` with no
   transition. Animate it — GSAP **Flip is already installed**, so `Flip.getState()` before the state
   update and `Flip.from(state, { duration: 0.5, stagger: 0.02, absolute: true })` after gives you
   proper reflow choreography. A simple stagger-in of the new set is acceptable if Flip proves
   fiddly with `content-visibility`.

Follow rules 2 and 3: no hardcoded `will-change`, transform/opacity only, and gate on
`prefers-reduced-motion`.

---

## Defect 10 — The toolkit orange bar does not respond to scroll; it is never where you are looking

**First, two hypotheses that were tested and are WRONG — do not "fix" these:**

- *"The band math is off because of the `divide-y` 1px dividers."* Measured: row height 64px, row
  pitch exactly **64px**, `clientHeight` exactly **960px** = 15 × 64, and band-to-row drift at the
  last row is **0px**. The arithmetic in `Toolkit.tsx:81-83` is correct.
- *"The band and the active row are out of phase."* Measured: at progress 0/0.25/0.5/0.75/1 the band
  sits over row 0/3/7/10/14 — correctly in step.

**The actual cause is geometry.** Measured band position in **viewport** coordinates across the
entire section:

```
progress:            0     0.25    0.5    0.75     1
band top in viewport: 158    118     79      40     1      (viewport height = 451px)
```

The band never leaves the **top 160px of a 451px screen**, then slides off the top edge. The list is
**962px tall in a 451px viewport** — more than 2× the screen — and the band's position is computed
against the *list*, while the list is simultaneously scrolling up past the viewport. Net on-screen
velocity is ≈ −0.15px per px scrolled, so the band drifts *upward off the screen*. That is exactly
"the bar isn't where I'm looking."

Second measured problem: rows below the active one are dimmed by
`Math.max(0.12, 1 - dist * 0.28)`, so **8 of 15 rows sit at ≤ 0.15 opacity** at progress 0.25 —
most of the list is nearly invisible — yet at progress 0 and 1 all 15 are at 1.0, so the dimming
flickers on and off at the section edges.

**Fix — `src/components/sections/Toolkit.tsx:71-109`:**

- **Pin the list** while the band sweeps, so the list stays still on screen and the band moves
  through it under the user's gaze: `ScrollTrigger.create({ trigger: listContainerRef.current, start:
  'center center', end: '+=' + listHeight, pin: true, scrub: true })`. The list is not a grid child
  and not a scroll container, so pinning it is safe (unlike defects 6 and 12). Only pin at
  `(min-width: 60rem)` via `gsap.matchMedia()` — on mobile a 962px list in a short viewport should
  just scroll normally with the band driven off whichever row is nearest viewport centre.
- **Or**, if you prefer no pin: drive `activeIdx` from **which row is actually closest to viewport
  centre** (computed from cached row offsets, not read per frame) rather than from ScrollTrigger
  progress over the list. Then the highlight is always where the user is looking, by construction.
- **Cache `containerH` / `rowH`** on setup and on `ScrollTrigger.refresh()` — never read
  `clientHeight` in `onUpdate` (rule 4, and this is 14 long tasks per scroll).
- **Delete the `clip-path`-on-text inverted layer** (lines 216-244 plus the `will-change-[clip-path]`
  on line 220). Clipping a 15-row text layer every frame is forbidden by rule 3. Get the same
  inverted look by giving the **active row only** a `text-ground` class — a single class toggle on one
  row, no clip-path, no second copy of all 15 rows in the DOM.
- **Stop writing 15 opacities per frame.** Only touch rows whose active state actually changed
  (track `prevActiveIdx` and bail early when `activeIdx` is unchanged), and soften the dimming floor
  from `0.12` to about `0.45` so the list never reads as blank.
- Widen the trigger range so the sweep does not finish while the list is still mid-viewport —
  `end: 'bottom 45%'` (line 76) is too early.

---

## Defect 11 — Optimise the whole toolkit, with animations and hover effects

Applies to the same file, `src/components/sections/Toolkit.tsx`:

- **The list rows have no hover state at all** (`.skill-row`, line 196). Add one: on hover, lift the
  row's inner content with `transform: translateX(6px)`, tint the row number to `--terracotta`, and
  reveal the description. Transform/colour only — no `box-shadow`, no `width`.
- **`.skill-card` (line 253)** uses the forbidden combination
  `transition-all duration-300` + `hover:-translate-y-2` +
  `hover:shadow-[0_16px_36px_-6px_rgba(246,124,41,0.18)]`, plus a hardcoded `will-change-transform`.
  Replace with `transition-[transform,border-color] duration-300`, keep `hover:-translate-y-2` and
  `hover:border-terracotta/60`, drop the animated shadow (put a **static** shadow on the card so
  there is nothing to animate), and delete the `will-change`.
- The three cards the user singled out — **colour grading, after effects, video rescue** — should get
  a slightly richer treatment: an icon or numeral that scales/rotates on hover via `transform`, and
  the card's `--tone` accent shifting via `color`/`border-color`.
- **Marquee scrub** at line 135 is numeric (`scrub: 0.5`) — set it to `true` (rule 6).
- The marquee band and `.skill-card` grid already animate in; make sure their in-animations run once
  (`once: true`) rather than re-triggering.

---

## Defect 12 — "What I Deliver" cards glitch and fly outside the page on scroll

**Measured:** six `.pin-spacer` elements exist inside `#services`, and they collide in **duplicate
pairs at identical document offsets**:

```
pin-spacer doc offsets: 32395, 32395, 32735, 32735, 33051, 33051
pin-spacer heights:     308,   308,   284,   284,   284,   284
#services section height: only 1,372px, containing ~1,768px of pinned spacers
```

**Cause:** `src/components/sections/Services.tsx` pins **CSS Grid children**:

```js
mm.add('(min-width: 60rem)', () => {
  cardRefs.current.forEach((card, idx) => {
    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: `top ${120 + idx * 24}px`,
        end: 'bottom 40%',
        pin: true,
        pinSpacing: false,
      },
    });
  });
});
```

The 6 cards are children of `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8` (line 88), each
wrapped in a `<Reveal>`. Pinning wraps each card in a pin-spacer and switches it to
`position: fixed` with hard-coded `left`/`top` offsets — which destroys the grid. With
`pinSpacing: false` the grid then reflows while the fixed cards keep **stale `left` values**, so they
land outside the page. (Before defect 2a is fixed, the `<Reveal>` wrapper's permanent `will-change`
also means `position: fixed` is not even viewport-relative there.)

**Fix — do not pin grid children. Choose one:**

- **Recommended (no pin at all):** keep the grid exactly as it is and give the cards a scrubbed
  `y` offset for the stacking feel:
  `gsap.to(card, { y: -idx * 12, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom',
  end: 'top 30%', scrub: true } })`. No pin, no spacer, grid intact, and it cannot escape the page.
- **If you want true sticky stacking:** abandon the grid for this section. Use a single-column flex
  layout and `position: sticky; top: calc(120px + var(--idx) * 24px)` in **pure CSS** — sticky needs
  no JS, creates no spacer, and cannot desync. Remember the root must be `overflow-x: clip`, not
  `hidden`, for sticky to work (already correct in `globals.css:52`).

Also fix the card hover at `Services.tsx:95`: `transition-all duration-300` +
`hover:shadow-[0_20px_40px_-10px_rgba(246,124,41,0.15)]` → explicit property list and a static
shadow.

---

## Defect 13 — Close the gaps above and below "something" in the contact headline

Headline is `LET'S CUT / something / WORTH WATCHING` in
`src/components/sections/Contact.tsx:162-171`.

**Measured:**

```
h2 font-size:              124.93px    h2 line-height: 107.44px
script span font-size:     137.42px    line-height:    137.42px   display: inline
script span painted box:   179px       ← overflows its own line-height by 42px
distinct line-box heights: [107, 154, 179]
```

The line containing "something" is **179px** tall against **107px** for a normal line — **72px of
dead vertical space**, exactly the gap the user sees.

**Cause:** line 164 —

```jsx
<span className="font-script text-terracotta lowercase text-[1.1em] font-normal leading-none mx-2">
```

`text-[1.1em]` scales the font to 137px while the parent line-height is 107px (`leading-[0.9]`), and
`leading-none` (= 1.0) makes the span's own line box 137px. On top of that the cursive face has
ascenders/descenders far outside its em box, pushing the painted box to 179px. Because the span is
`display: inline`, all of that inflates the parent's line box.

**Fix:**

- Make the script word `inline-block` (or `block`, since it reads as its own line) so its box stops
  inflating the parent's line box.
- Give it a tight explicit leading — `leading-[0.72]` — and pull the overflow back with negative
  vertical margins, e.g. `-my-[0.18em]`.
- Keep the optical size: if `text-[1.1em]` is needed for the look, keep it, but compensate the
  leading. If not, `text-[0.95em]` with the cursive face usually looks the same size next to a black
  display face.
- Verify: after the fix, `distinctLineBoxHeights` for that `h2` should contain no value more than
  ~15% above the base 107px, and the `h2`'s total height should drop from 460px to roughly 340-360px.

---

## Defect 14 — The whole website must feel smooth

This is the sum of defects 1, 2, 6, 8, 10 and 12. After all of them are fixed, verify against these
targets and iterate until they are met:

- **p95 frame time under 20ms** across hero, works, gallery, toolkit and services (measured 48-56ms
  before).
- **Fewer than 5% of frames over 20ms** (measured 41-46% before).
- **Zero long tasks over 50ms** during a steady scroll (measured 4-14 before).
- **Permanent `will-change` count under ~20** on a loaded page (measured 304 before). Check with:
  ```js
  [...document.querySelectorAll('*')].filter(e => getComputedStyle(e).willChange !== 'auto').length
  ```
- **No section taller than ~3,000px** unless it genuinely has that much content. Check with:
  ```js
  [...document.querySelectorAll('section')].map(s => [s.id, Math.round(s.getBoundingClientRect().height)])
  ```
  `#works` measured 22,827px before; it must come down.
- **Document height should drop substantially** from 35,559px once the two runaway pins are fixed.
- **Zero off-screen pinned content:** every `.pin-spacer` child must be within the viewport while its
  trigger is active.
- No console errors or warnings, and `npm run build` exports cleanly.

Measure in a **production build** (`npm run build && npx serve out`) for the final numbers — the
figures quoted throughout this document come from a dev build, so they are pessimistic in absolute
terms, though every root cause is structural and build-independent.

---

## Suggested order of work

1. **Defect 1** first (`tailwind.config.ts` keyframes) — it is a two-line change and it may be
   silently breaking other `position: fixed` elements you have not noticed yet.
2. **Defect 2a + 2b** next (delete hardcoded `will-change` from `Reveal` and `SplitText`) — one
   change, removes ~300 of the 304 permanent layers, and improves every section at once.
3. **Defects 6 and 12** (the two broken pins) — these remove ~21,000px and ~1,700px of broken scroll
   and are the most visible wins.
4. **Defects 10 and 11** (toolkit) — same file, do them together.
5. **Defects 2c-2i, 8** (remaining per-frame offenders).
6. **Defects 3, 4, 5, 7, 9, 13** (self-contained, any order).
7. **Defect 14** — measure, iterate.

Re-measure after each group rather than at the end, so a regression is attributable.
