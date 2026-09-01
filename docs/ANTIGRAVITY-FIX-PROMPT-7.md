# ANTIGRAVITY FIX ROUND 7

Five reported changes: three on desktop, two on mobile.

**Execute ONE ITEM PER TURN.** After each item, run both gates and report. Do not batch items.

```bash
npm run verify-content
```

```bash
npm run build
```

Gate 1 must print `15 PASSED / 0 FAILED`. Gate 2 must print `61/61` static pages and `Exporting (3/3)`. If either gate fails, fix it inside the same turn before reporting. Do not proceed to the next item with a red gate.

---

## STATE OF THE TREE

Round 6 is **landed but uncommitted** in the working tree (21 modified files, 1 staged deletion, 8 untracked additions). Every `file:line` anchor in this document was read from the **current working tree**, not from `HEAD`. Do not `git stash`, `git checkout --`, or `git reset` anything — you would destroy round 6.

Three untracked scratch files exist and must NOT be committed or referenced: `scratch-lh-before.json`, `scratch_lh_mobile.json`, `scratch_lh_mobile_unthrottled.json`.

---

## GROUND RULES

1. **`src/data/content.ts` strings are frozen.** `scripts/verify-content.mjs` diffs it against `tests/content.lock.json`. You may **add** new keys. You may never edit or delete an existing string. Item M2 in particular must be solved with layout, not by rewriting copy.

2. **`eslint.ignoreDuringBuilds: false` and `typescript.ignoreBuildErrors: false`** (`next.config.mjs:12-13`). An unused import, an unused variable, or an implicit `any` is a hard build failure. Remove every prop, state variable, and import you orphan.

3. **`output: 'export'` unless `BUILD_TARGET=server`** (`next.config.mjs:1-8`). No new API routes, no server components with data fetching, no middleware. `npm run build` is the static path and is the gate that matters.

4. **Tailwind `fontSize` entries that carry a `lineHeight` override a separate `leading-[…]` utility.** `text-mega`, `text-huge`, `text-big`, `text-lead`, `text-body`, `text-label` all ship a `lineHeight` (`tailwind.config.ts:34-41`). `text-mega` is `lineHeight: 0.86`. If you need a different line height alongside one of these, you must set it on the same element *after* the size class and confirm the computed value in the browser — do not assume the utility wins.

5. **`-webkit-text-fill-color` beats `color` in Blink/WebKit and is ignored in Firefox.** Every gradient-text span in this repo therefore carries **both** `text-transparent` and `[-webkit-text-fill-color:transparent]`. Keep both on any gradient span you touch. Solid-colour overrides also need both (see `Hero.tsx:252`).

6. **The `marquee` keyframe translates `-50%`** (`tailwind.config.ts:55`). Each animated row must contain **exactly two identical copies** of its card set or the loop will visibly jump. Horizontal offsets between rows must use `margin` or `animation-delay`, never `translate-x-*` — a transform on the animated element is overwritten by the keyframe.

7. **`SplitText` (`src/components/motion/SplitText.tsx`) splits on `' '`.** A leading or trailing space in the source string produces an **empty token**, which renders as a `<span class="inline-block whitespace-nowrap">` with no `.split-mask` child. `CONTACT_COPY.headlinePrefix` is `"Let's cut "` and `headlineMiddle` is `" worth "` — both produce empty tokens. This is why `Contact.tsx:242` carries `[&_.whitespace-nowrap:not(:has(.split-mask))]:hidden`.

8. **`SplitText` masks are managed by GSAP.** `gsap.set(masks, { overflow: 'hidden' })` on start, restored to `visible` in `onComplete`. Under `prefers-reduced-motion: reduce` the effect early-returns and the masks are never touched. Do not add your own `overflow` to `.split-mask`.

9. **Lenis owns vertical scroll** via `useLenis()` / `window.__lenis`. It is absent under reduced motion. Modals call `lenis.stop()`, never `overflow: hidden` on `body`.

10. **`useVideoRegistry` enforces one full player and one hover preview site-wide.** Read `useVideoRegistry.getState().activeFullId` at call time, never a captured value from a closure — that race was fixed in round 6 (`VideoFrame.tsx:91-96`, `:99-105`) and must stay fixed.

11. **Vimeo postMessage requires `api=1&player_id=<id>` in the embed URL.** Outbound: `JSON.stringify({ method, value })` posted to `targetOrigin: 'https://player.vimeo.com'`. Inbound: validate `e.origin === 'https://player.vimeo.com'` **and** filter on `data.player_id` or players will cross-talk. Both guards already exist — preserve them.

12. **An iframe's own document canvas paints over the element's CSS `background`.** `bg-black` on the iframe cannot suppress Vimeo's light loading shell. `onLoad` fires *before* the video paints. Reveal is therefore gated on the `play`/`playing` event with a 6000 ms watchdog that leaves the poster up on failure. Do not regress this to `onLoad`.

13. **MBF Taurian is caps-only.** Proven by canvas metrics — see the baseline table. `normal-case` on a Taurian element is a lie: the glyphs render as capitals anyway. Never rely on lowercase in `font-taurian`.

14. **Windows runs npm scripts through `cmd.exe`.** Any new env-var-prefixed script needs `cross-env` (already a dependency; see `build:server`).

15. **`const RAIL_H = 288` at `src/components/sections/SelectedWorks.tsx:19` is dead code** — round 6 replaced it with the `--rail-h` CSS variable. Delete it when you touch that file (item D3). It is currently a lint warning waiting to become an error.

16. **Do not introduce horizontal document overflow.** `document.documentElement.scrollWidth - clientWidth` is currently `0` at 390 px and must stay `0` at 320 / 360 / 390 / 768 / 1024 / 1440 px.

---

## MEASURED BASELINE

All figures below were read out of the live dev server with `getBoundingClientRect()`, `getComputedStyle()`, and `CanvasRenderingContext2D.measureText()`. They are **layout** measurements. Reproduce them before you change anything, and again after.

### Font metrics — MBF Taurian is caps-only

`measureText` at `400 100px mbfTaurian`, lowercase vs uppercase:

| glyph pair | width | ink ascent | ink descent |
|---|---|---|---|
| `a` / `A` | 62.2 / 62.2 | 67 / 67 | 0 / 0 |
| `e` / `E` | 56.5 / 56.5 | 66 / 66 | 0 / 0 |
| `g` / `G` | 62.3 / 62.3 | 67 / 67 | 0 / 0 |
| `l` / `L` | 58.9 / 58.9 | 66 / 66 | 0 / 0 |
| `o` / `O` | 69.9 / 69.9 | 69 / 69 | 2 / 2 |
| `p` / `P` | 60.1 / 60.1 | 67 / 67 | 1 / 1 |
| `t` / `T` | 67.6 / 67.6 | 66 / 66 | 0 / 0 |
| `x` / `X` | 66.9 / 66.9 | 66 / 66 | 0 / 0 |

