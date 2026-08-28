# Round 2 — 10 measured changes to the Neel Patel portfolio

You are working in an existing Next.js portfolio at the repository root. Every item below was
reproduced in a real Chromium browser at **1440 × 900** and the measurements are quoted inline.
**Trust the measurements over your own reading of the code.** Several plausible-looking hypotheses
were tested and disproved during measurement, and those are called out explicitly so you do not
waste time re-deriving them.

Some of these are bug fixes and some are redesigns — each item says which. Do not redesign anything
that is not explicitly asked for. Do not change video IDs, section order, or the colour palette.

Implement all 10.

---

## Ground rules (violating any of these re-introduces bugs that were already fixed)

1. **Never run `npm install` / `npm add`.** Everything is already installed: Next.js 15.1.6 (App
   Router, `output: 'export'`), React 19.0.0, Tailwind 3.4.17, GSAP 3.12.5 (ScrollTrigger + Flip),
   Lenis 1.1.18, ogl 1.0.11, zustand 5.0.2, lucide-react, sharp. Adding a dependency is a failure.

2. **Never hardcode `will-change` in `className` or CSS.** `will-change` must be applied immediately
   before an animation and removed the instant it finishes. GSAP does this automatically **only if
   you do not hardcode it**. A permanent `will-change` promotes the element to its own compositor
   layer forever, and also makes it a stacking context *and* a containing block for
   `position: fixed` descendants.

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
   adds a second smoothing pass and makes scrubbed sections feel like they lag behind the wheel.

7. **Never apply GSAP `pin` to a CSS Grid/Flex child, and never to an element that is itself a
   scroll container.** Both have already caused shipped defects here.

8. **Replace `transition-all` with an explicit property list** (`transition-[transform,border-color]`
   etc.). `transition-all` makes the browser watch every animatable property.

9. Keep every `prefers-reduced-motion` guard that already exists, and add one to any new animation.

10. Use `svh`/`dvh`, never `100vh`. Keep the anti-overflow trio where grids are involved:
    `minmax(0,1fr)`, `min(<size>,100%)`, `min-width: 0`. Root stays `overflow-x: clip` (not
    `hidden`, which breaks descendant `position: sticky`).

11. **`ScrollTrigger.addEventListener('refresh', fn)` registers a GLOBAL listener that
    `gsap.context().revert()` does NOT clean up.** If you add one, hand the remover up to the
    `useEffect` cleanup. `src/components/sections/Toolkit.tsx:140-142` and `:187` already do this
    correctly — preserve that pattern when you rewrite that file.

12. **`src/data/content.ts` is under a verification gate.** `npm run verify-content` must stay green.
    It asserts `uniqueCount === 52`, `placementCount === 53`, `sectionCount === 16`,
    `skillCount === 15`, `serviceCount === 6`, that every locked id + title + blurb + skill + service
    appears verbatim in `src/data/portfolio.generated.ts`, that `src/` contains zero occurrences of
    "DaVinci", zero phantom Vimeo IDs, and that these exact strings still appear in `content.ts`:
    `"Let's cut "`, `"WATCHING"`, `"turning raw footage into visuals that don't just get watched,
    they get felt"`, `"Premiere Pro · After Effects · CapCut"`, `"neelpatel00235@gmail.com"`,
    `"+91 91067 30866"`, `"@neelvt"`, `"Ahmedabad, India"`, `"Open for work"`, `"24 hours"`,
    `"16:9 · 9:16 · 4:3 · 1:1"`. **Item 9 changes `SERVICES_COPY.title`, which is safe** — that
    string is in neither `tests/content.lock.json` nor the gate's verbatim list. **Item 10 must not
    touch any Contact copy at all**, only its styling.

13. **After every item, run `npm run build`** and confirm it still exports cleanly, then
    `npm run verify-content` and confirm 0 FAILED.

---

## How this was measured

`npm run dev` on a real Chromium instance, viewport forced to 1440 × 900, Lenis active, no reduced
motion, `(hover: hover) and (pointer: fine)` true. Network reachability to Vimeo was confirmed from
the page itself (`fetch('https://player.vimeo.com/video/1219763230', {mode:'no-cors'})` returned an
opaque response), so **no failure below is a network problem.** Scroll positions are quoted as
absolute `window.scrollY` against a `document.body.scrollHeight` of 13176px, with section offsets:

| section | page top | height |
|---|---|---|
| `#about` (in Hero) | 1534 | 148 |
| `#gallery` | 4902 | 2357 |
| `#skills` | 7260 | 2624 |
| `#services` | 9884 | 1028 |
| `#contact` | 10912 | 1453 |

---

## Item 1 — Curtain reveal and site background

Two separate changes in one item. **This is a redesign, not a bug fix.**

### 1a. The wordmark must stop being transparent

`src/components/curtain/Curtain.tsx` renders two leaves (`:231` top, `:284` bottom, both
`h-[50svh]`). Each contains an SVG whose mask knocks the letterforms **out** of the panel:

```jsx
<mask id="matte-knockout-top">
  <rect ... fill="white" />
  <text x="600" y="600" textAnchor="middle" dominantBaseline="central"
    fill="black" fontSize="112" fontWeight="900" letterSpacing="10"
    style={{ fontFamily: 'var(--font-fraunces), Fraunces, serif', fontVariationSettings: "'WONK' 1" }}>
    NEEL PATEL
  </text>
</mask>
...
<rect width="1200" height="600" fill="#13100c" mask="url(#matte-knockout-top)" />
```

The black `<text>` inside a white-`<rect>` mask is what makes "NEEL PATEL" a hole through to whatever
is behind it. That is the transparency in image 1. **Delete both masks** (`matte-knockout-top` at
`:242-268` and `matte-knockout-bottom` at `:295-321`) and render the wordmark as **solid opaque
text**.

