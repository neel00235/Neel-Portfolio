# ANTIGRAVITY FIX PROMPT — ROUND 5

Four reported issues from the post-round-4 site. Every issue below is a **regression or gap
left by round 4** — the plumbing mostly exists, it is wired wrong.

**Execute ONE item per turn.** After each item, run BOTH gates and report before moving on:

```bash
npm run verify-content
```
Must print **15 PASSED / 0 FAILED**.

```bash
npm run build
```
Must print **61/61** static pages and **Exporting (3/3)**.

If either gate fails, fix it inside the same item. Never move to the next item on a red gate.

---

## GROUND RULES

1. **`src/data/content.ts` is not touched in this round.** Zero edits. Every string you need
   either already exists there or is a local `const` in the component you are editing.
   The content gate diffs this file against `tests/content.lock.json`; touching it is the
   single most likely way to fail a gate for no reason.

2. **`eslint.ignoreDuringBuilds: false` and `typescript.ignoreBuildErrors: false`.**
   One unused import, one unused variable, one `any` without a disable comment = **hard build
   failure**. If you delete the last use of an import, delete the import.

3. **Static export.** `output: 'export'`, `trailingSlash: true`, `images: { unoptimized: true }`.
   No API routes. No server. No `next/headers`. No dynamic `revalidate`.

4. **`prefers-reduced-motion: reduce` must stay honoured** in every file you touch. Every
   animation component in this repo early-returns on reduced motion. If your change adds
   state that is only cleared by an animation callback, reduced motion must reach the same
   final state by a different path. This is the exact bug class that ITEM 2 exists to fix —
   do not reintroduce it.

5. **No new dependencies.** GSAP, ScrollTrigger, Lenis, `lucide-react`, `next/font/local`,
   `zustand` are all already here. Nothing else gets installed.

6. **Do not change any font file, and do not touch `src/lib/fonts.ts`.** Specifically: do
   **not** add `ascentOverride`, `descentOverride`, `lineGapOverride`, or `sizeAdjust` to the
   `mbfTaurian` face. ITEM 2 explains, with the measured numbers, why those cannot fix the
   reported clipping.

7. **Do not change `src/components/curtain/Curtain.tsx`'s reveal mechanic.** Round 4
   deliberately removed the page fade-in: the page is revealed **only** by the scroll-scrubbed
   leaves. ITEM 4 adds a loading gate *in front of* that mechanic. It must not reintroduce a
   fade-in, an auto-opening curtain, or a timeline that opens the leaves without scroll.

8. **Measure, do not guess.** Where an item says "measure", open the page at the four
   breakpoints listed in MEASUREMENT DISCIPLINE and read real numbers out of DevTools.
   Round 4 failed ITEM 12 precisely because headings were eyeballed at one width.

9. **Tailwind arbitrary values are fine** (`leading-[1.24]`, `pb-[0.22em]`,
   `[-webkit-text-fill-color:transparent]`). Arbitrary values that interpolate a JS variable
   are **not** — Tailwind's JIT cannot see them.

10. **Do not reformat files.** Diffs must be minimal and reviewable. No prettier sweep, no
    import reordering, no "while I was in here" cleanups.

11. **Never edit `tests/content.lock.json`.**

12. **Report per REPORT FORMAT at the bottom.** Every item.

---

## ITEM 1 — Hero wordmark renders as a single orange "E"; recolour `Patel` to white

### What the user reported

> image 1 you see thet my name is glitched it only show "E" and 'patel' fix it so it writes
> properly also change the color of patel to white.

### Where

`src/components/sections/Hero.tsx` lines **267–283**. Current code, verbatim:

```tsx
<h1
  ref={wordmarkRef}
  aria-label="Neel Patel"
  className="flex flex-col font-displayAlt font-black text-mega uppercase tracking-normal leading-[0.88] pb-6 mb-10 drop-shadow-md select-none"
>
  {/* Line 1: NEEL with animated gradient pan and per-letter accent */}
  <span className="wordmark-line-1 relative inline-block bg-gradient-to-r from-cream via-kraft to-cream bg-[length:220%_100%] bg-clip-text text-transparent animate-gradientPan motion-reduce:animate-none">
    <span className="wordmark-char inline-block">N</span>
    <span className="wordmark-char inline-block">E</span>
    <span className="wordmark-char inline-block text-terracotta [-webkit-text-fill-color:#f67c29]">E</span>
    <span className="wordmark-char inline-block">L</span>
  </span>

  {/* Line 2: Patel in cursive font-script tucked under NEEL with slight overlap */}
  <span className="wordmark-line-2 font-script normal-case text-terracotta text-[1.15em] leading-[0.62] -mt-[0.20em] ml-2 sm:ml-4 tracking-[0.06em] select-none block animate-text-breathe [animation-duration:6.2s]">
    Patel
  </span>
</h1>
```

### Root cause — confirmed, not a guess

