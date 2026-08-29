# Antigravity Fix Prompt — Round 3

Nine changes, measured against the current working tree. Every file path and line
number below was read from the repo, not guessed.

**Execute ONE ITEM PER TURN.** Do not batch. After each item run both gates
(`npm run verify-content`, `npm run build`) and stop. Items 1, 3, 4 and 5 are
rewrites of existing machinery — they are the ones that break if rushed.

---

## GROUND RULES (unchanged from round 2 — re-read before every item)

1. **Never run `npm install`.** Every dependency is already installed. If you
   think you need a package, you have misread the task.
2. Never hardcode `will-change` in CSS or JSX.
3. Animate **only `transform` and `opacity`** in scroll-scrubbed or per-frame
   contexts. Discrete one-shot hover/click tweens may animate `height` when a
   reflow is genuinely required (item 5) — never in a scrub.
4. **Never read layout in a per-frame callback.** No `getBoundingClientRect()`,
   `offsetTop`, `offsetHeight`, `scrollWidth` inside `onUpdate`, a rAF loop, or a
   scrub. Measure once on setup and once on `ScrollTrigger.refresh()`. Reading
   layout inside a discrete `mouseenter` handler is fine — that is an event, not
   a frame.
5. Never write `:root` custom properties per frame.
6. `scrub: true`, never `scrub: <number>`.
7. Never `pin` an element that is a direct child of a Grid or Flex container.
8. No `transition-all`. Enumerate: `transition-[transform,opacity,color]`.
9. Keep every `prefers-reduced-motion` guard that already exists. Never delete one.
10. `svh`/`dvh`, never `100vh`.
11. `ScrollTrigger.addEventListener('refresh', fn)` is **global**.
    `gsap.context().revert()` does **not** remove it. Hand the remover to the
    `useEffect` cleanup, exactly as `src/components/sections/Toolkit.tsx:32,167,213`
    already does.
12. `src/data/content.ts` is under the `verify-content` gate. You may **add** new
    keys. You may never edit or delete an existing key's string.
13. Use the timing tokens in `src/lib/motion.ts` (`EASE.out`, `EASE.io`,
    `EASE.soft`, `DUR`, `STAGGER`). Do not invent new cubic-beziers.
14. Fonts: only the five faces registered in `src/lib/fonts.ts` exist. Item 9 is
    the single exception and has its own rules.

Gates, after every item:

```bash
npm run verify-content
```

```bash
npm run build
```

`verify-content` must report `15 PASSED / 0 FAILED`. `build` must report
`61/61` static pages and `Exporting 3/3`. `eslint` and `tsc` both fail the build
(`next.config.mjs` sets `ignoreDuringBuilds: false` and `ignoreBuildErrors: false`),
so an unused variable is a build failure, not a warning.

---

## ITEM 1 — Curtain: delete the orange screen, make it reversible, add the hero gap

**Files:** `src/components/curtain/Curtain.tsx`, `src/app/page.tsx`

This is three linked changes. Read all three before editing.

### 1a. Delete the orange full-bleed panel

`src/components/curtain/Curtain.tsx:246-256` is a `bg-terracotta` panel filling
the viewport with a dark `NEEL PATEL` on it. It sits **behind** the two black
leaves, so as the leaves part it is what gets revealed. That is wrong — the thing
that should be revealed is the website.

**Delete the entire block**, opening comment through closing `</div>`. Nothing
replaces it. Behind the leaves there must be nothing but the live page.

Keep the orange wordmark halves that live **on** the leaves
(`Curtain.tsx:273-279` and `:301-307`). Those are correct and stay untouched:
together they compose one continuous orange `NEEL PATEL` centred on the seam,
which tears in half as the leaves part. Only the full-bleed panel goes.

### 1b. Make the curtain permanent and fully reversible

Right now the curtain destroys itself: `sessionStorage` marks it played
(`:29,132,181`), `onLeave` sets `isDismissed` (`:180-186`), and
`if (!mounted || isDismissed) return null` (`:235`) unmounts it forever. Scroll
back to the top and it is gone.

Required behaviour: **the leaves are a pure function of `window.scrollY`.**
Scroll down, they part. Scroll up, they close again. Always. No dismissal, no
`sessionStorage`, no one-way state.

- Delete `dismissCurtain` (`:129-162`) entirely, along with the `isDismissingRef`
  (`:23`) and the `onClick`/`tabIndex`/`role="dialog"` handlers on the root
  (`:239-242`). A permanent decorative overlay is not a dialog and must not be in
  the tab order.