### 1b. Rebuild the reveal to match images 2–6

Target composition, using the site's own palette only:

- Full-bleed panel in **`#f67c29`** (`terracotta`). Not a gradient, not a tint — the flat accent.
- Wordmark set in `font-display` (Fraunces, `font-variation-wonk`), **`#13100c`** (`ground`), heavy
  weight, tight tracking, centred.
- A **dark band** (`#13100c`) sitting across the middle of the orange panel, which **splits open
  outward from the centre** as the reveal progresses — top half travels up, bottom half travels down.
- The wordmark is **mirrored across the split line**: the upper half of the letterforms reads
  normally, the lower half is a vertical reflection. Achieve this with two copies of the same text,
  the lower one `scaleY(-1)`, each clipped to its own half. **Do not use `clip-path` on the text
  itself** (rule 3) — clip via a wrapper with `overflow: hidden` and a fixed height, and animate only
  the wrapper's `transform`.

### 1c. The reveal must be scroll-driven and progressive

Currently it is **binary**. `Curtain.tsx:191-193`:

```js
const onScroll = () => {
  if (window.scrollY > 15) {
    dismissCurtain();
```

fires a fixed 0.85s GSAP timeline that sends `topLeafRef` to `yPercent: -100` and `bottomLeafRef` to
`yPercent: 100` with `power3.inOut`. One scroll tick plays the whole thing.

Replace with a ScrollTrigger-scrubbed timeline so the panel opens **exactly as far as the user has
scrolled** — scroll a little, it opens a little; keep scrolling, it opens more. Requirements:

- `scrub: true`, never numeric (rule 6).
- Scroll distance for the full open: `end: '+=100svh'` on a trigger pinned to nothing. Do **not**
  `pin` (rule 7) — the curtain is already `position: fixed` in a `createPortal(document.body)` at
  `Curtain.tsx:215`, so it stays put without pinning.
- Drive **only** `yPercent` on the two leaves (0 → −100 and 0 → +100). No height, no clip-path on
  text.
- **The site behind must only become visible in the last 10–20% of the open.** Do this by scrubbing
  the *leaves* across the whole range while the site's own opacity ramps `0 → 1` over progress
  `0.8 → 1.0` — a separate tween on the same scrubbed timeline positioned at 80%. Below 80% the
  gap between the leaves shows the flat orange panel, not the page.
- Keep the `sessionStorage.getItem('neel_curtain_played')` gate (`:25`, `:134`) and the
  reduced-motion bail. Under reduced motion, skip straight to dismissed.
- Keep the `{ passive: true }` scroll listener removal in the cleanup (`:203`, `:207`).
- The unused constants in `src/data/content.ts` → `CURTAIN` already describe this design and should
  now be used: `scrollBadgePath: "SCROLL · SCROLL · SCROLL · "`, `scrollBadgeStatic: "SCROLL TO
  REVEAL"`, `edition: "2026 EDITION"`.

### 1d. Site background — the fine square grid from image 7

There is already a global grid layer. `src/app/layout.tsx:80`:

```jsx
<div className="fixed inset-0 pointer-events-none grid-overlay z-0 opacity-70" aria-hidden="true" />
```

and `src/app/globals.css:184`:

```css
.grid-overlay {
  background-size: 64px 64px;
  background-image:
    linear-gradient(to right, rgba(246,124,41,0.14) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(246,124,41,0.14) 1px, transparent 1px);
  animation: gridTravel 20s linear infinite;
  opacity: 0.07;
}
```

**Measured live:** the computed opacity of that layer is **0.07** (the CSS rule wins over Tailwind's
`opacity-70`), and the line colour is already only `alpha 0.14`. Effective line alpha on screen is
`0.07 × 0.14 = 0.0098` — **about 1%, which is why the background reads as flat near-black** in
every screenshot. That is the whole reason image 7's grid is missing.

Fix by making the existing layer actually visible, matching image 7:

- Cell size **40px** or **48px**, not 64px — image 7's grid is finer.
- Line colour **neutral, not orange** — a cool off-white at low alpha, e.g.
  `rgba(250,244,232,0.055)`. Image 7's grid is grey/neutral, not terracotta.
- Raise the layer's own `opacity` so the **effective** line alpha lands around **0.05–0.07** on
  screen. Compute it — do not guess. Verify with `getComputedStyle` that the product of the layer
  opacity and the line alpha is in that range.
- **Keep `@keyframes gridTravel`** for the "make it moving" request. It is already transform-only
  (`translate3d` + `scale`), so it is rule-3 compliant. Do not replace it with a
  `background-position` animation.
- **Keep the `html.grid-off` / `body.grid-off` / `.grid-off` escape hatch** at `globals.css:194-196`
  working — it is wired to a chrome toggle.
- **Keep every other layer intact.** Do not touch `.gradient-orb-1`, `.gradient-orb-2`,
  `.film-grain-layer`, or the per-section `.grid-overlay` instances in `Gallery.tsx`,
  `SelectedWorks.tsx` and `Toolkit.tsx` (those are additive and intentional).
- Keep the reduced-motion block that sets `animation-play-state: paused !important`.

---

## Item 2 — Hero spacing and typographic weight (image 8)

**This is a real measured bug plus a design ask.**

### 2a. The title collides with the role line

Measured at 1440 × 900, `scrollY: 0`:

| element | font-size | line-height | box | top | bottom |
|---|---|---|---|---|---|
| `h1` "NEEL PATEL" | 184px | 161.92px | 761 × 324 | 365 | **689** |
| role "Video Editor · Colourist" | 16px | 24px | 761 × 37 | **663** | 700 |