`-webkit-background-clip: text` (Tailwind's `bg-clip-text`) clips the element's background to
**that element's own text runs**. Line `:272` carries the gradient and `text-transparent`, but
its only children are element spans — it contains **no text node of its own**. The clip region
is therefore empty, and the gradient paints nothing.

The four letters inherit `color: transparent` from the parent, so:

- `N`, `E`, `L` inherit transparent and have no background of their own → **invisible**.
- The third `E` at `:275` is the only letter carrying `[-webkit-text-fill-color:#f67c29]`.
  `-webkit-text-fill-color` overrides the inherited `color: transparent`, so it is the **only**
  glyph that paints — which is exactly the single orange "E" in the screenshot.

### Required fix

**Rule to internalise: the element that carries `bg-clip-text` must directly contain the text
node it is clipping to.** Move the gradient down onto the letters.

Replace `:272–277` with:

```tsx
  {/* Line 1: NEEL — gradient lives on each glyph, because bg-clip-text clips to the
      element's OWN text node. On the parent it clipped to nothing and the word vanished. */}
  <span className="wordmark-line-1 relative inline-block">
    <span className="wordmark-char inline-block bg-gradient-to-r from-cream via-kraft to-cream bg-[length:220%_100%] bg-clip-text text-transparent [-webkit-text-fill-color:transparent] animate-gradientPan motion-reduce:animate-none">N</span>
    <span className="wordmark-char inline-block bg-gradient-to-r from-cream via-kraft to-cream bg-[length:220%_100%] bg-clip-text text-transparent [-webkit-text-fill-color:transparent] animate-gradientPan motion-reduce:animate-none">E</span>
    <span className="wordmark-char inline-block text-terracotta [-webkit-text-fill-color:#f67c29]">E</span>
    <span className="wordmark-char inline-block bg-gradient-to-r from-cream via-kraft to-cream bg-[length:220%_100%] bg-clip-text text-transparent [-webkit-text-fill-color:transparent] animate-gradientPan motion-reduce:animate-none">L</span>
  </span>
```

Note precisely what changed:

- The gradient / `bg-clip-text` / `text-transparent` / `animate-gradientPan` classes moved from
  the parent (`:272`) to each non-accent letter. The parent keeps only
  `wordmark-line-1 relative inline-block`.
- Each gradient letter also gets `[-webkit-text-fill-color:transparent]`. Tailwind's
  `text-transparent` only sets `color`. In Blink/WebKit an inherited or UA
  `-webkit-text-fill-color` beats `color`, so state it explicitly rather than relying on it
  being unset.
- The accent `E` keeps **both** `text-terracotta` (the `color`) and
  `[-webkit-text-fill-color:#f67c29]` (the WebKit fill). Both are required: the fill for
  Blink/WebKit, the `color` for Firefox, which does not implement `-webkit-text-fill-color`.
- The accent `E` must **not** get the gradient classes. It is the per-letter accent.

**Accepted trade-off, state it in your report:** because each glyph now owns its gradient box,
the ramp restarts per letter instead of flowing continuously across `NEEL`. All four letters
share one `animate-gradientPan` timing so it still reads as a single synchronised sheen. Do
**not** try to fix this with `bg-fixed` — GSAP transforms `wordmarkRef` (scale + y at
`Hero.tsx:107–133`) and each `.wordmark-char`, and `background-attachment: fixed` degrades to
`scroll` inside a transformed subtree, so it would silently do nothing here.

### `Patel` to white

`src/components/sections/Hero.tsx:280` — change `text-terracotta` to `text-cream`.
Change nothing else on that line.

`cream` is `#faf4e8` — this repo's white. It is the palette's only light ink token and it is
what every other light heading on the site uses. Do **not** introduce a literal `#ffffff` or a
`text-white` utility; that would be the one off-palette colour on the page.

### Do not touch

- The GSAP block at `Hero.tsx:107–133` (`wordmarkRef` intro, `.wordmark-char` stagger,
  `.wordmark-line-2` fade). It targets classes and refs that all still exist after this change.
- The parallax on `wordmarkRef` at `Hero.tsx:182–184`.
- `aria-label="Neel Patel"` on the `h1` — it is what a screen reader reads, and the split
  letters are why it is needed.
- `tailwind.config.ts` — `gradientPan` keyframe (`:64–66`) and animation (`:79`) already exist
  and are correct.

### Verify item 1

1. Load `/`. Scroll past the curtain to the hero.
2. The wordmark reads **NEEL** — four visible glyphs — with the third one orange and the other
   three in a cream→kraft gradient. Screenshot it.
3. `Patel` underneath is cream/white, not orange.
4. DevTools → select each of the four letter spans → confirm a non-empty painted glyph for each.
5. Reload with **prefers-reduced-motion: reduce**. All four letters still visible; the gradient
   is static (`motion-reduce:animate-none`); nothing is transparent.
6. Firefox check: all four letters visible (this is the check that `color` was kept alongside
   `-webkit-text-fill-color` on the accent letter).
7. Both gates green.

---

## ITEM 2 — Every MBF Taurian heading is vertically clipped

### What the user reported

> image 2 shows the selected works section here the word gallery is cut from the bottom fix
> that. and in image 3 word 'the toolkit' is aslo cut in the bottom. image 4 the word "what i"
> is cut from top and bottom fix that. image 5 and 6 show the 'lets cut something worth
> watching' expect the word 'something' lets cut and worth watching is cut out fix that.
> image 7 the thankyou is cut from the bottom fix that.

### Root cause — measured from the font binary, and corroborated by the screenshots

**Measured metrics of `public/fonts/mbf-taurian.otf`:**

| table | field | value |
|---|---|---|
| `head` | `unitsPerEm` | 1000 |
| `head` | `yMax` | **955** |
| `head` | `yMin` | **−260** |
| `hhea` | `ascender` / `descender` / `lineGap` | 750 / −250 / 0 |
| `OS/2` | `sTypoAscender` / `sTypoDescender` / `sTypoLineGap` | 750 / −250 / 0 |
| `OS/2` | `usWinAscent` / `usWinDescent` | 1000 / **0** |
| `OS/2` | `sCapHeight` / `sxHeight` | 700 / 500 |

**The font's actual glyph ink spans 1.215 em** (from −0.260 em to +0.955 em relative to the
baseline). **Every metric table declares a 1.000 em box**, and `usWinDescent` is a broken `0`.
So the font under-reports its own ink by at least 21.5%, and under-reports its descent
completely.