Byte-identical in every pair. And `measureText("Patel") === measureText("PATEL") === 298.3 px`. `document.fonts.check('100px mbfTaurian')` is `true` and Taurian `NEEL` (232.5) differs from Georgia `NEEL` (267.7), so this is the real face, not a fallback.

### Word widths in MBF Taurian

Raw advance at 100 px, no tracking:

| string | width | ratio to NEEL |
|---|---|---|
| `NEEL` | 232.5 | 1.000 |
| `PATEL` | 298.3 | 1.283 |

With `letter-spacing: 0.025em`: `NEEL` 242.5, `PATEL` 310.8, `LET'S CUT` 495.9, `WORTH WATCHING` 894.7.

### Hero wordmark — desktop, viewport 1229 px

`text-mega` resolves to `font-size: 159.77px` (13 vw).

| element | left | top | width | height | bottom |
|---|---|---|---|---|---|
| `h1` | 48 | 112.9 | 640.9 | 412.0 | 524.9 |
| `.wordmark-line-1` (NEEL, Taurian) | 48 | 112.9 | 640.9 | 201.3 | 314.1 |
| `.wordmark-line-2` (Patel, Pinyon) | **64** | 296.0 | 624.9 | 204.8 | 500.9 |
| role line `div` | 48 | 563.8 | 640.9 | 12.3 | 576.1 |
| accent-line flex wrapper | 48 | 599.6 | 640.9 | **9.5** | 609.1 |
| accent text span | **92** | 594.8 | 277.4 | **19.0** | 613.8 |

- `.wordmark-line-2` computed: `font-family: pinyonScript`, `font-size: 226.873px` (1.42 em), `line-height: 192.842px` (0.85), `margin-top: -18.15px`, `margin-left: 16px`, `padding-bottom: 12px`, `letter-spacing: 9.075px`.
- Pinyon `Patel` at 226.873 px: ink ascent 177, ink descent 1, **font box ascent 196 + descent 87 = 283 px** inside a 192.84 px line box. The glyph ink stops ~177 px below the box top, leaving roughly **100 px of dead band** before the role line once `pb-3` + `pb-6` + `mb-10` are added.
- **Horizontal misalignment:** NEEL starts at x=48, the role line starts at x=48, but `Patel` starts at x=64 because of `ml-2 sm:ml-4` on `Hero.tsx:257`. That 16 px indent is the visible "offset".
- **Role-line word spacing is already uniform.** Per-token measurement: `Video` right-edge 91.02, spacer 8.61 wide, `Editor` 99.63→151.25, spacer 8.61, `·` 159.86→168.47, spacer 8.61, `Colourist` 177.08→254.50. All three inter-word gaps are exactly **8.61 px**. Computed `letter-spacing: 2.4576px`, `word-spacing: 0px`, `font-size: 10.24px`, `line-height: 12.288px`. The `gap-3` on the flex parent is **inert** — `SplitText` emits a single child, so there is nothing to gap.
- The accent-line wrapper collapses to **9.5 px** while its text is **19 px** tall, because `text-[1.65em]` + `leading-[0.72]` + `-my-[0.18em]` cancel each other. The text overflows its own flex row by 4.75 px top and bottom, which is why the 24 px `mb-6` above it reads as ~18.7 px.
- The accent text's left edge is 92 px = 48 (column) + 32 (`w-8` dash) + 12 (`gap-3`), i.e. **44 px indented** from NEEL and the role line.

### Hero wordmark — mobile, viewport 390 px

`text-mega` clamps to its 3.2 rem minimum: `font-size: 51.2px`.

| element | left | width | height |
|---|---|---|---|
| column (`px-6`) | 24 | 342 | — |
| `.wordmark-line-1` | 27.4\* | 335.2\* | 63.2 |
| `.wordmark-line-2` | 35.3\* | 327.3\* | 72.3 |
| role line `div` | 24 | 342 | 12.3 |

\* The 3.4 px offset and 0.98 width factor are the GSAP intro tween's `scale(0.98)` mid-flight, not a layout bug.

- `h1` is `display: flex; flex-direction: column; text-align: start; padding-bottom: 24px; margin-bottom: 40px`. **`flex flex-col` at `Hero.tsx:246` is the sole reason NEEL and Patel stack.**
- `.wordmark-line-2` computed at 390 px: `font-size: 72.704px`, `line-height: 61.798px`, `margin-left: 8px`, `margin-top: -5.816px`.
- CSS gap from the `.wordmark-line-2` box bottom to the role-line top is **59.5 px**; the *visual* gap from Patel's ink bottom is roughly **76 px**. This is the "spaceing below the name" in the report.
- **Side-by-side arithmetic at 390 px** (usable width 342 px):
  - `NEEL` at 1 em = 232.5 × 51.2/100 = **119.0 px**
  - `PATEL` at 1 em = 298.3 × 51.2/100 = **152.7 px**
  - 119.0 + 16 gap + 152.7 = **287.7 px ≤ 342** ✓
  - `PATEL` at the current 1.42 em = **216.8 px** → 119.0 + 16 + 216.8 = **351.8 px > 342** ✗ wraps.
- **Same problem on desktop:** `PATEL` in Taurian at 1.42 em = 2.983 × 1.42 = 4.236 em → 4.236 × 159.77 = **677 px** against a 640.9 px column. It overflows or wraps. `text-[1.42em]` is a Pinyon-specific compensation and cannot survive the font swap.
- **Optical parity size:** 232.5 / 298.3 = **0.7794 em** makes `PATEL` exactly as wide as `NEEL`. Anything in 0.78–0.88 em keeps the lockup balanced and fits both breakpoints.

### Contact headline — mobile, viewport 390 px

`h2` computed: `font-family: mbfTaurian`, `font-size: 35.2px` (2.2 rem minimum), `line-height: 31.68px`, `letter-spacing: 0.88px`, `text-transform: uppercase`, **`text-align: start`**, `margin-bottom: 32px`. Box: left 24, width 342, height 158.4.

Four block children, each 342 px wide, each `text-align: start`:

| # | content | top | height | lines |
|---|---|---|---|---|
| 1 | `Let's cut` (`SplitText` char) | 100.5 | **63.3** | **2** |
| 2 | `something` (`font-script`, Ephesis) | 163.8 | 31.7 | 1 |
| 3 | `worth` (`SplitText` char) | 195.5 | 31.7 | 1 |
| 4 | `WATCHING` (`SplitText` char) | 227.2 | 31.7 | 1 |

