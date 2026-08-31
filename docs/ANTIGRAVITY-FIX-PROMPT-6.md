# Antigravity — Round 6 fix spec

**Repo:** `D:\CLAUDE\neel-portfolio` · **Branch:** `master` · **Base commit:** `8564606`

Rounds 3, 4 and 5 are landed and committed. Both gates are green on `8564606`
(`verify-content` 15 PASSED / 0 FAILED; `next build` 61/61 static pages,
`Exporting (3/3)`). This round has **eight items**.

## How to work this document

- **One item per turn.** Do ITEM 1, run both gates, report, stop. Wait for the
  next prompt before starting ITEM 2. Do not batch items.
- **After every item, both gates must pass:**
  ```bash
  npm run verify-content
  ```
  ```bash
  npm run build
  ```
- If an item cannot be completed as written, stop and say exactly which
  instruction is wrong and why. Do not silently substitute a different fix.
- Every line number in this document was read from the tree at `8564606`. If a
  line does not say what this document claims, stop and report the discrepancy
  — do not guess at the intended target.

---

## GROUND RULES

1. **`src/data/content.ts` is append-only.** You may add new keys. You may
   never edit or delete an existing string. `scripts/verify-content.mjs` diffs
   it against `tests/content.lock.json` and asserts 52 unique video ids, 53
   placements, 16 sections, 15 skills, 6 services, verbatim titles/blurbs/prose/
   endpoints, zero occurrences of "DaVinci", and zero phantom Vimeo IDs.
2. **`eslint.ignoreDuringBuilds: false` and `typescript.ignoreBuildErrors: false`**
   (`next.config.mjs:7-8`). One unused import or variable is a hard build
   failure. When you delete a code path, delete its now-unused imports, state,
   refs and props in the same edit.
3. **No new runtime dependencies** except the ones ITEM 8 names explicitly
   (`nodemailer`, `@types/nodemailer`, `cross-env`).
4. **Reduced motion is a real supported mode.** Every animation you touch must
   have a `prefers-reduced-motion: reduce` path. `globals.css:276` opens a
   blanket override block; do not rely on it alone for JS-driven behaviour.
5. **The Tailwind `marquee` keyframe translates `-50%`** (`tailwind.config.ts:54`).
   Any marquee row must therefore contain **exactly two identical copies** of its
   card set. Horizontal offsets must never be applied with `translate-x-*` —
   that fights the keyframe. Use margin or `animation-delay`.
6. **Lenis** is reached through `useLenis()` (`@/lib/lenis`) or `window.__lenis`,
   and is **absent entirely under reduced motion**. Always null-check.
7. **Never set `overflow: hidden` on `<body>` or `<html>` for a modal.** Stop
   Lenis instead — `VideoModal.tsx:40-42` is the existing pattern. (The Curtain
   is the one sanctioned exception and it already restores correctly.)
8. **`assets/` is not served.** Only `public/` is. Do not reference
   `assets/Neel_logo.png` from any component.
9. **`output: 'export'`** (`next.config.mjs:3`) means there is **no server and
   no API route** in the default build. Only ITEM 8 changes this, and only in a
   way that keeps `npm run build` producing the exact same static export it
   produces today.
10. **GSAP cleanup is mandatory.** Every `gsap.context(...)` needs its
    `return () => ctx.revert()`. Every `ScrollTrigger.create` inside a context is
    reverted with it. Never leave a listener behind on unmount.
11. **The Curtain listens for `window` event `portfolio:leadfilm-ready`**
    (`Curtain.tsx:174-179`) and weights it at 0.30 of load progress. If you
    change or replace the lead-film player, that event **must still fire**, or
    the loading screen will always sit at 70% until the `MAX_LOAD_MS = 2600`
    cap (`Curtain.tsx:14`, applied at `:140`) rescues it. This is the single
    easiest thing to break this round.
12. **`-webkit-text-fill-color` overrides `color` in Blink/WebKit and is ignored
    by Firefox.** If you set one you must set both.
13. **An `<iframe>`'s CSS `background` paints *behind* the iframe's own
    document.** Setting `bg-black` on an iframe element does **not** stop the
    embedded page from painting its own light canvas. The only reliable way to
    hide a not-yet-painted Vimeo player is to keep the iframe at `opacity: 0`.
14. **`onLoad` on a Vimeo iframe fires when the player *document* loads, which
    is before the first video frame paints.** A `setTimeout(…, 250)` after
    `onLoad` is not a substitute for the player's own `play` event. Six places in
    the tree currently make this mistake; ITEM 3 fixes all of them.

---

## Measured baseline

Recorded from a running dev server against `8564606`, so you can tell whether
your change actually moved anything.

**Home page (`/`) at first paint, 1368 × 946:**

| Metric | Value |
| --- | --- |
| `<iframe src*="player.vimeo.com">` elements in DOM | **28** |
| …of those within ±200 px of the viewport | **0** |
| …`loading="eager"` | 3 (Hero reel cards) |
| …`loading="lazy"` | 25 |
| `/posters/*.webp` requests | **45** (31 unique) |
| Poster bytes transferred | **3.60 MB** |
| Total resources / transfer | 64 / **6.47 MB** |
| MBF Taurian delivered as | unsubsetted **`.otf`** (CFF), not WOFF2 |

**Timeline Selections marquee:** Row A `animation-duration: 75s`, Row B `88s`
plus a static `margin-left: -140px`. Both start running at page load, so by the
time the section is scrolled into view the rows sit at an arbitrary offset —
measured 8 s after load, Row A's first card had already advanced from x=48 to
x=−326, i.e. **374 px of the first card was clipped off-screen before the user
ever saw the section.**

**Marquee card size:** `RAIL_H = 288` is a module constant
(`SelectedWorks.tsx:17`), so a 16:9 card is a fixed **512 × 288 px at every
viewport** — 137 % of a 375 px phone's width.

**Contact headline at 1368 px:** its grid column is 604 px wide; the `h2`
computes to `font-size: 177.84px` / `line-height: 152.94px` and is **931 px
tall**; the word `WATCHING` extends to x=889 while the column ends at x=652 —
**237 px of overflow.** Line advances down the block are **125 / 175 / 225 /
275 px** — the gaps grow instead of being uniform, which is why `something` sits
low rather than centred between `CUT` and `WORTH`.

**Lightbox:** opening a Gallery tile on the home page produces a modal
containing **zero iframes and a visible Play button** — it does not autoplay.
Forcing a second click mounts the iframe, which then sits at `opacity: 0` for
over 3 s. The modal's `VideoFrame` root carries
`border: 1px rgba(214, 167, 108, 0.11)` and `border-radius: 8px` inside a
`rounded-2xl` card — that warm 1 px hairline on black is the "white thin strip
on the edge of player".

**Header:** `<nav>` is `hidden md:flex` (`Header.tsx:100`) and the ENQUIRE CTA is
`hidden sm:inline-block` (`Header.tsx:166`). There is **no hamburger, no drawer,
and no nav in the footer**. Below 768 px the site has zero navigation links.

