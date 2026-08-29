# ANTIGRAVITY FIX PROMPT — ROUND 4

12 requested changes, gathered from a live review of the deployed site.

**Execution contract: ONE ITEM PER TURN.** Do ITEM 1, run both gates, report, stop.
Wait to be told to continue. Do not batch items. Do not "while I'm in here" fix
anything that is not in the item you were told to do.

Every line/anchor below was measured against the working tree at the time this doc
was written. **Re-open each file and re-confirm the anchor before you edit it** —
line numbers shift as items land.

Baseline at time of writing: `npm run verify-content` → 15 PASSED / 0 FAILED.

---

## GROUND RULES

1. **Content gate is absolute.** `src/data/content.ts` is diffed against
   `tests/content.lock.json` by `scripts/verify-content.mjs`. You may **ADD** new
   keys. You may **NEVER** edit, reword, reorder-away, or delete an existing string,
   id, title, blurb, skill, or service. 52 unique video ids / 53 placements /
   16 sections / 15 skills / 6 services are asserted by count.

2. **Both gates must pass after every item, with the output pasted into your report:**
   - `npm run verify-content` → must read `15 PASSED / 0 FAILED`
   - `npm run build` → must read `61/61` static pages and `Exporting (3/3)`

3. **`next.config` has `eslint.ignoreDuringBuilds: false` and
   `typescript.ignoreBuildErrors: false`.** An unused variable, an unused import, an
   unused `useRef`, or an unused state setter is a **hard build failure**. Several
   items below delete UI — when you delete UI you must also delete the state, refs,
   effects, listeners and imports that only existed to feed it. This is the single
   most likely way to fail a gate in this round. Check every item's "dead code" note.

4. **`output: 'export'`.** There is no server and no API route. Nothing you write may
   depend on one. `images: { unoptimized: true }`, so `next/image` does not resize —
   ship assets already at the right size.

5. **`assets/` is NOT served.** Only `public/` is. Anything referenced by a URL must
   live under `public/`.

6. **Tailwind class names are literal.** `animation` keys in `tailwind.config.ts` are
   camelCase → the class is `animate-spinSlow`, **not** `animate-spin-slow`. Verify
   any animation class you write actually exists in the config. (ITEM 1 fixes a live
   instance of exactly this bug.)

7. **The `marquee` keyframe translates `-50%`.** Any element carrying
   `animate-marquee` / `animate-marquee-slow` must contain **exactly two identical
   copies** of its item set or the loop will visibly jump. If you need to offset a
   marquee row horizontally, use **margin**, never `translate-x-*` — the keyframe owns
   `transform` on that element and a Tailwind translate utility will be overwritten.

8. **Never put a CSS `transform` or `opacity` animation on an element GSAP is already
   tweening**, and never on `.split-unit` (SplitText animates those spans'
   `opacity`/`y` directly). CSS loops must target a different element or a
   non-conflicting property (`background-position`, `color`, `filter`).

9. **`prefers-reduced-motion` guards stay.** Every existing reduced-motion branch and
   `motion-reduce:` utility must survive your edit. New motion you add must be gated
   too.

10. **Use existing tokens.** Colours from `tailwind.config.ts` / `:root` in
    `globals.css`. Easings and durations from `src/lib/motion.ts` (`EASE.out/io/soft`,
    `DUR.fast .18 / base .42 / slow .80 / epic 1.40`) or the
    `transitionTimingFunction` keys `out/io/soft`. Do not introduce new hex values or
    ad-hoc cubic-beziers unless the item says to.

11. **`wine` and `indigo` are FILL-ONLY colours.** Never use them as text colour.

12. **Sizing:** prefer `svh`/`dvh` over `100vh`.

13. **Do not touch `git`.** No commits, no branches, no stashing. Leave the working
    tree dirty; the user commits.

14. **If an item is impossible as specified, stop and say so with the measurement that
    proves it.** Do not silently substitute a different change. Do not claim a visual
    result you did not observe.

---

## MEASUREMENT DISCIPLINE

Where an item names a number (a gap in px, a duration in ms, a contrast ratio, an
aspect ratio), you are expected to **measure it in a real browser**, not to eyeball a
screenshot. Use `npm run dev`, then in DevTools:

- geometry → `document.querySelector(sel).getBoundingClientRect()`
- computed values → `getComputedStyle(el).transitionDuration` etc.
- SVG text length → `document.querySelector('text').getComputedTextLength()`
- viewports to check every visual item at: **390×844**, **768×1024**, **1280×800**,
  **1440×900**
- for anything about video loading: DevTools → Network → throttle to **Fast 4G** and
  **disable cache**, then reload. A white flash is invisible on localhost at full
  speed.

If a number you measured disagrees with a number in this doc, **report the discrepancy**
and use your measurement.

---

## ITEM 1 — Curtain: orange ground, dark type, name + badge only, real font, badge bug

**File:** `src/components/curtain/Curtain.tsx` (266 lines)
**Also:** `src/lib/fonts.ts`, `src/app/layout.tsx`, `tailwind.config.ts`,
`public/fonts/`, `src/app/globals.css`

The first thing a visitor sees is the two-leaf curtain. It is currently dark brown
(`bg-ground`) with terracotta type and is cluttered with five stacked blocks of
metadata. The reference the user supplied is the inverse and far emptier: **black-brown
type on a flat orange field, with only two things on screen — the name, and the
rotating scroll badge.**

### 1a. Flip the colours

Two leaves at `Curtain.tsx:182-185` and `:208-211`, both `bg-ground` → **`bg-terracotta`**.
Both wordmark halves at `:190-194` and `:216-220` are `text-terracotta` → **`text-ground`**.
Badge fills/strokes at `:234` (`fill-terracotta`) and `:241` (`text-terracotta`) →
**`fill-ground` / `text-ground`**.

Measured contrast, `#13100c` on `#f67c29` = **7.08:1** — passes AA and AAA-large. Do not
substitute `cream` (2.45:1, fails).

### 1b. Strip everything except the name and the badge

Delete:
- the **top-leaf metadata row** `:198-204` (the `✦ 2026 EDITION` / `AHMEDABAD, INDIA` bar)
- the **000/100 counter block** `:246-251`
- the **status + subtagline block** `:253-260` (`LOADING REEL ASSETS` / `scrollBadgeStatic`
  / `subTagline`)

Keep: both wordmark halves, and the badge `:226-243` (svg ring + `↓`).

**DEAD CODE YOU MUST ALSO DELETE (ground rule 3 — this will fail the build otherwise):**
- `const [counter, setCounter] = useState(0);` — `:13`
- `const [preloaderDone, setPreloaderDone] = useState(false);` — `:14`
- `const curtainContentRef = useRef<HTMLDivElement>(null);` — `:18`
- the whole preloader signal machinery in the first effect — `:41-106` (`currentVal`,
  `startTime`, `WEIGHTS`, `Signal`, `settled`, `BASELINE`, `targetVal`, `settle`,
  `onFonts`, `poster`, `onPoster`, the `DOMContentLoaded` listener, `animId`, `tick`)
