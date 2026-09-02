# Antigravity — Round 8

**Execute ONE item per turn. After each item, run BOTH gates and report before starting the next.**

```bash
npm run verify-content
npm run build
```

Both must be green before you move on. If an item cannot be completed without breaking a gate, **stop and report** — do not proceed to the next item and do not work around the gate.

---

## STATE OF THE TREE

- Branch: **`main`** (the repo was renamed from `master`; do not recreate `master`).
- HEAD: **`3ac0672`** — "Upgrade Next.js to secure 15.5.25 and push portfolio improvements".
- Working tree: **clean**.
- Round 7 landed **inside** `3ac0672`, bundled with an unrelated Next.js 15.5.25 upgrade. There is no separate round-7 commit.
- `docs/ANTIGRAVITY-FIX-PROMPT-7.md` exists but its own "STATE OF THE TREE" section is **stale**. Ignore it. This document supersedes it.

Every `file:line` anchor in this document was verified against `3ac0672`. If a line number does not match what you see, **re-locate the code by its quoted content** and report the discrepancy — do not guess.

---

## MEASURED BASELINE (verified at `3ac0672`, before any round-8 change)

Both gates are green **right now**. You are not fixing a broken build; you are fixing runtime defects.

| Gate | Result |
|---|---|
| `npm run verify-content` | **15 PASSED / 0 FAILED** |
| `npm run build` | **✓ Generating static pages (64/64)**, **✓ Exporting (2/2)** |

Production first-load JS from the build's own route table:

| Route | Size | First Load JS |
|---|---|---|
| `/` | 17.8 kB | **207 kB** |
| `/projects` | 11.4 kB | 191 kB |
| `/about` | 352 B | 187 kB |
| `/project/[slug]` | 934 B | 175 kB |
| `/contact` | 2.31 kB | 161 kB |
| shared by all | — | 103 kB |

Runtime measurements taken in a **390 × 844** viewport at `dpr 2`, `document.visibilityState === "visible"`:

| Metric | Measured |
|---|---|
| Page scroll height (`/`, 390px) | **17,809 px** |
| DOM nodes | 1,996 |
| `<img>` elements | **61** |
| `<img>` elements carrying a `srcset` | **0** |
| Image bytes fetched in one full scroll (32 of 61 loaded) | **3,803 KB** |
| Elements with a non-`none` transform | 275 |
| Frame time p50 / p90 / p99 / worst | 6.9 / 13.8 / **55.6** / **69.5 ms** |
| Dropped frames (>22 ms) during scripted scroll | 23 of 509 (**4.5 %**) |
| Long tasks during scroll | 3, totalling 154 ms, worst 53 ms |

> These frame numbers come from a **desktop-class machine** emulating a 390px viewport on the **dev server**. A real mid-range phone will be substantially worse. Treat them as a floor, not a target.

Poster asset inventory in `public/posters/` — **208 files, 17 MB on disk**:

| Variant | Files | Total | Avg | Largest |
|---|---|---|---|---|
| `{id}.webp` (base, the only one used) | 52 | **5.73 MB** | 112.9 kB | **750.6 kB** |
| `{id}-1440.webp` | 52 | 5.70 MB | 112.3 kB | 830.1 kB |
| `{id}-960.webp` | 52 | 3.48 MB | 68.5 kB | 498.3 kB |
| `{id}-480.webp` | 52 | **1.44 MB** | 28.3 kB | 158.1 kB |

**`-480`, `-960` and `-1440` are referenced by nothing.** `grep -rn -- "-480\|-960\|-1440\|srcSet\|srcset" src/ scripts/` returns **zero matches**. 156 of the 208 poster files are shipped in the static export and never requested. This is the single largest mobile win available and item 4 depends on it.

---

## GROUND RULES

