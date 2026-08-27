"""
Generates js/data.js from assets/manifest.json plus the editorial copy below.

Re-run after build-assets.py if you add or reorder work:
    python build-data.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

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
    ("CapCut — Advanced",
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
    manifest = json.load(open(os.path.join(HERE, "assets", "manifest.json"), encoding="utf-8"))

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
                "aspect": w["aspect"],
                "duration": w["duration"],
                "w": w["thumbW"],
                "h": w["thumbH"],
                "tone": w.get("tone", s["accent"]),
            } for w in s["works"]],
        })

    unique = {w["id"] for s in sections for w in s["works"]}
    js = f"""/* Auto-generated by build-data.py — edit the copy there, then re-run, not here.
   {len(sections)} sections, {sum(len(s['works']) for s in sections)} placements,
   {len(unique)} unique Vimeo uploads.

   Exposed as a plain global (not an ES module) so index.html also works when
   opened straight off the filesystem, without a local server. */

window.DATA = {{

SECTIONS: {json.dumps(sections, indent=2, ensure_ascii=False)},

SKILLS: {json.dumps([{"name": n, "desc": d} for n, d in SKILLS], indent=2, ensure_ascii=False)},

SERVICES: {json.dumps([{"name": n, "desc": d} for n, d in SERVICES], indent=2, ensure_ascii=False)},

STATS: {{ edits: {len(unique)}, categories: {len(sections)} }}

}};
"""
    out = os.path.join(HERE, "js", "data.js")
    with open(out, "w", encoding="utf-8") as f:
        f.write(js)
    print(f"wrote {out} — {len(sections)} sections, {len(unique)} videos")


if __name__ == "__main__":
    main()
