# MASTER EXECUTION PROMPT — NEEL PATEL PORTFOLIO · FINAL BUILD

**FOR: Gemini in Antigravity · TARGET REPO: `D:\CLAUDE\neel-portfolio` · VERSION: FINAL**

---

# BLOCK 0 — ABSOLUTE COMPLIANCE PROTOCOL

## 0.1 Read this before you generate an execution plan

You are a God-Tier Creative Developer, UI/UX Architect and Master Web Animator. You are finishing a real client project that has already failed three review rounds. The client has given the same feedback three times in three languages. **Your predecessors kept writing plans and skipping the work.** That is the failure mode this document exists to prevent.

## 0.2 THE COMPLIANCE LAW — non-negotiable

> **YOU MUST GENERATE AND CREATE EVERY SINGLE THING THIS PROMPT SPECIFIES.**
> **YOU MUST NOT ADD ANYTHING THIS PROMPT DOES NOT SPECIFY.**
> **YOU MUST NOT IGNORE, DEFER, SUMMARISE, STUB, OR "LEAVE FOR LATER" ANY ITEM.**

Concretely, all six of these are violations that fail the build:

1. Writing `// TODO`, `/* implement later */`, `...`, `// rest of the logic here`, or any placeholder in any file you touch.
2. Marking a requirement "already done" without pasting the `file:line` and the code that proves it.
3. Adding a library, a page, a section, a colour, a font, or a line of client copy that is not named in this document.
4. Replacing a specified technique with an "equivalent" one you prefer. If this document says GSAP Flip, you use GSAP Flip.
5. Reporting a phase complete when its Gate has not been executed and its measured value not printed.
6. Renaming, moving or "cleaning up" a file this document does not tell you to rename, move or clean up.

**Every requirement below carries an ID (`R-n`) or a bug ID (`B-n`). At the end you will produce a compliance table covering every single ID. See BLOCK 10. A report with any ID missing is a failed delivery.**

## 0.3 Antigravity execution-plan constraint

Your planner has previously decomposed this work into its own invented phases and made the site worse. **You may not invent phases.**

- Your execution plan must contain **exactly the 12 phases in BLOCK 9, with those exact titles, in that exact order.**
- You may add sub-steps *inside* a phase. You may not add, merge, reorder, split or rename a phase.
- **Each phase ends with a Gate.** Execute the Gate command, paste its real output, and only then start the next phase.
- If a Gate fails, you fix it inside that phase. You do not proceed. You do not "come back to it."
- **Do not run `npm install`. Do not run `npx create-next-app`. Do not scaffold. Do not delete `node_modules`. Do not touch `package.json` dependencies.** Everything you need is already installed.

## 0.4 What is already true (do not rebuild it)

```
Next.js 15.1.6 · App Router · output:'export'   React 19.0.0
GSAP 3.12.5 (ScrollTrigger, Flip available)     Lenis 1.1.18
ogl 1.0.11 (WebGL)                              zustand 5.0.2
Tailwind 3.4.17 (PostCSS, NOT the CDN script)   lucide-react 0.469.0
sharp 0.33.5 (dev)                              clsx + tailwind-merge
```

Data layer is generated and complete: **16 sections, 53 placements, 52 unique Vimeo uploads, 15 skills, 6 services**, plus 208 posters in `public/posters/` and 52 OG images. This all works. Leave it alone.

---

# BLOCK 1 — THE ZERO-INSTALL RULE, RESOLVED

You may have been given a "Zero-Install / CDN Arsenal" brief demanding vanilla HTML + `cdn.tailwindcss.com` + Bootstrap 5 + Three.js from unpkg, with no npm.

**That brief was written for an empty folder. This is not an empty folder.** Executing it literally means destroying a working Next.js app, its 52-work data pipeline, its 260 generated images and its five routes. That is the single worst thing you could do to this project.

**The rule's actual intent is "the user must not have to run installs."** That intent is already satisfied — GSAP, Lenis, ogl and zustand are installed and committed. So:

| The brief asked for | What you will actually do | Why |
|---|---|---|
| No `npm install` | **Honoured.** Run zero installs. Everything is present. | Intent satisfied |
| Vanilla HTML/CSS/JS | **Rejected.** Stay in Next.js + React 19 + TypeScript. | A rewrite destroys the data pipeline, image optimisation, routing and static export |
| `cdn.tailwindcss.com` | **Rejected.** Tailwind 3.4.17 is already wired through PostCSS with a full custom theme in `tailwind.config.ts`. | The CDN script is a dev-only JIT compiler; it would discard the entire theme and add a render-blocking script |
| Bootstrap 5 CDN | **Rejected outright.** | Bootstrap's reset and grid fight Tailwind's. Two CSS frameworks on one page is a defect, not a feature. Every component it offers is specified natively below |
| Three.js / R3F CDN | **Rejected.** Use the installed **`ogl`**. | ~15× smaller, already a dependency, and every effect specified here is a single fullscreen shader plane |
| Anime.js / Motion One CDN | **Rejected.** Use GSAP. | Already installed and strictly more capable. Two animation engines competing for the same rAF is how you get jank |
| Lottie | **Rejected.** | ~250 KB to do what GSAP + inline SVG already do for 0 KB |
| GSAP + ScrollTrigger + Flip | **Use.** Installed. | Primary animation engine |
| Lenis | **Use.** Installed. | Smooth scroll |
| lucide-react | **Use.** Installed. | Icons |
| Native CSS `animation-timeline: scroll()` / `view()` | **Use as progressive enhancement only** — inside `@supports (animation-timeline: view())`, and only for decorative loops (grain drift, gradient orbit, marquee). | Safari has no support. Anything load-bearing must be GSAP or Safari users see a dead page |
| View Transitions API | **Use**, feature-detected, for route changes. | Native, degrades to the existing fade |
| `@starting-style`, `transition-behavior: allow-discrete`, `:has()`, `:popover-open` | **Use all four.** | Native CSS, no cost, real wins |
| WAAPI `element.animate()` | **Use** for one-shot fire-and-forget micro-interactions only. | Cheaper than a GSAP tween for a 180 ms blip |
| Canvas / WebGL / `requestAnimationFrame` | **Use** via ogl and one shared ticker. | Specified in BLOCK 6 |
| Pointer Events API | **Use.** `pointermove`/`pointerdown`/`pointerup` everywhere, never `mouse*`. | Multi-touch + stylus correctness |
| Device Orientation API | **Use, permission-gated.** | iOS 13+ needs `DeviceOrientationEvent.requestPermission()` from a user gesture. Never auto-request on load |
| Node/Python backend, SSE | **Rejected — out of scope.** | This is `output: 'export'`, a static site. There is no server. The contact form posts to Formspree. Do not create a backend |

**One rAF loop for the entire site.** GSAP's ticker already exists and Lenis is bridged into it at `SmoothScroller.tsx:33`. Every per-frame effect you write hooks that ticker. **Zero new `requestAnimationFrame` loops. Zero `setInterval` animations.**

---

# BLOCK 2 — CONFIRMED BUGS (root-caused by reading the code; fix all 12)

These were measured against the current `master`. Each has a proven root cause. Do not re-diagnose — fix.

## B-1 · THE CUSTOM CURSOR IS PERMANENTLY DEAD (highest priority)

