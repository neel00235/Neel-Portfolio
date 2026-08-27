"""
Generates src/data/portfolio.generated.ts, src/data/slugs.ts, tests/content.lock.json,
and js/data.js from manifest.json plus the immutable editorial copy below.

Re-run whenever you add or reorder work:
    python tools/build-data.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# Human-facing titles for each Vimeo upload (upload slug -> display title).
TITLES = {
    "1220556151": "Conroy — Cinematic Reel",
    "1220552857": "Conroy — Reel 01",
    "1220550982": "Conroy — Reel 02",
    "1220550831": "Conroy — Reel 03",
    "1220550347": "Conroy — Reel 04",
    "1220549555": "Conroy — Reel 05",
    "1220549430": "Conroy — Reel 06",
    "1220549151": "Conroy — Reel 07",
    "1220548698": "Conroy — Reel 08",
    "1220548696": "Conroy — Reel 09",
    "1219767934": "Halaji Tara Hath Vakhanu — Rushabh Ahir Live",
    "1219766019": "Nirma Activity Reel",
    "1219758002": "Hackathon — The Full Film",
    "1220556772": "Rushabh Ahir — Vertical Cut",
    "1220556182": "Pyaar Kya Hai",
    "1220556261": "Tech Café",
    "1219763361": "Ankit Tiwari — Live at Nirma",
    "1220555808": "Jackie Chan — Cinematic",
    "1220554546": "Mumbai",
    "1220555284": "She's Running Out the Door",
    "1219763331": "Stranger Things",
    "1219763230": "LJ — Velocity / Poster Boy",
    "1219758725": "House of Hobos",
    "1219757999": "Hackathon — Title Sequence",
    "1219757810": "LJ — Masked Edit",
    "1219760653": "Card — 3D Visual",
    "1220413186": "Rock Your Body",
    "1220553507": "Ruthless — LJ",
    "1220548695": "Riverfront Montage",
    "1220554808": "Ahmedabad BRTS",
    "1220559375": "Abhivyakti",
    "1220557252": "Radiohead",
    "1220559007": "Auditorium Jamming",
    "1220413187": "Enola Holmes",
    "1219766024": "Bioscope — Dev's Podcast",
    "1219777661": "Vlog Montage",
    "1220553072": "Riverfront Storyline",
    "1219776317": "Love Me Not",
    "1220552662": "Uttarayan",
    "1220557262": "Typography Study",
    "1220553768": "Mumbai Montage",
    "1220548697": "Chalo Chale",
    "1219766021": "City on Fire",
    "1219779416": "Tengen — Edgy",
    "1219778853": "Tengen — Shake",
    "1219779517": "Douma",
    "1220745541": "Giyu — Edgy Rotation",
    "1220411975": "Naruto",
    "1220411973": "Havana GFX",
    "1220411974": "Demon Slayer",
    "1219758000": "Drunk & Nasty",
    "1220554545": "Concert — Personal Cut",
}

# Frozen slugs per Table VI.4 of the Master Blueprint
FROZEN_SLUGS = {
    "1220554546": "mumbai",
    "1220555808": "jackie-chan-cinematic",
    "1220555284": "shes-running-out-the-door",
    "1220556151": "conroy-cinematic-reel",
    "1219763361": "ankit-tiwari-live-at-nirma",
    "1219757810": "lj-masked-edit",
    "1219763331": "stranger-things",
    "1219763230": "lj-velocity-poster-boy",
    "1219758725": "house-of-hobos",
    "1220413186": "rock-your-body",
    "1220553507": "ruthless-lj",
    "1220548695": "riverfront-montage",
    "1220554808": "ahmedabad-brts",
    "1220559375": "abhivyakti",
    "1220557252": "radiohead",
    "1220559007": "auditorium-jamming",
    "1220552857": "conroy-reel-01",
    "1220550982": "conroy-reel-02",
    "1220550831": "conroy-reel-03",
    "1220550347": "conroy-reel-04",
    "1220549555": "conroy-reel-05",
    "1220549430": "conroy-reel-06",
    "1220549151": "conroy-reel-07",
    "1220548698": "conroy-reel-08",
    "1220548696": "conroy-reel-09",
    "1219767934": "halaji-tara-hath-vakhanu-rushabh-ahir-live",
    "1219766019": "nirma-activity-reel",
    "1219758002": "hackathon-the-full-film",
    "1220556772": "rushabh-ahir-vertical-cut",
    "1220556182": "pyaar-kya-hai",
    "1220556261": "tech-cafe",
    "1219757999": "hackathon-title-sequence",
    "1219760653": "card-3d-visual",
    "1220413187": "enola-holmes",
    "1219766024": "bioscope-devs-podcast",
    "1219777661": "vlog-montage",
    "1220553072": "riverfront-storyline",
    "1219776317": "love-me-not",
    "1220552662": "uttarayan",
    "1220557262": "typography-study",
    "1220553768": "mumbai-montage",
    "1220548697": "chalo-chale",
    "1219766021": "city-on-fire",
    "1219779416": "tengen-edgy",
    "1219778853": "tengen-shake",
    "1219779517": "douma",
    "1220745541": "giyu-edgy-rotation",
    "1220411975": "naruto",
    "1220411973": "havana-gfx",
    "1220411974": "demon-slayer",
    "1219758000": "drunk-and-nasty",
    "1220554545": "concert-personal-cut",
}

# Per-section editorial copy. `kicker` sits above the title, `blurb` below it.
SECTION_COPY = {
    "brand-films": (
        "Client work",
        "A full campaign for Conroy — one cinematic hero film cut for the brand's "
        "landing page, then nine vertical reels carved out of the same shoot for "
        "Instagram and YouTube Shorts. One grade, one rhythm, ten deliverables.",
    ),
    "event-edits": (
        "Client work",
        "Live folk concerts, campus activations and hackathons. Multi-cam coverage "
        "cut to the energy of the room, delivered in both horizontal recap and "
        "vertical reel formats so the client can post everywhere from one shoot.",
    ),
    "concert-edits": (
        "Client work",
        "Ankit Tiwari live at Nirma. Stage lighting is the hardest grade there is — "
        "blown highlights, coloured wash, no second take. Cut to the performance, "
        "graded to keep skin tones intact under moving colour.",
    ),
    "absolute-cinema": (
        "Craft",
        "Pure colour and composition. Film-grade looks built from scratch — highlight "
        "roll-off, split-toned shadows, restrained contrast — on footage that has to "
        "carry a mood before a single word is spoken.",
    ),
    "motion-graphics": (
        "Craft",
        "After Effects motion work: velocity-driven type, kinetic layout and title "
        "systems that move with the cut rather than sitting on top of it. Horizontal "
        "and vertical builds.",
    ),
    "event-gfx": (
        "Craft",
        "Broadcast-style graphics package for a hackathon — animated title sequence, "
        "lower thirds and stingers built to hold up on a projector and on a phone.",
    ),
    "masking": (
        "Craft",
        "Frame-by-frame masking and compositing: subjects lifted from their plates, "
        "type threaded behind moving bodies, elements placed inside the scene so the "
        "graphic reads as part of the shot.",
    ),
    "3d-visualization": (
        "Craft",
        "Product visualisation built in 3D — a card rendered, lit and animated for a "
        "vertical spot, then graded to match the rest of the brand's footage.",
    ),
    "fast-montage": (
        "Rhythm",
        "Seven montages cut to the beat. Frame-accurate sync, speed-ramped transitions "
        "and a build that keeps escalating — the format that holds a scrolling viewer "
        "past the three-second mark.",
    ),
    "smooth-movie": (
        "Rhythm",
        "The opposite discipline. Long, unhurried cuts that let a performance breathe, "
        "with transitions you feel rather than notice.",
    ),
    "podcast": (
        "Long form",
        "Multi-cam podcast editing — clean speaker cuts, dead-air tightening, dialogue "
        "levelling and a consistent grade across cameras that never quite match.",
    ),
    "vlog": (
        "Long form",
        "Travel and lifestyle montage cut for retention: strong cold open, momentum "
        "through the middle, a landing that earns the last frame.",
    ),
    "nostalgic": (
        "Rhythm",
        "Seven quieter edits built on warmth and restraint — grain, gentle halation, "
        "typography used as punctuation. Made to feel remembered rather than watched.",
    ),
    "anime-grade": (
        "Study",
        "Grading animation is a different problem to grading footage — flat cel colour, "
        "hard line art, no film response to lean on. These rebuild depth and atmosphere "
        "into already-finished frames.",
    ),
    "anime-fast": (
        "Study",
        "High-intensity anime edits: rotation and shake rigs, impact frames, transitions "
        "timed to the frame. Technical exercises in how hard a cut can hit.",
    ),
    "personal": (
        "Study",
        "Edits made for no client and no brief — where the transitions and grades that "
        "later end up in commercial work get tried out first.",
    ),
}

SKILLS = [
    ("Colour Grading",
     "The reason most edits either feel cinematic or feel flat. Primary balance, "
     "secondary isolation, split-toned shadows and highlight roll-off — building a "
     "look that carries the mood of the story instead of sitting on a LUT."),
    ("After Effects — VFX & Compositing",
     "Where the hard problems get solved. Multi-layer compositing, clean-up, screen "
     "replacement, light wrap and integration work that makes added elements read as "
     "though they were shot in camera."),
    ("Video Rescue",
     "Underexposed, noisy, wrongly white-balanced, shot on the wrong settings — I can "
     "take footage a client has written off and pull a usable, good-looking cut out of "
     "it. Denoise, recover, regrade, stabilise, resharpen."),
    ("Masking & Rotoscoping",
     "Frame-by-frame subject isolation. Type that passes behind a moving person, "
     "objects removed from a plate, selective grades that follow a face through a shot."),
    ("Motion Tracking",
     "2D and camera tracking to pin graphics, text and replacements into moving footage "
     "so they hold their place through handheld, whip pans and speed ramps."),
    ("Logo & Brand Animation",
     "Identity in motion — logo builds, stingers and end cards with easing and weight "
     "that match how the brand is supposed to feel."),
    ("Kinetic Typography",
     "Type treated as a performer. Layout, timing and velocity worked so the words land "
     "on the beat and carry meaning rather than just filling frame."),
    ("Cinematography",
     "Full working knowledge of the camera — exposure triangle, shutter angle, picture "
     "profiles, log capture, lens choice and movement. I can shoot the footage I'd want "
     "to be handed as an editor."),
    ("Lighting",
     "Shaping with key, fill and separation, colour temperature control and practical "
     "sources — so the grade starts from something worth grading."),
    ("Premiere Pro",
     "The assembly room. Multi-cam sync, proxy workflows, nested sequence structures and "
     "delivery-ready exports for every platform spec."),
    ("CapCut Advance",
     "Pushed well past template territory. Used deliberately for speed on short-form "
     "turnarounds where a same-day deliverable matters more than a round trip."),
    ("Live Stream Banner Animation",
     "Looping overlays, animated lower thirds, scoreboards and transition stingers built "
     "to run live without dropping frames."),
    ("Sound Engineering",
     "Dialogue cleanup, levelling and de-noising, music bedding, ducking and sound design "
     "hits. Half of how 'cinematic' an edit feels is what you're hearing."),
    ("Creative Direction",
     "Turning a loose brief into a treatment — reference, structure, pacing and look "
     "decided before the timeline opens."),
    ("Content Creation",
     "Understanding the platform as well as the craft: hooks, retention curves, aspect "
     "ratios and what actually makes someone stop scrolling."),
]

SERVICES = [
    ("Cinematic Colour Grading",
     "Mood-driven grading that gives footage a premium, film-like look. Shot matching "
     "across cameras, skin tones protected, a bespoke look built per project — not a "
     "preset dropped on a timeline."),
    ("Motion Graphics & Typography",
     "Text animation, title systems and animated graphics that make content stand out "
     "and hold a viewer's eye exactly where you need it."),
    ("Reels & Short-Form",
     "Fast-paced, trend-driven vertical edits built for reach — engineered around the "
     "hook, the beat and the loop."),
    ("Long-Form & After-Movies",
     "YouTube episodes, event after-movies and documentary-style cuts structured for "
     "retention from cold open to end card."),
    ("High-Impact Action Edits",
     "Heavy-editing builds — speed ramps, impact frames, camera shake rigs, compositing "
     "and effects work for edits that need to hit hard."),
    ("Trending Effects & Transitions",
     "Viral editing styles and transitions applied with judgement, to lift engagement "
     "without making the work look disposable."),
]


def main():
    manifest_candidates = [
        os.path.join(ROOT, "src", "data", "manifest.json"),
        os.path.join(ROOT, "assets", "manifest.json"),
    ]
    manifest_path = next(p for p in manifest_candidates if os.path.exists(p))
    manifest = json.load(open(manifest_path, encoding="utf-8"))

    sections = []
    for s in manifest["sections"]:
        kicker, blurb = SECTION_COPY[s["slug"]]
        sections.append({
            "slug": s["slug"],
            "title": s["title"],
            "kicker": kicker,
            "blurb": blurb,
            "accent": s["accent"],
            "works": [{
                "id": w["id"],
                "title": TITLES.get(w["id"], w["title"]),
                "slug": FROZEN_SLUGS.get(w["id"], w["id"]),
                "aspect": w["aspect"],
                "duration": w["duration"],
                "w": w["thumbW"],
                "h": w["thumbH"],
                "tone": w.get("tone", s["accent"]),
                "discipline": s["slug"],
                "kicker": kicker,
            } for w in s["works"]],
        })

    unique_ids = []
    seen = set()
    unique_works = []
    all_works = []
    for s in sections:
        for w in s["works"]:
            all_works.append(w)
            if w["id"] not in seen:
                seen.add(w["id"])
                unique_ids.append(w["id"])
                unique_works.append(w)

    skills_list = [{"name": n, "desc": d} for n, d in SKILLS]
    services_list = [{"name": n, "desc": d} for n, d in SERVICES]
    stats_data = {"edits": len(unique_works), "categories": len(sections)}

    # 1. Output src/data/portfolio.generated.ts
    ts_content = f"""/* Auto-generated by tools/build-data.py — edit the copy there, then re-run, not here.
   {len(sections)} sections, {len(all_works)} placements, {len(unique_works)} unique Vimeo uploads.
*/