- the `cancelAnimationFrame(animId)` line in that effect's cleanup — `:120`
- the `curtainContentRef` opacity tween — `:151-153`

After this, the first effect should contain only: the reduced-motion branch (`:23-37`,
minus the `main` opacity line — see ITEM 2), `setMounted(true)`, and the `pageshow`
handler (`:109-122` — also see ITEM 2). Keep the imports that are still used; remove any
that are not. `CURTAIN` stays imported (still used for `wordmark` and `scrollBadgePath`).

Leave `CURTAIN.edition`, `topLabelRight`, `scrollBadgeStatic`, `subTagline` **in
`content.ts`** — they are gate-locked strings. Unrendered is fine; deleted is a gate
failure.

### 1c. Fix the badge — two separate real bugs

**Bug A — the badge does not rotate at all.** `Curtain.tsx:226` says
`animate-spin-slow`. That class does not exist. `tailwind.config.ts:54` and `:68` define
the key as **`spinSlow`**, so the class is **`animate-spinSlow`** (see the correct usage
at `Hero.tsx:372`). Change it.

**Bug B — "it shows three scroll and some empty space left".** `CURTAIN.scrollBadgePath`
is `"SCROLL · SCROLL · SCROLL · "`. The circle at `:231` is `r=36`, so the path length is
**2π×36 = 226.19 user units**. At `text-[9px]` with `tracking-[0.2em]` that string
advances to less than 226.19, leaving a visible unfilled arc.

Fix by making the text fill the path exactly instead of by editing the (gate-locked)
string. On the `<textPath>` at `:235-237`:

```tsx
<textPath
  href="#curtain-badge-path"
  startOffset="0%"
  textLength={226.19}
  lengthAdjust="spacing"
>
```

and **remove `tracking-[0.2em]`** from the `<text>` className at `:234` — `textLength`
now owns the letter spacing, and leaving the tracking in place fights it.

Use `lengthAdjust="spacing"`, **not** `"spacingAndGlyphs"` — the latter horizontally
scales the glyphs and will distort them.

**Then verify it actually worked**, because `textLength` on `<textPath>` is not
universally honoured. In the browser, run
`document.querySelector('#curtain-badge-path')` and
`document.querySelector('.fill-ground')?.getComputedTextLength()` (or select the `<text>`
node) and confirm the returned length is within 1 unit of 226.19, **and** visually
confirm the ring has no gap. If the browser ignores `textLength`, fall back to an
explicit measured letter-spacing: read `getComputedTextLength()` with tracking removed,
compute `(226.19 − measured) / 26` (26 = character count of the string), and set that as
an explicit `letterSpacing` in user units on the `<text>`. Report which path you took
and the final measured length.

### 1d. Use the downloaded font for the curtain wordmark

The user placed a font family in `Fonts/` at the repo root. Verified facts:

- Files: `Fonts/MBF Taurian.otf` (26,048 B) and `Fonts/MBF Taurian.ttf` (67,696 B)
- Family name in the name table: **MBF Taurian** (MoonBandit, 2020)
- **213 mapped codepoints.** Full coverage of `A–Z`, `a–z`, `0–9`, space, and
  `. , : ; & ! ? - / ( ) ' "`, em-dash, middle dot, ampersand. Safe for headings.
- **Single style. There is no weight axis.** Register it at `weight: '400'` and
  **never apply `font-bold` / `font-black` / `font-variation-wonk` to it** — synthetic
  bold smears a high-contrast decorative face.
- The original filename contains a space. **Copy it** to `public/fonts/mbf-taurian.otf`
  (keep the source in `Fonts/` untouched) and reference the copy.

Steps:

1. Copy `Fonts/MBF Taurian.otf` → `public/fonts/mbf-taurian.otf`.
2. In `src/lib/fonts.ts`, add a block modelled on the `bodoniModa` block at `:11-17`:
   ```ts
   export const mbfTaurian = localFont({
     src: '../../public/fonts/mbf-taurian.otf',
     variable: '--font-taurian',
     display: 'swap',
     weight: '400',
     style: 'normal',
   });
   ```
3. In `tailwind.config.ts` `fontFamily` (`:24-31`), add:
   `taurian: ['var(--font-taurian)', 'Georgia', 'serif'],`
4. **In `src/app/layout.tsx`: import `mbfTaurian` (`:3-10`) AND append
   `${mbfTaurian.variable}` to the `<html>` className list at `:68`.** If you skip the
   className list the CSS variable is never defined and the font silently never loads
   while everything still builds — this is the standard failure mode for this repo.
5. On both wordmark halves (`:191`, `:217`) swap `font-display font-black` →
   **`font-taurian`**, and drop `font-variation-wonk` (Fraunces-only). Keep
   `text-[clamp(3.4rem,12vw,10.5rem)] uppercase leading-[0.8] whitespace-nowrap`.
   **Re-tune `tracking-tighter`** — it was set for Fraunces; Taurian has different
   sidebearings. Check at 390 and 1440 that "NEEL PATEL" does not clip or overflow, and
   that the seam-split still lands mid-glyph on both leaves.

### 1e. Kill the dark first frame

`html`/`body` paint `var(--ground)` (`globals.css:120`, `layout.tsx:76`) and the curtain
only renders after `mounted` (`Curtain.tsx:174`, portal needs the DOM). So with an orange
curtain there is now a **dark-brown frame before the orange leaves paint**. Fix it with a
server-rendered backdrop:

1. In `src/app/page.tsx`, next to the runway spacer at `:20-24`, add:
   ```tsx
   <div
     aria-hidden="true"
     data-curtain-backdrop
     className="fixed inset-0 bg-terracotta motion-reduce:hidden"
     style={{ zIndex: 'var(--z-curtain-base, 79)' }}
   />
   ```
2. In `Curtain.tsx`, inside the effect that runs on `mounted`, hide it once the real
   leaves exist:
   ```tsx
   const backdrop = document.querySelector('[data-curtain-backdrop]') as HTMLElement | null;
   if (backdrop) backdrop.style.display = 'none';
   ```
3. In `src/app/layout.tsx` `<head>` (`:70-73`), add a no-JS escape hatch:
   ```tsx
   <noscript>
     <style>{`[data-curtain-backdrop]{display:none!important}`}</style>
   </noscript>
   ```

Then **measure**: DevTools → Network → Fast 4G + disable cache → reload with a screen
recording or the Performance panel filmstrip. Report whether any frame is dark brown.

### Verify item 1

- [ ] `npm run verify-content` → 15 PASSED / 0 FAILED (paste output)
- [ ] `npm run build` → 61/61, Exporting (3/3) (paste output)
- [ ] Curtain field is `#f67c29`, wordmark is `#13100c`; measured contrast ≥ 7:1
- [ ] Only two things visible on the curtain: the wordmark and the rotating badge
- [ ] The badge **rotates** (confirm `animate-spinSlow` in the DOM, and that it moves)
- [ ] The ring text has **no gap**; paste your measured `getComputedTextLength()`
- [ ] `document.documentElement.style` shows `--font-taurian` resolving to a real URL;
      the wordmark's computed `font-family` contains the Taurian face