**The clipper is `src/components/motion/SplitText.tsx`.** Lines `:81–84` (char mode) and `:99`
(word mode) wrap every unit in:

```tsx
<span className="inline-block overflow-hidden align-top">
  <span className="split-unit inline-block">{char}</span>
</span>
```

That mask exists so the `y: '110%' → '0%'` reveal at `:43–63` wipes rather than slides in
visibly. Its height is a single line box = **`line-height × font-size`**. Taurian's ink is
1.215 em. Every Taurian heading on the site uses a line-height **below 1.215**, so the mask
crops the glyph. Permanently — the mask is in the markup, so it never stops clipping.

**Why this matches the screenshots exactly, including the two odd cases:**

- *"except the word 'something'"* (images 5 and 6): in `Contact.tsx:209–215`, `headlinePrefix`,
  `headlineMiddle` and `headlineMega` all go through `SplitText`. The cursive word
  `headlineScript` at `:210` is a **plain `<span>` with no mask**. The one word that is not
  masked is the one word that is not cut. That is the diagnosis confirming itself.
- *"cut from top and bottom"* (image 4): `Services.tsx:58` passes
  `className="leading-[0.62]"` **into** `SplitText`. The mask is only 0.62 em tall — half the
  ink height — and with a line-height below 1 the half-leading goes negative, so the ascender
  escapes above the mask top as well as the descender below its bottom. Worst offender on the
  site.
- The three Taurian headings that use **plain text, not `SplitText`**
  (`src/app/projects/page.tsx:176`, `src/app/project/[slug]/page.tsx:141` and `:205`) were
  **not** reported by the user. They have no mask, so nothing crops them. Further confirmation.

### Why line-height alone cannot fix this, and why font overrides cannot either

With an explicit numeric `line-height` **L**, the box height is `L × font-size` **regardless of
what the font's metric tables say**. That kills two tempting fixes:

- `ascentOverride` / `descentOverride` / `lineGapOverride` in `next/font/local` change where the
  baseline sits inside the box; they cannot make the box taller. **Useless here.**
- `sizeAdjust` would shrink every Taurian glyph on the site to fit — changing the apparent size
  of ten headings to fix a mask. **Not acceptable.**

And raising the line-height enough to contain the ink is also not viable. Solving
`(L−1)/2 + 1.260 ≤ L` for the bottom edge and `(L−1)/2 − 0.205 ≥ 0` for the top gives
**L ≥ 1.41–1.52** depending on which metric set the browser picks (`hhea` 750/−250 vs `OS/2`
win 1000/0 — Chrome on Windows uses the latter for CFF faces). Leading of 1.5 on a display
heading destroys the design.

**Therefore the structural fix (2a) is mandatory, not optional.** The mask must stop clipping
once the reveal has finished.

### Magnitude of the overflow, per site, at the largest clamp value

Ink height = 1.215 × font-size. Mask height = effective line-height × font-size.

| # | file:line | size token | px at max clamp | effective line-height | mask px | ink px | ink outside mask |
|---|---|---|---|---|---|---|---|
| 1 | `src/components/layout/Footer.tsx:126` | `text-mega` | 184.0 | 0.86 | 158.2 | 223.6 | **65.4 px** |
| 2 | `src/components/sections/Contact.tsx:208` | `text-huge sm:text-mega` + `leading-[0.9]` | 184.0 | 0.90 | 165.6 | 223.6 | **58.0 px** |
| 3 | `src/components/sections/Services.tsx:58` | `text-huge`, SplitText `leading-[0.62]` | 88.0 | 0.62 | 54.6 | 106.9 | **52.3 px** |
| 4 | `src/components/sections/Gallery.tsx:179` | `text-huge` | 88.0 | 0.94 | 82.7 | 106.9 | **24.2 px** |
| 5 | `src/components/sections/Toolkit.tsx:146` | `text-huge` | 88.0 | 0.94 | 82.7 | 106.9 | **24.2 px** |
| 6 | `src/components/sections/Gallery.tsx:288` | `text-big` | 51.2 | 1.05 | 53.8 | 62.2 | **8.4 px** |
| 7 | `src/components/sections/SelectedWorks.tsx:287` | `text-big`, `by="word"` | 51.2 | 1.05 | 53.8 | 62.2 | **8.4 px** |
| 8 | `src/components/sections/SelectedWorks.tsx:343` | `text-big`, `by="word"` | 51.2 | 1.05 | 53.8 | 62.2 | **8.4 px** |