- Delete the `showRgbSplit` / `showScanline` state (`:15-16`). **`showRgbSplit` is
  read in three places, not one** — the scanline JSX at `:259`, and both leaf
  `className` template strings at `:267` and `:295`
  (`showRgbSplit ? 'animate-rgbSplit' : ''`). Remove all four references. Miss one
  of the leaf usages and the build fails on an undefined identifier, because
  `next.config.mjs` sets `ignoreBuildErrors: false`.
- Delete the `hasPlayed` check and both `sessionStorage` calls
  (`:29`, `:132`, `:181`).
- Delete the `onLeave` callback (`:180-186`). `scrub: true` already reverses on
  upward scroll; `onLeave` is the only thing making it one-way.
- Delete the `onKeyDown` handler (`:216-223`) and its `removeEventListener`
  at `:228`.
- Delete `isDismissed` state (`:14`), its guard at `:166`, and its entry in the
  effect's dependency array (`:233`). Simplify the early return at `:235` to
  `if (!mounted) return null;`.
- Keep the preloader counter, the `pageshow` handler's harmless parts, and the
  three real load signals (`:43-108`) as they are. The counter still reads 000→100
  on the bottom leaf.
- Keep the `prefersReducedMotion` branch (`:28,31-39`) but change what it does:
  when reduced motion is set, render nothing (`setMounted(false)` path or an
  explicit `if (prefersReducedMotion) return null`) **and** set
  `document.documentElement.dataset.curtain = 'off'` so the spacer in 1c can
  collapse. `main` opacity must be forced to `1` in that branch, as it is today.

**Pointer events — this will break the whole site if you miss it.** The root
`div` is `fixed inset-0` at `z-index: var(--z-curtain, 90)`, above `main` (z-10)
and the header (z-30). Once the leaves have travelled off-screen the root still
covers the viewport and will swallow every click and hover on the page below.
Put `pointer-events-none` on the **root** div and leave the leaves as they are —
the leaves stop intercepting on their own once they translate out of view.

### 1c. Add the scroll gap above the hero

Today, scrolling one viewport to open the curtain also scrolls the document one
viewport, so when the leaves finish the page is already past the hero and sitting
on the Selected Works reel. There must be one viewport of empty document above
the hero for the curtain reveal to consume.

In `src/app/page.tsx`, insert a spacer between `<Curtain />` and `<Hero />`:

```tsx
{/* Curtain reveal runway: the one viewport of scroll the leaves consume.
    Collapses to zero when the curtain is off (reduced motion), so the page
    never opens on a screen of nothing. */}
<div
  aria-hidden="true"
  className="w-full h-[100svh] data-[curtain=off]:h-0"
/>
```

`data-[curtain=off]:h-0` will not work as written — Tailwind variants read the
attribute on the **element itself**, not an ancestor. Either put the flag on the
spacer from the curtain effect, or use an arbitrary variant that reads the root:
`[html[data-curtain=off]_&]:h-0`. Verify whichever you choose actually collapses
the spacer with reduced motion enabled; do not assume.

The scrub already ends at `+=${window.innerHeight}` (`:178`), which now lines up
exactly with the spacer, so at the moment the leaves finish travelling the hero's
top edge is at the top of the viewport. Keep the `main` opacity ramp at progress
`0.8 → 1.0` (`:202-209`) — because it is on the same scrubbed timeline it reverses
on the way back up for free.

### Verify item 1

At 1440×900, with `sessionStorage` cleared and reduced motion off:

- On load at `scrollY 0`: both leaves fill the screen, one continuous orange
  `NEEL PATEL` across the seam, no orange panel anywhere. Confirm by sweeping
  every element for a `background-color` of `rgb(246, 124, 41)` with an area over
  200×200 — there must be zero hits.
- At `scrollY 500`: leaves parted, and what shows in the gap is the hero, not an
  orange field.
- At `scrollY ≈ innerHeight`: leaves fully off-screen, `main` opacity `1`, and
  `document.querySelector('#hero').getBoundingClientRect().top` is within ±4px of `0`.
- Scroll back to `scrollY 0`: the leaves are **back**, closed, wordmark reunited.
- At `scrollY ≈ innerHeight`, a `document.elementFromPoint(720, 450)` must return
  a hero element, never the curtain root.

---

## ITEM 2 — One background grid, smaller cells

**Files:** `src/app/globals.css`, three section components

`grid-overlay` is painted four times. `src/app/layout.tsx:80` has the correct
global one (`fixed inset-0`, full opacity). Three sections then paint their own
`absolute inset-0` copies on top:

- `src/components/sections/SelectedWorks.tsx:195` — `opacity-40`
- `src/components/sections/Gallery.tsx:160` — `opacity-30`
- `src/components/sections/Toolkit.tsx:227` — `opacity-30`