The client has now reported this twice: *"The cursor is currently the default Windows cursor"* and *"mera cursor hi pura gayab ho chuka hai."* Both halves are true and here is exactly why.

`src/components/cursor/MagneticCursor.tsx`:

```tsx
const [enabled, setEnabled] = useState(false);   // line 11

useEffect(() => {                                 // line 13
  if (!isPointerFine || prefersReducedMotion) return;
  setEnabled(true);                               // line 19  ← schedules a re-render
  const dot = dotRef.current;                     // line 21  ← NULL. see below
  const ring = ringRef.current;                   // line 22
  if (!dot || !ring) return;                      // line 23  ← BAILS OUT HERE, EVERY TIME
  const setDotX = gsap.quickSetter(dot, 'x', 'px');
  …
}, []);                                           // line 100 ← never runs again

if (!enabled) return null;                        // line ~102 ← so on first render the divs DON'T EXIST
```

**The chain:** `enabled` starts `false` → first render returns `null` → `dotRef.current` and `ringRef.current` are `null` → the effect runs once, calls `setEnabled(true)`, then immediately hits `if (!dot || !ring) return` and bails **before creating a single quickSetter or attaching a single listener** → the re-render mounts the divs → but the effect has `[]` deps so **it never runs again.** The dot and ring render at `opacity-0` and never move for the life of the page.

Compounding it: **there is no `cursor: none` anywhere in the codebase.** Confirmed — zero matches in `src/`, `globals.css` and `tailwind.config.ts`. So the OS cursor is never hidden.

**Net effect: the native Windows arrow is visible, and the custom cursor is invisible and inert.**

**The fix — do all five parts:**

1. **Always render the cursor markup.** Delete `if (!enabled) return null`. Render the dot and ring unconditionally; control visibility with `opacity` and `visibility` driven by `enabled`. Refs must exist on the very first render.
2. Resolve capability gates in the effect (correct — keep that), but drive them into state that only affects *styling*, never *mounting*.
3. Move the guard: `if (!dotRef.current || !ringRef.current) return;` may stay, but it must now be unreachable.
4. **Apply `cursor: none` from JavaScript, only after the first successful `pointermove` write**, by adding a class to `<html>`. Never put `cursor: none` in a stylesheet — if the cursor script throws, the user is left with no pointer at all and no way to use the site. Remove the class in cleanup and in an error boundary.
5. Gate on `(hover: hover) and (pointer: fine)`, not `pointer: fine` alone.

**Gate:** load the site, move the mouse, and confirm in the console:
```js
getComputedStyle(document.documentElement).cursor            // → "none"
document.querySelector('[data-cursor-ring]').style.transform // → a real translate, changing as you move
```

## B-2 · A PHANTOM VIMEO ID — THIS IS WHY NO SHOWREEL PLAYS

Client: *"teen teen reel dali hai, teeno mein se koi bhi auto play nahi ho rahi."*

`src/components/sections/Hero.tsx` mounts the first showreel with:

```tsx
<AutoplayReel id="1219762955" title="LJ — Masked Edit" aspect="9:16" badge="MASKING · 9:16" />
```

**`1219762955` does not exist anywhere in `src/data/portfolio.generated.ts`.** It was invented. The real ID for "LJ — Masked Edit" is **`1219757810`** (`portfolio.generated.ts:129`). The iframe therefore loads a nonexistent Vimeo video and renders a dead frame.

**Fix:**
1. Correct the ID to `1219757810`.
2. **Stop hardcoding IDs.** Resolve all three reels from the data by slug:
   ```ts
   const bySlug = (s: string) => ALL_WORKS.find(w => w.slug === s);
   const masking = bySlug('lj-masked-edit');          // 1219757810, 4:3
   const motion1 = bySlug('lj-velocity-poster-boy');  // 1219763230, 16:9
   const motion2 = bySlug('stranger-things');         // 1219763331, 16:9
   ```
3. **Add a build-time validator** — `scripts/verify-ids.mjs` — that greps every `1[0-9]{9}` literal out of `src/` and fails with a non-zero exit if any is not in the data. Wire it into `npm run verify-content`. This class of bug must never ship again.

## B-3 · HARDCODED ASPECT RATIOS CONTRADICT THE DATA

Client: *"Mask Edit aur LJ Velocity Poster Boy wali reel ka aspect ratio galat aa raha hai wo 16:9 hai."*

`Hero.tsx` forces `aspect="9:16"` on both. The data says otherwise:

| Work | Data line | Real aspect | Hero forces | Result |
|---|---|---|---|---|
| `lj-masked-edit` | `portfolio.generated.ts:132` | **`4:3`** | `9:16` | squeezed |
| `lj-velocity-poster-boy` | `portfolio.generated.ts:165` | **`16:9`** | `9:16` | badly squeezed — this is what the client is seeing |
| `stranger-things` | — | `16:9` | `16:9` | correct |

**Fix:** the `AutoplayReel` component takes its aspect from `work.aspect`. **Never accept an `aspect` prop that can disagree with the data.** Support all four real values — `9:16`, `4:3`, `1:1`, `16:9` — and set the box with `aspect-ratio`, never fixed pixel heights.

The client asked for *"one masking edit and two motion edits."* That is satisfied by discipline (`masking` × 1, `motion-graphics` × 2), **not** by orientation. Two of the three are horizontal; lay them out to accommodate that instead of distorting them.

## B-4 · THE PLAYBACK TIMELINE IS HARDCODED TO ZERO

Client: *"When I play anything, the timeline stays at zero and doesn't adjust."*

`src/components/video/PlayerChrome.tsx`:
```tsx
progress = 0,                                                    // line 30 — default
style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}  // line 76
```

Nothing ever passes a real `progress`. It cannot: the player is a Vimeo **iframe**, and you cannot read `currentTime` across an origin boundary without asking.

**Fix — use the Vimeo player postMessage protocol. No new dependency.**

1. On mount, once the iframe fires `load`, subscribe:
   ```ts
   const post = (method: string, value?: unknown) =>
     iframe.contentWindow?.postMessage({ method, value }, 'https://player.vimeo.com');
   post('addEventListener', 'timeupdate');
   post('addEventListener', 'play');
   post('addEventListener', 'pause');
   post('addEventListener', 'ended');
   ```
2. Listen on `window`, and **validate the origin before trusting the payload**:
   ```ts
   const onMsg = (e: MessageEvent) => {
     if (e.origin !== 'https://player.vimeo.com') return;
     const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
     if (d.event === 'timeupdate') setProgress(d.data.percent); // 0 → 1
   };
   window.addEventListener('message', onMsg);
   ```
3. Remove the listener on unmount. If more than one player can exist, filter by `d.player_id` so two players never cross-drive each other's bars.
4. **Change the bar from `width` to `transform: scaleX()` with `transform-origin: left`.** Animating `width` triggers layout on every tick; `scaleX` is compositor-only. This is also a hard law (BLOCK 8).
5. Show real `0:07 / 0:22` numerals in tabular figures, and drive the label from `duration` in the data so it is correct before playback starts.

## B-5 · THE VIDEO MODAL IS NOT PORTALED AND SHARES `z-50` WITH EVERYTHING