The role line starts at **663**, which is **26px above where the `h1` box ends (689)** — they
overlap — even though the `h1` carries `mb-6` (24px). At 184px with `leading-[0.88]` the glyph
descenders of "PATEL" overshoot the 161.92px line box, and the title wraps to two lines
(324 = 2 × 161.92), so the overshoot lands directly on the role line. That is the "spacing seems
off especially at the big title and 'video editor colourist'" in image 8.

Fix on `src/components/sections/Hero.tsx`, the `<h1 … text-mega … leading-[0.88] mb-6>` and the
`roleRef` div (`… tracking-[0.24em] font-semibold mb-6`):

- Raise the `h1` line-height enough to contain the descenders at 184px, or add explicit bottom
  padding to the `h1`'s own box. Do not just increase `mb` — the overlap is inside the `h1`'s line
  box, so margin alone will not fix the visual collision at every breakpoint.
- Give the role line real breathing room above it — target **≥ 32px** of clear space between the
  title's lowest ink and the role's cap height at 1440px.
- Verify the fix by measuring: `h1.getBoundingClientRect().bottom` must be **less than**
  `role.getBoundingClientRect().top` at 1440 × 900, 1280 × 800 and 390 × 844.

### 2b. Fill the empty space on large screens

Measured in the same pass: the typography column is **761 × 643** while the portrait column beside
it is **530 × 975** (grid `gap: 48px`, `lg:grid-cols-12`). That leaves **332px of dead vertical
space** under the text column on a desktop viewport — the "it looks kinda plane in the background
i mean a lot of space is empty".

- Add content and rhythm to the left column so it reaches closer to the portrait's height: a script
  accent line, a rule, a stat strip, a location/availability line — your call on composition.
- **Add a cursive accent.** The `font-script` family (Ephesis) is already wired in
  `tailwind.config.ts:27` as `script: ['var(--font-ephesis)', 'cursive']` and the font is already
  loaded in `layout.tsx`. Use it for one accent word or line in the hero — not for body copy.
- **Cursive caveat:** Ephesis has an inline box far taller than its glyphs. The working pattern
  already used at `src/components/sections/Contact.tsx` is `inline-block` + a reduced `em` size +
  tight `leading` + negative block margins. Reuse it, or the accent will blow the line spacing apart.
- **Preserve the mobile order fix.** The layout is `lg:grid-cols-12` with the typography column at
  `lg:col-span-7 order-2 lg:order-1` and the portrait at `lg:col-span-5 order-1 lg:order-2`. That
  ordering exists so the photo appears *before* the name on mobile. Do not break it.

---

## Item 3 — Hero showreel trio: not playing, wrong order, too small (image 9)

**The "not playing" part is a confirmed bug and the cause is a single opacity gate.**

### 3a. Root cause of "not playing" — proven, and it is not the network and not Vimeo

`src/components/sections/Hero.tsx:57-66`, inside the local `AutoplayReel` component:

```jsx
const [iframeLoaded, setIframeLoaded] = useState(false);
...
<iframe
  src={`https://player.vimeo.com/video/${work.id}?background=1&autoplay=1&loop=1&muted=1&playsinline=1&autopause=0&dnt=1&quality=720p`}
  onLoad={() => setIframeLoaded(true)}
  className={`... transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
  loading="eager"
/>
```

**Measured on the live page.** All three iframes are present in the DOM with correct `src` and
non-zero box sizes. After a **5 second** wait:

| iframe | video id | computed opacity | class state |
|---|---|---|---|
| hero reel 1 | 1219757810 | **0** | `opacity-0` — never loaded |
| hero reel 2 | 1219763230 | **0** | `opacity-0` — never loaded |
| hero reel 3 | 1219763331 | **0** | `opacity-0` — never loaded |
| Conroy bg (`SelectedWorks.tsx:312`) | 1220556151 | **0.35** | static `opacity-35`, no gate — **visible** |

The fourth iframe on the page uses the same `background=1&autoplay=1` URL shape with a **static**
`opacity-35` class and **no `onLoad` gate**, and it is visible. The three gated ones are invisible.
Network reachability to `player.vimeo.com` was confirmed from the page. **Conclusion: the videos are
loading and playing behind a permanently transparent iframe. `onLoad` never fires, so the gate never
opens, and the user sees the static poster underneath — which reads exactly as "it's not playing".**

Fix: **remove the `onLoad`-gated opacity entirely.** The real poster sibling already sits behind the
iframe at a lower z-index (`Hero.tsx:49-55`, `<Image fill className="object-cover">`), so there is no
flash of black to protect against. Render the iframe visible from mount. If you want to keep a soft
entrance, use a **CSS-only** fade (a keyframe with a short `animation-delay`) so it cannot depend on
a JS event that may never fire. Do not add a `setTimeout` fallback around a state gate — just delete
the gate.

### 3b. Order and sizing

Currently `Hero.tsx:394-425` renders the trio in a `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
gap-8 items-end` as:

1. `masking` = `bySlug('lj-masked-edit')` — badge `"MASKING · 4:3"`
2. `motion1` = `bySlug('lj-velocity-poster-boy')` — badge `"MOTION · 16:9"`
3. `motion2` = `bySlug('stranger-things')` — badge `"MOTION · 16:9"`

**Required order: `motion1` (LJ — Velocity / Poster Boy) left → `masking` (LJ — Masked Edit) middle
and largest → `motion2` (Stranger Things) right.** All three autoplaying.

Measured current rendered sizes, driven by `Hero.tsx:34-39`:

```js
const maxWClass =
  work.aspect === '9:16' ? 'max-w-[210px]'
  : work.aspect === '4:3' ? 'max-w-[300px]'
  : 'max-w-[380px]';
```

| reel | aspect | measured box |
|---|---|---|
| LJ — Masked Edit | 4:3 | 298 × 223 |
| LJ — Velocity / Poster Boy | 16:9 | 378 × 212 |
| Stranger Things | 16:9 | 378 × 212 |

All three must get **noticeably bigger**, and the middle one must be the largest. The current sizing
is keyed purely off `work.aspect`, which cannot express "the middle one is bigger" — **add an
explicit size prop** (e.g. `size: 'lead' | 'flank'`) to `AutoplayReel` and let the call site choose,
rather than widening the aspect-based map. Suggested targets at 1440px: flanks ≈ **420–460px** wide,
lead ≈ **540–580px** wide. Keep `items-end` alignment so the differing heights bottom-align.

**Adjust the captions to the new sizing.** The caption row is `Hero.tsx:69-74` —
`font-mono text-[0.66rem]` with a `truncate` title and a `whitespace-nowrap` badge. At the larger
widths that type is too small relative to the frame, and the middle card can carry more. Scale the
caption type with the card size and make sure the title still does not wrap or clip at any breakpoint
(keep `truncate` + `min-w-0`).

---

## Item 4 — Enlarge the lead showreel (image 10)

**Pure sizing change.** `src/components/sections/SelectedWorks.tsx:184`:

```jsx
<div ref={leadFilmRef} className="w-full max-w-5xl mx-auto rounded-xl overflow-hidden border border-line shadow-2xl transition-all duration-500 hover:border-terracotta/60 hover:shadow-terracotta/10">
```

**Measured at 1440px:** the lead film renders **1024 × 577** (that is `max-w-5xl` = 1024px) inside a
shell that is **1338px** wide (`max-w-shell` = `92rem` = 1472px, minus `px-6 md:px-12`). That leaves
**314px of dead margin — 157px on each side.**

Let it fill the shell: drop `max-w-5xl` so the `w-full` inside `max-w-shell` governs, or cap it at
something near the shell width. Target **≥ 1280px** wide at a 1440px viewport.

While you are in this element, also apply rule 8: replace `transition-all duration-500` with
`transition-[border-color,box-shadow] duration-500`. Note that `hover:shadow-*` is a paint-only
hover state, not an animation, so it does not violate rule 3 — but do not scrub or tween it.

---

## Item 5 — "Timeline selections" becomes a continuous non-clickable marquee (image 11)

**This is a redesign of an existing interactive rail.**

Current state in `src/components/sections/SelectedWorks.tsx`:

- `:217` a `<Link href="/projects">` reading `VIEW ALL (52)` — measured `href="/projects/"`.
- `:224` the rail: `<div ref={railRef} className="flex gap-6 overflow-x-auto pb-6 scrollbar-none
  snap-x snap-mandatory">` — measured **1338 × 759** containing **13 children** at **384px** each
  (12 work cards + a "View All End Card" at `:277`).
- `:227` each card `flex-shrink-0 w-80 md:w-96 snap-start`, clickable via `handleCardClick` at `:229`
  and `:245`, plus a `Maximize2` zoom button at `:251`.
- `RAIL_LIMIT = 12` at `:55`.

Required:

1. **Delete the `VIEW ALL (52)` link** at `:217` entirely. Delete the "View All End Card" at
   `:275-277` too — it is the same affordance in card form.
2. **Continuous right-to-left motion at slow speed.** Use the primitive that already exists rather
   than inventing one: `tailwind.config.ts:52` defines
   `marquee: { '0%': { transform: 'translate3d(0,0,0)' }, '100%': { transform: 'translate3d(-50%,0,0)' } }`
   and `:61` runs it as `marquee 34s linear infinite`. Duplicate the card list **exactly twice**
   inside the moving track so the `-50%` wrap is seamless. Slower than 34s — the ask is "slow speed",
   so target **60–90s** for a full cycle. Add the animation as a new entry in
   `tailwind.config.ts` rather than overriding the shared `animate-marquee` used by the Toolkit band.
3. **Every reel autoplays.** Use the same `background=1&autoplay=1&loop=1&muted=1&playsinline=1&autopause=0&dnt=1&quality=720p`
   embed shape. **Do not route these through `VideoFrame`** — that component exists for
   click-to-play with a 140ms hover-dwell timer and a global single-preview registry
   (`src/components/video/VideoFrame.tsx`), all of which is wrong for an always-playing
   non-interactive rail and will fight the marquee. Build a small dedicated always-on tile.
4. **Non-clickable.** Remove `handleCardClick` from these cards and remove the `Maximize2` button.
   Put `pointer-events: none` on the iframes. Do not open the modal from this rail.
5. **But keep a light hover response** — "do make them hover a little while hovering so user get
   that interactive experience". A subtle `transform: scale()` and/or `border-color` shift on the
   tile is enough. This means the tile wrapper must keep `pointer-events`, only the iframe drops
   them. Pause the marquee on hover of the track if you like — that is a good touch — but do it by
   toggling `animation-play-state`, not by rewriting the transform.
6. Drop `overflow-x-auto`, `snap-x`, `snap-mandatory` and `scrollbar-none` from the track. It is no
   longer a scroll container. **This also matters for rule 7** — do not later `pin` anything that is
   a scroll container.
7. Add a `prefers-reduced-motion` guard: under reduced motion, stop the marquee and render the row
   static.

---

## Item 6 — Conroy campaign: kill the background card, build a playing-card fan (image 12)

**This is the biggest redesign in the list.**

### 6a. Delete the washed-out background

`src/components/sections/SelectedWorks.tsx:298-312` — measured wrapper box **1338 × 1033**:

```jsx
<div className="relative pt-12 pb-10 border-t border-line-2 rounded-3xl overflow-hidden px-4 sm:px-8 my-10">
  <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden bg-black">
    <Image ... className="object-cover opacity-50" />         {/* :306 — the Conroy poster */}
    <iframe ... className="absolute inset-0 w-full h-full border-0 pointer-events-none scale-105 opacity-35" />  {/* :312 */}
    <div className="absolute inset-0 bg-gradient-to-b from-ground/92 via-ground/85 to-ground/96" />
  </div>
```

That `-z-10` stack — a 50%-opacity Conroy poster, a 35%-opacity looping iframe of the same film, and
a triple-stop scrim over both — is the "everything is in a card with conroy show reel image it seems
in the background wtf is that". **Delete the entire `-z-10` layer.** Also drop the `rounded-3xl` card
framing so the block stops reading as a card. Keep the `border-t border-line-2` section rule.

### 6b. Conroy showreel, autoplaying, as the hero of the block

`conroyHero = conroySection?.works[0]` at `:33` — this is `Conroy — Cinematic Reel` from the
`brand-films` section. Give it a proper large autoplaying frame in the foreground, at the same
generous width as item 4's lead film. Same `background=1&autoplay=1&loop=1&muted=1` embed shape.

### 6c. The 9 other cuts as a playing-card fan

`conroyReels = conroySection?.works.slice(1)` at `:34` — `brand-films` has **10 works**, so this is
exactly **9 reels**. They currently render as a flat `grid-cols-2 sm:grid-cols-3 lg:grid-cols-3
gap-6` with `style={{ contentVisibility: 'auto', containIntrinsicSize: '260px' }}` at `:345`.

Replace with a **held-hand playing-card fan**, beside or below the Conroy hero:

- 9 cards, each card's face is a **real clip/poster from that Conroy cut** (not a generic card back).
  Posters live at `/posters/{work.id}.webp` and are already on disk.
- Arrange them like cards held in a hand: overlapping, each rotated a few degrees more than the last,
  arcing around a low pivot point. Compose this **entirely with `transform: rotate() translate()`**
  and a shared `transform-origin` near the bottom centre (rule 3). Do not use `margin`, `top`, or
  `left` to fan them.
- **Hover lifts a card out of the fan** (`translateY` + a small `scale` + raised `z-index`) so it is
  clearly pickable.
- **Click a card to open that reel.** The modal path already exists in this file via
  `handleCardClick` at `:132` — reuse it, do not build a second modal.
- Keyboard accessible: each card is a real `<button>`, focus-visible ring, `Enter`/`Space` opens.
  The fan must be reachable by Tab in DOM order even though it is visually arced.
- Mobile: a fan of 9 cards will not fit at 390px. Fall back to a horizontal scroll strip or a 3 × 3
  grid below `sm`. Guard the fan behind a `min-width` media query.
- `src/data/content.ts` already has `WORKS_COPY.conroyHint = "CONROY CAMPAIGN — 1 FILM + 9 CUTS ·
  TAP TO FAN"` — keep using it as the block's caption; it already describes this interaction.
- Remove the `containIntrinsicSize: '260px'` from these cards. Fanned, absolutely-positioned cards
  must not be under `content-visibility: auto` — see item 7 for why that combination breaks layout.
- Add a `prefers-reduced-motion` guard: under reduced motion, render the 9 as a plain grid with no
  fan and no lift.

---

## Item 7 — Gallery: fix the distortion, then reorder (image 13)

**Two independent bugs plus a reorder. The distortion cause is not what it looks like.**

### 7a. The distortion is a stuck `skewY`, not a layout problem

`src/components/sections/Gallery.tsx:126-145`:

```js
const setSkew = gsap.quickTo(gridRef.current, 'skewY', { duration: 0.4, ease: 'power3.out' });
let lastSkew = 0;
ScrollTrigger.create({
  trigger: gridRef.current, start: 'top bottom', end: 'bottom top',
  onUpdate: (self) => {
    const skew = gsap.utils.clamp(-6, 6, rawVel / 600);
    if (Math.abs(skew - lastSkew) > 0.05 || (skew === 0 && lastSkew !== 0)) { lastSkew = skew; setSkew(skew); }
  },
});
```

**Measured live at `scrollY: 5350`, after scrolling had fully stopped**, the grid wrapper
(`div.w-full`, the parent of `div.grid.grid-cols-1.sm:grid-cols-2.lg:grid-cols-3.gap-8.mb-12`) still
carried:

```
transform: skew(0deg, -6deg)
```

**−6° is the clamp limit.** The skew is stuck pegged at its maximum and never relaxes.

**Proof that this is the distortion and not a layout bug** — measured in the same pass:

- Every `.gallery-tile`'s own computed `transform` is `none`.
- Every tile's `offsetTop` is **identical within its row**: `0, 0, 0` for row 1, then
  `405, 405, 405` for row 2. **In layout, the grid is perfectly aligned.**
- Yet `getBoundingClientRect().top` is staggered by exactly **+48px per column**:
  `−114 / −66 / −18`, then `290 / 338 / 386`, then `616 / 664 / 712`, then `1455 / 1503 / 1551`.

`425px` column pitch `× tan(6°) = 44.7px` — that is the +48px step. Across the full 1338px grid the
shear displaces the right edge ~**140px** vertically relative to the left. **The entire tile grid is
permanently sheared 6°, which is why the cards look distorted and the rows look like they collide.**

Why it is stuck: `setSkew` is driven **only** from `ScrollTrigger.onUpdate`, and `onUpdate` stops
firing the instant scrolling stops. The last velocity-derived value is therefore never relaxed back
to 0. The `Math.abs(skew - lastSkew) > 0.05` guard also swallows the final small relax step.

**Fix:** the simplest correct answer is to **delete the velocity skew entirely.** It is a decorative
effect that is producing a permanent visual defect. If it is kept, it must be driven from a ticker
that continues running after scroll stops and explicitly returns to 0 (`gsap.ticker.add` with a
decay, or `ScrollTrigger.addEventListener('scrollEnd', () => setSkew(0))`) — and if you use the
latter, remember rule 11 and remove the listener in cleanup. Deleting it is preferred.

### 7b. Tile heights do not match the reserved intrinsic size

`Gallery.tsx:253-254`:

```jsx
className="gallery-tile flex flex-col gap-3 group"
style={{ contentVisibility: 'auto', containIntrinsicSize: '380px' }}
```

**Measured real tile heights at 425px column width:** `338px` (16:9), `417px` (4:3), and **`852px`**
(9:16 — "House of Hobos"). The reserved `380px` matches **none** of them, and is off by **472px** for
the 9:16 tile. With `content-visibility: auto`, an off-screen tile reserves 380px; when it scrolls in
and resolves to its true height, the grid row jumps and everything below shifts — the "sort of glitch
or bug".

**Fix:** either set `containIntrinsicSize` per tile from the work's real aspect ratio (the `aspect`
field is on every `Work`, and the column width is known), or drop `content-visibility: auto` from
these tiles. **Do not leave a single fixed `380px` for mixed aspect ratios.** Also consider that a
852px tile in a row of 338px tiles is inherently ragged — if you want even rows, constrain the
9:16 tiles' rendered height rather than letting them set the row.