1. **Content is frozen.** Never edit or delete an existing string in `src/data/content.ts` or `src/data/portfolio.generated.ts`. You may **add** new keys. `npm run verify-content` diffs against `tests/content.lock.json` and will fail you.
2. **No new dependencies.** Do not add a package, a polyfill, or a CDN script. Everything in this round is achievable with what is already installed.
3. **`eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors` are both `false`** in `next.config.mjs`. An unused import, an unused variable, or an `any` that trips a rule is a **hard build failure**. Clean up after yourself.
4. **Do not touch `next.config.mjs`.** In particular, do not change `output: 'export'`, `trailingSlash`, `pageExtensions`, or `images.unoptimized`. Item 4 must be solved *within* the `unoptimized: true` constraint (see item 4 for why, and how).
5. **Do not rename or move files.** No new files unless an item explicitly asks for one.
6. **Do not delete `src/app/api/contact/route.server.ts`.** The `.server.ts` extension is deliberate — `pageExtensions` excludes it from the static export, which is the only reason a build with an API route in the tree stays green.
7. **Preserve the static export.** `npm run build` must keep printing `Exporting (2/2)`. If your change forces a server runtime, you have broken the deliverable.
8. **No `any`, no `@ts-ignore`, no `eslint-disable`** to get past a type or lint error. Fix the actual type.
9. **Reduced motion must keep working.** `globals.css` has a `@media (prefers-reduced-motion: reduce)` block that forces `animation-play-state: paused !important` globally. Anything you add must still be correct when every CSS animation is frozen.
10. **Keyboard and a11y parity.** Every pointer interaction you touch must keep its Enter/Space handler, `role`, `tabIndex`, and `aria-label`. The modal's focus trap (`VideoModal.tsx:52-67`) and focus restore (`:86-88`) must keep working.
11. **postMessage origin discipline.** Inbound: compare `e.origin` with **strict equality** against `'https://player.vimeo.com'`. Outbound: pass `'https://player.vimeo.com'` as `targetOrigin`, **never `'*'`**. Round 7 regressed both of these; item 1 restores them. A substring test like `origin.includes('vimeo.com')` matches `https://evil-vimeo.com.attacker.net` and is not acceptable.
12. **Never use `overflow: hidden` on `<body>`** to lock scroll. The modal locks via `lenis.stop()` (`VideoModal.tsx:41-43`). Keep it that way.
13. **One full-size player alive site-wide.** This is the invariant item 1 exists to repair. After item 1, at no moment may two `VimeoFacade` instances be mounted for the same video id, and at no moment may two full players be audible.
14. **Do not change the visual design.** No new colours, no font changes, no spacing changes beyond what an item explicitly requires. Items 2 and 3 change marquee geometry — the *rendered* card size, gap and rhythm must look identical to before at every breakpoint.
15. **Measure, do not assume.** Every item below has a `Verify` block with concrete numbers. Run it. Paste the real output in your report. Do not write "looks fine".
16. **`document.hidden` suspends `requestAnimationFrame`.** If you screenshot a background tab, GSAP will be frozen at its `from` values and you will see a blank `#13100c` panel and misdiagnose a defect. Confirm `document.visibilityState === "visible"` before trusting any paint-dependent observation. Layout measurements (`getBoundingClientRect`, `scrollWidth`) stay valid either way.

---

# ITEM 1 — Two players, two audio streams (user issue #2)

> *"in both versions in selected works gallery i tap any video and it plays on a preview screen but when the preview screen is playing, simultaneously in the background the video starts playing too so there is 2 sounds. make it so when i play the video it does not play in the background. when i close the preview screen then only then it's okay if it plays on the works gallery."*

## Reproduced live

At 390 × 844, a single tap on the first gallery tile ("Rock Your Body", id `1220413186`) produced **two** full-size Vimeo iframes for the **same** video id:

```
totalVimeoIframes: 3
byVideoId: {
  "1220413186": [
    { background: false, inModal: false, rect: "338x189" },   // inline tile player
    { background: false, inModal: true,  rect: "356x200" }    // lightbox player
  ],
  "1220554546": [ { background: true, inModal: false } ]      // unrelated ambient reel
}
duplicateIds: [ { id: "1220413186", count: 2 } ]
modalPresent: true
```

After closing the modal, exactly one remains — the inline one, still playing:

```
afterClose: { modal: false, full: [ { id: "1220413186", inModal: false } ], ambient: 1 }
```

That end state is **correct and desired** — the user explicitly allows gallery playback once the preview is closed. The defect is purely the **simultaneity while the modal is open**.

## Root cause — three defects compounding

**(a) The tap is handled twice.** `Gallery.tsx:228-241` wraps each tile in a clickable div and nests `VideoFrame` **inside** it:

```tsx
<div
  role="button"
  tabIndex={0}
  aria-label={`Open ${work.title} video`}
  onClick={() => handleOpenModal(work)}     // :231
  ...
  data-cursor="Zoom"                         // :239
>
  <VideoFrame id={work.id} ... />            // :241
```

`VideoFrame`'s own root has its own click handler at `VideoFrame.tsx:304-306`:

```tsx
onClick={() => {
  if (!isPlayingFull) handlePosterPlayClick();   // :305 — called with NO argument
}}
```

`handlePosterPlayClick` *does* begin with `e?.stopPropagation()` (`VideoFrame.tsx:245`) — but `:305` invokes it as `handlePosterPlayClick()` with **no event object**, so `e` is `undefined`, the optional call is skipped, and **propagation is never stopped**. One tap therefore runs the inline player *and* bubbles up to open the modal.

**(b) The single-player invariant has a same-id hole.** `VideoFrame.tsx:96-104`:

```tsx
const currentActive = useVideoRegistry.getState().activeFullId;
if (currentActive && currentActive !== id && isPlayingFull) {   // :98
  setIsPlayingFull(false); ...
}
```

Both frames carry `id === "1220413186"` and `activeFullId === "1220413186"`, so `currentActive !== id` is **false for both** and **neither unmounts**. The invariant only evicts *different* videos, never a duplicate of the same one.

**(c) Both facades then unmute themselves.** `VimeoFacade.tsx:229` builds `muted=${autoPlay ? 1 : ...}` → both start muted, but `setupListeners()` posts `setVolume(soundEnabled ? 1 : 0)` (`:82`) and the `soundEnabled` effect re-posts it (`:109-111`). The modal chrome exposes an "Unmute audio" button, so the moment sound is enabled **both** iframes receive `setVolume(1)` → two audio streams.