Client: *"The cards I created open when tapped, but the cards behind them also get covered."*

`VideoModal.tsx:48` is `fixed inset-0 z-50`. Two problems:

1. **`z-50` is the highest z-index in the entire application** — confirmed, the full set in use is `z-0, z-10, z-20, z-30, z-40, z-50`. The modal, the curtain and the cursor all sit on `z-50`, so their order is decided by DOM position by accident.
2. **The modal is rendered inside the section's subtree, not portaled.** You are about to add GSAP parallax transforms to those sections. **A `transform` on any ancestor creates a containing block, and `position: fixed` then resolves against that ancestor instead of the viewport.** The moment parallax lands, this modal will be positioned wrong, clipped, or trapped behind its own siblings.

**Fix:**
1. Render the modal through `createPortal(…, document.body)`.
2. Adopt and enforce this **z-index contract** as CSS custom properties in `globals.css`, and use nothing outside it:
   ```
   --z-base: 0      page content
   --z-media: 10    video frames, posters
   --z-sticky: 20   sticky section chrome
   --z-header: 30   site header
   --z-grain: 40    grain / vignette / grid overlays  (pointer-events: none)
   --z-overlay: 60  overlay menu
   --z-modal: 70    video modal
   --z-curtain: 80  opening curtain
   --z-cursor: 100  custom cursor  (always highest, always pointer-events: none)
   ```
3. Focus trap, `Escape` to close, `aria-modal="true"`, `role="dialog"`, focus returned to the invoking card on close, scroll locked via `lenis.stop()` (**never** `overflow: hidden` on `<body>` — on iOS that scrolls to top and loses the reading position).

## B-6 · `<Reveal>` EXISTS BUT IS APPLIED TO ALMOST NOTHING

Client, twice: *"As I scroll, I need an in-animation for all the text that loads"* and *"सारे टेक्स्ट ... सब में मेरे को ईज इन ट्रांजिशन चाहिए."*

Measured: **`<Reveal>` appears 5 times in the whole codebase, and all 5 are in `src/app/page.tsx` (lines 20, 23, 26, 29, 32).**

```
Contact.tsx  0     Gallery.tsx  0     Hero.tsx  0
SelectedWorks.tsx 0    Services.tsx 0     Toolkit.tsx 0
Footer.tsx   0     Header.tsx   0
```

So it wraps five whole sections in one coarse fade. **Nothing inside any section animates.** The primitive was built and then never used. See `R-15` for the required application.

## B-7 · FOUR SCROLLTRIGGERS EXIST; THE SITE NEEDS 25+

`grep -rn "scrollTrigger:" src | wc -l` → **4**. GSAP appears in 7 files. There is no parallax, no pinning, no scrub, no velocity coupling.

## B-8 · FOUR DECLARED KEYFRAMES ARE DEAD

In `tailwind.config.ts`, `spinSlow`, `grain`, `scanline` and `rgbSplit` are declared and used **zero** times. (`rgbSplit` regressed from 1 use to 0.) Each has a specified use in BLOCK 6 — wire all four.

## B-9 · NO VIDEO FILE AND NO AUDIO FILE EXISTS

`public/previews/` → **0 files.** `public/audio/` → **0 files.** No `<video>` element anywhere in `src/`. Every `playSound()` call fails silently. See `R-30` and `R-40`.

## B-10 · HYDRATION MISMATCH ON `<body>`

The reported error names `<body>` with `- style={{}}`. `layout.tsx:67` declares no `style` prop, so the mutation comes from outside React — a browser extension (the most common cause of this exact signature), a stale `.next` cache, or a render-phase DOM write.

**Fix all of it:**
1. `suppressHydrationWarning` on **both** `<html>` and `<body>` in `layout.tsx`. This is element-scoped — it does not propagate to children, so real mismatches inside the app still report. It is what `next-themes` does, for this exact reason.
2. `ToneBridge.tsx` now exists — **verify the old DOM writes in `useTone.ts:38-52` are gone.** The store must hold state only, with zero `document` access. Delete the `typeof document !== 'undefined'` guards; their presence is the smell.
3. **The law:** first client render must be byte-identical to the server render. `matchMedia`, `localStorage`, `sessionStorage`, `innerWidth`, `navigator.*`, `Date`, `Math.random` are read in `useEffect` and **never during render**. Audit `ToneField.tsx`, `MagneticCursor.tsx`, `SmoothScroller.tsx`, `Curtain.tsx`.
4. Clear the cache before judging anything: `rm -rf .next && npm run dev`, then test in a **fresh incognito window with all extensions disabled**, and **report which cause it actually was.**

## B-11 · `100vh`, FAKE GRAIN, NO REDUCED-MOTION

- `globals.css:46` — `body { min-height: 100vh }`. Must be `100svh`. **Zero `100vh` may remain in the source.**
- `globals.css:84-87` — `.film-grain` is a static `radial-gradient` dot grid at 16px. That is not grain. Replace per `R-33`.
- `globals.css` is 96 lines and contains **no `prefers-reduced-motion` block, no `.sr-only`, no `:focus-visible` rules.** All three are required.
- `--tone-ink` is consumed but not `@property`-registered (only `--tone` and `--tone-blend` are), so it cannot interpolate. Register it.
- `readableInk()` in `useTone.ts:19-20` picks ink by a luminance threshold at `0.45`. With 52 tones spanning `#010501` to `#dfd3d1` a threshold picks the *lower*-contrast ink in the midrange. Compute both real WCAG contrast ratios and return the winner.

## B-12 · `body` OWNS `min-height` TWICE

`layout.tsx:67` sets `min-h-screen` while `globals.css:42-47` sets `min-height`. One property, two owners. Drop `min-h-screen` from the className and keep the CSS (fixed to `100svh`).

---

# BLOCK 3 — THE CLIENT'S REQUIREMENTS (R-1 … R-44)

Every item is a direct quote from one of the client's three review messages. Implement all 44. Several are already partly done — where so, it is noted, and **you must still verify and paste the proof.**

## Group A — The opening (curtain / preloader)

**R-1** · *"the first thing that loads is blank where is that opening fix that"* + *"the cinematic roll that should appear when the website loads is missing"* + *"starting ka jo hai wo pura glitchy aa raha hai. Wo fix nahi hua."*

The opening is the single most-repeated complaint — three times across three messages. Rebuild it completely.

**R-2 · The curtain mechanic, exactly as described.** *"jaise ki main scroll karun toh upar ka rectangle upar jana chahiye, niche ka rectangle niche jana chahiye aur beech mein cut out mein mera naam ho."*

Two full-width leaves, each `50svh`. On scroll, the top leaf translates **up** and the bottom leaf translates **down**, opening like a matte. **The client's name sits in a CUT-OUT between them** — knocked out of the leaves so the page behind shows *through* the letterforms, not painted on top of them.