- Child 1 is **two line boxes** (2 × 31.68 = 63.4). Cause: `[&_.whitespace-nowrap:has(.split-mask)]:block` on `Contact.tsx:242` forces **every word** in char mode onto its own line. `SplitText` char mode wraps each word in `<span class="inline-block whitespace-nowrap">` (`SplitText.tsx:85`), so the variant renders `LET'S` and `CUT` as separate lines.
- Actual render today, five left-aligned lines: `LET'S` / `CUT` / `something` / `WORTH` / `WATCHING`.
- Widths at 35.2 px with 0.025 em tracking: `LET'S CUT` = **174.6 px**, `WORTH WATCHING` = **314.9 px**, `something` in Ephesis at 42.24 px = **125.4 px**. All three fit inside 342 px.
- **At a 320 px viewport** usable width is 272 px and `font-size` is still clamped to 35.2 px, so `WORTH WATCHING` at 314.9 px **does not fit**. Plan for a graceful wrap, not an overflow.

### Marquee rail — `SelectedWorks.tsx`

- `.marquee-rail` sets `--rail-h`: **168 px** base, **224 px** at ≥640 px, **288 px** at ≥1024 px (`src/app/globals.css:267-282`).
- `MarqueeReelCard` sizes from that variable: width `calc(var(--rail-h, 288px) * <ratio>)` (`:35`), height `var(--rail-h, 288px)` (`:38`).
- Row A: `animate-marquee-slow [animation-duration:48s]` (`:298`). Row B: `[animation-duration:56s] [animation-delay:-18s]` plus `mt-6` (`:316`).
- Both rows carry `[animation-play-state:running]` / `[animation-play-state:paused]` driven by `railRunning`, set once by a `ScrollTrigger` at `start: 'top bottom'` (`:190-197`).
- Under `prefersReducedMotion` neither row gets any animation class at all — the rows are static, `w-max` overflows the `overflow-hidden` wrapper, and **every card past the first screenful is currently unreachable**.
- There is **no drag, pointer, wheel, or touch handler anywhere on the rail today.** Verified by reading `:292-328`.

### Player chrome — one code path, five call sites

`PlayerChrome` is used in exactly one place: `VideoFrame.tsx:381`. `VideoFrame` is the only full-player component, and it is reached from:

- `src/components/video/VideoModal.tsx:148` — the lightbox, i.e. every reel tap site-wide
- `src/app/project/[slug]/page.tsx:120`
- `src/app/projects/page.tsx:82`
- `src/components/sections/Gallery.tsx:241`
- `src/components/video/RelatedWorkCard.tsx:34`

So "it is happening to all the video players" is one bug in one path. Fixing `VideoFrame` + `PlayerChrome` + `VimeoFacade` fixes all five.

---

## ITEM D1 — The player timebar is not linked to the video

> *"the player time bar is not likned with the video when i play the vid before the viodeo loads the time bar starts moving while the video is not playing and i cant scrub in the time bar to get to a particular time in the video. IT IS HAPPENING TO ALL THE VIDEO PLAYERS FIX THAT."*

This is **three separate defects**. Fix all three.

### Defect 1a — a fake clock runs whether or not the video is playing

`src/components/video/VideoFrame.tsx:187-205`:

```tsx
useEffect(() => {
  if (!isPlayingFull) { setCurrentTime(0); setProgress(0); return; }
  const interval = setInterval(() => {
    setCurrentTime((prev) => {
      const next = prev + 0.25;
      if (duration > 0) {
        setProgress(Math.min(1, next / duration));
        if (next >= duration) return 0;
      }
      return next;
    });
  }, 250);
  return () => clearInterval(interval);
}, [isPlayingFull, duration]);
```

`isPlayingFull` means **"the player is mounted"**, not "the video is playing". It is `true` from the instant the user clicks — before the iframe has loaded, before Vimeo has buffered, before a single frame has painted. The interval starts immediately and advances 0.25 s every 250 ms. That is precisely the reported symptom: the bar moves while the video is not playing.

It is also actively fighting the real player. The real handler at `VideoFrame.tsx:376-379`:

```tsx
onTimeUpdate={(percent, seconds) => {
  setProgress(percent);
  setCurrentTime(seconds);
}}
```

Because the interval uses the functional-update form `setCurrentTime(prev => prev + 0.25)`, it reads whatever the real `timeupdate` just wrote and immediately overwrites it — every 250 ms, forever. The real position never survives more than a quarter second.

**Delete the interval effect entirely.** `timeupdate` is the only source of truth for position. Vimeo emits it roughly 4× per second, which is already smooth; if you want sub-tick smoothing, interpolate forward from the last `timeupdate` timestamp using `requestAnimationFrame` **and clamp to the last known real value** — do not accumulate independently. Simpler is better here: ship without interpolation first, confirm it looks right, and only add smoothing if it visibly stutters.

Introduce a **separate** state for real playback, e.g. `isVideoPlaying`, driven only by the player's `play` / `playing` / `pause` events. Keep `isPlayingFull` for "player is mounted". Until the first `play` arrives, `currentTime` is 0, `progress` is 0, and the timecode should not imply motion.

### Defect 1b — there is no seek channel and the track is not interactive

`src/components/video/PlayerChrome.tsx:73-78` is a plain non-interactive `div`:

```tsx
<div className="relative flex-1 h-1 mx-2 bg-cream/15 rounded-full overflow-hidden">
  <div
    className="h-full w-full bg-terracotta origin-left transition-transform duration-100"
    style={{ transform: `scaleX(${Math.min(1, Math.max(0, progress))})` }}
  />
</div>
```

No `onClick`, no pointer handlers, no `role`, no `tabIndex`, no keyboard. And even if it had them, there is nowhere to send a seek: `PlayerChromeProps` (`PlayerChrome.tsx:8-16`) has no seek callback at all, and `VimeoFacade`'s `post()` helper (`VimeoFacade.tsx:31-35`) is **component-local and never exposed**. `VimeoFacade`'s props (`VimeoFacade.tsx:6-14`) offer no `onSeek`, no imperative handle, no ref forwarding.

Do all of this:

1. **Expose a command channel from `VimeoFacade`.** Either `forwardRef` + `useImperativeHandle` exposing `{ play(), pause(), seekTo(seconds) }`, or accept a `controlsRef` callback prop that the parent stores. `seekTo` posts `{ method: 'seekTo', value: <seconds> }` to `https://player.vimeo.com`. Keep the existing origin check and `player_id` filter untouched.

2. **Add `onPlay`, `onPause`, and `onDuration` props to `VimeoFacade`.** The `pause` listener is already registered at `VimeoFacade.tsx:65` but has no callback to report to — the parent literally cannot know the video paused. And `timeupdate`'s payload carries `duration`, which `VimeoFacade.tsx:80` currently **discards**:

   ```tsx
   onTimeUpdate?.(data.data.percent, data.data.seconds);   // data.data.duration thrown away
   ```

   Forward it. See defect 1c for why that matters.