**(d) Same `player_id` ⇒ cross-talk.** `VimeoFacade.tsx:227` sets `player_id=${videoId}`, and the inbound filter at `:134` is `if (data.player_id && String(data.player_id) !== String(videoId)) return;`. With two players sharing one id, **each facade accepts the other's events**. Both listeners are on `window`, so the modal's timebar receives two interleaved `timeupdate` streams at different playback positions. **This is a second, independent cause of a jumping progress bar — fixing it here is part of item 1, not item 2.**

## Required fix

1. **Stop the double-handling.** Make `VideoFrame`'s root click handler receive and forward the event so `stopPropagation()` actually runs:
   ```tsx
   onClick={(e) => { if (!isPlayingFull) handlePosterPlayClick(e); }}
   ```
   Keep `handlePosterPlayClick`'s `e?.stopPropagation()` at `:245`.

2. **Decide what a gallery tap means and make it unambiguous.** After fix 1 a tap on a gallery tile plays it *inline* and no longer opens the modal — which contradicts the tile's `aria-label="Open … video"`, its `data-cursor="Zoom"`, and the dedicated `Maximize2` button at `Gallery.tsx:249-260`. **In `Gallery.tsx` the tile must open the modal and must not start the inline player.** Pass an explicit prop from `Gallery.tsx:241` to suppress `VideoFrame`'s own click-to-play there (for example a `clickToPlay={false}` / `onRequestOpen` prop — your choice of name, but it must be a real typed prop, not a magic class check). `VideoFrame`'s inline click-to-play must keep working everywhere else it is used.

3. **Close the same-id hole.** `VideoFrame.tsx:96-104` must also stand down when another *instance* holds the same id. Give the registry enough information to distinguish instances — e.g. register a per-instance token (a `useId()` value) alongside the video id in `useVideoRegistry`, and have a frame collapse to its poster when the active token is not its own. Do **not** solve this by comparing DOM positions or by checking `bare`/`autoPlayLead` flags; the invariant must hold for any two instances of any id.

4. **Make `player_id` unique per instance** so two facades can never consume each other's events. Add a `playerId` prop to `VimeoFacade`, default it to `videoId` for backward compatibility, and pass the per-instance token from `VideoFrame`. Update the URL at `:227` and the filter at `:134` to use it. Both must use the same value or every event is silently dropped.

5. **Restore the round-7 security regressions** (Ground Rule 11), both in `VimeoFacade.tsx`:
   - `:72` — delete `iframeRef.current.contentWindow.postMessage(msg, '*');`. Keep only the exact-origin post on `:71`.
   - `:120` — replace `if (e.origin && !e.origin.includes('vimeo.com')) return;` with `if (e.origin !== 'https://player.vimeo.com') return;`.

   `VideoFrame.tsx:131` and `AmbientReel.tsx` already use the strict form; match them.

6. **Pause background playback while the modal is open, and allow resume after close.** The user's requirement is explicit and has two halves. Nothing currently couples the lightbox to background players — `LightboxProvider.tsx` only holds `activeWork` state, and `useVideoRegistry`'s `activeAmbientIds` is a pure slot counter with no pause capability. Add that coupling:
   - On modal open: every `AmbientReel` and every inline `VideoFrame` player must go silent. Prefer posting `pause` to the mounted iframes over unmounting them, so closing the modal is instant and does not refetch.
   - On modal close: background ambient reels may resume. Do **not** auto-resume the inline full player that the tap would have started — after item 1's fix 2, a gallery tap never starts it in the first place.
   - Note `autopause=0` is set on both `AmbientReel.tsx:220` and `VimeoFacade.tsx:229`, which disables Vimeo's own mutual exclusion. **Leave `autopause=0` in place** — the ambient rail legitimately needs several reels running at once — and implement the coupling explicitly instead.

## Traps

- `AmbientReel` iframes are `muted=1` (`AmbientReel.tsx:220`) and therefore **not** a source of audio. They are still a source of decode and network cost, which is item 4's problem. Do not "fix" the audio bug by touching ambient mute state.
- `VideoFrame.tsx:107-113` already calls `stopFull(id)` on unmount when it owns `activeFullId`. If you switch the registry to instance tokens, this cleanup must compare tokens too, or a closing modal will steal the cleanup from a still-mounted inline frame.
- `VideoFrame.tsx:71-76` calls `playFull(id)` for `autoPlayLead`, guarded by a `leadRegistered` ref so it fires once. The modal's frame relies on this. Do not remove it.
- `onEnded` at `VideoFrame.tsx:403-407` deliberately does **not** collapse the lead film (`if (!autoPlayLead) setIsPlayingFull(false)`), because the lead loops and emits stray `finish` events. Preserve that asymmetry.
- The modal is rendered through `createPortal` into `document.body` (`VideoModal.tsx:166`), so it is **not** a DOM descendant of the gallery. Any "is this inside the modal" logic must not rely on `closest()` from the gallery tree.

## Verify item 1