### 7c. Put Rhythm and Long form first

`Gallery.tsx:47-60`:

```js
const getDisciplinePriority = (d: string) => {
  if (d === 'absolute-cinema') return 1;
  if (d === 'motion-graphics') return 2;
  return 3;
};
const displayWorks = [...filteredWorks].sort(...).slice(0, 12);
```

This forces exactly the works that are **already shown higher up the page** to the front of the
gallery. **Measured first six tiles rendered:** `Mumbai`, `Jackie Chan — Cinematic`, `She's Running
Out the Door` (all `absolute-cinema`) then `Conroy — Cinematic Reel`, `Stranger Things`,
`LJ — Velocity / Poster Boy` (`motion-graphics`). Stranger Things and LJ — Velocity / Poster Boy are
in the hero trio; Conroy is the item 6 hero; the `absolute-cinema` works are the item 4 lead film's
section.

**Invert the priority to key off `kicker`, not `discipline`:** sort works whose `kicker` is
`'Rhythm'` or `'Long form'` to the front. From `src/data/portfolio.generated.ts`:

- `Rhythm` = `fast-montage` (7 works) + `nostalgic` (7) + `smooth-movie` (1) = **15 works**
- `Long form` = `podcast` (1) + `vlog` (1) = **2 works**

`kicker` is already a field on every `Work`, and `Gallery.tsx`'s existing `kickerCounts` already keys
on the strings `'Rhythm'` and `'Long form'`, and `GALLERY_COPY.kickerFilters` already exposes both —
so no data change is needed. Keep `.slice(0, 12)`. Keep the `Flip`-animated filter behaviour at
`:62-81` working after the reorder.

