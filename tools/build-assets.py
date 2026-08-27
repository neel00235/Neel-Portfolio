"""
Asset builder for the Neel Patel portfolio.

Pulls poster still + duration for every Vimeo work via Vimeo oEmbed,
writes updated stills to assets/thumbs/<id>.webp, extracts dominant palette tone,
and emits assets/manifest.json.

Run:  python build-assets.py
"""
import colorsys
import io
import json
import os
import ssl
import time
import urllib.parse
import urllib.request

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "assets")
THUMBS = os.path.join(ASSETS, "thumbs")
MANIFEST = os.path.join(ASSETS, "manifest.json")

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
CTX = ssl.create_default_context()

# 16 sections arranged with high-energy cinematic, concert, and masking edits first:
SECTIONS = [
    ("absolute-cinema", "Absolute Cinema", "#CCBA8E", [
        ("1220554546", "16:9"), ("1220555808", "4:3"),
        ("1220555284", "16:9"), ("1220556151", "16:9"),
    ]),
    ("concert-edits", "Concert Edits", "#E0407A", [
        ("1219763361", "16:9"),
    ]),
    ("masking", "Masking & Compositing", "#F27DB5", [
        ("1219757810", "4:3"),
    ]),
    ("motion-graphics", "Motion Graphics", "#66FFDE", [
        ("1219763331", "16:9"), ("1219763230", "16:9"), ("1219758725", "9:16"),
    ]),
    ("fast-montage", "Fast-Paced Montage", "#FE3448", [
        ("1220413186", "16:9"), ("1220553507", "16:9"), ("1220548695", "16:9"),
        ("1220554808", "16:9"), ("1220559375", "16:9"), ("1220557252", "16:9"),
        ("1220559007", "16:9"),
    ]),
    ("brand-films", "Brand Films", "#E8B04B", [
        ("1220556151", "16:9"), ("1220552857", "9:16"), ("1220550982", "9:16"),
        ("1220550831", "9:16"), ("1220550347", "9:16"), ("1220549555", "9:16"),
        ("1220549430", "9:16"), ("1220549151", "9:16"), ("1220548698", "9:16"),
        ("1220548696", "9:16"),
    ]),
    ("event-edits", "Event Edits", "#FF6F64", [
        ("1219767934", "16:9"), ("1219766019", "16:9"), ("1219758002", "16:9"),
        ("1220556772", "9:16"), ("1220556182", "9:16"), ("1220556261", "9:16"),
    ]),
    ("event-gfx", "Event GFX Animation", "#7AB9E0", [
        ("1219757999", "16:9"),
    ]),
    ("3d-visualization", "3D Visualization", "#A78BFA", [
        ("1219760653", "9:16"),
    ]),
    ("smooth-movie", "Smooth Movie Edits", "#9BB8A8", [
        ("1220413187", "4:3"),
    ]),
    ("podcast", "Podcast Edits", "#F0A868", [
        ("1219766024", "16:9"),
    ]),
    ("vlog", "Vlog Montage", "#6FD08C", [
        ("1219777661", "16:9"),
    ]),
    ("nostalgic", "Nostalgic Edits", "#C08457", [
        ("1220553072", "16:9"), ("1219776317", "16:9"), ("1220552662", "16:9"),
        ("1220557262", "16:9"), ("1220553768", "16:9"), ("1220548697", "16:9"),
        ("1219766021", "16:9"),
    ]),
    ("anime-grade", "Anime Colour Grading", "#3D6681", [
        ("1219779416", "16:9"), ("1219778853", "16:9"), ("1219779517", "16:9"),
    ]),
    ("anime-fast", "Fast-Paced Anime", "#FF9E3D", [
        ("1220745541", "16:9"), ("1220411975", "16:9"),
        ("1220411973", "16:9"), ("1220411974", "16:9"),
    ]),
    ("personal", "Personal Edits", "#B9966E", [
        ("1219758000", "3:4"), ("1220554545", "3:4"),
    ]),
]


def fetch(url, tries=3):
    last = None
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
                return r.read()
        except Exception as exc:
            last = exc
            time.sleep(0.8 * (attempt + 1))
    raise RuntimeError(f"failed {url}: {last}")