At 390 × 844 **and** at 1440 × 900, with sound enabled, tap a gallery tile, then run:

```js
(() => {
  const f = [...document.querySelectorAll('iframe[src*="player.vimeo.com"]')]
    .filter(i => !/background=1/.test(i.src));
  const ids = f.map(i => i.src.match(/video\/(\d+)/)[1]);
  const pids = f.map(i => (i.src.match(/player_id=([^&]+)/) || [])[1]);
  return {
    fullPlayers: f.length,
    ids, playerIds: pids,
    duplicateIds: ids.length !== new Set(ids).size,
    duplicatePlayerIds: pids.length !== new Set(pids).size,
    modal: !!document.querySelector('[role="dialog"]'),
    starPosts: 'grep VimeoFacade.tsx for postMessage(msg, \'*\') — must be 0 hits',
  };
})()
```

Required: `duplicateIds: false`, `duplicatePlayerIds: false`, and **exactly one audible player**. Then close the modal and confirm `fullPlayers` drops to 0 or 1 and the rail's ambient reels resume. Report the object for both viewports, and confirm by ear (or by reading each iframe's volume) that only one stream is audible while the modal is open.

---

# ITEM 2 — The marquee jumps 12 px once per loop (user issue #3)

> *"there is bug in timeline too like sometime it glitches fix that"*

"Timeline selections" is `content.ts:77` `railHeading` — the marquee rail inside `SelectedWorks`. There is no separate Timeline component. The "sometimes" is because this fires **once per animation loop**: every 48 s on row A and every 56 s on row B.

## Root cause — arithmetic, not timing

`tailwind.config.ts:55` defines the keyframe as `0% → translate3d(0,0,0)`, `100% → translate3d(-50%,0,0)`.

`SelectedWorks.tsx:225` builds each row as `flex gap-6 w-max` containing **two identical copies** of a 6-card list (`RAIL_LIMIT = 12` at `:293`, split into `railRowA` even / `railRowB` odd at `:298-299`), i.e. **12 children with `gap: 24px` between them**.

For 12 children the container width is `W = 2S + 11g`, where `S` is one copy's total card width and `g = 24`. But the true repeat period is `P = S + 6g` — six cards *and* the six gaps that separate one copy from the next. So:

```
-50% of W = S + 5.5g        translate distance
        P = S + 6g          distance needed for a seamless wrap
     error = 0.5g = 12 px   every single loop
```

Measured live, both rows, both viewports — the error is exactly 12 px and is independent of viewport width:

| Viewport | Row | children | gap | inner width | true period | `-50%` moves | **jump** |
|---|---|---|---|---|---|---|---|
| 390 | A | 12 | 24 | 3439.56 | 1731.78 | 1719.78 | **12.00 px** |
| 390 | B | 12 | 24 | 3549.19 | 1786.59 | 1774.59 | **12.00 px** |
| 1440 | A | 12 | 24 | 5708.00 | 2866.00 | 2854.00 | **12.00 px** |
| 1440 | B | 12 | 24 | 5895.94 | 2959.97 | 2947.97 | **12.00 px** |

## Required fix

Move the spacing off the flex container and onto the cards, so that `W = 2 × P` exactly and `-50%` lands on the period:

- Remove `gap-6` from the row's inner element at `SelectedWorks.tsx:225`.
- Give **every** card a trailing `margin-right: 24px` (`mr-6`) — including the last one. `MarqueeReelCard` is defined at `SelectedWorks.tsx:35-77`; that is the right place.

Then `W = 2S + 12g` and `50% of W = S + 6g = P`. Seamless.

## Traps

- **`gap-6` is 24 px at every breakpoint** in this config — there is no responsive variant on `:225`. If you introduce one, the card margin must match it at every breakpoint or you reintroduce the bug at some widths only.
- The **visible rhythm must not change.** With `gap-6` there are 11 visible gaps of 24 px; with `mr-6` on all 12 there are 12, the last one falling at the very end of copy 2 — which is exactly the gap that was missing. Cards must remain the same size and the same 24 px apart on screen. Verify with a screenshot diff at 390 and 1440.
- `MarqueeReelCard` sizes itself from `--rail-h` (`:41` width `calc(var(--rail-h, 288px) * ratio)`, `:44` height `var(--rail-h, 288px)`), and `--rail-h` steps 168 → 224 → 288 px at 640 and 1024 (`globals.css:268-282`). Card widths therefore differ per breakpoint and per aspect ratio. Your fix must not depend on any particular card width — it must be correct for **any** `S`.
- `getHalfWidth()` at `SelectedWorks.tsx:121-124` returns `innerRef.current.scrollWidth / 2`, which is the *same* wrong period and feeds the drag-wrap maths at `:159-163`. Once the container width is `2P`, `scrollWidth / 2` becomes exactly `P` and this becomes correct automatically. **Do not delete it** — confirm it now returns the true period and say so in your report.
- Row B carries `animationDelay="-18s"` (`:482` region) to desynchronise the rows. A negative delay is intentional; keep it.
- Do not "fix" this by changing `-50%` to a computed percentage or by switching to a JS-driven transform. The CSS fix above is exact and keeps the animation off the main thread.