---

## ITEM 1 — One ambient-reel component; the lead showreel loses its player chrome

**User ask:** *"the selected works absolute cinema showreel should play in loop
without audio and pause thing just like the conroy show reel."*

### The problem

The Conroy showreel (`SelectedWorks.tsx:365-385`) is a poster plus a
`background=1&muted=1&loop=1` iframe with no controls — a clean ambient loop.
The Absolute Cinema lead film (`SelectedWorks.tsx:264-274`) instead renders
`<VideoFrame … autoPlayLead={true} />`, and `VideoFrame` renders `PlayerChrome`
(`VideoFrame.tsx:313-320`) whenever `isPlayingFull` is true — which
`autoPlayLead` makes true at mount (`VideoFrame.tsx:40`). So the lead film shows
a pause button, a mute button, `0:13 / 0:30`, a progress bar and a fullscreen
button. Confirmed visible at 375 px.

There are now **four** near-identical copies of the "poster + muted looping
background iframe" block, all with the same `onLoad`-plus-250 ms reveal bug:

| Location | Lines | Notes |
| --- | --- | --- |
| `Hero.tsx` — `HeroReelCard` | `51-70` | iframe `:59-69`, `loading="eager"` `:67` |
| `SelectedWorks.tsx` — `MarqueeReelCard` | `39-58` | iframe `:47-57` |
| `SelectedWorks.tsx` — Conroy hero | `366-384` | iframe `:373-383` |
| `SelectedWorks.tsx` — Conroy fan hover | `441-459` | iframe `:449-459` |

### What to build

Create **`src/components/video/AmbientReel.tsx`** — the single implementation of
"muted looping background reel that reveals only once it is actually playing and
opens the lightbox when tapped". Then replace all four blocks above **and** the
lead film with it.

```
interface AmbientReelProps {
  id: string;
  title: string;
  slug: string;
  aspect: string;
  duration?: number;
  tone?: string;
  /** 720p default; 540p for the small fan cards, 1080p for the lead film. */
  quality?: '540p' | '720p' | '1080p';
  /** next/image sizes hint. */
  sizes?: string;
  /** Only the lead film passes true — it is the LCP element. */
  priority?: boolean;
  /** Fires portfolio:leadfilm-ready on first play. Lead film only. */
  signalsLeadReady?: boolean;
  /** Tap/Enter/Space opens the lightbox. Default true. */
  interactive?: boolean;
  className?: string;
}
```

Requirements:

- **No chrome of any kind.** No `PlayerChrome`, no play/pause, no mute button,
  no progress bar, no timecode, no fullscreen button. `PlayerChrome.tsx` stays
  in the tree — the lightbox still uses it (ITEM 2) — but `AmbientReel` never
  imports it.
- **Always muted, always looping.** The URL must carry
  `background=1&autoplay=1&loop=1&muted=1&playsinline=1&autopause=0&dnt=1`.
  `muted=1` is not optional: Chrome blocks an unmuted autoplaying iframe
  outright, and the user asked for "without audio".
- **Add `api=1&player_id=<id>`** to the URL. ITEM 3 needs the postMessage
  channel to know when the player is really playing, and `background=1` alone
  does not give you one.
- **Keep the existing bottom scrim** (`bg-gradient-to-t from-ground/70 via-transparent
  to-transparent`, `SelectedWorks.tsx:58` / `Hero.tsx:70`) so the card captions
  stay legible.
- **Poster underneath, never unmounted.** Reuse the existing
  `/posters/<id>.webp` convention and pull the blur placeholder from
  `@/data/lqip.json` exactly as `VideoFrame.tsx:71` and `:248-249` do. The four
  blocks you are replacing currently render `<Image>` with **no**
  `placeholder`/`blurDataURL` — adding it is part of ITEM 3 and you should build
  it in from the start here.
- `pointer-events-none` on the iframe, with the click handler on the wrapper —
  otherwise the Vimeo iframe swallows the tap and ITEM 2 cannot work.

### Wiring the lead film

Replace `SelectedWorks.tsx:264-274` (`<VideoFrame … autoPlayLead={true} />`)
with `<AmbientReel … priority signalsLeadReady quality="1080p" />`.

> **Trap — read GROUND RULE 11 again.** Today the Curtain's 0.30 load-progress
> signal comes from `VideoFrame.tsx:299-303`, which fires
> `portfolio:leadfilm-ready` from `VimeoFacade`'s `onReady`. Once the lead film
> is an `AmbientReel`, **`AmbientReel` must fire that event itself** on its first
> real play, gated by `signalsLeadReady`. Fire it exactly once. If you skip this,
> the loading screen freezes at 70 % for 2.6 s on every cold load and you will
> not notice unless you hard-reload with the cache disabled.

> **Trap.** Deleting the lead film's `autoPlayLead` usage makes several things in
> `VideoFrame.tsx` unreachable from `SelectedWorks`: the mount-time registration
> effect (`:63-69`), the `onEnded` loop guard (`:304-307`) and the
> `signalsLeadReady` dispatch (`:299-303`). **Do not delete them** —
> `project/[slug]/page.tsx:119-128` still passes `autoPlayLead={true}`, and ITEM
> 2 relies on the prop for the lightbox. Leave `VideoFrame` intact.

### Verify item 1

- Load `/`. The Absolute Cinema lead film loops silently with **no** pause
  button, mute button, timecode, progress bar or fullscreen button anywhere on
  or over it. Confirm at 390 px and 1440 px.
- It is visually indistinguishable in chrome from the Conroy showreel below it.
- Hard-reload with an empty cache and DevTools throttled to Fast 3G. The Curtain
  percentage reaches 100 % **because the lead film reported ready**, not because
  the 2600 ms cap fired. Prove it: `performance.now()` at the moment the curtain
  opens should be well under 2600 ms on a warm connection, and
  `portfolio:leadfilm-ready` must appear exactly once in a
  `window.addEventListener('portfolio:leadfilm-ready', …)` counter.
- No audio plays at any point without a user gesture.
- Hero reel cards, marquee cards, Conroy hero and Conroy fan hover cards all
  still autoplay and loop as before — you replaced their implementation, not
  their behaviour.
- `git diff --stat` shows `Hero.tsx` and `SelectedWorks.tsx` **shrinking**. If
  the diff grows, you added a fifth copy instead of consolidating.

---

## ITEM 2 — Tapping any reel anywhere on the site opens the lightbox player

**User ask:** *"in the whole website if someone taps on any of the reels
autoplaying on loop or just a normal player reel it opos and whowsthe player
just like in image 2 (the player enola holms is just for refrence)."*

Image 2 is the existing `VideoModal` — centred card, title bar reading
`ENOLA HOLMES` / `4:3 · 24S`, close X, video, and bottom chrome with
pause · mute · `0:15 / 0:24` · progress · fullscreen. **That UI is the target and
it already exists** in `src/components/video/VideoModal.tsx` +
`PlayerChrome.tsx`. Do not rebuild it. The work is (a) routing every reel into
it and (b) fixing the bug that stops it playing.