- [ ] "NEEL PATEL" does not clip or overflow at 390 / 768 / 1280 / 1440
- [ ] Throttled cold reload shows **no dark-brown frame** before the orange
- [ ] `prefers-reduced-motion: reduce` still bypasses the curtain entirely and still
      shows the site (no orange backdrop stuck on top)
- [ ] Scroll down then back up — the curtain still closes and reopens (fully reversible)

---

## ITEM 2 — Remove the page fade-in

**File:** `src/components/curtain/Curtain.tsx`

The site content behind the curtain currently ramps `opacity 0 → 1` over the last 20% of
the curtain scrub. The user's reasoning is correct: the leaves already cover and uncover
the page, so the fade is redundant and reads as a lag.

Delete all four places the `main` opacity is driven:

1. `:129-132` — the `siteElement` lookup + `gsap.set(siteElement, { opacity: 0 })`
2. `:155-163` — the `scrubTl.fromTo(siteElement, { opacity: 0 }, { opacity: 1, ... }, 0.8)` ramp
3. `:166-171` — the `gsap.set(siteElement, { opacity: 1 })` in the cleanup (keep
   `ctx.revert()`)
4. `:32-35` — `siteElement.style.opacity = '1'` in the reduced-motion branch

**DEAD CODE:** after (1)–(3), `siteElement` is unused in that effect — remove the
declaration, not just the uses. And the `pageshow` handler at `:109-122` exists **only**
to restore `main`'s opacity after a bfcache restore; with the fade gone it is dead —
remove the handler, the `window.addEventListener('pageshow', ...)` call at `:117`, and the
matching `removeEventListener` in the cleanup. If that leaves the first effect's cleanup
empty, drop the `return` entirely. Do not leave an unused `onPageShow` or an unused
`PageTransitionEvent` reference behind — either is a build failure.

The leaf `yPercent` tweens at `:145-150` are the whole reveal now. Do not touch them.

### Verify item 2

- [ ] `npm run verify-content` → 15 PASSED / 0 FAILED
- [ ] `npm run build` → 61/61, Exporting (3/3)
- [ ] `getComputedStyle(document.querySelector('main')).opacity === '1'` at scroll 0,
      mid-scrub, and after the curtain is fully open
- [ ] No `opacity` tween on `main` anywhere: `grep -n "querySelector('main')" src/components/curtain/Curtain.tsx` returns nothing
- [ ] The page is visible through the widening gap as the leaves separate, at full
      opacity, with no cross-fade
- [ ] Scroll up to re-close and down again — still reversible, no stuck opacity
- [ ] Navigate away and press Back (bfcache) — the site is visible, not blank

---

## ITEM 3 — Hero "NEEL PATEL" wordmark treatment

**File:** `src/components/sections/Hero.tsx`

Current, at `:240-245`:

```tsx
<h1 ref={wordmarkRef} className="font-displayAlt font-black text-mega text-cream uppercase tracking-normal leading-[0.98] pb-6 mb-10 drop-shadow-md">
  <SplitText text="NEEL PATEL" by="char" />
</h1>
```

The user wants: **a bold + cursive font pairing, a gradient, a per-letter accent colour,
and a loop animation — "just make it look cool."** That is a design brief, so you have
latitude on the specifics, but these constraints are not optional:

**Target composition** (this is the recommended shape; deviate only with a reason):
- Line 1 — **`NEEL`** in a heavy display face (`font-displayAlt`, or `font-taurian` from
  ITEM 1 if it reads better at `text-mega`), uppercase, with an animated gradient.
- Line 2 — **`Patel`** in `font-script` (Ephesis), `text-terracotta`, set larger
  (`text-[1.15em]`-ish) and pulled up so it tucks under `NEEL` with a slight overlap.
- **Per-letter accent:** pick 1–2 characters and give them `text-terracotta` (or `kraft`).
- **Loop:** animate the gradient's `background-position` continuously.

**Hard constraints:**

1. **`text-mega` carries `letterSpacing: -0.03em` and `lineHeight: 0.86`**
   (`tailwind.config.ts:33`). A cursive face at `-0.03em` will collide with itself. Set
   an explicit positive tracking on the script line.

2. **The gradient must not fight SplitText.** If you use
   `bg-gradient-to-r ... bg-clip-text text-transparent`, put it on the element that owns
   the background — `background-clip: text` on an ancestor does clip to descendant
   glyphs, so putting it on the `NEEL` wrapper span works. But an accent letter needs
   both `color` **and** `-webkit-text-fill-color` set to be visible through a
   transparent-fill ancestor. Verify each accent letter actually renders in its accent
   colour in the browser; do not assume.

3. **The loop animation may only touch `background-position`** (add a `gradientPan`
   keyframe + `animation` entry to `tailwind.config.ts`, and give the gradient element
   `bg-[length:220%_100%]` so there is something to pan). **It may NOT animate
   `transform` or `opacity`,** because:
   - GSAP already tweens `wordmarkRef` on entrance (`Hero.tsx:100-106`,
     `opacity`/`y`/`scale`) and on scroll parallax (`:157-168`, `y: 80`)
   - `SplitText` (`src/components/motion/SplitText.tsx`) tweens every `.split-unit`
     span's `opacity` and `y`
   A CSS transform loop on the `h1` or on `.split-unit` will be silently overwritten or
   will jitter. Put the loop on an inner span that GSAP does not own.

4. **Per-letter accent requires abandoning `SplitText` for the accented word** —
   `SplitText` generates uniform spans and gives you no per-index hook. Render those
   characters explicitly. If you drop `SplitText` from part of the `h1`, the entrance
   animation for that part disappears — either keep `SplitText` on `NEEL` and hand-render
   only the script line, or add an equivalent GSAP stagger for the hand-rendered chars.
   Whichever you pick, the `h1` must still animate in.

5. **Reduced motion:** wrap the loop in `motion-reduce:animate-none` (or a
   `@media (prefers-reduced-motion: reduce)` rule) so the gradient parks at a legible
   static position.

6. **`text-mega` maxes at `11.5rem` and the h1 already carries `pb-6 mb-10`** to clear
   descenders. A cursive second line adds descenders — re-check that the block below the
   h1 is not overlapped at every breakpoint.

7. The string **"NEEL PATEL"** is hard-coded here (not in `content.ts`), so splitting it
   across two lines is gate-safe. Keep the rendered text reading exactly "NEEL PATEL" —
   include an `sr-only` "Neel Patel" or an `aria-label` on the `h1` if the visual split
   makes the accessible name read oddly.

### Verify item 3

- [ ] `npm run verify-content` → 15 PASSED / 0 FAILED
- [ ] `npm run build` → 61/61, Exporting (3/3)
- [ ] Two typefaces are visibly in play; confirm both computed `font-family` values in
      DevTools
- [ ] A gradient is visible on the display word and its `background-position` is moving
      (check the computed value twice, a second apart)
- [ ] The accent letter(s) render in the accent colour — read the computed `color` **and**
      `-webkit-text-fill-color` of those specific spans
- [ ] Entrance animation still plays on load, and the scroll parallax still moves the
      wordmark (no jitter, no fighting)