Sites 1–5 are the five the user photographed. Sites 6–8 are the same defect, smaller, and are
in scope — fix them in the same pass.

### 2a — Structural: `SplitText`'s mask must only clip while the reveal is running

Edit `src/components/motion/SplitText.tsx`.

**Markup change.** In both branches, the mask span drops `overflow-hidden` from the markup and
gains a `split-mask` hook class:

- `:81–84` (char mode) becomes `className="split-mask inline-block align-top"`
- `:99` (word mode) becomes `className="split-mask inline-block align-top"`

Keep `align-top`. Keep `inline-block`. Keep the `.split-unit` inner span untouched.

**Effect change.** Inside the existing `useEffect` (`:32–67`), after
`if (!targets.length) return;` at `:40`, add:

```tsx
const masks = el.querySelectorAll('.split-mask');
```

Then inside the `gsap.context` callback at `:42`, **before** the `fromTo`:

```tsx
gsap.set(masks, { overflow: 'hidden' });
```

and add to the `fromTo`'s `to` vars:

```tsx
onComplete: () => {
  gsap.set(masks, { overflow: 'visible' });
},
```

`stagger` means the tween completes when the **last** unit lands, so `onComplete` is the correct
hook — not `onStart` of a later tween, not a `setTimeout`.

**Why this is correct at every entry point — check each of these yourself:**

| state | mask overflow | result |
|---|---|---|
| SSR / pre-hydration / JS disabled | `visible` (markup default) | full glyphs, uncropped, and the units are at their natural position because GSAP has not set `y` yet — no pile of stacked letters |
| reduced motion (early return at `:37`) | `visible` — the effect returns before `gsap.set` | **full glyphs, uncropped.** This is the case a mask that defaults to hidden would break forever |
| reveal armed, before trigger fires | `hidden` (set by `gsap.set`) with units at `y: 110%` | clean, nothing visible above the mask |
| reveal running | `hidden` | clean wipe, unchanged from today |
| reveal complete | `visible` (set by `onComplete`) | **no clipping — this is the fix** |
| `ctx.revert()` on unmount | inline styles removed by GSAP | back to markup default `visible` |

Do **not** instead delete the mask outright — that regresses the reveal into a visible slide-in.
Do **not** switch the mask to `clip-path` — same clipping, different spelling.

### 2b — Layout room: after 2a nothing is *cropped*, but ink can still *collide*