export interface Work {{
  id: string;
  title: string;
  slug: string;
  aspect: string;
  duration: number;
  w: number;
  h: number;
  tone: string;
  discipline: string;
  kicker: string;
}}

export interface Section {{
  slug: string;
  title: string;
  kicker: string;
  blurb: string;
  accent: string;
  works: Work[];
}}

export interface Skill {{
  name: string;
  desc: string;
}}

export interface Service {{
  name: string;
  desc: string;
}}

export interface PortfolioStats {{
  edits: number;
  categories: number;
}}

export const SECTIONS: Section[] = {json.dumps(sections, indent=2, ensure_ascii=False)};

export const SKILLS: Skill[] = {json.dumps(skills_list, indent=2, ensure_ascii=False)};

export const SERVICES: Service[] = {json.dumps(services_list, indent=2, ensure_ascii=False)};

export const STATS: PortfolioStats = {json.dumps(stats_data, indent=2, ensure_ascii=False)};

export const UNIQUE_WORKS: Work[] = {json.dumps(unique_works, indent=2, ensure_ascii=False)};

export const ALL_WORKS: Work[] = {json.dumps(all_works, indent=2, ensure_ascii=False)};

export const WORKS_BY_SLUG: Record<string, Work> = Object.fromEntries(
  UNIQUE_WORKS.map(w => [w.slug, w])
);