- [ ] No CSS `transform`/`opacity` animation on the `h1` or on any `.split-unit`:
      confirm via computed `animation-name` on those nodes
- [ ] No clipping or overlap at 390 / 768 / 1280 / 1440 — the element below the `h1` is
      never touched by a descender
- [ ] Accessible name still reads "Neel Patel" (check the a11y tree)
- [ ] `prefers-reduced-motion: reduce` → gradient static, text legible

---

## ITEM 4 — Remove the scrollbar

**File:** `src/app/globals.css:136-150`

Currently a 6px custom scrollbar with a kraft thumb. The user wants it gone.

Replace the `::-webkit-scrollbar*` block with a hidden-but-scrollable treatment:

```css
/* Hidden scrollbar — scrolling still works, chrome is invisible */
html {
  scrollbar-width: none;          /* Firefox */
  -ms-overflow-style: none;       /* legacy Edge */
}
html::-webkit-scrollbar,
body::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;                  /* Chrome / Safari */
}
```

Notes:
- Put `scrollbar-width: none` on the existing `html` rule (`globals.css:53-62`) rather
  than adding a competing `html` block, if that reads cleaner.
- **Do not** use `overflow: hidden` on `html`/`body` — that would break scrolling and
  Lenis.
- **Leave the `.scrollbar-none` utility at `:272-279` alone.** It is applied to inner
  scroll containers and is a separate concern.
- Scrolling must still work with the wheel, trackpad, keyboard (`Space`, `PageDown`,
  arrows, `Home`/`End`), and drag-select-to-edge.

### Verify item 4

- [ ] `npm run verify-content` → 15 PASSED / 0 FAILED
- [ ] `npm run build` → 61/61, Exporting (3/3)
- [ ] No scrollbar visible at the right edge on `/`, `/projects/`, and a
      `/project/<slug>/` page, at 1280 and 1440
- [ ] `document.documentElement.clientWidth === window.innerWidth` (the gutter is
      genuinely gone, not just transparent)
- [ ] Wheel, trackpad, `Space`, `PageDown`, `End`, and arrow-key scrolling all still work
- [ ] Lenis smooth scroll still functions; no layout shift introduced by the reclaimed
      gutter width (check the hero and the Conroy fan at 1280)

---

## ITEM 5 — Timeline rail: two offset rows with different videos

**File:** `src/components/sections/SelectedWorks.tsx`

Current single rail, `:271-302`:
- `RAIL_LIMIT = 12` at `:119`, `railWorks` built at `:120-123`
- wrapper `:286` — `relative w-full overflow-hidden py-8 -mx-6 md:-mx-12 px-6 md:px-12`
- track `:287-291` — `flex gap-6 w-max ${prefersReducedMotion ? '' : 'animate-marquee-slow'}`
- primary set `:293-295`, duplicate set `:297-299` (the duplicate exists because the
  `marquee` keyframe translates `-50%`)

Make it **two rows, slightly offset from each other, with disjoint video sets.**

Split the 12 `railWorks` by parity so each row gets 6 and the visual variety stays
interleaved:

```tsx
const railRowA = railWorks.filter((_, i) => i % 2 === 0);  // 6 works
const railRowB = railWorks.filter((_, i) => i % 2 === 1);  // 6 works
```

Then render two tracks inside the existing wrapper. Requirements:

1. **Each row must contain exactly two identical copies of its own 6-item set** (ground
   rule 7). Row A renders `railRowA` twice; row B renders `railRowB` twice. Total iframes
   stays at 24 — unchanged from today, so no new video-loading budget.

2. **Disjoint sets.** No work id may appear in both rows. Assert this in the browser:
   collect the `title`/`src` of every card in row A and row B and confirm the
   intersection is empty. Report the two id lists.

3. **The offset.** Give row B a horizontal head-start so the rows don't march in
   lockstep, and a slightly different duration so they drift:
   - horizontal offset via **margin**, e.g. `ml-[-140px]` on the row-B track — **not**
     `translate-x-*`, which the `marquee` keyframe would overwrite (ground rule 7)
   - different speed via an arbitrary variant, e.g. `[animation-duration:88s]` on row B
     against the 75s of `animate-marquee-slow`
   - vertical separation via `mt-6` on the row-B wrapper (matches the existing `gap-6`
     rhythm)

4. **React keys must be unique across both rows and both copies.** Today's duplicate set
   already needs a disambiguating key; with four sets you need something like
   `` key={`railA1-${work.id}`} `` etc. A duplicate key here is a silent render bug.

5. **`prefersReducedMotion`** must gate the animation class on **both** tracks, exactly
   as `:288` does today.

6. `RAIL_H = 288` (`:17`) drives card height. Two rows plus `mt-6` roughly doubles the
   section height — check the sections above and below still breathe, and that the
   deck ScrollTrigger at `:192-199` (`start: 'top 75%'`, `once: true`) still fires.

7. Keep the negative-margin bleed (`-mx-6 md:-mx-12 px-6 md:px-12`) so the rows still
   run edge to edge.

### Verify item 5

- [ ] `npm run verify-content` → 15 PASSED / 0 FAILED
- [ ] `npm run build` → 61/61, Exporting (3/3)
- [ ] Two rows visible, moving, visibly offset both horizontally and in phase
- [ ] Paste the two id lists and confirm **zero** overlap
- [ ] Each row's track has exactly `2 × 6 = 12` children — count them in the DOM
- [ ] Watch each row through a full loop: **no jump or gap** at the wrap point
- [ ] Total iframes on the page is unchanged from before this item (count
      `document.querySelectorAll('iframe').length` before and after)
- [ ] No duplicate React key warnings in the console
- [ ] `prefers-reduced-motion: reduce` → both rows static
- [ ] Rows bleed to the viewport edges at 390 / 768 / 1280 / 1440; no horizontal page
      scrollbar appears

---

## ITEM 6 — Conroy campaign: faster hover, bigger deck, big type below, reel sub-line

**Files:** `src/app/globals.css`, `src/components/sections/SelectedWorks.tsx`,
`src/data/content.ts`

### 6a. Cards pop out faster on hover

`globals.css:223-237`. The hover response is owned by **`.playing-card-lift`**, not by
`.playing-card-fan-item`:

- `:225-228` — `transition: transform 420ms …, box-shadow 420ms …, border-color 420ms …`
  → **200ms** on all three
- `:234` — `transform: translate3d(0, -34px, 0) scale(1.08)` → increase the lift a little
  to match the snappier timing, e.g. `translate3d(0, -44px, 0) scale(1.10)`

Do **not** shorten `.playing-card-fan-item`'s `transform 520ms` at `:215` — that is the
one-time fan-open animation on scroll-in, not the hover. And note the inline
`transitionDelay: ${idx * 45}ms` at `SelectedWorks.tsx:390` is on the fan item (staggered
open), not on the lift, so it does not delay hover; leave it.

### 6b. Increase the overall size of the cards area

`SelectedWorks.tsx:362-432`:
- container `:367` — `h-[400px]` → **`h-[480px]`**
- card stack `:368` — `w-[160px] h-[284px]` → **`w-[190px] h-[338px]`**
  (190/338 = 0.5621 vs 9:16 = 0.5625 — verify the posters/iframes are not distorted)