Because the global layer is `fixed` (locked to the viewport) and the section
layers are `absolute` (locked to the document), their 44px lattices drift out of
phase as you scroll. That is the doubled, misaligned grid in the screenshot.

**Delete all three section-level overlay divs.** Keep only
`src/app/layout.tsx:80`. Each deleted div is the complete
`<div className="absolute inset-0 pointer-events-none grid-overlay opacity-NN z-0" aria-hidden="true" />`
line and its `{/* ... grid background */}` comment.

Then make the cells smaller — `src/app/globals.css:185`:

```css
background-size: 28px 28px;
```

Leave the line colour (`rgba(250, 244, 232, 0.06)`), the `gridTravel 20s`
animation and the `.grid-off` kill-switch (`:194-199`) exactly as they are.

### Verify item 2

`document.querySelectorAll('.grid-overlay').length` must be exactly `1`. Its
computed `position` must be `fixed` and `background-size` `28px 28px`. Screenshot
the Selected Works and Toolkit sections mid-scroll and confirm a single even
lattice with no seam or moiré.

---

## ITEM 3 — Timeline rail: never pause, uniform height, hover grow

**File:** `src/components/sections/SelectedWorks.tsx`

### 3a. Stop pausing on hover

`SelectedWorks.tsx:274` reads:

```
prefersReducedMotion ? '' : 'animate-marquee-slow hover:[animation-play-state:paused]'
```

Delete `hover:[animation-play-state:paused]`. The rail must never stop. Keep the
`prefersReducedMotion` ternary — with reduced motion there is still no animation
at all, and the global `@media (prefers-reduced-motion: reduce)` block in
`globals.css:269-281` still pauses everything as a backstop.

### 3b. Uniform card height, width derived from aspect

`MarqueeReelCard` (`:17-70`) is a fixed **width** (`w-80 md:w-96`, `:28`) with a
per-aspect `aspect-[...]` class (`:18-25`), so every aspect gets a different
height and the rail looks ragged.

Invert it: **fix the height, derive the width.** The 4:3 card is the reference and
must not change size. It is currently `w-96` = 384px wide, so its height is
`384 × 3/4` = **288px**. That is the rail height for every card.

Replace the `aspectClass` logic with a numeric ratio and drive the box off it:

```tsx
const RAIL_H = 288; // px — the 4:3 reference card's current height (384 × 3/4)

const RATIO: Record<string, number> = {
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
  '3:4': 3 / 4,
  '9:16': 9 / 16,
};

const ratio = RATIO[work.aspect] ?? 16 / 9;
```

The outer card wrapper loses `w-80 md:w-96` and instead gets its width from the
ratio; the media box becomes a fixed-height, ratio-width block:

```tsx
<div
  className="flex-shrink-0 flex flex-col gap-3 group select-none"
  style={{ width: `${Math.round(RAIL_H * ratio)}px` }}
>
  <div className="relative rounded-lg overflow-hidden border border-line-2 ...">
    <div className="relative w-full" style={{ height: `${RAIL_H}px` }}>
```

`3:4` is not decorative — six works in `portfolio.generated.ts` use it. Handle
all five keys. Resulting widths: 16:9 → 512px, 4:3 → 384px, 1:1 → 288px,
3:4 → 216px, 9:16 → 162px. Every card is 288px tall.

The `animate-marquee-slow` keyframe translates `-50%`, which stays seamless at any
card width because the duplicated set (`:281-284`) is still there. Do not touch
the 75s duration.

### 3c. Hover grows the card without disturbing the rail

`:29` already has `group-hover:scale-[1.02]` on the **inner** wrapper. That is the
correct place — an inner transform cannot affect the marquee's own transform.
Raise it to `group-hover:scale-[1.06]` and add `group-hover:z-20` plus
`relative` so a grown card paints above its neighbours.

The scale will be clipped by the rail's `overflow-hidden` (`:271`) unless there is
room. `288 × 0.06 / 2` ≈ 9px of vertical bleed per side, so bump the rail's `py-4`
to `py-8`. Do **not** try `overflow-x-hidden` with `overflow-y-visible` — the CSS
spec forces the visible axis to `auto` and you get a stray scrollbar.

Because the rail keeps moving and `:hover` is evaluated per frame by the browser,
holding the cursor still makes each card swell as it arrives and relax as it
leaves. That is the requested behaviour and it needs no JS.

### Verify item 3

- `getComputedStyle(rail).animationPlayState` is `running`, and stays `running`
  while the cursor sits over a card.
- Every `.flex-shrink-0` media box in the rail reports `height` `288px`; widths
  vary by aspect and match the table above.