Implementation:
- Each leaf is a `--ground` fill. The name is knocked out with `background-clip: text` + `color: transparent` on a `--ground`-filled block, or an SVG `<mask>` with white text on a black rect. Pick the SVG mask — it is the reliable cross-browser route and it scales.
- Top leaf carries the top half of the glyphs, bottom leaf the bottom half, so the name **splits along the seam** as the leaves part.
- Drive it with **one GSAP timeline on a `ScrollTrigger` with `scrub: true`**, pinned for `100svh`.
- **Never with React `setState` per wheel event.** The old implementation re-rendered the whole component on every wheel tick with an inline `style={{transform}}`. That is the source of *"pura glitchy aa raha hai."*
- Dismissable by **scroll, click, and `Escape`.** The current root is `pointer-events: none`, so click and keyboard are impossible — fix that.
- `sessionStorage` so it plays once per session, **and render nothing until mounted** so a returning visitor never sees a flash of curtain before it vanishes.
- Not rendered at all under `prefers-reduced-motion`.
- `z-index: var(--z-curtain)`.

**R-3 · Preloader.** `000 → 100` in tabular mono numerals, driven by **real** signals: `0.45 × document.fonts.ready + 0.45 × heroPoster.decode() + 0.10 × DOMContentLoaded`. Eased toward the true value, never jumping backward. **Hard cap 1,800 ms** — if the gate has not resolved, drop it anyway. Skipped on `sessionStorage` repeat and on bfcache restore (`pageshow.persisted`). Hands the ground plane straight to the curtain with **no flash between them**.

**R-4 · One scanline sweep** across the curtain as it opens — `animate-scanline`, currently dead (B-8). Fires exactly once.

**R-5 · One 240 ms RGB-split glitch** at the moment the leaves break — `animate-rgbSplit`, currently dead (B-8). Exactly once, 240 ms. Not a repeating effect.

## Group B — The hero

**R-6** · *"there is title NEEL PATEL in cursive and Bold font like there is two titles neel patel make it only one"* — **already applied.** One wordmark at `Hero.tsx:147`. **Verify** no second `NEEL PATEL` renders anywhere in the hero and paste the grep.

**R-7** · *"ये नील पटेल जब लोड हुआ तब सब वो एनिमेट नहीं हुआ था"* + *"The 'Neil Patel' text needs to be animated with an in-animation."*

`NEEL PATEL` animates in **per character** on load: each glyph in an `overflow: hidden` mask travelling `translate3d(0, 110%, 0) → 0`, 22 ms stagger, `EASE.out`. Runs after the curtain, not under it.

**R-8** · *"My profile photo also needs to be animated with an in-animation, like a pop effect or sliding in."*

The portrait card enters with a **pop**: `scale(0.92) → 1` plus `translate3d(0, 28px, 0) → 0`, 520 ms, `EASE.out`, starting 180 ms after the wordmark so it reads as choreography rather than coincidence.

**R-9** · *"The text 'I'm a video editor specializing in color grading storytelling' needs to be fully animated with an in-animation."*

The role line animates **per word**, 40 ms stagger, immediately after the wordmark.

**R-10 · The giant background wordmark.** `NEEL PATEL` at `clamp(4rem, 17vw, 15rem)`, `--kraft` at 12–14% opacity, `position: absolute`, `aria-hidden="true"`, parallax factor `0.15`. The portrait card sits above it, so **the name passes behind the head as you scroll.** That single z-relationship is what makes the hero read three-dimensional.

This is also the site's most likely overflow source. It needs all three of: `position: absolute` (out of flow), a local `overflow: clip` on the hero stage, and **verification at 320 px**.

**R-11 · Three-plane parallax.** `Hero.tsx:24` carries the comment `{/* 3-Plane Parallax Hero Stack */}` above a static grid with no parallax code. Make the comment true:

| Plane | Content | Factor |
|---|---|---|
| back | giant background wordmark | 0.15 |
| mid | portrait collage card | 0.42 |
| front | copy, spec sheet, counters, CTAs | 0.80 |

**R-12** · *"When I hover over the 'Watch Reel' button, it wobbles too much, so please reduce the wobble effect."*

Reduce the magnetic displacement on that button to a **maximum of 8 px** (from whatever it is now) and set `Magnetic strength={0.18}`. Cap magnetic displacement site-wide at **14 px**. Bounds are read **once on `pointerenter` and cached** — never per `pointermove`, which forces a layout 60×/second.

**R-13 · The showreel trio** — *"I need one masking edit and two motion edits in the hero section for the showreel, and they should play automatically"* + *"teeno mein se koi bhi auto play nahi ho rahi."* Structure exists at `Hero.tsx:261`. Fix it via **B-2** (phantom ID) and **B-3** (aspect). All three must visibly play, muted and looping, without interaction.

**R-14 · Fix the hero section id.** `Hero.tsx:13` is `<section id="about">`. The hero is not the About section — anchor nav and scroll-spy both target the wrong element. Make it `id="hero"` and give the real About block `id="about"`.

## Group C — Motion everywhere (the core complaint)

**R-15** · *"As I scroll, I need an in-animation for all the text that loads so the website looks good"* + *"सारे टेक्स्ट ... सब में मेरे को ईज इन ट्रांजिशन चाहिए"* + *"everywhere add subtle effects for hover scroll and all of the website."*

This is the requirement the last three rounds failed. `<Reveal>` exists but is used 5 times, all in `page.tsx` (B-6). **Apply it inside every section, to every content block:**

| File | What must animate |
|---|---|
| `Hero.tsx` | wordmark (per char), role line (per word), lead paragraph, all 3 body prose columns, spec `<dl>` rows, all 3 counters, both CTAs, showreel trio (staggered) |
| `SelectedWorks.tsx` | section label, heading, sub-line, every rail item, every card |
| `Gallery.tsx` | label, `GALLERY` heading (per char), every filter chip, every tile |
| `Toolkit.tsx` | label, heading, all 15 skill rows, the `<dl>`, every card |
| `Services.tsx` | label, heading, all 6 service rows |
| `Contact.tsx` | label, headline (per char), all 3 form fields, all 3 quick-contact rows |
| `Footer.tsx` | every row, social rail, year |
| `Header.tsx` | mount-in on load only |

**Rule: if any block of content appears on screen without having animated in, R-15 is not met.**

`<Reveal>` requirements — verify all five hold:
1. **CSS-first resting state.** The final visible state is the CSS default; the offset state applies only under `html.js-ready` (set in an effect). **A JS failure means no animation, never invisible content.**
2. One shared trigger config: `start: 'top 88%'`, `toggleActions: 'play none none none'`, `once: true`.
3. `gsap.context()` scoped per component and **reverted in cleanup**, or route changes leak dead triggers and the site degrades as you browse.
4. Children stagger at `STAGGER.sibling`.
5. Under reduced motion: final state rendered, **no trigger created at all**.

Variants: `up` (44px), `down`, `left`/`right` (±52px), `scale` (0.94), `mask` (child `translate3d(0,110%,0)` inside `overflow:hidden`), `clip` (`inset(0 100% 0 0)` → `inset(0)`, decorative only).

**R-16 · `<SplitText>`, SSR-safe.** Three hard requirements:
1. Spans emitted **during render**, present in the static HTML. No post-hydration rewrite, no flash of unsplit text, no new hydration mismatch.
2. `aria-label` carries the **unsplit** string; the span wrapper is `aria-hidden`. Otherwise a screen reader reads "G, A, L, L, E, R, Y".
3. Spaces need `white-space: pre` or multi-word headings collapse into one word.

Per character (22 ms) on display type only. Per word (40 ms) for anything over three words. **Never per character on body prose** — it breaks text selection and animates 300 glyphs nobody is reading.