## Verify item 2

At 390 and at 1440:

```js
[...document.querySelectorAll('.marquee-rail [class*="animate-marquee"]')].map(inner => {
  const cs = getComputedStyle(inner), g = parseFloat(cs.columnGap) || 0;
  const n = inner.children.length, W = inner.getBoundingClientRect().width;
  const mr = parseFloat(getComputedStyle(inner.children[0]).marginRight) || 0;
  const S = (W - (n - 1) * g - n * mr) / 2;
  return { n, gap: g, marginRight: mr, W: +W.toFixed(2),
           truePeriod: +(S + (n/2)*(g+mr)).toFixed(2),
           fiftyPct: +(W/2).toFixed(2),
           jumpPx: +((S + (n/2)*(g+mr)) - W/2).toFixed(2) };
})
```

Required: **`jumpPx: 0`** (within 0.01 px for sub-pixel card widths) on every row at every viewport. Also let each row run through a full loop (48 s / 56 s) with `document.visibilityState === "visible"` and confirm no visible hitch.

---

# ITEM 3 — The rail is 48 px narrower than the viewport (user issue #1)

> *"you see only in mobile version the timeline selection rows has gap in right fix that"*

## Reproduced and measured

The rail element is `SelectedWorks.tsx:470`:

```tsx
<div className="marquee-rail relative w-full overflow-hidden py-8 -mx-6 md:-mx-12 px-6 md:px-12">
```

The intent is a full-bleed rail: cancel the parent's `px-6` with `-mx-6`, then re-apply `px-6` inside. **`w-full` defeats it.** With `width: 100%` explicitly set and `box-sizing: border-box`, the border box is pinned to the parent's content width; a negative *right* margin then only affects the flow of following siblings and does **not** stretch the element. Only the negative *left* margin has a visible effect, shifting it left.

Measured at 390 × 844 — the parent's content box is `[24, 366]`:

```
rail:  left 0   right 342   width 342
parent (max-w-shell mx-auto):  left 24  right 366  width 342
heading row right edge: 366
→ rail right edge is 48 px short of the viewport
→ rail right edge is 24 px short of the heading above it
→ unpainted strip: [342, 390]
```

`overflow: hidden` on the rail clips all card content at `x = 342`, so the last 48 px of a 390 px screen never paints a card. That is the reported gap.

**This is not mobile-only.** At 1440 × 900 the same defect measures:

```
rail: left 0  right 1344  width 1344   →  unpainted strip [1344, 1440] = 96 px
heading right edge 1392  →  rail is 48 px short of the heading
```

It is simply less noticeable on desktop, where 96 px is 6.7 % of the viewport and the rail also bleeds off the left edge, so it reads as a page gutter. On a 390 px phone the missing 48 px is 12.3 % of the screen and sits right next to a heading that *does* reach 366 — which is why it looks broken. Fix it at all widths.

## Required fix

Let the negative margins do their job. Both of these were tested live in the DOM and both produce `left 0, right 390, width 390` at a 390 px viewport, and `left 0, right 1440, width 1440` at 1440:

- **Preferred:** drop `w-full` from `:470`. A block-level `div` with `width: auto` and negative horizontal margins expands its border box to `parent + 48` (or `+ 96` at `md:`), which is exactly the intent.
- **Alternative:** keep `w-full` but make the width explicit: `w-[calc(100%+48px)] md:w-[calc(100%+96px)]`. More brittle — the two numbers must track `-mx-6 md:-mx-12` forever.

Take the preferred fix unless it breaks something you can demonstrate.

## Traps

- **Do not remove `overflow-hidden`.** It is what clips the 3400–5900 px inner track. Removing it will blow out the page's horizontal scroll width.
- `document.documentElement.scrollWidth` is **390** at a 390 viewport today, and it must stay equal to the viewport width after your change. `html` and `body` both have `overflow-x: clip`, which will *hide* an overflow regression rather than surface it as a scrollbar — so assert on `scrollWidth`, don't eyeball it.
- The parent chain is `section.px-6.md:px-12 > div.max-w-shell.mx-auto > div.mb-16 > rail`. The `max-w-shell` cap is **1472 px**, so above ~1568 px viewport the shell stops growing and the rail's full-bleed expansion will no longer reach the viewport edge — that is correct and expected. Verify at 1440 (shell not yet capped) **and** at 1920 (shell capped) and confirm the result looks deliberate at both.
- After item 2, each card carries `mr-6`. The rail's own `px-6 md:px-12` padding is unrelated to that and must stay.
- `.marquee-rail` also carries the `--rail-h` custom property (`globals.css:268-282`). Don't drop the class.

## Verify item 3

At 320, 360, 390, 768, 1024, 1440 and 1920:

```js
(() => {
  const r = document.querySelector('.marquee-rail').getBoundingClientRect();
  const shell = document.querySelector('.max-w-shell').getBoundingClientRect();
  return {
    vw: innerWidth,
    railLeft: +r.left.toFixed(2), railRight: +r.right.toFixed(2), railWidth: +r.width.toFixed(2),
    unpaintedRight: +(innerWidth - r.right).toFixed(2),
    shellRight: +shell.right.toFixed(2),
    docScrollWidth: document.documentElement.scrollWidth,
    noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth,
  };
})()
```