- Hover one card: its inner wrapper's computed transform is `matrix(1.06, 0, 0, 1.06, …)`,
  and the rail's own transform keeps advancing across two samples 400ms apart.
- Rail `scrollHeight` shows no clipping of the grown card.

---

## ITEM 4 — Conroy: real deck-opens, hover autoplay, kill the hover glitch

**Files:** `src/components/sections/SelectedWorks.tsx`, `src/app/globals.css`,
`src/data/content.ts`

### 4a. Fix the hover glitch — this is the actual bug

`globals.css:212-226`. At rest a card is
`translate3d(var(--card-x), var(--card-y), 0) rotate(var(--card-angle))`. On
hover it becomes `translate3d(var(--card-x), -36px, 0) rotate(0deg) scale(1.08)`.

Hit-testing follows transforms. So hovering a fanned card **straightens and lifts
it out from under the cursor**, `:hover` drops, the card snaps back under the
cursor, `:hover` re-fires — a feedback oscillation. That is the "glitches" and
the "hard to hover" in one mechanism.

Fix: **the element that owns the fan transform must never move on hover.** Keep
the `button`'s transform fixed at its fan position and animate a new inner
wrapper instead.

```
button.playing-card-fan-item   ← fan transform ONLY. Never changes. Stable hit area.
  └ div.playing-card-lift      ← lift + scale on hover. Purely visual.
      └ media + caption
```

```css
.playing-card-fan-item {
  transform: translate3d(var(--card-x), var(--card-y), 0) rotate(var(--card-angle));
  transform-origin: 50% 120%;
  transition: z-index 0ms;
}

.playing-card-lift {
  transform: translate3d(0, 0, 0) scale(1);
  transition:
    transform 420ms cubic-bezier(0.65, 0.05, 0.36, 1),
    box-shadow 420ms cubic-bezier(0.65, 0.05, 0.36, 1),
    border-color 420ms cubic-bezier(0.65, 0.05, 0.36, 1);
  box-shadow: 0 15px 30px -8px rgba(0, 0, 0, 0.7);
}

.playing-card-fan-item:hover .playing-card-lift,
.playing-card-fan-item:focus-visible .playing-card-lift {
  transform: translate3d(0, -34px, 0) scale(1.08);
  box-shadow: 0 25px 40px -10px rgba(0, 0, 0, 0.9), 0 0 25px rgba(246, 124, 41, 0.3);
  border-color: rgba(246, 124, 41, 0.8);
}
```

`420ms` with `EASE.io` (`cubic-bezier(0.65, 0.05, 0.36, 1)`) replaces the 280ms
`EASE.out`. `EASE.io` eases both directions, which is what a reversible hover
needs — the current `EASE.out` snaps on the way out. Move `border-radius`,
`overflow-hidden` and `border` onto `.playing-card-lift` so the visual chrome
travels with the lift.

Raise the hovered card with `z-index` on the **button** (`:hover { z-index: 60 }`)
— that is not a transform, so it does not move the hit area.

### 4b. The deck actually opens

`SelectedWorks.tsx:334-379` renders the nine cards permanently fanned. The ask is
a stacked deck that opens.

Add `const [deckOpen, setDeckOpen] = useState(false);` and gate the fan offsets on
it. When closed, every card sits at the same place with a hair of rotation, like a
squared deck:

```tsx
const angle = deckOpen ? (FAN_ANGLES[idx] ?? 0) : (idx - 4) * 0.8;
const xOffset = deckOpen ? (idx - 4) * 68 : (idx - 4) * 1.5;
const yOffset = deckOpen ? (FAN_Y_OFFSETS[idx] ?? 0) : 0;
```

Open it on scroll-into-view with a stagger so it reads as a deal, not a snap. One
`ScrollTrigger` on the fan container inside the existing `gsap.context` at
`:124-182`, `start: 'top 75%'`, `once: true`, `onEnter: () => setDeckOpen(true)`.
Add a per-card `transition-delay` of `idx * 45ms` on `.playing-card-fan-item`
via the same inline `style` object that already carries the custom properties, so
the cards splay outward in sequence. The card transform transition needs a
duration for this to be visible — give `.playing-card-fan-item` its own
`transition: transform 520ms cubic-bezier(0.65, 0.05, 0.36, 1)`, which is safe
because the fan transform no longer changes on hover.

Keep the `!prefersReducedMotion` guard at `:335` and the mobile/reduced-motion
fallback grid at `:381-412` exactly as they are. With reduced motion there is no
deck and no animation.

### 4c. Autoplay on hover