**R-17 · Scroll-velocity coupling.** One `ScrollTrigger` reads `self.getVelocity()`, normalises to `0→1`, writes a CSS var `--vel`, and drives: gallery tiles skewing to `skewY(2.5deg)` with `scaleY(0.985)`; the WebGL distortion amplitude; the cursor ring's stretch. All settle back on `EASE.out`. **Clamp skew at 3°** or it reads as a rendering bug, not momentum.

**R-18 · Pinned set pieces — exactly six, no seventh.** Curtain bisection · hero three-plane · lead reel with tone match · horizontal gallery scroll · Toolkit band inversion · Services sheet stack.

**Pinning is disabled below `60rem` for the horizontal scroll and the sheet stack.** Use `gsap.matchMedia` so the triggers are **never created** on mobile, rather than created and hidden. A pinned horizontal set piece on a phone traps the user.

**R-19 · GSAP Flip for gallery filtering.** Currently the grid snaps. `Flip.getState(tiles)` → mutate the DOM → `Flip.from(state, { duration: 0.6, ease: 'power2.inOut', stagger: 0.02, absolute: true, onEnter, onLeave })`. **`absolute: true` is required** or surviving tiles jump before they animate.

## Group D — Works, gallery, cards

**R-20** · *"put absolute cinema and motion edits up front in works"* + *"The cinematic edits from my absolute cinema should be shown first"* + *"The cinematic reels should be prioritized."*

Order the works rail and the gallery so **`absolute-cinema` is first, `motion-graphics` second**, then the remaining 14 disciplines. `absolute-cinema` is already `SECTIONS[0]` in the data — **verify** the UI honours file order and does not re-sort.

**R-21** · *"In the selected work section, I need the selected work text to be written in cursive."* Set the `Selected Works` heading in the script face (`font-script`, Ephesis).

**R-22** · *"uske niche bold text mein bhi kuch achha sa likh de toh fir wo achha lage."* Under the cursive heading, add a **bold display sub-line** drawn from existing copy in `src/data/content.ts`. **Do not invent new client copy** — use a string already in the data.

**R-23** · *"the background should be animated"* (Selected Works). Animated gradient sheet behind the section — see `R-34`.

**R-24** · *"REMOVE 'PAN TO BROWSE'"* — *"ye pan to browse wala option jo rakha hai wo hata de wo nahi chahiye mereko. Mereko khali scroll se hi dikhna chahiye."*

`SelectedWorks.tsx:158` has a comment claiming it was removed. **Verify the string is genuinely absent from the rendered DOM**, and that the rail is fully browsable **by scroll alone** with no drag affordance advertised.

**R-25** · *"the font and animation in the timeline selection should be updated"* + *"The selected works gallery font needs to be updated."* Timeline-rail item titles move to the display face (Fraunces, `WONK 1`); metadata stays mono. Each item reveals on scroll with a 60 ms stagger.

**R-26** · *"Then timeline selection pe niche thodi space reh rahi hai"* + *"the space left by the work needs to be adjusted"* + *"the text 'Color grading, VFX animation, pacing mode' has some extra space underneath."*

Three separate reports of dead vertical space. Audit every section's bottom padding. Root cause is almost always an empty flex/grid child, a stale `margin-bottom` on a last child, or a `min-height` that no longer matches its content. **Fix the actual element — do not paper over it with negative margins.**

**R-27 · The Conroy fanned playing-card deck** — *"jo previous card wala layout tha jisme apne playing cards aise hath mein rakh ke aise felate hain waisa hi theek tha."*

Restore the fanned deck: `SECTIONS[5]` (`brand-films`) holds 1 horizontal + 9 near-identical Conroy verticals. Present them as **one stacked deck** — each card rotated `(i - 4) * 2.2deg` with a matching offset, posters only. On scroll into view (desktop) or tap (mobile) the deck **fans into an arc**, 60 ms stagger. Label it `CONROY CAMPAIGN — 1 FILM + 9 CUTS`. One shoot, one grade, ten deliverables: the repetition becomes the point instead of looking like a loading bug.

**R-28 · Tap → card leaves the deck → comes forward → plays** — *"jaise ki abhi koi tap kare video toh wo card mein se bahar aaye fir aage aaye fir wo play hona chalu ho jaye."*

A three-beat GSAP timeline, in this order:
1. **Out** — the tapped card translates clear of the deck and un-rotates to `0deg` (260 ms, `EASE.io`).
2. **Forward** — it scales up and travels toward the viewer, `z-index` raised above every sibling (380 ms, `EASE.out`).
3. **Play** — only when beat 2 completes does the player mount and begin.

Reversed on close, in reverse order, so the card returns to its slot in the fan.

**R-29** · *"When a card is selected, it should open in a large video player window with an animation, allowing it to be zoomed in."*

Modal opens with a **GSAP Flip** transition from the card's own rect to the modal rect, so the poster appears to grow into the player rather than cross-fading. Fix `B-5` (portal + z-index) first or this will break the moment parallax lands.

**R-30 · Videos autoplay on hover** — *"make the vids auto play on hover."*

State machine — implement exactly:
```
IDLE ──pointerenter (hover:hover AND pointer:fine only)──▶ ARMED
ARMED ──140 ms dwell elapses──▶ MOUNT
ARMED ──pointerleave──▶ IDLE            (timer cleared, ZERO bytes fetched)
MOUNT  ── inject iframe ──▶ PLAYING     (cross-fade poster→iframe, 260 ms, EASE.io)
PLAYING ──pointerleave──▶ TEARDOWN
TEARDOWN: iframe.src='about:blank' → iframe.remove() → poster opacity 1 → IDLE
```

URL: `https://player.vimeo.com/video/{id}?background=1&autoplay=1&loop=1&muted=1&playsinline=1&autopause=0&dnt=1&quality=720p`

Five mandatory rules:
1. **The 140 ms dwell timer is not optional.** Without it, dragging the pointer across a 4-column grid fires 12 embeds in 300 ms.
2. **Exactly one hover preview alive at a time, site-wide.** A second `pointerenter` tears down the first before arming.
3. **Teardown is removal, not pause** — `src='about:blank'` *then* `.remove()`.
4. **The poster never unmounts.** It stays underneath at `opacity: 0` so teardown is instant and never flashes black. **The UI must never show a blank box.**
5. Gate off where hover is meaningless or expensive: no `(hover: hover) and (pointer: fine)`, `saveData`, `effectiveType` 2g/3g, `prefers-reduced-motion`. On touch, tap plays with sound.

Add `<link rel="preconnect">` for `https://player.vimeo.com` and `https://i.vimeocdn.com`. No payload, removes ~200 ms from first play.

**R-31** · *"The text in the 'Conroy Campaign' section needs to be animated."* Per-character heading, per-word blurb, staggered card entrance.

**R-32** · *"When I scroll to the 'Toolkit' section, there are many effects and cards that need in-animation."*

All 15 skill rows reveal with a 60 ms stagger. Plus the **moving highlight band**: one sticky full-bleed `--terracotta` band, one row tall, travelling down the list as you scroll, inverting the word it crosses. Implement the inversion by rendering **each row twice** — once `--cream`, once `--on-terracotta` — and revealing the dark copy through a `clip-path: inset()` tied to the band position. **Not `mix-blend-mode`** (unreliable in Android WebView and it forces an expensive stacking context). Rows below the active one fade progressively: `opacity: max(.12, 1 - dist * .28)`.

