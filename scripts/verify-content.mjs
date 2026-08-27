import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.dirname(__dirname);

console.log('=' .repeat(60));
console.log('CONTENT PRESERVATION VERIFICATION GATE (PRIME DIRECTIVE I)');
console.log('=' .repeat(60));

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`[PASS] ${message}`);
  } else {
    failed++;
    console.error(`[FAIL] ${message}`);
  }
}

// 1. Read lock fixture
const lockPath = path.join(ROOT, 'tests', 'content.lock.json');
assert(fs.existsSync(lockPath), 'tests/content.lock.json exists');
const lock = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));

// 2. Read generated portfolio file
const portPath = path.join(ROOT, 'src', 'data', 'portfolio.generated.ts');
assert(fs.existsSync(portPath), 'src/data/portfolio.generated.ts exists');
const portCode = fs.readFileSync(portPath, 'utf-8');

// 3. Read content.ts
const contentPath = path.join(ROOT, 'src', 'data', 'content.ts');
assert(fs.existsSync(contentPath), 'src/data/content.ts exists');
const contentCode = fs.readFileSync(contentPath, 'utf-8');

// Check counts in lock
assert(lock.uniqueCount === 52, `Exactly 52 unique video IDs (got ${lock.uniqueCount})`);
assert(lock.placementCount === 53, `Exactly 53 placements (got ${lock.placementCount})`);
assert(lock.sectionCount === 16, `Exactly 16 sections (got ${lock.sectionCount})`);
assert(lock.skillCount === 15, `Exactly 15 skills (got ${lock.skillCount})`);
assert(lock.serviceCount === 6, `Exactly 6 services (got ${lock.serviceCount})`);

// Kicker distribution check
const kickerCounts = {};
for (const s of lock.sections) {
  // calculate uniques per kicker
  // let's compute directly from works in portfolio
}

// Check every video title is present in portfolio.generated.ts
let allTitlesFound = true;
for (const [id, title] of Object.entries(lock.titles)) {
  if (!portCode.includes(id) || !portCode.includes(title)) {
    allTitlesFound = false;
    console.error(`Missing title/id in portfolio.generated.ts: ${id} -> ${title}`);
  }
}
assert(allTitlesFound, 'All 52 video titles and IDs present verbatim');

// Check all 16 blurbs present in portfolio.generated.ts
let allBlurbsFound = true;
for (const s of lock.sections) {
  if (!portCode.includes(s.blurb)) {
    allBlurbsFound = false;
    console.error(`Missing blurb for section: ${s.slug}`);
  }
}
assert(allBlurbsFound, 'All 16 section blurbs present verbatim');

// Check all 15 skills present
let allSkillsFound = true;
for (const sk of lock.skills) {
  if (!portCode.includes(sk.name) || !portCode.includes(sk.desc)) {
    allSkillsFound = false;
    console.error(`Missing skill: ${sk.name}`);
  }
}
assert(allSkillsFound, 'All 15 skills names and descriptions present verbatim');

// Check all 6 services present
let allServicesFound = true;
for (const sv of lock.services) {
  if (!portCode.includes(sv.name) || !portCode.includes(sv.desc)) {
    allServicesFound = false;
    console.error(`Missing service: ${sv.name}`);
  }
}
assert(allServicesFound, 'All 6 services names and descriptions present verbatim');

// Zero DaVinci occurrences across entire src/ directory
function checkDaVinci(dir) {
  const files = fs.readdirSync(dir);
  let found = [];
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      found = found.concat(checkDaVinci(fullPath));
    } else if (/\.(ts|tsx|js|mjs|json|css|html)$/.test(file)) {
      const text = fs.readFileSync(fullPath, 'utf-8');
      if (/davinci/i.test(text)) {
        found.push(fullPath);
      }
    }
  }
  return found;
}

const davinciOccurrences = checkDaVinci(path.join(ROOT, 'src'));
assert(davinciOccurrences.length === 0, `Zero DaVinci occurrences in src/ (found: ${davinciOccurrences.length})`);

// Check key verbatim prose blocks
const verbatimChecks = [
  "turning raw footage into visuals that don't just get watched, they get felt",
  "Premiere Pro · After Effects · CapCut",
  "neelpatel00235@gmail.com",
  "+91 91067 30866",
  "@neelvt",
  "Let's cut ",
  "WATCHING",
  "Ahmedabad, India",
  "Open for work",
  "24 hours",
  "16:9 · 9:16 · 4:3 · 1:1"
];

let allVerbatim = true;
for (const phrase of verbatimChecks) {
  if (!contentCode.includes(phrase)) {
    allVerbatim = false;
    console.error(`Missing verbatim phrase: "${phrase}"`);
  }
}
assert(allVerbatim, 'All key verbatim prose blocks and endpoints present in content.ts');

// 10. Verify Vimeo ID integrity (B-2)
const idRegex = /\b(1\d{9})\b/g;
const validIds = new Set(Object.keys(lock.titles));
let phantomCount = 0;

function scanForPhantomIds(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanForPhantomIds(fullPath);
    } else if (/\.(tsx?|jsx?|json|css|mdx?)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      let match;
      while ((match = idRegex.exec(content)) !== null) {
        const id = match[1];
        if (!validIds.has(id)) {
          phantomCount++;
          console.error(`Phantom Vimeo ID ${id} in ${path.relative(ROOT, fullPath)}`);
        }
      }
    }
  }
}
scanForPhantomIds(path.join(ROOT, 'src'));
assert(phantomCount === 0, `Zero phantom Vimeo IDs in src/ (found ${phantomCount})`);

console.log('=' .repeat(60));
console.log(`GATE RESULT: ${passed} PASSED / ${failed} FAILED`);
console.log('=' .repeat(60));

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