The fan cards are poster-only. Mount a muted autoplay iframe on hover, the same
way `MarqueeReelCard:40-46` does, but **only while hovered** — nine permanent
iframes would wreck the page.

Per-card `onMouseEnter`/`onMouseLeave` (and `onFocus`/`onBlur`) sets a
`hoveredIdx` state; when `hoveredIdx === idx`, render:

```tsx
<iframe
  src={`https://player.vimeo.com/video/${reel.id}?background=1&autoplay=1&loop=1&muted=1&playsinline=1&autopause=0&dnt=1&quality=540p`}
  title={reel.title}
  className="absolute inset-0 w-full h-full border-0 pointer-events-none z-10"
  allow="autoplay; fullscreen; picture-in-picture"
  loading="lazy"
/>
```

The poster `<Image>` stays mounted behind it as the fallback — never swap the
poster out, layer the iframe over it. `pointer-events-none` on the iframe is
mandatory or it eats the hover that keeps it alive.

### 4d. Fancier copy

`WORKS_COPY.conroyHeading` / `conroyHint` / `conroyIntro` are already in
`content.ts:79-81` and are **gate-locked — do not edit them**. Add new keys
alongside:

```ts
conroyScript: "one shoot, ten cuts",
conroyStatA: "1 HERO FILM",
conroyStatB: "9 VERTICAL CUTS",
conroyStatC: "ONE GRADE",
conroyDeckHint: "HOVER A CARD TO PLAY",
```

Render `conroyScript` as a `font-script text-terracotta` accent above the h3 in
the header block at `:297-303` (mirror the pattern at
`Gallery.tsx:178-180`), and the three stats as a mono `·`-separated row under the
intro paragraph. Put `conroyDeckHint` under the fan as a small
`font-mono text-label text-muted` line.

### Verify item 4

- Park the cursor on the 5th card for 3 seconds and sample the hovered card's
  computed transform four times 500ms apart: all four samples identical. Any
  variation means the oscillation is still there.
- `.playing-card-fan-item` computed transform is byte-identical before and after
  hover; only `.playing-card-lift` changes.
- Before the fan scrolls into view, the nine cards' `--card-x` values are within
  ±6px of each other; after, they span ~544px.
- Hover a card → exactly one `iframe[src*="player.vimeo.com"]` exists inside the
  fan. Move off → zero.
- `document.elementFromPoint` at the visual centre of each of the nine cards
  returns that card's own button, not a neighbour.

---

## ITEM 5 — Toolkit: band on hover only, smooth colour, animated description

**File:** `src/components/sections/Toolkit.tsx`

The orange band is currently parked mid-viewport at all times, driven by scroll
position (`:86-159`), and the active row's colours are swapped by adding classes
and writing inline `style.color` (`:116-158`) — instant, no transition. The ask:
no band at rest; hovering a row turns **that row** orange and opens its
description, with a smooth colour change and eased motion.

This lets you **delete a large amount of machinery.** Do it — the simpler version
is also the correct one.

### 5a. Move the band inside the row

Stop positioning a shared band with JS. Give each row its own band as a child, so
it matches that row's box automatically — including when the row grows to fit its
description. No measurement, no `ScrollTrigger`, no drift.

Delete:

- the shared band div (`:261-265`) and `highlightBandRef` (`:17`)
- `syncHighlight` and `updateMeasurements` and the `CachedRow` interface (`:58-159`)
- `updateMeasurementsRef` / `syncHighlightRef` (`:24-25`) and the whole
  `useEffect` at `:219-222`
- the `ScrollTrigger.create` at `:170-176` and the refresh listener at
  `:166-168` **with** its remover at `:213` (rule 11 — remove the pair together)
- `rowRefs` (`:18`) and the `ref` callback at `:274-276`, if nothing else needs them

Keep the header trigger (`:35-52`) and the marquee band block (`:183-209`)
untouched.

Inside each row, as the first child:

```tsx
{/* Row-local highlight. Sized by the row itself, so it always covers the
    full box including the expanded description — nothing to measure. */}
<div
  aria-hidden="true"
  className="absolute inset-0 bg-terracotta opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-io pointer-events-none"