---

## Item 8 — Toolkit: band must track the viewport centre, and merge the duplicate grid (images 14, 15)

### 8a. The orange band freezes off-centre

`src/components/sections/Toolkit.tsx:83-94`:

```js
const updateMeasurements = () => {
  const rect = container.getBoundingClientRect();
  containerPageTop = rect.top + (window.scrollY || document.documentElement.scrollTop);
  containerH = rect.height || 960;
  rowH = containerH / total;              // total = SKILLS.length = 15
};
const syncHighlight = (currentScrollY: number) => {
  const viewportCenter = currentScrollY + window.innerHeight / 2;
  const relativeY = viewportCenter - containerPageTop;
  const activeIdx = Math.max(0, Math.min(total - 1, Math.floor(relativeY / rowH)));
  ...
```

**Measured at 1440 × 900, settling at three scroll positions.** `centreLine` is 450px;
`delta` is the band's own centre minus the viewport centre:

| scrollY | row actually at viewport centre | row the band sits on | band centre vs viewport centre |
|---|---|---|---|
| 7900 | 12 | 12 | **−19px** — correct |
| 8200 | none (list scrolled past) | 14 (clamped) | **−191px** |
| 8500 | none | 14 (clamped) | **−491px** |

The list container measures **962px tall** but `#skills` is **2624px** tall. Outside the list's own
962px window, `activeIdx` clamps to `0` or `14` and the band **freezes at the end of the list while
the list keeps scrolling** — so for most of the section the band is nowhere near the middle of the
screen. That is image 14.

**Fix:** the band must stay locked to the vertical middle of the viewport for the whole time the
section is on screen. Track the row nearest the viewport centre and, once the pointer/centre is past
the list's range, either hold the band at the nearest edge row *and* stop the list from continuing to
scroll away from it, or shorten the section so the list's range covers it. Do not `pin` the list
(rule 7 — it is a grid/flex context and pinning it has already caused a defect here). Reading
`window.innerHeight` once per `updateMeasurements` is fine; **do not add any new layout read inside
`syncHighlight`** (rule 4) — it already correctly reads nothing.

**Secondary, and it becomes fatal after 8b:** `rowH = containerH / total` computes
`962 / 15 = 64.13px`, while the real row height is exactly **64px** (`h-[64px]` at `:250`) and the
container's own 1px border sits inside the band's `top: 0` origin. Measured band transform at index
14 was `translate3d(0, 897.867px, 0)` where the real row top is `897px` — only ~0.9px off today, so
this is not the visible bug. **But the uniform-divisor model breaks completely once rows expand on
hover in 8b.** Replace it: measure each row's actual `offsetTop` and `offsetHeight` **once** in
`updateMeasurements`, cache them in an array, and index against that array. Never divide the
container height by the row count again.

### 8b. Merge the row list and the duplicate card grid