- `xOffset` `:371` — `(idx - 4) * 68` → **`(idx - 4) * 78`**
- leave `FAN_ANGLES` (`:78`) and `FAN_Y_OFFSETS` (`:79`) as they are

Measured fit at 1280: 8 gaps × 78 + 190 = 814px of span; adding the 28° rotation bulge on
a 338-tall card gives roughly 950px total against ~1184px of inner shell width. It fits,
but **measure it** — check the leftmost and rightmost card's `getBoundingClientRect()`
against the container at 1280 **and** 1024, and confirm nothing is clipped by
`overflow-visible` boundaries or spills past the shell.

The mobile fallback grid at `:435-465` (`hidden sm:flex` on the fan) is unaffected — but
confirm it at 390.

### 6c. Big type in the empty space below the cards

Below the fan (near the `conroyDeckHint` line at `:426-430`) there is dead space. Fill it
with a **bold + cursive pairing** in large type — same recipe as the rest of the site:
a `font-script text-terracotta` line, then a heavy uppercase display line under it.

Add **new** keys to `WORKS_COPY` in `content.ts` (`:71-86`) — **append only, never edit an
existing key**:

```ts
conroyBigScript:  'ten cuts,',
conroyBigDisplay: 'ONE GRADE',
```

Render around `text-huge`/`text-mega`. Follow the existing script-inline pattern for
vertical rhythm — see `Services.tsx:60`
(`text-[1.95em] leading-[0.62] -my-[0.26em] ml-4`) — and keep `conroyDeckHint` where it
is. If you use `font-taurian` for the display line, drop `font-black` and
`font-variation-wonk` from it (ITEM 1d: single-weight face).

### 6d. A line under the Conroy showreel for the 9 clips

The hero film frame is at `:349-359`. Directly beneath it, add a short caption
(**4–9 words**) that introduces the nine vertical cuts in the fan below. New key,
appended to `WORKS_COPY`:

```ts
conroyReelsLead: 'Nine vertical cuts from the same grade',   // 6 words
```

Style it like the other supporting lines in this section — `font-mono text-label
text-muted tracking-widest uppercase`, or `font-sans text-cream/70`, whichever matches
the immediate neighbours. Count the words and report the count.

### Verify item 6

- [ ] `npm run verify-content` → 15 PASSED / 0 FAILED (proves the appended keys are safe)
- [ ] `npm run build` → 61/61, Exporting (3/3)
- [ ] Hover a card: `getComputedStyle(el.querySelector('.playing-card-lift')).transitionDuration`
      reads `0.2s` for all three properties; the pop feels immediate
- [ ] The fan-open stagger on scroll-in is **unchanged** (still 520ms with the 45ms/card
      delay)
- [ ] Card stack measures 190×338; posters and iframes are not stretched (compare
      rendered aspect to 0.5625)
- [ ] At 1280 and 1024: leftmost/rightmost card rects sit inside the container; nothing
      clipped, no horizontal page scroll
- [ ] The big script + display block renders below the cards, both typefaces confirmed
      via computed `font-family`, no overlap with `conroyDeckHint` or the next section
- [ ] The showreel sub-line renders under the hero frame; word count is 4–9 (state it)
- [ ] 390: mobile fallback grid still used, still correct
- [ ] `prefers-reduced-motion: reduce` → no hover lift jank; the fan is still readable

---

## ITEM 7 — Toolkit hover speed

**File:** `src/components/sections/Toolkit.tsx`

Every hover tween is currently 0.32s and every CSS colour transition is 300ms, which
reads sluggish on a list you sweep through.

GSAP handlers — `handleRowEnter` `:87-98`, `handleRowLeave` `:100-110`,
`handleRowFocus` `:112-121`, `handleRowBlur` `:123-131`:
- `duration: 0.32` → **`DUR.fast`** (0.18) in all four; keep `ease: EASE.io`
- the inner fade-out currently at `duration: 0.25` → **0.14**

CSS transitions:
- row div `:172-181` — `transition-[color] duration-300` → **`duration-150`**
- row-local band `:185-188` — `transition-colors duration-300 ease-io` → **`duration-150`**
- `.row-num` `:193`, `.row-title` `:196`, `.row-desc` `:201`, `.row-badge` `:205`,
  `.row-desc-full` `:225` — all `duration-300` → **`duration-150`**

Import `DUR` from `@/lib/motion` if it is not already imported, and use the token rather
than a bare `0.18`.

Keep the enter/leave symmetric — if leave stays slower than enter the list feels sticky
when you sweep back across it. And keep focus/blur matched to enter/leave so keyboard
users get the same timing.

### Verify item 7

- [ ] `npm run verify-content` → 15 PASSED / 0 FAILED
- [ ] `npm run build` → 61/61, Exporting (3/3)
- [ ] Sweep the mouse down all 15 rows quickly — each row responds immediately, nothing
      lags behind the cursor or queues up
- [ ] Computed `transition-duration` on `.row-num` / `.row-title` / `.row-desc` /
      `.row-badge` reads `0.15s`
- [ ] Tab through the rows — focus states appear at the same speed as hover
- [ ] All 15 skills and their descriptions still render verbatim (the content gate covers
      the strings; confirm visually that none are hidden or clipped by the faster tween)
- [ ] `prefers-reduced-motion: reduce` → still respected

---

## ITEM 8 — Make the contact form actually deliver to neelpatel00235@gmail.com

**File:** `src/components/sections/Contact.tsx`

**Read this whole item before you write code. There is a hard constraint here that you
cannot engineer around, and the correct deliverable includes telling the user what only
they can supply.**

`next.config` sets `output: 'export'`. There is **no server and no API route**. A static
page cannot send email itself. Delivery must go through a third-party form endpoint that
is configured, on that provider's side, to forward to `neelpatel00235@gmail.com`. That
configuration requires an account key that **only the user can create.**

Current state:
- `handleSubmit` `:120-145` POSTs to `https://formspree.io/f/mqaeavbl`
- the `<form>` `action` `:251` hard-codes the same URL a second time
- on a non-`ok` response it silently navigates to `mailto:` `:138-140`
- on a thrown error it navigates to a bare `mailto:` with **no message body** `:143`
- honeypot `_gotcha` at `:257-264`

`mqaeavbl` cannot be verified from here and has the shape of a placeholder. **Do not
assume it works.**

### What to build

1. **Hoist the endpoint into one place.** One module-level constant, read from an env var
   with the current value as fallback:
   ```ts
   const FORM_ENDPOINT =
     process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? 'https://formspree.io/f/mqaeavbl';
   const CONTACT_EMAIL = 'neelpatel00235@gmail.com';
   ```
   Use `FORM_ENDPOINT` for **both** the `<form action>` at `:251` and the `fetch` at
   `:127`. `NEXT_PUBLIC_` is required for a client-read env var. Add
   `NEXT_PUBLIC_FORM_ENDPOINT` to `.env.example` (create it if absent) with a comment
   explaining what to paste.
   Note: `CONTACT_EMAIL` must remain the literal `neelpatel00235@gmail.com` — that string
   is checked by the content gate's endpoint assertion.