Required at every width up to the shell cap: `unpaintedRight: 0`, `railLeft: 0`, and `noHorizontalOverflow: true`. Paste the table for all seven widths.

---

# ITEM 4 — Mobile performance (user issue #4)

> *"ALSO THE MAIN CHANGE FOR MOBILE ITS VERY LAGGY IN MOBILE FIX IT NO MATTER HOW YOU DO THE CODE JUST MAKE IT BUTTERY SMOOTH AND MUST LOAD FAST"*

This is the item the user cares most about. Do it **last**, so you are measuring against a tree where items 1–3 have already removed the duplicate players and the marquee hitch.

Five causes, all verified. Fix all five. **(a) is by far the largest.**

## (a) 61 images, zero srcsets — a 390 px phone downloads full-resolution posters

Measured at 390 × 844, `dpr 2`:

```
totalImgEls: 61     anyWithSrcset: 0
sample: [
  { src: '/brand/neel-logo.webp',        cssW: 42,  natW: 193,  srcset: '(none)', sizes: '(none)', loading: 'auto' },
  { src: '/portrait/neel-collage.webp',  cssW: 320, natW: 1400, srcset: '(none)', sizes: '(none)', loading: 'auto' },
  { src: '/posters/1219763230.webp',     cssW: 340, natW: 0,    srcset: '(none)', sizes: '(none)', loading: 'lazy' },
]
overResolutionWorst: [
  { file: 'neel-logo.webp',      cssW: 42,  natW: 193,  ratio: 2.29 },
  { file: 'neel-collage.webp',   cssW: 320, natW: 1400, ratio: 2.19 },
  { file: '1220554546.webp',     cssW: 320, natW: 1280, ratio: 2.00 },
]
imageBytesKB after one full scroll (32 of 61 loaded): 3803.2
```

`next.config.mjs` sets `images: { unoptimized: true }`, which is **required** for `output: 'export'` and must not change (Ground Rule 4). Under `unoptimized: true`, `next/image` emits a bare `<img src>` with **no `srcset` and no `sizes`** — which means the `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"` prop at `VideoFrame.tsx:327` is **dead code today**. A 340 px-wide tile at `dpr 2` needs ~680 px of image and is being handed 1280–2560 px, i.e. 4–14× the pixels. Each one costs a full-size WebP decode on the main thread, and they arrive in bursts as the user scrolls. That is the lag.

**The fix is already sitting on disk.** `public/posters/` contains `-480`, `-960` and `-1440` variants of all 52 posters, referenced by nothing. Serve them with a real `srcset`:

- Where a poster is rendered — `VideoFrame.tsx:323-334` is the main one; audit `Gallery.tsx`, `SelectedWorks.tsx` and the project pages for others — emit an explicit `srcSet` listing `/posters/{id}-480.webp 480w`, `-960.webp 960w`, `-1440.webp 1440w` and `{id}.webp` as the largest, with a `sizes` attribute that matches the real layout.
- `next/image` passes `srcSet` through when `unoptimized` is set; if you hit resistance, a plain `<img>` with `srcSet`, `sizes`, `loading`, `decoding="async"` and explicit `width`/`height` is acceptable **for poster images only** — but then you must preserve the LQIP blur behaviour at `VideoFrame.tsx:309-315` and `:329-330`, and you must keep `alt` text.
- Expected saving: poster bytes for a 390 px phone drop from **5.73 MB to 1.44 MB (−74.9 %)**.
- `neel-collage.webp` (1400 px natural into a 320 px box) and `neel-logo.webp` (193 px into a 42 px box) are **not** lazy and sit on the critical path. Generate or add smaller variants for these two, or at minimum set an explicit `sizes`/`srcSet`. Do **not** add a build step or a new dependency to generate them — if no smaller variant exists on disk, leave the file alone and report it rather than inventing a pipeline.

Keep `loading="lazy"` on the off-screen posters (it is already applied and is working — only 3 of 61 had loaded at first paint). Add `fetchpriority="high"` to the single above-the-fold hero image and to nothing else.

## (b) `gsap.ticker.lagSmoothing(0)` amplifies jank on slow devices

`SmoothScroller.tsx:48`. Lag smoothing is GSAP's protection against exactly the situation a struggling phone is in: when a frame takes far too long, it clamps the delta instead of letting tweens jump forward. Disabling it means every dropped frame produces a visible lurch, and the worse the device, the worse the lurch.

Remove the `lagSmoothing(0)` call, or replace it with a bounded form such as `gsap.ticker.lagSmoothing(500, 33)`. Then re-measure the p99 frame time.

## (c) Lenis is constructed on touch devices where it smooths nothing

`SmoothScroller.tsx:23-47`. The only gate is `prefers-reduced-motion` (`:25-26`). Lenis is created with `syncTouch: false` (`:32`) — correct, native touch scrolling is preserved — but that also means on a phone Lenis has **no wheel events to smooth** and is pure overhead: `instance.raf(time * 1000)` runs on every GSAP ticker frame (`:43-47`), plus a body-length ScrollTrigger calling `self.getVelocity()` on every scroll update (`:51-61`).