### 2a — Fix the race that leaves the lightbox dead

**Reproduce first:** load `/`, scroll to Gallery, click a tile. The modal opens
showing a **poster and a Play button, with zero iframes in the DOM.** A second
click is needed to start it. This is the "tap a reel, get a dead player"
symptom.

**Cause.** `VideoModal.tsx:125` passes `autoPlayLead={true}`, so the modal's
`VideoFrame` initialises `isPlayingFull = true` (`VideoFrame.tsx:40`). Two
effects then run in the same commit:

- `:63-69` registers the modal's video: `playFull(id)`.
- `:89-93` enforces the single-player invariant:
  `if (activeFullId && activeFullId !== id && isPlayingFull) setIsPlayingFull(false)`.

`playFull(id)` is a Zustand `set`, so it does not update the `activeFullId`
already captured in this render's closure. The home page's lead film registered
itself first, so `:89-93` still sees `activeFullId === leadFilm.id`, concludes
the modal is a stale second player, and switches it off.

**Fix.** Make the invariant read the store at call time rather than trusting a
captured value — e.g. have `:89-93` compare against
`useVideoRegistry.getState().activeFullId`, or register synchronously before the
sync effect can observe a stale id, or gate `:89-93` behind a ref that skips the
first commit after this instance registered itself. Any of these is acceptable;
what is not acceptable is deleting the invariant. **Two full-volume players must
never be able to play at once** — that is what it exists to prevent.

> **Trap.** Do not "fix" this by removing `autoPlayLead` from
> `VideoModal.tsx:125`. That trades autoplay-on-open for a dead modal, which is
> the bug.

> **Trap.** After the fix, opening the lightbox must **pause or stop whatever was
> playing behind it** — including the ambient lead film. Verify the page does not
> end up with two audio-capable players live at once.

### 2b — One shared lightbox for the whole site

`VideoModal` state is currently duplicated in exactly two places
(`SelectedWorks.tsx:87` + `:222`, `Gallery.tsx:22` + `:160`), which is why the
other three surfaces have no lightbox at all.

Create **`src/components/video/LightboxProvider.tsx`**:

- A context exposing `{ open(work: ModalWork): void; close(): void }` via a
  `useLightbox()` hook.
- The provider owns the `ModalWork | null` state and renders exactly one
  `<VideoModal>`.
- Mount it **once** in `src/app/layout.tsx`, wrapping `children`, so every route
  gets it.
- `useLightbox()` outside the provider should throw a clear error rather than
  return undefined — that turns a wiring mistake into a build/dev-time failure
  instead of a dead tap.

Then remove the local modal state from `SelectedWorks.tsx` and `Gallery.tsx` and
route **every** reel surface through `open()`:

| Surface | Anchor | Today | After |
| --- | --- | --- | --- |
| Home — lead film | `SelectedWorks.tsx:264` | no tap handler | opens lightbox |
| Home — Hero reel cards (×3) | `Hero.tsx:47` | no tap handler | opens lightbox |
| Home — marquee cards | `SelectedWorks.tsx:32` | no tap handler | opens lightbox |
| Home — Conroy showreel | `SelectedWorks.tsx:364` | no tap handler | opens lightbox |
| Home — Conroy fan cards | `SelectedWorks.tsx:410` | ✅ local state | via context |
| Home — Conroy mobile grid | `SelectedWorks.tsx:499` | ✅ local state | via context |
| Home — Gallery tiles | `Gallery.tsx:231` | ✅ local state | via context |
| `/projects` grid | `projects/page.tsx:61` | **no modal on page** | opens lightbox |
| `/project/[slug]` related | `project/[slug]/page.tsx:211` | **no modal on page** | opens lightbox |

`AmbientReel` (ITEM 1) calls `open()` from its own wrapper when
`interactive !== false`. The `/project/[slug]` hero player at `:119-128` is
already the full-size player for that page — leave it playing inline, do not
make it open a lightbox on top of itself.

Accessibility, non-negotiable:

- Every tappable reel is a real `<button>` (or has `role="button"` +
  `tabIndex={0}` + Enter/Space handlers) with an `aria-label` naming the work.
- Keep the existing `data-cursor` hints so the custom cursor still reads
  correctly — `"Zoom"` on Gallery tiles (`Gallery.tsx:233`), `"Play"` elsewhere.
- `VideoModal` already handles Escape (`:44-49`), focus restore (`:37`, `:67-69`)
  and Lenis stop/start (`:40-42`, `:54-56`). Do not regress any of it. Add a
  focus trap if it is missing — Tab must not escape the open dialog.

### Verify item 2

- On `/`, tapping each of these opens the lightbox and the video **starts playing
  by itself, first tap, no second click**: lead film, each of the 3 Hero reel
  cards, a marquee card in Row A, a marquee card in Row B, the Conroy showreel, a
  Conroy fan card, a Conroy mobile-grid card, a Gallery tile.
- The lightbox shows the image-2 chrome: title, `<aspect> · <duration>S`, close
  X, and the bottom pause / mute / `m:ss / m:ss` / progress / fullscreen row.
- On `/projects`, tapping a card opens the lightbox (it previously could not).
- On `/project/mumbai`, tapping a *related* card opens the lightbox; the page's
  own hero player keeps playing inline and does **not** open a lightbox.
- Escape closes. Clicking the backdrop closes. Focus returns to the card you
  came from. Tab does not escape the dialog.
- Open and close the lightbox 10 times in a row. `document.querySelectorAll('iframe[src*="vimeo"]').length`
  returns to its pre-open value each time — no iframe leaks.
- With the lightbox open, only **one** player has audio capability. Enable audio
  in the header, open the lightbox, and confirm you do not hear two overlapping
  soundtracks.
- Reduced motion on: taps still open the lightbox.

---

## ITEM 3 — No player ever shows a white frame or a light edge

**User ask:** *"there is a bug which shows in the player of image 2 the white
thin strip on the edge of player. and its in every player so its like if the vid
is not loaded it shows white screen in the place of the video make it not show
the white screen instead replace it with the transparent blur so it doesnt look
bad"* … *"see image 4 shows the white scren on a video which is not loaded fix
that."*

These are **three** distinct defects. Fix all three.

### 3a — The white/light flash where the video should be

**Cause.** Six places reveal a Vimeo iframe on `onLoad` plus a 250 ms timeout:

| File | Line |
| --- | --- |
| `Hero.tsx` | `62` |
| `SelectedWorks.tsx` (marquee) | `50` |
| `SelectedWorks.tsx` (Conroy hero) | `376` |
| `SelectedWorks.tsx` (Conroy fan) | `452` |
| `VideoFrame.tsx` (hover preview) | `261` |
| `VimeoFacade.tsx` | `95` |

Per GROUND RULE 14, `onLoad` fires when the player *document* loads — well
before the first video frame paints. Per GROUND RULE 13, the iframe element's
`bg-black` paints *behind* that document, so it cannot mask it. The result is a
window in which Vimeo's own light player shell is displayed at
`opacity: 100`. Measured: after a forced play in the lightbox the iframe was
still at `opacity: 0` after 3 s, so 250 ms is not remotely enough.