2. **Send the fields the provider needs.** Add to the POSTed `FormData`:
   `_subject` (e.g. `New enquiry from <Name> — neelpatel.com`) and `_replyto` set to the
   submitted `Email`, so replies go to the sender rather than to the form service. Keep
   the `_gotcha` honeypot.

3. **Fix the fallback, which is currently lossy.** Both the non-`ok` branch and the
   `catch` branch must build a `mailto:` that carries **Name, Email and Message**, all
   `encodeURIComponent`-escaped:
   ```ts
   const mailto =
     `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}` +
     `&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
   ```
   Cap the body — `mailto:` URLs break past roughly 2,000 characters in some clients.

4. **Stop silently redirecting.** A failed POST currently yanks the user into their mail
   client with no explanation. Add real error state: an `error` state variable, a visible
   message in an `aria-live="polite"` region inside the form, and an explicit "Email me
   directly instead" link to the `mailto:` — let the user choose rather than hijacking
   the page. Keep the existing success branch (`submitted` at `:239-248`) as is.

5. **Add a real timeout.** Wrap the `fetch` in an `AbortController` with roughly an 8s
   timeout so a hanging provider surfaces the error state instead of leaving the button
   dead. Also disable the submit button and show a pending label while in flight — right
   now a double-click sends twice.

6. **Then actually test delivery.** Run `npm run dev`, submit the form for real, and
   record the HTTP status from the Network panel. If it returns 200 **and** mail lands at
   `neelpatel00235@gmail.com`, say so. If it returns 4xx (which is what an unregistered
   or placeholder Formspree id returns), **report the exact status and body** and stop —
   do not claim the form works.

7. **Report to the user, verbatim, in your summary:** whether delivery was confirmed,
   and if not, exactly what they must do — create a form at
   [formspree.io](https://formspree.io) or [web3forms.com](https://web3forms.com) with
   `neelpatel00235@gmail.com` as the destination, then put the resulting endpoint (or
   access key) into `NEXT_PUBLIC_FORM_ENDPOINT`. Web3Forms posts to
   `https://api.web3forms.com/submit` and needs an `access_key` field in the body; if you
   wire that variant, say so and note the extra field.

### Verify item 8

- [ ] `npm run verify-content` → 15 PASSED / 0 FAILED (the `neelpatel00235@gmail.com`
      and endpoint assertions are in this gate)
- [ ] `npm run build` → 61/61, Exporting (3/3)
- [ ] The endpoint appears exactly once as a constant;
      `grep -n "formspree" src/components/sections/Contact.tsx` shows no hard-coded
      duplicate
- [ ] Real submit performed. **Paste the HTTP status and response body.**
- [ ] State plainly: did an email arrive at `neelpatel00235@gmail.com`? Yes/no.
- [ ] Simulate failure (DevTools → Network → Offline, or point the constant at a bad
      URL): the error message renders in the `aria-live` region, the page does **not**
      auto-navigate, and the direct-email link works
- [ ] The `mailto:` fallback body contains Name, Email **and** Message
- [ ] Double-click submit → only one request in the Network panel
- [ ] Submit with the honeypot filled via DevTools → still handled
- [ ] Keyboard-only: tab to each field, submit with Enter, the error/success region is
      announced

---

## ITEM 9 — Mobile: thank-you overlap, and the small "something"

### 9a. Footer thank-you overlap

**File:** `src/components/layout/Footer.tsx`

- cursive `Neel Patel` at `:120` —
  `font-script text-cream/90 text-[clamp(3.5rem,8vw,7.5rem)] leading-none -mb-4 …`
- `THANK YOU` h2 at `:126` — `font-display font-black text-mega … `

At 390px wide: the script clamp resolves to its `3.5rem` floor (8vw = 31.2px, below the
floor) → a **56px** line box with `leading-none`, while Ephesis has deep descenders and
tall swashes that overflow that box. `text-mega` resolves to its `3.2rem` floor (51.2px)
with `lineHeight: 0.86` → a 44px line box whose ascenders sit above it. Then `-mb-4`
pulls the h2 up another **16px**. Result: they collide.

Fix by making the negative margin responsive and giving the script room for its
descenders — e.g. `-mb-1 sm:-mb-4` plus `pb-2 sm:pb-0` on the script wrapper. Tune to the
measurement, not to the guess.

**Acceptance is measured, not eyeballed:** at 390×844, read
`document.querySelector('#thankyou .font-script').getBoundingClientRect().bottom` and the
`.top` of the h2's first `.split-unit`. Require **≥ 8px** of clearance. Report both
numbers before and after.

Do not break: the desktop composition at 1280/1440 (the tuck is intentional there), the
`animate-text-breathe` / `animate-text-float` loops on `:120` and `:126`, or the GSAP
parallax at `:77` which finds the script via `querySelector('.font-script')` — **keep
that class on that element.**

### 9b. Contact headline "something" is too small

**File:** `src/components/sections/Contact.tsx:164`

The script span is `text-[0.92em] sm:text-[1.08em] lg:text-[1.3em]`. The parent h2
(`:162`) is `text-huge sm:text-mega`; at 390px `text-huge` floors at `2.2rem` = 35.2px, so
the script renders at ~32px — and because Ephesis has a small x-height it reads far
smaller than the 35px uppercase Fraunces on either side of it.

Raise the mobile step to roughly **`text-[1.18em]`**, keeping the `sm:`/`lg:` steps (or
nudging them up in proportion). Because the span is `inline-block` with
`leading-[0.6] -my-[0.2em]`, growing it will push into the lines above and below —
**re-tune the negative margin** (start around `-my-[0.16em]`) and re-check that
`headlinePrefix` / `headlineMiddle` / `headlineMega` still sit on clean baselines.

Keep: `min-w-0` on the column (`:161`), `select-none pointer-events-none`, `relative z-10`,
and the `animate-text-breathe` loop.

### Verify item 9

- [ ] `npm run verify-content` → 15 PASSED / 0 FAILED
- [ ] `npm run build` → 61/61, Exporting (3/3)
- [ ] At 390×844: script bottom vs `THANK YOU` top ≥ 8px — **paste both rects**
- [ ] Also clear at 360×740 and 430×932
- [ ] Desktop 1280 / 1440 thank-you composition unchanged (screenshot compare)
- [ ] The footer script parallax still runs (`.font-script` still present and found)
- [ ] Contact headline: "something" now reads at a comparable optical size to the
      surrounding caps at 390 — paste the computed `font-size` of the span and of the h2
- [ ] No line-box collision in the Contact headline at 390 / 768 / 1280 / 1440
- [ ] Both `animate-text-breathe` loops still active

---

## ITEM 10 — Kill the white flash before video loads