Skip the Lenis instance entirely when `window.matchMedia('(hover: none) and (pointer: coarse)').matches`, and keep `scrollState.vel` fed by a cheap native `scroll` listener (or leave it at 0) so nothing that reads it breaks.

**Traps:** `LenisContext` must still provide a stable value — `VideoModal.tsx:41-43` and `:73-75` call `lenis.stop()` / `lenis.start()` and already handle `lenis` being null via `if (lenis)`. Confirm every other `useLenis()` consumer null-checks too. `window.__lenis` (`:36-38`) may be read elsewhere; grep before you change it. `ScrollTrigger.update` is currently driven by Lenis's `scroll` event (`:41`) — without Lenis, ScrollTrigger must still update on native scroll, which it does by default, but **verify every scroll-triggered reveal still fires on a phone** or the page will render blank sections.

## (d) `VideoFrame` subscribes to the entire Zustand store

`VideoFrame.tsx:64-65`:

```tsx
const { activeFullId, activePreviewId, playFull, stopFull, playPreview, stopPreview } =
  useVideoRegistry();          // no selector
```

Calling the hook with no selector subscribes to **every** field. `useVideoRegistry.ts` also holds `activeAmbientIds`, which churns constantly during scroll as `AmbientReel` instances claim and release slots (`useVideoRegistry.ts:64-79`, `AmbientReel.tsx:138-157`). Every slot change therefore re-renders **all 12+ mounted `VideoFrame`s** on the page, each of which re-runs its effects and recomputes its class strings.

Replace with per-field selectors, e.g. `useVideoRegistry(s => s.activeFullId)`, and pull the stable action functions via `useVideoRegistry(s => s.playFull)` or from `useVideoRegistry.getState()` where they are only called imperatively.

Also check `AmbientReel.tsx:138-157`: its slot-acquisition effect lists `activeAmbientIds` in its dependency array, so **every** slot change re-runs the effect in **every** ambient instance. Narrow the dependency to what the effect actually needs.

## (e) `VimeoFacade` postMessage storm

`setupListeners()` (`VimeoFacade.tsx:76-86`) posts 9 `addEventListener` calls plus `getDuration`, `setVolume` and often `play` — 12 messages. `post()` (`:67-74`) sends **each one twice**, to `'https://player.vimeo.com'` and to `'*'`. And `setupListeners()` is invoked from **five** places: the `ready` handler (`:139`), the effect body (`:211`), a 400 ms retry (`:212`), a 1200 ms retry (`:213`), and `onLoad` (`:224`).

That is on the order of **120 postMessages per player mount**, and — worse — it registers the `timeupdate` listener up to five times, so Vimeo sends up to five `timeupdate` streams, each driving `setProgress` / `setCurrentTime` React state updates (`VideoFrame.tsx:408-411`) on every tick.

- Item 1 already deletes the `'*'` post (Ground Rule 11), halving this.
- Make `setupListeners()` **idempotent**: guard with a ref so the event registration runs at most once per iframe load, and drop the 400 ms / 1200 ms retries once the `ready` handler is proven to fire. If you keep a retry as a safety net, keep exactly one and make it a no-op after `ready`.
- Do not throttle `onTimeUpdate` by dropping precision — the timebar depends on it. Deduplicating the listener registration removes the duplicate streams at the source.

## Do NOT do any of these

- Do not add a virtualisation library, an image CDN, or a new dependency of any kind.
- Do not reduce `RAIL_LIMIT` (`SelectedWorks.tsx:293`) or drop cards from the rail or gallery. The content set is fixed.
- Do not lower poster quality or re-encode any existing file. Use the variants that already exist.
- Do not disable the marquee, the GSAP reveals, or the ambient reels on mobile. The user asked for smooth, not for less.
- Do not change `images.unoptimized`, `output`, or anything else in `next.config.mjs`.

## Verify item 4

Reload cold (empty cache) at 390 × 844, `dpr 2`, confirm `document.visibilityState === "visible"`, then run the scripted full-page scroll and report the same metrics as the baseline table:

```js
(async () => {
  const lt = []; try { new PerformanceObserver(l => l.getEntries().forEach(e => lt.push(+e.duration.toFixed(1)))).observe({ entryTypes: ['longtask'] }); } catch {}
  const fr = []; let last = performance.now(), stop = false;
  const tick = t => { fr.push(t - last); last = t; if (!stop) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  const H = document.documentElement.scrollHeight;
  for (let y = 0; y < H; y += 260) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 55)); }
  stop = true; await new Promise(r => setTimeout(r, 60));
  const d = fr.slice(2).sort((a, b) => a - b), p = q => +d[Math.floor(d.length * q)].toFixed(1);
  const imgs = [...document.querySelectorAll('img')];
  const over = imgs.filter(i => i.complete && i.naturalWidth > 0)
    .filter(i => { const w = i.getBoundingClientRect().width; return w > 0 && i.naturalWidth > w * devicePixelRatio * 1.25; });
  return {
    visibility: document.visibilityState,
    frameMs: { p50: p(0.5), p90: p(0.9), p99: p(0.99), worst: +d[d.length-1].toFixed(1) },
    droppedPct: +(d.filter(x => x > 22).length / d.length * 100).toFixed(1),
    longTasks: lt.length, longTaskTotalMs: +lt.reduce((a,b)=>a+b,0).toFixed(0),
    imgTotal: imgs.length,
    imgWithSrcset: imgs.filter(i => i.srcset).length,
    imgLoaded: imgs.filter(i => i.complete && i.naturalWidth > 0).length,
    overResolutionCount: over.length,
    imgBytesKB: +(performance.getEntriesByType('resource')
      .filter(r => /\.(webp|png|jpe?g)/.test(r.name))
      .reduce((a,r) => a + (r.transferSize || r.encodedBodySize || 0), 0) / 1024).toFixed(1),
  };
})()
```

Targets, against the baseline in this document:

| Metric | Baseline | Target |
|---|---|---|
| `imgWithSrcset` | 0 | **= number of poster `<img>`s** |
| `overResolutionCount` | 3 of 3 loaded | **0** |
| `imgBytesKB` (one full scroll) | 3803.2 | **< 1200** |
| frame p99 | 55.6 ms | **< 20 ms** |
| worst frame | 69.5 ms | **< 35 ms** |
| `droppedPct` | 4.5 % | **< 1 %** |
| `longTaskTotalMs` | 154 | **< 60** |
| `/` First Load JS | 207 kB | **≤ 207 kB** (must not grow) |

If you cannot hit a target, say which one, by how much, and what is still dominating — do not quietly relax it.

---

# ITEM 5 — Full-site re-verification

Only after items 1–4 are individually green.

1. Run both gates one final time and paste the full output, including the build's route table so the First Load JS numbers can be compared against the baseline above.
2. Walk `/`, `/projects`, `/about`, `/contact` and three `/project/[slug]` pages at **320, 360, 390, 768, 1024, 1440, 1920**.
3. Re-run every `Verify item N` block and paste the results.
4. Confirm all of the following still work:
   - Gallery tile → modal opens, **one** audible player, background silent; close → background may resume.
   - Marquee rows loop seamlessly, drag still wraps correctly, drag still suppresses the click (`SelectedWorks.tsx:199-204`).
   - Rail is full-bleed with no right-hand gap and no horizontal page overflow.
   - Modal focus trap, Escape to close, focus restore.
   - Contact form submit path and its mailto fallback.
   - Every GSAP reveal fires (no permanently invisible sections) — check especially on a coarse-pointer viewport if you changed the Lenis gate.
5. Re-check with `prefers-reduced-motion: reduce`, with **JavaScript disabled**, and on a **cold cache**.
6. Re-check with emulated touch (coarse pointer, no hover) — hover previews must be suppressed, taps must work.

---

## MEASUREMENT DISCIPLINE

- Viewports: **320, 360, 390, 768, 1024, 1440, 1920**. Mobile numbers are the ones that matter this round.
- Always confirm `document.visibilityState === "visible"` before trusting a screenshot or any rAF-dependent measurement (Ground Rule 16).
- Report **numbers**, not adjectives. "p99 dropped 55.6 ms → 14.2 ms" is a report; "much smoother" is not.
- Measure the **production** build for byte and JS claims (`npm run build`), not the dev server. Dev-mode JS is roughly 3.2 MB unminified and tells you nothing.
- Test cold-cache and warm-cache separately. Poster lazy-loading means a warm scroll hides the very cost you are trying to fix.
- If a measurement contradicts something in this document, **trust the measurement and say so.** These numbers were taken on one machine at one moment; the reasoning behind each fix stands on its own.

---

## REPORT FORMAT

For each item, in one message:

```
ITEM N — <title>
Files changed:      <path:lines>, ...
Root cause:         <one or two sentences>
Fix applied:        <what you actually did>
Verify output:      <pasted JSON / table from the item's Verify block>
verify-content:     15 PASSED / 0 FAILED
build:              ✓ (64/64), Exporting (2/2), / First Load JS = NNN kB
Deviations:         <anything you did differently from this document, and why>
Left undone:        <anything, or "none">
```

Then **stop** and wait before starting the next item.

---

## EXECUTION ORDER

Do them in this order. It is not the order the user listed them in — it is the order in which they depend on each other.

1. **ITEM 1 — dual audio** (user issue #2). The functional regression, and its unique-`player_id` fix also removes one independent cause of a jumping progress bar.
2. **ITEM 2 — marquee 12 px jump** (user issue #3). Corrects the repeat period, which also silently repairs `getHalfWidth()` for the drag path.
3. **ITEM 3 — rail 48 px right gap** (user issue #1). Same file as item 2; do it after so you only re-measure the rail geometry once.
4. **ITEM 4 — mobile performance** (user issue #4). Last, so it is measured against a tree with no duplicate players and no marquee hitch.
5. **ITEM 5 — full-site re-verification.**