`Toolkit.tsx:273-303` is a second full render of all 15 skills:

```jsx
<div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
  {SKILLS.map((skill, index) => ( ... skill.name ... skill.desc ... ))}
```

The row list at `:243-268` already renders `skill.name` **and** `skill.desc` (`:260-262`, truncated
and `hidden md:inline`). The card grid adds nothing but a second copy. **Delete the entire `cardsRef`
grid**, and make the row expand on hover to reveal its full description:

- Row hover expands to show `skill.desc` in full, untruncated.
- **Animate with `transform` and `opacity` only** (rule 3). Do **not** animate `height`. Standard
  approach: a fixed-height row plus an inner detail panel that is `scaleY`/`translateY`-revealed
  inside an `overflow: hidden` wrapper, or a grid-row `1fr` trick — but if the row's real height
  changes, `updateMeasurements` must be re-run so the band stays aligned (see 8a).
- The band must remain aligned with whatever row heights result. This is why 8a's per-row measurement
  cache is required, not optional.
- Keep the existing active-row treatment at `:107-134` (`text-ground`, `font-bold`, the `0.45`
  opacity floor, the `.row-num` / `.row-desc` / `.row-badge` class toggles).
- Keep `isSpecialCard()` at `:193-196` if you still want the richer treatment on colour grading,
  after effects and video rescue — or delete it if the cards it styled are gone. Do not leave it
  unused.
- Keep `removeRefreshListener` (`:140-142`, `:187`) intact — rule 11.
- Add a `prefers-reduced-motion` guard on the expand: under reduced motion, show descriptions
  statically with no animation.
- Delete the now-unused `cardsRef` and the `cards` querySelectorAll + stagger tween at `:29`,
  `:53-70`. Leaving a `gsap.fromTo` pointed at zero elements is a silent no-op that hides bugs.

---

## Item 9 — "What I deliver": fancier title, fix the card collision (image 16)

### 9a. The collision is a per-index offset against a per-row gap

`src/components/sections/Services.tsx:43-55`:

```js
cardRefs.current.forEach((card, idx) => {
  if (!card) return;
  gsap.to(card, {
    y: -idx * 12, ease: 'none',
    scrollTrigger: { trigger: card, start: 'top bottom', end: 'top 30%', scrub: true },
  });
});
```

**Measured at `scrollY: 10150`**, 6 cards in `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`,
computed `rowGap: 32px`:

| card | row | height | translate (measured) | translate (at scrub end) |
|---|---|---|---|---|
| 0 | 1 | 312 | `0` | `0` |
| 1 | 1 | 312 | `-12px` | `-12` |
| 2 | 1 | 312 | `-24px` | `-24` |
| 3 | 2 | 287 | `-27.31px` | `-36` |
| 4 | 2 | 287 | `-36.42px` | `-48` |
| 5 | 2 | 287 | `-45.52px` | `-60` |

Row 1 wrapper bottom is **346**; row 2 wrapper top is **378** (the 32px gap). At scrub completion
card 3's top is `378 − 36 = 342` against card 0's bottom of `346` → **4px of overlap**. Card 5's top
is `378 − 60 = 318` against card 2's bottom of `322` → **4px of overlap**. Add the
`hover:-translate-y-2` (8px) and it is **12px**, and the `shadow-[0_20px_40px_-10px_rgba(246,124,41,0.15)]`
spreads another 40px of blur up into the row above. That is the collision in image 16.

The general failure is that the offset budget is indexed by **flat card index** while the gap it has
to fit inside is **per row**: `overlap = 12 × columns − rowGap`. At 3 columns that is
`36 − 32 = 4px`. It only stays non-negative at 1 and 2 columns by luck.

**Fix:** delete the `y: -idx * 12` scrub. The "subtle stacking feel" is already provided by the
`Reveal variant="up" delay={0.05 * index}` stagger at `:88`. Then increase the vertical rhythm —
`gap-8` → `gap-y-12` or larger — so the hover lift and the shadow have room. If you insist on
keeping an offset, index it **within the row** (`idx % columns`) and cap the total at strictly less
than the row gap, and recompute it per breakpoint. Deleting it is preferred.

While in this file, apply rule 8 to `:93`: replace `transition-all duration-300` with
`transition-[transform,border-color,box-shadow] duration-300`.

### 9b. Fancier title

`Services.tsx:74-76`:

```jsx
<h2 className="font-display font-black text-huge text-cream uppercase tracking-tight font-variation-wonk">
  <SplitText text={SERVICES_COPY.title} by="char" />
</h2>
```

`SERVICES_COPY.title` is `"What I deliver"` in `src/data/content.ts`. **This string is safe to
change** — it is not in `tests/content.lock.json` and not in `verify-content.mjs`'s verbatim list.
Confirm with `npm run verify-content` afterwards regardless.

Make it a **cursive + bold combination**, matching the pattern already used in the Contact headline:
part of the phrase in `font-script` (Ephesis) at accent size, part in `font-display font-black`
uppercase. To do that you must split the copy into separate spans, which means splitting the constant
— e.g. `titleLead` / `titleScript` / `titleTail` in `SERVICES_COPY` — rather than passing one string
to `SplitText`.

**Cursive caveat, same as item 2:** Ephesis's inline box is far taller than its glyphs. Use the
working pattern from `src/components/sections/Contact.tsx`: `inline-block`, reduced `em` size, tight
`leading`, negative block margins. Without it the `h2` line box will blow open and push the grid
down.

`SplitText` currently receives the whole title. If you keep per-character animation, apply it to the
bold spans only — character-splitting a cursive script face breaks the letter joins.

---

## Item 10 — Contact: enlarge "something" and fix its stacking (image 17)

**Pure styling and z-order. Do not change any Contact copy** — `verify-content` requires
`"Let's cut "` and `"WATCHING"` byte-identical in `content.ts`.