## Group E — Background and graphics

**R-33** · *"the background across the entire website should be a square background or a nice background that I like, and it needs to be animated"* + *"jo mera background hai website ka wo thoda aur matlab dikhna chahiye waisa kar de aur animated kar de jaise ki upar ja raha hun ya aage ja raha hun waisa mereko chahiye."*

The "square background" is the grid. Currently `globals.css:76-81` is a static 80 px hairline grid at 4% opacity — the client says it should be **more visible and animated with a sense of travelling upward/forward.**

1. Raise grid opacity from `0.04` to **`0.07`**.
2. **Animate it with depth**: the grid translates slowly upward on `translate3d` and scales `1 → 1.08` on a 20 s loop, so it reads as moving *toward* the viewer. Transform only. `steps()` is wrong here — this one is continuous.
3. Couple grid speed to scroll velocity via `--vel` (`R-17`) so scrolling accelerates the travel.
4. **Real film grain**, replacing the fake dot gradient (B-11). Procedural, zero network bytes:
   ```html
   <svg aria-hidden="true" class="fixed inset-0 w-full h-full pointer-events-none
        opacity-[0.06] mix-blend-overlay" style="z-index: var(--z-grain)">
     <filter id="grain">
       <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" stitchTiles="stitch"/>
       <feColorMatrix type="saturate" values="0"/>
     </filter>
     <rect width="100%" height="100%" filter="url(#grain)"/>
   </svg>
   ```
   Animate with `animate-grain` (dead, B-8): a `steps(6)` transform jitter over 8 s. **Transform only — never re-render the filter.**
5. **Vignette** — warm radial in `--ground`, edges at 88%.

**R-34 · Animated gradient textures** — *"बहुत सी जगह पर ग्रेडिएंट टेक्सचर डाल देना और फिर वो ग्रेडिएंट टेक्सचर एनिमेट होने चाहिए, आगे-पीछे होने चाहिए."*

Mesh-gradient blobs: 3–4 large soft `radial-gradient` ellipses in `--terracotta`, `--wine`, `--kraft`, `--indigo` at 6–10% opacity, slowly orbiting each other on **`translate3d` + `scale` only** (never `background-position`), 24–40 s loops at different periods so they never resynchronise. Place behind the hero, Selected Works, Toolkit and Contact. Each tinted from the section's `--tone` so the page shifts colour as you travel.

**R-35 · WebGL warp.** `ToneField.tsx` (164 lines) already uses `ogl`. Extend to three effects on **one plane, one draw call**:
1. **Ambient noise field** — 3D simplex noise, domain-warped, tinted by `uTone`. `uTime` at 0.15 speed.
2. **Scroll-velocity displacement** — `uVelocity` drives a radial UV pinch/barrel distortion. Fling the page and the background **bows**, easing back on `EASE.out`.
3. **RGB shift** — sample R/G/B at offset UVs, offset scaled by `uVelocity`, **max 3 px**.

All six gates must pass before a single WebGL byte loads:
```
desktop && pointer:fine && !prefers-reduced-motion
  && hardwareConcurrency >= 4 && !saveData && webgl2 probe succeeds
```
Dynamic `import()`, `{ ssr: false }`, `dpr` capped at 1.5, **14 KB gzip ceiling**, paused on IntersectionObserver exit and `visibilitychange`. Fallback is a CSS `radial-gradient` from `--tone-blend`.

**Shader noise:** use `webgl-noise` by Ian McEwan / Ashima Arts (`snoise3`) — **MIT**, safe to vendor, keep the copyright header. **Do not copy Shadertoy code** — that site defaults to CC-BY-NC-SA, which is incompatible with a commercial portfolio.

**R-36 · Hover distortion on posters.** Barrel distortion + ripple on hover. Try **SVG `feDisplacementMap` with an animated `scale`** first; only fall back to a per-tile ogl plane if the SVG route exceeds 2 ms/frame. Drop it entirely if neither fits budget — do not ship a janky version.

**R-37 · Typographic scaffold** (highest impact, zero bytes):
- Vertical rotated rail labels — `— SCROLL`, `EST. 2022`, `AHM // IND` — `writing-mode: vertical-rl`, mono, wide-tracked.
- Oversized ghost numerals `01`–`07` per section, `--kraft` at 8%, counting up on entry.
- A running section counter in the header: `02 / 07`.
- Marquee dividers between sections — one duplicated `translate3d(-50%)` track, `aria-hidden` on the copy, zero JS per frame.
- **Rotating circular badge** — `ABSOLUTE CINEMA · ABSOLUTE CINEMA ·` on an SVG `<textPath>` around a circle, driven by `animate-spinSlow` (dead, B-8).

**R-38 · Text scramble on hover.** Nav links and filter chips cycle random glyphs before settling. Cap at **420 ms and 8 frames**; longer reads as broken. Never on body prose. The final string must be in the DOM at rest so it is selectable and readable by assistive tech.

## Group F — Cursor, chrome, content

**R-39 · The cursor** — *"I need a nice cursor that matches the website"* + *"mera cursor fix kar de."* Fix `B-1` first, then build the full state machine:

| State | Trigger | Appearance |
|---|---|---|
| Default | anywhere | 6 px `--cream` dot |
| Interactive | `a`, `button`, `[data-cursor]`, `input`, `label` | 64 px `--kraft` ring, `mix-blend-mode: difference`, mono label from `data-cursor` |
| **PLAY** | any playable frame | **88 px filled `--terracotta` disc** + `Play` glyph |
| Sound | the lead reel | 88 px filled + `Volume2` |
| Drag | horizontal rail | 72 px ring + `↔` |
| Text | over `<p>`, `<h*>` | 2 px dot at 50% opacity |
| Hidden | over a mounted full player | `opacity: 0`, native cursor returns so real controls are reachable |

- `lerp: 0.18` on the follow — that ~90 ms trailing lag is what reads as weight. Above 0.3 it is glued to the pointer; below 0.1 it feels broken.
- **The handler records; the ticker writes.** No `getBoundingClientRect()` and no computed-style read, ever, in the loop. `{ passive: true }` on `pointermove`.
- `mix-blend-mode: difference` so it stays visible over both `--ground` and the near-white posters (`Conroy — Reel 03` is `#dfd3d1`).
- `pointer-events: none`, `z-index: var(--z-cursor)`, always.
- **Focus parity.** Every `[data-cursor]` element is focusable, has a `:focus-visible` ring in `--terracotta` at `outline-offset: 3px`, and surfaces its label on focus. **The cursor may never be the only carrier of information.**

**R-40 · Native controls must match the site** — *"default HTML ke jo shapes aate hain jaise ki wo puri website mein match ho."*

Style every native affordance: `input`, `textarea`, `select`, `button`, checkbox, radio, `::placeholder`, `::selection`, `:autofill`, focus rings, the scrollbar (already partly done), `accent-color: var(--terracotta)`, and `color-scheme: dark` so native widgets stop rendering light-on-light. Nothing may look like an unstyled browser default.