3. **Make the track a real slider** in `PlayerChrome`:
   - `role="slider"`, `aria-label="Seek"`, `aria-valuemin={0}`, `aria-valuemax={duration}`, `aria-valuenow={currentTime}`, `aria-valuetext` as a formatted timecode, `tabIndex={0}`.
   - Click anywhere on the track seeks to that fraction.
   - `pointerdown` → `setPointerCapture` → `pointermove` scrubs → `pointerup` commits. While dragging, show the dragged position optimistically and **ignore incoming `timeupdate`** so the thumb does not fight the finger; resume following `timeupdate` on release.
   - Keyboard: `ArrowLeft` / `ArrowRight` ±5 s, `ArrowUp` / `ArrowDown` ±10 s, `Home` → 0, `End` → duration, `PageUp` / `PageDown` ±30 s. `preventDefault` on all of them so the page does not scroll.
   - The visible track is 4 px tall (`h-1`); wrap it in a **≥44 px tall transparent hit area** so it is actually usable on a phone. Do not make the visible bar 44 px.
   - Add a visible thumb and a focus ring — a slider you cannot see the handle of cannot be aimed.
   - Keep `onClick={(e) => e.stopPropagation()}` on the chrome root (`PlayerChrome.tsx:38`). The `VideoFrame` root has its own `onClick` (`VideoFrame.tsx:287-289`); without the guard, every scrub would also toggle the player.

4. **`transition-transform duration-100` on the fill (`PlayerChrome.tsx:75`) must be dropped while dragging.** A 100 ms transition on a value you are updating every pointer move produces visible lag behind the cursor.

### Defect 1c — the timecode denominator is content metadata, not the video

`VideoFrame.tsx:386` passes `duration` straight from `src/data/content.ts` into `PlayerChrome`. `PlayerChrome.tsx:65-69` renders the timecode only when `duration > 0`, and `PlayerChrome.tsx:76` computes the fill from a `progress` that the fake clock derives from that same content number. Nothing in the chain has ever asked the player how long the video actually is. If the content figure and the real asset disagree, the bar reaches 100 % early or never gets there, and `0:15 / 0:38` is describing two different videos.

Once `onDuration` is wired (defect 1b, step 2), prefer the **player-reported** duration and fall back to the content value only until the first `timeupdate` arrives. `progress` should be computed from `seconds / playerDuration`, or just use the `percent` Vimeo already sends.

### Defect 1d — "pause" destroys the player instead of pausing it

`VideoFrame.tsx:246-258`:

```tsx
const handlePlayClick = (e?: React.MouseEvent) => {
  e?.stopPropagation();
  playSound('click');
  teardownHover();
  if (!isPlayingFull) {
    playFull(id); setIsPlayingFull(true); if (tone) setTone(tone);
  } else {
    stopFull(id); setIsPlayingFull(false);
  }
};
```

This is wired to `PlayerChrome`'s play/pause button (`VideoFrame.tsx:383`). Pressing pause sets `isPlayingFull = false`, which unmounts the whole `<VimeoFacade>` block at `VideoFrame.tsx:361-390`, throws away the buffered video and the playhead, and drops the user back to the poster. Pressing play again reloads from zero. Combined with the fake clock's reset at `:189-190`, position is unrecoverable.

Split the two concerns:

- The chrome's play/pause button posts `pause` / `play` to the existing player and leaves it mounted. Position and buffer survive.
- Only closing the lightbox, navigating away, or the registry evicting this player unmounts `VimeoFacade`.
- The button's icon must follow the **real** `isVideoPlaying`, not `isPlayingFull`. `VideoFrame.tsx:382` passes `isPlaying={isPlayingFull}`, and `PlayerChrome.tsx:48-50` derives both the icon and the `aria-label` from it — so the chrome shows a pause icon and announces "Pause video" the moment the player mounts, before anything is playing.
- Keep the round-6 lead-film guard at `VideoFrame.tsx:372-375` — a stray `finish` event must not collapse the looping lead film to its poster.
- Keep the registry cleanup at `VideoFrame.tsx:99-105` and the `getState()` read at `:91-96`.

### Traps

- Do not put `onTimeUpdate` (or any inline arrow) in the `VimeoFacade` message-listener dependency array without stabilising it. `VimeoFacade.tsx:93` already lists `onReady, onEnded, onTimeUpdate`, and `VideoFrame.tsx:367-379` passes fresh inline closures every render — the effect currently tears down and re-registers the `message` listener on **every parent render**. Adding `onPlay` / `onPause` / `onDuration` as more inline arrows will make it worse. Wrap the parent callbacks in `useCallback` or hold them in a ref that the effect reads, and reduce the dependency array accordingly.
- `seekTo` on a player that has not fired `ready` is a no-op. Queue seeks issued before `ready` and flush them once `isLoaded` is true, or disable the slider until then.
- The `9:16` and `1:1` lightbox layouts are narrow (`VideoModal.tsx:138-146`). Verify the chrome row does not wrap and the slider still has room next to the buttons and timecode at 390 px.
- The chrome sits at `z-20` over the iframe, which is `pointer-events-auto` (`VimeoFacade.tsx:114`). Confirm your enlarged 44 px hit area does not swallow clicks meant for the video, and that it does not extend over the fullscreen button.

### Verify item D1

1. Open the lightbox on a reel from the Timeline Selections rail. Before the video paints, confirm the bar is at 0 and the timecode reads `0:00 / …` and **does not advance**.
2. Confirm the bar starts moving only once the video is actually playing.
3. Click the middle of the track. Confirm the video jumps to that point and the bar lands there.
4. Press and drag across the track. Confirm the bar follows the cursor 1:1 with no lag, the video follows on release, and the player does not toggle or close.
5. Press pause. Confirm the video pauses **in place** — the iframe stays mounted, the poster does not return, the position is retained — and play resumes from there.
6. Tab to the slider. Confirm a visible focus ring, then `←` / `→` / `Home` / `End` seek and the page does not scroll.
7. Repeat 1–6 in all five call sites listed in the baseline: lightbox, `/projects`, a `/project/<slug>` page, the Gallery section, and a related-work card.
8. Open two different reels in sequence and confirm no cross-talk: seeking one never moves the other.
9. Reduced motion on: the slider must still work.
10. `document.querySelectorAll('iframe[src*="player.vimeo.com"]').length` must not increase versus baseline.

---

## ITEM D2 — 'Patel' in the same face as 'NEEL', spaced properly, and the role line's offset

> *"make the 'patel' the same font as 'neel' make sure to retain the word 'patel' gradiedt properties make sure its spaced properly also the 'video editor colourist part ' is not spaced properly its lkinda offset fix that"*

### D2a — the font swap

`src/components/sections/Hero.tsx:257-261` today:

```tsx
<span className="wordmark-line-2 font-cursive normal-case text-[1.42em] leading-[0.85] -mt-[0.08em] ml-2 sm:ml-4 tracking-[0.04em] select-none block overflow-visible pb-3">
  <span className="inline-block bg-gradient-to-r from-cream via-terracotta to-cream bg-[length:220%_100%] bg-clip-text text-transparent [-webkit-text-fill-color:transparent] animate-gradientPan motion-reduce:animate-none">
    Patel
  </span>
</span>
```

`font-cursive` → `--font-cursive-accent` → **Pinyon Script** (`tailwind.config.ts:30`, `src/lib/fonts.ts:52-58`). `NEEL` uses `font-taurian` → **MBF Taurian** (`tailwind.config.ts:27`, `Hero.tsx:249`).

Change `font-cursive` → `font-taurian` on the **outer** span. **Leave the inner gradient span at `Hero.tsx:258-260` byte-for-byte identical** — it carries the gradient, `bg-clip-text`, both transparency declarations, and `animate-gradientPan`. That is the "retain the gradient properties" requirement, and the cheapest way to satisfy it is to not touch that line.

**`normal-case` must become `uppercase`, or be deleted so it inherits `uppercase` from the `h1` at `Hero.tsx:246`.** Ground rule 13: Taurian is caps-only, proven in the baseline table — every lowercase codepoint has metrics identical to its capital. `Patel` will render as `PATEL` no matter what `text-transform` says. Leaving `normal-case` in place would make the computed style disagree with the pixels and mislead the next person. The accessible name is already correct via `aria-label="Neel Patel"` on the `h1` (`:245`), so nothing is lost.

### D2b — every Pinyon-specific compensation must be re-tuned

Five utilities on `Hero.tsx:257` exist only to fight Pinyon Script's metrics. Each one is now wrong:

| utility | why it exists | what to do |
|---|---|---|
| `text-[1.42em]` | Pinyon's x-height is tiny, so it was scaled up 42 % to optically match NEEL | **Must go.** Taurian `PATEL` is already 1.283× wider than `NEEL`. At 1.42 em it is 4.236 em wide = **677 px against a 640.9 px column** on desktop and **351.8 px against 342 px** on mobile. Both overflow. Optical parity is **0.7794 em**; 0.78–0.88 em is the usable range. |
| `leading-[0.85]` | compresses Pinyon's 283 px font box into a 192.84 px line box | Re-tune. Taurian has font box ascent 160 / descent 0 at 100 px — no descender overhang to absorb. `NEEL` uses `leading-[1.02]`; match it or go slightly tighter. |
| `-mt-[0.08em]` | pulls the oversized Pinyon box back up | Recompute from scratch against the new line box. |
| `ml-2 sm:ml-4` | nudges Pinyon's swash `P` to look aligned | **Delete.** This is the "offset" in the report — it is why `Patel` starts at x=64 while `NEEL` and the role line both start at x=48. Taurian's `P` has ordinary side bearings and needs no nudge. |
| `pb-3` | reserves room for Pinyon's descender overhang | Reduce or delete. Taurian `PATEL` has ink descent of 1 px at 100 px. Keep `overflow-visible`. |

`tracking-[0.04em]` may stay, but check it against `NEEL`'s `tracking-tight` — the two lines should read as one lockup, not two different typographic settings.

### D2c — the vertical dead band under the wordmark

With Pinyon gone, roughly **100 px of dead band** disappears from under `Patel` on desktop (baseline: ink stops 177 px into a 192.84 px box, then `pb-3` 12 px + `pb-6` 24 px + `mb-10` 40 px). The gap to the role line will suddenly look too *tight*. Re-tune `pb-6` and `mb-10` on `Hero.tsx:246` so the optical gap from `PATEL`'s baseline to the role line is close to what it is now, measured from ink, not from box edges.

### D2d — the role line and the accent line

The report calls the role line "not spaced properly … kinda offset". Measurement says its **word spacing is already uniform** — all three inter-word gaps are exactly 8.61 px. So the complaint is about position and vertical rhythm, not letterfit. Three real problems:

1. **Horizontal**: fixed by deleting `ml-2 sm:ml-4` in D2b. Everything then aligns on x=48.

2. **The accent line directly below it collapses.** `Hero.tsx:276-282`: the flex wrapper measures **9.5 px tall** while the text inside it measures **19 px**, because `text-[1.65em]` + `leading-[0.72]` + `-my-[0.18em]` cancel out. The text overflows its own row by 4.75 px top and bottom, so the 24 px `mb-6` between the role line and the accent reads as ~18.7 px and the two lines look jammed together. Fix by removing the negative margins and setting an honest line height, then restoring the intended gap with real margin. Same bug class as the round-6 Contact headline — do not just nudge the numbers until it looks OK at one width.

3. **The accent text is indented 44 px** (x=92) relative to the role line and `NEEL` (x=48), because of the 32 px `w-8` dash plus the 12 px `gap-3`. If the intent is a flush-left stack, either drop the leading dash or pull the text back. Decide deliberately and say which you chose in your report.

Also note: `gap-3` on the role-line flex container (`Hero.tsx:268`) is **inert** — `SplitText` emits exactly one child. Remove it or leave it, but do not try to fix spacing with it.

### Traps

- `text-mega` on `Hero.tsx:246` ships `lineHeight: 0.86` and `letterSpacing: -0.03em` (`tailwind.config.ts:35`). Ground rule 4 — confirm computed values in the browser rather than assuming your `leading-[…]` wins.
- Both GSAP hooks on this element must survive: `.wordmark-char` staggered at `Hero.tsx:92-99`, `.wordmark-line-2` tweened at `Hero.tsx:101-108`. Keep both class names on the same elements.
- `Hero.tsx:252` uses `[-webkit-text-fill-color:#f67c29]` to force the third `E` solid over the gradient. Do not disturb it.
- MBF Taurian ships as a **subset** WOFF2 (`public/fonts/mbf-taurian-subset.woff2`, `src/lib/fonts.ts:19-25`). Verify `P`, `A`, `T`, `E`, `L` are all present in the subset — they measured fine in the baseline, but confirm visually rather than trusting metrics alone. The unsubsetted `.otf` was deleted in round 6; do not resurrect it.
- Do not change the `h1`'s `aria-label="Neel Patel"` (`:245`).

### Verify item D2

1. At 1440, 1024, 768 and 390 px: `getComputedStyle(document.querySelector('.wordmark-line-2')).fontFamily` contains `mbfTaurian`.
2. `.wordmark-line-2` and `.wordmark-line-1` have **the same `left`** — no residual indent.
3. `.wordmark-line-2` width ≤ its parent's width at every breakpoint. It must not wrap to two lines and must not overflow.
4. The inner gradient span still has `background-clip: text`, `color: transparent`, `-webkit-text-fill-color: transparent`, and a non-`none` `animation-name`.
5. `document.documentElement.scrollWidth - clientWidth === 0` at 320 / 360 / 390 / 768 / 1024 / 1440.
6. The accent-line wrapper's height is now ≥ its text's height — no overflow in either direction.
7. Reload with reduced motion on: the gradient pan is off (`motion-reduce:animate-none`) but the text is visible and the layout is unchanged.
8. Reload with JS disabled: the wordmark renders in the correct fonts and positions from static HTML.
9. Report the exact `text-[…em]`, `leading-[…]`, `-mt-[…]`, and `pb-[…]` values you settled on, with the measured widths that justify them.