`src/components/sections/Contact.tsx`, the script span inside the headline `h2`:

```jsx
<span className="inline-block font-script text-terracotta lowercase text-[0.95em] font-normal leading-[0.72] -my-[0.18em] mx-2">
  {CONTACT_COPY.headlineScript}
</span>
```

composed as `headlinePrefix` ("Let's cut ") → script span ("something") → `headlineMiddle` (" worth ")
→ `<span className="block text-cream">{headlineMega}</span>` ("WATCHING"), inside:

```jsx
<h2 ref={headlineRef} className="font-display font-black text-huge sm:text-mega ... leading-[0.9] tracking-tight mb-8 font-variation-wonk">
```

**Measured at 1440 × 900:**

| element | box | position |
|---|---|---|
| `h2` | 637 × 949 | left 48, top 259, right 685 |
| script span "something" | 469 × 126 | left 56, top 614 |
| form card | 637 × 487 | left **749**, top 259 |

- `h2` font-size **184px**; the script span computes to **174.8px** (`0.95em`).
- Column gap is 64px; the `h2` ends at x=685 and the card starts at x=749 — **no overlap at all
  today**.
- **Stacking, measured:** the `h2`'s column (`div.lg:col-span-6`) and the card's column are **both
  `position: static; z-index: auto`**, and the card's column comes **after** the `h2`'s column in DOM
  order. So the card paints on top. That is "the text 'Something' is behind the form card".

Required:

1. **Make "something" much bigger** — big enough to overlap "Let's cut" above it and to extend
   horizontally past the form card's left edge. To cross x=749 from left 56 the span must exceed
   **693px** wide; at the current 469px for `0.95em`, roughly **`1.8em`** (≈331px font size,
   ≈890px wide) puts about **200px** of the word over the card. Tune it, but verify the measured
   overlap is real and not zero.
2. **Overlap "Let's cut"** — pull the script span up over the prefix line with negative block margins
   (extend the existing `-my-[0.18em]`), not with `position: absolute`, so it stays in the text flow
   and reflows on mobile.
3. **Behind "WATCHING"** — give the `headlineMega` span an explicit `position: relative` and a
   **higher** `z-index` than the script span, so "WATCHING" paints over it.
4. **In front of the form card** — give the `h2`'s column `position: relative` and a higher
   `z-index` than the card's column. Setting `z-index` alone will not work: both are currently
   `static`, and `z-index` has no effect without a positioned (or flex/grid item with explicit
   `z-index`) element.
5. **`pointer-events: none` on the script span.** Once it overlaps the form card, it will otherwise
   swallow clicks on the Name field. Verify after the change that all three form inputs and the
   submit button are still clickable and focusable by Tab.
6. Mobile: at 390px a `1.8em` script word will overflow. Scale it down below `lg` and confirm the
   root's `overflow-x: clip` is not being relied on to hide a real overflow — check
   `document.documentElement.scrollWidth === clientWidth` at 390px.

---

## Final verification checklist

Run all of these and report the results.

```bash
npm run build
```

```bash
npm run verify-content
```

Then in a browser at **1440 × 900**, **1280 × 800** and **390 × 844**:

1. **Item 1** — hard-reload with `sessionStorage` cleared. The wordmark is opaque. Scrolling opens
   the curtain **progressively** (partial scroll = partial open). The page behind is invisible until
   ≥ 80% open. `getComputedStyle` on the global grid layer shows an effective line alpha in the
   0.05–0.07 range and the grid is visibly moving. `html.grid-off` still hides it.
2. **Item 2** — `h1.getBoundingClientRect().bottom < roleEl.getBoundingClientRect().top` at all three
   viewports. The left hero column reaches within ~100px of the portrait column's height at 1440px.
3. **Item 3** — all three hero iframes report `getComputedStyle(iframe).opacity === '1'` within 2s of
   load. Render order left→right is Poster Boy, LJ — Masked Edit, Stranger Things. The middle frame is
   measurably the widest. All three are wider than 400px at 1440px.
4. **Item 4** — the lead film's measured width is ≥ 1280px at a 1440px viewport.
5. **Item 5** — no element on the page contains the text "VIEW ALL". The rail track has a running
   `marquee` animation with a cycle ≥ 60s. Clicking a rail tile opens nothing. Hovering a tile
   produces a visible transform change.
6. **Item 6** — no `-z-10` poster or background iframe remains in the Conroy block. The Conroy hero
   iframe is playing. Exactly 9 fan cards exist, each showing a distinct Conroy cut's poster. Hover
   lifts one; click opens the modal; Tab reaches all 9.
7. **Item 7** — after scrolling stops, the grid wrapper's computed `transform` is `none`. Every tile's
   `getBoundingClientRect().top` is **equal within its row** (this is the direct regression test for
   the shear). The first tiles rendered have `kicker` `'Rhythm'` or `'Long form'`. Filter clicks still
   animate.
8. **Item 8** — the band's centre stays within **±40px** of `window.innerHeight / 2` at
   `scrollY` 7900, 8200 **and** 8500 (it was −19px, −191px and −491px before). No duplicate skills
   grid exists — `document.querySelectorAll('.skill-card').length === 0`. Hovering a row reveals its
   full description and the band stays aligned.
9. **Item 9** — at every scroll position, no Services card's bottom edge is below the next row's
   card top edge, including while hovering. The title renders mixed cursive + bold and the `h2`'s
   height has not blown open.
10. **Item 10** — the script span's measured width exceeds 693px at 1440px and its right edge is
    past the form card's left edge (749). "WATCHING" paints over it. The form card does **not** paint
    over it. All three form fields accept clicks and Tab focus. `documentElement.scrollWidth ===
    clientWidth` at 390px.