2a stops the crop. It does **not** change layout: the mask box is still `line-height` tall, so
up to 65 px of ink now paints **outside** the box and can overlap whatever sits above or below.
That is the same class of bug the user already reported in round 4 item 9 ("neel patel in
cursive overlaps thankyou").

For **each of the eight sites in the table above**, at all four breakpoints in MEASUREMENT
DISCIPLINE:

1. Confirm no glyph is cropped (2a working).
2. Confirm no glyph overlaps an adjacent text block — the eyebrow label above, the cursive
   accent beside it, the paragraph below.
3. Where it does overlap, add the **minimum** `pt-[…]` / `pb-[…]` / `mt-[…]` / `mb-[…]` in `em`
   units on the heading to clear it. `em` so it scales with the clamp. Record the value you
   measured and why.

Site-specific notes:

- **`Services.tsx:58`** — the `leading-[0.62]` passed into `SplitText` is what makes this the
  worst case. After 2a it no longer crops, but 52 px of ink will spill into the cursive
  `deliver` beside it (`:59–61`, which itself has `-my-[0.26em]`) and into the content below.
  Measure and clear it. If clearing it needs the leading raised, raise it on the `SplitText`
  `className` only, and keep the `h2`'s own `leading-[0.9]` as-is unless measurement says
  otherwise.
- **`Contact.tsx:208`** — `leading-[0.9]` on the `h2` cascades into all three `SplitText`
  children. The cursive `something` at `:210` and the `headlineMega` block at `:213–215`
  (`-mt-[0.06em]`) both sit inside the same heading, so this one needs the most care. The
  mobile 390 px case is the one the user has already complained about once.
- **`Footer.tsx:126`** — 65 px of ink at desktop, and the cursive `Neel Patel` above it at
  `:120` already uses `sm:-mb-4` to tuck under. Verify the tuck still reads and does not
  collide now that the display glyphs paint their full height.
- **Sites 6–8** — 8.4 px each. Likely need nothing. Confirm by measurement, do not assume.

### 2c — Verify-only, change nothing

- `src/app/projects/page.tsx:176`, `src/app/project/[slug]/page.tsx:141`, `:205` — plain-text
  Taurian headings, no `SplitText`, no mask, not clipped. Load both routes and confirm they are
  still uncropped and uncollided after 2a/2b. **Do not add leading or padding to them.**
- `src/components/curtain/Curtain.tsx:84` and `:101` — the leaves crop the seam wordmark
  **by design** (that is the tear-apart effect). Not affected by 2a; `Curtain` does not use
  `SplitText`. **Do not change.**
- Section-level `overflow-hidden` (`Gallery.tsx:158`, `Toolkit.tsx:134`, `Services.tsx:46`,
  `Contact.tsx:194`, `Footer.tsx:106`, `SelectedWorks.tsx:220`) is not a clipper for these
  headings — each sits well inside its section's `py-24`. **Do not remove them**; they exist to
  contain the decorative orbs and marquees.

### Verify item 2

1. All five reported headings — `GALLERY`, `THE TOOLKIT`, `WHAT I`, the
   `LET'S CUT SOMETHING WORTH WATCHING` block, `THANK YOU` — render with full descenders and
   full ascenders. Screenshot each at 1440 px and at 390 px.
2. The three smaller `text-big` headings likewise.
3. `/projects/` and one `/project/<slug>/` route still fine.
4. Reduced motion: every Taurian heading fully visible and uncropped. **This is the highest-risk
   regression path in this item** — a mask that defaults to hidden would leave reduced-motion
   users with permanently cropped headings and no animation to un-crop them.
5. JS disabled (DevTools → Settings → Debugger → Disable JavaScript), reload: headings fully
   visible, letters in normal position, not stacked or offset.
6. The reveal animation still wipes cleanly on a fresh scroll into each section — no visible
   pile of letters sitting below the line before the trigger fires.
7. Both gates green.

---

## ITEM 3 — Lead show-reel must autoplay and loop on load

### What the user reported

> image 8 show the selected works make the show reel on loop so it plays automatically when it
> loads.

### Where

`src/components/sections/SelectedWorks.tsx:263–274`. The lead film
(`leadFilm = cinemaSection?.works[0] || conroyHero`, line `:113`) is rendered with:

```tsx
<VideoFrame
  id={leadFilm.id}
  ...
  priority={true}
  autoPlayLead={false}      // <-- this
  className="w-full"
/>
```

The plumbing already exists and is already almost right:

- `src/components/video/VideoFrame.tsx:21` declares `autoPlayLead?: boolean`, `:33` defaults it
  `false`, and `:40` seeds `useState(autoPlayLead)` for `isPlayingFull`. So passing `true`
  mounts the full player immediately instead of the poster.
- `src/components/video/VimeoFacade.tsx:84` **already** sends `loop=1`, and `:18` defaults
  `autoPlay = true`, and `:61–63` posts `play` on the player's `ready` event.

The section's own gate-locked copy already promises this behaviour: *"The lead film plays on its
own. Everything below streams only as it reaches your viewport — zero video requests at first
paint."* Right now the copy is a lie.

### 3a — Flip the call site

`src/components/sections/SelectedWorks.tsx:271`: `autoPlayLead={false}` → `autoPlayLead={true}`.

That alone is **not sufficient**. Three traps below will each independently break it.

### 3b — Trap: `onEnded` collapses the player back to the poster

`src/components/video/VideoFrame.tsx:289`:

```tsx
onEnded={() => setIsPlayingFull(false)}
```

With `loop=1` Vimeo usually restarts without emitting `finish`, but it is not guaranteed — and
`VimeoFacade.tsx:64` also maps a bare `ended` event to the same callback. If either fires once,
`isPlayingFull` goes false, the facade unmounts, the poster comes back, and the "loop" is over
with no way back except a click.

Change `:289` to:

```tsx
onEnded={() => {
  // The lead film is a loop — a stray finish event must not collapse it to the poster.
  if (!autoPlayLead) setIsPlayingFull(false);
}}
```

### 3c — Trap: the embed URL asks for unmuted autoplay, which the browser blocks

`src/components/video/VimeoFacade.tsx:82–84`:

```tsx
const embedUrl = `https://player.vimeo.com/video/${videoId}?api=1&player_id=${videoId}&autoplay=${
  autoPlay ? 1 : 0
}&muted=${soundEnabled ? 0 : 1}&loop=1&background=0&controls=0&dnt=1&quality=1080p&app_id=122963`;
```

If the global sound store has `soundEnabled === true` when the lead mounts, the URL requests
`autoplay=1&muted=0`. Chrome's autoplay policy blocks that outright with no user gesture: the
frame stays black forever. Autoplay **must** start muted.

Rewrite the URL so that:

- `muted=1` whenever `autoPlay` is true, regardless of `soundEnabled`.
- `playsinline=1` is added. It is currently **missing** from this URL — on iOS Safari the player
  will refuse to play inline or will jump to fullscreen.
- `autopause=0` is added, so another Vimeo player elsewhere on the page cannot pause the lead.

Everything else in the query string stays byte-identical, including `dnt=1`, `app_id=122963`,
`api=1`, `player_id`, `controls=0`, `background=0`, `quality=1080p`.

The existing effect at `:36–40` already posts `setVolume` when `soundEnabled` flips, and `:60`
posts it again on `ready`. That is the correct unmute path: muted at load, volume raised when
the user's sound preference is applied after a gesture. Leave that effect alone.