**R-41 · UI sound.** `public/audio/` is empty and `playSound()` fails silently (B-9). Generate the ticks with `AudioContext` oscillators — **zero files, zero bytes**. A 40 ms sine at 880 Hz through a gain ramp is a better UI tick than any sample. Unlock the `AudioContext` on the first real user gesture, never on load. Default **off**, with a visible `SOUND ON` toggle that persists to `localStorage` — and read that value in an effect, not during render (B-10).

**R-42 · `CapCut Advance`** — *"put capcut advance instead of capcut."* **Already applied** at `content.ts:45`. But `portfolio.generated.ts:867` still reads `"CapCut — Advanced"` and `tools/build-data.py:253` is its source. **Reconcile them**: edit `tools/build-data.py`, re-run the pipeline, and confirm both strings agree. **Never hand-edit `portfolio.generated.ts`.**

**R-43 · Route transitions.** `template.tsx:7` uses `animate-[fadeIn_...]`; `fadeIn` **is** now declared. Verify it, then layer the **View Transitions API** on top, feature-detected:
```ts
if (typeof document.startViewTransition === 'function') { /* use it */ }
else { /* existing fadeIn */ }
```

**R-44 · Headings and subtitles in the client's written style** — *"I need the headings and subtitles implemented in the style I've written."*

Every section gets the same three-part header, in this order:
1. Mono label, `letter-spacing: .42em`, uppercase, `--muted`, followed by an **inline SVG ✦** (never a font glyph — no font can be relied on for it).
2. Display heading, Fraunces `WONK 1`, per-character reveal.
3. A one-line `--cream-2` subtitle at `--t-lead`.

Letter-spacing comes from CSS. **Never put literal spaces inside a string** to fake tracking — it destroys screen-reader output and text search.

---

# BLOCK 4 — THE SMOOTHNESS CONTRACT

*"i want the website to be very smooth like if i sroll a bit they all have ease in out transtions."*

Smoothness is a **system property**, not a per-component decision. Encode it **once**, import it everywhere.

```ts
// src/lib/motion.ts — THE single source of truth for all timing
export const EASE = {
  out:  'cubic-bezier(0.16, 1, 0.30, 1)',    // entrances — fast start, long glide
  io:   'cubic-bezier(0.65, 0.05, 0.36, 1)', // reversible state changes — ease in AND out
  soft: 'cubic-bezier(0.40, 0.00, 0.20, 1)', // micro-interactions
} as const;

export const DUR = {
  fast: 0.18,   // hover, chips, icon swaps
  base: 0.42,   // reveals, section entrances
  slow: 0.80,   // tone transitions, curtain, pins
  epic: 1.40,   // scrollTo, route transitions
} as const;

export const STAGGER = { sibling: 0.06, character: 0.022 } as const;
```

**Rules:**
- Entrances use `EASE.out`. Something arriving decelerates into place; it never bounces.
- Anything reversible — hover on/off, menu open/close, filter in/out, card out/back — uses `EASE.io`, genuine ease-in-out, so the return trip feels like the trip out.
- **Nothing uses `linear`** except the marquee and the rotating badge, where linear is correct because they are continuous.
- **Three curves and four durations for the whole site.** A fifth value anywhere is a defect.

**Lenis config — exactly this:**
```ts
new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true, syncTouch: false })
```
- Use **`lerp`, not `duration`.** The current build uses `duration: 1.15`, which is why scrolling feels laggy rather than smooth. `lerp: 0.085` is the "everything glides" feel. Below 0.06 it becomes seasick.
- **`syncTouch: false` stays false.** Native touch scrolling on a phone beats any JS approximation, and forcing smooth touch scroll is the most reliable way to make a site feel broken on mobile. The desktop glide is where the smoothness lives.
- **Expose the Lenis instance through React context.** It is currently trapped inside `SmoothScroller`, so nothing can call `lenis.stop()` (scroll lock for the modal and menu) or `lenis.scrollTo()` (back-to-top, anchor nav). Both are required by `R-2`, `R-29` and `B-5`.

**`scrub: true` on every scrubbed trigger — never a number.** A numeric scrub adds a second smoothing pass on top of Lenis and the result feels laggy, not smoother.

---

# BLOCK 5 — GUARDRAILS (build-blocking, not advice)

**Content**
- **CONTENT IS IMMUTABLE.** 52 works, 53 placements, 16 sections, 15 skills, 6 services, every prose block verbatim. No new copy. No prices. No DaVinci Resolve. No restored form fields.
- `src/data/portfolio.generated.ts` is **generated — never hand-edit it.** Change `tools/build-data.py` and re-run.
- The contact form has **exactly three fields** — Name, Email, Message — plus the `_gotcha` honeypot. Floating labels, no placeholders.
- The form card stays **one atomic grid child at every width.** No breakpoint may split it internally.

**Layout**
- **No `1fr` without `minmax(0, …)`.** No `minmax(<abs>, …)` without a `min(…, 100%)` floor — `minmax(20rem, 1fr)` overflows every viewport under 320 px and is the most common cause of horizontal scroll in modern CSS.
- `min-width: 0` on every flex child that can hold text.
- `overflow-x: clip` **once**, at the root. Not `hidden` — that creates a scroll container and silently breaks `position: sticky` on descendants.
- **Zero `100vh` in the source.** `svh` for full-height sections, `dvh` for the overlay menu, `lvh` where a maximum is wanted.
- `document.documentElement.scrollWidth === clientWidth` at **320, 375, 414, 768, 1024, 1280, 1440, 1920**, plus **844×390** and **1280×600**. Re-check after every layer you add.

**Motion**
- **`transform` and `opacity` only.** Never animate `width`, `height`, `top`, `left`, `margin`, `padding`, `box-shadow`, `filter`, `background-position`, or `backdrop-filter`. `clip-path` is permitted only on already-composited non-text decorative elements (the Toolkit band, the `clip` reveal variant).
- **Zero layout reads inside any rAF or scroll callback.** No `getBoundingClientRect()` per frame. Read once on setup, cache, invalidate on `resize` and `ScrollTrigger.refresh()`.
- **`will-change` ≤ 6 simultaneous**, applied on interaction start and removed on `transitionend { once: true }`. A permanent `will-change` holds a compositor layer for the page's whole life — that is how a site with no visible animation still drops frames.
- Every `gsap.context()` reverted on unmount. `ScrollTrigger.getAll().length` must be **stable after five route changes**. If it climbs, you are leaking triggers.
- **No scroll hijacking.** Never `preventDefault()` on `wheel` or `touchmove`. Sticky sections and scroll-progress reads only.
- No `backdrop-filter` on mobile — the single most reliable way to drop frames on mid-range Android.

**Performance** (Lighthouse mobile, median of 3)
- Performance **≥ 90** · Accessibility **100** · Best Practices **≥ 95** · SEO **100**
- CLS **≤ 0.02** · LCP **≤ 2.2 s** · TBT **≤ 200 ms**
- **Zero** `player.vimeo.com` requests at first paint. **Zero** iframes at `scrollY 0` except the hero trio.
- `ogl` chunk **≤ 14 KB gzip**, dynamically imported.
- `content-visibility: auto` **plus `contain-intrinsic-size`** on off-screen gallery tiles. The intrinsic size is mandatory or the scrollbar jumps as tiles render.