export const WORKS_BY_ID: Record<string, Work> = Object.fromEntries(
  UNIQUE_WORKS.map(w => [w.id, w])
);
"""
    ts_out = os.path.join(ROOT, "src", "data", "portfolio.generated.ts")
    with open(ts_out, "w", encoding="utf-8") as f:
        f.write(ts_content)
    print(f"wrote {ts_out}")

    # 2. Output src/data/slugs.ts
    slugs_ts = f"""/* Auto-generated frozen slugs mapping from tools/build-data.py per Master Blueprint Table VI.4 */
export const FROZEN_SLUGS: Record<string, string> = {json.dumps(FROZEN_SLUGS, indent=2, ensure_ascii=False)};

export const ID_BY_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(FROZEN_SLUGS).map(([id, slug]) => [slug, id])
);
"""
    slugs_out = os.path.join(ROOT, "src", "data", "slugs.ts")
    with open(slugs_out, "w", encoding="utf-8") as f:
        f.write(slugs_ts)
    print(f"wrote {slugs_out}")

    # 3. Output tests/content.lock.json (Immutable Content Fixture)
    lock_data = {
        "uniqueCount": len(unique_works),
        "placementCount": len(all_works),
        "sectionCount": len(sections),
        "skillCount": len(skills_list),
        "serviceCount": len(services_list),
        "uniqueIds": [w["id"] for w in unique_works],
        "slugs": [w["slug"] for w in unique_works],
        "titles": {w["id"]: w["title"] for w in unique_works},
        "sections": [{
            "slug": s["slug"],
            "title": s["title"],
            "kicker": s["kicker"],
            "blurb": s["blurb"],
            "accent": s["accent"],
            "workCount": len(s["works"])
        } for s in sections],
        "skills": skills_list,
        "services": services_list,
        "stats": stats_data
    }
    lock_out = os.path.join(ROOT, "tests", "content.lock.json")
    with open(lock_out, "w", encoding="utf-8") as f:
        json.dump(lock_data, f, indent=2, ensure_ascii=False)
    print(f"wrote {lock_out}")

    # 4. Output legacy js/data.js for backward-compatibility
    js = f"""/* Auto-generated by build-data.py — edit the copy there, then re-run, not here.
   {len(sections)} sections, {len(all_works)} placements,
   {len(unique_works)} unique Vimeo uploads.

   Exposed as a plain global (not an ES module) so index.html also works when
   opened straight off the filesystem, without a local server. */

window.DATA = {{

SECTIONS: {json.dumps(sections, indent=2, ensure_ascii=False)},

SKILLS: {json.dumps(skills_list, indent=2, ensure_ascii=False)},

SERVICES: {json.dumps(services_list, indent=2, ensure_ascii=False)},

STATS: {json.dumps(stats_data, indent=2, ensure_ascii=False)}

}};
"""
    js_out = os.path.join(ROOT, "js", "data.js")
    os.makedirs(os.path.dirname(js_out), exist_ok=True)
    with open(js_out, "w", encoding="utf-8") as f:
        f.write(js)
    print(f"wrote {js_out} — {len(sections)} sections, {len(unique_works)} unique videos")


if __name__ == "__main__":
    main()
