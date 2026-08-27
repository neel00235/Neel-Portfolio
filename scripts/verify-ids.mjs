import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.dirname(__dirname);

console.log('=' .repeat(60));
console.log('VIMEO ID INTEGRITY VALIDATOR (B-2)');
console.log('=' .repeat(60));

// 1. Load authoritative IDs from content.lock.json and portfolio.generated.ts
const lockPath = path.join(ROOT, 'tests', 'content.lock.json');
if (!fs.existsSync(lockPath)) {
  console.error('[FAIL] tests/content.lock.json not found');
  process.exit(1);
}

const lock = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
const validIds = new Set(Object.keys(lock.titles));

console.log(`Loaded ${validIds.size} authoritative Vimeo IDs from data layer.`);

// 2. Scan src/ for any 10-digit literals matching 1[0-9]{9}
const srcDir = path.join(ROOT, 'src');
const ID_REGEX = /\b(1\d{9})\b/g;

let totalFound = 0;
const phantomIds = [];

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (/\.(tsx?|jsx?|json|css|mdx?)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      let match;
      while ((match = ID_REGEX.exec(content)) !== null) {
        const id = match[1];
        totalFound++;
        if (!validIds.has(id)) {
          const relPath = path.relative(ROOT, fullPath);
          phantomIds.push({ id, file: relPath });
        }
      }
    }
  }
}

scanDirectory(srcDir);

console.log(`Scanned src/: found ${totalFound} Vimeo ID references.`);

if (phantomIds.length > 0) {
  console.error(`\n[FAIL] Found ${phantomIds.length} phantom Vimeo ID(s) not in portfolio data:`);
  for (const p of phantomIds) {
    console.error(`  - ID "${p.id}" in ${p.file}`);
  }
  process.exit(1);
}

console.log(`[PASS] Zero phantom Vimeo IDs found in src/. All IDs verified against data layer.`);
console.log('=' .repeat(60));
process.exit(0);