**Accessibility**
- Add to `globals.css`: a real `.sr-only`, `:focus-visible` rules, and a **complete** `@media (prefers-reduced-motion: reduce)` block.
- Under reduced motion: Lenis off, no scrubs, no curtain, no cursor, no marquee, no autoplay, **all content visible at rest**.
- One `<h1>` per route. Every decorative layer `aria-hidden="true"` and `pointer-events: none`.
- Touch targets **≥ 44 px**; player controls 56 px.
- `--wine` and `--indigo` are **fills only** — both fail AA as text on `--ground`.
- **The site must remain readable and navigable with JavaScript disabled**: every string present, all 52 posters visible, form degrading to a normal POST.

---

# BLOCK 6 — EXECUTION PLAN: THE 12 PHASES

**Use these exact titles, in this exact order. Add nothing. Merge nothing. Reorder nothing.** Execute each Gate and paste its real output before continuing.

| # | Phase | Covers | Gate (run it, paste the output) |
|---|---|---|---|
| **1** | **Hydration & Cache** | B-10, B-11, B-12 | `rm -rf .next && npm run dev`; fresh incognito, extensions off; **console completely silent**. Report which cause it was |
| **2** | **Motion Foundation** | BLOCK 4 | `src/lib/motion.ts` exists; Lenis is `lerp: 0.085`, `syncTouch: false`; `lenis.scrollTo(0)` callable from a component; a11y block present in `globals.css` |
| **3** | **Cursor Resurrection** | B-1, R-39, R-40 | `getComputedStyle(document.documentElement).cursor` → `"none"`; the ring's transform changes as the pointer moves; all 7 states reachable by pointer **and** by keyboard |
| **4** | **Data Integrity** | B-2, B-3, R-20, R-42 | `node scripts/verify-ids.mjs` exits 0; zero hardcoded aspect props remain; `grep -rn "CapCut" src tools` shows one consistent string |
| **5** | **Reveal Everywhere** | B-6, R-15, R-16, R-44 | `grep -rn "<Reveal\|<SplitText" src/components \| wc -l` → **≥ 40**, with a non-zero count in **every** section file. Nothing appears on screen without animating in |
| **6** | **Scroll Engine** | B-7, R-11, R-17, R-18, R-19 | `grep -rn "scrollTrigger:" src \| wc -l` → **≥ 25**; 60 fps end-to-end on `/`; zero forced synchronous layout in a performance recording |
| **7** | **The Opening** | R-1 … R-5 | Curtain leaves part with the name knocked out between them; dismissable by scroll, click **and** `Escape`; plays once per session; skipped under reduced motion; no flash on repeat visit |
| **8** | **Video System** | B-4, B-5, R-13, R-29, R-30 | All 3 hero reels visibly play; the progress bar advances during playback; hover >140 ms plays and <140 ms fires zero requests; sweeping 12 tiles in 1 s mounts at most one; modal is portaled to `body` |
| **9** | **Cards & Works** | R-21 … R-28, R-31, R-32 | Deck fans; tap runs out→forward→play in that order; `PAN TO BROWSE` absent from the DOM; rail browsable by scroll alone; Toolkit band inverts via clip, not blend-mode |
| **10** | **Graphics Layer** | R-33, R-34, R-37, R-38, B-8 | All four dead keyframes now used; `document.elementFromPoint` across a 24-point grid hits **zero** decorative layers |
| **11** | **WebGL & Warp** | R-35, R-36 | `ogl` chunk ≤ 14 KB gzip; CSS fallback verified by deliberately failing one gate; velocity visibly warps the background and it eases back |
| **12** | **Verification** | BLOCK 5 entire | Ten-viewport overflow sweep; Lighthouse mobile ≥ 90/100/≥95/100 median of 3; reduced-motion pass; JS-disabled pass; content diff shows **zero** changes |

**Two ordering rules that matter more than the rest:**
- **Phase 1 before anything.** You cannot trust what you see while React is bailing out of hydration.
- **Phase 5 before Phase 10.** Build the motion system before the decoration. Decoration bolted onto a site with no working reveal primitive is exactly how the last three rounds failed.

---

# BLOCK 7 — DEFINITION OF DONE

- [ ] Console clean in a fresh incognito profile with extensions disabled
- [ ] `grep -rn "scrollTrigger:" src | wc -l` ≥ **25**
- [ ] `grep -rn "<Reveal\|<SplitText" src/components | wc -l` ≥ **40**, non-zero in every section file
- [ ] The custom cursor moves, has 7 states, and `cursor: none` is active
- [ ] All 3 hero showreels play automatically, at their **correct** aspect ratios
- [ ] `node scripts/verify-ids.mjs` exits 0 — no phantom Vimeo IDs
- [ ] The playback progress bar advances during playback
- [ ] Hovering any of the 52 tiles plays video, muted, after a 140 ms dwell, and tears down on leave
- [ ] The curtain opens with the name knocked out between the two leaves
- [ ] The Conroy deck fans; tap runs out → forward → play in that order
- [ ] The modal is portaled to `document.body` and covers everything
- [ ] The background grid is visible, animated, and reads as travelling forward
- [ ] All four previously-dead keyframes are in use
- [ ] `PAN TO BROWSE` is absent; the rail works by scroll alone
- [ ] Zero `100vh` in the source
- [ ] `scrollWidth === clientWidth` at all ten viewports
- [ ] `prefers-reduced-motion` disables everything and every string stays readable
- [ ] Lighthouse mobile ≥ 90 / 100 / ≥ 95 / 100
- [ ] Content diff against `src/data/`: **zero changes**
- [ ] **BLOCK 8 compliance table filled in for every ID**

---

# BLOCK 8 — MANDATORY COMPLIANCE REPORT

Your final message must contain this table, **with a row for every one of the 56 IDs** (`B-1`…`B-12`, `R-1`…`R-44`). No omissions. No "N/A". No ranges.

| ID | Status | File:line of the change | Proof |
|---|---|---|---|
| B-1 | DONE | `src/components/cursor/MagneticCursor.tsx:11,102` | `cursor` computes to `none`; ring transform updates on move |
| … | … | … | … |

`Status` is one of exactly three values:

- **DONE** — implemented, Gate executed, proof pasted.
- **ALREADY-MET** — was already correct. **Requires the `file:line` and the code that proves it.** Asserting this without evidence is a failed delivery.
- **BLOCKED** — genuinely impossible. **Requires the specific technical reason and what you did instead.** "Ran out of time", "left for later" and "out of scope" are not reasons.

Then answer these five questions explicitly:

1. Which of the three hydration causes was it — extension, stale cache, or render-phase write?
2. What is the final `grep -rn "scrollTrigger:" src | wc -l`?
3. What is the final `grep -rn "<Reveal\|<SplitText" src/components | wc -l`, broken down per section file?
4. Did all three hero showreels play, and at what aspect ratio each?
5. What are the three Lighthouse mobile runs, and their median?

---

> **This is a colourist's portfolio. It should look like it was graded and behave like it was cut.**
> Right now it looks graded and behaves like a document. Phase 5 is where that changes.
>
> **Generate everything specified here. Add nothing. Ignore nothing.**