---

## ITEM M1 — Mobile wordmark: NEEL and PATEL side by side, centred

> *"see neel patel looks weird and spaceing below the name when you fix point 2 of the desktop page make the mobile page 'neel patel' so that neel and patel is side by side and in the middle."*

**Do item D2 first.** This item depends on `PATEL` being Taurian at a sane size.

`src/components/sections/Hero.tsx:246`:

```tsx
className="flex flex-col text-mega uppercase tracking-normal leading-[1.0] pb-6 mb-10 drop-shadow-md select-none overflow-visible"
```

`flex flex-col` is the sole reason the two words stack. Make the direction responsive: row and centred below `lg`, column and flush-left from `lg` up. Something in the shape of `flex flex-row items-baseline justify-center text-center lg:flex-col lg:items-start lg:justify-start lg:text-left` — the exact utilities are yours, but:

- **Align on the baseline, not the box.** `items-center` will look wrong because the two spans have different line boxes. `items-baseline` is what makes `NEEL PATEL` read as one word.
- **The word gap must be a real gap**, not a margin left over from D2. Use `gap-x-[…]` on the flex parent so it is symmetric and does not reintroduce the offset D2b just removed.
- **Centre it against the column, not the viewport.** The parent is `lg:col-span-7 … flex flex-col order-2 lg:order-1` (`Hero.tsx:241`), which is 342 px wide at 390 px inside a `px-6` shell. `justify-center` on the `h1` centres within that 342 px, which is what the report asks for.
- Set `text-center` below `lg` so anything that wraps stays centred.

**Fits at 390 px** (baseline arithmetic): `NEEL` 119.0 + 16 gap + `PATEL` 152.7 = 287.7 px inside 342 px, with 54 px to spare. **Check 320 px too**: usable 272 px, and `text-mega` is still clamped to 51.2 px there, so the same 287.7 px **does not fit**. You will need either a smaller size below `sm`, a tighter gap, or a deliberate graceful wrap. Pick one and state which.

**Also fix the vertical spacing the report mentions.** Baseline: 59.5 px of CSS gap and ~76 px of visual gap between the `.wordmark-line-2` box bottom and the role line at 390 px. Most of it evaporates when Pinyon's oversized line box goes away in D2; re-tune `pb-6` / `mb-10` for the mobile breakpoint specifically and measure the result.

### Traps

- The role line, accent line, lead paragraph and CTAs below the wordmark are all left-aligned. Centring only the `h1` will look like a mistake. Decide whether the whole mobile hero column centres or just the wordmark, apply it consistently, and say which you chose.
- `order-2 lg:order-1` on `Hero.tsx:241` means the copy column renders **after** the portrait on mobile. Confirm your change does not disturb that order.
- GSAP tweens the `h1` itself with `y` and `scale` (`Hero.tsx:86-90`) and the parallax `ScrollTrigger` at `:158-171` is gated to `(min-width: 60rem)`. A `flex-direction` change must not break either. Verify the intro tween still completes to `opacity: 1` and `transform: none` at 390 px.
- `text-mega`'s `letterSpacing: -0.03em` applies to both words. On a single row, negative tracking on `NEEL` eats into the gap. Measure the actual gap, don't eyeball it.
- Do not add `whitespace-nowrap` to the `h1` — at 320 px that turns a graceful wrap into horizontal document overflow, which ground rule 16 forbids.

### Verify item M1

1. At 390 px: `NEEL` and `PATEL` share a row — their `getBoundingClientRect().top` values overlap and their baselines align.
2. At 390 px the pair is centred in the 342 px column: distance from the column's left edge to `NEEL`'s left ≈ distance from `PATEL`'s right to the column's right edge, within 2 px.
3. At 320, 360 and 390 px: `document.documentElement.scrollWidth - clientWidth === 0`.
4. At 1024 px and above: back to two stacked lines, flush left, exactly as D2 left it.
5. At 768 px: state which layout renders there and confirm it is deliberate.
6. Vertical gap from `PATEL`'s ink bottom to the role-line top at 390 px — report the number before and after.
7. Emulated touch + a real 390 px viewport: no clipped glyphs, no overlap with the role line.
8. Reduced motion and JS-disabled: layout holds.

---

## ITEM D3 — Drag the marquee rows

> *"image 3 shows the time line selections make the rows so that whn i hold and drag my cursor from left right the rows scroll from right left as per cursor."*

**Direction decision.** The instruction is ambiguous: *"drag from left right"* → *"rows scroll from right left"* reads as inverted, but *"as per cursor"* reads as direct manipulation. I am specifying **direct manipulation** — drag right, the cards move right with the cursor, like dragging a physical filmstrip. That is what "as per cursor" means and it is what every carousel does. **Put the direction behind a single named constant** (e.g. `const DRAG_DIRECTION = 1`) with a comment, so flipping to inverted is a one-character change if the user wants the other reading.

Everything below is in `src/components/sections/SelectedWorks.tsx`. The rail is `:292-328`. There is **no drag handling anywhere today**.

### The core constraint

Both rows are driven by a **CSS keyframe** that owns their `transform`:

- `marquee` translates `0` → `-50%` (`tailwind.config.ts:55`), which is why each row holds exactly two identical copies (`:303-308`, `:321-326`).
- Row A: `animate-marquee-slow [animation-duration:48s]` (`:298`). Row B: `56s` with `[animation-delay:-18s]` (`:316`).
- Both are paused until `railRunning` flips (`:190-197`).

**Do not write the drag offset onto the animated element.** The keyframe overwrites `transform` on every frame; your offset will be discarded. Instead:

- Keep the CSS marquee on an **inner** element, exactly as it is today.
- Add an **outer** wrapper per row and apply the drag offset there as `translate3d(dragX, 0, 0)`. The two transforms then compose on different nodes and never fight.
- On `pointerdown`, set `animation-play-state: paused` on the inner element; on `pointerup`, restore it. Because the offset lives on the wrapper, the animation resumes from wherever it was — no jump.

**Wrap the offset.** The keyframe's `-50%` loop only covers the animation's own travel. Your drag offset is independent and will eventually drag the content off screen. Measure one card-set's width (the first copy's `scrollWidth`, or `row.scrollWidth / 2`) and wrap `dragX` modulo that width so content is always on screen in both directions.

### Requirements