**Fix.** Reveal on the player's own play event, not on `onLoad`:

- Add `api=1&player_id=<id>` to every ambient iframe URL (ITEM 1 already does
  this for `AmbientReel`; `VideoFrame.tsx:259`'s hover preview needs it too).
- Listen for the postMessage `play` (and `playing`) event, reusing the exact
  origin and `player_id` validation already in `VimeoFacade.tsx:47` and `:54` —
  `if (e.origin !== 'https://player.vimeo.com') return;` and the `player_id`
  filter. **Do not weaken either check.**
- Only then transition the iframe from `opacity: 0` to `opacity: 100`.
- **Watchdog:** if no play event arrives within 6000 ms, stay on the poster
  forever. Never reveal an iframe you have not seen paint. A permanently
  poster-only card is an acceptable outcome; a white rectangle is not.
- Replace the `250` timeouts; do not layer a play listener on top of them.

### 3b — The fallback beneath must be a blurred poster, not white or black

The user asked for "the transparent blur". `VideoFrame.tsx` already does this
correctly at `:71` and `:248-249` — it reads `@/data/lqip.json` and passes
`placeholder={lqip ? 'blur' : 'empty'}` + `blurDataURL={lqip}` to `next/image`.

The four ambient blocks do **not**: `Hero.tsx:51-57`,
`SelectedWorks.tsx:39-45`, `:366-372` and `:441-447` all render a bare `<Image>`
with no placeholder. Give every reel the LQIP blur (ITEM 1's `AmbientReel`
covers four of them at once).

Layer order, bottom to top, for every reel and the lightbox:

1. LQIP blur — visible instantly, inline base64, zero network cost.
2. `/posters/<id>.webp` — fades in over the blur.
3. Vimeo iframe at `opacity: 0` → `100`, gated on the real play event (3a).
4. Existing bottom scrim gradient.

If a poster 404s, the blur must still be showing — so never make the blur
conditional on the poster having loaded.

### 3c — The light hairline around the lightbox player

**Cause, measured.** Inside the modal, the `VideoFrame` root
(`VideoFrame.tsx:222-228`, decoration at `:225`) applies
`rounded-lg bg-ground-2 border border-line-2`. `--line-2` is
`rgb(214 167 108 / 0.11)` (`globals.css:38`) — a warm cream at 11 %. Against the modal's black video well (`VideoModal.tsx:116`) that renders as
a **1 px light hairline**, and its `border-radius: 8px` sits inside the card's
`rounded-2xl` (`VideoModal.tsx:89`), producing a visible double-radius seam at
each corner.

**Fix.** Give `VideoFrame` a way to drop its own frame decoration when it is the
content of a container that already provides one — e.g. a `bare?: boolean` prop
(default `false`, so no existing call site changes) that suppresses
`rounded-lg`, `border border-line-2` and the hover lift. Pass `bare` from
`VideoModal.tsx:117`.

Also close the letterbox gap: `VideoModal.tsx:126` passes
`className="w-full max-h-[75vh]"` while `VideoFrame` sets an
`aspect-*` class from `getAspectClass` (`:74-86`). On a short, wide window
`max-h` wins, the element stops matching its aspect ratio, and the black wrapper
shows as bars. Size the well so the player always matches the work's true aspect
inside the available box — `object-fit`-style containment, not a hard `max-h`
clamp on an aspect-locked element.

> **Trap.** `border-0` alone will not remove the seam — `rounded-lg` on the inner
> element inside `rounded-2xl overflow-hidden` still shows at the corners.
> Remove the radius too.

### Verify item 3

- DevTools → Network → throttle to **Slow 3G**, disable cache, hard-reload `/`.
  Screenshot every reel during loading. **Not one white or light rectangle
  anywhere** — every unpainted reel shows a blurred poster.
- Repeat at 390 px.
- Open the lightbox on Slow 3G. During the wait you see a blurred poster, never
  white, never a bare black box.
- Inspect the lightbox player's computed style: `border-width: 0px` and
  `border-radius: 0px` on the `VideoFrame` root. No light hairline at any of the
  four corners at 100 %, 200 % and 400 % browser zoom.
- Block `player.vimeo.com` entirely in DevTools → Network request blocking and
  reload. Every reel sits on its blurred poster indefinitely. No white frames, no
  console errors, no thrown exceptions.
- Point one reel at a Vimeo id that does not exist. After 6 s it is still on its
  poster.
- Confirm the origin check at `VimeoFacade.tsx:47` and the `player_id` filter at
  `:54` are byte-for-byte intact.

---

## ITEM 4 — Timeline Selections: faster rows, deterministic start position

**User ask:** *"in image 1 in the timeline selections make the speed of both rows
a bit more and aslo start the carousel from the frame i left of in image 1."*

### 4a — Speed

`SelectedWorks.tsx:299` gives Row A `animate-marquee-slow`
(`tailwind.config.ts:71` → `marquee 75s linear infinite`); `:315` overrides Row B
to `88s`.

Make both faster while keeping them desynchronised — the 1.17 : 1 ratio is what
stops the rows visually locking together:

- Row A: **75s → 48s**
- Row B: **88s → 56s**

Do it with an arbitrary-value utility on Row B (`[animation-duration:56s]`) as
the file already does, and either add a `marquee-mid` animation to
`tailwind.config.ts` for Row A or give it `[animation-duration:48s]`. Do **not**
change the shared `marquee-slow` token — grep first; if anything else uses it,
changing it moves that too.

### 4b — Deterministic start

**The real problem, measured.** Both rows start animating at page load. The
section sits ~3830 px down the page. Eight seconds after load, Row A had
advanced from x=48 to x=−326: **374 px of card 1 sliced off before the section
was ever on screen.** Whatever frame the user "left off" at, what they come back
to is an arbitrary function of how long the tab has been open.

**Fix.** Do not run the marquee until the rail is on screen.

- Start both rows at `animation-play-state: paused`.
- Flip to `running` when the rail container enters the viewport, using a
  `ScrollTrigger` with `once: true` inside the existing
  `gsap.context` (`SelectedWorks.tsx:142-209`) — `:201-208` is the pattern to
  copy. `railContainerRef` already exists at `:97` and is attached at `:280`.
- Once started, never pause again. Scrolling away and back must not reset or
  jump — the row keeps its position, which is exactly "carry on from the frame I
  left off at".

This makes the first frame the user ever sees **deterministic**: Row A's card 1
sits flush with the shell content-box left edge.

**Replace Row B's `ml-[-140px]`** (`SelectedWorks.tsx:312`) with a negative
animation delay — `[animation-delay:-18s]` on its 56 s cycle. Reason: with the
rows paused at rest, a negative delay holds Row B at t=18 s, so it is still
visibly offset from Row A (which the user asked for in round 3), but the offset
now comes from the animation itself instead of a static margin that permanently
clips card 1 and mismatches the two rows' scroll extents.

> **Trap.** GROUND RULE 5 — the `-50%` keyframe requires exactly two identical
> copies per row. `:302-307` and `:318-323` each render their set twice. Keep it
> that way. Do not "optimise" one copy away, and do not add a third.

> **Trap.** Under reduced motion, `:299` and `:313-316` already drop the
> animation class entirely. A paused-then-running play-state must not
> reintroduce motion in that mode: with reduced motion on, there is no animation
> to start, so make sure the ScrollTrigger either is not created or is harmless.

### Verify item 4

- Reload `/`, wait 30 s **without scrolling**, then scroll to Timeline
  Selections. Row A's first card's left edge equals the shell content-box left
  edge (48 px at 1368 px). Read it with
  `document.querySelector('[class*="animate-marquee"]').firstElementChild.getBoundingClientRect().left`.
  Compare against the baseline's −326.
- Scroll past the section and back. No jump, no restart — position is continuous.
- Both rows are visibly faster than before and clearly not in lockstep.
- Row B is still visually offset from Row A at rest.
- Reduced motion: both rows static, all cards reachable, no clipped-off first
  card.
- No horizontal page scrollbar at 390 / 768 / 1024 / 1440 px.

---

## ITEM 5 — "Let's cut something worth WATCHING": even spacing, inside its column

**User ask:** *"image 3 shows the lets cut something part make something spacing
even so its in the middle."*

### The problem, measured at 1368 px

The headline is `Contact.tsx:208-217`, in a `lg:col-span-6` cell **604 px** wide.

- `h2` computes to `font-size: 177.84px`, `line-height: 152.94px`, height
  **931 px**.
- Every word wraps onto its own line: `Let's` / `cut` / `something` / `worth` /
  `WATCHING`.
- `WATCHING`'s ink reaches x=889; the column ends at x=652. **237 px of
  overflow.**
- Line advances down the block: **125 / 175 / 225 / 275 px** — they grow. The
  `something` line therefore sits low in its slot rather than centred between
  `CUT` and `WORTH`. This is the "spacing not even" the user is pointing at.
- `something` also starts at x=56 while every other line starts at x=48, because
  of `mx-1 sm:mx-2` on the script span (`:210`).

Two causes:

1. `sm:text-mega` (`:208`) is `clamp(3.2rem, 13vw, 11.5rem)` — a viewport-width
   scale applied to text in a half-width column. At 1368 px that is 177.84 px in
   a 604 px box. Note also that `sm:text-mega` carries its own
   `lineHeight: 0.86` (`tailwind.config.ts:34`), which **silently overrides the
   `leading-[0.9]`** written on the same element.
2. The script span (`:210-212`) mixes `text-[1.32em]`, `leading-[0.6]` and
   `-my-[0.24em]`. Its line box is 119.95 px inside a 152.94 px context, and the
   asymmetric result of those three values against the surrounding Taurian caps
   is what makes the advances grow.

### The fix

**Fit the column.** Replace the `text-huge sm:text-mega` pair with a single
scale whose maximum keeps `WATCHING` inside 604 px. Measured ink-width ratio for
`WATCHING` in MBF Taurian is ≈ 4.73 × font-size, so the cap must be ≤ 127 px;
use **`clamp(2.2rem, 8.2vw, 7.5rem)`** (112 px at 1368 px, 120 px ceiling).
Set the line-height explicitly *after* the font-size utility so it actually
wins — verify in computed styles rather than assuming.

**Make the vertical rhythm uniform.** Every line advance must equal the `h2`'s
computed `line-height`, ±2 px, including the `something` line. Normalise the
script span: one line-height that matches the h2's, and a single symmetric
vertical offset (or none) instead of the current
`leading-[0.6]` + `-my-[0.16em]/-0.2em/-0.24em` stack. Ephesis has a much
smaller cap height than Taurian at the same nominal size, so keep a modest
`text-[1.2em]`-ish optical bump — but the *box* it occupies must be one normal
line.

**Even the left edge.** Drop the horizontal `mx-1 sm:mx-2` so `something` starts
at the same x as `Let's`, `cut`, `worth` and `WATCHING`.

> **Trap.** `CONTACT_COPY.headlinePrefix` is `"Let's cut "` and `headlineMiddle`
> is `" worth "` — with significant leading/trailing spaces. `SplitText` splits
> on `' '`, so these emit **empty trailing word tokens** plus
> `white-space: pre` spacer spans. Do not "clean up" those strings: GROUND RULE 1
> makes them immutable. Handle the spacing in CSS.

> **Trap.** `SplitText` wraps each unit in `.split-mask`, which GSAP sets to
> `overflow: hidden` for the reveal and back to `visible` on complete
> (`SplitText.tsx:42`, `:45`, `:59-61`). If you shrink line-heights here you can
> reintroduce the round-5 clipping bug. Re-check that all of `GALLERY`,
> `The toolkit`, `WHAT I deliver`, `THANK YOU`, `Timeline selections` and
> `Conroy Campaign` still render uncut — at `8564606` every one of them measures
> element height ≈ computed line-height with zero right overflow, and it must
> stay that way.

### Verify item 5

- At 1368 px: no descendant of the `h2` extends past its grid column. Check with
  `[...h2.querySelectorAll('span')].map(s => s.getBoundingClientRect().right)` —
  the maximum must be ≤ the column's right edge (652). Baseline was 889.
- Collect each line's top offset. Consecutive advances are all equal within
  ±2 px. Baseline was 125 / 175 / 225 / 275.
- Every line — including `something` — shares the same left x.
- Screenshot at 390 / 768 / 1024 / 1440 px. `something` reads as evenly spaced
  between `CUT` and `WORTH` at all four.
- The headline does not collide with the form card in the right-hand column at
  any width.
- No new horizontal page overflow.

---

## ITEM 6 — Mobile

**User ask:** *"MAKE SURE TO CHECK THE WHOLE MOBILE PREVIEW OF THE WEBSITE TO
MAKE IT DYNAMIC FOR MOBILE USERS TOO."*

### 6a — There is no mobile navigation at all (highest priority)

Measured: `Header.tsx:100` is `<nav className="hidden md:flex …">` and
`Header.tsx:166` is `className="hidden sm:inline-block"`. There is no hamburger,
no drawer, and `<footer>` contains no `<nav>`. **Below 768 px the site exposes
zero navigation links; below 640 px it also loses ENQUIRE.** The only way to
reach About / Works / Gallery / Toolkit / Services / Contact on a phone is to
scroll the entire 17 992 px document.

Add a mobile menu:

- A hamburger button visible below `md`, in the header's action cluster
  (`Header.tsx:124-171`), ≥ 44 × 44 px hit area, with `aria-expanded`,
  `aria-controls` and an `aria-label`.
- A drawer or full-screen sheet containing the same six destinations as
  `:101-118` — reuse those exact `href`s and label strings — plus ENQUIRE.
- Closes on: link tap, Escape, backdrop tap, and route change.
- Locks scroll while open **via Lenis** (GROUND RULE 7), not `overflow: hidden`.
- Focus moves into the drawer on open, is trapped while open, and returns to the
  hamburger on close.
- Sits below the Curtain in the z-order — the contract is in `globals.css:45-49`
  (`--z-header: 30`, `--z-modal: 70`, `--z-curtain: 80`). Use `--z-header`, which
  the header already reads at `Header.tsx:65`.
- `ScrambleText` on the desktop nav labels is a hover effect; do not put it in
  the drawer, where there is no hover.

### 6b — Marquee cards are wider than the phone

`RAIL_H = 288` (`SelectedWorks.tsx:17`) is a module constant, so `MarqueeReelCard`
computes a fixed `width: RAIL_H * ratio` (`:34`) — **512 × 288 px on a 375 px
viewport.** Make the rail height responsive, e.g. 168 px below `sm`, 224 px below
`lg`, 288 px above (card widths 299 / 398 / 512 at 16:9). Drive it from CSS
custom properties or a matchMedia-backed state — but note `:34` and `:37` are
inline `style` values, so a pure Tailwind class swap will not reach them.

### 6c — The lead-film label row collides

`SelectedWorks.tsx:254-258` is a `flex … justify-between` with
`✦ LEAD FILM · ABSOLUTE CINEMA` on the left and
`MUMBAI · 16:9 · 30S` on the right. At 375 px both sides wrap to two lines and
overlap. Stack it vertically below `sm`.

### 6d — Sweep the rest

Walk the whole page at **390 px** and **360 px** and fix what you find. Known
things to check specifically:

- Tap targets: every button/link ≥ 44 × 44 px. The header's grid and audio
  toggles (`Header.tsx:126-160`) are currently `px-2.5 py-1`.
- Hover-only affordances that a phone can never trigger: the Gallery zoom button
  is `opacity-0 group-hover:opacity-100` (`Gallery.tsx:249`) — invisible on
  touch. `VideoFrame.canHoverAutoplay()` (`:153-165`) correctly gates hover
  autoplay off for coarse pointers; make sure nothing *else* hides functionality
  behind hover.
- The Conroy fan is `hidden sm:flex` with a `grid sm:hidden` fallback
  (`:398`, `:490-493`) — confirm the fallback is complete and tappable.
- `100svh` / `100dvh` correctness with a mobile URL bar: the Curtain leaves are
  `h-[50svh]` and the runway is `h-[100svh]` (`page.tsx`).
- Text: no clipped glyphs, no overflow. At `8564606` all Taurian headings measure
  clean at 375 px — keep it that way.
- No horizontal page scroll: `document.documentElement.scrollWidth === window.innerWidth`.
  It holds at `8564606` (375 / 375); it must still hold.
- The form's inputs are ≥ 16 px so iOS Safari does not zoom on focus.

### Verify item 6

- At 390 px, all six nav destinations plus ENQUIRE are reachable in ≤ 2 taps
  from the top of the page.
- Drawer: opens, traps focus, closes on link tap / Escape / backdrop / route
  change, and scroll is restored every time. Open and close it 10 times, then
  confirm the page still scrolls.
- `document.documentElement.scrollWidth === window.innerWidth` at 360, 390, 414,
  768, 1024 and 1440 px.
- No marquee card is wider than the viewport at 390 px.
- Every reel is tappable and opens the lightbox on a touch device (emulate touch,
  not just a narrow window — Chrome's mobile preset switches the pointer type).
- Screenshot the full page top to bottom at 390 px. No overlap, no clipping, no
  element hidden behind the fixed header.
- Reduced motion at 390 px: everything reachable and readable.

---

## ITEM 7 — Make the whole site load fast and stay smooth

**User ask:** *"ASLO MAKE THAT ALL THE OVERALL WEBSITE LOADS FAST AND BUTTERY
SMOOTH."*

### The measured problem

On `/` at first paint, before the user has scrolled at all:

- **28 Vimeo player iframes in the DOM. Zero of them within ±200 px of the
  viewport.** Three are `loading="eager"` (`Hero.tsx:67`) so they fetch
  unconditionally; the other 25 rely on `loading="lazy"`, whose viewport margin
  Chrome sets generously and which never *unloads* an iframe once fetched.
- **45 poster requests, 31 unique, 3.60 MB** — largely because each marquee row
  renders its 12-card set twice (required by the `-50%` keyframe) for a rail
  3830 px below the fold.
- **6.47 MB total transfer across 64 resources.**
- MBF Taurian ships as an **unsubsetted `.otf`** (CFF outlines) rather than a
  subset WOFF2 — larger, and slower to parse.

Cross-origin iframe navigations do not appear in the Resource Timing API, so the
Vimeo byte total is not in the numbers above. **Measure it yourself** in
DevTools → Network filtered to `player.vimeo.com`, before and after, and report
both.

### What to do

**Gate ambient players on the viewport.** This is the single biggest win and it
belongs inside `AmbientReel` (ITEM 1), so it lands in one place for all four
surfaces:

- Do not mount the iframe until the card is within ~200 px of the viewport
  (`IntersectionObserver`, `rootMargin: '200px'`).
- **Unmount** it when the card is more than ~600 px away, setting
  `src = 'about:blank'` before removal — `VideoFrame.teardownHover()`
  (`:96-108`) is the existing pattern for this and it is correct; copy it.
- Cap concurrent ambient players at **4**. Beyond that, cards stay on their
  posters until a slot frees. `useVideoRegistry` already models
  single-full/single-preview; extend it rather than inventing a parallel
  registry.
- The lead film is exempt — it is the LCP element and must start immediately.
- Remove `loading="eager"` from the Hero cards; with an observer it is actively
  harmful.

**Cut the poster bill.** Only the lead film gets `priority`. Everything below
the fold is `loading="lazy"`. The marquee's duplicate card set must not
double-fetch — same URL, so ensure they are genuinely identical requests and let
the HTTP cache dedupe; if the two copies are producing two requests, that is a
bug to fix. Consider `content-visibility: auto` with a
`contain-intrinsic-size` on the below-fold sections — `projects/page.tsx`
already does exactly this on its cards and is the pattern to copy.

**Subset the display font.** Convert `public/fonts/mbf-taurian.otf` to a
Latin-subset WOFF2 and register it in `src/lib/fonts.ts` alongside the existing
`bodoniModa` entry. Keep the OTF as a fallback source in `Fonts/` but do not
ship it. `sharp` is already available for image work; use `fonttools`/`woff2` or
an equivalent for the font. **Do not** subset away any glyph the site actually
renders — the Taurian headings include `'`, `&`, digits, `·` and `✦`. Enumerate
the glyphs used across `content.ts` and the hard-coded headings first.

**Do not regress correctness for speed.** Specifically: the poster never
unmounts while a card is visible (this is the existing R-30 Rule 4 and it is why
there is no flash today), the 140 ms hover dwell timer stays
(`VideoFrame.tsx:176-178`), and the `canHoverAutoplay()` gates for coarse
pointers, reduced motion, `saveData` and 2g/3g (`:153-165`) stay exactly as they
are.

**Smoothness.** Animate only `transform` and `opacity`. Audit for layout
thrash — `Header.tsx:38-44` reads `el.offsetTop` inside a scroll handler for all
seven sections on every scroll event, which forces layout each time; cache the
offsets and recompute on resize / `ScrollTrigger.refresh()` instead. Keep
`will-change` off anything that is not currently animating.

### Targets

- Before the first user scroll on `/`: **≤ 1.2 MB** transferred and **≤ 12**
  requests (from 6.47 MB / 64).
- **Zero** Vimeo iframes in the DOM for cards more than 200 px from the
  viewport. **≤ 4** ambient players alive at any moment, **≤ 3** on a 390 px
  viewport.
- Lighthouse mobile Performance **≥ 85** on a production build served from
  `out/` (`npm run build` then the `portfolio-prod` launch config on port 5180).
  Report the before and after scores.
- No CLS regression: the Curtain must still hold layout until ready.

### Verify item 7

- `npm run build`, serve `out/`, hard-reload with an empty cache. Record
  transfer size, request count and `document.querySelectorAll('iframe[src*="vimeo"]').length`
  at first paint. Compare against 6.47 MB / 64 / 28.
- Scroll slowly to the bottom, then back to the top. At every point,
  `iframe[src*="vimeo"]` count stays ≤ 4 (≤ 3 at 390 px), and iframes for
  off-screen cards are gone from the DOM, not merely hidden.
- Lighthouse mobile before and after, both numbers reported.
- Performance panel recording of a full scroll: no long tasks > 200 ms, no
  layout-thrash warnings from the header scroll handler.
- All of ITEM 1–3's behaviour still holds: reels autoplay when they come into
  view, no white frames, taps open the lightbox.
- Reduced motion and JS-disabled both still render a complete, readable page.

---

## ITEM 8 — Make the contact form actually send mail, over SMTP

**User ask:** *"the form in the image 3 i want it to work use smtp library to do
so and tell antigravity to give steps of how should i generate the google email
api key to put and make it work."*

### Read this before writing any code

Two things about the request need stating plainly:

1. **SMTP needs a server. This project has none.** `next.config.mjs:3` sets
   `output: 'export'`, which emits static HTML and forbids API routes entirely.
   `nodemailer` is a Node library; it cannot run in the browser, and shipping
   SMTP credentials to the browser would publish the mailbox password to anyone
   who opens DevTools. So enabling SMTP means introducing a server-side build
   target.
2. **There is no such thing as a "Gmail API key" for sending mail.** Gmail
   offers two mechanisms: an **App Password** (a 16-character password for SMTP,
   which is what you want here) and the **Gmail API** (OAuth2 with a client id,
   client secret and refresh token — no static "API key"). Both sets of
   instructions are written out below; follow the App Password one.

The form is **not currently broken** — `Contact.tsx:158-163` posts to
`NEXT_PUBLIC_FORM_ENDPOINT` (defaulting to `https://formspree.io/f/mqaeavbl`)
with an 8 s timeout and a `mailto:` fallback on failure. The change below adds
SMTP as the primary path and **keeps that as the fallback**, so a statically
hosted deploy keeps working.

### 8a — A dual-target build that does not break the static export

Both build modes must keep working, because `npm run build` producing 61/61
static pages and `Exporting (3/3)` is this project's build gate.

In `next.config.mjs`:

```js
const SERVER = process.env.BUILD_TARGET === 'server'

const nextConfig = {
  output: SERVER ? undefined : 'export',
  // In static mode, `route.server.ts` is not a recognised page file, so the
  // API route is invisible and `output: 'export'` stays legal.
  pageExtensions: SERVER
    ? ['server.ts', 'tsx', 'ts', 'jsx', 'js']
    : ['tsx', 'ts', 'jsx', 'js'],
  // …everything else unchanged
}
```

Put the handler at **`src/app/api/contact/route.server.ts`**. In static mode its
basename is `route.server`, which Next does not treat as a route file, so it is
skipped and the export succeeds. In server mode `server.ts` is a registered page
extension, the basename resolves to `route`, and the handler is picked up.

Scripts in `package.json` — add `cross-env` as a **devDependency** so the env
var works in cmd.exe as well as bash:

```json
"build": "next build",
"build:server": "cross-env BUILD_TARGET=server next build"
```

`npm run build` — the gate — must keep printing 61/61 static pages and
`Exporting (3/3)`, byte-identical in shape to `8564606`. Verify that first,
before you write the route.

> **Trap.** Do not simply delete `output: 'export'`. That silently changes what
> `npm run build` produces, breaks the gate, and breaks any static host the site
> is currently deployed to.

### 8b — The route handler

`src/app/api/contact/route.server.ts`, `POST` only:

- Read `Name`, `Email`, `Message` and `_gotcha` from the request. The client
  currently sends `FormData` with exactly those field names
  (`Contact.tsx:139-141`, honeypot at `:303-310`) — keep them.
- **Honeypot:** if `_gotcha` is non-empty, return `200 OK` and send nothing.
  Never tell a bot it was caught.
- **Validate:** all three fields required; `Email` must look like an address;
  cap `Message` at ~5000 chars and `Name` at ~200. Reject with `400` and a JSON
  `{ error }` the client can display.
- **Rate limit:** a simple in-memory sliding window keyed by IP, e.g. 5 requests
  per 10 minutes. It resets on cold start — acceptable for a portfolio, and it
  must not crash on a missing IP header.
- **Send** with `nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465,
  secure: true, auth: { user: SMTP_USER, pass: SMTP_APP_PASSWORD } })`.
  - `from` must be `SMTP_USER` — Gmail rejects a mismatched envelope sender.
  - `to` is `CONTACT_TO`.
  - `replyTo` is the visitor's `Email`, so replying in Gmail reaches them.
  - `subject`: reuse the existing shape from `Contact.tsx:144` —
    `` `New enquiry from ${name || 'portfolio visitor'} — neelpatel.com` ``.
  - Send `text` **and** `html`. **Escape the visitor's input in the HTML body**
    — this is untrusted content going into markup.
- **Never** log or echo `SMTP_APP_PASSWORD`. On a send failure return a generic
  `500` with `{ error }`; log the detail server-side only.
- No secret may appear in any `NEXT_PUBLIC_*` variable. `NEXT_PUBLIC_` is
  compiled into the client bundle.

### 8c — Client change

In `Contact.tsx:157-178`, try `/api/contact` first, then fall back:

- POST the existing `FormData` to `/api/contact`.
- On `404` or `405` (statically hosted — no route exists) or a network error,
  fall through to the current `FORM_ENDPOINT` request.
- Keep the 8 s `AbortController` timeout (`:154-155`), the error region
  (`:313-329`) and the `mailto:` fallback (`:150-152`) exactly as they are —
  they are the last line of defence and the user has already seen them work.
- Do not add a second submit button or a second loading state.

### 8d — Environment files

`.env.local` (git-ignored — **verify** it is ignored before writing anything into
it; add it to `.gitignore` if not):

```
SMTP_USER=neelpatel00235@gmail.com
SMTP_APP_PASSWORD=xxxxxxxxxxxxxxxx
CONTACT_TO=neelpatel00235@gmail.com
```

Update the committed `.env.example` with the same keys and **empty values**,
alongside the existing `NEXT_PUBLIC_FORM_ENDPOINT` line. Never commit a real
password.

### 8e — Steps for the user: generating the Gmail credential

Write these into the repo as `docs/CONTACT-FORM-SETUP.md` as well as reporting
them, so they are not buried in a chat log.

**What you need: a Gmail App Password (not an API key).**

1. Go to <https://myaccount.google.com/security>.
2. Turn on **2-Step Verification** if it is not already on. App Passwords do not
   exist on an account without 2FA — this step is mandatory, not optional.
3. Go to <https://myaccount.google.com/apppasswords>. (If it 404s, 2FA is not
   fully enabled yet — finish step 2 and wait a few minutes.)
4. Under **App name**, type something you will recognise later, e.g.
   `neelpatel.com contact form`. Click **Create**.
5. Google shows a **16-character password** in four groups of four. Copy it.
   **You cannot view it again after closing the dialog** — if you lose it,
   delete that entry and create a new one.
6. Paste it into `.env.local` as `SMTP_APP_PASSWORD`, **with the spaces
   removed**: `abcdefghijklmnop`, not `abcd efgh ijkl mnop`.
7. Set `SMTP_USER` and `CONTACT_TO` to `neelpatel00235@gmail.com`.
8. Restart the dev server — Next reads `.env.local` at startup, not per request.

**Limits and gotchas**

- Gmail's free tier allows roughly **500 messages per day**. Ample for a
  portfolio.
- Google may revoke App Passwords if the account password changes or 2FA is
  turned off. If mail stops sending, regenerate.
- Port **465** with `secure: true` is the reliable choice; port 587 with STARTTLS
  also works but some hosts block it.
- The App Password grants full send access to the mailbox. Keep it out of git,
  out of screenshots, and out of the client bundle.

**Deploying**

Because SMTP needs a server, deploy with `npm run build:server` to a Node or
serverless host (Vercel, Netlify with functions, Render, Fly, or any Node box)
and set `SMTP_USER`, `SMTP_APP_PASSWORD` and `CONTACT_TO` in that host's
environment-variable settings — not in a committed file. If you keep hosting the
static export instead, the form silently keeps using the Formspree endpoint and
still reaches you; nothing breaks.

**The alternative you asked about, for completeness.** The **Gmail API** is a
different mechanism: create a Google Cloud project, enable the Gmail API,
configure an OAuth consent screen, create an **OAuth 2.0 Client ID** (client id
+ client secret), then run a one-time consent flow to obtain a **refresh
token**, and send via `gmail.users.messages.send`. There is no static "API key"
in this flow — API keys cannot authorise sending mail as a user. It is
materially more setup than an App Password and buys nothing here. Use the App
Password.

### Verify item 8

- **First:** `npm run build` (no env var) still reports 61/61 static pages and
  `Exporting (3/3)`. If this regresses, stop — 8a is wrong.
- `npm run verify-content` → 15 PASSED / 0 FAILED.
- `npm run build:server` completes, and the route table lists the contact route
  as a function.
- With `.env.local` populated, run the server build and submit the form. A real
  email arrives at `neelpatel00235@gmail.com`, and **Reply** in Gmail addresses
  the visitor, not yourself.
- Submit with the honeypot filled → `200`, no email sent.
- Submit with an empty required field → `400` and the error region renders.
- Submit 6 times inside 10 minutes → the 6th is rate-limited and the UI shows
  the error rather than hanging.
- Submit with a `Message` containing `<img src=x onerror=alert(1)>`. The
  received email renders it as **text**; nothing executes.
- `grep -r "SMTP_APP_PASSWORD" out/ .next/static/` returns **nothing**.
- `git status` shows `.env.local` untracked/ignored, and `.env.example` contains
  only empty values.
- On a static deploy of `out/`, the form still submits successfully via the
  Formspree fallback.

---

## MEASUREMENT DISCIPLINE

Every "Verify" block above must be executed at these widths:
**390 px, 768 px, 1024 px, 1440 px.**

And in each of these modes:

- `prefers-reduced-motion: reduce` on.
- JavaScript disabled — the page must still render readable content, and the
  Curtain backdrop must not cover it. `layout.tsx` has a
  `<noscript>` rule that hides `[data-curtain-backdrop]`; confirm it still works.
- Hard reload with an empty cache (Ctrl+Shift+R with "Disable cache" ticked).
  Several bugs this round are only visible on a cold load.
- Emulated **touch** input, not merely a narrow window — `canHoverAutoplay()`
  (`VideoFrame.tsx:153-165`) and every `group-hover:` affordance behave
  differently under a coarse pointer.

Report **numbers, not adjectives.** "The marquee starts at x=48" is a result;
"the marquee looks right now" is not. Where this document gives a baseline
figure, report your after-figure next to it.

---

## REPORT FORMAT

Per item, in this order:

1. **Item number and one-line summary of what you changed.**
2. **Files touched**, with line ranges.
3. **Before → after measurements** for every number in that item's Verify
   block.
4. **Gate output:** the `verify-content` PASSED/FAILED counts and the `next
   build` page count + export line, pasted verbatim.
5. **Anything you could not do**, and why. Say so explicitly rather than
   quietly narrowing the item.
6. **Anything you noticed but did not touch** because it was out of scope.

---

## ITEM DEPENDENCY ORDER

Execute in this order. Items 1–3 are genuinely coupled; doing them out of order
means writing the same code twice.

| Order | Item | Depends on | Why |
| --- | --- | --- | --- |
| 1 | ITEM 1 — `AmbientReel`, no chrome on the lead film | — | Creates the component the next two items modify. |
| 2 | ITEM 3 — white frame / light edge | ITEM 1 | The reveal-on-play fix and the LQIP fallback live inside `AmbientReel`. |
| 3 | ITEM 2 — universal tap-to-open lightbox | ITEM 1 | `AmbientReel` is what taps come from; the modal must be visually clean first. |
| 4 | ITEM 4 — marquee speed and start | ITEM 1 | Marquee cards are `AmbientReel`s by then. |
| 5 | ITEM 7 — performance | ITEMS 1, 4 | Viewport gating belongs in `AmbientReel`; the marquee gate overlaps ITEM 4's ScrollTrigger. |
| 6 | ITEM 5 — contact headline | — | Independent. |
| 7 | ITEM 6 — mobile | ITEMS 1–5 | Audits the finished layout; doing it first means auditing twice. |
| 8 | ITEM 8 — SMTP contact form | — | Independent, and the only item that touches the build configuration. Last, so a build-config problem cannot mask a rendering regression. |

After ITEM 8, run one final full-site pass: both gates, all four widths, plus
reduced motion, JS-disabled and cold-cache — and report the complete matrix.