def oembed(vid):
    q = urllib.parse.urlencode({
        "url": f"https://vimeo.com/{vid}",
        "width": 1280,
    })
    return json.loads(fetch(f"https://vimeo.com/api/oembed.json?{q}"))


def upscale_thumb_url(url):
    base, _, query = url.partition("?")
    if "-d_" in base:
        base = base.rsplit("-d_", 1)[0] + "-d_1280"
    return base + ("?" + query if query else "")


def extract_dominant_tone(img):
    small = img.resize((64, 64), Image.Resampling.BILINEAR)
    quantized = small.quantize(colors=5, method=Image.Quantize.MEDIANCUT)
    palette = quantized.getpalette()[:15]
    colors = []
    for i in range(5):
        r, g, b = palette[i*3 : i*3 + 3]
        colors.append((r, g, b))

    counts = quantized.getcolors() or []
    counts.sort(key=lambda x: x[0], reverse=True)

    for count, idx in counts:
        if idx < len(colors):
            r, g, b = colors[idx]
            h, l, s = colorsys.rgb_to_hls(r/255.0, g/255.0, b/255.0)
            if s >= 0.12 and 0.08 <= l <= 0.85:
                return f"#{r:02x}{g:02x}{b:02x}"

    if counts and counts[0][1] < len(colors):
        r, g, b = colors[counts[0][1]]
        return f"#{r:02x}{g:02x}{b:02x}"
    return "#d6a76c"


def build_collage_portrait():
    src = os.path.join(ASSETS, "neel.webp")
    if not os.path.exists(src):
        src = os.path.join(ASSETS, "neel.jpg")
    if not os.path.exists(src):
        return

    # Keep original 100% rich, vibrant natural color & contrast — not faded!
    im = Image.open(src).convert("RGB")
    out_p = os.path.join(ASSETS, "neel-collage.webp")
    im.save(out_p, "WEBP", quality=92, method=6)
    print(f"Generated vibrant portrait {out_p} ({im.width}x{im.height})")


def main():
    os.makedirs(THUMBS, exist_ok=True)
    seen = {}
    out_sections = []

    print("Building manifest...")
    for slug, title, accent, works in SECTIONS:
        items = []
        for vid, aspect in works:
            if vid in seen:
                meta = seen[vid]
            else:
                path = os.path.join(THUMBS, f"{vid}.webp")
                if os.path.exists(path):
                    im = Image.open(path).convert("RGB")
                    title_val = vid
                    dur_val = 0
                    try:
                        # read existing manifest if available to keep titles
                        if os.path.exists(MANIFEST):
                            with open(MANIFEST, "r", encoding="utf-8") as mf:
                                old_m = json.load(mf)
                                for os_sec in old_m.get("sections", []):
                                    for ow in os_sec.get("works", []):
                                        if ow.get("id") == vid and "title" in ow:
                                            title_val = ow["title"]
                                            dur_val = ow.get("duration", 0)
                                            break
                    except Exception:
                        pass
                else:
                    info = oembed(vid)
                    thumb_url = upscale_thumb_url(info.get("thumbnail_url", ""))
                    raw = fetch(thumb_url)
                    im = Image.open(io.BytesIO(raw)).convert("RGB")
                    im.save(path, "WEBP", quality=85, method=6)
                    title_val = info.get("title", vid)
                    dur_val = info.get("duration", 0)

                tone = extract_dominant_tone(im)
                meta = {
                    "id": vid,
                    "title": title_val,
                    "duration": dur_val,
                    "thumbW": im.width,
                    "thumbH": im.height,
                    "tone": tone,
                }
                seen[vid] = meta
            items.append(dict(meta, aspect=aspect))
        out_sections.append({
            "slug": slug, "title": title, "accent": accent, "works": items,
        })

    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump({"sections": out_sections}, f, indent=1, ensure_ascii=False)

    build_collage_portrait()

    total = sum(len(s["works"]) for s in out_sections)
    print(f"\n{len(out_sections)} sections / {total} placements / {len(seen)} unique videos")


if __name__ == "__main__":
    main()