- **Pointer Events only** — `pointerdown` / `pointermove` / `pointerup` / `pointercancel` with `setPointerCapture`. One code path for mouse, touch and pen. Do not add separate mouse and touch handlers.
- **Drag threshold ~8 px before the drag is "real".** Below the threshold it is a tap. This is critical: every card in the rail is an `AmbientReel`, and `interactive` defaults to `true` (`AmbientReel.tsx:41`) with `MarqueeReelCard` not overriding it (`SelectedWorks.tsx:39-48`), so each card carries `role="button"`, `tabIndex={0}`, `onClick={handleOpen}` and Enter/Space handling (`AmbientReel.tsx:238-252`). **A drag must not open a video.** Once the threshold is crossed, suppress the click — either by calling `preventDefault`/`stopPropagation` on the subsequent `click` in a capture-phase listener, or by setting a `draggedRef` flag the card's handler checks.
- **`touch-action: pan-y`** on the draggable wrapper. Without it, a horizontal drag on a phone either hijacks vertical page scroll or is stolen by it. `pan-y` gives horizontal to you and leaves vertical to the page.
- **Do not call `preventDefault` on `pointermove`** for vertical movement — Lenis owns vertical scroll (ground rule 9) and the page must still scroll while the finger is on the rail.
- **Cursor affordance**: `cursor: grab` at rest, `cursor: grabbing` while dragging. The site has a custom cursor driven by `data-cursor` — set an appropriate hint (e.g. `data-cursor="Drag"`) on the wrapper and check it does not collide with the cards' `data-cursor="Play"` from `AmbientReel.tsx:241`.
- **Momentum is optional.** If you add inertia, decay it and stop cleanly; do not leave a `requestAnimationFrame` loop running after release. Skipping momentum entirely is an acceptable answer for this item.
- **Reduced motion**: neither row currently gets any animation class (`:296-301`, `:314-319`), so the rows are static, `w-max` overflows the `overflow-hidden` wrapper at `:292`, and **cards past the first screenful are unreachable today**. Drag should work under reduced motion too — that is a genuine accessibility improvement, not scope creep. Do not add an animation under reduced motion.
- **Keyboard**: the rail is not currently reachable by keyboard except through the cards themselves. Do not regress that. If adding drag makes the wrapper focusable, give it `←` / `→` handling; otherwise leave focus alone.
- **Delete `const RAIL_H = 288` at `:19`** — dead since round 6 (ground rule 15).

### Traps

- The wrapper at `:292` is `overflow-hidden` with `-mx-6 md:-mx-12 px-6 md:px-12`. Your drag must not create horizontal document overflow at any width (ground rule 16).
- Each card's iframe is `pointer-events-none` (`AmbientReel.tsx:285`) — good, pointer events reach your handler. Do not change that; if the iframe ever becomes `pointer-events-auto` the drag dies over every card.
- `AmbientReel` mounts and evicts iframes on an `IntersectionObserver` with `rootMargin: '200px'` / `'600px'` (`AmbientReel.tsx:96-122`) and claims a slot from `useVideoRegistry`. Fast dragging will thrash mount/evict. Confirm `document.querySelectorAll('iframe[src*="player.vimeo.com"]').length` stays bounded during and after a hard drag, and that no iframe is left with `src="about:blank"` while visible.
- `MarqueeReelCard` has `group-hover:scale-[1.06] group-hover:z-20` (`:37`). Scaled cards during a drag can look like jitter; check it and mention what you see.
- `railRunning` is set by a `once: true` ScrollTrigger (`:190-197`). If your pause/resume writes the same inline `animation-play-state` that the Tailwind arbitrary variant sets, they will conflict. Pick one mechanism — either move play-state control entirely into your drag state, or write inline styles and remove the arbitrary variants. Do not have both.
- Row B's `[animation-delay:-18s]` (`:316`) is a negative delay used as a phase offset. Pausing and resuming must not reset that phase.

### Verify item D3

1. Desktop 1440 px: press and drag left, then right. Cards follow the cursor 1:1 in the same direction. Release — the marquee resumes from the dragged position with no jump.
2. Drag past the end in both directions. Content wraps; there is never a blank gap.
3. Drag ≥8 px starting on a card and release. **No lightbox opens.**
4. Click a card without moving. **The lightbox opens.**
5. Emulated touch at 390 px: horizontal drag scrolls the rail; vertical swipe scrolls the page. Neither steals the other.
6. `document.documentElement.scrollWidth - clientWidth === 0` at 320 / 390 / 768 / 1024 / 1440 during and after a drag.
7. Reduced motion on: rows are static, drag still reaches every card.
8. Before / after iframe counts. Report both, plus the peak during a 5-second continuous drag.
9. Both rows still hold exactly two identical copies; the seam is invisible at rest.
10. Drag Row A and confirm Row B is unaffected, and vice versa.
11. Console clean — no errors, no `Unable to preventDefault inside passive event listener` warnings.

---

## ITEM M2 — Mobile contact headline: three centred lines

> *"image 5 show the lets cut... part in mobile make it in center so that lets cut in top .middle is something then bottom is worth watching ."*

Target at 390 px, centred:

```
    LET'S CUT
    something
  WORTH WATCHING
```

Current render at 390 px, **five** left-aligned lines: `LET'S` / `CUT` / `something` / `WORTH` / `WATCHING`.

`src/components/sections/Contact.tsx:240-252`:

```tsx
<h2
  ref={headlineRef}
  className="font-taurian text-[clamp(2.2rem,8vw,7.5rem)] text-cream uppercase leading-[0.9] tracking-wide mb-8 [&_.whitespace-nowrap:has(.split-mask)]:block [&_.whitespace-nowrap:not(:has(.split-mask))]:hidden"
>
  <SplitText text={CONTACT_COPY.headlinePrefix} by="char" className="!block" />
  <span className="block font-script text-terracotta lowercase text-[1.2em] …">
    {CONTACT_COPY.headlineScript}
  </span>
  <SplitText text={CONTACT_COPY.headlineMiddle} by="char" className="!block" />
  <span className="block text-cream relative z-20">
    <SplitText text={CONTACT_COPY.headlineMega} by="char" className="!block" />
  </span>
</h2>
```

Content (frozen, ground rule 1): `headlinePrefix` = `"Let's cut "`, `headlineScript` = `"something"`, `headlineMiddle` = `" worth "`, `headlineMega` = `"WATCHING"`.

### Three things are wrong

1. **Every word is on its own line.** `[&_.whitespace-nowrap:has(.split-mask)]:block` forces `display: block` on `SplitText`'s per-word wrapper (`SplitText.tsx:85`). That is why `"Let's cut"` occupies two line boxes (measured 63.3 px = 2 × 31.68). Round 6 added this variant to control the empty tokens produced by the leading/trailing spaces in the content strings (ground rule 7); its companion `[&_.whitespace-nowrap:not(:has(.split-mask))]:hidden` hides those empty spans, which is *why* the `block` was needed — with the spacers hidden, inline words would run together.

   Fix the root cause instead: keep the empty tokens hidden, but restore word separation with `word-spacing` or a `gap` on the inline container rather than by forcing one word per line. Then `"LET'S CUT"` flows on one line.