### 3d — Trap: the auto-started lead is invisible to the video registry

`src/components/video/VideoFrame.tsx:40` sets `isPlayingFull = true` without ever calling
`playFull(id)`, so `activeFullId` stays `null`. The site's "exactly one full player at a time"
invariant (`:79–83`) is broken: the lead is playing but not registered.

Register it once on mount. Inside `VideoFrame`, add an effect that runs a single time:

```tsx
// The lead film auto-starts without a click, so register it or the single-player
// invariant at :79 never sees it.
const leadRegistered = useRef(false);
useEffect(() => {
  if (!autoPlayLead || leadRegistered.current) return;
  leadRegistered.current = true;
  playFull(id);
  if (tone) setTone(tone);
}, [autoPlayLead, id, playFull, tone, setTone]);
```

Place it after the registry destructure at `:57–58` so `playFull` is in scope. `useRef` is
already imported at `:3`.

### 3e — Expose a readiness signal for ITEM 4

ITEM 4 needs to know when the lead film's player is actually ready. Add it here.

1. In `src/components/video/VimeoFacade.tsx`, add an optional prop to the interface at `:6–13`:
   `onReady?: () => void;` — and destructure it at `:15–22`.
2. In the `ready` branch at `:54–63`, after the existing `post(...)` calls, invoke `onReady?.()`.
3. Add `onReady` to the effect's dependency array at `:80`.
4. In `src/components/video/VideoFrame.tsx`, on the `VimeoFacade` at `:285–294`, pass:

```tsx
onReady={() => {
  if (autoPlayLead) {
    window.dispatchEvent(new Event('portfolio:leadfilm-ready'));
  }
}}
```

A `window` event rather than a prop chain, because `Curtain` is a portal sibling with no
relationship to `SelectedWorks`. Use exactly the string `'portfolio:leadfilm-ready'` — ITEM 4
listens for it verbatim.

### 3f — Optional, only if needed after ITEM 4 lands

Because `isPlayingFull` starts `true`, the `!isPlayingFull` poster branch at `:225–280` never
renders for the lead, so there is a black rectangle until the iframe paints. `VimeoFacade`
already fades its iframe in over `bg-black` (`:87`, `:92–95`), and the ITEM 4 loading screen
covers the whole first paint anyway. **Only** if a black frame is still visible after ITEM 4
is done, come back and keep the poster mounted underneath. Do not do this pre-emptively.

### Do not touch

- The hover-preview iframe at `VideoFrame.tsx:245–259` — it is already correct (`background=1`,
  `muted=1`, `autopause=0`, `bg-black`, `hoverReady` opacity gate, `colorScheme: 'dark'`).
- The 140 ms dwell timer and the single-preview teardown logic (`:100–105`, `:157–179`).
- `canHoverAutoplay()` at `:143–155`.
- The nine clips and the Conroy fan below — they stay lazy. "Zero video requests at first
  paint" refers to them, and only the lead film changes.

### Verify item 3

1. Hard-reload `/` with the cache disabled. Scroll to Selected Works. The lead film is
   **already playing**, muted, with no click. Screenshot mid-playback.
2. Network panel: exactly **one** `player.vimeo.com` document request at first paint (the lead).
   The nine clips and the fan must still fetch nothing until scrolled into view.
3. Let it run past its full duration. It restarts and keeps playing. It does **not** revert to
   the poster image.
4. Click another video in the grid. The lead collapses (single-player invariant) and the new one
   plays. This confirms 3d.
5. Toggle the sound control. The lead unmutes without reloading.
6. Mobile viewport / iOS: plays inline, does not go fullscreen. This confirms `playsinline=1`.
7. Reduced motion: verify the lead still autoplays (the user asked for it) but nothing else
   animates. If the existing `canHoverAutoplay()` reduced-motion gate is what you'd need to
   change to achieve that, **do not** — it governs hover previews only, not the lead.
8. Both gates green.

---

## ITEM 4 — Real loading screen: hold the site until fonts, page and lead film are ready

### What the user reported

> also can u make it a loading screen when i first boot the website so firstly the vidoes and
> website loads then the website shows

### Architecture — the curtain becomes the loading screen

Round 4 (item 1b) stripped `Curtain.tsx` down to a scroll-scrubbed two-leaf reveal and deleted
the weighted preloader it used to have. The user now wants a loader back. **Do not resurrect the
old component wholesale** — build the gate on top of the current 141-line file. If you want to
see how the old weighted counter was structured for reference:

```bash
git show HEAD:src/components/curtain/Curtain.tsx
```

That old version is **reference only**. Its auto-opening timeline and its fade are exactly what
round 4 removed and must not come back.

The sequence you are building:

| phase | what the visitor sees | scroll |
|---|---|---|
| first paint (SSR, pre-JS) | solid terracotta — `[data-curtain-backdrop]` at `src/app/page.tsx:18–23`, already there | n/a |
| loading | both leaves closed (today's initial state, `yPercent: 0`) + a progress readout in the bottom leaf | **locked** |
| ready | leaves still closed; readout swaps to the rotating `SCROLL` badge already at `Curtain.tsx:108–136` | **unlocked** |
| revealing | leaves split on scroll — today's mechanic, unchanged | free |

**Critical constraint:** the loader ends by *enabling scroll*, **not** by opening the leaves and
**not** by fading the page in. The reveal stays 100% scroll-driven. This is round 4's
requirement and it is not being revisited.

### 4a — Progress model

Inside `Curtain.tsx`, track a `progress` number 0→1 from three weighted signals:

| signal | weight | how |
|---|---|---|
| `document.fonts.ready` resolves | 0.35 | `await document.fonts.ready` — guard `if (document.fonts)` |
| `document.readyState === 'complete'` (or the `load` event) | 0.35 | covers images and the poster set |
| `'portfolio:leadfilm-ready'` window event | 0.30 | dispatched by ITEM 3e |

Rules:

- Progress is **monotonic** — it never decreases.
- Ease the displayed number toward the target so it climbs smoothly instead of snapping between
  three values. A GSAP tween on a proxy object, or an interpolation in a `gsap.ticker` callback,
  is fine. Do not add a dependency for this.
- Do **not** hold at 99% waiting for a signal. When all three land, go to 1.

### 4b — Hard timeout is non-negotiable

**A 2600 ms cap from mount.** When it fires, force `progress = 1` and unlock, whatever has or
has not resolved. A slow Vimeo embed or a blocked third party must never trap a visitor behind
an orange screen. Clear the timer on unmount.

### 4c — Scroll lock

`SmoothScroller` exposes Lenis two ways — `useLenis()` from `@/lib/lenis`
(re-exported at `src/components/scroller/SmoothScroller.tsx:9`) and
`window.__lenis` (assigned at `:37`). Note `SmoothScroller` **early-returns under reduced
motion** (`:25–26`), so there is **no Lenis instance at all** in that case, and `useLenis()`
also returns null on the first render before the provider's effect has run.

Lock, in this order:

1. `if ('scrollRestoration' in history) history.scrollRestoration = 'manual';`
2. `window.scrollTo(0, 0);`
3. `lenis?.stop()` — resolve `lenis` as `useLenis() ?? window.__lenis ?? null`.
4. `document.documentElement.style.overflow = 'hidden';`

Steps 1 and 2 are **not optional and must come first.** There is currently **no
`scrollRestoration` handling anywhere in `src/`** — verified. Without it, a reload from halfway
down the page restores scroll to y≈4000, then you lock it there, and the visitor is stuck
staring at orange with no way to move. This is the single worst failure mode in this item.

Step 4 exists because Lenis does not intercept every scroll path — keyboard `Space`/`PageDown`
and programmatic scrolls still get through.

Unlock, in this order, when `progress` reaches 1:

1. `document.documentElement.style.overflow = ''` — restore, do not hard-set `'auto'`.
2. `lenis?.start()`.
3. Create the ScrollTrigger scrub (see 4d).
4. `ScrollTrigger.refresh()` — once.

Restore both the `overflow` style and `history.scrollRestoration` in the effect's cleanup, so a
fast client-side navigation cannot leave the document permanently unscrollable.

### 4d — Do not arm the scrub until unlock

The scrub effect at `Curtain.tsx:39–64` currently runs as soon as `mounted` is true. It must not
be created while scroll is locked — its `end: () => \`+=${window.innerHeight}\`` would be
measured against a locked, possibly mid-restoration layout.

Gate that effect on the loader being finished as well as `mounted`, and call
`ScrollTrigger.refresh()` after it is created. Keep the `gsap.context` + `ctx.revert()` cleanup
exactly as it is — it is correct.

### 4e — Reduced motion skips the entire loader

The existing early return at `Curtain.tsx:18–29` already sets `data-curtain='off'`, collapses
`[data-curtain-runway]`, and returns before `setMounted(true)`. Under reduced motion:

- **Never lock scroll.** No `lenis.stop()`, no `overflow: hidden`, no `scrollTo(0,0)`.
- **Never render the loader.** `if (!mounted) return null` at `:66` already handles it.
- Do not touch `history.scrollRestoration`.

A reduced-motion visitor who ends up with a locked page is the worst possible outcome of this
item. Test it explicitly.

### 4f — What the loader looks like

Inside the bottom leaf, in place of / above the existing badge block at `:108–136`:

- The percentage as a number, `font-mono`, `text-ground` (dark ink on the terracotta leaf — the
  leaves are `bg-terracotta`, so `text-cream` would be near-invisible).
- A short label above or beside it. **Use a local const in `Curtain.tsx`:**
  ```tsx
  const LOADING_LABEL = 'LOADING REEL ASSETS';
  ```
  Do not add it to `src/data/content.ts` (GROUND RULE 1).
- Optionally a thin progress rule in `bg-ground/30` with a `bg-ground` fill scaled by progress.
  Use `scaleX` via a ref, not a Tailwind arbitrary value interpolating a JS number.
- When progress hits 1: hide the readout and show the existing rotating badge, which already
  uses `CURTAIN.scrollBadgePath` and `animate-spinSlow` correctly. `CURTAIN.scrollBadgeStatic`
  (`"SCROLL TO REVEAL"`, `src/data/content.ts:67`) exists and is currently unrendered — use it
  as the static label beside the badge if you want one. Reading existing keys is fine; editing
  the file is not.
- The seam wordmark halves at `:82–88` and `:99–105` stay exactly as they are.
- The whole portal keeps `pointer-events-none` (`:71`). The loader is not interactive. Do **not**
  add a skip button — the 2600 ms cap is the escape hatch.

### Do not touch

- `src/app/page.tsx` — the SSR backdrop (`:18–23`) and runway spacer (`:28–32`) are already
  correct and are what make the pre-JS first paint orange instead of dark.
- `src/components/scroller/SmoothScroller.tsx` — read Lenis from it, do not modify it.
- `src/lib/lenis.ts`.
- The `--z-curtain: 80` / `--z-curtain-base: 79` z-index contract in
  `src/app/globals.css:49`.

### Verify item 4

1. Hard-reload `/` with cache disabled and network throttled to **Fast 3G**. You see terracotta
   from the very first frame, a climbing percentage, then the badge, and only then can you
   scroll. Screenshot the loading state.
2. During loading, try to scroll with the wheel, with a trackpad, with `Space`, with
   `PageDown`, and with a touch drag on a mobile viewport. **Nothing moves** on any of them.
3. After the badge appears, scroll: the leaves split on scroll exactly as before. The page does
   **not** fade in, and the leaves do **not** open by themselves.
4. **Reload from halfway down the page.** You must land at the top, locked, then unlock
   normally. If you end up locked at a non-zero scroll offset, 4c step 1/2 is wrong.
5. Block `player.vimeo.com` in DevTools' network request blocking, then reload. The loader must
   release after ~2600 ms and the site must be fully usable. This is the 4b cap.
6. **Reduced motion:** no loader at all, no lock, page immediately scrollable, curtain off,
   runway collapsed to zero height.
7. Navigate to `/projects/` and back to `/`. Scroll still works. No leftover
   `overflow: hidden` on `<html>` (check the element's inline style in DevTools).
8. JS disabled: the SSR backdrop shows terracotta and the page below is scrollable — no
   permanent lock, because the lock is JS-only.
9. Both gates green.

---

## MEASUREMENT DISCIPLINE

Round 4 failed on headings because they were checked at one width. For ITEM 2's eight sites,
check all four:

| width | why |
|---|---|
| **390 px** | iPhone. `text-huge` and `text-mega` are at their clamp **minimum** (2.2 rem / 3.2 rem); this is where cursive accents overlap display glyphs. The user has already reported an overlap here once. |
| **768 px** | tablet / the `sm:` and `md:` boundary. `Contact.tsx:208` switches `text-huge` → `sm:text-mega` here. |
| **1024 px** | the `lg:` boundary. `Contact` and `Hero` both change grid columns here. |
| **1440 px** | desktop. Clamps are at or near **maximum** — this is where the 65 px of Taurian ink overflow is largest. |

For each site, read the real numbers out of DevTools rather than eyeballing:

- Select the `.split-mask` span → Computed → `height`. That is the mask box.
- Compare against `1.215 × font-size` for the ink height.
- Toggle `overflow` on the mask in the Styles panel and watch what appears. If glyphs appear,
  it was clipping.

Also test each of these states at least once per item:

- `prefers-reduced-motion: reduce` (DevTools → Rendering → Emulate CSS media feature)
- JavaScript disabled
- A hard reload with cache disabled

---

## REPORT FORMAT

For each item, report exactly this and nothing more:

```
ITEM <n> — <one-line title>

FILES CHANGED
  <path>:<line-range>  — <what changed, one line>

ROOT CAUSE CONFIRMED
  <one or two sentences: what you found in the code that matches the report>

MEASUREMENTS
  <the real numbers you read — mask heights, ink heights, px of padding added,
   progress weights, timing. Only for items where a number was in question.>

GATES
  npm run verify-content  →  <n> PASSED / <n> FAILED
  npm run build           →  <n>/<n> static pages, Exporting (<n>/<n>)

VERIFIED
  <each numbered check from the item's "Verify item n" block, with PASS / FAIL>

DEVIATIONS
  <anything you did differently from this doc, and why. "none" if none.>

SCREENSHOTS
  <what you captured>
```

If a gate is red, report it red. Do not report an item complete with a failing gate, and do not
move to the next item.

---

## ITEM DEPENDENCY ORDER

Run them in this order:

1. **ITEM 1** — Hero wordmark. Fully independent, small, high visual impact. Do it first to
   confirm the loop is working.
2. **ITEM 3** — Lead film autoplay/loop. Independent of 1 and 2, and it creates the
   `'portfolio:leadfilm-ready'` event that ITEM 4 consumes.
3. **ITEM 2** — Taurian clipping. The largest item: one shared component plus eight call sites
   plus measurement at four breakpoints. Do it while you still have budget for the measuring.
4. **ITEM 4** — Loading screen. **Last**, because 4a's progress model listens for the event that
   ITEM 3e adds, and because it is easier to verify a loading screen once the thing being loaded
   actually autoplays.

Do not batch. Do not run two items in one turn. Both gates after every item.
