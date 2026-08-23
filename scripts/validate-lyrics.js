#!/usr/bin/env node
// Validates every data/lyrics/*.json file: valid JSON syntax plus the
// minimum shape renderLyrics() in assets/js/site.js relies on.
// Run: node scripts/validate-lyrics.js
// Used by .github/workflows/validate.yml to block PRs with broken lyric files.

const fs   = require('fs');
const path = require('path');

const LYRICS_DIR = path.join(__dirname, '../data/lyrics');
// label may legitimately be empty (continuation stanzas of one viruttam) — only
// fields renderLyrics() calls .replace() on are required, since a missing one
// throws and breaks the whole modal.
const REQUIRED_SECTION_FIELDS = ['ta', 'translit', 'en'];

const files = fs.readdirSync(LYRICS_DIR).filter(f => f.endsWith('.json')).sort();
const errors = [];

for (const file of files) {
  const filePath = path.join(LYRICS_DIR, file);
  const raw = fs.readFileSync(filePath, 'utf8');

  let song;
  try {
    song = JSON.parse(raw);
  } catch (e) {
    errors.push(`${file}: invalid JSON — ${e.message}`);
    continue;
  }

  if (!song.id) errors.push(`${file}: missing "id"`);
  if (!Array.isArray(song.sections) || song.sections.length === 0) {
    errors.push(`${file}: missing or empty "sections"`);
    continue;
  }

  song.sections.forEach((sec, i) => {
    if (typeof sec.label !== 'string') errors.push(`${file}: sections[${i}] missing "label" key`);
    REQUIRED_SECTION_FIELDS.forEach(field => {
      if (typeof sec[field] !== 'string' || !sec[field].trim()) {
        errors.push(`${file}: sections[${i}] missing "${field}"`);
      }
    });
  });
}

if (errors.length) {
  console.error(`${errors.length} problem(s) found in data/lyrics/:\n`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}

console.log(`${files.length} lyric files validated OK`);