2. **`text-align: start`.** The `h2` has no alignment class, so it inherits left. Add `text-center` for mobile. Desktop is a 12-column grid with the form on the right (`Contact.tsx:237-239`) where left-aligned is correct — so scope it, e.g. `text-center lg:text-left`. The `SplitText` wrappers are `inline-block` and will centre once the parent does, but **check each of the four children** — three of them carry `!block` or `block` with `width: 342px`, so they need the alignment to inherit, and `!block` may need a responsive companion.

3. **`worth` and `WATCHING` are separate blocks.** `Contact.tsx:248` and `:249-251` are two `block` elements, so they can never share a line. To get `WORTH WATCHING` as one centred line at mobile, put both inside one container that lays them out inline — e.g. a `flex flex-wrap justify-center gap-x-[0.28em] lg:block` wrapper, or make both `inline`/`inline-block` below `lg`. Keep the `relative z-20` on the `WATCHING` span (`:249`) — it exists to sit above the script word's `z-10` (`:245`).

### Width budget

At 390 px (usable 342 px), `font-size: 35.2px`, `letter-spacing: 0.88px`:

| line | width | fits in 342? |
|---|---|---|
| `LET'S CUT` | 174.6 | ✓ |
| `something` (Ephesis, 42.24 px) | 125.4 | ✓ |
| `WORTH WATCHING` | 314.9 | ✓ (27 px spare) |

**At 320 px** usable width is 272 px and `text-[clamp(2.2rem,8vw,7.5rem)]` still clamps to its 2.2 rem minimum, so `WORTH WATCHING` at 314.9 px **overflows by 43 px**. Handle it deliberately: either lower the clamp minimum below `sm`, or use `flex-wrap` so it breaks to two centred lines instead of overflowing. Ground rule 16 — overflow is not an option. State which you chose.

### Traps

- The `h2` is animated by GSAP at `Contact.tsx:57-73` (`opacity`/`y`, `toggleActions: 'play none none none'`). Confirm it still completes to `opacity: 1` / `transform: none`.
- `SplitText` char mode emits one `.split-mask` per character and GSAP toggles `overflow` on them (ground rule 8). Do not add `overflow` yourself.
- `leading-[0.9]` on `:242` is a bare arbitrary value with no competing `fontSize` line-height, so it applies — computed 31.68 px. It is unusually tight for Taurian; check for clipped glyph tops, which was the round-4 complaint about this exact heading.
- The script word `something` is `font-script` → Ephesis with `lowercase text-[1.2em] leading-[0.75]` (`:245`). Ephesis genuinely has lowercase; do not "fix" it to caps.
- `pointer-events-none select-none` on the script span (`:245`) is deliberate. Keep it.
- Do not change `CONTACT_COPY` strings. If you need a variant, **add** a key and leave the originals untouched — `npm run verify-content` will catch you.
- The left column is `lg:col-span-6 flex flex-col relative z-20 min-w-0` (`:239`). `min-w-0` is load-bearing for the grid; leave it.

### Verify item M2

1. At 390 px: exactly **three** visual lines in the order `LET'S CUT` / `something` / `WORTH WATCHING`.
2. Each line is centred within the 342 px column — left and right margins equal within 2 px.
3. At 360 px and 320 px: still centred, no horizontal overflow. Report exactly what 320 px renders.
4. At 1024 px and 1440 px: the desktop treatment is unchanged from its current appearance. Screenshot or measure both to prove no regression.
5. No glyph clipped at top or bottom on any line at any width.
6. `document.documentElement.scrollWidth - clientWidth === 0` at 320 / 360 / 390 / 768 / 1024 / 1440.
7. Reduced motion on: `SplitText` early-returns, masks are never touched, the three centred lines still render.
8. JS disabled: the headline renders from static HTML in the correct three-line centred layout.
9. `npm run verify-content` prints `15 PASSED / 0 FAILED` — proof no content string moved.

---

## MEASUREMENT DISCIPLINE

Reproduce the relevant baseline numbers **before** you change anything, so you know your measurement setup agrees with mine. Then measure again after.

Check every item at: **320, 360, 390, 768, 1024, 1440 px**.

Plus, for every item:

- `prefers-reduced-motion: reduce`
- JavaScript disabled (static HTML only)
- Cold cache, hard reload
- Emulated touch / coarse pointer (this flips `canHoverAutoplay()` at `VideoFrame.tsx:208-220` and changes which iframes mount)
- `document.documentElement.scrollWidth - document.documentElement.clientWidth === 0`
- Browser console clean — no errors, no React warnings, no passive-listener warnings
- `document.querySelectorAll('iframe[src*="player.vimeo.com"]').length` before and after

**Note on tooling:** the figures in the baseline table are layout measurements (`getBoundingClientRect`, `getComputedStyle`, `measureText`). They are reliable regardless of paint. If you take screenshots, make sure the tab is actually visible — a backgrounded tab suspends `requestAnimationFrame`, which freezes every GSAP tween at its `from` state (`opacity: 0`) and produces blank captures. That is a tooling artifact, not a site bug. Do not "fix" it.

---

## REPORT FORMAT

After each item, report:

1. **Item ID and one-line summary of what you changed.**
2. **Every file touched**, with `file:line` ranges.
3. **Gate 1 output** — the `verify-content` PASSED/FAILED line, verbatim.
4. **Gate 2 output** — the static-page count and the `Exporting (n/n)` line, verbatim.
5. **The item's numbered verification checklist**, each point answered with a measured value or an explicit observation. Not "looks good".
6. **Numbers you chose yourself** (font sizes, gaps, thresholds, drag direction, 320 px fallback strategy) with the measurement that justifies each.
7. **Anything you found that this document got wrong.** If an anchor has drifted or a measurement does not reproduce, say so with the correct value rather than working around it silently.
8. **Anything you deliberately did not do**, and why.

If an item cannot be completed as specified, complete every part that can be, then state precisely what is blocked and what it would take.

---

## ITEM DEPENDENCY ORDER

Execute in this order. **M1 depends on D2** — the mobile side-by-side layout is only possible once `PATEL` is Taurian at a size that fits.

| # | Item | Depends on |
|---|---|---|
| 1 | **D1** — player timebar linked to the video, scrubbable | — |
| 2 | **D2** — `Patel` in MBF Taurian, spacing and the role-line offset | — |
| 3 | **M1** — mobile wordmark side by side and centred | **D2** |
| 4 | **D3** — drag-scroll the marquee rows | — |
| 5 | **M2** — mobile contact headline, three centred lines | — |

One item per turn. Both gates after each. Report before moving on.
