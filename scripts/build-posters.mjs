import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.dirname(__dirname);

const THUMBS_DIR = path.join(ROOT, 'public', 'posters');
const OG_DIR = path.join(ROOT, 'public', 'og');
const PREVIEWS_DIR = path.join(ROOT, 'public', 'previews');
const LOCK_FILE = path.join(ROOT, 'tests', 'content.lock.json');
const LQIP_FILE = path.join(ROOT, 'src', 'data', 'lqip.json');

fs.mkdirSync(OG_DIR, { recursive: true });
fs.mkdirSync(PREVIEWS_DIR, { recursive: true });

const lock = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf-8'));
const lqips = {};

console.log(`Processing posters, LQIPs, and OG cards for ${lock.uniqueCount} videos...`);

for (const id of lock.uniqueIds) {
  const thumbPath = path.join(THUMBS_DIR, `${id}.webp`);
  if (!fs.existsSync(thumbPath)) {
    console.warn(`[WARN] Missing poster for ${id}`);
    continue;
  }

  const image = sharp(thumbPath);
  const metadata = await image.metadata();

  // 1. Generate ultra-low-resolution base64 LQIP (16px wide, blurred)
  const lqipBuffer = await image
    .clone()
    .resize(16, Math.round(16 * (metadata.height / metadata.width)), { fit: 'fill' })
    .webp({ quality: 20 })
    .toBuffer();
  lqips[id] = `data:image/webp;base64,${lqipBuffer.toString('base64')}`;

  // 2. Generate multi-resolution WebP posters: 480w, 960w, 1440w
  const widths = [480, 960, 1440];
  for (const w of widths) {
    const outWebp = path.join(THUMBS_DIR, `${id}-${w}.webp`);
    if (!fs.existsSync(outWebp)) {
      await image
        .clone()
        .resize(w, Math.round(w * (metadata.height / metadata.width)), { fit: 'inside' })
        .webp({ quality: 82 })
        .toFile(outWebp);
    }
  }

  // 3. Generate Social OG Image (1200x630 letterboxed or composited)
  const ogPath = path.join(OG_DIR, `${id}.jpg`);
  if (!fs.existsSync(ogPath)) {
    await image
      .clone()
      .resize(1200, 630, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85 })
      .toFile(ogPath);
  }
}

fs.writeFileSync(LQIP_FILE, JSON.stringify(lqips, null, 2), 'utf-8');
console.log(`[DONE] Wrote LQIPs to ${LQIP_FILE} and derived multi-size posters + OG images.`);