**Root cause, verified:** `player.vimeo.com` renders its embedded document with a **white
page background while it loads**. Every one of these iframes sits **above** its poster
image (`z-10` vs the poster's `z-0`) at **`opacity-100` from first paint**. So for the
duration of the player's load, a white rectangle covers the poster. This is the white
cards in images 8–9 and the white line along the showreels in image 10 (the letterbox
strip, where the container aspect and the video aspect disagree).

**All six iframe sites — every one must be fixed:**

| # | File | Line | Context |
|---|---|---|---|
| 1 | `src/components/sections/Hero.tsx` | `:55-61` | `AutoplayReel`, always-on, `loading="eager"` |
| 2 | `src/components/sections/SelectedWorks.tsx` | `:46-52` | `MarqueeReelCard`, always-on (×24 after ITEM 5) |
| 3 | `src/components/sections/SelectedWorks.tsx` | `:349-355` | Conroy hero showreel |
| 4 | `src/components/sections/SelectedWorks.tsx` | `:405-413` | Conroy fan card, hover-only |
| 5 | `src/components/video/VideoFrame.tsx` | `:242-252` | hover iframe (poster wrapper `:224-239`) |
| 6 | `src/components/video/VimeoFacade.tsx` | `:81` (`embedUrl`) | lazy iframe at the end of the component |

(`src/app/project/[slug]/page.tsx:87` is a JSON-LD `embedUrl` **string**, not an iframe —
leave it alone.)

**Apply both fixes at every site:**

**A. Paint the iframe element black.** Add **`bg-black`** to each iframe's `className`.
The iframe element's own background paints behind the embedded document, so this kills
both the white load flash and the white letterbox strip, immediately and with no JS.

**B. Gate the iframe's opacity on load.** Start at `opacity-0` and fade in only once the
player has loaded:

```tsx
const [reelReady, setReelReady] = useState(false);
// ...
<iframe
  onLoad={() => setTimeout(() => setReelReady(true), 250)}
  className={`… bg-black transition-opacity duration-400 ${reelReady ? 'opacity-100' : 'opacity-0'}`}
/>
```

The 250ms settle after `onLoad` matters: `onLoad` fires when the player shell is ready,
which is still before the first video frame is painted. Without the delay you swap white
for black instead of for video.

Notes and traps:
- `MarqueeReelCard` (`SelectedWorks.tsx:27-76`) is currently a stateless function
  component. Adding `useState` is fine — the file is `'use client'` — but it means 24
  stateful components. That is acceptable; do not restructure the marquee to avoid it.
- Keep the poster `<Image>` **visible underneath** while `reelReady` is false. In
  `VideoFrame.tsx` the poster wrapper at `:224-239` already fades on `hoverMounted` —
  make sure it does not fade out *before* the iframe fades in, or you will trade a white
  flash for a black one.
- `VimeoFacade.tsx` wraps in `bg-black` already but the iframe still paints white over
  it — fix B is what actually solves it there.
- Preserve every existing attribute: `loading` (`eager` on Hero, `lazy` elsewhere),
  `allow`, `title`, `pointer-events-none`, and every query param in the embed URL
  (`background=1&autoplay=1&loop=1&muted=1&playsinline=1&autopause=0&dnt=1&quality=…`,
  and Facade's `api=1&player_id=…&app_id=122963`).
- Optional hardening: add `style={{ colorScheme: 'dark' }}` to the iframes. Report if it
  helped.
- Do **not** add new iframes and do not change how many load. Iframe count before and
  after must match.

### Verify item 10

- [ ] `npm run verify-content` → 15 PASSED / 0 FAILED
- [ ] `npm run build` → 61/61, Exporting (3/3)
- [ ] **Throttled to Fast 4G with cache disabled**, cold-load and scroll the whole page.
      Report: any white frame anywhere? Check the hero reel, both timeline rows, the
      Conroy showreel, the Conroy fan on hover, and the three showreel cards from
      image 10.
- [ ] The white **line/strip** on the showreel cards is gone at 390 / 768 / 1280 / 1440
- [ ] All six sites patched — `grep -n "<iframe" src/components/sections/Hero.tsx src/components/sections/SelectedWorks.tsx src/components/video/VideoFrame.tsx src/components/video/VimeoFacade.tsx` and confirm every hit has both `bg-black` and an opacity gate
- [ ] Posters remain visible during load — no black gap between poster fade-out and
      iframe fade-in
- [ ] `document.querySelectorAll('iframe').length` unchanged from before this item
- [ ] Video still autoplays, loops, and is muted; hover-only players still trigger on
      hover and on keyboard focus
- [ ] `prefers-reduced-motion: reduce` → the fade is fine but must not leave an iframe
      stuck at `opacity-0`

---

## ITEM 11 — Nav wordmark → logo

**Files:** `src/components/layout/Header.tsx`, `public/`

Current, `Header.tsx:69-75`:

```tsx
<Link href="/" className="font-display font-black text-sm tracking-widest text-cream uppercase hover:text-terracotta transition-colors" data-cursor="Open">
  NEEL PATEL
</Link>
```

Source asset: `assets/Neel_logo.png`. Verified: **2048×2048 RGBA PNG, 459,859 bytes**,
`bitDepth 8 / colorType 6`, `hasAlpha: true`. It is mostly transparent padding — the ink's
alpha>10 bounding box is **left 448, top 641, right 1601, bottom 1405**, i.e.
**1154×765 of actual mark, aspect 1.5085**. The mark is already terracotta (centre pixel
`rgba(247,125,40,255)` ≈ `--terracotta #f67c29`), so it reads correctly on the dark
header with no recolouring.

**`assets/` is not served (ground rule 5).** Shipping the raw 2048² / 460KB file for a
28px-tall nav mark is also wasteful. `sharp` 0.33.5 is installed.

Steps:

1. Trim and downscale into `public/`. Note that `sharp`'s `.trim()` keys off the
   **top-left pixel colour** and does **not** detect this file's alpha border — it returns
   2048×2048 unchanged. Use the measured box explicitly:
   ```bash
   node -e "const s=require('sharp');s('assets/Neel_logo.png').extract({left:448,top:641,width:1154,height:765}).resize({height:128}).webp({quality:92}).toFile('public/brand/neel-logo.webp').then(i=>console.log(i))"
   ```
   `height:128` gives **width 193** (1154/765 × 128). Emit a `.png` alongside the `.webp`
   as a fallback if you like. Report the final byte size — it should be a few KB, not
   hundreds.

2. Replace the text in the `Link`:
   ```tsx
   <Link href="/" className="inline-flex items-center opacity-90 hover:opacity-100 transition-opacity" data-cursor="Open">
     <Image src="/brand/neel-logo.webp" alt="Neel Patel" width={193} height={128} priority className="h-7 w-auto" />
   </Link>
   ```
   - `images: { unoptimized: true }`, so `width`/`height` are intrinsic hints only — the
     file must already be the right size. That is what step 1 is for.
   - `hover:text-terracotta` no longer does anything on an image — replace it with the
     opacity hover shown above (or a subtle `hover:scale-105`), so the logo still has a
     hover affordance.
   - Keep `href="/"` and `data-cursor="Open"`.
   - `alt="Neel Patel"` keeps the accessible name. Do not use `alt=""` without an
     `aria-label` on the `Link`.
   - Add `priority` — it is above the fold, and without it the nav pops in late.

3. Check it against the header's own behaviour: the header is `bg-transparent` at the top
   and gains a scrolled background — confirm the logo is legible in **both** states, and
   at 390 (where the nav is tightest, next to the mobile menu trigger).

4. Do not delete `assets/Neel_logo.png`. Leave the source in place.

### Verify item 11

- [ ] `npm run verify-content` → 15 PASSED / 0 FAILED
- [ ] `npm run build` → 61/61, Exporting (3/3)
- [ ] `public/brand/neel-logo.webp` exists; report its dimensions and byte size
- [ ] Logo renders in the nav at 390 / 768 / 1280 / 1440; no distortion (rendered aspect
      ≈ 1.508)
- [ ] Legible against both the transparent-top and scrolled header states
- [ ] Network panel shows the logo request returning **200** (not a 404 from an
      `/assets/…` path)
- [ ] Clicking it navigates to `/`; `data-cursor="Open"` still drives the magnetic cursor
- [ ] Accessible name is "Neel Patel" (check the a11y tree)
- [ ] Visible hover affordance on the logo
- [ ] Header layout does not shift on load (the `priority` + explicit dimensions should
      reserve the box)

---

## ITEM 12 — MBF Taurian for titles site-wide

**Depends on ITEM 1d** (font registered, `font-taurian` in the Tailwind config, variable
added to the `<html>` className). Do not start this item until ITEM 1 has landed and its
gates passed.

The brief is "use it for titles where you think it looks good" — so this is a judgement
call, with guardrails.

**Taurian is a high-contrast decorative display face. It works at large sizes and fails at
small ones.** Apply it only to the big headings. Leave every small `font-display` usage
(stats, card titles, mono labels, marquee bands, body) on Fraunces.

### Apply to (verify each anchor before editing)

| File | Line | Heading |
|---|---|---|
| `src/components/sections/SelectedWorks.tsx` | `:278` | timeline section title |
| `src/components/sections/SelectedWorks.tsx` | `:319` | Conroy campaign title |
| `src/components/sections/Gallery.tsx` | `:179` | gallery title |
| `src/components/sections/Toolkit.tsx` | `:146` | toolkit title |
| `src/components/sections/Services.tsx` | `:58` | services title |
| `src/components/sections/Contact.tsx` | `:162` | contact headline (`text-huge sm:text-mega`) |
| `src/components/layout/Footer.tsx` | `:126` | `THANK YOU` |
| `src/app/projects/page.tsx` | `:176` | projects page title |
| `src/app/project/[slug]/page.tsx` | `:141` | project page title |

Judgement calls — try them, keep them only if they read well, and say which way you went:
`SelectedWorks.tsx:231`, `Gallery.tsx:288`, `project/[slug]/page.tsx:205`.

### Do NOT apply to

`Hero.tsx:313 / :321 / :329 / :412 / :416 / :420` (small stats),
`Toolkit.tsx:240` (marquee band — needs legibility in motion),
`Contact.tsx:244` (`text-2xl` card heading), `ui/SectionHeader.tsx:46`, any `font-mono`
label, the nav, or body copy. `Hero.tsx:242` is ITEM 3's territory — leave it to that
item's decision.

### Mandatory rules for every swap

1. **Replace `font-display` with `font-taurian`, and in the same edit remove
   `font-black` / `font-bold` and `font-variation-wonk` from that element.** Taurian is
   single-weight, so a weight utility triggers synthetic bold, which smears a
   high-contrast face. `font-variation-wonk` is a Fraunces-only variation axis
   (`globals.css:127-129`) and is meaningless here.

2. **Re-tune tracking per heading.** `tracking-tight` / `-0.03em` (baked into `text-mega`
   at `tailwind.config.ts:33`) was set for Fraunces. Taurian has different sidebearings
   and ships `dlig`/`salt` features. Check every heading you touch for glyph collision
   and for overflow.

3. **Every heading you touch must be re-checked at 390 / 768 / 1280 / 1440** for
   clipping, overflow, wrapping changes, and collisions with neighbouring elements. A
   different face changes the measured width of the same string — some of these headings
   currently fit on one line by a few pixels.

4. **SplitText compatibility.** Most of these headings wrap their text in `<SplitText>`.
   Changing the font changes glyph advances and therefore the per-character span
   geometry. Confirm each still animates in cleanly with no reflow mid-animation.

5. **Do not change any heading's text.** All of these strings come from `content.ts` and
   are gate-locked.

6. **Do not touch `.font-display` in `globals.css:127-129`.** Other elements still depend
   on it.

### Verify item 12

- [ ] `npm run verify-content` → 15 PASSED / 0 FAILED
- [ ] `npm run build` → 61/61, Exporting (3/3)
- [ ] List every element you changed and every one you deliberately left alone, with your
      reason for each judgement call
- [ ] For each changed heading: computed `font-family` contains the Taurian face, and
      computed `font-weight` is `400` (not `700`/`900`)
- [ ] `grep -n "font-taurian" src/` — no hit also carries `font-black`, `font-bold`, or
      `font-variation-wonk` on the same element
- [ ] Screenshots of every changed heading at 390 and 1440; no clipping, no overflow, no
      collision with a neighbour
- [ ] All SplitText entrance animations still play cleanly
- [ ] Small `font-display` usages are untouched — Hero stats and the Toolkit marquee band
      still render in Fraunces
- [ ] Only one new font file is loaded (check the Network panel: one Taurian request, not
      several); report the transferred size

---

## REPORT FORMAT

After each item, report exactly this and then **stop**:

```
ITEM <n> — <title>

WHAT I CHANGED
  <file>:<line-range> — <one line, what and why>
  ...

MEASUREMENTS
  <every number this item asked you to measure, with its value>
  <before → after where the item asked for a comparison>

GATE: verify-content
  <pasted output — must show 15 PASSED / 0 FAILED>

GATE: build
  <pasted output — must show 61/61 and Exporting (3/3)>

VERIFY CHECKLIST
  [x] <each box from the item's Verify block, with the evidence inline>
  ...

DEVIATIONS
  <anything you did differently from this doc, and why. "None" if none.>

RISKS / FOLLOW-UPS
  <anything you noticed but did not touch because it was out of scope>
```

If a gate fails, **do not proceed and do not paper over it.** Report the failure with the
full error output and stop.

---

## ITEM DEPENDENCY ORDER

Most items are independent. These are not:

- **ITEM 12 requires ITEM 1d** (font registration).
- **ITEM 3** may want `font-taurian`; if so it also requires ITEM 1d.
- **ITEM 10 touches `SelectedWorks.tsx:46-52`, which ITEM 5 restructures.** Doing ITEM 5
  first means ITEM 10 patches one `MarqueeReelCard` that both rows share — cleaner. If
  you do ITEM 10 first, re-check the iframe fix survived ITEM 5's edit.
- **ITEM 6b** changes the Conroy fan card size; **ITEM 10** patches the fan card's iframe
  at `:405-413`. Whichever is second, re-confirm the other's result.

Recommended order: **1, 2, 4, 7, 5, 10, 6, 3, 12, 9, 11, 8.**
(Cheap and isolated first; the font-dependent and cross-cutting items after the font
exists; ITEM 8 last because it ends on a question only the user can answer.)