/>
```

The row (`:288`) needs `relative` and its content needs to sit above the band —
wrap the existing inner content in a `<div className="relative z-10">`, or give
the band `-z-0` and the content `z-10`. The row already has `group`.

### 5b. Colour changes come from `group-hover:` variants, not JS

Tailwind emits `group-hover:` variants **after** unprefixed utilities in the
stylesheet, so `group-hover:` wins on hover without any inline-style escape
hatch. Every colour swap becomes declarative:

- row (`:288`) — add `group-hover:text-ground group-hover:font-bold`, and change
  `transition-[opacity,color]` to `transition-[color] duration-300`
- `.row-num` (`:292`) — **delete `group-hover:text-terracotta`**, which is the
  reason the number went invisible on the orange band. Add
  `group-hover:text-ground`, keep `transition-colors duration-300`.
- `.row-desc` (`:300`) — replace `group-hover:text-cream` with
  `group-hover:text-ground/90`
- `.row-badge` (`:304`) — add `group-hover:text-ground/75 group-hover:font-bold`
  and `transition-colors duration-300`
- `.row-desc-full` (`:313`) — add `group-hover:text-ground/90`

Then delete the entire `rowRefs.current.forEach` colour block (`:116-158`). No
`classList` calls, no `style.color`, no `style.removeProperty`. Also delete the
per-row opacity dimming at `:122-123` — it existed only to point at the
scroll-active row, and it is why non-hovered rows currently read as faded.

`ease-io` already exists — `transitionTimingFunction.io` is defined at
`tailwind.config.ts:47` as `cubic-bezier(.65,.05,.36,1)`, so the class compiles as
written. No config change needed.

### 5c. The description opens with motion

`{isExpanded && (...)}` at `:310-318` is an instant mount. Animate it.

The wrapper at `:311` is already `overflow-hidden`, which is what makes this
tractable. Tween its `height` from `0` to its measured content height with GSAP
on the discrete hover event — `duration: 0.32, ease: EASE.io` — and animate the
inner paragraph's `opacity` and a small `y` alongside. Reverse on mouse-leave.
Rule 3 permits `height` here: this is a one-shot event tween, not a scrub. Rule 4
is satisfied because the measurement happens in the event handler.

Keep the existing `prefersReducedMotion` gate on `setExpandedIdx` (`:277-282`)
and the keyboard `onFocus`/`onBlur` path (`:283-284`) so the row still opens for
keyboard users. Note the focus path currently ignores reduced motion by design —
leave that asymmetry alone.

### Verify item 5

- Cursor nowhere near the list, at three different scroll positions: sweep every
  element inside the list container for `background-color: rgb(246, 124, 41)` —
  zero hits. No band at rest, ever.
- Hover row 5: exactly one band, its `getBoundingClientRect()` matches row 5's
  own rect to within 1px on all four edges, including after the description has
  finished opening.
- On that row, computed colours: `.row-num` is `rgb(19, 16, 12)`, `.row-title`
  is `rgb(19, 16, 12)`, `.row-badge` resolves to a dark value — none may be
  `rgb(246, 124, 41)` or `rgb(148, 138, 123)`.
- Sample `.row-num` colour 80ms after `mouseenter` and again at 400ms: the two
  differ, proving it interpolated rather than snapped.
- Non-hovered rows all report `opacity: 1`.
- `document.querySelectorAll('.skill-row').length === 15`.

---

## ITEM 6 — Services: "deliver" bigger than "WHAT I"

**File:** `src/components/sections/Services.tsx`

`Services.tsx:58-63`. The h2 is `text-huge`; the script span is `text-[1.12em]`,
which is barely larger than the lead. Make the script clearly dominant:

```tsx
<span className="inline-block font-script text-terracotta lowercase text-[1.95em] font-normal leading-[0.62] -my-[0.26em] ml-4 align-baseline select-none">
```

`1.95em` against `text-huge`'s `clamp(2.2rem, 6.5vw, 5.5rem)` puts "deliver"
around 107px at desktop against ~55px for "WHAT I". Ephesis has a small x-height
and long descenders, so the tighter `leading-[0.62]` and larger negative
`-my-[0.26em]` are needed to stop the line box from shoving the border-bottom of
the header block downward.

Check at 1440, 1024 and 390 that "deliver" does not collide with the intro
paragraph in the right-hand column or overflow the section's `px-6`. If it does at
390, add a `sm:` step rather than shrinking the desktop size.

Do **not** touch `SERVICES_COPY.titleLead` or `titleScript` in `content.ts`.

### Verify item 6

Measure both spans' `getBoundingClientRect()`. The script span's height must be at
least 1.6× the `SplitText` lead's height. The h2's bottom must stay above the
`border-b` of the header row. No horizontal overflow:
`document.documentElement.scrollWidth === clientWidth`.

---

## ITEM 7 — Contact: tighten the gap, stop the form overlap

**File:** `src/components/sections/Contact.tsx`

Two problems in the same heading, `Contact.tsx:162-171`.

### 7a. "something" overlaps the form

The script span (`:164-166`) is `lg:text-[1.85em]` inside a
`text-huge sm:text-mega` h2. At `lg`, `text-mega` resolves to about 184px, so the
script renders near 340px and blows straight out of its `lg:col-span-6` column
into the form card. The `relative z-10` on the span versus `relative z-10` on the
form column (`:237`) just decides which one paints on top; it does not stop the
collision.

Fix it in layout, not z-index. Bring the script down to something the column can
hold — `lg:text-[1.3em]` — and add `min-w-0` to the left column (`:161`) so it
cannot be pushed wider than its grid track. Confirm by measurement, not by eye:
the script span's `right` must be less than the form card's `left`.

### 7b. Close the gap before "WORTH WATCHING"

The dead space comes from the script's line box. `leading-[0.68]` with
`-my-[0.22em] lg:-my-[0.34em]` (`:164`) does not claw back enough at the larger
size, and then `headlineMega` is a `block` span (`:168-170`) starting a fresh
line.

With the script at `1.3em`, retune to `leading-[0.6]` and
`-my-[0.2em] lg:-my-[0.24em]`, and pull the mega block up with a small negative
margin — `className="block text-cream relative z-20 -mt-[0.06em]"`. Target: the
vertical gap between the script's baseline and the top of "WORTH WATCHING" should
match the gap between "LET'S CUT" and "something" to within ~8px.

Both `CONTACT_COPY` strings are gate-locked. Change classes only.

### Verify item 7

- Script span `right` < form card `left`. No overlap at 1440, 1280 and 1024.
- Gap between "something" and "WORTH WATCHING" is within 8px of the gap between
  "LET'S CUT" and "something".
- `document.documentElement.scrollWidth === clientWidth` at all three widths.
- The form's inputs are still hoverable and focusable:
  `document.elementFromPoint` at the Name input's centre returns the input.

---

## ITEM 8 — Subtle loop animations on text, site-wide

**Files:** `src/app/globals.css`, `tailwind.config.ts`, then applied across sections

Add a small vocabulary of always-on idle animations so headings breathe. **Subtle
is the whole point** — if you can see it as movement rather than feel it as life,
it is too strong.

Two keyframes in `tailwind.config.ts` alongside the existing ones (`:50-58`):

```ts
textFloat:   { '0%,100%': { transform: 'translate3d(0,0,0)' },
               '50%':     { transform: 'translate3d(0,-2px,0)' } },
textBreathe: { '0%,100%': { opacity: '1' },
               '50%':     { opacity: '.90' } },
```

and in `animation` (`:59-68`):

```ts
'text-float':   'textFloat 6.5s cubic-bezier(.4,0,.2,1) infinite',
'text-breathe': 'textBreathe 5.2s cubic-bezier(.4,0,.2,1) infinite',
```

Hard limits: `transform` and `opacity` only; amplitude ≤2px; opacity floor ≥0.88;
period ≥5s; no `will-change`.

Apply, with **different periods per element** so nothing pulses in lockstep — use
`[animation-duration:7.3s]` / `[animation-delay:-2.1s]` style overrides to
de-phase them:

- `Footer.tsx:126` — the `THANK YOU` h2 gets `animate-text-float`
- `Footer.tsx:120` — the script `Neel Patel` gets `animate-text-breathe`
- the section script accents: `SelectedWorks.tsx:212`, `Gallery.tsx:178`,
  `Services.tsx:60`, `Contact.tsx:164` — `animate-text-breathe`, each with its
  own duration override
- the `font-mono text-label text-terracotta` eyebrow labels — `animate-text-breathe`
  at a long period

Do **not** apply these to: anything inside `SplitText` (`.split-unit` spans are
already GSAP-driven and a competing CSS animation on the same transform will
fight it), the hero h1 (item 9 handles it), the marquee bands, the timecode, or
any button.

Reduced motion needs no new code — `globals.css:269-281` already sets
`animation-play-state: paused !important` on everything. Confirm it, don't
duplicate it.

### Verify item 8

- With reduced motion **off**: at least 8 elements report a non-`none` computed
  `animation-name` from this set, and their `animationDuration` values are not all
  equal.
- Sample `getBoundingClientRect().top` of the THANK YOU h2 twice, 1.6s apart:
  the delta is non-zero and under 4px.
- With reduced motion **on**: every one of those elements reports
  `animationPlayState: 'paused'`.
- No element gained a `will-change` declaration:
  `[...document.querySelectorAll('*')].filter(e => getComputedStyle(e).willChange !== 'auto').length` must not grow.

---

## ITEM 9 — Hero wordmark in a decorative face

**Files:** `public/fonts/`, `src/lib/fonts.ts`, `src/app/globals.css` or
`tailwind.config.ts`, `src/components/sections/Hero.tsx`

`Hero.tsx:240-245` sets `NEEL PATEL` in `font-display font-black` — Fraunces at
900. Reads plain and heavy. It wants a proper decorative display face.

**Preferred path — add one new self-hosted face.** The project self-hosts every
font as a `woff2` in `public/fonts/` registered through `next/font/local`
(`src/lib/fonts.ts`). Follow that exactly; do not reach for `next/font/google`,
which would add a build-time network fetch to a static export.

1. Put a single `woff2` in `public/fonts/`. Good fits for a cinematic editorial
   wordmark, in order: **Bodoni Moda** (extreme thick/thin, very filmic),
   **Playfair Display** (high contrast, safe), **Anton** (single-weight condensed
   poster face). Latin subset only — keep it under ~40KB, in line with the
   existing files.
2. Register it in `src/lib/fonts.ts` following the `fraunces` block (`:3-9`)
   verbatim in shape: `variable: '--font-display-alt'`, `display: 'swap'`, correct
   `weight`.
3. Add the variable to the `<html>` className list in `src/app/layout.tsx:67`.
   **Miss this and the font silently never loads** — every other face is wired
   through that list.
4. Add `displayAlt: ['var(--font-display-alt)', 'Georgia', 'serif']` to
   `fontFamily` in `tailwind.config.ts:24-31`.
5. On `Hero.tsx:242`, swap `font-display font-black` for
   `font-displayAlt` plus whatever weight the face actually ships. If it is a
   single-weight face, **drop `font-black`** — asking for 900 from a 400-only file
   makes the browser synthesise a fake bold and it looks smeared.
6. Retune only what the new metrics require: `tracking-tight` and
   `leading-[0.98]` are tuned for Fraunces. A high-contrast didone usually wants
   looser tracking; a condensed face wants tighter. Keep `text-mega`.

**Fallback, if the environment cannot fetch a font file.** Do not fake it and do
not leave item 9 half-done — say so explicitly in your report, then use the
faces already on disk: set the wordmark in `font-serif` (Instrument Serif, the
high-contrast editorial face at `fonts.ts:11-26`) with `font-normal`
`tracking-[-0.01em]`, and keep the Fraunces `WONK` treatment
(`globals.css:126-128`) on a single letter for accent. That is a genuinely
different, less plain silhouette using zero new assets.

`SplitText` wraps each character in nested `inline-block` spans, so the h1's
height is `lines × line-height`. `NEEL PATEL` wraps to two lines in the
`lg:col-span-7` column. A wider face may wrap differently — recheck the clearance
below the h1 after switching.

### Verify item 9

- `getComputedStyle(h1).fontFamily` names the new face first, and
  `document.fonts.check('1em "<Family>"')` returns `true`.
- The h1's rendered width changes measurably versus Fraunces at the same
  `text-mega` — proving the face actually applied rather than falling through to
  Georgia.
- Vertical clearance between the h1's ink bottom and the role line stays ≥32px at
  1440×900, 1280×800 and 390×844. Measure with `offsetTop`/`offsetHeight`, at
  `scrollY` pinned to the hero, **not** with `getBoundingClientRect()` mid-scroll —
  the role line carries a scroll-scrubbed transform and a rect read at the wrong
  scroll position will report a fake number.
- No horizontal overflow at 390px.

---

## MEASUREMENT DISCIPLINE (read before writing any verification)

These two traps produced confidently wrong numbers in round 2. Both are avoidable.

**Lenis overrides `window.scrollTo`.** A single `scrollTo` call gets reverted by
Lenis's rAF loop before you measure. Re-assert it in a loop — 12–16 iterations at
110ms — then wait ~600ms for the scrub to settle, and only then read.

**`getBoundingClientRect()` returns the *visual* box; `offsetTop`/`offsetHeight`
return the *layout* box.** Elements under a scroll-scrubbed transform have a rect
that reflects the scrub, not the layout. When you want layout clearance, use
`offsetTop`. When you want what the user sees, use the rect — and pin the scroll
first. Report which one you used.

**Verify the probe itself.** Building a probe element with Tailwind arbitrary
classes and reading its `fontSize` will report `16px`, because Tailwind never
compiled a class that exists only in your injected string. Set such values via
inline `style` and sanity-check the probe reports a plausible number before you
trust anything downstream of it.

---

## REPORT FORMAT

Per item: files touched, what changed, the two gate results verbatim, and the
verification numbers with the method used to get them (`offsetTop` vs `rect`, and
the scroll position). If a check fails, say so plainly and stop — a reported
failure is more useful than a passing claim that does not survive re-measurement.
